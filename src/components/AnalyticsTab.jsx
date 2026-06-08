import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import useStore from '../store/useStore';
import { TrendingUp, Plus, Trash2, Zap, Dumbbell, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1E1E21', titleColor: '#fff', bodyColor: '#A1A1AA', borderColor: '#2A2A2E', borderWidth: 1, cornerRadius: 10 } },
  scales: {
    x: { grid: { color: '#1E1E21' }, ticks: { color: '#52525B', font: { size: 11, family: "'Outfit', sans-serif" } } },
    y: { grid: { color: '#1E1E21' }, ticks: { color: '#52525B', font: { size: 11, family: "'Outfit', sans-serif" } } },
  },
};


// ── Data ────────────────────────────────────────────────────────────────────
const FOCUS_AREAS = [
  {
    id: 'dada', label: 'Dada', icon: '/images/dada.png', color: '#FF6B00',
    exercises: ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Flyes', 'Cable Crossover'],
  },
  {
    id: 'punggung', label: 'Punggung', icon: '/images/punggung.png', color: '#3B82F6',
    exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row'],
  },
  {
    id: 'kaki', label: 'Kaki', icon: '/images/kaki.png', color: '#10B981',
    exercises: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Hack Squat', 'Leg Extension'],
  },
  {
    id: 'bahu', label: 'Bahu', icon: '/images/bahu.png', color: '#8B5CF6',
    exercises: ['Overhead Press', 'Dumbbell Lateral Raise', 'Arnold Press', 'Face Pull', 'Upright Row'],
  },
  {
    id: 'lengan', label: 'Lengan', icon: '/images/lengan.png', color: '#F59E0B',
    exercises: ['Barbell Curl', 'Close-Grip Bench Press', 'Hammer Curl', 'Tricep Dip', 'Preacher Curl'],
  },
  {
    id: 'perut', label: 'Perut', icon: '/images/perut.png', color: '#EF4444',
    exercises: ['Cable Crunch', 'Hanging Leg Raise', 'Ab Rollout', 'Decline Sit-Up', 'Plank'],
  },
];

const ZONE_TIPS = [
  { icon: Zap,      label: 'Kekuatan',   range: '85–100%', reps: '1–5 reps',   color: '#EF4444', desc: 'Beban berat, istirahat 3–5 menit' },
  { icon: Dumbbell, label: 'Hipertrofi', range: '65–85%',  reps: '6–12 reps',  color: '#FF6B00', desc: 'Tempo kontrol, istirahat 60–90 detik' },
  { icon: Activity, label: 'Endurance',  range: '50–65%',  reps: '12–20 reps', color: '#10B981', desc: 'Volume tinggi, istirahat <60 detik' },
];

const PCT_COLS = [
  { pct: 1.00, label: '100%' },
  { pct: 0.95, label: '95%' },
  { pct: 0.90, label: '90%' },
  { pct: 0.85, label: '85%' },
  { pct: 0.80, label: '80%' },
  { pct: 0.75, label: '75%' },
  { pct: 0.70, label: '70%' },
];

const newRow = (n) => ({ id: Date.now() + n, weight: '', reps: '' });

