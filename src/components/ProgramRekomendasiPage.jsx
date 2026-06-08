import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Dumbbell, Clock, Sun, Sunset, Moon, Zap, Info, CheckCircle2 } from 'lucide-react';

// ── Konstanta ─────────────────────────────────────────────────────────────────

const TINGKAT_META = {
  sedentary:    { label: 'Sangat Ringan', hari: 2, icon: '🪑', desc: 'Banyak duduk, sedikit/tanpa olahraga' },
  ringan:       { label: 'Ringan',        hari: 3, icon: '🚶', desc: 'Olahraga ringan 1–3 hari/minggu' },
  sedang:       { label: 'Sedang',        hari: 4, icon: '🏃', desc: 'Olahraga sedang 3–5 hari/minggu' },
  aktif:        { label: 'Aktif',         hari: 5, icon: '💪', desc: 'Olahraga berat 6–7 hari/minggu' },
  sangat_aktif: { label: 'Sangat Aktif',  hari: 6, icon: '🔥', desc: 'Latihan fisik berat setiap hari' },
};

const FOKUS_OTOT = [
  { id: 'dada',     label: 'Dada',     icon: '/images/dada.png',     color: '#FF8C33', bg: 'rgba(255,107,0,0.12)' },
  { id: 'punggung', label: 'Punggung', icon: '/images/punggung.png', color: '#60A5FA', bg: 'rgba(59,130,246,0.12)' },
  { id: 'kaki',     label: 'Kaki',     icon: '/images/kaki.png',     color: '#4ADE80', bg: 'rgba(34,197,94,0.12)' },
  { id: 'bahu',     label: 'Bahu',     icon: '/images/bahu.png',     color: '#C084FC', bg: 'rgba(168,85,247,0.12)' },
  { id: 'lengan',   label: 'Lengan',   icon: '/images/lengan.png',   color: '#FCD34D', bg: 'rgba(245,158,11,0.12)' },
  { id: 'perut',    label: 'Perut',    icon: '/images/perut.png',    color: '#F87171', bg: 'rgba(239,68,68,0.12)' },
];

const WAKTU_LATIHAN = [
  { id: 'pagi',   label: 'Pagi',   jam: '05.30 – 08.00', sub: 'Metabolisme terbaik, energi segar', IconEl: Sun },
  { id: 'siang',  label: 'Siang',  jam: '11.00 – 13.00', sub: 'Saat istirahat makan siang',        IconEl: Sun },
  { id: 'sore',   label: 'Sore',   jam: '15.00 – 18.00', sub: 'Kekuatan otot di puncaknya',        IconEl: Sunset },
  { id: 'malam',  label: 'Malam',  jam: '18.00 – 21.00', sub: 'Setelah jam kerja, santai',         IconEl: Moon },
];

// ── Database Latihan per Otot ─────────────────────────────────────────────────

const EXERCISE_DB = {
  dada: {
    compound: ['Bench Press', 'Incline Bench Press', 'Dips', 'Push-Up'],
    isolation: ['Dumbbell Flyes', 'Cable Crossover', 'Pec Deck', 'Incline DB Flyes'],
  },
  punggung: {
    compound: ['Deadlift', 'Barbell Row', 'Pull-Up / Chin-Up', 'T-Bar Row'],
    isolation: ['Lat Pulldown', 'Cable Row', 'Face Pull', 'Single Arm DB Row'],
  },
  kaki: {
    compound: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Bulgarian Split Squat'],
    isolation: ['Leg Extension', 'Leg Curl', 'Calf Raise', 'Hip Thrust'],
  },
  bahu: {
    compound: ['Overhead Press (OHP)', 'Arnold Press', 'Push Press'],
    isolation: ['Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Cable Lateral'],
  },
  lengan: {
    compound: ['Close-Grip Bench Press', 'Barbell Curl'],
    isolation: ['Dumbbell Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skull Crusher', 'Overhead Tricep Ext'],
  },
  perut: {
    compound: ['Plank', 'Hanging Leg Raise', 'Ab Wheel'],
    isolation: ['Crunches', 'Cable Crunch', 'Russian Twist', 'Side Plank', 'Mountain Climber'],
  },
};

// Otot pendukung / superset yang baik dipasangkan
const PAIRING_SUGGEST = {
  dada: ['bahu', 'lengan'],
  punggung: ['lengan', 'bahu'],
  kaki: ['perut'],
  bahu: ['lengan', 'dada'],
  lengan: ['dada', 'punggung'],
  perut: ['kaki'],
};

// ── Generator Jadwal ──────────────────────────────────────────────────────────

