import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check,
  TrendingUp, TrendingDown, Minus,
  Zap, Clock, Feather,
  Dumbbell,
} from 'lucide-react';
import useStore from '../store/useStore';

// ── Data ──────────────────────────────────────────────────────────────────────

const GOALS = [
  {
    id: 'surplus',
    label: 'Bulking',
    sub: 'Naikkan massa otot',
    desc: 'Makan lebih banyak dari TDEE. Fokus pada kekuatan dan ukuran otot.',
    ikon: TrendingUp,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
  },
  {
    id: 'defisit',
    label: 'Cutting',
    sub: 'Turunkan lemak tubuh',
    desc: 'Makan lebih sedikit dari TDEE. Pertahankan otot sambil membakar lemak.',
    ikon: TrendingDown,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
  },
  {
    id: 'pemeliharaan',
    label: 'Maintenance',
    sub: 'Jaga berat badan',
    desc: 'Makan sesuai TDEE. Pertahankan komposisi tubuh yang sudah ada.',
    ikon: Minus,
    color: '#FF6B00',
    bg: 'rgba(255,107,0,0.12)',
  },
];

const KECEPATAN = [
  {
    id: 'lambat',
    label: 'Lambat',
    sub: 'Aman & terjaga',
    delta: { surplus: '+200', defisit: '-200' },
    perMinggu: { surplus: '~0.2 kg/minggu', defisit: '~0.2 kg/minggu' },
    desc: 'Perubahan minimal, lebih mudah dijaga. Cocok untuk pemula atau yang sibuk.',
    ikon: Feather,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
  },
  {
    id: 'normal',
    label: 'Normal',
    sub: 'Seimbang & efektif',
    delta: { surplus: '+400', defisit: '-400' },
    perMinggu: { surplus: '~0.4 kg/minggu', defisit: '~0.4 kg/minggu' },
    desc: 'Standar industri. Balance antara kecepatan hasil dan kenyamanan.',
    ikon: Clock,
    color: '#FF6B00',
    bg: 'rgba(255,107,0,0.12)',
    recommended: true,
  },
  {
    id: 'cepat',
    label: 'Cepat',
    sub: 'Agresif & terstruktur',
    delta: { surplus: '+600', defisit: '-600' },
    perMinggu: { surplus: '~0.6 kg/minggu', defisit: '~0.6 kg/minggu' },
    desc: 'Hasil lebih cepat tapi butuh disiplin tinggi dan pemantauan ketat.',
    ikon: Zap,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
  },
];

const TINGKAT_AKTIVITAS = [
  { id: 'sedentary',    label: 'Sangat Ringan', desc: 'Banyak duduk, sedikit/tanpa olahraga',            ikon: '🪑', pengali: '×1.2' },
  { id: 'ringan',       label: 'Ringan',         desc: 'Olahraga ringan 1–3 hari/minggu',                  ikon: '🚶', pengali: '×1.375' },
  { id: 'sedang',       label: 'Sedang',          desc: 'Olahraga sedang 3–5 hari/minggu',                  ikon: '🏃', pengali: '×1.55' },
  { id: 'aktif',        label: 'Aktif',           desc: 'Olahraga berat 6–7 hari/minggu',                  ikon: '💪', pengali: '×1.725' },
  { id: 'sangat_aktif', label: 'Sangat Aktif',   desc: 'Latihan fisik berat setiap hari / pekerja fisik',  ikon: '🔥', pengali: '×1.9' },
];

// ── Komponen helper ───────────────────────────────────────────────────────────

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '0 20px', marginBottom: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i < current ? 'var(--color-primary)' : 'var(--color-surface-3)',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = 'Lanjut', nextDisabled = false, isLast = false }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 20px', marginTop: 'auto', paddingTop: 24 }}>
      {onBack && (
        <button
          onClick={onBack}
          className="btn btn--secondary"
          style={{ minWidth: 48, padding: '12px' }}
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`btn ${isLast ? 'btn--primary' : 'btn--primary'} btn--full btn--lg`}
        style={{ opacity: nextDisabled ? 0.4 : 1, flex: 1 }}
      >
        {isLast ? <><Check size={18} /> {nextLabel}</> : <>{nextLabel} <ChevronRight size={18} /></>}
      </button>
    </div>
  );
}

