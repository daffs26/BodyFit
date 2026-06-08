import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Timer, Check, ChevronDown, ChevronUp, Dumbbell, Utensils } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import useStore from '../store/useStore';

const MUSCLE_GROUPS = [
  { id: 'chest',     label: 'Chest',     emoji: '🫁' },
  { id: 'back',      label: 'Back',      emoji: '🏋️' },
  { id: 'legs',      label: 'Legs',      emoji: '🦵' },
  { id: 'shoulders', label: 'Shoulders', emoji: '💪' },
  { id: 'arms',      label: 'Arms',      emoji: '💪' },
  { id: 'core',      label: 'Core',      emoji: '🎯' },
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout'];

function RestTimerBadge() {
  const { restTimer, stopRestTimer } = useStore();
  if (!restTimer.isActive) return null;
  const min = Math.floor(restTimer.remaining / 60);
  const sec = restTimer.remaining % 60;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: restTimer.remaining <= 10 ? 'var(--color-danger)' : 'var(--color-primary)',
        padding: '10px var(--space-5)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Timer size={18} color="white" />
        <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>Rest: {min}:{sec.toString().padStart(2,'0')}</span>
      </div>
      <button onClick={stopRestTimer} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 12px', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
        Skip
      </button>
    </motion.div>
  );
}

function SetRow({ set, onUpdate, onDelete }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 40px', gap: 8, alignItems: 'center', padding: '6px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 700, textAlign: 'center' }}>{set.setNumber}</span>
      <input className="input" style={{ padding: '8px 10px', fontSize: 14, textAlign: 'center' }}
        type="number" placeholder="kg" value={set.weight}
        onChange={e => onUpdate({ weight: +e.target.value })}
      />
      <input className="input" style={{ padding: '8px 10px', fontSize: 14, textAlign: 'center' }}
        type="number" placeholder="reps" value={set.reps}
        onChange={e => onUpdate({ reps: +e.target.value })}
      />
      <button onClick={onDelete} style={{ background: 'var(--color-danger-pale)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <X size={14} color="var(--color-danger)" />
      </button>
    </div>
  );
}

