import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Trash2, User, CheckCircle2, Dumbbell, Clock, Zap, Info, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import { db } from '../db/db';
import ProgramRekomendasiPage from './ProgramRekomendasiPage';

// ── Data Program Latihan ─────────────────────────────────────────────────────

const TINGKAT_AKTIVITAS = [
  {
    id: 'sedentary',
    label: 'Sangat Ringan',
    deskripsi: 'Banyak duduk, sedikit/tanpa olahraga',
    hariPerMinggu: '0–1 hari',
    ikon: '🪑',
  },
  {
    id: 'ringan',
    label: 'Ringan',
    deskripsi: 'Olahraga ringan 1–3 hari/minggu',
    hariPerMinggu: '1–3 hari',
    ikon: '🚶',
  },
  {
    id: 'sedang',
    label: 'Sedang',
    deskripsi: 'Olahraga sedang 3–5 hari/minggu',
    hariPerMinggu: '3–5 hari',
    ikon: '🏃',
  },
  {
    id: 'aktif',
    label: 'Aktif',
    deskripsi: 'Olahraga berat 6–7 hari/minggu',
    hariPerMinggu: '6–7 hari',
    ikon: '💪',
  },
  {
    id: 'sangat_aktif',
    label: 'Sangat Aktif',
    deskripsi: 'Latihan fisik berat setiap hari / pekerja fisik',
    hariPerMinggu: 'Setiap hari',
    ikon: '🔥',
  },
];