// ── Step Components ───────────────────────────────────────────────────────────

function StepSplash({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', padding: 40, textAlign: 'center',
        background: 'var(--color-bg)',
      }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        style={{
          width: 96, height: 96, borderRadius: 28,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(255,107,0,0.4)',
          marginBottom: 28,
        }}
      >
        <Dumbbell size={48} color="white" strokeWidth={2} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{
          fontSize: 40, fontWeight: 800, color: 'var(--color-primary)',
          letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8,
        }}>
          BodyFit
        </div>
        <div style={{
          fontSize: 16, color: 'var(--color-text-sub)', fontWeight: 500,
          lineHeight: 1.5, marginBottom: 16, maxWidth: 260,
        }}>
          Tracker gym personal yang disesuaikan dengan tubuh dan tujuanmu
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40,
          textAlign: 'left', maxWidth: 280,
        }}>
          {['Program latihan yang dipersonalisasi', 'Panduan pola makan & tidur', 'Tracking progress & analitik'].map(f => (
            <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--color-primary-pale)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Check size={11} color="var(--color-primary)" />
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>{f}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onNext}
        className="btn btn--primary btn--full btn--lg"
        style={{ maxWidth: 320 }}
      >
        Mulai Setup <ChevronRight size={18} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 16 }}
      >
        100% lokal · tidak perlu akun · data tersimpan di perangkatmu
      </motion.div>
    </motion.div>
  );
}

function StepIdentitas({ data, onChange, onBack, onNext }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 20px', flex: 1 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
          Siapa kamu?
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          Data ini digunakan untuk menghitung kalori dan program yang tepat untukmu.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="input-group">
          <label className="input-label">Nama Panggilan</label>
          <input
            className="input"
            placeholder="Contoh: Daffa"
            value={data.nama}
            onChange={e => onChange({ nama: e.target.value })}
          />
        </div>

        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Usia</label>
            <input
              className="input" type="number" min="10" max="80"
              placeholder="25"
              value={data.usia || ''}
              onChange={e => onChange({ usia: +e.target.value })}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Jenis Kelamin</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ id: 'pria', label: 'Pria', em: '♂' }, { id: 'wanita', label: 'Wanita', em: '♀' }].map(g => (
                <button
                  key={g.id}
                  onClick={() => onChange({ gender: g.id })}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${data.gender === g.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: data.gender === g.id ? 'var(--color-primary-pale)' : 'var(--color-surface-2)',
                    color: data.gender === g.id ? 'var(--color-primary)' : 'var(--color-text-sub)',
                    cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.18s',
                  }}
                >
                  {g.em} {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!data.nama || !data.usia}
      />
    </div>
  );
}

