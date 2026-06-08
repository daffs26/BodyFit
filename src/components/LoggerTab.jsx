import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Timer, ChevronDown, ChevronUp, Dumbbell, Utensils, Target } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import useStore from '../store/useStore';
import PlannerTab from './PlannerTab';

const MUSCLE_GROUPS = [
  { id: 'dada',     label: 'Dada' },
  { id: 'punggung',  label: 'Punggung' },
  { id: 'kaki',      label: 'Kaki' },
  { id: 'bahu',     label: 'Bahu' },
  { id: 'lengan',      label: 'Lengan' },
  { id: 'perut',      label: 'Perut' },
];

const MUSCLE_MAP = {
  dada: 'chest',
  punggung: 'back',
  kaki: 'legs',
  bahu: 'shoulders',
  lengan: 'arms',
  perut: 'core',
};

const MEAL_TYPES = ['Sarapan', 'Makan Siang', 'Makan Malam', 'Cemilan', 'Pra-Latihan', 'Pasca-Latihan'];

function RestTimerBadge() {
  const { timerIstirahat, hentikanTimerIstirahat } = useStore();
  if (!timerIstirahat.aktif) return null;
  const min = Math.floor(timerIstirahat.sisa / 60);
  const sec = timerIstirahat.sisa % 60;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: timerIstirahat.sisa <= 10 ? 'var(--color-danger)' : 'var(--color-primary)',
        padding: '9px var(--space-5)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Timer size={16} color="white" />
        <span style={{ color: 'white', fontSize: 14, fontWeight: 700, letterSpacing: '0.01em' }}>
          Istirahat: {min}:{sec.toString().padStart(2,'0')}
        </span>
      </div>
      <button onClick={hentikanTimerIstirahat} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 12px', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', letterSpacing: '0.01em' }}>
        Lewati
      </button>
    </motion.div>
  );
}

function SetRow({ set, onUpdate, onDelete }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: 6, alignItems: 'center', padding: '5px 0' }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700, textAlign: 'center' }}>{set.nomorSet}</span>
      <input className="input" style={{ padding: '7px 8px', fontSize: 13, textAlign: 'center' }}
        type="number" placeholder="kg" value={set.beban}
        onChange={e => onUpdate({ beban: +e.target.value })}
      />
      <input className="input" style={{ padding: '7px 8px', fontSize: 13, textAlign: 'center' }}
        type="number" placeholder="reps" value={set.repetisi}
        onChange={e => onUpdate({ repetisi: +e.target.value })}
      />
      <button onClick={onDelete} style={{ background: 'var(--color-danger-pale)', border: 'none', borderRadius: 7, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <X size={13} color="var(--color-danger)" />
      </button>
    </div>
  );
}

function ExerciseBlock({ exercise, workoutId, onDelete, restTimerDuration }) {
  const logs = useLiveQuery(
    () => db.catatanLatihan.where({ latihanId: workoutId, namaLatihan: exercise.nama }).toArray(),
    [workoutId, exercise.nama]
  ) || [];

  const addSet = async () => {
    await db.catatanLatihan.add({
      latihanId: workoutId,
      namaLatihan: exercise.nama,
      ototTarget: exercise.ototTarget,
      nomorSet: logs.length + 1,
      beban: logs[logs.length - 1]?.beban || 0,
      repetisi: logs[logs.length - 1]?.repetisi || 0,
      selesai: false,
    });
  };

  const updateSet = async (id, updates) => {
    await db.catatanLatihan.update(id, updates);
  };

  const deleteSet = async (id) => {
    await db.catatanLatihan.delete(id);
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.005em' }}>{exercise.nama}</div>
          <span className={`muscle-chip muscle-chip--${MUSCLE_MAP[exercise.ototTarget] || exercise.ototTarget}`} style={{ marginTop: 5, display: 'inline-flex' }}>
            {capitalize(exercise.ototTarget)}
          </span>
        </div>
        <button onClick={onDelete} className="btn btn--icon btn--ghost" style={{ color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.2)', background: 'var(--color-danger-pale)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Set headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: 6, marginBottom: 3 }}>
        <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Set</span>
        <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>kg</span>
        <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rep</span>
        <span />
      </div>

      {logs.map(log => (
        <SetRow key={log.id} set={log}
          onUpdate={(u) => updateSet(log.id, u)}
          onDelete={() => deleteSet(log.id)}
        />
      ))}

      <button className="btn btn--ghost btn--sm btn--full" style={{ marginTop: 8 }} onClick={addSet}>
        <Plus size={14} /> Tambah Set
      </button>
    </div>
  );
}

