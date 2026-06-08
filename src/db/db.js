import Dexie from 'dexie';

export const db = new Dexie('BodyFitDB');

db.version(1).stores({
  // Sesi latihan gym
  workouts: '++id, date, name, duration, notes',

  // Detail setiap set di dalam sesi latihan
  workoutLogs: '++id, workoutId, exerciseName, targetMuscle, setNumber, weight, reps, completed',

  // Kamus latihan (bawaan + kustom)
  exercises: '++id, name, targetMuscle, category, isCustom',

  // Log berat badan harian
  weightLogs: '++id, date, weight',

  // Log makanan harian
  foodLogs: '++id, date, name, calories, protein, carbs, fat, mealType',

  // Target bulanan & program latihan
  monthlyTargets: '++id, monthYear, goalType, targetWeight, currentWeight, selectedProgram, notes',

  // Log air minum harian
  waterLogs: '++id, date, amountMl',
});

// ---- Seed default exercises ----
db.on('ready', async () => {
  const count = await db.exercises.count();
  if (count > 0) return;

  await db.exercises.bulkAdd([
    // CHEST
    { name: 'Bench Press', targetMuscle: 'chest', category: 'Compound', isCustom: false },
    { name: 'Incline Bench Press', targetMuscle: 'chest', category: 'Compound', isCustom: false },
    { name: 'Dumbbell Fly', targetMuscle: 'chest', category: 'Isolation', isCustom: false },
    { name: 'Push Up', targetMuscle: 'chest', category: 'Bodyweight', isCustom: false },
    { name: 'Cable Crossover', targetMuscle: 'chest', category: 'Isolation', isCustom: false },
    { name: 'Decline Bench Press', targetMuscle: 'chest', category: 'Compound', isCustom: false },

    // BACK
    { name: 'Deadlift', targetMuscle: 'back', category: 'Compound', isCustom: false },
    { name: 'Pull Up', targetMuscle: 'back', category: 'Bodyweight', isCustom: false },
    { name: 'Barbell Row', targetMuscle: 'back', category: 'Compound', isCustom: false },
    { name: 'Lat Pulldown', targetMuscle: 'back', category: 'Compound', isCustom: false },
    { name: 'Seated Cable Row', targetMuscle: 'back', category: 'Compound', isCustom: false },
    { name: 'Dumbbell Row', targetMuscle: 'back', category: 'Compound', isCustom: false },
    { name: 'T-Bar Row', targetMuscle: 'back', category: 'Compound', isCustom: false },

    // LEGS
    { name: 'Squat', targetMuscle: 'legs', category: 'Compound', isCustom: false },
    { name: 'Leg Press', targetMuscle: 'legs', category: 'Compound', isCustom: false },
    { name: 'Romanian Deadlift', targetMuscle: 'legs', category: 'Compound', isCustom: false },
    { name: 'Leg Extension', targetMuscle: 'legs', category: 'Isolation', isCustom: false },
    { name: 'Leg Curl', targetMuscle: 'legs', category: 'Isolation', isCustom: false },
    { name: 'Calf Raise', targetMuscle: 'legs', category: 'Isolation', isCustom: false },
    { name: 'Lunges', targetMuscle: 'legs', category: 'Compound', isCustom: false },
    { name: 'Hack Squat', targetMuscle: 'legs', category: 'Compound', isCustom: false },

    // SHOULDERS
    { name: 'Overhead Press', targetMuscle: 'shoulders', category: 'Compound', isCustom: false },
    { name: 'Dumbbell Lateral Raise', targetMuscle: 'shoulders', category: 'Isolation', isCustom: false },
    { name: 'Front Raise', targetMuscle: 'shoulders', category: 'Isolation', isCustom: false },
    { name: 'Arnold Press', targetMuscle: 'shoulders', category: 'Compound', isCustom: false },
    { name: 'Face Pull', targetMuscle: 'shoulders', category: 'Isolation', isCustom: false },
    { name: 'Upright Row', targetMuscle: 'shoulders', category: 'Compound', isCustom: false },

    // ARMS
    { name: 'Barbell Curl', targetMuscle: 'arms', category: 'Isolation', isCustom: false },
    { name: 'Dumbbell Curl', targetMuscle: 'arms', category: 'Isolation', isCustom: false },
    { name: 'Hammer Curl', targetMuscle: 'arms', category: 'Isolation', isCustom: false },
    { name: 'Tricep Pushdown', targetMuscle: 'arms', category: 'Isolation', isCustom: false },
    { name: 'Skull Crusher', targetMuscle: 'arms', category: 'Isolation', isCustom: false },
    { name: 'Close Grip Bench Press', targetMuscle: 'arms', category: 'Compound', isCustom: false },
    { name: 'Preacher Curl', targetMuscle: 'arms', category: 'Isolation', isCustom: false },
    { name: 'Overhead Tricep Extension', targetMuscle: 'arms', category: 'Isolation', isCustom: false },

    // CORE
    { name: 'Plank', targetMuscle: 'core', category: 'Bodyweight', isCustom: false },
    { name: 'Crunches', targetMuscle: 'core', category: 'Bodyweight', isCustom: false },
    { name: 'Leg Raise', targetMuscle: 'core', category: 'Bodyweight', isCustom: false },
    { name: 'Cable Crunch', targetMuscle: 'core', category: 'Isolation', isCustom: false },
    { name: 'Russian Twist', targetMuscle: 'core', category: 'Bodyweight', isCustom: false },
    { name: 'Hanging Knee Raise', targetMuscle: 'core', category: 'Bodyweight', isCustom: false },
  ]);
});

export default db;
