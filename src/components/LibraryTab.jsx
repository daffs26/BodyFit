import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

const MUSCLE_GROUPS = [
  { id: 'all',       label: 'All',       emoji: '💪' },
  { id: 'chest',     label: 'Chest',     emoji: '🫁' },
  { id: 'back',      label: 'Back',      emoji: '🏋️' },
  { id: 'legs',      label: 'Legs',      emoji: '🦵' },
  { id: 'shoulders', label: 'Shoulders', emoji: '⚡' },
  { id: 'arms',      label: 'Arms',      emoji: '💪' },
  { id: 'core',      label: 'Core',      emoji: '🎯' },
];

const MUSCLE_TIPS = {
  chest:     'Focus on full range of motion. Keep your chest up and shoulder blades retracted throughout pressing movements.',
  back:      'Pull through your elbows, not your hands. Think about squeezing your lats together at the peak contraction.',
  legs:      'Depth matters. Keep knees tracking over toes and distribute weight evenly across your foot.',
  shoulders: 'Avoid shrugging during lateral raises. Keep a slight bend in your elbow and control the eccentric.',
  arms:      'Full extension on triceps, full curl on biceps. Control the negative for maximum time under tension.',
  core:      'Brace your core as if taking a punch. Breathe out during exertion phase for better intra-abdominal pressure.',
};

export default function LibraryTab() {
  const [activeGroup, setActiveGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEx, setNewEx] = useState({ name: '', targetMuscle: 'chest', category: 'Compound' });

  const exercises = useLiveQuery(
    () => activeGroup === 'all'
      ? db.exercises.toArray()
      : db.exercises.where('targetMuscle').equals(activeGroup).toArray(),
    [activeGroup]
  ) || [];

  const filtered = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filtered.reduce((acc, ex) => {
    const key = ex.targetMuscle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ex);
    return acc;
  }, {});

  const addCustomExercise = async () => {
    if (!newEx.name.trim()) return;
    await db.exercises.add({ ...newEx, isCustom: true });
    setNewEx({ name: '', targetMuscle: 'chest', category: 'Compound' });
    setShowAddForm(false);
  };

  const deleteExercise = async (id) => {
    await db.exercises.delete(id);
  };

  const MUSCLE_COLORS = {
    chest: '#FF6B00', back: '#3B82F6', legs: '#22C55E',
    shoulders: '#A855F7', arms: '#F59E0B', core: '#EF4444',
  };

  const MUSCLE_LABELS = {
    chest: 'Chest', back: 'Back', legs: 'Legs',
    shoulders: 'Shoulders', arms: 'Arms', core: 'Core',
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Exercise <span>Library</span></div>
        <button className="btn btn--primary btn--sm btn--icon" onClick={() => setShowAddForm(true)}>
          <Plus size={16} />
        </button>
      </div>

      <div style={{ padding: '0 var(--space-5) var(--space-3)' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
          <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 42 }}
          />
        </div>

        {/* Muscle Group Filter */}
        <div className="tab-pills" style={{ marginBottom: 'var(--space-4)' }}>
          {MUSCLE_GROUPS.map(mg => (
            <button
              key={mg.id}
              className={`tab-pill ${activeGroup === mg.id ? 'active' : ''}`}
              onClick={() => setActiveGroup(mg.id)}
            >
              {mg.emoji} {mg.label}
            </button>
          ))}
        </div>

        {/* Training tip */}
        {activeGroup !== 'all' && MUSCLE_TIPS[activeGroup] && (
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ marginBottom: 'var(--space-4)', background: 'var(--color-primary-pale)', border: '1px solid rgba(255,107,0,0.2)', padding: 'var(--space-3) var(--space-4)' }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Pro Tip</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.5 }}>{MUSCLE_TIPS[activeGroup]}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exercise List */}
        {Object.entries(grouped).map(([muscle, exList]) => (
          <div key={muscle} style={{ marginBottom: 'var(--space-5)' }}>
            {activeGroup === 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                <div style={{ height: 2, flex: 1, background: `${MUSCLE_COLORS[muscle]}30` }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: MUSCLE_COLORS[muscle],
                  textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 10px',
                  background: `${MUSCLE_COLORS[muscle]}15`, borderRadius: 'var(--radius-full)',
                  border: `1px solid ${MUSCLE_COLORS[muscle]}30`,
                }}>
                  {MUSCLE_LABELS[muscle] || muscle} · {exList.length}
                </span>
                <div style={{ height: 2, flex: 1, background: `${MUSCLE_COLORS[muscle]}30` }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {exList.map(ex => (
                <motion.div
                  key={ex.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card"
                  style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: `${MUSCLE_COLORS[ex.targetMuscle] || '#FF6B00'}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {ex.targetMuscle === 'chest' ? '🫁' : ex.targetMuscle === 'back' ? '🏋️' : ex.targetMuscle === 'legs' ? '🦵' : ex.targetMuscle === 'shoulders' ? '⚡' : ex.targetMuscle === 'arms' ? '💪' : '🎯'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 }}>{ex.name}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                        background: `${MUSCLE_COLORS[ex.targetMuscle]}20`, color: MUSCLE_COLORS[ex.targetMuscle] || 'var(--color-primary)',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>{ex.category}</span>
                      {ex.isCustom && <span className="badge badge--blue" style={{ padding: '2px 8px', fontSize: 10 }}>Custom</span>}
                    </div>
                  </div>
                  {ex.isCustom && (
                    <button
                      onClick={() => deleteExercise(ex.id)}
                      style={{ background: 'var(--color-danger-pale)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <X size={14} color="var(--color-danger)" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <div className="empty-state__title">No exercises found</div>
            <div className="empty-state__desc">Try a different search term or add a custom exercise</div>
          </div>
        )}
      </div>

      {/* Add Custom Exercise Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setShowAddForm(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="modal-sheet"
            >
              <div className="modal-handle" />
              <div className="modal-title">Add Custom Exercise</div>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Exercise Name</label>
                <input className="input" placeholder="e.g. Incline Dumbbell Fly" value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div className="input-row" style={{ marginBottom: 20 }}>
                <div className="input-group">
                  <label className="input-label">Target Muscle</label>
                  <select className="input" value={newEx.targetMuscle} onChange={e => setNewEx(p => ({ ...p, targetMuscle: e.target.value }))}>
                    {MUSCLE_GROUPS.filter(m => m.id !== 'all').map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="input" value={newEx.category} onChange={e => setNewEx(p => ({ ...p, category: e.target.value }))}>
                    <option value="Compound">Compound</option>
                    <option value="Isolation">Isolation</option>
                    <option value="Bodyweight">Bodyweight</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="btn btn--primary" style={{ flex: 2 }} onClick={addCustomExercise}>Add Exercise</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