const MUSCLE_COLORS = {
  dada:     { bg: 'rgba(255,107,0,0.15)',  color: '#FF8C33',  label: 'DADA' },
  punggung: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA',  label: 'PUNGGUNG' },
  kaki:     { bg: 'rgba(34,197,94,0.15)',  color: '#4ADE80',  label: 'KAKI' },
  bahu:     { bg: 'rgba(168,85,247,0.15)', color: '#C084FC',  label: 'BAHU' },
  lengan:   { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D',  label: 'LENGAN' },
  perut:    { bg: 'rgba(239,68,68,0.15)',  color: '#F87171',  label: 'PERUT' },
  kardio:   { bg: 'rgba(20,184,166,0.15)', color: '#2DD4BF',  label: 'KARDIO' },
};

const PROGRAMS = {
  full_body_2x: {
    id: 'full_body_2x',
    nama: 'Full Body 2x/Minggu',
    frekuensi: '2 hari/minggu',
    level: 'Pemula',
    levelColor: '#22C55E',
    durasiSesi: '45–60 menit',
    istirahatSet: '90–120 detik',
    deskripsi: 'Program paling cocok untuk pemula atau yang baru memulai. Melatih seluruh otot 2x seminggu dengan volume rendah agar tubuh beradaptasi tanpa overtraining.',
    cocokKarena: 'Tingkat aktivitas kamu masih rendah. Full Body 2x/minggu cukup efektif untuk membangun fondasi kekuatan dan kebiasaan latihan tanpa memforsir tubuh.',
    jadwal: [
      { hari: 'SENIN',  latihan: 'Full Body A',    detail: 'Squat, Bench Press, Barbell Row, OHP, Plank',      otot: ['kaki','dada','punggung','bahu','perut'], aktif: true },
      { hari: 'SELASA', latihan: 'Istirahat',       detail: 'Jalan kaki ringan, stretching 10–15 menit',        otot: [], aktif: false },
      { hari: 'RABU',   latihan: 'Istirahat Aktif', detail: 'Jalan kaki / bersepeda santai',                    otot: ['kardio'], aktif: false },
      { hari: 'KAMIS',  latihan: 'Full Body B',    detail: 'Deadlift, Incline Press, Lat Pulldown, Curl, Abs', otot: ['kaki','dada','punggung','lengan','perut'], aktif: true },
      { hari: 'JUMAT',  latihan: 'Istirahat',       detail: 'Pemulihan penuh, tidur cukup',                     otot: [], aktif: false },
      { hari: 'SABTU',  latihan: 'Istirahat Aktif', detail: 'Olahraga rekreasi ringan pilihan',                 otot: ['kardio'], aktif: false },
      { hari: 'MINGGU', latihan: 'Istirahat',       detail: 'Pemulihan penuh',                                  otot: [], aktif: false },
    ],
    tips: ['Fokus pada teknik, bukan beban', 'Tidur 7–8 jam sangat penting', 'Tingkatkan beban 2.5 kg tiap 1–2 minggu'],
  },
  full_body_3x: {
    id: 'full_body_3x',
    nama: 'Full Body 3x/Minggu',
    frekuensi: '3 hari/minggu',
    level: 'Pemula',
    levelColor: '#22C55E',
    durasiSesi: '50–70 menit',
    istirahatSet: '90 detik',
    deskripsi: 'Versi lanjutan dari Full Body 2x. Melatih seluruh otot 3x seminggu dengan istirahat bergantian. Sangat efektif untuk pemula yang ingin progress lebih cepat.',
    cocokKarena: 'Kamu sudah aktif 1–3 hari/minggu, tubuhmu siap menerima beban lebih. Full Body 3x memberikan frekuensi stimulus otot yang optimal untuk pertumbuhan awal.',
    jadwal: [
      { hari: 'SENIN',  latihan: 'Full Body A', detail: 'Squat, Bench Press, Row, OHP Duduk, Curl',          otot: ['kaki','dada','punggung','bahu','lengan'], aktif: true },
      { hari: 'SELASA', latihan: 'Istirahat',   detail: 'Pemulihan aktif: stretching / jalan kaki',          otot: [], aktif: false },
      { hari: 'RABU',   latihan: 'Full Body B', detail: 'RDL, Incline Press, Lat Pulldown, Lateral Raise',   otot: ['kaki','dada','punggung','bahu'], aktif: true },
      { hari: 'KAMIS',  latihan: 'Istirahat',   detail: 'Pemulihan penuh',                                   otot: [], aktif: false },
      { hari: 'JUMAT',  latihan: 'Full Body C', detail: 'Leg Press, Dips, Cable Row, Face Pull, Plank',      otot: ['kaki','dada','punggung','bahu','perut'], aktif: true },
      { hari: 'SABTU',  latihan: 'Istirahat',   detail: 'Olahraga rekreasi ringan pilihan',                  otot: ['kardio'], aktif: false },
      { hari: 'MINGGU', latihan: 'Istirahat',   detail: 'Pemulihan penuh',                                   otot: [], aktif: false },
    ],
    tips: ['3 set per latihan sudah cukup', 'Progressif overload: naikkan beban konsisten', 'Jangan skip hari istirahat'],
  },
  upper_lower: {
    id: 'upper_lower',
    nama: 'Upper-Lower Split',
    frekuensi: '4 hari/minggu',
    level: 'Menengah',
    levelColor: '#F59E0B',
    durasiSesi: '60–75 menit',
    istirahatSet: '90 detik',
    deskripsi: 'Membagi latihan menjadi tubuh atas dan bawah. Setiap bagian dilatih 2x seminggu dengan volume lebih tinggi. Ideal untuk transisi dari pemula ke menengah.',
    cocokKarena: 'Dengan 3–5 hari aktivitas per minggu, kamu sudah cukup fit untuk split training. Upper-Lower memaksimalkan volume per otot tanpa kelelahan berlebihan.',
    jadwal: [
      { hari: 'SENIN',  latihan: 'Upper A (Push Focus)', detail: 'Bench Press, OHP, Tricep, Lateral Raise, Shrug',    otot: ['dada','bahu','lengan'], aktif: true },
      { hari: 'SELASA', latihan: 'Lower A',              detail: 'Squat, RDL, Leg Press, Leg Curl, Calf Raise',       otot: ['kaki'], aktif: true },
      { hari: 'RABU',   latihan: 'Istirahat',            detail: 'Pemulihan / kardio ringan 20 menit',                otot: ['kardio'], aktif: false },
      { hari: 'KAMIS',  latihan: 'Upper B (Pull Focus)', detail: 'Pull-Up, Barbell Row, Bicep Curl, Face Pull',       otot: ['punggung','lengan','bahu'], aktif: true },
      { hari: 'JUMAT',  latihan: 'Lower B',              detail: 'Deadlift, Bulgarian Split Squat, Leg Extension',    otot: ['kaki','perut'], aktif: true },
      { hari: 'SABTU',  latihan: 'Istirahat',            detail: 'Olahraga rekreasi pilihan',                         otot: ['kardio'], aktif: false },
      { hari: 'MINGGU', latihan: 'Istirahat',            detail: 'Pemulihan penuh',                                   otot: [], aktif: false },
    ],
    tips: ['Volume per sesi lebih tinggi dari Full Body', 'Kardio ringan di hari istirahat mempercepat pemulihan', 'Targetkan 8–12 rep per set untuk hipertrofi'],
  },
  ppl: {
    id: 'ppl',
    nama: 'Push Pull Legs (PPL)',
    frekuensi: '6 hari/minggu',
    level: 'Menengah–Lanjut',
    levelColor: '#FF6B00',
    durasiSesi: '60–90 menit',
    istirahatSet: '60–90 detik',
    deskripsi: 'Pemisahan latihan berdasarkan gerakan: mendorong (dada, bahu, trisep), menarik (punggung, bisep), dan kaki. Setiap kelompok otot dilatih 2x per minggu.',
    cocokKarena: 'Kamu sudah aktif 3–5 hari/minggu dan siap program yang lebih terstruktur. PPL memberikan volume tinggi per otot dengan pemulihan yang cukup di antara sesi.',
    jadwal: [
      { hari: 'SENIN',  latihan: 'Push (Dada, Bahu, Trisep)', detail: 'Bench Press, OHP, Incline DB, Lateral Raise, Tricep', otot: ['dada','bahu','lengan'], aktif: true },
      { hari: 'SELASA', latihan: 'Pull (Punggung, Bisep)',     detail: 'Deadlift, Pull-Up, Cable Row, Face Pull, Curl',       otot: ['punggung','lengan'], aktif: true },
      { hari: 'RABU',   latihan: 'Legs (Kaki, Perut)',         detail: 'Squat, Leg Press, RDL, Leg Curl, Calf, Abs',         otot: ['kaki','perut'], aktif: true },
      { hari: 'KAMIS',  latihan: 'Push (Variasi)',             detail: 'Incline Press, DB OHP, Flyes, Dips, Skull Crusher',  otot: ['dada','bahu','lengan'], aktif: true },
      { hari: 'JUMAT',  latihan: 'Pull (Variasi)',             detail: 'Barbell Row, Lat Pulldown, Shrug, Hammer Curl',      otot: ['punggung','lengan'], aktif: true },
      { hari: 'SABTU',  latihan: 'Legs (Variasi)',             detail: 'Front Squat, Hack Squat, SLDL, Hip Thrust, Calf',   otot: ['kaki','perut'], aktif: true },
      { hari: 'MINGGU', latihan: 'Istirahat',                  detail: 'Pemulihan penuh — wajib!',                           otot: [], aktif: false },
    ],
    tips: ['1 hari istirahat penuh di hari Minggu wajib', 'Pastikan asupan protein ≥2g/kg berat badan', 'Tidur 7–9 jam untuk pemulihan optimal'],
  },
  arnold_split: {
    id: 'arnold_split',
    nama: 'Arnold Split',
    frekuensi: '6 hari/minggu',
    level: 'Lanjut',
    levelColor: '#EF4444',
    durasiSesi: '75–100 menit',
    istirahatSet: '60–90 detik',
    deskripsi: 'Program ikonik Arnold Schwarzenegger. Membagi latihan jadi Dada+Punggung, Bahu+Lengan, dan Kaki. Volume sangat tinggi, cocok untuk yang sudah advanced.',
    cocokKarena: 'Kamu sudah sangat aktif. Arnold Split memaksimalkan hypertrophy dengan volume tinggi dan antagonist pairing (dada+punggung) yang meningkatkan aliran darah ke otot.',
    jadwal: [
      { hari: 'SENIN',  latihan: 'Dada + Punggung',   detail: 'Bench Press, Flyes, Pull-Up, Barbell Row, Deadlift', otot: ['dada','punggung'], aktif: true },
      { hari: 'SELASA', latihan: 'Bahu + Lengan',      detail: 'OHP, Lateral Raise, Curl, Skull Crusher, Dips',     otot: ['bahu','lengan'], aktif: true },
      { hari: 'RABU',   latihan: 'Kaki',               detail: 'Squat, Leg Press, RDL, Leg Curl, Calf Raise',       otot: ['kaki','perut'], aktif: true },
      { hari: 'KAMIS',  latihan: 'Dada + Punggung',   detail: 'Incline Press, Cable Flyes, T-Bar Row, Pullover',    otot: ['dada','punggung'], aktif: true },
      { hari: 'JUMAT',  latihan: 'Bahu + Lengan',      detail: 'Arnold Press, Rear Delt, Preacher Curl, Tri Cable', otot: ['bahu','lengan'], aktif: true },
      { hari: 'SABTU',  latihan: 'Kaki (Volume)',      detail: 'Front Squat, Hack Squat, SLDL, Hip Thrust, Abs',    otot: ['kaki','perut'], aktif: true },
      { hari: 'MINGGU', latihan: 'Istirahat Penuh',    detail: 'Pemulihan wajib — jangan dilewati!',                 otot: [], aktif: false },
    ],
    tips: ['Jangan tambah volume jika belum siap', 'Suplemen creatine membantu performa', 'Deload setiap 8–10 minggu agar tidak overtraining'],
  },
  strength_recovery: {
    id: 'strength_recovery',
    nama: 'Strength + Recovery',
    frekuensi: '3 hari/minggu',
    level: 'Semua Level',
    levelColor: '#3B82F6',
    durasiSesi: '45–60 menit',
    istirahatSet: '2–3 menit',
    deskripsi: 'Dirancang khusus untuk yang sudah aktif secara fisik dari pekerjaan. Fokus pada kekuatan fungsional dan pemulihan, bukan menambah kelelahan dari pekerjaan.',
    cocokKarena: 'Tubuhmu sudah sangat aktif dari aktivitas harian/pekerjaan fisik. Program ini membangun kekuatan tanpa menambah fatigue berlebihan, dan memberi prioritas pemulihan.',
    jadwal: [
      { hari: 'SENIN',  latihan: 'Kekuatan A (Lower)',  detail: 'Squat 5x5, Deadlift 3x3, Calf Raise, Plank',        otot: ['kaki','perut'], aktif: true },
      { hari: 'SELASA', latihan: 'Pemulihan Aktif',     detail: 'Mobility, stretching, foam rolling 20 menit',        otot: [], aktif: false },
      { hari: 'RABU',   latihan: 'Kekuatan B (Upper)',  detail: 'Bench Press 5x5, Row 4x6, OHP 3x8, Pull-Up',         otot: ['dada','punggung','bahu'], aktif: true },
      { hari: 'KAMIS',  latihan: 'Istirahat',           detail: 'Pemulihan penuh — sangat penting',                    otot: [], aktif: false },
      { hari: 'JUMAT',  latihan: 'Kekuatan C (Full)',   detail: 'RDL, Incline Press, Lat Pulldown, Dips, Abs',         otot: ['kaki','dada','punggung','lengan','perut'], aktif: true },
      { hari: 'SABTU',  latihan: 'Istirahat',           detail: 'Pemulihan penuh',                                     otot: [], aktif: false },
      { hari: 'MINGGU', latihan: 'Istirahat',           detail: 'Istirahat penuh — prioritas tidur',                   otot: [], aktif: false },
    ],
    tips: ['Rep rendah (3–6) + beban berat = kekuatan fungsional', 'Tidur adalah kunci utama pemulihan', 'Makan cukup karbohidrat untuk energi pekerjaan + gym'],
  },
};

const ACTIVITY_TO_PROGRAMS = {
  sedentary:    { utama: 'full_body_2x',      alternatif: null },
  ringan:       { utama: 'full_body_3x',      alternatif: 'upper_lower' },
  sedang:       { utama: 'ppl',              alternatif: 'upper_lower' },
  aktif:        { utama: 'ppl',              alternatif: 'arnold_split' },
  sangat_aktif: { utama: 'strength_recovery', alternatif: 'full_body_3x' },
};

// ── Sub-Components ────────────────────────────────────────────────────────────

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

function ActivitySelector({ value, onChange, onViewProgram }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {TINGKAT_AKTIVITAS.map((item) => {
        const isActive = value === item.id;
        return (
          <div key={item.id} style={{ display: 'flex', gap: 8 }}>
            {/* Pilih sebagai tingkat aktivitas */}
            <button
              onClick={() => onChange(item.id)}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: isActive ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{item.ikon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {item.deskripsi}
                </div>
              </div>
              <div style={{
                flexShrink: 0, fontSize: 10, fontWeight: 700,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: isActive ? 'var(--color-primary-pale)' : 'var(--color-surface-3)',
                padding: '3px 8px', borderRadius: 99, letterSpacing: '0.02em',
              }}>
                {item.hariPerMinggu}
              </div>
              {isActive && <CheckCircle2 size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />}
            </button>

            {/* Tombol lihat program */}
            <button
              onClick={() => onViewProgram(item.id)}
              title="Lihat rekomendasi program"
              style={{
                flexShrink: 0, width: 44,
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-2)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s',
                color: 'var(--color-text-muted)',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        );
      })}
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 4 }}>
        Ketuk tombol  untuk lihat rekomendasi program latihan
      </div>
    </div>
  );
}

