import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // ---- Tab Aktif ----
      tabAktif: 'dashboard',
      setTabAktif: (tab) => set({ tabAktif: tab }),

      // ---- Profil & Target Pengguna ----
      profil: {
        nama: '',
        gender: 'pria', // pria, wanita
        usia: 25,
        tinggi: 170,   // cm
        berat: 70,    // kg
        tingkatAktivitas: 'sedang', // sedentary, ringan, sedang, aktif, sangat_aktif
        tipeTarget: 'defisit',       // surplus, defisit, pemeliharaan
        beratTarget: 65,
        latihanPerMinggu: 4,
        targetTidur: 7.5,          // jam
        targetAir: 2500,         // ml
      },
      setProfil: (updates) => set((state) => ({
        profil: { ...state.profil, ...updates }
      })),

      // ---- TDEE & Makro (dihitung dari profil) ----
      hitungTDEE: () => {
        const { gender, usia, tinggi, berat, tingkatAktivitas, tipeTarget } = get().profil;
        // Mifflin-St Jeor BMR
        let bmr = gender === 'pria'
          ? 10 * berat + 6.25 * tinggi - 5 * usia + 5
          : 10 * berat + 6.25 * tinggi - 5 * usia - 161;

        const pengaliAktivitas = {
          sedentary: 1.2,
          ringan: 1.375,
          sedang: 1.55,
          aktif: 1.725,
          sangat_aktif: 1.9,
        };
        const tdee = bmr * (pengaliAktivitas[tingkatAktivitas] || 1.55);

        let kaloriTarget = tdee;
        if (tipeTarget === 'surplus')      kaloriTarget = tdee + 400;
        if (tipeTarget === 'defisit')      kaloriTarget = tdee - 400;

        const protein = Math.round(berat * (tipeTarget === 'defisit' ? 2.2 : 2.0));
        const lemak   = Math.round((kaloriTarget * 0.25) / 9);
        const karbohidrat = Math.round((kaloriTarget - protein * 4 - lemak * 9) / 4);

        return {
          bmr: Math.round(bmr),
          tdee: Math.round(tdee),
          kalori: Math.round(kaloriTarget),
          protein,
          lemak,
          karbohidrat,
        };
      },

      // ---- Timer Istirahat ----
      timerIstirahat: {
        aktif: false,
        durasi: 90,  // detik
        sisa: 90,
        idInterval: null,
      },
      mulaiTimerIstirahat: (durasi = 90) => {
        const { timerIstirahat } = get();
        if (timerIstirahat.idInterval) clearInterval(timerIstirahat.idInterval);

        set({ timerIstirahat: { aktif: true, durasi, sisa: durasi, idInterval: null } });

        const id = setInterval(() => {
          const sisaSekarang = get().timerIstirahat.sisa;
          if (sisaSekarang <= 1) {
            clearInterval(id);
            set({ timerIstirahat: { ...get().timerIstirahat, aktif: false, sisa: 0, idInterval: null } });
          } else {
            set({ timerIstirahat: { ...get().timerIstirahat, sisa: sisaSekarang - 1 } });
          }
        }, 1000);

        set({ timerIstirahat: { ...get().timerIstirahat, idInterval: id } });
      },
      hentikanTimerIstirahat: () => {
        const { timerIstirahat } = get();
        if (timerIstirahat.idInterval) clearInterval(timerIstirahat.idInterval);
        set({ timerIstirahat: { ...get().timerIstirahat, aktif: false, sisa: 0, idInterval: null } });
      },

      // ---- Sesi Latihan Aktif ----
      latihanAktif: null,
      setLatihanAktif: (latihan) => set({ latihanAktif: latihan }),
      bersihkanLatihanAktif: () => set({ latihanAktif: null }),

      // ---- Preferensi Tema ----
      tema: 'dark',  // 'dark' | 'light'
      setTema: (tema) => set({ tema: tema }),
    }),
    {
      name: 'bodyfit-store',
      partialize: (state) => ({
        profil: state.profil,
        tabAktif: state.tabAktif,
        tema: state.tema,
      }),
    }
  )
);

export default useStore;
