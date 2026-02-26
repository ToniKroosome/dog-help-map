'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { DOG_STATUSES, BANGKOK_CENTER, DEFAULT_ZOOM, type DogStatus } from '@/lib/constants';
import type { DogReport } from '@/lib/types';

const MAP_STYLES = [
  { name: 'Voyager', icon: '🗺️', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attr: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd' },
  { name: 'Detailed', icon: '🏢', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '&copy; OpenStreetMap', subdomains: 'abc' },
  { name: 'Satellite', icon: '🛰️', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '&copy; Esri', subdomains: '' },
  { name: 'Dark', icon: '🌙', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd' },
];

function createDogIcon(status: DogStatus): L.DivIcon {
  const config = DOG_STATUSES[status];
  return L.divIcon({
    className: 'dog-marker',
    html: `
      <div style="
        width: 36px; height: 36px;
        border-radius: 50%;
        background: ${config.color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
        cursor: pointer;
      ">${config.icon}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

interface MapContainerProps {
  reports: DogReport[];
  activeFilters: Set<DogStatus>;
  showHeatmap: boolean;
  reportMode: boolean;
  pinPosition: { lat: number; lng: number } | null;
  flyTo: { lat: number; lng: number } | null;
  onPinPlace: (pos: { lat: number; lng: number }) => void;
  onMarkerClick: (report: DogReport) => void;
  movingReportId: string | null;
  onMoveComplete: (reportId: string, lat: number, lng: number) => void;
}

export default function MapContainer({
  reports,
  activeFilters,
  showHeatmap,
  reportMode,
  pinPosition,
  flyTo,
  onPinPlace,
  onMarkerClick,
  movingReportId,
  onMoveComplete,
}: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [styleIndex, setStyleIndex] = useState(0);
  const [showStylePicker, setShowStylePicker] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [BANGKOK_CENTER.lat, BANGKOK_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    const style = MAP_STYLES[0];
    tileLayerRef.current = L.tileLayer(style.url, {
      attribution: style.attr,
      maxZoom: 20,
      subdomains: style.subdomains || undefined,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch map style
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileLayerRef.current) return;
    const style = MAP_STYLES[styleIndex];
    map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(style.url, {
      attribution: style.attr,
      maxZoom: 20,
      subdomains: style.subdomains || undefined,
    }).addTo(map);
  }, [styleIndex]);

  // Fly to location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.flyTo([flyTo.lat, flyTo.lng], 16, { duration: 1.5 });
  }, [flyTo]);

  // Handle report mode click
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (reportMode) {
      map.getContainer().style.cursor = 'crosshair';
      const handler = (e: L.LeafletMouseEvent) => {
        onPinPlace({ lat: e.latlng.lat, lng: e.latlng.lng });
      };
      map.on('click', handler);
      return () => {
        map.off('click', handler);
        map.getContainer().style.cursor = '';
      };
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [reportMode, onPinPlace]);

  // Update pin marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }

    if (pinPosition) {
      const icon = L.divIcon({
        className: 'pin-marker',
        html: `
          <div style="
            width: 44px; height: 44px;
            border-radius: 50%;
            background: #3b82f6;
            border: 4px solid white;
            box-shadow: 0 3px 12px rgba(59,130,246,0.5);
            display: flex; align-items: center; justify-content: center;
            font-size: 22px;
            animation: pulse 1.5s infinite;
          ">🐕</div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      pinMarkerRef.current = L.marker([pinPosition.lat, pinPosition.lng], {
        icon,
        draggable: true,
      }).addTo(map);

      pinMarkerRef.current.on('dragend', () => {
        const pos = pinMarkerRef.current!.getLatLng();
        onPinPlace({ lat: pos.lat, lng: pos.lng });
      });
    }
  }, [pinPosition, onPinPlace]);

  // Filtered reports
  const filteredReports = activeFilters.size === 0
    ? reports
    : reports.filter((r) => activeFilters.has(r.status));

  // Update markers
  const updateMarkers = useCallback(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    if (showHeatmap) return; // Don't show markers in heatmap mode

    filteredReports.forEach((report) => {
      const isMoving = movingReportId === report.id;
      const icon = isMoving
        ? L.divIcon({
            className: 'dog-marker',
            html: `
              <div style="
                width: 44px; height: 44px;
                border-radius: 50%;
                background: ${DOG_STATUSES[report.status].color};
                border: 4px solid #3b82f6;
                box-shadow: 0 3px 12px rgba(59,130,246,0.5);
                display: flex; align-items: center; justify-content: center;
                font-size: 20px;
                cursor: grab;
                animation: pulse 1.5s infinite;
              ">${DOG_STATUSES[report.status].icon}</div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          })
        : createDogIcon(report.status);
      const marker = L.marker([report.latitude, report.longitude], {
        icon,
        draggable: isMoving,
      });
      if (isMoving) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onMoveComplete(report.id, pos.lat, pos.lng);
        });
      } else {
        marker.on('click', () => onMarkerClick(report));
      }
      markersRef.current!.addLayer(marker);
    });
  }, [filteredReports, showHeatmap, onMarkerClick, movingReportId, onMoveComplete]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Heatmap layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (showHeatmap && filteredReports.length > 0) {
      import('leaflet.heat').then(() => {
        const points: [number, number, number][] = filteredReports.map((r) => [
          r.latitude,
          r.longitude,
          0.5,
        ]);
        // @ts-expect-error leaflet.heat augments L
        heatLayerRef.current = L.heatLayer(points, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.2: '#2196F3',
            0.4: '#4CAF50',
            0.6: '#FFEB3B',
            0.8: '#FF9800',
            1.0: '#F44336',
          },
        }).addTo(map);
      });
    }
  }, [showHeatmap, filteredReports]);

  // Locate me
  const locateMe = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    map.locate({ setView: true, maxZoom: 16 });
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Map style picker */}
      <div className="absolute bottom-40 right-3 z-[500]">
        <button
          onClick={() => setShowStylePicker(!showStylePicker)}
          className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors"
          title="Map style"
        >
          {MAP_STYLES[styleIndex].icon}
        </button>
        {showStylePicker && (
          <div className="absolute bottom-12 right-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-1">
            {MAP_STYLES.map((s, i) => (
              <button
                key={s.name}
                onClick={() => { setStyleIndex(i); setShowStylePicker(false); }}
                className={`flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-gray-50 transition-colors ${
                  i === styleIndex ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Locate me button */}
      <button
        onClick={locateMe}
        className="absolute bottom-28 right-3 z-[500] w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors"
        title="Locate me"
      >
        📍
      </button>
    </div>
  );
}
