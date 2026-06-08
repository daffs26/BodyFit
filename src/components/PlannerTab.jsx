import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import useStore from '../store/useStore';

const PROGRAM_LATIHAN = [
  {
    id: 'ppl',
    name: 'Push Pull Legs (PPL)',
    frequency: '6 hari/minggu',
    description: 'Pembagian frekuensi tinggi untuk tingkat menengah-lanjut. Setiap kelompok otot dilatih 2x/minggu.',
    schedule: [
      { day: 'Senin',  focus: 'Push (Dada, Bahu, Trisep)', muscles: ['dada','bahu','lengan'] },
      { day: 'Selasa', focus: 'Pull (Punggung, Bisep)',     muscles: ['punggung','lengan'] },
      { day: 'Rabu',   focus: 'Legs (Paha Depan, Belakang, Betis)', muscles: ['kaki'] },
      { day: 'Kamis',  focus: 'Push (Dada, Bahu, Trisep)', muscles: ['dada','bahu','lengan'] },
      { day: 'Jumat',  focus: 'Pull (Punggung, Bisep)',     muscles: ['punggung','lengan'] },
      { day: 'Sabtu',  focus: 'Legs (Paha Depan, Belakang, Betis)', muscles: ['kaki'] },
      { day: 'Minggu', focus: 'Istirahat & Pemulihan',      muscles: [] },
    ],
  },
  {
    id: 'upper_lower',
    name: 'Upper / Lower Split',
    frequency: '4 hari/minggu',
    description: 'Keseimbangan yang sangat baik untuk tingkat menengah. Melatih setiap otot 2x/minggu dengan istirahat cukup.',
    schedule: [
      { day: 'Senin',  focus: 'Tubuh Bagian Atas (Dada, Punggung, Bahu, Lengan)', muscles: ['dada','punggung','bahu','lengan'] },
      { day: 'Selasa', focus: 'Tubuh Bagian Bawah (Paha Depan, Belakang, Betis)',   muscles: ['kaki'] },
      { day: 'Rabu',   focus: 'Istirahat',                                          muscles: [] },
      { day: 'Kamis',  focus: 'Tubuh Bagian Atas (Fokus Hipertropi)',               muscles: ['dada','punggung','bahu','lengan'] },
      { day: 'Jumat',  focus: 'Tubuh Bagian Bawah (Fokus Kekuatan)',                muscles: ['kaki'] },
      { day: 'Sabtu',  focus: 'Otot Inti & Pemulihan Aktif',                        muscles: ['perut'] },
      { day: 'Minggu', focus: 'Istirahat & Pemulihan',                              muscles: [] },
    ],
  },
  {
    id: 'full_body',
    name: 'Full Body 3x/Minggu',
    frequency: '3 hari/minggu',
    description: 'Ideal untuk pemula atau jadwal sibuk. Semua kelompok otot dilatih setiap sesi.',
    schedule: [
      { day: 'Senin',  focus: 'Seluruh Tubuh (Semua Kelompok Otot)', muscles: ['dada','punggung','kaki','bahu','lengan','perut'] },
      { day: 'Selasa', focus: 'Istirahat',                          muscles: [] },
      { day: 'Rabu',   focus: 'Seluruh Tubuh (Semua Kelompok Otot)', muscles: ['dada','punggung','kaki','bahu','lengan','perut'] },
      { day: 'Kamis',  focus: 'Istirahat',                          muscles: [] },
      { day: 'Jumat',  focus: 'Seluruh Tubuh (Semua Kelompok Otot)', muscles: ['dada','punggung','kaki','bahu','lengan','perut'] },
      { day: 'Sabtu',  focus: 'Kardio / Pemulihan Aktif',           muscles: [] },
      { day: 'Minggu', focus: 'Istirahat & Pemulihan',              muscles: [] },
    ],
  },
  {
    id: 'bro_split',
    name: 'Classic Bro Split',
    frequency: '5 hari/minggu',
    description: 'Setiap kelompok otot memiliki hari khusus tersendiri. Populer untuk isolasi dan volume.',
    schedule: [
      { day: 'Senin',  focus: 'Hari Otot Dada',           muscles: ['dada'] },
      { day: 'Selasa', focus: 'Hari Otot Punggung',       muscles: ['punggung'] },
      { day: 'Rabu',   focus: 'Hari Otot Bahu',           muscles: ['bahu'] },
      { day: 'Kamis',  focus: 'Hari Otot Lengan (Bisep & Trisep)', muscles: ['lengan'] },
      { day: 'Jumat',  focus: 'Hari Otot Kaki',           muscles: ['kaki'] },
      { day: 'Sabtu',  focus: 'Otot Inti & Kardio',       muscles: ['perut'] },
      { day: 'Minggu', focus: 'Istirahat & Pemulihan',    muscles: [] },
    ],
  },
];

