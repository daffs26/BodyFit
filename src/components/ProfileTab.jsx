import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Download, Upload, Trash2, Moon, Droplets, Target } from 'lucide-react';
import useStore from '../store/useStore';
import { db } from '../db/db';

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary', light: 'Lightly Active', moderate: 'Moderately Active',
  active: 'Very Active', very_active: 'Extremely Active',
};

export default function ProfileTab() {
  const { profile, setProfile, getTDEE } = useStore();
  const macros = getTDEE();
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = async () => {
    const [workouts, workoutLogs, exercises, weightLogs, foodLogs, monthlyTargets] = await Promise.all([
      db.workouts.toArray(),
      db.workoutLogs.toArray(),
      db.exercises.where('isCustom').equals(true).toArray(),
      db.weightLogs.toArray(),
      db.foodLogs.toArray(),
      db.monthlyTargets.toArray(),
    ]);

    const data = { profile, workouts, workoutLogs, exercises, weightLogs, foodLogs, monthlyTargets, exportedAt: new Date().toISOString() };
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
      if (data.workouts)      await db.workouts.bulkPut(data.workouts);
      if (data.workoutLogs)   await db.workoutLogs.bulkPut(data.workoutLogs);
      if (data.exercises)     await db.exercises.bulkPut(data.exercises);
      if (data.weightLogs)    await db.weightLogs.bulkPut(data.weightLogs);
      if (data.foodLogs)      await db.foodLogs.bulkPut(data.foodLogs);
      if (data.monthlyTargets) await db.monthlyTargets.bulkPut(data.monthlyTargets);
      alert('✅ Data restored successfully!');
    } catch {
      alert('❌ Import failed. Please use a valid BodyFit backup file.');
    }
    setImporting(false);
    e.target.value = '';
  };

  const clearAllData = async () => {
    if (!window.confirm('⚠️ Are you sure? This will delete ALL your workout and nutrition data. This cannot be undone.')) return;
    await Promise.all([
      db.workouts.clear(), db.workoutLogs.clear(), db.weightLogs.clear(),
      db.foodLogs.clear(), db.monthlyTargets.clear(),
    ]);
    alert('All data cleared.');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My <span>Profile</span></div>
      </div>

      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* Profile Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, margin: '0 auto var(--space-4)', boxShadow: 'var(--shadow-primary)',
            }}>💪</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{profile.name || 'Set Your Name'}</div>
            <div className="badge badge--orange">{profile.goalType === 'bulking' ? '📈 Bulking' : profile.goalType === 'cutting' ? '📉 Cutting' : '⚖️ Maintenance'}</div>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Target: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{macros.calories} kcal</span> · {macros.protein}g P · {macros.carbs}g C · {macros.fat}g F
            </div>
          </div>
        </motion.div>

        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>👤 Personal Info</div>

            <div className="input-group" style={{ marginBottom: 12 }}>
              <label className="input-label">Name</label>
              <input className="input" placeholder="Your name" value={profile.name} onChange={e => setProfile({ name: e.target.value })} />
            </div>

            <div className="input-row" style={{ marginBottom: 12 }}>
              <div className="input-group">
                <label className="input-label">Age</label>
                <input className="input" type="number" value={profile.age} onChange={e => setProfile({ age: +e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Gender</label>
                <select className="input" value={profile.gender} onChange={e => setProfile({ gender: e.target.value })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: 12 }}>
              <div className="input-group">
                <label className="input-label">Height (cm)</label>
                <input className="input" type="number" value={profile.height} onChange={e => setProfile({ height: +e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Weight (kg)</label>
                <input className="input" type="number" value={profile.weight} onChange={e => setProfile({ weight: +e.target.value })} />
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: 16 }}>
              <div className="input-group">
                <label className="input-label">Target Weight (kg)</label>
                <input className="input" type="number" value={profile.targetWeight} onChange={e => setProfile({ targetWeight: +e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Sleep Target (h)</label>
                <input className="input" type="number" step="0.5" value={profile.sleepTarget} onChange={e => setProfile({ sleepTarget: +e.target.value })} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Daily Water Target (ml)</label>
              <input className="input" type="number" value={profile.waterTarget} onChange={e => setProfile({ waterTarget: +e.target.value })} />
            </div>

            <button className="btn btn--primary btn--full" onClick={handleSave}>
              {saved ? '✅ Profile Saved!' : 'Save Profile'}
            </button>
          </div>
        </motion.div>

        {/* Macro Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-3)' }}>📊 Your Daily Targets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Calories', value: `${macros.calories} kcal`, sub: `BMR: ${macros.bmr} · TDEE: ${macros.tdee}`, color: 'var(--color-primary)' },
                { label: 'Protein', value: `${macros.protein}g`, sub: `${(macros.protein / profile.weight).toFixed(1)}g per kg bodyweight`, color: 'var(--color-primary)' },
                { label: 'Carbohydrates', value: `${macros.carbs}g`, sub: `~${Math.round(macros.carbs * 4)} kcal`, color: 'var(--color-info)' },
                { label: 'Fat', value: `${macros.fat}g`, sub: `~${Math.round(macros.fat * 9)} kcal`, color: 'var(--color-warning)' },
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

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>💾 Data Management</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button className="btn btn--secondary btn--full" onClick={exportData} style={{ justifyContent: 'flex-start', gap: 'var(--space-3)' }}>
                <Download size={18} color="var(--color-success)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Export Backup</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Save all your data as a JSON file</div>
                </div>
              </button>

              <label className="btn btn--secondary btn--full" style={{ justifyContent: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer' }}>
                <Upload size={18} color="var(--color-info)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{importing ? 'Importing...' : 'Import Backup'}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Restore from a backup JSON file</div>
                </div>
                <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
              </label>

              <button className="btn btn--danger btn--full" onClick={clearAllData} style={{ justifyContent: 'flex-start', gap: 'var(--space-3)', marginTop: 8 }}>
                <Trash2 size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Clear All Data</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Permanently delete all workout & nutrition data</div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>BodyFit</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>v1.0.0 · 100% Local · No Account Needed</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Your data stays on your device 🔒</div>
          </div>
        </motion.div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
