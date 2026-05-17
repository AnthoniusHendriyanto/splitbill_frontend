import { memo } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Icon from './Icon';

const TopNavBar = memo(() => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm flex justify-between items-center px-8 z-40 font-inter text-sm">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 ring-primary/20 transition-all text-sm"
            placeholder="Search items or people..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
          <button aria-label="Notifications" className="p-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            <Icon name="notifications" />
          </button>
          <button aria-label="History" className="p-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
            <Icon name="history" />
          </button>
        </div>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <div className="text-right">
                <p className="text-xs font-bold text-on-surface">{user.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.tier || 'free'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold border-2 border-indigo-300">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-sm no-underline"
            >
              <Icon name="login" className="text-sm" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
});

export default TopNavBar;
