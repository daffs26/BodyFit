import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, BarChart2, BookOpen, User, Home, Target } from 'lucide-react';
import useStore from './store/useStore';

// Tabs
import DashboardTab from './components/DashboardTab';
import LoggerTab from './components/LoggerTab';
import AnalyticsTab from './components/AnalyticsTab';
import LibraryTab from './components/LibraryTab';
import PlannerTab from './components/PlannerTab';
import ProfileTab from './components/ProfileTab';
import OnboardingScreen from './components/OnboardingScreen';

const TABS = [
  { id: 'dashboard', label: 'Dasbor',   icon: Home,     component: DashboardTab },
  { id: 'logger',    label: 'Latihan',  icon: Dumbbell, component: LoggerTab    },
  { id: 'analytics', label: 'Analisis', icon: BarChart2, component: AnalyticsTab },
  { id: 'planner',   label: 'Rencana',  icon: Target,   component: PlannerTab   },
  { id: 'library',   label: 'Kamus',    icon: BookOpen, component: LibraryTab   },
  { id: 'profile',   label: 'Profil',   icon: User,     component: ProfileTab   },
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function App() {
  const { tabAktif, setTabAktif, tema, profil } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema || 'dark');
  }, [tema]);

  const ActiveComponent = TABS.find(t => t.id === tabAktif)?.component || DashboardTab;

  // Tampilkan onboarding jika belum selesai
  if (!profil.onboardingSelesai) {
    return (
      <motion.div
        key="onboarding"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3 }}
      >
        <OnboardingScreen />
      </motion.div>
    );
  }

  return (
    <div className="app-wrapper">
      {/* ---- Main Content ---- */}
      <main className="app-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={tabAktif}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ---- Bottom Navigation ---- */}
      <nav className="bottom-nav">
        {TABS.map(({ id, label, icon: Icon }) => {
          return (
            <button
              key={id}
              className={`bottom-nav__item ${tabAktif === id ? 'active' : ''}`}
              onClick={() => setTabAktif(id)}
              aria-label={label}
            >
              <span className="bottom-nav__icon">
                <Icon size={20} strokeWidth={tabAktif === id ? 2.5 : 1.8} />
              </span>
              <span className="bottom-nav__label">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
