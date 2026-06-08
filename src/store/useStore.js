import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // ---- Active Tab ----
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // ---- User Profile & Goals ----
      profile: {
        name: '',
        gender: 'male',
        age: 25,
        height: 170,   // cm
        weight: 70,    // kg
        activityLevel: 'moderate', // sedentary, light, moderate, active, very_active
        goalType: 'cutting',       // bulking, cutting, maintain
        targetWeight: 65,
        workoutsPerWeek: 4,
        sleepTarget: 7.5,          // jam
        waterTarget: 2500,         // ml
      },
      setProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
      })),

      // ---- TDEE & Macros (computed from profile) ----
      getTDEE: () => {
        const { gender, age, height, weight, activityLevel, goalType } = get().profile;
        // Mifflin-St Jeor BMR
        let bmr = gender === 'male'
          ? 10 * weight + 6.25 * height - 5 * age + 5
          : 10 * weight + 6.25 * height - 5 * age - 161;

        const activityMultipliers = {
          sedentary: 1.2, light: 1.375, moderate: 1.55,
          active: 1.725, very_active: 1.9,
        };
        const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

        let targetCalories = tdee;
        if (goalType === 'bulking')  targetCalories = tdee + 400;
        if (goalType === 'cutting')  targetCalories = tdee - 400;

        const protein = Math.round(weight * (goalType === 'cutting' ? 2.2 : 2.0));
        const fat     = Math.round((targetCalories * 0.25) / 9);
        const carbs   = Math.round((targetCalories - protein * 4 - fat * 9) / 4);

        return {
          bmr:      Math.round(bmr),
          tdee:     Math.round(tdee),
          calories: Math.round(targetCalories),
          protein,
          fat,
          carbs,
        };
      },

      // ---- Rest Timer ----
      restTimer: {
        isActive: false,
        duration: 90,  // detik
        remaining: 90,
        intervalId: null,
      },
      startRestTimer: (duration = 90) => {
        const { restTimer } = get();
        if (restTimer.intervalId) clearInterval(restTimer.intervalId);

        set({ restTimer: { isActive: true, duration, remaining: duration, intervalId: null } });

        const id = setInterval(() => {
          const current = get().restTimer.remaining;
          if (current <= 1) {
            clearInterval(id);
            set({ restTimer: { ...get().restTimer, isActive: false, remaining: 0, intervalId: null } });
          } else {
            set({ restTimer: { ...get().restTimer, remaining: current - 1 } });
          }
        }, 1000);

        set({ restTimer: { ...get().restTimer, intervalId: id } });
      },
      stopRestTimer: () => {
        const { restTimer } = get();
        if (restTimer.intervalId) clearInterval(restTimer.intervalId);
        set({ restTimer: { ...get().restTimer, isActive: false, remaining: 0, intervalId: null } });
      },

      // ---- Active Workout Session ----
      activeWorkout: null,
      setActiveWorkout: (workout) => set({ activeWorkout: workout }),
      clearActiveWorkout: () => set({ activeWorkout: null }),
    }),
    {
      name: 'bodyfit-store',
      partialize: (state) => ({
        profile: state.profile,
        activeTab: state.activeTab,
      }),
    }
  )
);

export default useStore;