// ---------- Workout Logger ----------
function WorkoutLogger() {
  const { timerIstirahat } = useStore();
  const [selectedMuscle, setSelectedMuscle] = useState('dada');
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [restDuration, setRestDuration] = useState(90);

  const exercises = useLiveQuery(
    () => db.kamusLatihan.where('ototTarget').equals(selectedMuscle).toArray(),
    [selectedMuscle]
  ) || [];

  const today = new Date().toISOString().split('T')[0];

  const startWorkout = async () => {
    const id = await db.sesiLatihan.add({ tanggal: today, nama: `Latihan ${today}`, durasi: 0, catatan: '' });
    setActiveWorkoutId(id);
  };

  const finishWorkout = async () => {
    if (activeWorkoutId) {
      await db.sesiLatihan.update(activeWorkoutId, { durasi: Math.round((Date.now() - performance.now()) / 60000) });
    }
    setActiveWorkoutId(null);
    setSelectedExercises([]);
  };

  const addExercise = (ex) => {
    if (!selectedExercises.find(e => e.nama === ex.nama)) {
      setSelectedExercises(prev => [...prev, ex]);
    }
    setShowExercisePicker(false);
  };

  const removeExercise = (nama) => {
    setSelectedExercises(prev => prev.filter(e => e.nama !== nama));
  };

  if (!activeWorkoutId) {
    return (
      <div style={{ padding: 'var(--space-5)' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', background: 'var(--color-primary-pale)', color: 'var(--color-primary)', margin: '0 auto var(--space-4)' }}><Dumbbell size={28} /></div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.01em' }}>Siap untuk berlatih?</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>Mulai sesi latihan baru untuk mencatat set dan repetisi Anda.</div>
          <button className="btn btn--primary btn--full btn--lg" onClick={startWorkout}>
            <Dumbbell size={18} /> Mulai Sesi Latihan
          </button>
        </div>
      </div>
    );
  }

  const selectedMuscleLabel = selectedMuscle.charAt(0).toUpperCase() + selectedMuscle.slice(1);

  return (
    <div>
      <AnimatePresence>
        {timerIstirahat.aktif && <RestTimerBadge />}
      </AnimatePresence>

      <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4 }}>Timer Istirahat</div>
            <select className="input" value={restDuration} onChange={e => setRestDuration(+e.target.value)} style={{ padding: '8px 12px', fontSize: 14 }}>
              <option value={60}>Istirahat 60d</option>
              <option value={90}>Istirahat 90d</option>
              <option value={120}>Istirahat 2mnt</option>
              <option value={180}>Istirahat 3mnt</option>
            </select>
          </div>
          <button className="btn btn--danger" style={{ marginTop: 20 }} onClick={finishWorkout}>
            Selesai
          </button>
        </div>

        {/* Muscle Group Filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--space-4)', scrollbarWidth: 'none' }}>
          {MUSCLE_GROUPS.map(mg => (
            <button
              key={mg.id}
              onClick={() => setSelectedMuscle(mg.id)}
              className={`muscle-chip muscle-chip--${MUSCLE_MAP[mg.id] || mg.id}`}
              style={{
                whiteSpace: 'nowrap',
                opacity: selectedMuscle === mg.id ? 1 : 0.6,
                transform: selectedMuscle === mg.id ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              {mg.label}
            </button>
          ))}
        </div>

        {/* Active Exercises */}
        {selectedExercises.map(ex => (
          <ExerciseBlock
            key={ex.nama} exercise={ex}
            workoutId={activeWorkoutId}
            onDelete={() => removeExercise(ex.nama)}
            restTimerDuration={restDuration}
          />
        ))}

        {/* Add Exercise Button */}
        <button className="btn btn--secondary btn--full" style={{ marginBottom: 'var(--space-3)' }} onClick={() => setShowExercisePicker(!showExercisePicker)}>
          <Plus size={16} /> Tambah Latihan dari: {selectedMuscleLabel}
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
                <span>{ex.nama}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', background: 'var(--color-surface-3)', padding: '2px 8px', borderRadius: 6 }}>{ex.kategori}</span>
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
  const { hitungTDEE } = useStore();
  const macros = hitungTDEE();
  const today = new Date().toISOString().split('T')[0];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama: '', kalori: '', protein: '', karbohidrat: '', lemak: '', jenisMakan: 'Sarapan' });
  const [activeMeal, setActiveMeal] = useState('Semua');

  const foodLogs = useLiveQuery(() => db.catatanMakanan.where('tanggal').equals(today).toArray(), [today]) || [];

  const totalConsumed = foodLogs.reduce((a, f) => ({
    kalori: a.kalori + (f.kalori || 0),
    protein:  a.protein  + (f.protein  || 0),
    karbohidrat:    a.karbohidrat    + (f.karbohidrat    || 0),
    lemak:      a.lemak      + (f.lemak      || 0),
  }), { kalori: 0, protein: 0, karbohidrat: 0, lemak: 0 });

  const handleAdd = async () => {
    if (!form.nama || !form.kalori) return;
    await db.catatanMakanan.add({
      ...form,
      tanggal: today,
      kalori: +form.kalori,
      protein: +form.protein || 0,
      karbohidrat: +form.karbohidrat || 0,
      lemak: +form.lemak || 0
    });
    setForm({ nama: '', kalori: '', protein: '', karbohidrat: '', lemak: '', jenisMakan: 'Sarapan' });
    setShowForm(false);
  };

  const filtered = activeMeal === 'Semua' ? foodLogs : foodLogs.filter(f => f.jenisMakan === activeMeal);

  return (
    <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
      {/* Macro summary */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex justify-between" style={{ marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Konsumsi Hari Ini</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{totalConsumed.kalori}<span style={{ fontSize: 13, color: 'var(--color-text-muted)', marginLeft: 4, fontWeight: 500, letterSpacing: 0 }}>kkal</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Target</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{macros.kalori}<span style={{ fontSize: 13, color: 'var(--color-text-muted)', marginLeft: 4, fontWeight: 500, letterSpacing: 0 }}>kkal</span></div>
          </div>
        </div>
        {[
          { label: 'Protein', consumed: totalConsumed.protein, target: macros.protein, color: 'var(--color-primary)', unit: 'g' },
          { label: 'Karbohidrat', consumed: totalConsumed.karbohidrat, target: macros.karbohidrat, color: 'var(--color-info)', unit: 'g' },
          { label: 'Lemak', consumed: totalConsumed.lemak, target: macros.lemak, color: 'var(--color-warning)', unit: 'g' },
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
      <div className="tab-pills" style={{ marginBottom: 'var(--space-4)', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
        {['Semua', ...MEAL_TYPES].map(m => {
          return (
            <button key={m} className={`tab-pill ${activeMeal === m ? 'active' : ''}`} onClick={() => setActiveMeal(m)}>{m}</button>
          );
        })}
      </div>

      {/* Food list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ color: 'var(--color-text-muted)', marginBottom: 6 }}><Utensils size={28} /></div>
            <div className="empty-state__title">Belum ada makanan</div>
            <div className="empty-state__desc">Catat makanan yang Anda konsumsi hari ini.</div>
          </div>
        ) : filtered.map(food => (
          <div key={food.id} className="card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.005em' }}>{food.nama}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                P: {food.protein}g · K: {food.karbohidrat}g · L: {food.lemak}g
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{food.kalori}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>kkal</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Food Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label className="input-label">Nama Makanan</label>
            <input className="input" placeholder="Masukkan nama makanan..." value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} />
          </div>
          <div className="input-row" style={{ marginBottom: 12 }}>
            <div className="input-group">
              <label className="input-label">Kalori (kkal)</label>
              <input className="input" type="number" placeholder="0" value={form.kalori} onChange={e => setForm(p => ({ ...p, kalori: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Waktu Makan</label>
              <select className="input" value={form.jenisMakan} onChange={e => setForm(p => ({ ...p, jenisMakan: e.target.value }))}>
                {MEAL_TYPES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="input-row-3" style={{ marginBottom: 16 }}>
            {[
              { key: 'protein', label: 'Protein' },
              { key: 'karbohidrat', label: 'Karbohidrat' },
              { key: 'lemak', label: 'Lemak' }
            ].map(item => (
              <div key={item.key} className="input-group">
                <label className="input-label">{item.label} (g)</label>
                <input className="input" type="number" placeholder="0" value={form[item.key]} onChange={e => setForm(p => ({ ...p, [item.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Batal</button>
            <button className="btn btn--primary" style={{ flex: 2 }} onClick={handleAdd}>Simpan Makanan</button>
          </div>
        </motion.div>
      )}

      <button className="btn btn--primary btn--full" onClick={() => setShowForm(!showForm)}>
        <Plus size={16} /> Catat Makanan
      </button>
    </div>
  );
}

// ---------- Main Logger Tab ----------
export default function LoggerTab() {
  const [activeSubTab, setActiveSubTab] = useState('workout');

  const getHeaderTitle = () => {
    if (activeSubTab === 'workout') return <>Catat <span>Latihan</span></>;
    if (activeSubTab === 'food') return <>Catat <span>Nutrisi</span></>;
    if (activeSubTab === 'planner') return <>Rencana <span>Latihan</span></>;
    return <>Catat <span>Aktivitas</span></>;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">{getHeaderTitle()}</div>
      </div>

      {/* Sub-tab toggle */}
      <div style={{ padding: 'var(--space-3) var(--space-5) 0' }}>
        <div className="tab-pills">
          <button className={`tab-pill ${activeSubTab === 'workout' ? 'active' : ''}`} onClick={() => setActiveSubTab('workout')}>
            <Dumbbell size={14} style={{ display: 'inline', marginRight: 4 }} />Latihan
          </button>
          <button className={`tab-pill ${activeSubTab === 'food' ? 'active' : ''}`} onClick={() => setActiveSubTab('food')}>
            <Utensils size={14} style={{ display: 'inline', marginRight: 4 }} />Nutrisi
          </button>
          <button className={`tab-pill ${activeSubTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveSubTab('planner')}>
            <Target size={14} style={{ display: 'inline', marginRight: 4 }} />Rencana
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
        >
          {activeSubTab === 'workout' ? (
            <WorkoutLogger />
          ) : activeSubTab === 'food' ? (
            <FoodLogger />
          ) : (
            <PlannerTab />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