// ── Component ────────────────────────────────────────────────────────────────
function OneRMCalculator() {
  const [focusId,   setFocusId]   = useState('dada');
  const [exercise,  setExercise]  = useState(FOCUS_AREAS[0].exercises[0]);
  const [rows,      setRows]      = useState([newRow(0)]);
  const [results,   setResults]   = useState([]);

  const focusArea = FOCUS_AREAS.find(f => f.id === focusId);

  const handleFocusChange = (id) => {
    const area = FOCUS_AREAS.find(f => f.id === id);
    setFocusId(id);
    setExercise(area.exercises[0]);
    setResults([]);
  };

  const addRow = () => {
    if (rows.length >= 5) return;
    setRows(prev => [...prev, newRow(prev.length)]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id, field, val) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const calculate = () => {
    const computed = rows.map((r, i) => {
      const w = parseFloat(r.weight);
      const rp = parseFloat(r.reps);
      if (!w || !rp || rp < 1) return null;
      const oneRM = w / (1.0278 - 0.0278 * rp);
      return {
        setNum:   i + 1,
        weight:   w,
        reps:     rp,
        oneRM:    Math.round(oneRM),
        percents: PCT_COLS.map(p => ({ label: p.label, val: Math.round(oneRM * p.pct) })),
      };
    }).filter(Boolean);
    setResults(computed);
  };

  const hasValidRow = rows.some(r => parseFloat(r.weight) > 0 && parseFloat(r.reps) > 0);

  return (
    <div className="card" style={{ padding: 'var(--space-4)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div className="section-title" style={{ marginBottom: 4 }}>Kalkulator 1RM</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Estimasi one-rep max berdasarkan set yang dilakukan</div>
      </div>

      {/* Focus Area Chips */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Fokus Area Otot
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FOCUS_AREAS.map(area => {
            const isActive = area.id === focusId;
            return (
              <button
                key={area.id}
                onClick={() => handleFocusChange(area.id)}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  border: `${isActive ? '2px' : '1.5px'} solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text)',
                  fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {area.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Selector */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Gerakan
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {focusArea.exercises.map(ex => {
            const isActive = ex === exercise;
            return (
              <button
                key={ex}
                onClick={() => { setExercise(ex); setResults([]); }}
                style={{
                  padding: '5px 11px', borderRadius: 'var(--radius-md)',
                  border: `${isActive ? '2px' : '1.5px'} solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: 'transparent',
                  color: 'var(--color-text)',
                  fontSize: 11, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {ex}
              </button>
            );
          })}
        </div>
      </div>

      {/* Set Table */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        {/* Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 32px', gap: 6, marginBottom: 6, padding: '0 2px' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>Set</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>Beban (kg)</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>Repetisi</span>
          <span />
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <AnimatePresence>
            {rows.map((row, idx) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 32px', gap: 6, alignItems: 'center' }}
              >
                {/* Set Number */}
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: `${focusArea.color}20`,
                  color: focusArea.color,
                  fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {idx + 1}
                </div>

                {/* Weight Input */}
                <input
                  className="input"
                  type="number"
                  placeholder="misal: 80"
                  value={row.weight}
                  onChange={e => updateRow(row.id, 'weight', e.target.value)}
                  style={{ padding: '8px 10px', fontSize: 13, textAlign: 'center' }}
                />

                {/* Reps Input */}
                <input
                  className="input"
                  type="number"
                  placeholder="misal: 5"
                  value={row.reps}
                  onChange={e => updateRow(row.id, 'reps', e.target.value)}
                  style={{ padding: '8px 10px', fontSize: 13, textAlign: 'center' }}
                />

                {/* Delete */}
                <button
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none',
                    background: rows.length <= 1 ? 'transparent' : 'var(--color-danger-pale)',
                    color: rows.length <= 1 ? 'var(--color-border)' : 'var(--color-danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: rows.length <= 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Row */}
        {rows.length < 5 && (
          <button
            onClick={addRow}
            style={{
              marginTop: 10, width: '100%', padding: '8px',
              border: `1.5px dashed ${focusArea.color}50`,
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: focusArea.color,
              fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <Plus size={14} /> Tambah Set
          </button>
        )}
      </div>

      {/* Calculate Button */}
      <button
        className="btn btn--primary btn--full"
        onClick={calculate}
        disabled={!hasValidRow}
        style={{ opacity: hasValidRow ? 1 : 0.5 }}
      >
        Hitung Semua Set
      </button>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 'var(--space-5)' }}
          >
            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Hasil</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            {/* Per-Set Result Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {results.map(res => (
                <motion.div
                  key={res.setNum}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: res.setNum * 0.05 }}
                  style={{
                    background: 'var(--color-surface-2)',
                    border: `1px solid ${focusArea.color}30`,
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Card Header */}
                  <div style={{
                    background: `${focusArea.color}12`,
                    borderBottom: `1px solid ${focusArea.color}20`,
                    padding: '10px var(--space-4)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: focusArea.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Set {res.setNum} · {exercise}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {res.weight} kg × {res.reps} reps
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Est. 1RM</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: focusArea.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {res.oneRM}<span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 3, fontWeight: 500 }}>kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Percentage Grid */}
                  <div style={{ padding: '10px var(--space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {res.percents.slice(1).map(p => (
                        <div key={p.label} style={{ textAlign: 'center', background: 'var(--color-surface-3)', borderRadius: 'var(--radius-md)', padding: '7px 4px' }}>
                          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>{p.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', marginTop: 2 }}>{p.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Zone Tips */}
            <div style={{ marginTop: 'var(--space-4)' }}>
              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Panduan Zona Beban</span>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ZONE_TIPS.map(zone => {
                  const Icon = zone.icon;
                  return (
                    <div key={zone.label} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '10px var(--space-4)',
                      border: `1px solid ${zone.color}20`,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `${zone.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={16} color={zone.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: zone.color, marginBottom: 2 }}>{zone.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{zone.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{zone.range}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>{zone.reps}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalyticsTab() {
  const { profil } = useStore();
  const [newWeight, setNewWeight] = useState('');

  const weightLogs = useLiveQuery(() => db.catatanBerat.orderBy('tanggal').toArray()) || [];
  const workouts   = useLiveQuery(() => db.sesiLatihan.orderBy('tanggal').toArray())   || [];

  const logWeight = async () => {
    if (!newWeight) return;
    await db.catatanBerat.add({ tanggal: new Date().toISOString().split('T')[0], berat: +newWeight });
    setNewWeight('');
  };

  // ---- Weight chart data ----
  const weightChartData = {
    labels: weightLogs.map(l => new Date(l.tanggal).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Berat (kg)',
      data: weightLogs.map(l => l.berat),
      borderColor: '#FF6B00',
      backgroundColor: 'rgba(255,107,0,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#FF6B00',
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  // ---- Weekly volume chart ----
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyLogs = useLiveQuery(() => db.catatanLatihan.toArray()) || [];
  const weeklyVolumeData = last7.map(date => {
    const dayWorkouts = workouts.filter(w => w.tanggal === date).map(w => w.id);
    const logs = weeklyLogs.filter(l => dayWorkouts.includes(l.latihanId));
    return logs.reduce((sum, l) => sum + (l.beban || 0) * (l.repetisi || 0), 0);
  });

  const volumeChartData = {
    labels: last7.map(d => new Date(d).toLocaleDateString('id-ID', { weekday: 'short' })),
    datasets: [{
      label: 'Volume (kg)',
      data: weeklyVolumeData,
      backgroundColor: last7.map((_, i) => i === 6 ? '#FF6B00' : 'rgba(255,107,0,0.3)'),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const currentWeight = weightLogs[weightLogs.length - 1]?.berat;
  const startWeight   = weightLogs[0]?.berat;
  const weightDiff    = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Analisis <span>Kemajuan</span></div>
      </div>

      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Summary Cards */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stats-grid">
            <div className="stats-card">
              <div className="stats-card__value" style={{ color: 'var(--color-primary)' }}>{currentWeight ? `${currentWeight}kg` : '—'}</div>
              <div className="stats-card__label">Berat Saat Ini</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__value" style={{ color: weightDiff > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {weightDiff ? `${weightDiff > 0 ? '+' : ''}${weightDiff}kg` : '—'}
              </div>
              <div className="stats-card__label">Total Perubahan</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__value">{workouts.length}</div>
              <div className="stats-card__label">Total Sesi Latihan</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__value">{profil.beratTarget}kg</div>
              <div className="stats-card__label">Target Berat</div>
            </div>
          </div>
        </motion.div>

        {/* Log Weight */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Catat Berat Hari Ini</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" type="number" placeholder="Masukkan berat (kg)..." value={newWeight} onChange={e => setNewWeight(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn--primary" onClick={logWeight}>Simpan</button>
            </div>
          </div>
        </motion.div>

        {/* Weight Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Tren Berat Badan</div>
            {weightLogs.length < 2 ? (
              <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                <div style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}><TrendingUp size={32} /></div>
                <div className="empty-state__desc">Catat berat badan Anda setidaknya selama 2 hari untuk melihat grafik tren.</div>
              </div>
            ) : (
              <div style={{ height: 200 }}>
                <Line data={weightChartData} options={{
                  ...chartDefaults,
                  plugins: {
                    ...chartDefaults.plugins,
                    tooltip: { ...chartDefaults.plugins.tooltip, callbacks: { label: ctx => `${ctx.parsed.y} kg` } },
                  },
                }} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Volume Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Volume Latihan Mingguan</div>
            <div style={{ height: 180 }}>
              <Bar data={volumeChartData} options={{
                ...chartDefaults,
                plugins: { ...chartDefaults.plugins, tooltip: { ...chartDefaults.plugins.tooltip, callbacks: { label: ctx => `${ctx.parsed.y.toLocaleString()} kg volume` } } },
              }} />
            </div>
          </div>
        </motion.div>

        {/* 1RM Calculator */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <OneRMCalculator />
        </motion.div>
      </div>
    </div>
  );
}
