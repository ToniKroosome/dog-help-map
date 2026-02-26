'use client';

import { useState } from 'react';
import { ALL_STATUSES, DOG_STATUSES, T, type DogStatus, type Lang } from '@/lib/constants';
import { useReports } from '@/hooks/useReports';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function ReportForm({
  lang,
  pinPosition,
  onClose,
  onSubmitted,
}: {
  lang: Lang;
  pinPosition: { lat: number; lng: number } | null;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { createReport, uploadPhoto } = useReports();
  const { position: gpsPosition, locate, loading: gpsLoading } = useGeolocation();

  const [status, setStatus] = useState<DogStatus>('spotted');
  const [description, setDescription] = useState('');
  const [dogCount, setDogCount] = useState(1);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const position = pinPosition || gpsPosition;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!position) {
      setError(lang === 'th' ? 'กรุณาเลือกตำแหน่งบนแผนที่' : 'Please select a location on the map');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let photo_url: string | undefined;
      if (photo) {
        photo_url = await uploadPhoto(photo);
      }

      await createReport({
        latitude: position.lat,
        longitude: position.lng,
        status,
        description: description || undefined,
        photo_url,
        dog_count: dogCount,
      });

      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Form */}
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl panel-bg bg-white shadow-2xl">
        <div className="sticky top-0 bg-white px-4 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-800">
            🐕 {T.reportDog[lang]}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl p-1">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Location */}
          <div>
            {position ? (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-2">
                <span>📍</span>
                <span>{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{T.tapToPlace[lang]}</p>
                <button
                  onClick={locate}
                  disabled={gpsLoading}
                  className="w-full py-2 rounded-lg border border-blue-300 text-blue-500 text-sm hover:bg-blue-50"
                >
                  {gpsLoading ? '...' : `📍 ${T.useMyLocation[lang]}`}
                </button>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {T.status[lang]}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_STATUSES.map((s) => {
                const cfg = DOG_STATUSES[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                      status === s
                        ? 'ring-2 ring-offset-1 scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: cfg.bgColor,
                      color: cfg.color,
                    }}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label[lang]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dog count */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {T.dogCount[lang]}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDogCount(Math.max(1, dogCount - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
              >
                −
              </button>
              <span className="text-lg font-semibold w-8 text-center">{dogCount}</span>
              <button
                onClick={() => setDogCount(dogCount + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {T.description[lang]} <span className="text-gray-400 font-normal">({T.optional[lang]})</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder={lang === 'th' ? 'เช่น สุนัขนอนอยู่ริมถนน...' : 'e.g. Dog lying on the sidewalk...'}
            />
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {T.photo[lang]} <span className="text-gray-400 font-normal">({T.optional[lang]})</span>
            </label>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                <button
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <span className="text-sm text-gray-400">📷 {lang === 'th' ? 'เลือกรูปภาพ' : 'Choose photo'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg p-2">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !position}
            className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? T.submitting[lang] : `🐕 ${T.submit[lang]}`}
          </button>
        </div>
      </div>
    </div>
  );
}
