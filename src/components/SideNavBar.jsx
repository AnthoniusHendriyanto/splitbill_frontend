import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useBillStore from '../store/useBillStore';
import useAuthStore from '../store/useAuthStore';
import Icon from './Icon';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'bills', label: 'Bills', icon: 'receipt_long' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const SideNavBar = memo(({ onHelpOpen }) => {
  const { ui, updateUI } = useBillStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const activeTab = ui?.activeTab ?? 'bills';
  const step = ui?.step ?? 1;

  const setActiveTab = (tab) => updateUI({ activeTab: tab });
  const setStep = (newStep) => updateUI({ step: typeof newStep === 'function' ? newStep(step) : newStep });

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] border-r bg-slate-50 dark:bg-slate-900 border-gray-200 dark:border-gray-800 flex flex-col py-6 font-inter antialiased text-sm font-medium z-50 shadow-xl">
      <div className="px-6 mb-8">
        <Link to="/" className="flex items-center gap-3 mb-2 no-underline">
          <motion.div 
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
          >
            <Icon name="payments" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">SplitMate</span>
            <span className="text-xs text-slate-500 uppercase tracking-widest text-[10px]">Financial Ledger</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all relative group cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 outline-none",
              activeTab === item.id 
                ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/30 shadow-subtle" 
                : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-subtle"
            )}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="nav-pill"
                className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
              />
            )}
            <Icon name={item.icon} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-indigo-600" : "")} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-4 mb-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveTab('bills'); setStep(1); }}
          className="w-full bg-indigo-600 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 outline-none"
        >
          <Icon name="add" />
          New Bill
        </motion.button>
      </div>

      {/* User info */}
      {isAuthenticated && user && (
        <div className="px-3 mb-2">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">{user.tier || 'free'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-gray-200 dark:border-gray-800 pt-4 px-3 space-y-1">
        <button 
          onClick={onHelpOpen}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
        >
          <Icon name="help" />
          Help Center
        </button>
        {isAuthenticated ? (
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-600 dark:hover:text-red-500 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 outline-none"
          >
            <Icon name="logout" />
            Logout
          </button>
        ) : (
          <Link 
            to="/login"
            className="w-full flex items-center gap-3 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all cursor-pointer no-underline focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            <Icon name="login" />
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
});

export default SideNavBar;
