const DAYS_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const timeToMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const minToTime = (min) => {
  const h = Math.floor((min % 1440) / 60);
  const m = Math.floor(min % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const addMinutes = (t, mins) => minToTime(timeToMin(t) + mins);
const subtractMinutes = (t, mins) => minToTime(timeToMin(t) - mins + 1440);

export function generateRecommendedSchedule({ pekerjaan, jamMulai, jamSelesai, hariMulai, hariSelesai, targetTidur = 7.5 }) {
  const idxStart = DAYS_ORDER.indexOf(hariMulai);
  const idxEnd = DAYS_ORDER.indexOf(hariSelesai);

  const isBusyDay = (day) => {
    const idx = DAYS_ORDER.indexOf(day);
    if (idx === -1) return false;
    if (idxStart <= idxEnd) {
      return idx >= idxStart && idx <= idxEnd;
    } else {
      return idx >= idxStart || idx <= idxEnd;
    }
  };

  const scheduleWeekly = {};

  DAYS_ORDER.forEach((day) => {
    if (isBusyDay(day)) {
      // Busy Day Schedule
      if (pekerjaan === 'pelajar' || pekerjaan === 'kantoran' || pekerjaan === 'mahasiswa') {
        const wakeUp = subtractMinutes(jamMulai, 120); // 2 hours before school/work
        const sleepStart = subtractMinutes(wakeUp, Math.round(targetTidur * 60));
        
        const agenda = [
          { start: wakeUp, end: addMinutes(wakeUp, 30), label: 'Bangun Tidur', icon: '⏰', warna: '#FF6B00' },
          { start: addMinutes(wakeUp, 30), end: addMinutes(wakeUp, 75), label: 'Sarapan & Persiapan', icon: '🍳', warna: '#22C55E' },
          { start: addMinutes(wakeUp, 75), end: jamMulai, label: 'Perjalanan', icon: '🏃', warna: '#F59E0B' },
        ];

        // Check if lunch fits in the middle
        const workStartMin = timeToMin(jamMulai);
        const workEndMin = timeToMin(jamSelesai);
        const lunchStartMin = timeToMin('12:00');
        const lunchEndMin = timeToMin('13:00');

        const labelKerja = pekerjaan === 'pelajar' ? 'Sekolah' : pekerjaan === 'mahasiswa' ? 'Kuliah' : 'Bekerja (Kantor)';
        const iconKerja = pekerjaan === 'pelajar' ? '🏫' : pekerjaan === 'mahasiswa' ? '🎓' : '💼';

        if (workStartMin < lunchStartMin && workEndMin > lunchEndMin) {
          agenda.push({ start: jamMulai, end: '12:00', label: labelKerja, icon: iconKerja, warna: '#3B82F6' });
          agenda.push({ start: '12:00', end: '13:00', label: 'Makan Siang & Istirahat', icon: '🍱', warna: '#22C55E' });
          agenda.push({ start: '13:00', end: jamSelesai, label: labelKerja, icon: iconKerja, warna: '#3B82F6' });
        } else {
          agenda.push({ start: jamMulai, end: jamSelesai, label: labelKerja, icon: iconKerja, warna: '#3B82F6' });
        }

        const commuteHomeEnd = addMinutes(jamSelesai, 60);
        agenda.push({ start: jamSelesai, end: commuteHomeEnd, label: 'Perjalanan Pulang / Istirahat', icon: '🏠', warna: '#F59E0B' });

        const gymStart = commuteHomeEnd;
        const gymEnd = addMinutes(gymStart, 90);
        agenda.push({ start: gymStart, end: gymEnd, label: 'Latihan di Gym', icon: '🏋️', warna: '#FF6B00' });

        const dinnerStart = gymEnd;
        const dinnerEnd = addMinutes(dinnerStart, 60);
        agenda.push({ start: dinnerStart, end: dinnerEnd, label: 'Makan Malam / Pasca-Latihan', icon: '🥗', warna: '#22C55E' });

        agenda.push({ start: dinnerEnd, end: sleepStart, label: 'Waktu Bebas & Rileks', icon: '📺', warna: '#F59E0B' });
        agenda.push({ start: sleepStart, end: wakeUp, label: 'Tidur', icon: '🌙', warna: '#3B82F6' });

        scheduleWeekly[day] = agenda.sort((a, b) => a.start.localeCompare(b.start));
      } else if (pekerjaan === 'freelance') {
        const wakeUp = '06:30';
        const sleepStart = subtractMinutes(wakeUp, Math.round(targetTidur * 60));

        const agenda = [
          { start: wakeUp, end: addMinutes(wakeUp, 30), label: 'Bangun Tidur', icon: '⏰', warna: '#FF6B00' },
          { start: addMinutes(wakeUp, 30), end: addMinutes(wakeUp, 90), label: 'Sarapan & Kopi', icon: '🍳', warna: '#22C55E' },
          { start: '08:30', end: '10:00', label: 'Latihan di Gym', icon: '🏋️', warna: '#FF6B00' },
          { start: '10:00', end: '10:30', label: 'Makanan Pasca-Latihan', icon: '🥗', warna: '#22C55E' },
        ];

        const workStartMin = timeToMin(jamMulai);
        const workEndMin = timeToMin(jamSelesai);
        const lunchStartMin = timeToMin('12:30');
        const lunchEndMin = timeToMin('13:30');

        if (workStartMin < lunchStartMin && workEndMin > lunchEndMin) {
          agenda.push({ start: jamMulai, end: '12:30', label: 'Bekerja / Project', icon: '💼', warna: '#3B82F6' });
          agenda.push({ start: '12:30', end: '13:30', label: 'Makan Siang & Istirahat', icon: '🍱', warna: '#22C55E' });
          agenda.push({ start: '13:30', end: jamSelesai, label: 'Bekerja / Project', icon: '💼', warna: '#3B82F6' });
        } else {
          agenda.push({ start: jamMulai, end: jamSelesai, label: 'Bekerja / Project', icon: '💼', warna: '#3B82F6' });
        }

        agenda.push({ start: jamSelesai, end: '18:30', label: 'Waktu Bebas / Hobi', icon: '🎮', warna: '#F59E0B' });
        agenda.push({ start: '18:30', end: '19:30', label: 'Makan Malam', icon: '🍽️', warna: '#22C55E' });
        agenda.push({ start: '19:30', end: sleepStart, label: 'Santai Malam', icon: '📺', warna: '#F59E0B' });
        agenda.push({ start: sleepStart, end: wakeUp, label: 'Tidur', icon: '🌙', warna: '#3B82F6' });

        scheduleWeekly[day] = agenda.sort((a, b) => a.start.localeCompare(b.start));
      } else {
        const wakeUp = '05:30';
        const sleepStart = subtractMinutes(wakeUp, Math.round(targetTidur * 60));

        const agenda = [
          { start: '05:30', end: '06:00', label: 'Bangun Tidur', icon: '⏰', warna: '#FF6B00' },
          { start: '06:00', end: '07:00', label: 'Menyiapkan Sarapan', icon: '🍳', warna: '#22C55E' },
          { start: '07:00', end: '12:00', label: 'Mengurus Rumah & Keluarga', icon: '🧹', warna: '#3B82F6' },
          { start: '12:00', end: '13:00', label: 'Makan Siang', icon: '🍱', warna: '#22C55E' },
          { start: '13:30', end: '15:00', label: 'Latihan di Gym / Olahraga', icon: '🏋️', warna: '#FF6B00' },
          { start: '15:00', end: '15:30', label: 'Cemilan Sehat', icon: '🥗', warna: '#22C55E' },
          { start: '16:00', end: '19:00', label: 'Mengurus Rumah & Masak', icon: '🧹', warna: '#3B82F6' },
          { start: '19:00', end: '20:00', label: 'Makan Malam Keluarga', icon: '🍽️', warna: '#22C55E' },
          { start: '20:00', end: sleepStart, label: 'Istirahat & Rileks', icon: '📺', warna: '#F59E0B' },
          { start: sleepStart, end: wakeUp, label: 'Tidur', icon: '🌙', warna: '#3B82F6' },
        ];

        scheduleWeekly[day] = agenda.sort((a, b) => a.start.localeCompare(b.start));
      }
    } else {
      // Free Day Schedule
      const wakeUp = '07:00';
      const sleepStart = subtractMinutes(wakeUp, Math.round(targetTidur * 60));

      const agenda = [
        { start: '07:00', end: '07:30', label: 'Bangun Tidur', icon: '⏰', warna: '#FF6B00' },
        { start: '07:30', end: '08:30', label: 'Sarapan Santai', icon: '🍳', warna: '#22C55E' },
        { start: '09:30', end: '11:00', label: 'Latihan di Gym', icon: '🏋️', warna: '#FF6B00' },
        { start: '11:00', end: '11:30', label: 'Nutrisi Pasca-Latihan', icon: '🥗', warna: '#22C55E' },
        { start: '12:30', end: '13:30', label: 'Makan Siang', icon: '🍱', warna: '#22C55E' },
        { start: '13:30', end: '16:00', label: 'Waktu Bebas / Hobi / Rekreasi', icon: '🏞️', warna: '#F59E0B' },
        { start: '16:00', end: '16:30', label: 'Cemilan Sore / Buah', icon: '🍎', warna: '#22C55E' },
        { start: '16:30', end: '18:30', label: 'Santai Sore / Jalan-jalan', icon: '🚶', warna: '#F59E0B' },
        { start: '18:30', end: '19:30', label: 'Makan Malam', icon: '🍽️', warna: '#22C55E' },
        { start: '19:30', end: sleepStart, label: 'Rileks Malam', icon: '📺', warna: '#F59E0B' },
        { start: sleepStart, end: wakeUp, label: 'Tidur', icon: '🌙', warna: '#3B82F6' },
      ];

      scheduleWeekly[day] = agenda.sort((a, b) => a.start.localeCompare(b.start));
    }
  });

  return scheduleWeekly;
}

export function integrateProgramIntoExistingJadwal(existingJadwal, programJadwal, waktuLatihanId) {
  const cloned = JSON.parse(JSON.stringify(existingJadwal));
  const DAYS_INDONESIAN = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const workoutTimeMap = {
    pagi: { start: '06:00', end: '07:30' },
    siang: { start: '12:00', end: '13:30' },
    sore: { start: '16:00', end: '17:30' },
    malam: { start: '19:00', end: '20:30' }
  };
  const gymTimes = workoutTimeMap[waktuLatihanId] || { start: '07:00', end: '08:30' };

  DAYS_INDONESIAN.forEach(day => {
    let dayAgenda = cloned[day] || [];
    const dayUpper = day.toUpperCase();
    const programDay = programJadwal.find(p => p.hari === dayUpper) || { aktif: false };

    // 1. Remove any existing workout/gym/latihan items
    dayAgenda = dayAgenda.filter(item => {
      const labelLower = item.label.toLowerCase();
      return !labelLower.includes('gym') && !labelLower.includes('latihan') && item.icon !== '🏋️';
    });

    if (programDay.aktif) {
      // 2. Insert the workout item
      const workoutItem = {
        start: gymTimes.start,
        end: gymTimes.end,
        label: `Latihan: ${programDay.label}`,
        icon: '🏋️',
        warna: '#FF6B00'
      };

      // 3. Insert a post-workout meal item (30 minutes after workout)
      const postWorkoutItem = {
        start: gymTimes.end,
        end: addMinutes(gymTimes.end, 30),
        label: 'Makanan Pasca-Latihan',
        icon: '🥗',
        warna: '#22C55E'
      };

      // 4. Check for overlaps with other activities (excluding Sleep or Work/Study if they are crucial, but adjust others)
      const gymStartMin = timeToMin(gymTimes.start);
      const gymEndMin = timeToMin(gymTimes.end);
      const mealStartMin = gymEndMin;
      const mealEndMin = timeToMin(postWorkoutItem.end);

      const isCritical = (label) => {
        const l = label.toLowerCase();
        return l.includes('tidur') || l.includes('sekolah') || l.includes('kuliah') || l.includes('bekerja') || l.includes('kantor');
      };

      let adjustedAgenda = [];

      dayAgenda.forEach(item => {
        const sMin = timeToMin(item.start);
        const eMin = timeToMin(item.end);

        // Check if crosses midnight or invalid
        if (eMin <= sMin) {
          // Keep critical/overnight items intact (usually sleep)
          adjustedAgenda.push(item);
          return;
        }

        // Check overlap with workout + post-workout combined block [gymStartMin, mealEndMin]
        const overlapsWorkout = (sMin < gymEndMin && eMin > gymStartMin);
        const overlapsMeal = (sMin < mealEndMin && eMin > mealStartMin);

        if (overlapsWorkout || overlapsMeal) {
          if (isCritical(item.label)) {
            // Keep critical items intact
            adjustedAgenda.push(item);
          } else {
            // Adjust start/end times
            let newStartMin = sMin;
            let newEndMin = eMin;

            // If it covers workout start
            if (sMin < gymStartMin && eMin > gymStartMin) {
              newEndMin = gymStartMin;
            }
            // If it covers meal end
            if (sMin < mealEndMin && eMin > mealEndMin) {
              newStartMin = mealEndMin;
            }

            if (newEndMin > newStartMin) {
              adjustedAgenda.push({
                ...item,
                start: minToTime(newStartMin),
                end: minToTime(newEndMin)
              });
            }
          }
        } else {
          adjustedAgenda.push(item);
        }
      });

      // Add workout and post-workout items
      adjustedAgenda.push(workoutItem);
      adjustedAgenda.push(postWorkoutItem);

      cloned[day] = adjustedAgenda.sort((a, b) => a.start.localeCompare(b.start));
    } else {
      cloned[day] = dayAgenda.sort((a, b) => a.start.localeCompare(b.start));
    }
  });

  return cloned;
}

export function generateRecommendedScheduleWithProgram({
  pekerjaan,
  jamMulai,
  jamSelesai,
  hariMulai,
  hariSelesai,
  targetTidur = 7.5,
  programJadwal,
  waktuLatihanId
}) {
  // 1. Generate the base schedule using the existing function
  const baseSchedule = generateRecommendedSchedule({
    pekerjaan,
    jamMulai,
    jamSelesai,
    hariMulai,
    hariSelesai,
    targetTidur
  });

  const cloned = {};
  const DAYS_INDONESIAN = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const workoutTimeMap = {
    pagi: { start: '06:00', end: '07:30' },
    siang: { start: '12:00', end: '13:30' },
    sore: { start: '16:00', end: '17:30' },
    malam: { start: '19:00', end: '20:30' }
  };
  const gymTimes = workoutTimeMap[waktuLatihanId] || { start: '07:00', end: '08:30' };

  DAYS_INDONESIAN.forEach(day => {
    let agenda = baseSchedule[day] || [];
    const dayUpper = day.toUpperCase();
    const programDay = programJadwal.find(p => p.hari === dayUpper) || { aktif: false };

    // Remove any default gym/latihan/pasca-latihan items
    agenda = agenda.filter(item => {
      const l = item.label.toLowerCase();
      return !l.includes('gym') && !l.includes('latihan') && !l.includes('pasca-latihan');
    });

    if (programDay.aktif) {
      // Create workout and post-workout items
      const workoutItem = {
        start: gymTimes.start,
        end: gymTimes.end,
        label: `Latihan: ${programDay.label}`,
        icon: '🏋️',
        warna: '#FF6B00'
      };
      const postWorkoutItem = {
        start: gymTimes.end,
        end: addMinutes(gymTimes.end, 30),
        label: 'Makanan Pasca-Latihan',
        icon: '🥗',
        warna: '#22C55E'
      };

      // Resolve overlaps
      const gymStartMin = timeToMin(gymTimes.start);
      const gymEndMin = timeToMin(gymTimes.end);
      const mealStartMin = gymEndMin;
      const mealEndMin = timeToMin(postWorkoutItem.end);

      const isCritical = (label) => {
        const l = label.toLowerCase();
        return l.includes('tidur') || l.includes('sekolah') || l.includes('kuliah') || l.includes('bekerja') || l.includes('kantor');
      };

      let adjustedAgenda = [];

      agenda.forEach(item => {
        const sMin = timeToMin(item.start);
        const eMin = timeToMin(item.end);

        if (eMin <= sMin) {
          // overnight items
          adjustedAgenda.push(item);
          return;
        }

        const overlapsWorkout = (sMin < gymEndMin && eMin > gymStartMin);
        const overlapsMeal = (sMin < mealEndMin && eMin > mealStartMin);

        if (overlapsWorkout || overlapsMeal) {
          if (isCritical(item.label)) {
            adjustedAgenda.push(item);
          } else {
            let newStartMin = sMin;
            let newEndMin = eMin;

            if (sMin < gymStartMin && eMin > gymStartMin) {
              newEndMin = gymStartMin;
            }
            if (sMin < mealEndMin && eMin > mealEndMin) {
              newStartMin = mealEndMin;
            }

            if (newEndMin > newStartMin) {
              adjustedAgenda.push({
                ...item,
                start: minToTime(newStartMin),
                end: minToTime(newEndMin)
              });
            }
          }
        } else {
          adjustedAgenda.push(item);
        }
      });

      adjustedAgenda.push(workoutItem);
      adjustedAgenda.push(postWorkoutItem);

      cloned[day] = adjustedAgenda.sort((a, b) => a.start.localeCompare(b.start));
    } else {
      cloned[day] = agenda.sort((a, b) => a.start.localeCompare(b.start));
    }
  });

  return cloned;
}