function StepBodyStats({ data, onChange, onBack, onNext }) {
  const bmi = data.tinggi && data.berat
    ? (data.berat / ((data.tinggi / 100) ** 2)).toFixed(1)
    : null;

  const bmiLabel = bmi
    ? bmi < 18.5 ? { label: 'Kekurangan Berat', color: '#3B82F6' }
    : bmi < 25   ? { label: 'Normal', color: '#22C55E' }
    : bmi < 30   ? { label: 'Kelebihan Berat', color: '#F59E0B' }
    : { label: 'Obesitas', color: '#EF4444' }
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 20px', flex: 1 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
          Ukuran Tubuhmu
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          Diperlukan untuk menghitung BMR dan kebutuhan kalori harianmu.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Tinggi Badan (cm)</label>
            <input
              className="input" type="number" min="100" max="250"
              placeholder="170"
              value={data.tinggi || ''}
              onChange={e => onChange({ tinggi: +e.target.value })}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Berat Saat Ini (kg)</label>
            <input
              className="input" type="number" min="30" max="300"
              placeholder="70"
              value={data.berat || ''}
              onChange={e => onChange({ berat: +e.target.value })}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Target Berat (kg)</label>
          <input
            className="input" type="number" min="30" max="300"
            placeholder="65"
            value={data.beratTarget || ''}
            onChange={e => onChange({ beratTarget: +e.target.value })}
          />
          {data.berat && data.beratTarget && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 5 }}>
              {data.beratTarget < data.berat
                ? `Turun ${(data.berat - data.beratTarget).toFixed(1)} kg dari berat sekarang`
                : data.beratTarget > data.berat
                ? `Naik ${(data.beratTarget - data.berat).toFixed(1)} kg dari berat sekarang`
                : 'Pertahankan berat sekarang'}
            </div>
          )}
        </div>

        {/* BMI indicator */}
        {bmi && bmiLabel && (
          <div style={{
            padding: '12px 14px', borderRadius: 'var(--radius-lg)',
            background: `${bmiLabel.color}15`,
            border: `1px solid ${bmiLabel.color}40`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>BMI SAAT INI</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: bmiLabel.color }}>{bmi}</div>
            </div>
            <div style={{
              fontSize: 12, fontWeight: 700, color: bmiLabel.color,
              background: `${bmiLabel.color}20`, padding: '4px 12px', borderRadius: 99,
            }}>
              {bmiLabel.label}
            </div>
          </div>
        )}
      </div>

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!data.tinggi || !data.berat || !data.beratTarget}
      />
    </div>
  );
}

function StepGoal({ data, onChange, onBack, onNext }) {
  // Auto-suggest goal berdasarkan target vs berat sekarang
  const suggested = data.beratTarget < data.berat ? 'defisit'
    : data.beratTarget > data.berat ? 'surplus'
    : 'pemeliharaan';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 20px', flex: 1 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
          Apa Tujuanmu?
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          Berdasarkan target beratmu, kami menyarankan <strong style={{ color: 'var(--color-primary)' }}>
            {GOALS.find(g => g.id === suggested)?.label}
          </strong>.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GOALS.map(goal => {
          const IconEl = goal.ikon;
          const isActive = data.tipeTarget === goal.id;
          const isSuggested = goal.id === suggested;
          return (
            <button
              key={goal.id}
              onClick={() => onChange({ tipeTarget: goal.id })}
              style={{
                padding: '14px 16px', borderRadius: 'var(--radius-xl)',
                border: `2px solid ${isActive ? goal.color : 'var(--color-border)'}`,
                background: isActive ? goal.bg : 'var(--color-surface)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                position: 'relative',
              }}
            >
              {isSuggested && (
                <div style={{
                  position: 'absolute', top: -8, right: 12,
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                  background: 'var(--color-primary)', color: 'white',
                  padding: '2px 8px', borderRadius: 99,
                }}>
                  DISARANKAN
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: isActive ? goal.color : 'var(--color-surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s',
                }}>
                  <IconEl size={18} color={isActive ? 'white' : goal.color} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? goal.color : 'var(--color-text)' }}>
                    {goal.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{goal.sub}</div>
                </div>
                {isActive && <Check size={18} color={goal.color} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.55, paddingLeft: 48 }}>
                {goal.desc}
              </div>
            </button>
          );
        })}
      </div>

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!data.tipeTarget}
      />
    </div>
  );
}

