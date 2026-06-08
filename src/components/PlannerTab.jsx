import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, ChevronRight, Zap, Trophy } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import useStore from '../store/useStore';

const PROGRAMS = [
  {
    id: 'ppl',
    name: 'Push Pull Legs (PPL)',
    frequency: '6 days/week',
    description: 'High frequency split for intermediate-advanced. Each muscle group hits 2x/week.',
    schedule: [
      { day: 'Monday',    focus: 'Push (Chest, Shoulders, Triceps)', muscles: ['chest','shoulders','arms'] },
      { day: 'Tuesday',   focus: 'Pull (Back, Biceps)',              muscles: ['back','arms'] },
      { day: 'Wednesday', focus: 'Legs (Quads, Hamstrings, Calves)', muscles: ['legs'] },
      { day: 'Thursday',  focus: 'Push (Chest, Shoulders, Triceps)', muscles: ['chest','shoulders','arms'] },
      { day: 'Friday',    focus: 'Pull (Back, Biceps)',              muscles: ['back','arms'] },
      { day: 'Saturday',  focus: 'Legs (Quads, Hamstrings, Calves)', muscles: ['legs'] },
      { day: 'Sunday',    focus: '😴 Rest & Recovery',               muscles: [] },
    ],
  },
  {
    id: 'upper_lower',
    name: 'Upper / Lower Split',
    frequency: '4 days/week',
    description: 'Great balance for intermediate lifters. Hits each muscle 2x/week with adequate rest.',
    schedule: [
      { day: 'Monday',    focus: 'Upper Body (Chest, Back, Shoulders, Arms)', muscles: ['chest','back','shoulders','arms'] },
      { day: 'Tuesday',   focus: 'Lower Body (Quads, Hamstrings, Calves)',    muscles: ['legs'] },
      { day: 'Wednesday', focus: '😴 Rest',                                  muscles: [] },
      { day: 'Thursday',  focus: 'Upper Body (Hypertrophy Focus)',            muscles: ['chest','back','shoulders','arms'] },
      { day: 'Friday',    focus: 'Lower Body (Strength Focus)',               muscles: ['legs'] },
      { day: 'Saturday',  focus: 'Core & Active Recovery',                   muscles: ['core'] },
      { day: 'Sunday',    focus: '😴 Rest & Recovery',                       muscles: [] },
    ],
  },
  {
    id: 'full_body',
    name: 'Full Body 3x/Week',
    frequency: '3 days/week',
    description: 'Ideal for beginners or busy schedule. All muscle groups trained each session.',
    schedule: [
      { day: 'Monday',    focus: 'Full Body (All Muscle Groups)',  muscles: ['chest','back','legs','shoulders','arms','core'] },
      { day: 'Tuesday',   focus: '😴 Rest',                       muscles: [] },
      { day: 'Wednesday', focus: 'Full Body (All Muscle Groups)',  muscles: ['chest','back','legs','shoulders','arms','core'] },
      { day: 'Thursday',  focus: '😴 Rest',                       muscles: [] },
      { day: 'Friday',    focus: 'Full Body (All Muscle Groups)',  muscles: ['chest','back','legs','shoulders','arms','core'] },
      { day: 'Saturday',  focus: 'Cardio / Active Recovery',      muscles: [] },
      { day: 'Sunday',    focus: '😴 Rest & Recovery',            muscles: [] },
    ],
  },
  {
    id: 'bro_split',
    name: 'Classic Bro Split',
    frequency: '5 days/week',
    description: 'Each muscle group gets its own dedicated day. Popular for isolation and volume.',
    schedule: [
      { day: 'Monday',    focus: 'Chest Day',              muscles: ['chest'] },
      { day: 'Tuesday',   focus: 'Back Day',               muscles: ['back'] },
      { day: 'Wednesday', focus: 'Shoulders Day',          muscles: ['shoulders'] },
      { day: 'Thursday',  focus: 'Arms Day (Bi & Tri)',    muscles: ['arms'] },
      { day: 'Friday',    focus: 'Legs Day',               muscles: ['legs'] },
      { day: 'Saturday',  focus: 'Core & Cardio',          muscles: ['core'] },
      { day: 'Sunday',    focus: '😴 Rest & Recovery',     muscles: [] },
    ],
  },
];

const MUSCLE_COLORS = {
  chest: '#FF6B00', back: '#3B82F6', legs: '#22C55E',
  shoulders: '#A855F7', arms: '#F59E0B', core: '#EF4444',
};

