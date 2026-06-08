import Dexie from 'dexie';

export const db = new Dexie('BodyFitDB');

db.version(1).stores({
  // Sesi latihan gym
  sesiLatihan: '++id, tanggal, nama, durasi, catatan',

  // Detail setiap set di dalam sesi latihan
  catatanLatihan: '++id, latihanId, namaLatihan, ototTarget, nomorSet, beban, repetisi, selesai',

  // Kamus latihan (bawaan + kustom)
  kamusLatihan: '++id, nama, ototTarget, kategori, kustom',

  // Log berat badan harian
  catatanBerat: '++id, tanggal, berat',

  // Log makanan harian
  catatanMakanan: '++id, tanggal, nama, kalori, protein, karbohidrat, lemak, jenisMakan',

  // Target bulanan & program latihan
  targetBulanan: '++id, bulanTahun, tipeTarget, beratTarget, beratSekarang, programPilihan, catatan',

  // Log air minum harian
  catatanAir: '++id, tanggal, jumlahMl',
});

// ---- Seed default exercises ----
function dapatkanInfoGerakan(nama) {
  const data = {
    // DADA
    'Bench Press': {
      alat: 'Barbel',
      instruksi: [
        'Berbaringlah telentang di bangku datar dengan kaki menapak di lantai.',
        'Genggam barbel dengan tangan sedikit lebih lebar dari bahu.',
        'Turunkan barbel secara perlahan ke dada bagian bawah.',
        'Dorong barbel kembali ke atas dengan kuat hingga lengan lurus kembali.'
      ]
    },
    'Incline Bench Press': {
      alat: 'Barbel',
      instruksi: [
        'Berbaringlah di bangku dengan kemiringan 30-45 derajat.',
        'Genggam barbel sedikit lebih lebar dari bahu.',
        'Turunkan barbel ke dada bagian atas secara terkontrol.',
        'Dorong kembali ke atas hingga lengan lurus.'
      ]
    },
    'Dumbbell Fly': {
      alat: 'Dumbel',
      instruksi: [
        'Berbaring di bangku datar dengan memegang dumbel di atas dada, telapak tangan saling berhadapan.',
        'Turunkan lengan ke samping membentuk busur lebar dengan siku sedikit ditekuk.',
        'Rasakan regangan pada otot dada Anda.',
        'Kembalikan dumbel ke posisi semula dengan gerakan meremas otot dada.'
      ]
    },
    'Push Up': {
      alat: 'Beban Tubuh',
      instruksi: [
        'Posisikan tubuh tengkurap dengan tangan di lantai sedikit lebih lebar dari bahu.',
        'Jaga tubuh tetap lurus dari kepala hingga tumit.',
        'Turunkan tubuh dengan menekuk siku hingga dada hampir menyentuh lantai.',
        'Dorong tubuh kembali ke posisi awal.'
      ]
    },
    'Cable Crossover': {
      alat: 'Mesin Kabel',
      instruksi: [
        'Atur katrol kabel di posisi tinggi dan pasang pegangan D.',
        'Berdiri di tengah mesin, ambil satu langkah ke depan untuk menciptakan tegangan kabel.',
        'Bawa tangan Anda ke depan dan ke bawah hingga bertemu di depan pinggang.',
        'Perlahan kembali ke posisi awal dengan dada meregang.'
      ]
    },
    'Decline Bench Press': {
      alat: 'Barbel',
      instruksi: [
        'Berbaring di bangku decline (kemiringan menurun).',
        'Genggam barbel dengan jarak tangan sedikit lebih lebar dari bahu.',
        'Turunkan barbel ke dada bagian bawah.',
        'Dorong kembali ke atas dengan kuat.'
      ]
    },

    // PUNGGUNG
    'Deadlift': {
      alat: 'Barbel',
      instruksi: [
        'Berdiri dengan kaki selebar pinggul di belakang barbel.',
        'Tekuk pinggul dan lutut untuk memegang barbel dengan punggung lurus.',
        'Dorong kaki Anda ke lantai dan luruskan tubuh untuk mengangkat barbel.',
        'Turunkan kembali barbel ke lantai dengan terkendali.'
      ]
    },
    'Pull Up': {
      alat: 'Beban Tubuh',
      instruksi: [
        'Gantung pada palang pull-up dengan telapak tangan menghadap ke depan.',
        'Tarik tubuh Anda ke atas dengan memfokuskan tarikan pada otot punggung dan siku.',
        'Angkat tubuh hingga dagu melewati palang.',
        'Turunkan tubuh kembali ke posisi menggantung secara perlahan.'
      ]
    },
    'Barbell Row': {
      alat: 'Barbel',
      instruksi: [
        'Pegang barbel dengan posisi tubuh membungkuk 45 derajat, punggung lurus.',
        'Tarik barbel ke arah perut bagian bawah Anda.',
        'Remas otot punggung di puncak gerakan.',
        'Turunkan kembali barbel ke posisi awal secara terkontrol.'
      ]
    },
    'Lat Pulldown': {
      alat: 'Mesin Kabel',
      instruksi: [
        'Duduk di mesin lat pulldown dan genggam palang lebih lebar dari bahu.',
        'Tarik palang ke bawah menuju dada bagian atas dengan menarik siku ke bawah.',
        'Remas otot punggung bagian atas di bagian bawah gerakan.',
        'Kembalikan palang ke atas secara perlahan.'
      ]
    },
    'Seated Cable Row': {
      alat: 'Mesin Kabel',
      instruksi: [
        'Duduk di mesin cable row dengan kaki bertumpu pada pijakan, lutut sedikit ditekuk.',
        'Pegang pegangan kabel dan tarik ke arah perut bagian bawah.',
        'Jaga punggung tetap tegak dan tarik belikat ke belakang.',
        'Luruskan kembali lengan ke depan secara perlahan.'
      ]
    },
    'Dumbbell Row': {
      alat: 'Dumbel',
      instruksi: [
        'Tempatkan lutut kanan dan tangan kanan di atas bangku datar.',
        'Pegang dumbel dengan tangan kiri, biarkan lengan kiri menggantung lurus.',
        'Tarik dumbel ke atas ke arah pinggul kiri, jaga siku tetap dekat dengan tubuh.',
        'Turunkan kembali dumbel secara perlahan.'
      ]
    },
    'T-Bar Row': {
      alat: 'Barbel',
      instruksi: [
        'Berdiri mengangkang pada barbel yang diletakkan di lantai (T-Bar landmine).',
        'Bungkukkan tubuh 45 derajat, jaga punggung tetap lurus.',
        'Tarik barbel ke atas menuju dada menggunakan kekuatan punggung.',
        'Turunkan kembali barbel secara perlahan.'
      ]
    },

    // KAKI
    'Squat': {
      alat: 'Barbel',
      instruksi: [
        'Letakkan barbel di atas bahu bagian belakang (trapezius), berdiri tegak.',
        'Turunkan pinggul ke bawah dan belakang seolah-olah ingin duduk.',
        'Turun hingga paha minimal sejajar dengan lantai.',
        'Dorong tubuh kembali ke posisi berdiri tegak menggunakan paha.'
      ]
    },
    'Leg Press': {
      alat: 'Mesin Kaki',
      instruksi: [
        'Duduk di mesin leg press dan letakkan kaki selebar bahu pada platform.',
        'Lepaskan kunci pengaman mesin.',
        'Tekuk lutut untuk menurunkan platform secara perlahan ke arah dada.',
        'Dorong platform kembali ke atas menggunakan kekuatan kaki (jangan mengunci lutut di atas).'
      ]
    },
    'Romanian Deadlift': {
      alat: 'Barbel',
      instruksi: [
        'Berdiri tegak memegang barbel di depan paha.',
        'Dorong pinggul ke belakang sambil menurunkan barbel di sepanjang kaki.',
        'Jaga lutut hanya sedikit tertekuk dan punggung tetap lurus.',
        'Kembali ke posisi berdiri tegak dengan meremas otot bokong dan paha belakang.'
      ]
    },
    'Leg Extension': {
      alat: 'Mesin Kaki',
      instruksi: [
        'Duduk di mesin leg extension, posisikan bantalan di atas pergelangan kaki.',
        'Genggam pegangan mesin untuk menstabilkan tubuh.',
        'Tendang kaki ke atas hingga lurus sepenuhnya.',
        'Turunkan kembali kaki secara terkendali.'
      ]
    },
    'Leg Curl': {
      alat: 'Mesin Kaki',
      instruksi: [
        'Berbaring tengkurap (atau duduk) di mesin leg curl, bantalan di belakang tumit.',
        'Tekuk lutut untuk menarik bantalan ke arah bokong.',
        'Remas otot paha belakang di puncak gerakan.',
        'Kembalikan bantalan kaki ke posisi awal secara perlahan.'
      ]
    },
    'Calf Raise': {
      alat: 'Beban Tubuh',
      instruksi: [
        'Berdiri di ujung pijakan/balok dengan tumit menggantung.',
        'Turunkan tumit ke bawah untuk meregangkan otot betis.',
        'Dorong ujung kaki ke bawah untuk mengangkat tubuh setinggi mungkin.',
        'Tahan sesaat, lalu turunkan kembali secara perlahan.'
      ]
    },
    'Lunges': {
      alat: 'Dumbel',
      instruksi: [
        'Berdiri tegak dengan memegang dumbel di samping tubuh.',
        'Langkahkan kaki kanan jauh ke depan.',
        'Tekuk kedua lutut hingga lutut kiri hampir menyentuh lantai.',
        'Dorong kembali tubuh ke posisi berdiri semula, ulangi untuk kaki kiri.'
      ]
    },
    'Hack Squat': {
      alat: 'Mesin Kaki',
      instruksi: [
        'Posisikan bahu di bawah bantalan mesin hack squat, kaki di platform.',
        'Lepaskan tuas pengaman mesin.',
        'Tekuk lutut untuk berjongkok secara terkontrol.',
        'Dorong tubuh kembali ke atas menggunakan otot paha.'
      ]
    },

    // BAHU
    'Overhead Press': {
      alat: 'Barbel',
      instruksi: [
        'Pegang barbel di depan bahu Anda, berdiri tegak.',
        'Kencangkan otot perut dan bokong.',
        'Dorong barbel langsung ke atas kepala hingga lengan lurus.',
        'Turunkan kembali barbel ke depan bahu secara terkontrol.'
      ]
    },
    'Dumbbell Lateral Raise': {
      alat: 'Dumbel',
      instruksi: [
        'Berdiri tegak dengan dumbel di samping tubuh.',
        'Angkat lengan ke samping tubuh dengan siku sedikit ditekuk.',
        'Angkat hingga lengan sejajar dengan lantai.',
        'Turunkan kembali dumbel secara perlahan.'
      ]
    },
    'Front Raise': {
      alat: 'Dumbel',
      instruksi: [
        'Berdiri tegak memegang dumbel di depan paha.',
        'Angkat lengan ke depan tubuh secara bergantian atau bersamaan.',
        'Angkat hingga lengan sejajar dengan bahu/lantai.',
        'Turunkan kembali dumbel secara perlahan.'
      ]
    },
    'Arnold Press': {
      alat: 'Dumbel',
      instruksi: [
        'Duduk tegak memegang dumbel di depan dada, telapak tangan menghadap wajah Anda.',
        'Dorong dumbel ke atas kepala sambil memutar pergelangan tangan.',
        'Di puncak gerakan, telapak tangan harus menghadap ke depan.',
        'Turunkan kembali dumbel sambil diputar ke posisi awal.'
      ]
    },
    'Face Pull': {
      alat: 'Mesin Kabel',
      instruksi: [
        'Pasang tali pada katrol kabel setinggi dada/bahu.',
        'Genggam ujung tali, berjalan mundur untuk menciptakan tegangan.',
        'Tarik tali ke arah hidung/wajah dengan siku tinggi ke samping.',
        'Kembalikan lengan ke depan secara perlahan.'
      ]
    },
    'Upright Row': {
      alat: 'Barbel',
      instruksi: [
        'Berdiri tegak memegang barbel di depan tubuh.',
        'Tarik barbel ke atas menuju dagu dengan mengangkat siku tinggi ke samping.',
        'Jaga barbel tetap dekat dengan tubuh.',
        'Turunkan kembali barbel secara perlahan.'
      ]
    },

    // LENGAN
    'Barbell Curl': {
      alat: 'Barbel',
      instruksi: [
        'Berdiri tegak memegang barbel dengan genggaman menghadap ke atas.',
        'Tekuk siku untuk mengangkat barbel ke arah bahu.',
        'Remas otot bisep di puncak gerakan.',
        'Turunkan kembali barbel secara perlahan ke posisi awal.'
      ]
    },
    'Dumbbell Curl': {
      alat: 'Dumbel',
      instruksi: [
        'Berdiri tegak memegang dumbel di samping tubuh dengan telapak tangan menghadap ke depan.',
        'Tekuk siku bergantian atau bersamaan untuk mengangkat dumbel ke arah bahu.',
        'Remas otot bisep, lalu turunkan dumbel secara perlahan.'
      ]
    },
    'Hammer Curl': {
      alat: 'Dumbel',
      instruksi: [
        'Berdiri tegak memegang dumbel di samping tubuh, telapak tangan saling berhadapan.',
        'Tekuk siku untuk mengangkat dumbel ke atas (genggaman netral).',
        'Remas otot lengan atas dan lengan bawah di puncak gerakan.',
        'Turunkan kembali dumbel secara terkontrol.'
      ]
    },
    'Tricep Pushdown': {
      alat: 'Mesin Kabel',
      instruksi: [
        'Berdiri menghadap mesin kabel dengan tali atau palang terpasang di atas.',
        'Genggam tali dengan siku menempel di sisi tubuh.',
        'Dorong tali ke bawah hingga lengan lurus sepenuhnya.',
        'Kembalikan siku ke posisi semula secara perlahan.'
      ]
    },
    'Skull Crusher': {
      alat: 'Barbel',
      instruksi: [
        'Berbaring telentang di bangku datar memegang EZ-bar atau barbel lurus di atas dada.',
        'Tekuk siku saja untuk menurunkan barbel ke arah dahi Anda.',
        'Jaga lengan atas tetap tegak lurus dengan lantai (jangan gerakkan bahu).',
        'Dorong kembali barbel ke posisi awal menggunakan trisep.'
      ]
    },
    'Close Grip Bench Press': {
      alat: 'Barbel',
      instruksi: [
        'Berbaring telentang di bangku datar dengan genggaman barbel selebar bahu.',
        'Turunkan barbel secara terkendali ke dada bagian tengah.',
        'Dorong barbel kembali ke atas dengan memfokuskan dorongan pada otot trisep.'
      ]
    },
    'Preacher Curl': {
      alat: 'Barbel',
      instruksi: [
        'Duduk di bangku preacher, letakkan lengan atas di atas bantalan miring.',
        'Genggam barbel dan angkat ke atas ke arah bahu.',
        'Remas otot bisep di puncak gerakan.',
        'Turunkan kembali barbel secara penuh secara terkontrol.'
      ]
    },
    'Overhead Tricep Extension': {
      alat: 'Dumbel',
      instruksi: [
        'Duduk atau berdiri, pegang satu dumbel dengan kedua tangan di belakang kepala.',
        'Tekuk siku untuk menurunkan dumbel ke belakang leher.',
        'Dorong dumbel ke atas kepala hingga lengan lurus kembali.'
      ]
    },

    // PERUT
    'Plank': {
      alat: 'Beban Tubuh',
      instruksi: [
        'Posisikan tubuh bertumpu pada lengan bawah dan ujung kaki.',
        'Jaga tubuh tetap lurus dari kepala hingga tumit.',
        'Kencangkan otot perut dan bokong, lalu bernapaslah teratur.'
      ]
    },
    'Crunches': {
      alat: 'Beban Tubuh',
      instruksi: [
        'Berbaring telentang dengan lutut ditekuk, kaki menapak di lantai.',
        'Letakkan tangan di belakang kepala atau silang di dada.',
        'Angkat pundak Anda dari lantai beberapa sentimeter menggunakan otot perut.',
        'Turunkan kembali pundak secara perlahan.'
      ]
    },
    'Leg Raise': {
      alat: 'Beban Tubuh',
      instruksi: [
        'Berbaring telentang dengan tangan di bawah pinggul.',
        'Angkat kedua kaki lurus ke atas hingga membentuk sudut 90 derajat.',
        'Turunkan kaki perlahan mendekati lantai tanpa menyentuhnya.',
        'Angkat kembali kaki ke atas.'
      ]
    },
    'Cable Crunch': {
      alat: 'Mesin Kabel',
      instruksi: [
        'Berlutut di depan mesin kabel dengan tali terpasang di bagian atas.',
        'Pegang tali dan tempatkan tangan di samping kepala Anda.',
        'Tekuk tubuh Anda ke bawah menuju lantai menggunakan kekuatan otot perut.',
        'Kembali secara perlahan ke posisi awal.'
      ]
    },
    'Russian Twist': {
      alat: 'Beban Tubuh',
      instruksi: [
        'Duduk di lantai dengan lutut ditekuk, condongkan tubuh ke belakang sedikit.',
        'Angkat kaki sedikit dari lantai jika memungkinkan.',
        'Putar tubuh Anda ke kiri lalu ke kanan sambil memegang tangan di depan dada.'
      ]
    },
    'Hanging Knee Raise': {
      alat: 'Beban Tubuh',
      instruksi: [
        'Gantung pada palang pull-up.',
        'Angkat lutut Anda ke atas menuju dada menggunakan kekuatan otot perut bawah.',
        'Turunkan kembali kaki secara perlahan ke posisi menggantung.'
      ]
    }
  };
  return data[nama] || { alat: 'Beban Tubuh', instruksi: ['Lakukan latihan sesuai kemampuan Anda.'] };
}

