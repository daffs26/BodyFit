import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Moon, Dumbbell, Droplets, ChevronDown, ChevronUp, Sun, Zap } from 'lucide-react';

// ── Data Panduan per Kombinasi Goal + Speed ────────────────────────────────────

const PANDUAN = {
  // CUTTING
  defisit_cepat: {
    makan: {
      kaloriDelta: '-600 kkal/hari',
      rasioMakro: { protein: '40%', karbo: '35%', lemak: '25%' },
      waktuMakan: ['Sarapan tinggi protein (06.00–08.00)', 'Pre-workout: karbohidrat sedang (1 jam sebelum)', 'Post-workout: protein shake (30 mnt setelah)', 'Makan malam ringan — kurangi karbo'],
      prioritas: ['Ayam/ikan tanpa lemak', 'Telur putih & tahu tempe', 'Oatmeal & ubi jalar', 'Sayur hijau tanpa batas'],
      hindari: ['Makanan cepat saji', 'Minuman manis', 'Karbohidrat olahan malam hari'],
    },
    tidur: {
      targetJam: '8–9 jam',
      waktu: ['Tidur pukul 21.30–22.00', 'Bangun pukul 05.30–06.00'],
      tips: ['Tidur cukup kritis saat cutting agresif — kurang tidur meningkatkan kortisol dan rasa lapar', 'Hindari layar 1 jam sebelum tidur', 'Suhu kamar 18–20°C optimal untuk kualitas tidur'],
    },
    latihan: {
      frekuensi: '4–5 hari/minggu',
      fokus: 'Pertahankan kekuatan, tambah kardio LISS',
      rincian: ['Weight training 4x: Upper-Lower atau PPL', 'Kardio LISS 2–3x/minggu (30–45 mnt jalan cepat/sepeda)', 'Hindari kardio intensif saat defisit besar'],
    },
    hidup: ['Hidrasi: 3–3.5 liter/hari — bantu kenyang dan metabolisme', 'Timbang berat pagi hari (setelah BAK, sebelum makan)', 'Foto progres mingguan (pencahayaan sama)', 'Kelola stres — kortisol tinggi menghambat fat loss'],
  },
  defisit_normal: {
    makan: {
      kaloriDelta: '-400 kkal/hari',
      rasioMakro: { protein: '35%', karbo: '40%', lemak: '25%' },
      waktuMakan: ['Sarapan lengkap (07.00–08.30)', 'Makan siang utama (12.00–13.00)', 'Pre/post-workout: snack protein', 'Makan malam lebih ringan dari siang'],
      prioritas: ['Protein lean: dada ayam, ikan, putih telur', 'Karbohidrat kompleks: nasi merah, oat', 'Lemak sehat: alpukat, kacang-kacangan', 'Sayur dan buah rendah kalori'],
      hindari: ['Makanan tinggi lemak jenuh', 'Camilan ultra-proses', 'Minum kalori (jus, soda, kopi manis)'],
    },
    tidur: {
      targetJam: '7–8 jam',
      waktu: ['Tidur pukul 22.00–23.00', 'Bangun pukul 06.00–07.00'],
      tips: ['Tidur yang cukup mencegah hilangnya massa otot saat defisit', 'Ritual tidur konsisten membantu kualitas istirahat', 'Hindari makan besar 2 jam sebelum tidur'],
    },
    latihan: {
      frekuensi: '3–4 hari/minggu',
      fokus: 'Weight training + kardio moderat',
      rincian: ['Weight training 3–4x: Full Body atau Upper-Lower', 'Kardio moderat 2x/minggu (20–30 mnt)', 'Jalan kaki 8.000–10.000 langkah/hari'],
    },
    hidup: ['Hidrasi: 2.5–3 liter/hari', 'Timbang berat 2–3x seminggu di waktu yang sama', 'Catat asupan makanan (membantu akurasi defisit)', 'Sabar — 0.4 kg/minggu adalah kecepatan ideal untuk jaga otot'],
  },
  defisit_lambat: {
    makan: {
      kaloriDelta: '-200 kkal/hari',
      rasioMakro: { protein: '30%', karbo: '45%', lemak: '25%' },
      waktuMakan: ['Makan 3x sehari di waktu tetap', 'Tidak perlu timing ketat', 'Fokus pada kualitas bukan waktu'],
      prioritas: ['Makanan rumahan yang seimbang', 'Protein cukup di tiap makan', 'Buah dan sayur di setiap makan'],
      hindari: ['Camilan tidak perlu malam hari', 'Minuman manis'],
    },
    tidur: {
      targetJam: '7–8 jam',
      waktu: ['Tidur dan bangun di waktu tetap', 'Sesuaikan dengan jadwal harian'],
      tips: ['Defisit kecil artinya tubuh tidak terlalu stres — tidur 7 jam sudah cukup', 'Kualitas lebih penting dari kuantitas'],
    },
    latihan: {
      frekuensi: '3 hari/minggu',
      fokus: 'Konsistensi jangka panjang',
      rincian: ['Full Body 3x/minggu cukup untuk pemula', 'Jalan kaki aktif setiap hari', 'Tidak perlu kardio intensif'],
    },
    hidup: ['Hidrasi: 2–2.5 liter/hari', 'Fokus pada habit kecil yang konsisten', 'Timbang berat mingguan (bukan harian)', 'Progress lambat tapi paling sustainable'],
  },

  // SURPLUS / BULKING
  surplus_cepat: {
    makan: {
      kaloriDelta: '+600 kkal/hari',
      rasioMakro: { protein: '30%', karbo: '50%', lemak: '20%' },
      waktuMakan: ['Sarapan besar (06.00–07.30) — karbohidrat dan protein tinggi', 'Pre-workout: karbohidrat + protein (1 jam sebelum)', 'Post-workout: protein + karbohidrat cepat (30 mnt setelah)', 'Sebelum tidur: protein casein (cottage cheese, susu)'],
      prioritas: ['Nasi putih, oat, roti gandum (energi)', 'Dada ayam, daging sapi, ikan salmon', 'Whey protein & susu full cream', 'Kacang-kacangan, alpukat, minyak zaitun'],
      hindari: ['Terlalu banyak lemak jenuh', 'Junk food sebagai sumber kalori — kualitas tetap penting'],
    },
    tidur: {
      targetJam: '8–9 jam',
      waktu: ['Tidur pukul 21.30–22.30', 'Bangun pukul 06.00'],
      tips: ['Tidur adalah saat otot tumbuh — growth hormone diproduksi saat tidur dalam', 'Hindari begadang saat bulking — menurunkan testosterone dan IGF-1', 'Tidur siang 20 menit boleh untuk recovery'],
    },
    latihan: {
      frekuensi: '5–6 hari/minggu',
      fokus: 'Volume tinggi, Progressive overload agresif',
      rincian: ['PPL 6x/minggu atau Arnold Split', 'Progressive overload setiap 1–2 minggu', 'Rep range 6–12 untuk hypertrophy', 'Kardio minimal — tidak lebih dari 2x/minggu ringan'],
    },
    hidup: ['Hidrasi: 3–4 liter/hari untuk dukung volume latihan', 'Creatine monohydrate 5g/hari (opsional, terbukti ilmiah)', 'Timbang berat pagi hari — targetkan +0.3–0.5 kg/minggu', 'Ukur lingkar otot (dada, bahu, lengan) tiap 2 minggu'],
  },
  surplus_normal: {
    makan: {
      kaloriDelta: '+400 kkal/hari',
      rasioMakro: { protein: '30%', karbo: '45%', lemak: '25%' },
      waktuMakan: ['Sarapan lengkap pagi hari', 'Makan siang besar (sumber energi utama)', 'Post-workout: makan utama atau protein shake', 'Camilan malam: kacang/susu/yogurt'],
      prioritas: ['Protein: 2g per kg berat badan per hari', 'Karbohidrat: nasi, ubi, oat, pasta', 'Lemak sehat: telur utuh, kacang, alpukat'],
      hindari: ['Makan sembarangan tanpa hitung kalori', 'Terlalu banyak lemak jenuh dari junk food'],
    },
    tidur: {
      targetJam: '7–9 jam',
      waktu: ['Tidur pukul 22.00–23.00', 'Bangun pukul 06.00–07.00'],
      tips: ['Growth hormone diproduksi saat tidur nyenyak', 'Otot pulih dan tumbuh selama tidur', 'Hindari begadang berturut-turut'],
    },
    latihan: {
      frekuensi: '4–5 hari/minggu',
      fokus: 'Hypertrophy + kekuatan',
      rincian: ['PPL 4–5x/minggu atau Upper-Lower Split', 'Fokus compound: Squat, Bench, Deadlift, OHP, Row', 'Progressive overload setiap 1–2 minggu', 'Kardio ringan 1–2x/minggu untuk jaga kondisi kardio'],
    },
    hidup: ['Hidrasi: 2.5–3.5 liter/hari', 'Tidur adalah kunci — jangan sacrifice sleep untuk latihan extra', 'Foto dan ukuran otot setiap 4 minggu', 'Kalori surplus = +0.4 kg/minggu — jika lebih, kurangi sedikit'],
  },
  surplus_lambat: {
    makan: {
      kaloriDelta: '+200 kkal/hari',
      rasioMakro: { protein: '30%', karbo: '45%', lemak: '25%' },
      waktuMakan: ['Tambahkan 1–2 snack kecil berprotein per hari', 'Makan 4x sehari lebih baik dari 3x', 'Tidak perlu timing ketat'],
      prioritas: ['Makanan padat nutrisi: telur, kacang, susu', 'Karbohidrat berkualitas: nasi, oat, ubi'],
      hindari: ['Kalori kosong dari junk food'],
    },
    tidur: {
      targetJam: '7–8 jam',
      waktu: ['Tidur dan bangun konsisten'],
      tips: ['Lean bulk (surplus kecil) artinya proses lambat — konsistensi 6+ bulan kuncinya', 'Tidur 7 jam cukup selama berkualitas'],
    },
    latihan: {
      frekuensi: '3–4 hari/minggu',
      fokus: 'Kekuatan dasar, teknik sempurna',
      rincian: ['Full Body atau Upper-Lower 3–4x/minggu', 'Fokus pada teknik compound movement', 'Naikkan beban setiap 2 minggu', 'Lean bulk = paling aman untuk pemula'],
    },
    hidup: ['Hidrasi: 2.5 liter/hari', 'Lean bulk tidak membuat gemuk — tapi butuh sabar', 'Target +0.1–0.2 kg/minggu adalah ideal', 'Ukur komposisi tubuh setiap bulan'],
  },

  // MAINTENANCE
  pemeliharaan_normal: {
    makan: {
      kaloriDelta: '= TDEE',
      rasioMakro: { protein: '25%', karbo: '50%', lemak: '25%' },
      waktuMakan: ['Makan 3x sehari di waktu tetap', 'Sarapan adalah yang paling penting', 'Makan malam tidak terlalu larut'],
      prioritas: ['Makanan seimbang dan beragam', 'Protein cukup: 1.6g/kg berat badan', 'Sayur dan buah setiap hari'],
      hindari: ['Pola makan tidak teratur', 'Terlalu banyak makanan ultra-proses'],
    },
    tidur: {
      targetJam: '7–8 jam',
      waktu: ['Tidur dan bangun di waktu yang sama setiap hari'],
      tips: ['Konsistensi waktu tidur lebih penting dari durasi', 'Ritme sirkadian yang stabil mendukung metabolisme optimal'],
    },
    latihan: {
      frekuensi: '3–4 hari/minggu',
      fokus: 'Pertahankan kekuatan dan kondisi',
      rincian: ['Weight training 3–4x/minggu', 'Kardio 2x/minggu untuk kesehatan kardiovaskular', 'Aktivitas fisik harian: jalan, naik tangga, dll'],
    },
    hidup: ['Hidrasi: 2–2.5 liter/hari', 'Timbang berat mingguan untuk monitor', 'Aktif bergerak sepanjang hari', 'Maintenance yang baik = fondasi untuk cut/bulk berikutnya'],
  },
};