function TDEECard() {
  const { profile, getTDEE } = useStore();
  const macros = getTDEE();

  return (
    <div className="card card--orange" style={{ borderRadius: 'var(--radius-2xl)' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
          {profile.goalType === 'bulking' ? '📈 Bulking Target' : profile.goalType === 'cutting' ? '📉 Cutting Target' : '⚖️ Maintenance'}
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, color: 'white', lineHeight: 1 }}>
          {macros.calories}<span style={{ fontSize: 18, fontWeight: 600, marginLeft: 4, color: 'rgba(255,255,255,0.8)' }}>kcal</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          TDEE: {macros.tdee} kcal · BMR: {macros.bmr} kcal
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Protein', value: `${macros.protein}g`, desc: `~${Math.round(macros.protein*4)} kcal` },
          { label: 'Carbs',   value: `${macros.carbs}g`,   desc: `~${Math.round(macros.carbs*4)} kcal` },
          { label: 'Fat',     value: `${macros.fat}g`,     desc: `~${Math.round(macros.fat*9)} kcal` },
        ].map(m => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{m.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlannerTab() {
  const { profile, setProfile } = useStore();
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showProgramDetail, setShowProgramDetail] = useState(null);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyTargets = useLiveQuery(() => db.monthlyTargets.where('monthYear').equals(thisMonth).toArray(), [thisMonth]) || [];
  const currentTarget = monthlyTargets[0];

  const saveTarget = async (updates) => {
    if (currentTarget) {
      await db.monthlyTargets.update(currentTarget.id, updates);
    } else {
      await db.monthlyTargets.add({ monthYear: thisMonth, ...updates });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Training <span>Planner</span></div>
      </div>

      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* TDEE Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <TDEECard />
        </motion.div>

        {/* Goal Settings */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>🎯 Monthly Goal</div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label className="input-label">Current Goal</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { id: 'cutting', label: '📉 Cutting', desc: '-400 kcal' },
                  { id: 'maintain', label: '⚖️ Maintain', desc: 'TDEE' },
                  { id: 'bulking', label: '📈 Bulking', desc: '+400 kcal' },
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => setProfile({ goalType: g.id })}
                    style={{
                      padding: '12px 8px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      background: profile.goalType === g.id ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                      border: `2px solid ${profile.goalType === g.id ? 'var(--color-primary)' : 'transparent'}`,
                      color: profile.goalType === g.id ? 'var(--color-primary)' : 'var(--color-text-sub)',
                      textAlign: 'center', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{g.label}</div>
                    <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Target Weight (kg)</label>
                <input className="input" type="number" value={profile.targetWeight || ''} onChange={e => setProfile({ targetWeight: +e.target.value })} placeholder="65" />
              </div>
              <div className="input-group">
                <label className="input-label">Workouts/Week</label>
                <select className="input" value={profile.workoutsPerWeek} onChange={e => setProfile({ workoutsPerWeek: +e.target.value })}>
                  {[3,4,5,6].map(n => <option key={n} value={n}>{n}x per week</option>)}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Level */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-3)' }}>🏃 Activity Level</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                { id: 'light', label: 'Lightly Active', desc: 'Exercise 1-3 days/week' },
                { id: 'moderate', label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
                { id: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
                { id: 'very_active', label: 'Extremely Active', desc: 'Athlete / 2x training per day' },
              ].map(a => (
                <button key={a.id} onClick={() => setProfile({ activityLevel: a.id })} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px var(--space-3)', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  background: profile.activityLevel === a.id ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                  border: `1px solid ${profile.activityLevel === a.id ? 'var(--color-primary)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: profile.activityLevel === a.id ? 'var(--color-primary)' : 'var(--color-text)' }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a.desc}</div>
                  </div>
                  {profile.activityLevel === a.id && <div style={{ color: 'var(--color-primary)', fontSize: 18 }}>✓</div>}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Training Programs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="section-title" style={{ marginBottom: 'var(--space-3)' }}>📅 Training Programs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {PROGRAMS.map(prog => (
              <div key={prog.id}>
                <div
                  className="card"
                  style={{
                    cursor: 'pointer',
                    border: `1px solid ${selectedProgram === prog.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selectedProgram === prog.id ? 'var(--color-primary-pale)' : 'var(--color-surface)',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    setSelectedProgram(prog.id === selectedProgram ? null : prog.id);
                    setShowProgramDetail(prog.id === showProgramDetail ? null : prog.id);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: selectedProgram === prog.id ? 'var(--color-primary)' : 'var(--color-text)', marginBottom: 3 }}>{prog.name}</div>
                      <span className="badge badge--orange">{prog.frequency}</span>
                    </div>
                    <div style={{ fontSize: 20, color: 'var(--color-text-muted)' }}>
                      {showProgramDetail === prog.id ? '▲' : '▼'}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>{prog.description}</div>
                </div>

                {showProgramDetail === prog.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 4 }}>
                    <div className="card" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
                      {prog.schedule.map((day, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                          padding: '10px var(--space-2)', borderBottom: i < prog.schedule.length - 1 ? '1px solid var(--color-border)' : 'none',
                        }}>
                          <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0 }}>{day.day.slice(0, 3).toUpperCase()}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{day.focus}</div>
                            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                              {day.muscles.map(m => (
                                <span key={m} style={{
                                  fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                                  background: `${MUSCLE_COLORS[m]}20`, color: MUSCLE_COLORS[m], textTransform: 'uppercase',
                                }}>{m}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