db.on('ready', async () => {
  const count = await db.kamusLatihan.count();
  if (count > 0) return;

  const latihanAwal = [
    // DADA
    { nama: 'Bench Press', ototTarget: 'dada', kategori: 'Komposit', kustom: false },
    { nama: 'Incline Bench Press', ototTarget: 'dada', kategori: 'Komposit', kustom: false },
    { nama: 'Dumbbell Fly', ototTarget: 'dada', kategori: 'Isolasi', kustom: false },
    { nama: 'Push Up', ototTarget: 'dada', kategori: 'Beban Tubuh', kustom: false },
    { nama: 'Cable Crossover', ototTarget: 'dada', kategori: 'Isolasi', kustom: false },
    { nama: 'Decline Bench Press', ototTarget: 'dada', kategori: 'Komposit', kustom: false },

    // PUNGGUNG
    { nama: 'Deadlift', ototTarget: 'punggung', kategori: 'Komposit', kustom: false },
    { nama: 'Pull Up', ototTarget: 'punggung', kategori: 'Beban Tubuh', kustom: false },
    { nama: 'Barbell Row', ototTarget: 'punggung', kategori: 'Komposit', kustom: false },
    { nama: 'Lat Pulldown', ototTarget: 'punggung', kategori: 'Komposit', kustom: false },
    { nama: 'Seated Cable Row', ototTarget: 'punggung', kategori: 'Komposit', kustom: false },
    { nama: 'Dumbbell Row', ototTarget: 'punggung', kategori: 'Komposit', kustom: false },
    { nama: 'T-Bar Row', ototTarget: 'punggung', kategori: 'Komposit', kustom: false },

    // KAKI
    { nama: 'Squat', ototTarget: 'kaki', kategori: 'Komposit', kustom: false },
    { nama: 'Leg Press', ototTarget: 'kaki', kategori: 'Komposit', kustom: false },
    { nama: 'Romanian Deadlift', ototTarget: 'kaki', kategori: 'Komposit', kustom: false },
    { nama: 'Leg Extension', ototTarget: 'kaki', kategori: 'Isolasi', kustom: false },
    { nama: 'Leg Curl', ototTarget: 'kaki', kategori: 'Isolasi', kustom: false },
    { nama: 'Calf Raise', ototTarget: 'kaki', kategori: 'Isolasi', kustom: false },
    { nama: 'Lunges', ototTarget: 'kaki', kategori: 'Komposit', kustom: false },
    { nama: 'Hack Squat', ototTarget: 'kaki', kategori: 'Komposit', kustom: false },

    // BAHU
    { nama: 'Overhead Press', ototTarget: 'bahu', kategori: 'Komposit', kustom: false },
    { nama: 'Dumbbell Lateral Raise', ototTarget: 'bahu', kategori: 'Isolasi', kustom: false },
    { nama: 'Front Raise', ototTarget: 'bahu', kategori: 'Isolasi', kustom: false },
    { nama: 'Arnold Press', ototTarget: 'bahu', kategori: 'Komposit', kustom: false },
    { nama: 'Face Pull', ototTarget: 'bahu', kategori: 'Isolasi', kustom: false },
    { nama: 'Upright Row', ototTarget: 'bahu', kategori: 'Komposit', kustom: false },

    // LENGAN
    { nama: 'Barbell Curl', ototTarget: 'lengan', kategori: 'Isolasi', kustom: false },
    { nama: 'Dumbbell Curl', ototTarget: 'lengan', kategori: 'Isolasi', kustom: false },
    { nama: 'Hammer Curl', ototTarget: 'lengan', kategori: 'Isolasi', kustom: false },
    { nama: 'Tricep Pushdown', ototTarget: 'lengan', kategori: 'Isolasi', kustom: false },
    { nama: 'Skull Crusher', ototTarget: 'lengan', kategori: 'Isolasi', kustom: false },
    { nama: 'Close Grip Bench Press', ototTarget: 'lengan', kategori: 'Komposit', kustom: false },
    { nama: 'Preacher Curl', ototTarget: 'lengan', kategori: 'Isolasi', kustom: false },
    { nama: 'Overhead Tricep Extension', ototTarget: 'lengan', kategori: 'Isolasi', kustom: false },

    // PERUT
    { nama: 'Plank', ototTarget: 'perut', kategori: 'Beban Tubuh', kustom: false },
    { nama: 'Crunches', ototTarget: 'perut', kategori: 'Beban Tubuh', kustom: false },
    { nama: 'Leg Raise', ototTarget: 'perut', kategori: 'Beban Tubuh', kustom: false },
    { nama: 'Cable Crunch', ototTarget: 'perut', kategori: 'Isolasi', kustom: false },
    { nama: 'Russian Twist', ototTarget: 'perut', kategori: 'Beban Tubuh', kustom: false },
    { nama: 'Hanging Knee Raise', ototTarget: 'perut', kategori: 'Beban Tubuh', kustom: false },
  ].map(item => {
    const info = dapatkanInfoGerakan(item.nama);
    return { ...item, alat: info.alat, instruksi: info.instruksi };
  });

  await db.kamusLatihan.bulkAdd(latihanAwal);
});

export default db;