function StepKecepatan({ data, onChange, onBack, onNext }) {
  const goalType = data.tipeTarget === 'surplus' ? 'surplus' : 'defisit';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 20px', flex: 1 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
          Seberapa Cepat?
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          Kecepatan progress mempengaruhi berapa kalori yang kamu tambah atau kurangi setiap harinya.
        </div>
      </div>

      {data.tipeTarget === 'pemeliharaan' ? (
        <div style={{
          padding: 16, borderRadius: 'var(--radius-xl)',
          background: 'var(--color-primary-pale)',
          border: '1px solid rgba(255,107,0,0.3)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600 }}>
            Untuk Maintenance, kalori target = TDEE (tidak ada delta)
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {KECEPATAN.map(k => {
            const IconEl = k.ikon;
            const isActive = data.kecepatanProgress === k.id;
            return (
              <button
                key={k.id}
                onClick={() => onChange({ kecepatanProgress: k.id })}
                style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-xl)',
                  border: `2px solid ${isActive ? k.color : 'var(--color-border)'}`,
                  background: isActive ? k.bg : 'var(--color-surface)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                  position: 'relative',
                }}
              >
                {k.recommended && (
                  <div style={{
                    position: 'absolute', top: -8, right: 12,
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                    background: k.color, color: 'white',
                    padding: '2px 8px', borderRadius: 99,
                  }}>
                    DIREKOMENDASIKAN
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: isActive ? k.color : 'var(--color-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s',
                  }}>
                    <IconEl size={18} color={isActive ? 'white' : k.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? k.color : 'var(--color-text)' }}>
                      {k.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{k.sub}</div>
                  </div>
                  <div style={{
                    flexShrink: 0, textAlign: 'right',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isActive ? k.color : 'var(--color-text-sub)' }}>
                      {k.delta[goalType]} kkal
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {k.perMinggu[goalType]}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.55, paddingLeft: 48 }}>
                  {k.desc}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <NavButtons
        onBack={onBack}
        onNext={() => {
          if (data.tipeTarget === 'pemeliharaan') onChange({ kecepatanProgress: 'normal' });
          onNext();
        }}
        nextDisabled={data.tipeTarget !== 'pemeliharaan' && !data.kecepatanProgress}
      />
    </div>
  );
}

function StepAktivitas({ data, onChange, onBack, onNext }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 20px', flex: 1 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
          Seberapa Aktif Kamu?
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          Ini mempengaruhi Total Daily Energy Expenditure (TDEE) dan program latihanmu.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TINGKAT_AKTIVITAS.map(a => {
          const isActive = data.tingkatAktivitas === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onChange({ tingkatAktivitas: a.id })}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px', borderRadius: 'var(--radius-xl)',
                border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: isActive ? 'var(--color-primary-pale)' : 'var(--color-surface)',
                cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{a.ikon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? 'var(--color-primary)' : 'var(--color-text)', marginBottom: 2 }}>
                  {a.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a.desc}</div>
              </div>
              <div style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: isActive ? 'rgba(255,107,0,0.15)' : 'var(--color-surface-2)',
                padding: '3px 8px', borderRadius: 99, letterSpacing: '0.02em',
              }}>
                {a.pengali}
              </div>
              {isActive && <Check size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!data.tingkatAktivitas}
      />
    </div>
  );
}

function StepDone({ data, onFinish }) {
  // Hitung preview kalori
  const bmr = data.gender === 'pria'
    ? 10 * data.berat + 6.25 * data.tinggi - 5 * data.usia + 5
    : 10 * data.berat + 6.25 * data.tinggi - 5 * data.usia - 161;
  const pengali = { sedentary: 1.2, ringan: 1.375, sedang: 1.55, aktif: 1.725, sangat_aktif: 1.9 };
  const tdee = Math.round(bmr * (pengali[data.tingkatAktivitas] || 1.55));
  const deltaMap = { cepat: 600, normal: 400, lambat: 200 };
  const delta = data.tipeTarget === 'pemeliharaan' ? 0
    : data.tipeTarget === 'surplus' ? deltaMap[data.kecepatanProgress] || 400
    : -(deltaMap[data.kecepatanProgress] || 400);
  const kalori = tdee + delta;

  const goalLabel = { surplus: 'Bulking', defisit: 'Cutting', pemeliharaan: 'Maintenance' }[data.tipeTarget] || '-';
  const speedLabel = { cepat: 'Cepat', normal: 'Normal', lambat: 'Lambat' }[data.kecepatanProgress] || '-';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 20px', flex: 1 }}
    >
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 14 }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #ff8c33 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 16px 40px rgba(255,107,0,0.4)',
          }}
        >
          <Check size={36} color="white" strokeWidth={2.5} />
        </motion.div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
          Siap, {data.nama || 'Juara'}!
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          Profil kamu sudah dibuat. Berikut ringkasannya:
        </div>
      </div>

      {/* Ringkasan */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(255,107,0,0.15) 0%, rgba(255,107,0,0.05) 100%)',
          borderBottom: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>
            TARGET KALORI HARIAN
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
            {kalori.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-muted)' }}>kkal</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            TDEE: {tdee} kkal {delta !== 0 ? `${delta > 0 ? '+' : ''}${delta} kkal (${speedLabel})` : ''}
          </div>
        </div>

        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Nama', value: data.nama || '-' },
            { label: 'Berat / Tinggi', value: `${data.berat} kg / ${data.tinggi} cm` },
            { label: 'Target Berat', value: `${data.beratTarget} kg` },
            { label: 'Tujuan', value: goalLabel },
            { label: 'Kecepatan', value: speedLabel },
            { label: 'Aktivitas', value: TINGKAT_AKTIVITAS.find(a => a.id === data.tingkatAktivitas)?.label || '-' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderBottom: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
        Semua data bisa diubah kapan saja di tab Profil
      </div>

      <button
        onClick={onFinish}
        className="btn btn--primary btn--full btn--lg"
        style={{ marginTop: 'auto' }}
      >
        Masuk ke BodyFit <ChevronRight size={18} />
      </button>
    </motion.div>
  );
}