const MUSCLE_COLORS = {
  dada: '#FF6B00', punggung: '#3B82F6', kaki: '#22C55E',
  bahu: '#A855F7', lengan: '#F59E0B', perut: '#EF4444',
};

function TDEECard() {
  const { profil, hitungTDEE } = useStore();
  const macros = hitungTDEE();

  const tipeTargetLabel = profil.tipeTarget === 'surplus' 
    ? 'Target Surplus Kalori' 
    : profil.tipeTarget === 'defisit' 
      ? 'Target Defisit Kalori' 
      : 'Target Pemeliharaan';

  return (
    <div className="card card--orange" style={{ borderRadius: 'var(--radius-2xl)' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
          {tipeTargetLabel}
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, color: 'white', lineHeight: 1 }}>
          {macros.kalori}<span style={{ fontSize: 18, fontWeight: 600, marginLeft: 4, color: 'rgba(255,255,255,0.8)' }}>kkal</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          TDEE: {macros.tdee} kkal · BMR: {macros.bmr} kkal
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Protein', value: `${macros.protein}g`, desc: `~${Math.round(macros.protein*4)} kkal` },
          { label: 'Karbo',   value: `${macros.karbohidrat}g`,   desc: `~${Math.round(macros.karbohidrat*4)} kkal` },
          { label: 'Lemak',     value: `${macros.lemak}g`,     desc: `~${Math.round(macros.lemak*9)} kkal` },
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
  const { profil, setProfil } = useStore();
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showProgramDetail, setShowProgramDetail] = useState(null);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyTargets = useLiveQuery(() => db.targetBulanan.where('bulanTahun').equals(thisMonth).toArray(), [thisMonth]) || [];
  const currentTarget = monthlyTargets[0];

  const saveTarget = async (updates) => {
    if (currentTarget) {
      await db.targetBulanan.update(currentTarget.id, updates);
    } else {
      await db.targetBulanan.add({ bulanTahun: thisMonth, ...updates });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Rencana <span>Latihan</span></div>
      </div>

      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* TDEE Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <TDEECard />
        </motion.div>

        {/* Goal Settings */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Target Bulanan</div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label className="input-label">Tujuan Utama</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { id: 'defisit', label: 'Defisit Kalori', desc: '-400 kkal' },
                  { id: 'pemeliharaan', label: 'Pemeliharaan', desc: 'TDEE' },
                  { id: 'surplus', label: 'Surplus Kalori', desc: '+400 kkal' },
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => setProfil({ tipeTarget: g.id })}
                    style={{
                      padding: '12px 8px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      background: profil.tipeTarget === g.id ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                      border: `2px solid ${profil.tipeTarget === g.id ? 'var(--color-primary)' : 'transparent'}`,
                      color: profil.tipeTarget === g.id ? 'var(--color-primary)' : 'var(--color-text-sub)',
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
                <label className="input-label">Target Berat (kg)</label>
                <input className="input" type="number" value={profil.beratTarget || ''} onChange={e => setProfil({ beratTarget: +e.target.value })} placeholder="65" />
              </div>
              <div className="input-group">
                <label className="input-label">Latihan per Minggu</label>
                <select className="input" value={profil.latihanPerMinggu} onChange={e => setProfil({ latihanPerMinggu: +e.target.value })}>
                  {[3,4,5,6].map(n => <option key={n} value={n}>{n}x / minggu</option>)}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Level */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Tingkat Aktivitas Harian</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'sedentary', label: 'Sangat Ringan', desc: 'Banyak duduk, sedikit/tanpa olahraga' },
                { id: 'ringan', label: 'Ringan', desc: 'Olahraga ringan 1-3 hari/minggu' },
                { id: 'sedang', label: 'Sedang', desc: 'Olahraga sedang 3-5 hari/minggu' },
                { id: 'aktif', label: 'Aktif', desc: 'Olahraga berat 6-7 hari/minggu' },
                { id: 'sangat_aktif', label: 'Sangat Aktif', desc: 'Latihan fisik berat setiap hari/pekerja fisik' },
              ].map(a => (
                <button key={a.id} onClick={() => setProfil({ tingkatAktivitas: a.id })} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px var(--space-3)', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  background: profil.tingkatAktivitas === a.id ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                  border: `1px solid ${profil.tingkatAktivitas === a.id ? 'var(--color-primary)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: profil.tingkatAktivitas === a.id ? 'var(--color-primary)' : 'var(--color-text)' }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a.desc}</div>
                  </div>
                  {profil.tingkatAktivitas === a.id && <div style={{ color: 'var(--color-primary)', fontSize: 18 }}>✓</div>}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Training Programs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Rekomendasi Program Latihan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {PROGRAM_LATIHAN.map(prog => (
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
                          <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0 }}>{day.day.toUpperCase()}</div>
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
