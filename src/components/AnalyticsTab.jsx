import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import useStore from '../store/useStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1E1E21', titleColor: '#fff', bodyColor: '#A1A1AA', borderColor: '#2A2A2E', borderWidth: 1, cornerRadius: 10 } },
  scales: {
    x: { grid: { color: '#1E1E21' }, ticks: { color: '#52525B', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } } },
    y: { grid: { color: '#1E1E21' }, ticks: { color: '#52525B', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } } },
  },
};

function OneRMCalculator() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = +weight, r = +reps;
    if (!w || !r) return;
    // Brzycki formula
    const oneRM = w / (1.0278 - 0.0278 * r);
    setResult({
      oneRM: Math.round(oneRM),
      p95: Math.round(oneRM * 0.95),
      p90: Math.round(oneRM * 0.90),
      p85: Math.round(oneRM * 0.85),
      p80: Math.round(oneRM * 0.80),
      p75: Math.round(oneRM * 0.75),
    });
  };

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>🏆 1RM Calculator</div>
      <div className="input-row" style={{ marginBottom: 'var(--space-3)' }}>
        <div className="input-group">
          <label className="input-label">Weight (kg)</label>
          <input className="input" type="number" placeholder="e.g. 80" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Reps</label>
          <input className="input" type="number" placeholder="e.g. 5" value={reps} onChange={e => setReps(e.target.value)} />
        </div>
      </div>
      <button className="btn btn--primary btn--full" onClick={calculate}>Calculate 1RM</button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated 1RM</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--color-primary)' }}>{result.oneRM}<span style={{ fontSize: 20, color: 'var(--color-text-muted)', marginLeft: 4 }}>kg</span></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['95%', result.p95], ['90%', result.p90], ['85%', result.p85], ['80%', result.p80], ['75%', result.p75]].map(([pct, val]) => (
              <div key={pct} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>{pct}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{val} kg</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AnalyticsTab() {
  const [range, setRange] = useState('1M');

  const weightLogs = useLiveQuery(() => db.weightLogs.orderBy('date').toArray()) || [];
  const workouts   = useLiveQuery(() => db.workouts.orderBy('date').toArray())   || [];
  const foodLogs   = useLiveQuery(() => db.foodLogs.orderBy('date').toArray())   || [];
  const { profile } = useStore();
  const [newWeight, setNewWeight] = useState('');

  const logWeight = async () => {
    if (!newWeight) return;
    await db.weightLogs.add({ date: new Date().toISOString().split('T')[0], weight: +newWeight });
    setNewWeight('');
  };

  // ---- Weight chart data ----
  const weightChartData = {
    labels: weightLogs.map(l => new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Weight (kg)',
      data: weightLogs.map(l => l.weight),
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

  const weeklyLogs = useLiveQuery(() => db.workoutLogs.toArray()) || [];
  const weeklyVolumeData = last7.map(date => {
    const dayWorkouts = workouts.filter(w => w.date === date).map(w => w.id);
    const logs = weeklyLogs.filter(l => dayWorkouts.includes(l.workoutId));
    return logs.reduce((sum, l) => sum + (l.weight || 0) * (l.reps || 0), 0);
  });

  const volumeChartData = {
    labels: last7.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: 'Volume (kg)',
      data: weeklyVolumeData,
      backgroundColor: last7.map((_, i) => i === 6 ? '#FF6B00' : 'rgba(255,107,0,0.3)'),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const currentWeight = weightLogs[weightLogs.length - 1]?.weight;
  const startWeight   = weightLogs[0]?.weight;
  const weightDiff    = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Progress <span>Analytics</span></div>
      </div>

      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Summary Cards */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stats-grid">
            <div className="stats-card">
              <div className="stats-card__value" style={{ color: 'var(--color-primary)' }}>{currentWeight ? `${currentWeight}kg` : '—'}</div>
              <div className="stats-card__label">Current Weight</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__value" style={{ color: weightDiff > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {weightDiff ? `${weightDiff > 0 ? '+' : ''}${weightDiff}kg` : '—'}
              </div>
              <div className="stats-card__label">Total Change</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__value">{workouts.length}</div>
              <div className="stats-card__label">Total Workouts</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__value">{profile.targetWeight}kg</div>
              <div className="stats-card__label">Target Weight</div>
            </div>
          </div>
        </motion.div>

        {/* Log Weight */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Log Today's Weight</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" type="number" placeholder="e.g. 73.5 kg" value={newWeight} onChange={e => setNewWeight(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn--primary" onClick={logWeight}>Save</button>
            </div>
          </div>
        </motion.div>

        {/* Weight Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>⚖️ Weight Trend</div>
            {weightLogs.length < 2 ? (
              <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                <div className="empty-state__icon">📊</div>
                <div className="empty-state__desc">Log at least 2 weight entries to see the trend</div>
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
            <div className="section-title" style={{ marginBottom: 16 }}>📦 Weekly Volume</div>
            <div style={{ height: 180 }}>
              <Bar data={volumeChartData} options={{
                ...chartDefaults,
                plugins: { ...chartDefaults.plugins, tooltip: { ...chartDefaults.plugins.tooltip, callbacks: { label: ctx => `${ctx.parsed.y.toLocaleString()} kg vol` } } },
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
