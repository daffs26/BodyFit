import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronRight, Target, Scale, Calendar } from 'lucide-react';
import { db } from '../db/db';
import useStore from '../store/useStore';
import ProgramRekomendasiPage from './ProgramRekomendasiPage';
import LifestyleGuide from './LifestyleGuide';

// ── Data tingkat aktivitas ──────────────────────────────────────────────────

const TINGKAT_AKTIVITAS = [
  { id: 'sedentary',    label: 'Sangat Ringan', desc: 'Banyak duduk, sedikit/tanpa olahraga',        ikon: '🪑', hari: '0–1 hari/minggu' },
  { id: 'ringan',       label: 'Ringan',         desc: 'Olahraga ringan 1–3 hari/minggu',              ikon: '🚶', hari: '1–3 hari/minggu' },
  { id: 'sedang',       label: 'Sedang',          desc: 'Olahraga sedang 3–5 hari/minggu',              ikon: '🏃', hari: '3–5 hari/minggu' },
  { id: 'aktif',        label: 'Aktif',           desc: 'Olahraga berat 6–7 hari/minggu',              ikon: '💪', hari: '6–7 hari/minggu' },
  { id: 'sangat_aktif', label: 'Sangat Aktif',   desc: 'Latihan fisik berat setiap hari/pekerja fisik', ikon: '🔥', hari: 'Setiap hari' },
];

// ── TDEE Card ───────────────────────────────────────────────────────────────

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
          { label: 'Protein', value: `${macros.protein}g`,      desc: `~${Math.round(macros.protein * 4)} kkal` },
          { label: 'Karbo',   value: `${macros.karbohidrat}g`,  desc: `~${Math.round(macros.karbohidrat * 4)} kkal` },
          { label: 'Lemak',   value: `${macros.lemak}g`,        desc: `~${Math.round(macros.lemak * 9)} kkal` },
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

// ── Main Component ──────────────────────────────────────────────────────────

export default function PlannerTab() {
  const { profil, setProfil } = useStore();
  const [programPageTingkat, setProgramPageTingkat] = useState(null);

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
    <>
      {/* ── Program Rekomendasi Page Overlay ── */}
      <AnimatePresence>
        {programPageTingkat && (
          <ProgramRekomendasiPage
            key="program-page-planner"
            tingkat={programPageTingkat}
            onBack={() => setProgramPageTingkat(null)}
          />
        )}
      </AnimatePresence>

      <div>
        <div className="page-header">
          <div className="page-title">Rencana <span>Latihan</span></div>
        </div>

        <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* TDEE Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <TDEECard />
          </motion.div>

          {/* Target Bulanan */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Target Bulanan</div>

              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Tujuan Utama</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { id: 'defisit',      label: 'Defisit',     desc: '-400 kkal' },
                    { id: 'pemeliharaan', label: 'Pemeliharaan', desc: 'TDEE' },
                    { id: 'surplus',      label: 'Surplus',      desc: '+400 kkal' },
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => setProfil({ tipeTarget: g.id })}
                      style={{
                        padding: '12px 8px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                        background: profil.tipeTarget === g.id ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                        border: `2px solid ${profil.tipeTarget === g.id ? 'var(--color-primary)' : 'transparent'}`,
                        color: profil.tipeTarget === g.id ? 'var(--color-primary)' : 'var(--color-text-sub)',
                        textAlign: 'center', transition: 'all 0.18s',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{g.label}</div>
                      <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Target Berat (kg)</label>
                  <input
                    className="input" type="number"
                    value={profil.beratTarget || ''}
                    onChange={e => setProfil({ beratTarget: +e.target.value })}
                    placeholder="65"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Latihan per Minggu</label>
                  <select className="input" value={profil.latihanPerMinggu} onChange={e => setProfil({ latihanPerMinggu: +e.target.value })}>
                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}x / minggu</option>)}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tingkat Aktivitas + Rekomendasi Program */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="card">
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div className="section-title">Tingkat Aktivitas Harian</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Pilih tingkat aktivitasmu, lalu ketuk → untuk mendapatkan program latihan yang dipersonalisasi.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TINGKAT_AKTIVITAS.map(a => {
                  const isActive = profil.tingkatAktivitas === a.id;
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: 8 }}>
                      {/* Pilih tingkat aktivitas */}
                      <button
                        onClick={() => setProfil({ tingkatAktivitas: a.id })}
                        style={{
                          flex: 1,
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-lg)',
                          border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: isActive ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                          cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{a.ikon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? 'var(--color-primary)' : 'var(--color-text)' }}>
                            {a.label}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {a.desc}
                          </div>
                        </div>
                        <div style={{
                          flexShrink: 0, fontSize: 10, fontWeight: 700,
                          color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          background: isActive ? 'var(--color-primary-pale)' : 'var(--color-surface-3)',
                          padding: '3px 8px', borderRadius: 99, letterSpacing: '0.02em',
                        }}>
                          {a.hari}
                        </div>
                        {isActive && <span style={{ color: 'var(--color-primary)', fontSize: 16, flexShrink: 0 }}>✓</span>}
                      </button>

                      {/* Tombol lihat rekomendasi program → */}
                      <button
                        onClick={() => setProgramPageTingkat(a.id)}
                        title="Lihat rekomendasi program latihan"
                        style={{
                          flexShrink: 0, width: 46,
                          borderRadius: 'var(--radius-lg)',
                          border: `1px solid ${isActive ? 'rgba(255,107,0,0.4)' : 'var(--color-border)'}`,
                          background: isActive ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.18s',
                          color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Hint */}
              <div style={{
                marginTop: 12, padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-2)',
                fontSize: 12, color: 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>→</span>
                <span>Ketuk tombol panah untuk membuat jadwal latihan yang dipersonalisasi berdasarkan fokus otot dan waktu latihanmu.</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div style={{ marginBottom: 10 }}>
              <div className="section-title">Panduan Gaya Hidupmu</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Disesuaikan dengan tujuan dan kecepatan progressmu
              </div>
            </div>
            <LifestyleGuide
              tipeTarget={profil.tipeTarget || 'defisit'}
              kecepatanProgress={profil.kecepatanProgress || 'normal'}
            />
          </motion.div>

          <div style={{ height: 8 }} />
        </div>
      </div>
    </>
  );
}