function ExerciseBlock({ exercise, workoutId, onDelete, restTimerDuration }) {
  const { startRestTimer } = useStore();
  const logs = useLiveQuery(
    () => db.workoutLogs.where({ workoutId, exerciseName: exercise.name }).toArray(),
    [workoutId, exercise.name]
  ) || [];

  const addSet = async () => {
    await db.workoutLogs.add({
      workoutId,
      exerciseName: exercise.name,
      targetMuscle: exercise.targetMuscle,
      setNumber: logs.length + 1,
      weight: logs[logs.length - 1]?.weight || 0,
      reps: logs[logs.length - 1]?.reps || 0,
      completed: false,
    });
  };

  const updateSet = async (id, updates) => {
    await db.workoutLogs.update(id, updates);
  };

  const deleteSet = async (id) => {
    await db.workoutLogs.delete(id);
  };

  const completeSet = async (id) => {
    await db.workoutLogs.update(id, { completed: true });
    startRestTimer(restTimerDuration);
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{exercise.name}</div>
          <span className={`muscle-chip muscle-chip--${exercise.targetMuscle}`} style={{ marginTop: 4, display: 'inline-flex' }}>
            {exercise.targetMuscle}
          </span>
        </div>
        <button onClick={onDelete} className="btn btn--icon btn--ghost" style={{ color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.2)', background: 'var(--color-danger-pale)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Set headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 40px', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 700 }}>SET</span>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 700 }}>KG</span>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 700 }}>REPS</span>
        <span />
      </div>

      {logs.map(log => (
        <SetRow key={log.id} set={log}
          onUpdate={(u) => updateSet(log.id, u)}
          onDelete={() => deleteSet(log.id)}
        />
      ))}

      <button className="btn btn--ghost btn--sm btn--full" style={{ marginTop: 8 }} onClick={addSet}>
        <Plus size={14} /> Add Set
      </button>
    </div>
  );
}

// ---------- Workout Logger ----------
function WorkoutLogger() {
  const { restTimer } = useStore();
  const [selectedMuscle, setSelectedMuscle] = useState('chest');
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [restDuration, setRestDuration] = useState(90);

  const exercises = useLiveQuery(
    () => db.exercises.where('targetMuscle').equals(selectedMuscle).toArray(),
    [selectedMuscle]
  ) || [];

  const today = new Date().toISOString().split('T')[0];

  const startWorkout = async () => {
    const id = await db.workouts.add({ date: today, name: `Workout ${today}`, duration: 0, notes: '' });
    setActiveWorkoutId(id);
  };

  const finishWorkout = async () => {
    if (activeWorkoutId) {
      await db.workouts.update(activeWorkoutId, { duration: Math.round((Date.now() - performance.now()) / 60000) });
    }
    setActiveWorkoutId(null);
    setSelectedExercises([]);
  };

  const addExercise = (ex) => {
    if (!selectedExercises.find(e => e.name === ex.name)) {
      setSelectedExercises(prev => [...prev, ex]);
    }
    setShowExercisePicker(false);
  };

  const removeExercise = (name) => {
    setSelectedExercises(prev => prev.filter(e => e.name !== name));
  };

  if (!activeWorkoutId) {
    return (
      <div style={{ padding: 'var(--space-5)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div style={{ fontSize: 56, marginBottom: 'var(--space-4)' }}>🏋️</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>Ready to Train?</div>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Start a new session to log your sets, reps, and weight.</div>
          <button className="btn btn--primary btn--full btn--lg" onClick={startWorkout}>
            <Dumbbell size={20} /> Start Workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence>
        {restTimer.isActive && <RestTimerBadge />}
      </AnimatePresence>

      <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4 }}>REST TIMER</div>
            <select className="input" value={restDuration} onChange={e => setRestDuration(+e.target.value)} style={{ padding: '8px 12px', fontSize: 14 }}>
              <option value={60}>60s Rest</option>
              <option value={90}>90s Rest</option>
              <option value={120}>2min Rest</option>
              <option value={180}>3min Rest</option>
            </select>
          </div>
          <button className="btn btn--danger" style={{ marginTop: 20 }} onClick={finishWorkout}>
            Finish
          </button>
        </div>

        {/* Muscle Group Filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--space-4)', scrollbarWidth: 'none' }}>
          {MUSCLE_GROUPS.map(mg => (
            <button
              key={mg.id}
              onClick={() => setSelectedMuscle(mg.id)}
              className={`muscle-chip muscle-chip--${mg.id}`}
              style={{
                whiteSpace: 'nowrap',
                opacity: selectedMuscle === mg.id ? 1 : 0.6,
                transform: selectedMuscle === mg.id ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              {mg.emoji} {mg.label}
            </button>
          ))}
        </div>

        {/* Active Exercises */}
        {selectedExercises.map(ex => (
          <ExerciseBlock
            key={ex.name} exercise={ex}
            workoutId={activeWorkoutId}
            onDelete={() => removeExercise(ex.name)}
            restTimerDuration={restDuration}
          />
        ))}

        {/* Add Exercise Button */}
        <button className="btn btn--secondary btn--full" style={{ marginBottom: 'var(--space-3)' }} onClick={() => setShowExercisePicker(!showExercisePicker)}>
          <Plus size={16} /> Add Exercise from {MUSCLE_GROUPS.find(m => m.id === selectedMuscle)?.label}
          {showExercisePicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showExercisePicker && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {exercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => addExercise(ex)}
                style={{
                  padding: '10px var(--space-3)', textAlign: 'left', background: 'transparent',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-pale)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <span>{ex.name}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', background: 'var(--color-surface-3)', padding: '2px 8px', borderRadius: 6 }}>{ex.category}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ---------- Food Logger ----------
function FoodLogger() {
  const { getTDEE } = useStore();
  const macros = getTDEE();
  const today = new Date().toISOString().split('T')[0];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'Breakfast' });
  const [activeMeal, setActiveMeal] = useState('All');

  const foodLogs = useLiveQuery(() => db.foodLogs.where('date').equals(today).toArray(), [today]) || [];

  const totalConsumed = foodLogs.reduce((a, f) => ({
    calories: a.calories + (f.calories || 0),
    protein:  a.protein  + (f.protein  || 0),
    carbs:    a.carbs    + (f.carbs    || 0),
    fat:      a.fat      + (f.fat      || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleAdd = async () => {
    if (!form.name || !form.calories) return;
    await db.foodLogs.add({ ...form, date: today, calories: +form.calories, protein: +form.protein || 0, carbs: +form.carbs || 0, fat: +form.fat || 0 });
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'Breakfast' });
    setShowForm(false);
  };

  const filtered = activeMeal === 'All' ? foodLogs : foodLogs.filter(f => f.mealType === activeMeal);

  return (
    <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
      {/* Macro summary */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex justify-between" style={{ marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consumed Today</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)' }}>{totalConsumed.calories}<span style={{ fontSize: 16, color: 'var(--color-text-muted)', marginLeft: 4 }}>kcal</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-primary)' }}>{macros.calories}<span style={{ fontSize: 16, color: 'var(--color-text-muted)', marginLeft: 4 }}>kcal</span></div>
          </div>
        </div>
        {[
          { label: 'Protein', consumed: totalConsumed.protein, target: macros.protein, color: 'var(--color-primary)', unit: 'g' },
          { label: 'Carbs', consumed: totalConsumed.carbs, target: macros.carbs, color: 'var(--color-info)', unit: 'g' },
          { label: 'Fat', consumed: totalConsumed.fat, target: macros.fat, color: 'var(--color-warning)', unit: 'g' },
        ].map(m => (
          <div key={m.label} style={{ marginBottom: 10 }}>
            <div className="flex justify-between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-sub)', fontWeight: 600 }}>{m.label}</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{m.consumed}{m.unit} / {m.target}{m.unit}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${Math.min((m.consumed / m.target) * 100, 100)}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Meal filter */}
      <div className="tab-pills" style={{ marginBottom: 'var(--space-4)' }}>
        {['All', ...MEAL_TYPES].map(m => (
          <button key={m} className={`tab-pill ${activeMeal === m ? 'active' : ''}`} onClick={() => setActiveMeal(m)}>{m}</button>
        ))}
      </div>

      {/* Food list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🍽️</div>
            <div className="empty-state__title">No meals logged yet</div>
            <div className="empty-state__desc">Tap the button below to add your first meal</div>
          </div>
        ) : filtered.map(food => (
          <div key={food.id} className="card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{food.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>{food.calories}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>kcal</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Food Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label className="input-label">Food Name</label>
            <input className="input" placeholder="e.g. Chicken Breast" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="input-row" style={{ marginBottom: 12 }}>
            <div className="input-group">
              <label className="input-label">Calories (kcal)</label>
              <input className="input" type="number" placeholder="0" value={form.calories} onChange={e => setForm(p => ({ ...p, calories: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Meal Type</label>
              <select className="input" value={form.mealType} onChange={e => setForm(p => ({ ...p, mealType: e.target.value }))}>
                {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="input-row-3" style={{ marginBottom: 16 }}>
            {['protein','carbs','fat'].map(k => (
              <div key={k} className="input-group">
                <label className="input-label" style={{ textTransform: 'capitalize' }}>{k} (g)</label>
                <input className="input" type="number" placeholder="0" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn--primary" style={{ flex: 2 }} onClick={handleAdd}>Save Food</button>
          </div>
        </motion.div>
      )}

      <button className="btn btn--primary btn--full" onClick={() => setShowForm(!showForm)}>
        <Plus size={16} /> Log Food
      </button>
    </div>
  );
}

// ---------- Main Logger Tab ----------
export default function LoggerTab() {
  const [activeSubTab, setActiveSubTab] = useState('workout');

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Log <span>Session</span></div>
      </div>

      {/* Sub-tab toggle */}
      <div style={{ padding: 'var(--space-3) var(--space-5) 0' }}>
        <div className="tab-pills">
          <button className={`tab-pill ${activeSubTab === 'workout' ? 'active' : ''}`} onClick={() => setActiveSubTab('workout')}>
            <Dumbbell size={14} style={{ display: 'inline', marginRight: 4 }} />Workout
          </button>
          <button className={`tab-pill ${activeSubTab === 'food' ? 'active' : ''}`} onClick={() => setActiveSubTab('food')}>
            <Utensils size={14} style={{ display: 'inline', marginRight: 4 }} />Nutrition
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, x: activeSubTab === 'workout' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'workout' ? <WorkoutLogger /> : <FoodLogger />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
