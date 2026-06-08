import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, ArrowLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

const MUSCLE_GROUPS = [
  { id: 'all',       label: 'Semua',     icon: null },
  { id: 'dada',     label: 'Dada',     icon: '/images/dada.png' },
  { id: 'punggung',  label: 'Punggung',  icon: '/images/punggung.png' },
  { id: 'kaki',      label: 'Kaki',      icon: '/images/kaki.png' },
  { id: 'bahu',     label: 'Bahu',     icon: '/images/bahu.png' },
  { id: 'lengan',    label: 'Lengan',    icon: '/images/lengan.png' },
  { id: 'perut',     label: 'Perut',     icon: '/images/perut.png' },
];

const MUSCLE_TIPS = {
  dada:     'Fokus pada rentang gerak penuh (full range of motion). Busungkan dada dan tarik belikat ke belakang selama melakukan gerakan press.',
  punggung:  'Tarik beban menggunakan siku Anda, bukan telapak tangan Anda. Fokuskan untuk meremas otot punggung di puncak kontraksi.',
  kaki:      'Kedalaman squat sangat penting. Pastikan lutut searah dengan ujung kaki dan distribusikan beban merata di seluruh telapak kaki.',
  bahu:     'Hindari mengangkat bahu (shrugging) saat lateral raise. Jaga sedikit tekukan di siku dan kendalikan gerakan saat menurunkan beban.',
  lengan:    'Ekstensi penuh pada trisep, kontraksi penuh pada bisep. Kendalikan gerakan negatif untuk durasi tegangan otot yang maksimal.',
  perut:     'Kencangkan otot perut Anda seolah-olah akan menerima pukulan. Embuskan napas saat mengerahkan tenaga untuk tekanan intra-abdomen yang lebih baik.',
};

const MAP_ALAT_GAMBAR = {
  'Barbel': '/images/barbel.png',
  'Dumbel': '/images/dumbel.png',
  'Mesin Kabel': '/images/mesin_kabel.png',
  'Mesin Kaki': '/images/mesin_kaki.png',
  'Beban Tubuh': '/images/beban_tubuh.png',
};

