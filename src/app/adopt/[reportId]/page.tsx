'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DOG_STATUSES, T, type Lang } from '@/lib/constants';
import type { DogReport } from '@/lib/types';

export default function AdoptPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('th');
  const [report, setReport] = useState<DogReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [address, setAddress] = useState('');
  const [housingType, setHousingType] = useState<'house' | 'condo' | 'apartment'>('house');
  const [housingOwnership, setHousingOwnership] = useState<'own' | 'rent'>('own');
  const [hasOutdoorSpace, setHasOutdoorSpace] = useState(false);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [currentPets, setCurrentPets] = useState('');
  const [pastExperience, setPastExperience] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }
      setUserId(user.id);

      // Pre-fill name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();
      if (profile?.display_name) setFullName(profile.display_name);

      const { data } = await supabase
        .from('dog_reports')
        .select('*')
        .eq('id', reportId)
        .single();
      setReport(data as DogReport);
      setLoading(false);
    };
    init();
  }, [reportId, router]);

  const handleSubmit = async () => {
    if (!fullName || !phone || !address || !reason) {
      setError(lang === 'th' ? 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ' : 'Please fill in all required fields');
      return;
    }
    if (!userId) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase.from('adoption_applications').insert({
      report_id: reportId,
      user_id: userId,
      full_name: fullName,
      phone,
      line_id: lineId || null,
      address,
      housing_type: housingType,
      housing_ownership: housingOwnership,
      has_outdoor_space: hasOutdoorSpace,
      num_adults: numAdults,
      num_children: numChildren,
      has_allergies: hasAllergies,
      current_pets: currentPets || null,
      past_experience: pastExperience || null,
      reason,
    });

    if (err) {
      setError(err.message);
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-2">🐾</div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const petEmoji = report?.pet_type === 'cat' ? '🐱' : '🐕';
  const statusConfig = report ? DOG_STATUSES[report.status] : null;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{T.adoptionSubmitted[lang]}</h2>
          <p className="text-gray-500 text-sm mb-6">
            {lang === 'th'
              ? 'เราจะติดต่อกลับหาคุณเร็วๆ นี้'
              : "We'll get back to you soon."}
          </p>
          <a
            href="/"
            className="inline-block w-full py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
          >
            {T.backToMap[lang]}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <span>{petEmoji}</span>
              <span>{T.adoptionForm[lang]}</span>
            </h1>
          </div>
          <button
            onClick={() => setLang((l) => (l === 'th' ? 'en' : 'th'))}
            className="rounded-lg px-2.5 py-1 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all"
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-5 pb-16">
        {/* Pet card */}
        {report && statusConfig && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            {report.photo_url ? (
              <img src={report.photo_url} alt="Pet" className="w-16 h-16 rounded-xl object-contain bg-gray-100 shrink-0" />
            ) : (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: statusConfig.bgColor }}
              >
                {petEmoji}
              </div>
            )}
            <div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium mb-1"
                style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
              >
                {statusConfig.icon} {statusConfig.label[lang]}
              </span>
              <p className="text-xs text-gray-500 line-clamp-2">
                {report.description || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
              </p>
            </div>
          </div>
        )}

        {/* Section: Personal Info */}
        <Section title={lang === 'th' ? 'ข้อมูลส่วนตัว' : 'Personal Information'}>
          <Field label={`${T.fullName[lang]} *`}>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              placeholder={lang === 'th' ? 'ชื่อ-นามสกุล' : 'Full name'}
            />
          </Field>
          <Field label={`${T.phone[lang]} *`}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className={inputClass}
              placeholder="0xx-xxx-xxxx"
            />
          </Field>
          <Field label={`${T.lineId[lang]} (${T.optional[lang]})`}>
            <input
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              className={inputClass}
              placeholder="@lineid"
            />
          </Field>
          <Field label={`${T.address[lang]} *`}>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${inputClass} resize-none h-20`}
              placeholder={lang === 'th' ? 'บ้านเลขที่ ถนน แขวง เขต กรุงเทพฯ' : 'Street address, district, city'}
            />
          </Field>
        </Section>

        {/* Section: Living Situation */}
        <Section title={lang === 'th' ? 'ที่พักอาศัย' : 'Living Situation'}>
          <Field label={T.housingType[lang]}>
            <div className="flex gap-2">
              {(['house', 'condo', 'apartment'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setHousingType(h)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                    housingType === h ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {h === 'house' ? `🏠 ${T.house[lang]}` : h === 'condo' ? `🏢 ${T.condo[lang]}` : `🏬 ${T.apartment[lang]}`}
                </button>
              ))}
            </div>
          </Field>
          <Field label={T.housingOwnership[lang]}>
            <div className="flex gap-2">
              {(['own', 'rent'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setHousingOwnership(o)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                    housingOwnership === o ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {o === 'own' ? T.own[lang] : T.rent[lang]}
                </button>
              ))}
            </div>
          </Field>
          <Toggle
            label={T.hasOutdoorSpace[lang]}
            value={hasOutdoorSpace}
            onChange={setHasOutdoorSpace}
          />
        </Section>

        {/* Section: Household */}
        <Section title={lang === 'th' ? 'ผู้อยู่อาศัย' : 'Household'}>
          <Field label={T.numAdults[lang]}>
            <Counter value={numAdults} min={1} onChange={setNumAdults} />
          </Field>
          <Field label={T.numChildren[lang]}>
            <Counter value={numChildren} min={0} onChange={setNumChildren} />
          </Field>
          <Toggle
            label={T.hasAllergies[lang]}
            value={hasAllergies}
            onChange={setHasAllergies}
          />
        </Section>

        {/* Section: Experience */}
        <Section title={lang === 'th' ? 'ประสบการณ์เลี้ยงสัตว์' : 'Pet Experience'}>
          <Field label={`${T.currentPets[lang]} (${T.optional[lang]})`}>
            <input
              value={currentPets}
              onChange={(e) => setCurrentPets(e.target.value)}
              className={inputClass}
              placeholder={lang === 'th' ? 'เช่น สุนัข 1 ตัว, แมว 2 ตัว' : 'e.g. 1 dog, 2 cats'}
            />
          </Field>
          <Field label={`${T.pastExperience[lang]} (${T.optional[lang]})`}>
            <textarea
              value={pastExperience}
              onChange={(e) => setPastExperience(e.target.value)}
              className={`${inputClass} resize-none h-20`}
              placeholder={lang === 'th' ? 'เล่าประสบการณ์การเลี้ยงสัตว์ที่ผ่านมา...' : 'Describe your past experience with pets...'}
            />
          </Field>
        </Section>

        {/* Section: Motivation */}
        <Section title={lang === 'th' ? 'แรงจูงใจ' : 'Motivation'}>
          <Field label={`${T.reason[lang]} *`}>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`${inputClass} resize-none h-28`}
              placeholder={lang === 'th' ? 'บอกเล่าให้เราฟังว่าทำไมคุณถึงอยากรับเลี้ยง...' : 'Tell us why you want to adopt this pet...'}
            />
          </Field>
        </Section>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {submitting
            ? (lang === 'th' ? 'กำลังส่ง...' : 'Submitting...')
            : `🏠 ${T.applyToAdopt[lang]}`}
        </button>
      </main>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between py-2 text-sm text-gray-700"
    >
      <span>{label}</span>
      <div className={`w-10 h-6 rounded-full transition-colors relative ${value ? 'bg-blue-500' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-5' : 'left-1'}`} />
      </div>
    </button>
  );
}

function Counter({ value, min, onChange }: { value: number; min: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 text-lg font-medium"
      >
        −
      </button>
      <span className="text-lg font-semibold w-8 text-center">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 text-lg font-medium"
      >
        +
      </button>
    </div>
  );
}
