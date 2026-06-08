import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplets, Moon, Dumbbell, TrendingUp, ChevronRight, Plus, Zap } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import useStore from '../store/useStore';

const MOTIVATIONAL_QUOTES = [
  "Push yourself, because no one else is going to do it for you.",
  "The only bad workout is the one that didn't happen.",
  "Sweat today, shine tomorrow.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Don't wish for it. Work for it.",
  "Champions aren't born. They're built.",
  "One more rep. One more set. One more day.",
  "Pain is temporary. Pride is forever.",
  "Be stronger than your excuses.",
  "Every workout is progress.",
];

const DAILY_SCHEDULE = [
  { time: '05:30', label: 'Wake Up',       icon: '⏰', color: '#FF6B00' },
  { time: '06:00', label: 'Breakfast',     icon: '🍳', color: '#22C55E' },
  { time: '07:00', label: 'Gym Session',   icon: '🏋️', color: '#FF6B00' },
  { time: '09:00', label: 'Post-Workout Meal', icon: '🥗', color: '#22C55E' },
  { time: '12:30', label: 'Lunch',         icon: '🍱', color: '#22C55E' },
  { time: '15:00', label: 'Snack / Rest',  icon: '🍎', color: '#F59E0B' },
  { time: '18:30', label: 'Dinner',        icon: '🍽️', color: '#22C55E' },
  { time: '22:00', label: 'Sleep',         icon: '🌙', color: '#3B82F6' },
];

function StreakCard({ streak }) {
  return (
    <div className="card card--orange" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-5)' }}>
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
            Current Streak
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{streak}</span>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>days</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Keep it up! 🔥</div>
        </div>
        <div style={{ fontSize: 56, opacity: 0.9 }}>🔥</div>
      </div>
    </div>
  );
}

function MacroRing({ label, current, target, color }) {
  const pct = Math.min((current / target) * 100, 100);
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
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
          justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--color-text)',
        }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{current}g</div>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

export default function DashboardTab() {
  const { profile, getTDEE, setActiveTab } = useStore();
  const macros = getTDEE();
  const today = new Date().toISOString().split('T')[0];
  const quote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const todayFoods = useLiveQuery(
    () => db.foodLogs.where('date').equals(today).toArray(),
    [today]
  ) || [];

  const todayWorkouts = useLiveQuery(
    () => db.workouts.where('date').equals(today).toArray(),
    [today]
  ) || [];

  const allWorkouts = useLiveQuery(() => db.workouts.toArray()) || [];

  // Hitung streak
  const streak = React.useMemo(() => {
    if (allWorkouts.length === 0) return 0;
    const dates = [...new Set(allWorkouts.map(w => w.date))].sort().reverse();
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
      calories: acc.calories + (f.calories || 0),
      protein:  acc.protein  + (f.protein  || 0),
      carbs:    acc.carbs    + (f.carbs    || 0),
      fat:      acc.fat      + (f.fat      || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriesLeft = macros.calories - consumed.calories;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ background: 'var(--color-bg)' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>{dayName}, {dateStr}</div>
          <div className="page-title">
            Hey, <span>{profile.name || 'Champ'} 👋</span>
          </div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, boxShadow: 'var(--shadow-primary)',
        }}>
          💪
        </div>
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
              <span className="section-title">Today's Nutrition</span>
              <span className="badge badge--orange">
                {profile.goalType === 'bulking' ? '📈 Bulking' : profile.goalType === 'cutting' ? '📉 Cutting' : '⚖️ Maintain'}
              </span>
            </div>

            {/* Kalori */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-sub)', fontWeight: 600 }}>Calories</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{consumed.calories}</span> / {macros.calories} kcal
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${Math.min((consumed.calories / macros.calories) * 100, 100)}%` }}
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
                {caloriesLeft > 0 ? `${caloriesLeft} kcal remaining` : `${Math.abs(caloriesLeft)} kcal over target`}
              </div>
            </div>

            {/* Macros */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <MacroRing label="Protein"   current={consumed.protein}  target={macros.protein}  color="var(--color-primary)" />
              <MacroRing label="Carbs"     current={consumed.carbs}    target={macros.carbs}    color="var(--color-info)" />
              <MacroRing label="Fat"       current={consumed.fat}      target={macros.fat}      color="var(--color-warning)" />
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
              <div className="stats-card__label">Workouts Today</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__icon" style={{ background: 'var(--color-success-pale)' }}>
                <Droplets size={18} color="var(--color-success)" />
              </div>
              <div className="stats-card__value">
                {((profile.waterTarget || 2500) / 1000).toFixed(1)}L
              </div>
              <div className="stats-card__label">Water Target</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__icon" style={{ background: 'var(--color-info-pale)' }}>
                <Moon size={18} color="var(--color-info)" />
              </div>
              <div className="stats-card__value">{profile.sleepTarget}h</div>
              <div className="stats-card__label">Sleep Target</div>
            </div>
            <div className="stats-card">
              <div className="stats-card__icon" style={{ background: 'var(--color-warning-pale)' }}>
                <TrendingUp size={18} color="var(--color-warning)" />
              </div>
              <div className="stats-card__value">{allWorkouts.length}</div>
              <div className="stats-card__label">Total Sessions</div>
            </div>
          </div>
        </motion.div>

        {/* Daily Schedule */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card">
            <div className="section-header">
              <span className="section-title">Daily Schedule</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {DAILY_SCHEDULE.map((item, i) => {
                const now = new Date();
                const [h, m] = item.time.split(':').map(Number);
                const itemDate = new Date(); itemDate.setHours(h, m, 0, 0);
                const isPast = now > itemDate;
                const isCurrent = i < DAILY_SCHEDULE.length - 1
                  ? (() => { const [nh, nm] = DAILY_SCHEDULE[i+1].time.split(':').map(Number); const next = new Date(); next.setHours(nh, nm, 0, 0); return now >= itemDate && now < next; })()
                  : false;

                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: '10px var(--space-3)',
                    borderRadius: 'var(--radius-lg)',
                    background: isCurrent ? 'var(--color-primary-pale)' : 'transparent',
                    border: isCurrent ? '1px solid rgba(255,107,0,0.2)' : '1px solid transparent',
                  }}>
                    <div style={{
                      width: 40, textAlign: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: isCurrent ? 'var(--color-primary)' : isPast ? 'var(--color-text-muted)' : 'var(--color-text-sub)',
                    }}>{item.time}</div>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isPast ? 'var(--color-surface-3)' : `${item.color}20`,
                      fontSize: 18,
                      opacity: isPast && !isCurrent ? 0.5 : 1,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{
                      flex: 1, fontSize: 14, fontWeight: isCurrent ? 700 : 500,
                      color: isPast && !isCurrent ? 'var(--color-text-muted)' : 'var(--color-text)',
                    }}>{item.label}</div>
                    {isCurrent && (
                      <span className="badge badge--orange" style={{ fontSize: 10 }}>NOW</span>
                    )}
                    {isPast && !isCurrent && (
                      <span style={{ color: 'var(--color-success)', fontSize: 16 }}>✓</span>
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
              <div style={{ fontSize: 28, lineHeight: 1 }}>💬</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Daily Motivation
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-text-sub)', lineHeight: 1.6, fontStyle: 'italic' }}>
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
            onClick={() => setActiveTab('logger')}
          >
            <Plus size={20} />
            Start Today's Workout
          </button>
        </motion.div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
