'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { T, type Lang } from '@/lib/constants';

export default function AdoptionSheet({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose: () => void;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
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
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();
      if (profile?.display_name) setFullName(profile.display_name);
    };
    init();
  }, []);

  const handleSubmit = async () => {
    if (!fullName || !phone || !address || !reason || !petName) {
      setError(lang === 'th' ? 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ' : 'Please fill in all required fields');
      return;
    }
    if (!userId) {
      setError(lang === 'th' ? 'กรุณาเข้าสู่ระบบก่อน' : 'Please sign in first');
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase.from('adoption_applications').insert({
      user_id: userId,
      report_id: null,
      pet_name: petName,
      pet_type_preference: petType,
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

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[1000] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl border-t border-gray-200 animate-slide-up"
      style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Handle */}
      <div className="sticky top-0 bg-white pt-3 pb-2 px-4 flex justify-center rounded-t-2xl z-10 border-b border-gray-50">
        <div className="h-1 w-10 rounded-full bg-gray-300 mb-2" />
      </div>

      {submitted ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">{T.adoptionSubmitted[lang]}</h2>
          <p className="text-gray-500 text-sm mb-6">
            {lang === 'th' ? 'เราจะติดต่อกลับหาคุณเร็วๆ นี้' : "We'll get back to you soon."}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
          >
            {T.close[lang]}
          </button>
        </div>
      ) : (
        <div className="px-4 pb-8 pt-2 space-y-5">
          {/* Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">🏠 {T.adoptionForm[lang]}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl p-1">✕</button>
          </div>

          {/* Instructions banner */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold text-green-800">
              {lang === 'th' ? '📋 ขั้นตอนหลังกรอกฟอร์ม' : '📋 After submitting this form'}
            </p>
            <p className="text-sm text-green-700">
              {lang === 'th'
                ? 'กรุณาแอดไลน์ '
                : 'Please add LINE '}
              <span className="font-bold text-green-900">@ToniInfiniteGroup</span>
              {lang === 'th'
                ? ' และส่งรูปภาพหรือวิดีโอทัวร์บ้านของคุณให้เราด้วย เพื่อประกอบการพิจารณา'
                : ' and send us a photo or video home tour for review.'}
            </p>
            <a
              href="https://line.me/ti/g2/ToniInfiniteGroup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-green-600 transition-colors"
            >
              <span>💬</span>
              <span>{lang === 'th' ? 'แอดไลน์ @ToniInfiniteGroup' : 'Add LINE @ToniInfiniteGroup'}</span>
            </a>
          </div>

          {/* Warning banner */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-1">
            <p className="text-sm font-semibold text-red-700">
              ⚠️ {lang === 'th' ? 'คำเตือนสำคัญ' : 'Important Warning'}
            </p>
            <p className="text-sm text-red-600">
              {lang === 'th'
                ? 'หากพบว่าให้ข้อมูลเท็จ ทารุณกรรมสัตว์ หรือไม่สามารถดูแลสัตว์ได้อย่างเหมาะสม อาจมีการดำเนินคดีตามกฎหมายคุ้มครองสัตว์'
                : 'If you are found to have provided false information, abused, or failed to properly care for the animal, you may be subject to legal action under animal protection laws.'}
            </p>
          </div>

          {/* Pet info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {lang === 'th' ? 'ข้อมูลสัตว์' : 'Pet Info'}
            </p>
            {/* Pet type */}
            <div className="flex gap-2">
              {(['dog', 'cat'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPetType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    petType === t
                      ? t === 'dog' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-purple-500 bg-purple-50 text-purple-600'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span>{t === 'dog' ? '🐕' : '🐱'}</span>
                  <span>{T[t][lang]}</span>
                </button>
              ))}
            </div>
            {/* Pet name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {lang === 'th' ? 'ชื่อสัตว์ *' : 'Pet Name *'}
              </label>
              <input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className={inputClass}
                placeholder={lang === 'th' ? 'ชื่อหรือลักษณะของสัตว์ที่ต้องการรับเลี้ยง' : 'Name or description of the pet you want to adopt'}
              />
            </div>
          </div>

          {/* Personal info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {lang === 'th' ? 'ข้อมูลส่วนตัว' : 'Personal Information'}
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.fullName[lang]} *</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder={lang === 'th' ? 'ชื่อ-นามสกุล' : 'Full name'} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.phone[lang]} *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className={inputClass} placeholder="0xx-xxx-xxxx" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.lineId[lang]} ({T.optional[lang]})</label>
              <input value={lineId} onChange={(e) => setLineId(e.target.value)} className={inputClass} placeholder="@lineid" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.address[lang]} *</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputClass} resize-none h-20`} placeholder={lang === 'th' ? 'ที่อยู่ปัจจุบัน' : 'Current address'} />
            </div>
          </div>

          {/* Living situation */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {lang === 'th' ? 'ที่พักอาศัย' : 'Living Situation'}
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.housingType[lang]}</label>
              <div className="flex gap-2">
                {(['house', 'condo', 'apartment'] as const).map((h) => (
                  <button key={h} onClick={() => setHousingType(h)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${housingType === h ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                    {h === 'house' ? `🏠 ${T.house[lang]}` : h === 'condo' ? `🏢 ${T.condo[lang]}` : `🏬 ${T.apartment[lang]}`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.housingOwnership[lang]}</label>
              <div className="flex gap-2">
                {(['own', 'rent'] as const).map((o) => (
                  <button key={o} onClick={() => setHousingOwnership(o)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${housingOwnership === o ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                    {o === 'own' ? T.own[lang] : T.rent[lang]}
                  </button>
                ))}
              </div>
            </div>
            <Toggle label={T.hasOutdoorSpace[lang]} value={hasOutdoorSpace} onChange={setHasOutdoorSpace} />
          </div>

          {/* Household */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {lang === 'th' ? 'ผู้อยู่อาศัย' : 'Household'}
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.numAdults[lang]}</label>
              <Counter value={numAdults} min={1} onChange={setNumAdults} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.numChildren[lang]}</label>
              <Counter value={numChildren} min={0} onChange={setNumChildren} />
            </div>
            <Toggle label={T.hasAllergies[lang]} value={hasAllergies} onChange={setHasAllergies} />
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {lang === 'th' ? 'ประสบการณ์' : 'Experience'}
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.currentPets[lang]} ({T.optional[lang]})</label>
              <input value={currentPets} onChange={(e) => setCurrentPets(e.target.value)} className={inputClass} placeholder={lang === 'th' ? 'เช่น สุนัข 1 ตัว' : 'e.g. 1 dog'} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.pastExperience[lang]} ({T.optional[lang]})</label>
              <textarea value={pastExperience} onChange={(e) => setPastExperience(e.target.value)} className={`${inputClass} resize-none h-16`} placeholder={lang === 'th' ? 'ประสบการณ์เลี้ยงสัตว์ที่ผ่านมา...' : 'Past experience with pets...'} />
            </div>
          </div>

          {/* Motivation */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {lang === 'th' ? 'แรงจูงใจ' : 'Motivation'}
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{T.reason[lang]} *</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputClass} resize-none h-24`} placeholder={lang === 'th' ? 'ทำไมคุณถึงอยากรับเลี้ยง...' : 'Why do you want to adopt...'} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? (lang === 'th' ? 'กำลังส่ง...' : 'Submitting...') : `🏠 ${T.applyToAdopt[lang]}`}
          </button>
        </div>
      )}
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white';

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center justify-between py-2 text-sm text-gray-700">
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
      <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 text-lg font-medium">−</button>
      <span className="text-lg font-semibold w-8 text-center">{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 text-lg font-medium">+</button>
    </div>
  );
}