function buildExerciseList(otot, isCompoundDay) {
  const db = EXERCISE_DB[otot];
  if (!db) return [];
  if (isCompoundDay) return [db.compound[0], db.compound[1] || db.isolation[0]];
  return [db.isolation[0], db.isolation[1] || db.compound[0]];
}

function generateJadwal(tingkat, fokus, waktu) {
  const meta = TINGKAT_META[tingkat];
  const hariCount = meta.hari;

  const HARI_URUT = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];
  const jamLabel = WAKTU_LATIHAN.find(w => w.id === waktu)?.jam || '06.00–08.00';

  // Tentukan hari latihan berdasarkan frekuensi
  let hariLatihan = [];

  if (hariCount === 2) {
    hariLatihan = [0, 3]; // Senin, Kamis
  } else if (hariCount === 3) {
    hariLatihan = [0, 2, 4]; // Senin, Rabu, Jumat
  } else if (hariCount === 4) {
    hariLatihan = [0, 1, 3, 4]; // Senin, Selasa, Kamis, Jumat (Upper-Lower)
  } else if (hariCount === 5) {
    hariLatihan = [0, 1, 2, 3, 4]; // Senin–Jumat
  } else {
    hariLatihan = [0, 1, 2, 3, 4, 5]; // Senin–Sabtu
  }

  // Bagi fokus otot ke hari-hari latihan
  const jadwal = HARI_URUT.map((hari, idx) => {
    const isLatihan = hariLatihan.includes(idx);
    if (!isLatihan) {
      return {
        hari,
        aktif: false,
        waktu: null,
        label: 'Istirahat',
        detail: 'Pemulihan, jalan ringan, atau stretching',
        otot: [],
        latihan: [],
      };
    }

    // Distribusi fokus ke hari latihan
    const latihanIdx = hariLatihan.indexOf(idx);
    const isCompoundDay = latihanIdx % 2 === 0;

    let ototHariIni = [];
    let latihanList = [];
    let label = '';

    if (hariCount === 2 || hariCount === 3) {
      // Full Body: semua fokus tiap hari
      ototHariIni = [...fokus];
      label = `Full Body ${isCompoundDay ? 'A' : 'B'}`;
      latihanList = fokus.flatMap(o => buildExerciseList(o, isCompoundDay)).slice(0, 5);
    } else if (hariCount === 4) {
      // Upper/Lower split
      const upperOtot = fokus.filter(o => ['dada', 'punggung', 'bahu', 'lengan'].includes(o));
      const lowerOtot = fokus.filter(o => ['kaki', 'perut'].includes(o));

      const isUpperDay = latihanIdx === 0 || latihanIdx === 2;
      ototHariIni = isUpperDay
        ? (upperOtot.length > 0 ? upperOtot : ['dada', 'punggung'])
        : (lowerOtot.length > 0 ? lowerOtot : ['kaki', 'perut']);
      label = isUpperDay ? `Upper ${latihanIdx === 0 ? 'A' : 'B'}` : `Lower ${latihanIdx === 1 ? 'A' : 'B'}`;
      latihanList = ototHariIni.flatMap(o => buildExerciseList(o, isCompoundDay)).slice(0, 5);
    } else {
      // PPL / 5-6 hari
      const grupPPL = [
        { label: 'Push', otot: fokus.filter(o => ['dada', 'bahu', 'lengan'].includes(o)) },
        { label: 'Pull', otot: fokus.filter(o => ['punggung', 'lengan'].includes(o)) },
        { label: 'Legs', otot: fokus.filter(o => ['kaki', 'perut'].includes(o)) },
      ];

      // Pastikan semua grup punya setidaknya 1 otot default
      if (grupPPL[0].otot.length === 0) grupPPL[0].otot = ['dada'];
      if (grupPPL[1].otot.length === 0) grupPPL[1].otot = ['punggung'];
      if (grupPPL[2].otot.length === 0) grupPPL[2].otot = ['kaki'];

      const grupIdx = latihanIdx % 3;
      const grup = grupPPL[grupIdx];
      ototHariIni = [...new Set(grup.otot)];
      label = `${grup.label} ${latihanIdx < 3 ? 'A' : 'B'}`;
      latihanList = ototHariIni.flatMap(o => buildExerciseList(o, isCompoundDay)).slice(0, 5);
    }

    return {
      hari,
      aktif: true,
      waktu: jamLabel,
      label,
      detail: latihanList.join(' · '),
      otot: ototHariIni,
      latihan: latihanList,
    };
  });

  return jadwal;
}

// ── Warna chip otot ───────────────────────────────────────────────────────────