function JadwalRow({ item }) {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '10px 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      {/* Hari */}
      <div style={{
        width: 52, flexShrink: 0,
        fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
        color: item.aktif ? 'var(--color-primary)' : 'var(--color-text-muted)',
        paddingTop: 2,
      }}>
        {item.hari}
      </div>

      {/* Dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4,
        background: item.aktif ? 'var(--color-primary)' : 'var(--color-surface-3)',
        border: `2px solid ${item.aktif ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
      }} />

      {/* Latihan info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: item.aktif ? 700 : 500,
          color: item.aktif ? 'var(--color-text)' : 'var(--color-text-muted)',
          marginBottom: 3,
        }}>
          {item.latihan}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: item.otot.length > 0 ? 6 : 0, lineHeight: 1.5 }}>
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

function ProgramCard({ program, isAlternatif = false }) {
  const [expanded, setExpanded] = useState(!isAlternatif);

  return (
    <div style={{
      border: `1px solid ${isAlternatif ? 'var(--color-border)' : 'rgba(255,107,0,0.3)'}`,
      borderRadius: 'var(--radius-xl)',
      background: isAlternatif ? 'var(--color-surface)' : 'var(--color-surface)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          background: isAlternatif ? 'transparent' : 'linear-gradient(135deg, rgba(255,107,0,0.12) 0%, rgba(255,107,0,0.04) 100%)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: expanded ? '1px solid var(--color-border)' : 'none',
        }}
      >
        {!isAlternatif && (
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'var(--color-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={14} color="white" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: isAlternatif ? 13 : 15, fontWeight: 700,
              color: isAlternatif ? 'var(--color-text-sub)' : 'var(--color-primary)',
            }}>
              {program.nama}
            </span>
            {!isAlternatif && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                background: 'var(--color-primary)', color: 'white',
                padding: '2px 6px', borderRadius: 99,
              }}>
                REKOMENDASI
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: program.levelColor,
              background: `${program.levelColor}20`,
              padding: '2px 8px', borderRadius: 99,
            }}>
              {program.level}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: 'var(--color-text-muted)',
              background: 'var(--color-surface-3)',
              padding: '2px 8px', borderRadius: 99,
            }}>
              {program.frekuensi}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} color="var(--color-text-muted)" /> : <ChevronDown size={16} color="var(--color-text-muted)" />}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Kenapa cocok */}
              <div style={{
                padding: '10px 12px',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-primary)',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.06em', marginBottom: 4 }}>
                  KENAPA COCOK UNTUKMU
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-sub)', lineHeight: 1.6 }}>
                  {program.cocokKarena}
                </div>
              </div>

              {/* Info sesi */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-2)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Clock size={13} color="var(--color-text-muted)" />
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>DURASI SESI</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{program.durasiSesi}</div>
                  </div>
                </div>
                <div style={{
                  flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-2)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Dumbbell size={13} color="var(--color-text-muted)" />
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>ISTIRAHAT SET</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{program.istirahatSet}</div>
                  </div>
                </div>
              </div>

              {/* Jadwal mingguan */}
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)',
                  letterSpacing: '0.05em', marginBottom: 2,
                }}>
                  JADWAL MINGGUAN
                </div>
                <div>
                  {program.jadwal.map((item, i) => (
                    <JadwalRow key={i} item={item} />
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)',
                  letterSpacing: '0.05em', marginBottom: 8,
                }}>
                  TIPS PROGRAM
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {program.tips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--color-primary-pale)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 1,
                      }}>
                        <Info size={10} color="var(--color-primary)" />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--color-text-sub)', lineHeight: 1.55 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RekomendasiProgram({ tingkatAktivitas }) {
  const mapping = ACTIVITY_TO_PROGRAMS[tingkatAktivitas] || ACTIVITY_TO_PROGRAMS['sedang'];
  const programUtama = PROGRAMS[mapping.utama];
  const programAlt = mapping.alternatif ? PROGRAMS[mapping.alternatif] : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tingkatAktivitas}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {/* Program Utama */}
        <ProgramCard program={programUtama} isAlternatif={false} />

        {/* Program Alternatif */}
        {programAlt && (
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)',
              letterSpacing: '0.06em', marginBottom: 6, paddingLeft: 2,
            }}>
              ALTERNATIF
            </div>
            <ProgramCard program={programAlt} isAlternatif={true} />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProfileTab() {
  const { profil, setProfil, hitungTDEE, tema, setTema } = useStore();
  const macros = hitungTDEE();
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [programPageTingkat, setProgramPageTingkat] = useState(null); // null = tutup

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = async () => {
    const [sesiLatihan, catatanLatihan, kamusLatihan, catatanBerat, catatanMakanan, targetBulanan] = await Promise.all([
      db.sesiLatihan.toArray(),
      db.catatanLatihan.toArray(),
      db.kamusLatihan.where('kustom').equals(true).toArray(),
      db.catatanBerat.toArray(),
      db.catatanMakanan.toArray(),
      db.targetBulanan.toArray(),
    ]);

    const data = { profil, sesiLatihan, catatanLatihan, kamusLatihan, catatanBerat, catatanMakanan, targetBulanan, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BodyFit_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.sesiLatihan)     await db.sesiLatihan.bulkPut(data.sesiLatihan);
      if (data.catatanLatihan)  await db.catatanLatihan.bulkPut(data.catatanLatihan);
      if (data.kamusLatihan)    await db.kamusLatihan.bulkPut(data.kamusLatihan);
      if (data.catatanBerat)    await db.catatanBerat.bulkPut(data.catatanBerat);
      if (data.catatanMakanan)  await db.catatanMakanan.bulkPut(data.catatanMakanan);
      if (data.targetBulanan)   await db.targetBulanan.bulkPut(data.targetBulanan);
      alert('✅ Data berhasil dipulihkan!');
    } catch {
      alert('❌ Gagal mengimpor. Harap gunakan file cadangan BodyFit yang valid.');
    }
    setImporting(false);
    e.target.value = '';
  };

  const clearAllData = async () => {
    if (!window.confirm('⚠️ Apakah Anda yakin? Ini akan menghapus SEMUA data latihan dan nutrisi Anda. Tindakan ini tidak dapat dibatalkan.')) return;
    await Promise.all([
      db.sesiLatihan.clear(), db.catatanLatihan.clear(), db.catatanBerat.clear(),
      db.catatanMakanan.clear(), db.targetBulanan.clear(),
    ]);
    alert('Semua data telah dihapus.');
  };

  const tipeTargetLabel = profil.tipeTarget === 'surplus'
    ? 'Surplus Kalori'
    : profil.tipeTarget === 'defisit'
      ? 'Defisit Kalori'
      : 'Pemeliharaan';

  return (
    <>
      {/* ── Program Rekomendasi Page (overlay slide-in) ── */}
      <AnimatePresence>
        {programPageTingkat && (
          <ProgramRekomendasiPage
            key="program-page"
            tingkat={programPageTingkat}
            onBack={() => setProgramPageTingkat(null)}
          />
        )}
      </AnimatePresence>

    <div>
      <div className="page-header">
        <div className="page-title">Profil <span>Saya</span></div>
      </div>

      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* Profile Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-4)', boxShadow: 'var(--shadow-primary)',
            }}><User size={36} color="white" /></div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{profil.nama || 'Atur Nama Anda'}</div>
            <div className="badge badge--orange">{tipeTargetLabel}</div>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Target: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{macros.kalori} kkal</span> · {macros.protein}g P · {macros.karbohidrat}g K · {macros.lemak}g L
            </div>
          </div>
        </motion.div>

        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Informasi Pribadi</div>

            <div className="input-group" style={{ marginBottom: 12 }}>
              <label className="input-label">Nama</label>
              <input className="input" placeholder="Masukkan nama Anda..." value={profil.nama} onChange={e => setProfil({ nama: e.target.value })} />
            </div>

            <div className="input-row" style={{ marginBottom: 12 }}>
              <div className="input-group">
                <label className="input-label">Usia</label>
                <input className="input" type="number" value={profil.usia} onChange={e => setProfil({ usia: +e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Jenis Kelamin</label>
                <select className="input" value={profil.gender} onChange={e => setProfil({ gender: e.target.value })}>
                  <option value="pria">Pria</option>
                  <option value="wanita">Wanita</option>
                </select>
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: 12 }}>
              <div className="input-group">
                <label className="input-label">Tinggi Badan (cm)</label>
                <input className="input" type="number" value={profil.tinggi} onChange={e => setProfil({ tinggi: +e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Berat Badan (kg)</label>
                <input className="input" type="number" value={profil.berat} onChange={e => setProfil({ berat: +e.target.value })} />
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: 16 }}>
              <div className="input-group">
                <label className="input-label">Target Berat Badan (kg)</label>
                <input className="input" type="number" value={profil.beratTarget} onChange={e => setProfil({ beratTarget: +e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Target Tidur (jam)</label>
                <input className="input" type="number" step="0.5" value={profil.targetTidur} onChange={e => setProfil({ targetTidur: +e.target.value })} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 12 }}>
              <label className="input-label">Target Air Minum (ml)</label>
              <input className="input" type="number" value={profil.targetAir} onChange={e => setProfil({ targetAir: +e.target.value })} />
            </div>

            {/* Tipe Target */}
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Tipe Target Kalori</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[
                  { id: 'defisit', label: 'Defisit', sub: '-400 kkal' },
                  { id: 'pemeliharaan', label: 'Pemeliharaan', sub: '±0 kkal' },
                  { id: 'surplus', label: 'Surplus', sub: '+400 kkal' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setProfil({ tipeTarget: t.id })}
                    style={{
                      padding: '8px 6px', borderRadius: 'var(--radius-md)',
                      background: profil.tipeTarget === t.id ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                      border: `2px solid ${profil.tipeTarget === t.id ? 'var(--color-primary)' : 'transparent'}`,
                      color: profil.tipeTarget === t.id ? 'var(--color-primary)' : 'var(--color-text-sub)',
                      cursor: 'pointer', transition: 'all 0.18s',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{t.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{t.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn--primary btn--full" onClick={handleSave}>
              {saved ? '✓ Profil Disimpan!' : 'Simpan Profil'}
            </button>
          </div>
        </motion.div>

        {/* Tingkat Aktivitas + Rekomendasi Program */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="card">
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div className="section-title">Tingkat Aktivitas Harian</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Pilih yang paling sesuai dengan rutinitas harianmu — ini mempengaruhi kalori & rekomendasi program.
              </div>
            </div>
            <ActivitySelector
              value={profil.tingkatAktivitas}
              onChange={(val) => setProfil({ tingkatAktivitas: val })}
              onViewProgram={(tingkat) => setProgramPageTingkat(tingkat)}
            />
          </div>
        </motion.div>

        {/* Macro Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Target Harian</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Kalori', value: `${macros.kalori} kkal`, sub: `BMR: ${macros.bmr} · TDEE: ${macros.tdee}`, color: 'var(--color-primary)' },
                { label: 'Protein', value: `${macros.protein}g`, sub: `${(macros.protein / profil.berat).toFixed(1)}g per kg berat badan`, color: 'var(--color-primary)' },
                { label: 'Karbohidrat', value: `${macros.karbohidrat}g`, sub: `~${Math.round(macros.karbohidrat * 4)} kkal`, color: 'var(--color-info)' },
                { label: 'Lemak', value: `${macros.lemak}g`, sub: `~${Math.round(macros.lemak * 9)} kkal`, color: 'var(--color-warning)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-sub)' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* App Preferences */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Preferensi Aplikasi</div>
            <div className="input-group">
              <label className="input-label">Tema</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[{ id: 'light', label: 'Terang' }, { id: 'dark', label: 'Gelap' }].map(th => (
                  <button
                    key={th.id}
                    onClick={() => setTema(th.id)}
                    style={{
                      padding: '10px 8px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      background: (tema || 'dark') === th.id ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                      border: `2px solid ${(tema || 'dark') === th.id ? 'var(--color-primary)' : 'transparent'}`,
                      color: (tema || 'dark') === th.id ? 'var(--color-primary)' : 'var(--color-text-sub)',
                      textAlign: 'center', transition: 'all 0.2s', fontWeight: 600, fontSize: 13,
                    }}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Manajemen Data</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button className="btn btn--secondary btn--full" onClick={exportData} style={{ justifyContent: 'flex-start', gap: 'var(--space-3)' }}>
                <Download size={18} color="var(--color-success)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Ekspor Cadangan Data</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Unduh data latihan & nutrisi Anda ke file JSON</div>
                </div>
              </button>

              <label className="btn btn--secondary btn--full" style={{ justifyContent: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer' }}>
                <Upload size={18} color="var(--color-info)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{importing ? 'Mengimpor...' : 'Impor Cadangan Data'}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Pulihkan data Anda dari file JSON cadangan</div>
                </div>
                <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
              </label>

              <button className="btn btn--danger btn--full" onClick={clearAllData} style={{ justifyContent: 'flex-start', gap: 'var(--space-3)', marginTop: 8 }}>
                <Trash2 size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Hapus Semua Data</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Hapus permanen semua data dari browser ini</div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* App Info + Reset Onboarding */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>BodyFit</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>v1.0.0 · 100% Lokal · Tidak Perlu Akun</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Data Anda tetap berada di perangkat Anda</div>

            <button
              onClick={() => {
                if (window.confirm('Reset setup awal? Semua pengaturan profil akan dikonfigurasi ulang.')) {
                  setProfil({ onboardingSelesai: false });
                }
              }}
              style={{
                marginTop: 16, padding: '8px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'transparent', cursor: 'pointer',
                fontSize: 12, color: 'var(--color-text-muted)',
                transition: 'all 0.18s',
              }}
            >
              Ulangi Setup Awal
            </button>
          </div>
        </motion.div>

        <div style={{ height: 8 }} />
      </div>
    </div>
    </>
  );
}
