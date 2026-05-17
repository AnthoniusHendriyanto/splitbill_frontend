import { motion } from 'framer-motion';
import useBillStore from '../store/useBillStore';
import Icon from './Icon';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const steps = ["SCAN RECEIPT", "REVIEW LEDGER", "ADD PEOPLE", "ASSIGN SHARES", "SETTLEMENT"];

const getStepAccess = (idx, bill, isScanning) => {
  switch (idx) {
    case 0: return { unlocked: true, reason: '' };
    case 1: return { unlocked: !isScanning, reason: 'Wait for scan to complete or add items manually' };
    case 2: return { unlocked: bill.items.length > 0, reason: 'Add at least 1 item to the ledger first' };
    case 3: return { unlocked: bill.items.length > 0 && bill.persons.length >= 1 && bill.payerId && bill.title, reason: 'Set bill title, add people, and select payer first' };
    case 4: return { unlocked: bill.items.length > 0 && bill.persons.length >= 1 && bill.items.every(item => bill.persons.some(p => {
      try {
        return useBillStore.getState().assignments[p.id]?.[item.id];
      } catch { return false; }
    })), reason: 'Assign all items to participants first' };
    default: return { unlocked: false, reason: '' };
  }
};

const stepTitles = [
  'Upload Receipt',
  'Review Bill Ledger',
  'Add People',
  'Assign Item Shares',
  'Settlement Overview',
];

const stepSubtitles = [
  'Scan your receipt with AI OCR, or enter items manually.',
  'Review and correct items extracted from the receipt.',
  'Name the bill, add participants, and select who paid.',
  'Select who participates in each expense.',
  'Review the final individual breakdowns.',
];

export default function StepHeader({ currentStep, setStep, nextLabel, onNext, onBack, showActions = true, nextDisabled = false, bill, isScanning, isMobile = false }) {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-auto"
      >
        {/* On desktop: full step timeline. */}
        <nav className="hidden md:flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex-wrap">
          {steps.map((s, i) => {
            const { unlocked, reason } = getStepAccess(i, bill, isScanning);
            const isCurrent = currentStep === i + 1;
            const isPast = currentStep > i + 1;
            return (
              <div key={s} className="flex items-center">
                <button 
                  onClick={() => unlocked ? setStep(i + 1) : null}
                  title={!unlocked ? ` Locked: ${reason}` : ''}
                  className={cn(
                    "transition-colors relative group cursor-pointer border-none bg-transparent outline-none", 
                    isCurrent ? "text-indigo-600 font-extrabold" : "",
                    isPast && unlocked ? "text-slate-500 hover:text-indigo-500" : "",
                    !unlocked ? "opacity-40 cursor-not-allowed" : ""
                  )}
                >
                  {`${i + 1}. ${s}`}
                  {!unlocked && (
                    <span className="absolute left-0 top-5 z-50 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-xl border border-slate-700">
                       Locked: {reason}
                    </span>
                  )}
                </button>
                {i < steps.length - 1 && <Icon name="chevron_right" className={cn("text-[10px]", unlocked ? "opacity-30" : "opacity-15")} />}
              </div>
            );
          })}
        </nav>

        {/* Mobile Step Indicator Badge */}
        <div className="flex md:hidden mb-2">
          <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
            Step {currentStep} of 5 • {stepTitles[currentStep - 1]}
          </span>
        </div>

        <h1 className="font-black text-slate-900 dark:text-white tracking-tight text-2xl md:text-4xl">
          {stepTitles[currentStep - 1] ?? 'Bill'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 md:mt-2 text-xs md:text-sm font-medium">
          {stepSubtitles[currentStep - 1] ?? ''}
        </p>
      </motion.div>
      {showActions && (
        <div className="flex gap-3 w-full md:w-auto">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="flex-1 md:flex-none rounded-xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none px-4 py-2.5 md:px-6 md:py-3 text-xs md:text-sm"
          >
            Back
          </motion.button>
          <motion.button 
            whileHover={nextDisabled ? {} : { scale: 1.02 }}
            whileTap={nextDisabled ? {} : { scale: 0.98 }}
            onClick={nextDisabled ? undefined : onNext}
            disabled={nextDisabled}
            aria-disabled={nextDisabled}
            className={cn(
               "flex-1 md:flex-none rounded-xl font-bold transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 px-4 py-2.5 md:px-8 md:py-3 text-xs md:text-sm",
               nextDisabled ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none" : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 cursor-pointer focus-visible:ring-indigo-500"
            )}
          >
            {nextLabel}
            <Icon name="arrow_forward" className="text-xs md:text-sm" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
