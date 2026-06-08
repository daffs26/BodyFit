import React from 'react';
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

const TABS = [
  { id: 'dashboard', label: 'Home',     icon: Home,     component: DashboardTab },
  { id: 'logger',    label: 'Log',      icon: Dumbbell, component: LoggerTab    },
  { id: 'analytics', label: 'Progress', icon: BarChart2, component: AnalyticsTab },
  { id: 'planner',   label: 'Plan',     icon: Target,   component: PlannerTab   },
  { id: 'library',   label: 'Library',  icon: BookOpen, component: LibraryTab   },
  { id: 'profile',   label: 'Profile',  icon: User,     component: ProfileTab   },
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function App() {
  const { activeTab, setActiveTab } = useStore();
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || DashboardTab;

  return (
    <div className="app-wrapper">
      {/* ---- Main Content ---- */}
      <main className="app-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
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
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`bottom-nav__item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
            aria-label={label}
          >
            <span className="bottom-nav__icon">
              <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.8} />
            </span>
            <span className="bottom-nav__label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
