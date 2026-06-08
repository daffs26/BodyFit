import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplets, Moon, Dumbbell, TrendingUp, ChevronRight, Plus, Zap, User, MessageSquare, Trash2, X, RotateCcw, Copy, Sparkles } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import useStore from '../store/useStore';
import { generateRecommendedSchedule } from '../utils/scheduleGenerator';

const MOTIVATIONAL_QUOTES = [
  "Dorong diri Anda sendiri, karena tidak ada orang lain yang akan melakukannya untuk Anda.",
  "Satu-satunya latihan yang buruk adalah latihan yang tidak pernah dilakukan.",
  "Berkeringat hari ini, bersinar besok.",
  "Tubuh Anda bisa bertahan menghadapi hampir apa pun. Pikiran Anda yang harus Anda yakinkan.",
  "Jangan hanya berharap. Bekerjalah untuk itu.",
  "Juara tidak dilahirkan. Mereka dibangun.",
  "Satu repetisi lagi. Satu set lagi. Satu hari lagi.",
  "Rasa sakit itu sementara. Kebanggaan itu selamanya.",
  "Harus lebih kuat daripada alasan Anda.",
  "Setiap latihan adalah sebuah kemajuan.",
];



function StreakCard({ streak }) {
  return (
    <div className="card card--orange" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-5)' }}>
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Runtun Latihan Saat Ini
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>{streak}</span>
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: '0.01em' }}> Hari</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 5, fontWeight: 500 }}>Pertahankan terus!</div>
        </div>
        <div style={{ opacity: 0.75 }}><Flame size={52} color="white" /></div>
      </div>
    </div>
  );
}

function MacroRing({ label, current, target, color }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth="5" />
          <circle
            cx="32" cy="32" r={r}
            fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <span style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--color-text)',
          letterSpacing: '-0.01em',
        }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{current}g</div>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      </div>
    </div>
  );
}

