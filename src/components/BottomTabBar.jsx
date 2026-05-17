import { motion } from 'framer-motion';
import useBillStore from '../store/useBillStore';
import Icon from './Icon';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'bills', label: 'Bills', icon: 'receipt_long' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export default function BottomTabBar() {
  const { ui, updateUI } = useBillStore();
  const activeTab = ui?.activeTab ?? 'bills';
  const step = ui?.step ?? 1;

  const setActiveTab = (tab) => updateUI({ activeTab: tab });
  const setStep = (newStep) => updateUI({ step: typeof newStep === 'function' ? newStep(step) : newStep });

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'bills') setStep(1);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-xl transition-all relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="bottom-tab-indicator"
                className="absolute -top-0.5 w-8 h-0.5 bg-indigo-600 rounded-full"
              />
            )}
            <Icon name={tab.icon} className={cn("text-xl", isActive ? "text-indigo-600" : "")} />
            <span className={cn("text-[10px] font-bold tracking-tight", isActive ? "text-indigo-600" : "")}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