export default function LibraryTab() {
  const [activeGroup, setActiveGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [latihanTerpilih, setLatihanTerpilih] = useState(null);
  const [lastSelected, setLastSelected] = useState(null);
  const [newEx, setNewEx] = useState({
    nama: '',
    ototTarget: 'dada',
    kategori: 'Komposit',
    alat: 'Barbel',
    instruksi: ''
  });

  const pilihLatihan = (ex) => {
    setLatihanTerpilih(ex);
    if (ex) {
      setLastSelected(ex);
    }
  };

  const exercises = useLiveQuery(
    () => activeGroup === 'all'
      ? db.kamusLatihan.toArray()
      : db.kamusLatihan.where('ototTarget').equals(activeGroup).toArray(),
    [activeGroup]
  ) || [];

  const filtered = exercises.filter(ex =>
    ex.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filtered.reduce((acc, ex) => {
    const key = ex.ototTarget;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ex);
    return acc;
  }, {});

  const addCustomExercise = async () => {
    if (!newEx.nama.trim()) return;
    const instruksiArray = newEx.instruksi
      ? newEx.instruksi.split('\n').map(line => line.trim()).filter(Boolean)
      : ['Lakukan latihan sesuai kemampuan Anda.'];
    
    await db.kamusLatihan.add({
      nama: newEx.nama.trim(),
      ototTarget: newEx.ototTarget,
      kategori: newEx.kategori,
      alat: newEx.alat,
      instruksi: instruksiArray,
      kustom: true
    });
    
    setNewEx({ nama: '', ototTarget: 'dada', kategori: 'Komposit', alat: 'Barbel', instruksi: '' });
    setShowAddForm(false);
  };

  const deleteExercise = async (id) => {
    await db.kamusLatihan.delete(id);
    // If the currently viewed exercise is deleted, close the details
    if (latihanTerpilih && latihanTerpilih.id === id) {
      pilihLatihan(null);
    }
  };

  const dapatkanGambarAlat = (alat) => {
    return MAP_ALAT_GAMBAR[alat] || '/images/beban_tubuh.png';
  };

  const MUSCLE_COLORS = {
    dada: '#FF6B00', punggung: '#3B82F6', kaki: '#22C55E',
    bahu: '#A855F7', lengan: '#F59E0B', perut: '#EF4444',
  };

  const MUSCLE_LABELS = {
    dada: 'Dada', punggung: 'Punggung', kaki: 'Kaki',
    bahu: 'Bahu', lengan: 'Lengan', perut: 'Perut',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <AnimatePresence mode="wait">
        {!latihanTerpilih ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
          >
            <div className="page-header">
              <div className="page-title">Kamus <span>Latihan</span></div>
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
                  placeholder="Cari gerakan latihan..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 42 }}
                />
              </div>

              {/* Muscle Group Filter */}
              <div className="tab-pills" style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                {MUSCLE_GROUPS.map(mg => (
                  <button
                    key={mg.id}
                    className={`tab-pill ${activeGroup === mg.id ? 'active' : ''}`}
                    onClick={() => setActiveGroup(mg.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                  >
                    {mg.icon && (
                      <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={mg.icon} alt={mg.label} className="premium-icon" />
                      </div>
                    )}
                    <span>{mg.label}</span>
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
                    <span style={{ fontSize: 16 }}>💡</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Tips Pro</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-sub)', lineHeight: 1.6 }}>{MUSCLE_TIPS[activeGroup]}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Exercise List */}
              {Object.entries(grouped).map(([muscle, exList]) => (
                <div key={muscle} style={{ marginBottom: 'var(--space-5)' }}>
                  {activeGroup === 'all' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                      <div style={{ height: 1, flex: 1, background: `${MUSCLE_COLORS[muscle]}25` }} />
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: MUSCLE_COLORS[muscle],
                        textTransform: 'uppercase', letterSpacing: '0.07em', padding: '2px 10px',
                        background: `${MUSCLE_COLORS[muscle]}12`, borderRadius: 'var(--radius-full)',
                        border: `1px solid ${MUSCLE_COLORS[muscle]}25`,
                      }}>
                        {MUSCLE_LABELS[muscle] || muscle} · {exList.length}
                      </span>
                      <div style={{ height: 1, flex: 1, background: `${MUSCLE_COLORS[muscle]}25` }} />
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
                        onClick={() => pilihLatihan(ex)}
                        style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}
                        whileHover={{ scale: 1.01, backgroundColor: 'var(--color-surface-2)' }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div style={{
                          width: 52, height: 52,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, flexShrink: 0,
                        }}>
                          <img 
                            src={`/images/${ex.ototTarget}.png`} 
                            alt={ex.ototTarget} 
                            className="premium-icon"
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4, letterSpacing: '0.005em' }}>{ex.nama}</div>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                              background: `${MUSCLE_COLORS[ex.ototTarget]}18`, color: MUSCLE_COLORS[ex.ototTarget] || 'var(--color-primary)',
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>{ex.kategori}</span>
                            {ex.kustom && <span className="badge badge--blue" style={{ padding: '2px 7px', fontSize: 9 }}>Kustom</span>}
                          </div>
                        </div>
                        {ex.kustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteExercise(ex.id);
                            }}
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
                  <div className="empty-state__title">Latihan tidak ditemukan</div>
                  <div className="empty-state__desc">Coba cari kata kunci lain atau tambahkan latihan kustom</div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            {/* Detail View Header */}
            <div className="page-header" style={{ paddingLeft: 'var(--space-3)' }}>
              <button 
                className="btn btn--ghost btn--sm btn--icon" 
                onClick={() => pilihLatihan(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}
              >
                <ArrowLeft size={16} />
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}>Kembali</span>
              </button>
              <div className="page-title" style={{ fontSize: 15 }}>Detail <span>Gerakan</span></div>
            </div>

            {/* Check that lastSelected is not null before rendering detail content */}
            {lastSelected && (
              <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
                {/* Illustration Card */}
                <div 
                  className="card" 
                  style={{ 
                    background: 'var(--color-bg-2)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--radius-xl)', 
                    padding: 'var(--space-6)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: 'var(--space-4)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Background soft glow for premium feel */}
                  <div style={{
                    position: 'absolute',
                    width: 150,
                    height: 150,
                    background: 'var(--color-primary-glow)',
                    filter: 'blur(40px)',
                    borderRadius: '50%',
                    zIndex: 0,
                    pointerEvents: 'none',
                  }} />

                  <img 
                    src={dapatkanGambarAlat(lastSelected.alat)} 
                    alt={lastSelected.alat || 'Beban Tubuh'} 
                    className="premium-illus"
                    style={{ zIndex: 1, maxWidth: 200, maxHeight: 200 }}
                  />
                  
                  <div style={{ 
                    marginTop: 'var(--space-4)', 
                    fontSize: 11, 
                    fontWeight: 800, 
                    color: 'var(--color-primary)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.08em',
                    background: 'var(--color-primary-pale)',
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(255,107,0,0.15)',
                    zIndex: 1
                  }}>
                    Alat: {lastSelected.alat || 'Beban Tubuh'}
                  </div>
                </div>

                {/* Title & Info Card */}
                <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', marginBottom: 10, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {lastSelected.nama}
                  </h2>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {/* Target Muscle Chip with Icon */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '3px 0',
                    }}>
                      <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={`/images/${lastSelected.ototTarget}.png`} 
                          alt={lastSelected.ototTarget} 
                          className="premium-icon" 
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: MUSCLE_COLORS[lastSelected.ototTarget] || 'var(--color-primary)' }}>
                        {MUSCLE_LABELS[lastSelected.ototTarget]}
                      </span>
                    </div>

                    {/* Category Chip */}
                    <span style={{
                      fontSize: 11, 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      padding: '4px 10px', 
                      borderRadius: 'var(--radius-md)',
                      background: `${MUSCLE_COLORS[lastSelected.ototTarget]}15`, 
                      color: MUSCLE_COLORS[lastSelected.ototTarget] || 'var(--color-primary)',
                      border: `1px solid ${MUSCLE_COLORS[lastSelected.ototTarget]}30`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      marginLeft: 'auto'
                    }}>
                      {lastSelected.kategori}
                    </span>
                  </div>
                </div>

                {/* Instructions Card */}
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Cara Melakukan:
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {lastSelected.instruksi && Array.isArray(lastSelected.instruksi) && lastSelected.instruksi.length > 0 ? (
                      lastSelected.instruksi.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            color: '#FFFFFF',
                            fontSize: 10,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 2
                          }}>
                            {idx + 1}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.65 }}>
                            {step}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Tidak ada instruksi khusus untuk gerakan ini.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
              style={{ overflowY: 'auto', maxHeight: '85dvh' }}
            >
              <div className="modal-handle" />
              <div className="modal-title">Tambah Latihan Kustom</div>
              
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Nama Latihan</label>
                <input 
                  className="input" 
                  placeholder="misal: Incline Dumbbell Fly" 
                  value={newEx.nama} 
                  onChange={e => setNewEx(p => ({ ...p, nama: e.target.value }))} 
                  autoFocus 
                />
              </div>

              <div className="input-row" style={{ marginBottom: 12 }}>
                <div className="input-group">
                  <label className="input-label">Target Otot</label>
                  <select className="input" value={newEx.ototTarget} onChange={e => setNewEx(p => ({ ...p, ototTarget: e.target.value }))}>
                    {MUSCLE_GROUPS.filter(m => m.id !== 'all').map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Kategori</label>
                  <select className="input" value={newEx.kategori} onChange={e => setNewEx(p => ({ ...p, kategori: e.target.value }))}>
                    <option value="Komposit">Komposit</option>
                    <option value="Isolasi">Isolasi</option>
                    <option value="Beban Tubuh">Beban Tubuh</option>
                    <option value="Kardio">Kardio</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Alat Latihan</label>
                <select className="input" value={newEx.alat} onChange={e => setNewEx(p => ({ ...p, alat: e.target.value }))}>
                  <option value="Barbel">Barbel</option>
                  <option value="Dumbel">Dumbel</option>
                  <option value="Mesin Kabel">Mesin Kabel</option>
                  <option value="Mesin Kaki">Mesin Kaki</option>
                  <option value="Beban Tubuh">Beban Tubuh</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">Cara Melakukan / Instruksi (Satu langkah per baris)</label>
                <textarea 
                  className="input" 
                  rows={4}
                  placeholder={`Langkah 1...\nLangkah 2...\nLangkah 3...`}
                  value={newEx.instruksi} 
                  onChange={e => setNewEx(p => ({ ...p, instruksi: e.target.value }))}
                  style={{ resize: 'vertical', fontFamily: 'inherit', padding: '10px 14px', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>Batal</button>
                <button className="btn btn--primary" style={{ flex: 2 }} onClick={addCustomExercise}>Tambah Latihan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