function getPanduan(tipeTarget, kecepatanProgress) {
  if (tipeTarget === 'pemeliharaan') return PANDUAN.pemeliharaan_normal;
  const key = `${tipeTarget}_${kecepatanProgress || 'normal'}`;
  return PANDUAN[key] || PANDUAN.defisit_normal;
}

// ── Sub Komponen ──────────────────────────────────────────────────────────────

function Section({ title, icon: IconEl, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--color-border)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          background: open ? `${color}10` : 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: open ? '1px solid var(--color-border)' : 'none',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: open ? color : 'var(--color-surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          <IconEl size={16} color={open ? 'white' : color} />
        </div>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: open ? color : 'var(--color-text)' }}>
          {title}
        </div>
        {open ? <ChevronUp size={16} color="var(--color-text-muted)" /> : <ChevronDown size={16} color="var(--color-text-muted)" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 16px' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tag({ text, color, bg }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, background: bg, color,
    }}>
      {text}
    </span>
  );
}

function BulletList({ items, color }) {
  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: color, marginTop: 6,
          }} />
          <span style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.6 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function LifestyleGuide({ tipeTarget, kecepatanProgress }) {
  const panduan = getPanduan(tipeTarget, kecepatanProgress);

  const goalLabel = { surplus: 'Bulking', defisit: 'Cutting', pemeliharaan: 'Maintenance' }[tipeTarget] || '-';
  const speedLabel = { cepat: 'Cepat', normal: 'Normal', lambat: 'Lambat' }[kecepatanProgress] || '-';
  const goalColor = { surplus: '#22C55E', defisit: '#3B82F6', pemeliharaan: '#FF6B00' }[tipeTarget] || '#FF6B00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header context */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
        <Tag text={goalLabel} color={goalColor} bg={`${goalColor}20`} />
        {tipeTarget !== 'pemeliharaan' && (
          <Tag text={`Progress ${speedLabel}`} color="var(--color-primary)" bg="var(--color-primary-pale)" />
        )}
      </div>

      {/* 1. Pola Makan */}
      <Section title="Pola Makan" icon={Utensils} color="#22C55E" defaultOpen={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            padding: '10px 12px', borderRadius: 'var(--radius-md)',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <div style={{ fontSize: 11, color: '#22C55E', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 2 }}>
              DELTA KALORI HARIAN
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#22C55E' }}>
              {panduan.makan.kaloriDelta}
            </div>
          </div>

          {/* Rasio Makro */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)', letterSpacing: '0.04em', marginBottom: 8 }}>RASIO MAKRO</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: 'Protein', value: panduan.makan.rasioMakro.protein, color: '#FF8C33' },
                { label: 'Karbo',   value: panduan.makan.rasioMakro.karbo,   color: '#60A5FA' },
                { label: 'Lemak',   value: panduan.makan.rasioMakro.lemak,   color: '#FCD34D' },
              ].map(m => (
                <div key={m.label} style={{
                  flex: 1, padding: '8px 6px',
                  background: `${m.color}15`,
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)', letterSpacing: '0.04em', marginBottom: 8 }}>WAKTU MAKAN</div>
            <BulletList items={panduan.makan.waktuMakan} color="#22C55E" />
          </div>

          {/* Prioritas */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)', letterSpacing: '0.04em', marginBottom: 8 }}>PRIORITASKAN</div>
            <BulletList items={panduan.makan.prioritas} color="#22C55E" />
          </div>

          {/* Hindari */}
          {panduan.makan.hindari && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)', letterSpacing: '0.04em', marginBottom: 8 }}>BATASI / HINDARI</div>
              <BulletList items={panduan.makan.hindari} color="#EF4444" />
            </div>
          )}
        </div>
      </Section>

      {/* 2. Pola Tidur */}
      <Section title="Pola Tidur" icon={Moon} color="#3B82F6">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            padding: '10px 12px', borderRadius: 'var(--radius-md)',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
          }}>
            <div style={{ fontSize: 11, color: '#3B82F6', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 2 }}>
              TARGET TIDUR
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#3B82F6' }}>
              {panduan.tidur.targetJam}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)', letterSpacing: '0.04em', marginBottom: 8 }}>JADWAL IDEAL</div>
            <BulletList items={panduan.tidur.waktu} color="#3B82F6" />
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)', letterSpacing: '0.04em', marginBottom: 8 }}>TIPS TIDUR</div>
            <BulletList items={panduan.tidur.tips} color="#3B82F6" />
          </div>
        </div>
      </Section>

      {/* 3. Pola Latihan */}
      <Section title="Pola Latihan" icon={Dumbbell} color="#FF6B00">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-pale)', border: '1px solid rgba(255,107,0,0.2)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, marginBottom: 2, letterSpacing: '0.04em' }}>FREKUENSI</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary)' }}>{panduan.latihan.frekuensi}</div>
            </div>
            <div style={{
              flex: 2, padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-2)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 2, letterSpacing: '0.04em' }}>FOKUS</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-sub)' }}>{panduan.latihan.fokus}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-sub)', letterSpacing: '0.04em', marginBottom: 8 }}>RINCIAN PROGRAM</div>
            <BulletList items={panduan.latihan.rincian} color="var(--color-primary)" />
          </div>
        </div>
      </Section>

      {/* 4. Gaya Hidup */}
      <Section title="Gaya Hidup & Pemulihan" icon={Droplets} color="#A855F7">
        <BulletList items={panduan.hidup} color="#A855F7" />
      </Section>
    </div>
  );
}
