import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplets, Moon, Dumbbell, TrendingUp, ChevronRight, Plus, Zap, User, MessageSquare } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import useStore from '../store/useStore';

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

const JADWAL_HARIAN = [
  { start: '05:30', end: '06:00', label: 'Bangun Tidur',          icon: '⏰', warna: '#FF6B00' },
  { start: '06:00', end: '07:00', label: 'Sarapan',               icon: '🍳', warna: '#22C55E' },
  { start: '07:00', end: '09:00', label: 'Latihan di Gym',        icon: '🏋️', warna: '#FF6B00' },
  { start: '09:00', end: '09:30', label: 'Makanan Pasca-Latihan',  icon: '🥗', warna: '#22C55E' },
  { start: '12:30', end: '13:30', label: 'Makan Siang',           icon: '🍱', warna: '#22C55E' },
  { start: '15:00', end: '16:00', label: 'Cemilan / Istirahat',   icon: '🍎', warna: '#F59E0B' },
  { start: '18:30', end: '19:30', label: 'Makan Malam',           icon: '🍽️', warna: '#22C55E' },
  { start: '22:00', end: '05:30', label: 'Tidur',                 icon: '🌙', warna: '#3B82F6' },
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
  const { profil, hitungTDEE, setTabAktif } = useStore();
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
            <div className="section-header">
              <span className="section-title">Jadwal Harian</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {JADWAL_HARIAN.map((item, i) => {
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
              })}
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
    </div>
  );
}