const MUSCLE_COLORS = {
  dada:     { bg: 'rgba(255,107,0,0.15)',  color: '#FF8C33',  label: 'DADA' },
  punggung: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA',  label: 'PUNGGUNG' },
  kaki:     { bg: 'rgba(34,197,94,0.15)',  color: '#4ADE80',  label: 'KAKI' },
  bahu:     { bg: 'rgba(168,85,247,0.15)', color: '#C084FC',  label: 'BAHU' },
  lengan:   { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D',  label: 'LENGAN' },
  perut:    { bg: 'rgba(239,68,68,0.15)',  color: '#F87171',  label: 'PERUT' },
};

function MuscleChip({ id }) {
  const m = MUSCLE_COLORS[id];
  if (!m) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 99,
      background: m.bg, color: m.color,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
    }}>
      {m.label}
    </span>
  );
}

// ── Komponen Baris Jadwal ─────────────────────────────────────────────────────

function JadwalRow({ item }) {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '12px 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        width: 52, flexShrink: 0, paddingTop: 2,
        fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
        color: item.aktif ? 'var(--color-primary)' : 'var(--color-text-muted)',
      }}>
        {item.hari}
      </div>

      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
        background: item.aktif ? 'var(--color-primary)' : 'var(--color-surface-3)',
        border: `2px solid ${item.aktif ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 13, fontWeight: item.aktif ? 700 : 500,
            color: item.aktif ? 'var(--color-text)' : 'var(--color-text-muted)',
          }}>
            {item.label}
          </span>
          {item.aktif && item.waktu && (
            <span style={{
              fontSize: 10, color: 'var(--color-primary)', fontWeight: 600,
              background: 'var(--color-primary-pale)', padding: '1px 7px', borderRadius: 99,
            }}>
              {item.waktu}
            </span>
          )}
        </div>

        <div style={{
          fontSize: 11.5, color: 'var(--color-text-muted)', marginBottom: item.otot.length ? 6 : 0,
          lineHeight: 1.55,
        }}>
          {item.detail}
        </div>

        {item.otot.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {item.otot.map(o => <MuscleChip key={o} id={o} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function ProgramRekomendasiPage({ tingkat, onBack }) {
  const meta = TINGKAT_META[tingkat] || TINGKAT_META['sedang'];

  const [step, setStep] = useState(1); // 1 = fokus, 2 = waktu, 3 = hasil
  const [fokus, setFokus] = useState([]);
  const [waktu, setWaktu] = useState('');

  const toggleFokus = (id) => {
    setFokus(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const jadwal = useMemo(() => {
    if (step !== 3 || fokus.length === 0 || !waktu) return [];
    return generateJadwal(tingkat, fokus, waktu);
  }, [step, tingkat, fokus, waktu]);

  const hariAktif = jadwal.filter(j => j.aktif).length;

  const PROGRAM_NAME = {
    sedentary: 'Full Body 2x/Minggu',
    ringan: 'Full Body 3x/Minggu',
    sedang: 'Upper-Lower Split',
    aktif: 'Push Pull Legs (PPL)',
    sangat_aktif: 'Strength + Recovery',
  }[tingkat] || 'Program Latihan';

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--color-bg)',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '14px 20px',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
            borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} color="var(--color-text)" />
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
            Rekomendasi Program
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {meta.icon} {meta.label} · {meta.hari} hari/minggu
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {step < 3 && (
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 99,
                background: step >= s ? 'var(--color-primary)' : 'var(--color-surface-3)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Langkah {step} dari 2
          </div>
        </div>
      )}

      <div style={{
        flex: 1, padding: '20px 20px',
        paddingBottom: 100,
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        <AnimatePresence mode="wait">

          {/* STEP 1 — Pilih Fokus Otot */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
                  Fokus Latihan
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.6 }}>
                  Pilih bagian tubuh yang ingin kamu prioritaskan. Bisa lebih dari satu.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {FOKUS_OTOT.map(otot => {
                  const dipilih = fokus.includes(otot.id);
                  return (
                    <button
                      key={otot.id}
                      onClick={() => toggleFokus(otot.id)}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 'var(--radius-xl)',
                        border: `2px solid ${dipilih ? otot.color : 'var(--color-border)'}`,
                        background: dipilih ? otot.bg : 'var(--color-surface)',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        transition: 'all 0.18s',
                        position: 'relative',
                      }}
                    >
                      {dipilih && (
                        <div style={{
                          position: 'absolute', top: 8, right: 8,
                          width: 18, height: 18, borderRadius: '50%',
                          background: otot.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <CheckCircle2 size={12} color="white" />
                        </div>
                      )}
                      <img
                        src={otot.icon} alt={otot.label}
                        style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}
                      />
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: dipilih ? otot.color : 'var(--color-text-sub)',
                      }}>
                        {otot.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                {fokus.length === 0 ? 'Belum ada yang dipilih' : `${fokus.length} dipilih`}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={fokus.length === 0}
                className="btn btn--primary btn--full btn--lg"
                style={{ marginTop: 12, opacity: fokus.length === 0 ? 0.4 : 1 }}
              >
                Lanjut
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Pilih Waktu Latihan */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
                  Waktu Latihan
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.6 }}>
                  Pilih waktu yang paling cocok dengan rutinitas harianmu.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {WAKTU_LATIHAN.map(w => {
                  const dipilih = waktu === w.id;
                  const IconEl = w.IconEl;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setWaktu(w.id)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-xl)',
                        border: `2px solid ${dipilih ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: dipilih ? 'var(--color-primary-pale)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 14,
                        transition: 'all 0.18s', textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: dipilih ? 'var(--color-primary)' : 'var(--color-surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.18s',
                      }}>
                        <IconEl size={20} color={dipilih ? 'white' : 'var(--color-text-muted)'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 15, fontWeight: 700,
                          color: dipilih ? 'var(--color-primary)' : 'var(--color-text)',
                          marginBottom: 3,
                        }}>
                          {w.label}
                          <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                            {w.jam}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{w.sub}</div>
                      </div>
                      {dipilih && <CheckCircle2 size={18} color="var(--color-primary)" />}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button
                  onClick={() => setStep(1)}
                  className="btn btn--secondary"
                  style={{ flex: 1 }}
                >
                  Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!waktu}
                  className="btn btn--primary"
                  style={{ flex: 2, opacity: !waktu ? 0.4 : 1 }}
                >
                  Lihat Program
                  <Zap size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Hasil Jadwal */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Summary Card */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, rgba(255,107,0,0.15) 0%, rgba(255,107,0,0.05) 100%)',
                border: '1px solid rgba(255,107,0,0.3)',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>
                  PROGRAM UNTUKMU
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 8 }}>
                  {PROGRAM_NAME}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    background: 'var(--color-primary)', color: 'white',
                    padding: '3px 10px', borderRadius: 99,
                  }}>
                    {hariAktif} hari/minggu
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    background: 'var(--color-surface-2)', color: 'var(--color-text-sub)',
                    padding: '3px 10px', borderRadius: 99,
                  }}>
                    {WAKTU_LATIHAN.find(w => w.id === waktu)?.jam}
                  </span>
                  {fokus.map(f => (
                    <span key={f} style={{
                      fontSize: 11, fontWeight: 600,
                      background: MUSCLE_COLORS[f]?.bg,
                      color: MUSCLE_COLORS[f]?.color,
                      padding: '3px 10px', borderRadius: 99,
                    }}>
                      {MUSCLE_COLORS[f]?.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Jadwal Mingguan */}
              <div style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '16px',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-sub)', letterSpacing: '0.05em', marginBottom: 8 }}>
                  JADWAL MINGGUAN
                </div>
                {jadwal.map((item, i) => (
                  <JadwalRow key={i} item={item} />
                ))}
              </div>

              {/* Tips berdasarkan tingkat */}
              <div style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '16px',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-sub)', letterSpacing: '0.05em', marginBottom: 12 }}>
                  TIPS PENTING
                </div>
                {[
                  tingkat === 'sedentary' && 'Mulai pelan-pelan, fokus pada teknik yang benar dulu',
                  tingkat === 'ringan' && 'Konsistensi 3x/minggu lebih penting dari intensitas tinggi',
                  tingkat === 'sedang' && 'Pastikan asupan protein cukup (≥2g/kg berat badan)',
                  tingkat === 'aktif' && 'Tidur 7–9 jam sangat kritis untuk pemulihan di level ini',
                  tingkat === 'sangat_aktif' && 'Tubuh sudah aktif dari pekerjaan — jangan tambah volume berlebih',
                  'Tingkatkan beban secara bertahap setiap 1–2 minggu (progressive overload)',
                  `Waktu ${WAKTU_LATIHAN.find(w => w.id === waktu)?.label.toLowerCase()} adalah saat terbaik berdasarkan pilihanmu`,
                ].filter(Boolean).map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--color-primary-pale)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                    }}>
                      <Info size={11} color="var(--color-primary)" />
                    </div>
                    <span style={{ fontSize: 12.5, color: 'var(--color-text-sub)', lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Ubah preferensi */}
              <button
                onClick={() => { setStep(1); setFokus([]); setWaktu(''); }}
                className="btn btn--secondary btn--full"
                style={{ marginBottom: 8 }}
              >
                Ubah Preferensi
              </button>

              <button onClick={onBack} className="btn btn--ghost btn--full">
                Kembali ke Profil
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