// ── Main Onboarding Component ─────────────────────────────────────────────────

const TOTAL_STEPS = 5; // tidak termasuk splash (0) dan done (6)

export default function OnboardingScreen() {
  const { setProfil } = useStore();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    nama: '',
    gender: 'pria',
    usia: '',
    tinggi: '',
    berat: '',
    beratTarget: '',
    tipeTarget: '',
    kecepatanProgress: 'normal',
    tingkatAktivitas: '',
  });

  const updateData = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const finishOnboarding = () => {
    setProfil({
      nama: formData.nama,
      gender: formData.gender,
      usia: Number(formData.usia),
      tinggi: Number(formData.tinggi),
      berat: Number(formData.berat),
      beratTarget: Number(formData.beratTarget),
      tipeTarget: formData.tipeTarget,
      kecepatanProgress: formData.kecepatanProgress,
      tingkatAktivitas: formData.tingkatAktivitas,
      onboardingSelesai: true,
    });
  };

  const stepVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
    exit:    { opacity: 0, x: -40, transition: { duration: 0.15 } },
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      maxWidth: 'var(--app-max-width)', margin: '0 auto',
      overflow: 'hidden',
    }}>
      {/* Step 0 — Splash */}
      {step === 0 && (
        <AnimatePresence mode="wait">
          <StepSplash key="splash" onNext={next} />
        </AnimatePresence>
      )}

      {/* Steps 1–5 */}
      {step >= 1 && step <= 5 && (
        <>
          {/* Header */}
          <div style={{ padding: '16px 20px 8px', flexShrink: 0 }}>
            <ProgressBar current={step} total={TOTAL_STEPS} />
          </div>

          {/* Step Content */}
          <div style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            display: 'flex', flexDirection: 'column',
            padding: '16px 0 32px',
          }}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" variants={stepVariants} initial="initial" animate="animate" exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <StepIdentitas data={formData} onChange={updateData} onBack={back} onNext={next} />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <StepBodyStats data={formData} onChange={updateData} onBack={back} onNext={next} />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <StepGoal data={formData} onChange={updateData} onBack={back} onNext={next} />
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="s4" variants={stepVariants} initial="initial" animate="animate" exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <StepKecepatan data={formData} onChange={updateData} onBack={back} onNext={next} />
                </motion.div>
              )}
              {step === 5 && (
                <motion.div key="s5" variants={stepVariants} initial="initial" animate="animate" exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <StepAktivitas data={formData} onChange={updateData} onBack={back} onNext={next} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Step 6 — Done */}
      {step === 6 && (
        <div style={{
          flex: 1, overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          padding: '24px 0 32px',
        }}>
          <AnimatePresence mode="wait">
            <motion.div key="s6" variants={stepVariants} initial="initial" animate="animate"
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <StepDone data={formData} onFinish={finishOnboarding} />
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
