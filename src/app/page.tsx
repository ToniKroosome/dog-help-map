'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useReports } from '@/hooks/useReports';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import FilterBar from '@/components/layout/FilterBar';
import DogDetailPanel from '@/components/dog/DogDetailPanel';
import ReportForm from '@/components/dog/ReportForm';
import SearchBar from '@/components/map/SearchBar';
import ReportList from '@/components/map/ReportList';
import ZonePicker from '@/components/map/ZonePicker';
import { T, type Lang, type DogStatus } from '@/lib/constants';
import type { DogReport } from '@/lib/types';
import { BANGKOK_ZONES, distanceMeters, type Zone } from '@/lib/zones';
import { usePageView } from '@/hooks/usePageView';

const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-4xl mb-2">🐕</div>
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  usePageView();
  const { reports, fetchReports } = useReports();
  const { user } = useAuth();

  const [lang, setLang] = useState<Lang>('th');
  const [darkMode, setDarkMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<DogStatus>>(new Set());
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [pinPosition, setPinPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedReport, setSelectedReport] = useState<DogReport | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [movingReportId, setMovingReportId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Filter reports by zone
  const zoneFilteredReports = useMemo(() => {
    if (!selectedZone) return reports;
    return reports.filter((r) => {
      const d = distanceMeters(r.latitude, r.longitude, selectedZone.lat, selectedZone.lng);
      return d <= selectedZone.radius;
    });
  }, [reports, selectedZone]);

  // Count reports per zone (for ZonePicker badges)
  const zoneReportCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const z of BANGKOK_ZONES) {
      counts[z.id] = reports.filter((r) => {
        const d = distanceMeters(r.latitude, r.longitude, z.lat, z.lng);
        return d <= z.radius;
      }).length;
    }
    return counts;
  }, [reports]);

  const handleToggleLang = useCallback(() => {
    setLang((l) => (l === 'th' ? 'en' : 'th'));
  }, []);

  const handleToggleFilter = useCallback((status: DogStatus) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);

  const handlePinPlace = useCallback((pos: { lat: number; lng: number }) => {
    setPinPosition(pos);
    if (!showReportForm) setShowReportForm(true);
  }, [showReportForm]);

  const handleMarkerClick = useCallback((report: DogReport) => {
    setSelectedReport(report);
  }, []);

  const handleStartReport = useCallback(() => {
    if (!user) {
      alert(T.loginToReport[lang]);
      return;
    }
    setReportMode(true);
    setSelectedReport(null);
  }, [user, lang]);

  const handleCancelReport = useCallback(() => {
    setReportMode(false);
    setShowReportForm(false);
    setPinPosition(null);
  }, []);

  const handleReportSubmitted = useCallback(() => {
    setReportMode(false);
    setShowReportForm(false);
    setPinPosition(null);
    fetchReports();
  }, [fetchReports]);

  const handleMoveComplete = useCallback(async (reportId: string, lat: number, lng: number) => {
    const supabase = createClient();
    await supabase
      .from('dog_reports')
      .update({ latitude: lat, longitude: lng })
      .eq('id', reportId);
    setMovingReportId(null);
    fetchReports();
  }, [fetchReports]);

  const handleSelectZone = useCallback((zone: Zone | null) => {
    setSelectedZone(zone);
    if (zone) {
      setFlyTo({ lat: zone.lat, lng: zone.lng });
    }
  }, []);

  return (
    <div className={`h-screen w-screen relative overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <Header lang={lang} onToggleLang={handleToggleLang} darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />

      <SearchBar
        lang={lang}
        onSelect={(lat, lng) => setFlyTo({ lat, lng })}
      />

      <ZonePicker
        lang={lang}
        selectedZone={selectedZone}
        onSelect={handleSelectZone}
        reportCounts={zoneReportCounts}
      />

      {!selectedReport && !showReportForm && (
        <ReportList
          lang={lang}
          reports={zoneFilteredReports}
          selectedZone={selectedZone}
          onSelect={(report) => {
            setFlyTo({ lat: report.latitude, lng: report.longitude });
            setSelectedReport(report);
          }}
        />
      )}

      <MapContainer
        reports={zoneFilteredReports}
        activeFilters={activeFilters}
        showHeatmap={showHeatmap}
        reportMode={reportMode}
        pinPosition={pinPosition}
        flyTo={flyTo}
        onPinPlace={handlePinPlace}
        onMarkerClick={handleMarkerClick}
        movingReportId={movingReportId}
        onMoveComplete={handleMoveComplete}
        hideControls={!!selectedReport || showReportForm}
      />

      {/* Report FAB button */}
      {!reportMode && !showReportForm && !selectedReport && (
        <button
          onClick={handleStartReport}
          className="fixed bottom-[72px] sm:bottom-24 left-1/2 -translate-x-1/2 z-[800] flex items-center gap-1.5 sm:gap-2 rounded-full bg-blue-500 px-4 py-2.5 sm:px-5 sm:py-3 text-white font-semibold shadow-xl hover:bg-blue-600 transition-all active:scale-95 text-sm sm:text-base"
        >
          <span className="text-base sm:text-lg">🐕</span>
          <span>{T.reportDog[lang]}</span>
        </button>
      )}

      {/* Report mode banner */}
      {reportMode && !showReportForm && (
        <div className="fixed top-[52px] sm:top-16 left-1/2 -translate-x-1/2 z-[950] bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 animate-slide-up max-w-[90vw]">
          <span>📍</span>
          <span>{T.tapToPlace[lang]}</span>
          <button
            onClick={handleCancelReport}
            className="ml-1 sm:ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs hover:bg-white/30"
          >
            {T.cancel[lang]}
          </button>
        </div>
      )}

      {showReportForm && (
        <ReportForm
          lang={lang}
          pinPosition={pinPosition}
          onClose={handleCancelReport}
          onSubmitted={handleReportSubmitted}
        />
      )}

      {selectedReport && (
        <DogDetailPanel
          report={selectedReport}
          lang={lang}
          onClose={() => setSelectedReport(null)}
          onStatusUpdated={fetchReports}
          onDeleted={() => {
            setSelectedReport(null);
            fetchReports();
          }}
          onMovePin={(reportId) => setMovingReportId(reportId)}
        />
      )}

      {/* Moving pin banner */}
      {movingReportId && (
        <div className="fixed top-[52px] sm:top-16 left-1/2 -translate-x-1/2 z-[950] bg-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 animate-slide-up max-w-[90vw]">
          <span>📌</span>
          <span>{lang === 'th' ? 'ลากหมุดไปตำแหน่งใหม่' : 'Drag pin to new position'}</span>
          <button
            onClick={() => setMovingReportId(null)}
            className="ml-1 sm:ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs hover:bg-white/30"
          >
            {T.cancel[lang]}
          </button>
        </div>
      )}

      {!showReportForm && !selectedReport && (
        <FilterBar
          lang={lang}
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
          showHeatmap={showHeatmap}
          onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        />
      )}
    </div>
  );
}