export default function DashboardTab() {
  const { profil, hitungTDEE, setTabAktif, jadwalHarian, setJadwalHarian } = useStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempJadwal, setTempJadwal] = useState({});

  const [activeDay, setActiveDay] = useState(() => {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long' });
  });

  const [copySuccess, setCopySuccess] = useState(false);
  
  // Recommendation Form state
  const [showRecForm, setShowRecForm] = useState(false);
  const [recPekerjaan, setRecPekerjaan] = useState('kantoran');
  const [recJamMulai, setRecJamMulai] = useState('08:00');
  const [recJamSelesai, setRecJamSelesai] = useState('17:00');
  const [recHariMulai, setRecHariMulai] = useState('Senin');
  const [recHariSelesai, setRecHariSelesai] = useState('Jumat');

  const getJadwalForDay = (jadwal, hari) => {
    if (!jadwal) return [];
    if (Array.isArray(jadwal)) return jadwal;
    return jadwal[hari] || [];
  };

  const currentDayJadwal = getJadwalForDay(jadwalHarian, activeDay);

  const openEditModal = () => {
    let initialJadwal = {};
    if (Array.isArray(jadwalHarian)) {
      const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      days.forEach(d => {
        initialJadwal[d] = [...jadwalHarian];
      });
    } else {
      initialJadwal = JSON.parse(JSON.stringify(jadwalHarian || {}));
    }
    setTempJadwal(initialJadwal);
    setShowEditModal(true);
    setShowRecForm(false);
  };

  const updateTempItem = (index, updates) => {
    setTempJadwal(prev => {
      const copy = { ...prev };
      const dayList = [...(copy[activeDay] || [])];
      dayList[index] = { ...dayList[index], ...updates };
      copy[activeDay] = dayList;
      return copy;
    });
  };

  const deleteTempItem = (index) => {
    setTempJadwal(prev => {
      const copy = { ...prev };
      copy[activeDay] = (copy[activeDay] || []).filter((_, idx) => idx !== index);
      return copy;
    });
  };

  const addTempItem = () => {
    setTempJadwal(prev => {
      const copy = { ...prev };
      copy[activeDay] = [
        ...(copy[activeDay] || []),
        { start: '12:00', end: '13:00', label: 'Kegiatan Baru', icon: '📝', warna: '#3B82F6' }
      ];
      return copy;
    });
  };

  const resetToDefault = () => {
    const defaultJadwal = [
      { start: '05:30', end: '06:00', label: 'Bangun Tidur',          icon: '⏰', warna: '#FF6B00' },
      { start: '06:00', end: '07:00', label: 'Sarapan',               icon: '🍳', warna: '#22C55E' },
      { start: '07:00', end: '09:00', label: 'Latihan di Gym',        icon: '🏋️', warna: '#FF6B00' },
      { start: '09:00', end: '09:30', label: 'Makanan Pasca-Latihan',  icon: '🥗', warna: '#22C55E' },
      { start: '12:30', end: '13:30', label: 'Makan Siang',           icon: '🍱', warna: '#22C55E' },
      { start: '15:00', end: '16:00', label: 'Cemilan / Istirahat',   icon: '🍎', warna: '#F59E0B' },
      { start: '18:30', end: '19:30', label: 'Makan Malam',           icon: '🍽️', warna: '#22C55E' },
      { start: '22:00', end: '05:30', label: 'Tidur',                 icon: '🌙', warna: '#3B82F6' },
    ];
    setTempJadwal(prev => ({
      ...prev,
      [activeDay]: defaultJadwal
    }));
  };

  const saveJadwal = () => {
    const finalized = {};
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    days.forEach(d => {
      const dayList = tempJadwal[d] || [];
      finalized[d] = [...dayList].sort((a, b) => a.start.localeCompare(b.start));
    });
    setJadwalHarian(finalized);
    setShowEditModal(false);
  };

  const copyToAllDays = () => {
    const activeList = tempJadwal[activeDay] || [];
    const sorted = [...activeList].sort((a, b) => a.start.localeCompare(b.start));
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    setTempJadwal(prev => {
      const copy = { ...prev };
      days.forEach(d => {
        copy[d] = JSON.parse(JSON.stringify(sorted));
      });
      return copy;
    });
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  const applyRecommendation = () => {
    const recommended = generateRecommendedSchedule({
      pekerjaan: recPekerjaan,
      jamMulai: recJamMulai,
      jamSelesai: recJamSelesai,
      hariMulai: recHariMulai,
      hariSelesai: recHariSelesai,
      targetTidur: profil.targetTidur || 7.5,
    });
    setTempJadwal(recommended);
    setShowRecForm(false);
  };

  const macros = hitungTDEE();
  const today = new Date().toISOString().split('T')[0];
  
  const quote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];
  
  const dayName = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
  const dateStr = new Date().toLocaleDateString('id-ID', { month: 'long', day: 'numeric' });

  const todayFoods = useLiveQuery(
    () => db.catatanMakanan.where('tanggal').equals(today).toArray(),
    [today]
  ) || [];

  const todayWorkouts = useLiveQuery(
    () => db.sesiLatihan.where('tanggal').equals(today).toArray(),
    [today]
  ) || [];

  const allWorkouts = useLiveQuery(() => db.sesiLatihan.toArray()) || [];

  // Hitung streak
  const streak = React.useMemo(() => {
    if (allWorkouts.length === 0) return 0;
    const dates = [...new Set(allWorkouts.map(w => w.tanggal))].sort().reverse();
    let count = 0;
    let current = new Date();
    for (const d of dates) {
      const diff = Math.floor((current - new Date(d)) / 86400000);
      if (diff <= 1) { count++; current = new Date(d); }
      else break;
    }
    return count;
  }, [allWorkouts]);

  // Hitung konsumsi makro hari ini
  const consumed = todayFoods.reduce(
    (acc, f) => ({
      kalori: acc.kalori + (f.kalori || 0),
      protein:  acc.protein  + (f.protein  || 0),
      karbohidrat:    acc.karbohidrat    + (f.karbohidrat    || 0),
      lemak:      acc.lemak      + (f.lemak      || 0),
    }),
    { kalori: 0, protein: 0, karbohidrat: 0, lemak: 0 }
  );

  const caloriesLeft = macros.kalori - consumed.kalori;

  const tipeTargetLabel = profil.tipeTarget === 'surplus' 
    ? 'Surplus Kalori' 
    : profil.tipeTarget === 'defisit' 
      ? 'Defisit Kalori' 
      : 'Pemeliharaan';

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ background: 'var(--color-bg)' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>{dayName}, {dateStr}</div>
          <div className="page-title">
            Halo, <span>{profil.nama || 'Juara'}</span>
          </div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-primary)',
        }}><User size={20} color="white" /></div>
      </div>

      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* Streak */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StreakCard streak={streak} />
        </motion.div>

        {/* Calories Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card">
            <div className="section-header">
              <span className="section-title">Nutrisi Hari Ini</span>
              <span className="badge badge--orange">
                {tipeTargetLabel}
              </span>
            </div>

            {/* Kalori */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-sub)', fontWeight: 600 }}>Kalori</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{consumed.kalori}</span> / {macros.kalori} kkal
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${Math.min((consumed.kalori / macros.kalori) * 100, 100)}%` }}
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: 5, fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {caloriesLeft > 0 ? `${caloriesLeft} kkal tersisa` : `${Math.abs(caloriesLeft)} kkal melebihi target`}
              </div>
            </div>

            {/* Macros */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <MacroRing label="Protein" current={consumed.protein} target={macros.protein} color="var(--color-primary)" />
              <MacroRing label="Karbo" current={consumed.karbohidrat} target={macros.karbohidrat} color="var(--color-info)" />
              <MacroRing label="Lemak" current={consumed.lemak} target={macros.lemak} color="var(--color-warning)" />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="stats-grid">
            <div className="stats-card">
              <div className="stats-card__icon" style={{ background: 'var(--color-primary-pale)' }}>
                <Dumbbell size={18} color="var(--color-primary)" />
              </div>
              <div className="stats-card__value">{todayWorkouts.length}</div>
              <div className="stats-card__label">Latihan Hari Ini</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__icon" style={{ background: 'var(--color-success-pale)' }}>
                <Droplets size={18} color="var(--color-success)" />
              </div>
              <div className="stats-card__value">
                {((profil.targetAir || 2500) / 1000).toFixed(1)}L
              </div>
              <div className="stats-card__label">Target Air</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__icon" style={{ background: 'var(--color-info-pale)' }}>
                <Moon size={18} color="var(--color-info)" />
              </div>
              <div className="stats-card__value">{profil.targetTidur}j</div>
              <div className="stats-card__label">Target Tidur</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__icon" style={{ background: 'var(--color-warning-pale)' }}>
                <TrendingUp size={18} color="var(--color-warning)" />
              </div>
              <div className="stats-card__value">{allWorkouts.length}</div>
              <div className="stats-card__label">Total Sesi</div>
            </div>
          </div>
        </motion.div>

        {/* Daily Schedule */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card">
            <div className="section-header" style={{ marginBottom: 12 }}>
              <span className="section-title">Jadwal Harian ({activeDay})</span>
              <button className="section-action" onClick={openEditModal}>Kelola</button>
            </div>

            {/* Day Selector Pills */}
            <div style={{
              display: 'flex', gap: 6, overflowX: 'auto',
              paddingBottom: 10, marginBottom: 12,
              scrollbarWidth: 'none', msOverflowStyle: 'none'
            }}>
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => {
                const isSelected = activeDay === day;
                const isToday = new Date().toLocaleDateString('id-ID', { weekday: 'long' }) === day;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    style={{
                      padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: isSelected 
                        ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)' 
                        : 'var(--color-surface-2)',
                      color: isSelected ? 'white' : 'var(--color-text-sub)',
                      cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: 4,
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {day} {isToday && <span style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'white' : 'var(--color-primary)' }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {currentDayJadwal.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  Belum ada jadwal untuk hari {activeDay}. Ketuk "Kelola" untuk menambahkan.
                </div>
              ) : (
                currentDayJadwal.map((item, i) => {
                  const now = new Date();
                  const [sh, sm] = item.start.split(':').map(Number);
                  const [eh, em] = item.end.split(':').map(Number);

                  const startDate = new Date(); startDate.setHours(sh, sm, 0, 0);
                  const endDate = new Date(); endDate.setHours(eh, em, 0, 0);

                  if (endDate < startDate) {
                    if (now >= startDate) {
                      endDate.setDate(endDate.getDate() + 1);
                    } else {
                      startDate.setDate(startDate.getDate() - 1);
                    }
                  }

                  const isCurrent = now >= startDate && now < endDate;
                  const isPast = now >= endDate;

                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: '9px var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      background: isCurrent ? 'var(--color-primary-pale)' : 'transparent',
                      border: isCurrent ? '1px solid rgba(255,107,0,0.2)' : '1px solid transparent',
                    }}>
                      <div style={{
                        width: 76, textAlign: 'center',
                        fontSize: 10, fontWeight: 700, letterSpacing: '-0.01em',
                        color: isCurrent ? 'var(--color-primary)' : isPast ? 'var(--color-text-muted)' : 'var(--color-text-sub)',
                      }}>{item.start} - {item.end}</div>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isPast ? 'var(--color-surface-3)' : `${item.warna}20`,
                        fontSize: 16,
                        opacity: isPast && !isCurrent ? 0.4 : 1,
                      }}>
                        {item.icon}
                      </div>
                      <div style={{
                        flex: 1, fontSize: 13, fontWeight: isCurrent ? 700 : 500,
                        color: isPast && !isCurrent ? 'var(--color-text-muted)' : 'var(--color-text)',
                        letterSpacing: '0.005em',
                      }}>{item.label}</div>
                      {isCurrent && (
                        <span className="badge badge--orange" style={{ fontSize: 9, padding: '2px 8px' }}>Sekarang</span>
                      )}
                      {isPast && !isCurrent && (
                        <span style={{ color: 'var(--color-success)', fontSize: 14 }}>✓</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* Motivation Quote */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%)',
            borderColor: 'var(--color-border-light)',
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}><MessageSquare size={20} color="var(--color-primary)" /></div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Motivasi Harian
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.65, fontStyle: 'italic' }}>
                  "{quote}"
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <button
            className="btn btn--primary btn--full btn--lg"
            onClick={() => setTabAktif('logger')}
          >
            <Plus size={20} />
            Mulai Latihan Hari Ini
          </button>
        </motion.div>

        <div style={{ height: 8 }} />
      </div>

      {/* Modal Edit Jadwal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && !showRecForm && setShowEditModal(false)}
            style={{ zIndex: 1100 }}
          >
            <motion.div
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="modal-sheet"
              style={{ overflowY: 'auto', maxHeight: '90dvh', padding: '24px 20px 32px' }}
            >
              <div className="modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="modal-title" style={{ margin: 0, fontSize: 16 }}>Kelola Jadwal ({activeDay})</div>
                <button
                  onClick={resetToDefault}
                  className="btn btn--secondary"
                  style={{ padding: '6px 12px', fontSize: 11, gap: 5 }}
                >
                  <RotateCcw size={12} /> Reset Hari
                </button>
              </div>

              {/* Utility Row: Copy to All & Recommend */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button
                  onClick={copyToAllDays}
                  className="btn btn--secondary"
                  style={{ padding: '8px 12px', fontSize: 11, gap: 5, flex: 1, transition: 'all 0.15s ease' }}
                >
                  <Copy size={12} /> {copySuccess ? 'Tersalin!' : 'Salin ke Semua Hari'}
                </button>
                <button
                  onClick={() => setShowRecForm(!showRecForm)}
                  className="btn btn--secondary"
                  style={{ padding: '8px 12px', fontSize: 11, gap: 5, flex: 1, border: '1px solid rgba(255,107,0,0.4)', color: 'var(--color-primary)', transition: 'all 0.15s ease' }}
                >
                  <Sparkles size={12} /> {showRecForm ? 'Tutup Rekomendasi' : 'Rekomendasikan'}
                </button>
              </div>

              {/* Recommendation Form Drawer */}
              <AnimatePresence>
                {showRecForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 20,
                      display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden'
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={14} /> Atur Ulang & Buat Rekomendasi Jadwal
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-sub)', lineHeight: 1.4 }}>
                      Jawab kesibukanmu untuk secara otomatis merancang jadwal latihan, makan, dan tidur ideal untuk 7 hari seminggu.
                    </p>

                    <div className="input-group">
                      <label className="input-label" style={{ fontSize: 9 }}>Pekerjaan / Kesibukan Utama</label>
                      <select
                        className="input" style={{ padding: '6px 10px', fontSize: 12 }}
                        value={recPekerjaan}
                        onChange={e => setRecPekerjaan(e.target.value)}
                      >
                        <option value="pelajar">Pelajar Sekolah</option>
                        <option value="mahasiswa">Mahasiswa Kuliah</option>
                        <option value="kantoran">Pekerja Kantoran</option>
                        <option value="freelance">Freelancer / Wirausaha</option>
                        <option value="irt">Ibu Rumah Tangga / Di Rumah</option>
                      </select>
                    </div>

                    {recPekerjaan !== 'irt' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label" style={{ fontSize: 9 }}>Mulai Sibuk</label>
                          <input
                            type="time" className="input" style={{ padding: '6px 8px', fontSize: 12 }}
                            value={recJamMulai}
                            onChange={e => setRecJamMulai(e.target.value)}
                          />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label" style={{ fontSize: 9 }}>Selesai Sibuk</label>
                          <input
                            type="time" className="input" style={{ padding: '6px 8px', fontSize: 12 }}
                            value={recJamSelesai}
                            onChange={e => setRecJamSelesai(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label" style={{ fontSize: 9 }}>Dari Hari</label>
                        <select
                          className="input" style={{ padding: '6px 10px', fontSize: 12 }}
                          value={recHariMulai}
                          onChange={e => setRecHariMulai(e.target.value)}
                        >
                          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label" style={{ fontSize: 9 }}>Sampai Hari</label>
                        <select
                          className="input" style={{ padding: '6px 10px', fontSize: 12 }}
                          value={recHariSelesai}
                          onChange={e => setRecHariSelesai(e.target.value)}
                        >
                          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      className="btn btn--primary btn--full" style={{ padding: '8px', fontSize: 12, marginTop: 4 }}
                      onClick={applyRecommendation}
                    >
                      Terapkan Rekomendasi Jadwal Baru
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Day Selector inside Modal */}
              <div style={{
                display: 'flex', gap: 6, overflowX: 'auto',
                paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid var(--color-border)',
                scrollbarWidth: 'none', msOverflowStyle: 'none'
              }}>
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => {
                  const isSelected = activeDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      style={{
                        padding: '6px 10px', borderRadius: 16, fontSize: 10, fontWeight: 700,
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: isSelected ? 'var(--color-primary-pale)' : 'var(--color-surface-3)',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-sub)',
                        cursor: 'pointer', flexShrink: 0,
                        transition: 'all 0.12s ease'
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Schedule Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {!(tempJadwal[activeDay]) || tempJadwal[activeDay].length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    Belum ada kegiatan untuk hari {activeDay}.
                  </div>
                ) : (
                  tempJadwal[activeDay].map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex', flexDirection: 'column', gap: 8,
                      padding: 12, borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                    }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label" style={{ fontSize: 9 }}>Mulai</label>
                          <input
                            type="time" className="input" style={{ padding: '6px 8px', fontSize: 12 }}
                            value={item.start}
                            onChange={e => updateTempItem(idx, { start: e.target.value })}
                          />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label" style={{ fontSize: 9 }}>Selesai</label>
                          <input
                            type="time" className="input" style={{ padding: '6px 8px', fontSize: 12 }}
                            value={item.end}
                            onChange={e => updateTempItem(idx, { end: e.target.value })}
                          />
                        </div>
                        <div className="input-group" style={{ width: 52 }}>
                          <label className="input-label" style={{ fontSize: 9 }}>Ikon</label>
                          <select
                            className="input" style={{ padding: '5px', fontSize: 14 }}
                            value={item.icon}
                            onChange={e => updateTempItem(idx, { icon: e.target.value })}
                          >
                            {['⏰', '🍳', '🏋️', '🥗', '🍱', '🍎', '🍽️', '🌙', '🏃', '💧', '💊', '📝', '🔥'].map(em => (
                              <option key={em} value={em}>{em}</option>
                            ))}
                          </select>
                        </div>
                        <div className="input-group" style={{ width: 72 }}>
                          <label className="input-label" style={{ fontSize: 9 }}>Warna</label>
                          <select
                            className="input" style={{ padding: '5px', fontSize: 11 }}
                            value={item.warna}
                            onChange={e => updateTempItem(idx, { warna: e.target.value })}
                          >
                            <option value="#FF6B00">Jingga</option>
                            <option value="#22C55E">Hijau</option>
                            <option value="#3B82F6">Biru</option>
                            <option value="#F59E0B">Kuning</option>
                            <option value="#EF4444">Merah</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="text" className="input" style={{ padding: '7px 10px', fontSize: 13, flex: 1 }}
                          placeholder="Nama kegiatan (contoh: Sarapan)"
                          value={item.label}
                          onChange={e => updateTempItem(idx, { label: e.target.value })}
                        />
                        <button
                          onClick={() => deleteTempItem(idx)}
                          style={{
                            background: 'var(--color-danger-pale)', border: 'none',
                            borderRadius: 'var(--radius-md)', width: 34, height: 34,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0,
                          }}
                        >
                          <Trash2 size={14} color="var(--color-danger)" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                className="btn btn--ghost btn--full" style={{ marginBottom: 20 }}
                onClick={addTempItem}
              >
                + Tambah Kegiatan Baru
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Batal</button>
                <button className="btn btn--primary" style={{ flex: 2 }} onClick={saveJadwal}>Simpan Jadwal</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
