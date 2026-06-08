import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, User } from 'lucide-react';
import useStore from '../store/useStore';
import { db } from '../db/db';

export default function ProfileTab() {
  const { profil, setProfil, hitungTDEE, tema, setTema } = useStore();
  const macros = hitungTDEE();
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = async () => {
    const [sesiLatihan, catatanLatihan, kamusLatihan, catatanBerat, catatanMakanan, targetBulanan] = await Promise.all([
      db.sesiLatihan.toArray(),
      db.catatanLatihan.toArray(),
      db.kamusLatihan.where('kustom').equals(true).toArray(),
      db.catatanBerat.toArray(),
      db.catatanMakanan.toArray(),
      db.targetBulanan.toArray(),
    ]);

    const data = { profil, sesiLatihan, catatanLatihan, kamusLatihan, catatanBerat, catatanMakanan, targetBulanan, exportedAt: new Date().toISOString() };
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
      if (data.sesiLatihan)     await db.sesiLatihan.bulkPut(data.sesiLatihan);
      if (data.catatanLatihan)  await db.catatanLatihan.bulkPut(data.catatanLatihan);
      if (data.kamusLatihan)    await db.kamusLatihan.bulkPut(data.kamusLatihan);
      if (data.catatanBerat)    await db.catatanBerat.bulkPut(data.catatanBerat);
      if (data.catatanMakanan)  await db.catatanMakanan.bulkPut(data.catatanMakanan);
      if (data.targetBulanan)   await db.targetBulanan.bulkPut(data.targetBulanan);
      alert('✅ Data berhasil dipulihkan!');
    } catch {
      alert('❌ Gagal mengimpor. Harap gunakan file cadangan BodyFit yang valid.');
    }
    setImporting(false);
    e.target.value = '';
  };

  const clearAllData = async () => {
    const confirmMsg = '⚠️ Apakah Anda yakin? Ini akan menghapus SEMUA data latihan dan nutrisi Anda. Tindakan ini tidak dapat dibatalkan.';
    const successMsg = 'Semua data telah dihapus.';

    if (!window.confirm(confirmMsg)) return;
    await Promise.all([
      db.sesiLatihan.clear(), db.catatanLatihan.clear(), db.catatanBerat.clear(),
      db.catatanMakanan.clear(), db.targetBulanan.clear(),
    ]);
    alert(successMsg);
  };

  const tipeTargetLabel = profil.tipeTarget === 'surplus' 
    ? 'Surplus Kalori' 
    : profil.tipeTarget === 'defisit' 
      ? 'Defisit Kalori' 
      : 'Pemeliharaan';

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Profil <span>Saya</span></div>
      </div>

      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* Profile Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-4)', boxShadow: 'var(--shadow-primary)',
            }}><User size={36} color="white" /></div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{profil.nama || 'Atur Nama Anda'}</div>
            <div className="badge badge--orange">
              {tipeTargetLabel}
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Target: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{macros.kalori} kkal</span> · {macros.protein}g P · {macros.karbohidrat}g K · {macros.lemak}g L
            </div>
          </div>
        </motion.div>

        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Informasi Pribadi</div>

            <div className="input-group" style={{ marginBottom: 12 }}>
              <label className="input-label">Nama</label>
              <input className="input" placeholder="Masukkan nama Anda..." value={profil.nama} onChange={e => setProfil({ nama: e.target.value })} />
            </div>

            <div className="input-row" style={{ marginBottom: 12 }}>
              <div className="input-group">
                <label className="input-label">Usia</label>
                <input className="input" type="number" value={profil.usia} onChange={e => setProfil({ usia: +e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Jenis Kelamin</label>
                <select className="input" value={profil.gender} onChange={e => setProfil({ gender: e.target.value })}>
                  <option value="pria">Pria</option>
                  <option value="wanita">Wanita</option>
                </select>
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: 12 }}>
              <div className="input-group">
                <label className="input-label">Tinggi Badan (cm)</label>
                <input className="input" type="number" value={profil.tinggi} onChange={e => setProfil({ tinggi: +e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Berat Badan (kg)</label>
                <input className="input" type="number" value={profil.berat} onChange={e => setProfil({ berat: +e.target.value })} />
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: 16 }}>
              <div className="input-group">
                <label className="input-label">Target Berat Badan (kg)</label>
                <input className="input" type="number" value={profil.beratTarget} onChange={e => setProfil({ beratTarget: +e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Target Tidur (jam)</label>
                <input className="input" type="number" step="0.5" value={profil.targetTidur} onChange={e => setProfil({ targetTidur: +e.target.value })} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Target Air Minum (ml)</label>
              <input className="input" type="number" value={profil.targetAir} onChange={e => setProfil({ targetAir: +e.target.value })} />
            </div>

            <button className="btn btn--primary btn--full" onClick={handleSave}>
              {saved ? 'Profil Disimpan!' : 'Simpan Profil'}
            </button>
          </div>
        </motion.div>

        {/* Macro Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Target Harian</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Kalori', value: `${macros.kalori} kkal`, sub: `BMR: ${macros.bmr} · TDEE: ${macros.tdee}`, color: 'var(--color-primary)' },
                { label: 'Protein', value: `${macros.protein}g`, sub: `${(macros.protein / profil.berat).toFixed(1)}g per kg berat badan`, color: 'var(--color-primary)' },
                { label: 'Karbohidrat', value: `${macros.karbohidrat}g`, sub: `~${Math.round(macros.karbohidrat * 4)} kkal`, color: 'var(--color-info)' },
                { label: 'Lemak', value: `${macros.lemak}g`, sub: `~${Math.round(macros.lemak * 9)} kkal`, color: 'var(--color-warning)' },
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

        {/* App Preferences */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Preferensi Aplikasi</div>

            {/* Theme Selector */}
            <div className="input-group">
              <label className="input-label">Tema</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { id: 'light', label: 'Terang' },
                  { id: 'dark', label: 'Gelap' }
                ].map(th => (
                  <button
                    key={th.id}
                    onClick={() => setTema(th.id)}
                    style={{
                      padding: '10px 8px', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      background: (tema || 'dark') === th.id ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                      border: `2px solid ${(tema || 'dark') === th.id ? 'var(--color-primary)' : 'transparent'}`,
                      color: (tema || 'dark') === th.id ? 'var(--color-primary)' : 'var(--color-text-sub)',
                      textAlign: 'center', transition: 'all 0.2s', fontWeight: 600, fontSize: 13,
                    }}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Manajemen Data</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button className="btn btn--secondary btn--full" onClick={exportData} style={{ justifyContent: 'flex-start', gap: 'var(--space-3)' }}>
                <Download size={18} color="var(--color-success)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Ekspor Cadangan Data</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Unduh data latihan & nutrisi Anda ke file JSON</div>
                </div>
              </button>

              <label className="btn btn--secondary btn--full" style={{ justifyContent: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer' }}>
                <Upload size={18} color="var(--color-info)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{importing ? 'Mengimpor...' : 'Impor Cadangan Data'}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Pulihkan data Anda dari file JSON cadangan</div>
                </div>
                <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
              </label>

              <button className="btn btn--danger btn--full" onClick={clearAllData} style={{ justifyContent: 'flex-start', gap: 'var(--space-3)', marginTop: 8 }}>
                <Trash2 size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Hapus Semua Data</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Hapus permanen semua data dari browser ini</div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>BodyFit</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>v1.0.0 · 100% Lokal · Tidak Perlu Akun</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Data Anda tetap berada di perangkat Anda</div>
          </div>
        </motion.div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

