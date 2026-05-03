import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import useBillStore from './store/useBillStore';
import PriceInput from './components/PriceInput';
import DebtMap from './components/DebtMap';
import { formatIDR } from './utils/currency';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Hoisted outside component — stable reference, no re-creation on render
// (react-best-practices: rendering-hoist-jsx)
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'bills', label: 'Bills', icon: 'receipt_long' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

// --- Components ---

const Icon = ({ name, className }) => (
  <span className={cn("material-symbols-outlined", className)}>{name}</span>
);

// React.memo: prevents re-render when parent updates but props unchanged
// (react-best-practices: rerender-memo)
const SideNavBar = memo(({ currentStep, setStep, activeTab, setActiveTab }) => (
  <aside className="fixed left-0 top-0 h-full w-[280px] border-r bg-slate-50 dark:bg-slate-900 border-gray-200 dark:border-gray-800 flex flex-col py-6 font-inter antialiased text-sm font-medium z-50 shadow-xl">
    <div className="px-6 mb-8">
      <div className="flex items-center gap-3 mb-2">
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
      </div>
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
    <div className="mt-auto border-t border-gray-200 dark:border-gray-800 pt-4 px-3 space-y-1">
      <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none">
        <Icon name="help" />
        Help Center
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-600 dark:hover:text-red-500 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 outline-none">
        <Icon name="logout" />
        Logout
      </button>
    </div>
  </aside>
));

// React.memo: top bar never changes content based on bill state (react-best-practices: rerender-memo)
const TopNavBar = memo(() => (
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
        <div className="text-right">
          <p className="text-xs font-bold text-on-surface">Alex Rivera</p>
          <p className="text-[10px] text-slate-500">Premium Member</p>
        </div>
        <img
          alt="User Profile"
          className="w-10 h-10 rounded-full border-2 border-primary-fixed-dim"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcMrPx7ITAcH1o14zZI4jrfOINpG1Z1m5Q7kI8e6x4OFQaSgXCN6ZSINqBFhWTRuFxtKiIyOG4HEQnB86wLgmQ3-0ZLkfWv-zzm0fciHrzTnkw0IroC6VQay0UMapuFtnHXKMyLsPTscPO6M2_I2VeyIu8d7k9Z3aDmyud2JmhpsIe0Jq7nuIaTju1bMuwMG4kAFbR7j-9yQWHtLd-6rrbdeLfdS3z-8o82uc-soHc2oXu0I1tyBM7kcMEHd5PS8YSvCUv35ReIHj4"
        />
      </div>
    </div>
  </header>
));

const StepHeader = ({ currentStep, setStep, nextLabel, onNext, onBack, showActions = true, nextDisabled = false, bill, isScanning }) => {
  const steps = ["SCAN RECEIPT", "REVIEW LEDGER", "ADD PEOPLE", "ASSIGN SHARES", "SETTLEMENT"];

  // Poka-Yoke: define prerequisites for each step
  // Returns { unlocked: bool, reason: string } per step index (0-based)
  const getStepAccess = (idx) => {
    switch (idx) {
      case 0: return { unlocked: true, reason: '' };                                               // Always accessible
      case 1: return { unlocked: !isScanning, reason: 'Wait for scan to complete or add items manually' };
      case 2: return { unlocked: bill.items.length > 0, reason: 'Add at least 1 item to the ledger first' };
      case 3: return { unlocked: bill.items.length > 0 && bill.persons.length >= 1 && bill.payerId && bill.title, reason: 'Set bill title, add people, and select payer first' };
      case 4: return { unlocked: bill.items.length > 0 && bill.persons.length >= 1 && bill.items.every(item => bill.persons.some(p => useBillStore.getState().assignments[p.id]?.[item.id])), reason: 'Assign all items to participants first' };
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

  return (
    <div className="flex justify-between items-end mb-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <nav className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex-wrap">
          {steps.map((s, i) => {
            const { unlocked, reason } = getStepAccess(i);
            const isCurrent = currentStep === i + 1;
            const isPast = currentStep > i + 1;
            return (
              <React.Fragment key={s}>
                <button 
                  onClick={() => unlocked ? setStep(i + 1) : null}
                  title={!unlocked ? `🔒 ${reason}` : ''}
                  className={cn(
                    "transition-colors relative group", 
                    isCurrent ? "text-indigo-600 font-extrabold" : "",
                    isPast && unlocked ? "text-slate-500 hover:text-indigo-500" : "",
                    !unlocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                  )}
                >
                  {`${i + 1}. ${s}`}
                  {/* Tooltip for locked steps */}
                  {!unlocked && (
                    <span className="absolute left-0 top-5 z-50 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-xl border border-slate-700">
                      🔒 {reason}
                    </span>
                  )}
                </button>
                {i < steps.length - 1 && <Icon name="chevron_right" className={cn("text-[10px]", unlocked ? "opacity-30" : "opacity-15")} />}
              </React.Fragment>
            );
          })}
        </nav>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {stepTitles[currentStep - 1] ?? 'Bill'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
          {stepSubtitles[currentStep - 1] ?? ''}
        </p>
      </motion.div>
      {showActions && (
        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            Back
          </motion.button>
          <motion.button 
            whileHover={nextDisabled ? {} : { scale: 1.05 }}
            whileTap={nextDisabled ? {} : { scale: 0.95 }}
            onClick={nextDisabled ? undefined : onNext}
            disabled={nextDisabled}
            aria-disabled={nextDisabled}
            className={cn(
               "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
               nextDisabled ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none" : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 cursor-pointer focus-visible:ring-indigo-500"
            )}
          >
            {nextLabel}
            <Icon name="arrow_forward" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

// --- App Component ---

export default function App() {
  const { bill, updateBill, addItem, updateItem, removeItem, addPerson, updatePerson, removePerson, calculateTotals, settings, updateSettings, ui, updateUI } = useBillStore();
  const step = ui?.step ?? 1;
  const activeTab = ui?.activeTab ?? 'bills';

  // useCallback: stable references prevent unnecessary child re-renders
  // (react-best-practices: rerender-functional-setstate)
  const setStep = useCallback((newStep) => updateUI({ step: typeof newStep === 'function' ? newStep(step) : newStep }), [step, updateUI]);
  const setActiveTab = useCallback((tab) => updateUI({ activeTab: tab }), [updateUI]);

  const [isScanning, setIsScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // New state added
  const [uploadError, setUploadError] = useState(null); // Kaizen: Poka-Yoke — surface errors to user

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // useCallback: stable reference for upload handler won't re-create on each render
  const handleUpload = useCallback(async (file) => {
    if (!file) return;
    // Kaizen: validate early (Poka-Yoke)
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG, HEIC, etc.)');
      return;
    }
    setUploadError(null);
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      await new Promise(r => setTimeout(r, 2000)); // Simulate AI reading animation
      const response = await fetch('http://localhost:8080/api/v1/ocr', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data?.items?.length) {
        updateBill({ 
          items: data.items.map(item => ({ id: crypto.randomUUID(), name: item.name, price: item.price })),
          serviceCharge: data.service_charge || 0,
          tax: data.tax || 0
        });
        setStep(2);
      } else {
        setUploadError('No items found in receipt. Try a clearer image or enter items manually.');
      }
    } catch (error) {
      console.error('OCR Failed', error);
      setUploadError('Could not read receipt. Check that the backend is running and try again.');
    } finally {
      setIsScanning(false);
    }
  }, [updateBill, setStep]);

  // useMemo: avoid re-running expensive reduce on every single render
  // (react-best-practices: rerender-memo — extract expensive work)
  const receiptSubtotal = useMemo(
    () => bill.items.reduce((sum, item) => sum + item.price, 0),
    [bill.items]
  );

  const receiptService = useMemo(() => 
    bill.serviceMode === 'percent' ? receiptSubtotal * (bill.serviceCharge / 100) : (bill.serviceCharge || 0),
    [receiptSubtotal, bill.serviceMode, bill.serviceCharge]
  );

  const receiptTax = useMemo(() => 
    bill.taxMode === 'percent' ? receiptSubtotal * (bill.tax / 100) : (bill.tax || 0),
    [receiptSubtotal, bill.taxMode, bill.tax]
  );

  const receiptGrandTotal = useMemo(() => 
    receiptSubtotal + receiptService + receiptTax,
    [receiptSubtotal, receiptService, receiptTax]
  );

  const personTotals = useMemo(() => calculateTotals(), [calculateTotals]);

  // js-index-maps: build a Map once for O(1) person lookups vs .find() on every render
  const personsMap = useMemo(
    () => new Map(bill.persons.map(p => [p.id, p])),
    [bill.persons]
  );

  const renderStep = () => {
    switch (step) {
      case 3: {
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6 max-w-2xl mx-auto w-full"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-subtle surface-molded">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Icon name="edit_note" className="text-indigo-600" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div className="relative group">
                  <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-slate-900 text-[10px] font-bold text-indigo-600 uppercase tracking-wider z-10 transition-colors group-focus-within:text-indigo-500">Bill Title</label>
                  <input 
                    value={bill.title}
                    onChange={(e) => updateBill({ title: e.target.value })}
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-lg outline-none"
                    placeholder="e.g. Dinner at Le Petit Bistro"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-subtle surface-molded">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icon name="group" className="text-indigo-600" />
                  Participants
                </h3>
                <motion.button 
                  whileHover={bill.persons.some(p => !p.name.trim()) ? {} : { scale: 1.05 }}
                  whileTap={bill.persons.some(p => !p.name.trim()) ? {} : { scale: 0.95 }}
                  onClick={bill.persons.some(p => !p.name.trim()) ? undefined : addPerson}
                  disabled={bill.persons.some(p => !p.name.trim())}
                  className={cn(
                    "font-bold text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    bill.persons.some(p => !p.name.trim()) ? "text-slate-400 cursor-not-allowed" : "text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer"
                  )}
                >
                  <Icon name="person_add" className="text-lg" />
                  Add Member
                </motion.button>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {bill.persons.map((p) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-3 group items-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
                        {p.name.charAt(0) || <Icon name="person" className="text-sm" />}
                      </div>
                      <input 
                        value={p.name}
                        onChange={(e) => updatePerson(p.id, { name: e.target.value })}
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium outline-none dark:text-white"
                        placeholder="Person Name"
                      />
                      <button 
                        aria-label="Remove person"
                        onClick={() => removePerson(p.id)}
                        className="p-2 text-slate-300 hover:text-red-600 dark:hover:text-red-500 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md"
                      >
                        <Icon name="delete" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {bill.persons.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-3">Who Paid the Total Bill?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {bill.persons.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => updateBill({ payerId: p.id })}
                          className={cn(
                            "px-4 py-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none",
                            bill.payerId === p.id 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                              : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-200"
                          )}
                        >
                          {bill.payerId === p.id && <Icon name="check_circle" className="text-sm" />}
                          {p.name || "Unnamed"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {bill.persons.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6 italic">Add at least one person to start splitting.</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      }
      case 1: {
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6 max-w-2xl mx-auto w-full"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-subtle surface-molded">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Icon name="document_scanner" className="text-indigo-600" />
                Upload Receipt
              </h3>
              
              {!isScanning ? (
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e.dataTransfer.files[0]); }}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden group",
                      isDragging ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    )}
                  >
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e.target.files[0])} />
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 transition-colors shadow-sm">
                       <Icon name="cloud_upload" className="text-3xl" />
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Drag & Drop receipt image</p>
                    <p className="text-sm text-slate-500 font-medium">or click to browse from your device</p>
                  </div>
              ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden">
                     {/* Scanning Animation */}
                     <div className="w-full absolute left-0 top-0 h-1 bg-indigo-600/20">
                       <motion.div 
                         initial={{ left: '-100%' }}
                         animate={{ left: '100%' }}
                         transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                         className="absolute top-0 w-1/2 h-full bg-indigo-500 shadow-[0_0_15px_3px_rgba(79,70,229,0.5)]" 
                       />
                     </div>
                     <div className="relative mb-6 mt-4">
                        <Icon name="receipt_long" className="text-[80px] text-slate-200 dark:text-slate-800" />
                        <motion.div 
                          initial={{ top: 0, opacity: 0.8 }}
                          animate={{ top: '100%', opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatType: "reverse" }}
                          className="absolute left-0 w-full h-[6px] bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.9)] z-10 rounded-full"
                        />
                     </div>
                     <h4 className="font-black text-xl text-slate-900 dark:text-white mb-2 tracking-tight">AI Reading Receipt...</h4>
                     <p className="text-slate-500 text-sm font-medium">Extracting items, prices, tax, and service charge.<br/>This takes just a moment.</p>
                  </div>
              )}
              {/* Kaizen: Poka-Yoke — surface upload errors clearly so user never wonders what went wrong */}
              {uploadError && (
                <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <Icon name="error" className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{uploadError}</p>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md p-2 cursor-pointer"
              >
                 Skip Upload (Manual Entry)
              </button>
            </div>
          </motion.div>
        );
      }
      case 2: {
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-6 flex-1 min-h-0"
          >
            {/* Receipt Preview */}
            <div className="w-[380px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col group relative shadow-premium surface-molded">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icon name="document_scanner" className="text-indigo-600" />
                  Receipt Ledger
                </h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-lg uppercase tracking-wider">High Accuracy</span>
              </div>
              <div className="flex-1 p-6 overflow-y-auto bg-slate-100/30 dark:bg-slate-950 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-900 p-8 shadow-2xl rounded-sm border border-slate-200 dark:border-slate-800 min-h-[600px] flex flex-col relative liquid-glaze">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600/10"></div>
                  <div className="text-center mb-10 mt-4">
                    <p className="font-black text-xl uppercase tracking-[0.2em] text-slate-900 dark:text-white">{bill.title || "LE PETIT BISTRO"}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">ORDER #9821 • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                  </div>
                  <div className="space-y-4 flex-1">
                    {bill.items.map(item => (
                      <div key={item.id} className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 border-dashed">
                        <span className="font-medium text-slate-600 dark:text-slate-400 uppercase">{item.name || "UNNAMED ITEM"}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatIDR(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-4 border-t-2 border-slate-200 dark:border-slate-700 space-y-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                     <div className="flex justify-between items-center">
                        <span>Subtotal</span>
                        <span className="text-slate-900 dark:text-white font-black text-xs">{formatIDR(receiptSubtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>Service Charge</span>
                        <span className="text-slate-900 dark:text-white font-black text-xs">{formatIDR(receiptService)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>Tax</span>
                        <span className="text-slate-900 dark:text-white font-black text-xs">{formatIDR(receiptTax)}</span>
                     </div>
                  </div>
                  <div className="mt-4 pt-4 border-t-4 border-double border-slate-900 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-black text-sm tracking-tighter">GRAND TOTAL</span>
                    <span className="text-xl font-black">{formatIDR(receiptGrandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Table */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium flex flex-col overflow-hidden surface-molded">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Detected Items</h3>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addItem} 
                  className="bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Icon name="add" className="text-lg" />
                  Add Row
                </motion.button>
              </div>
              <div className="overflow-y-auto flex-1 hide-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-left">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    <AnimatePresence>
                      {bill.items.map((item) => (
                        <motion.tr 
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="hover:bg-slate-50 dark:hover:bg-indigo-950/10 transition-colors group"
                        >
                          <td className="px-6 py-4 border-r border-slate-100 dark:border-slate-800/50">
                            <input 
                              value={item.name}
                              onChange={(e) => updateItem(item.id, { name: e.target.value })}
                              className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-900 dark:text-white p-0 text-lg placeholder-slate-300"
                              placeholder="Wagyu Steak"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <PriceInput 
                              variant="ghost"
                              value={item.price}
                              onChange={(val) => updateItem(item.id, { price: val })}
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button aria-label="Delete item" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-600 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md">
                              <Icon name="delete" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bill.items.length} TOTAL ITEMS</p>
                   <div className="text-right">
                     <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex justify-end mb-1">Receipt Subtotal</p>
                     <p className="text-xl font-bold text-slate-700 dark:text-slate-300">Rp {formatIDR(receiptSubtotal)}</p>
                   </div>
                 </div>

                 {/* Tax and Service Block */}
                 <div className="grid grid-cols-2 gap-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                    {/* Service */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Charge</label>
                          <div className="flex bg-white dark:bg-slate-900 rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-700">
                            <button onClick={() => updateBill({ serviceMode: 'percent' })} className={cn("px-2 py-0.5 text-[9px] font-bold rounded-md transition-all", bill.serviceMode === 'percent' ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-400")}>%</button>
                            <button onClick={() => updateBill({ serviceMode: 'amount' })} className={cn("px-2 py-0.5 text-[9px] font-bold rounded-md transition-all", bill.serviceMode === 'amount' ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-400")}>Rp</button>
                          </div>
                        </div>
                        {bill.serviceMode === 'percent' ? (
                            <input type="number" value={bill.serviceCharge === null || bill.serviceCharge === undefined ? '' : bill.serviceCharge} onChange={(e) => updateBill({ serviceCharge: parseFloat(e.target.value) || 0 })} className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none px-3 font-bold text-sm" placeholder="5" />
                        ) : (
                            <PriceInput value={bill.serviceCharge || 0} onChange={(val) => updateBill({ serviceCharge: val })} className="h-[38px] text-sm" />
                        )}
                    </div>
                    {/* Tax */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tax</label>
                          <div className="flex bg-white dark:bg-slate-900 rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-700">
                            <button onClick={() => updateBill({ taxMode: 'percent' })} className={cn("px-2 py-0.5 text-[9px] font-bold rounded-md transition-all", bill.taxMode === 'percent' ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-400")}>%</button>
                            <button onClick={() => updateBill({ taxMode: 'amount' })} className={cn("px-2 py-0.5 text-[9px] font-bold rounded-md transition-all", bill.taxMode === 'amount' ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-400")}>Rp</button>
                          </div>
                        </div>
                        {bill.taxMode === 'percent' ? (
                            <input type="number" value={bill.tax === null || bill.tax === undefined ? '' : bill.tax} onChange={(e) => updateBill({ tax: parseFloat(e.target.value) || 0 })} className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none px-3 font-bold text-sm" placeholder="11" />
                        ) : (
                            <PriceInput value={bill.tax || 0} onChange={(val) => updateBill({ tax: val })} className="h-[38px] text-sm" />
                        )}
                    </div>
                 </div>

                 {/* Grand Total Preview */}
                 <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900 dark:border-slate-700 mt-2">
                    <span className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Grand Total</span>
                    <span className="text-2xl font-black text-indigo-600">Rp {formatIDR(receiptGrandTotal)}</span>
                 </div>
              </div>
            </div>
          </motion.div>
        );
      }
      case 4: {
        const { persons, items } = bill;
        const subtotal = items.reduce((sum, item) => sum + item.price, 0);
        
        return (
          <div className="flex flex-col gap-6 flex-1 min-h-0">
             {/* Dashboard Summary Grid (Bento Style) */}
             <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex items-center gap-8">
                    <div className="flex-1">
                        <p className="text-label-caps font-label-caps text-slate-500 mb-1 uppercase text-[10px] font-bold tracking-wider">TOTAL BILL LEDGER</p>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Rp {subtotal.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="w-px h-12 bg-gray-100 dark:bg-gray-800"></div>
                    <div className="flex-1">
                        <p className="text-label-caps font-label-caps text-slate-500 mb-1 uppercase text-[10px] font-bold tracking-wider">PARTICIPANTS</p>
                        <div className="flex -space-x-2 mt-1">
                          {persons.slice(0, 3).map((p, i) => (
                            <div key={p.id} className={cn("w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white", ["bg-primary", "bg-indigo-400", "bg-teal-500"][i % 3])}>
                              {p.name.charAt(0) || 'P'}
                            </div>
                          ))}
                          {persons.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900">
                              +{persons.length - 3}
                            </div>
                          )}
                        </div>
                    </div>
                </div>
                <div className="col-span-4 bg-indigo-50 dark:bg-indigo-950/30 border border-primary/10 rounded-xl p-6 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-indigo-900 dark:text-indigo-100 text-sm">Bulk Operations</p>
                        <Icon name="auto_awesome" className="text-indigo-600" />
                    </div>
                    <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            bill.persons.forEach(p => bill.items.forEach(item => {
                              if (!useBillStore.getState().assignments[p.id]?.[item.id]) {
                                useBillStore.getState().toggleAssignment(p.id, item.id);
                              }
                            }));
                          }}
                          className="flex-1 py-2 bg-white dark:bg-slate-800 text-primary dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all uppercase tracking-wider cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          Split ALL
                        </button>
                        <button 
                          onClick={() => {
                            // Kaizen: replace window.location.reload() with proper store reset (no full page reload)
                            resetBill();
                            setStep(1);
                          }}
                          className="flex-1 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all uppercase tracking-wider cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                        >
                          Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Spreadsheet Interface */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-gray-200 dark:border-gray-800">
                                <th className="px-6 py-4 font-label-caps text-label-caps text-slate-500 sticky left-0 bg-slate-50 dark:bg-slate-950 z-20 min-w-[280px] uppercase text-[10px] font-bold tracking-wider">
                                    ITEM DESCRIPTION
                                </th>
                                <th className="px-6 py-4 font-label-caps text-label-caps text-slate-500 text-right min-w-[120px] uppercase text-[10px] font-bold tracking-wider">
                                    UNIT PRICE
                                </th>
                                {persons.map(p => (
                                  <th key={p.id} className="px-6 py-4 font-label-caps text-label-caps text-slate-500 text-center min-w-[100px] uppercase text-[10px] font-bold tracking-wider">
                                    {p.name || "..." }
                                  </th>
                                ))}
                                <th className="px-6 py-4 font-label-caps text-label-caps text-indigo-600 text-right sticky right-0 bg-slate-50 dark:bg-slate-950 z-20 min-w-[140px] uppercase text-[10px] font-bold tracking-wider">
                                    COST / PERSON
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map((item) => {
                                const assignedCount = persons.filter(p => useBillStore.getState().assignments[p.id]?.[item.id]).length;
                                let costPerPerson = assignedCount > 0 ? item.price / assignedCount : 0;
                                if (settings.roundNumbers) costPerPerson = Math.round(costPerPerson);
                                
                                return (
                                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                      <td className="px-6 py-4 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10 transition-colors">
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                                                  <Icon name="restaurant" className="text-sm" />
                                              </div>
                                              <div>
                                              <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.name || "Unnamed Item"}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-right text-sm font-bold text-slate-700 dark:text-slate-200">Rp {item.price.toLocaleString('id-ID')}</td>
                                      {persons.map(p => (
                                        <td key={p.id} className="px-6 py-4 text-center">
                                            <input 
                                              type="checkbox"
                                              checked={useBillStore.getState().assignments[p.id]?.[item.id] || false}
                                              onChange={() => useBillStore.getState().toggleAssignment(p.id, item.id)}
                                              className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary/20 appearance-none border-2 checked:bg-primary checked:border-primary transition-all cursor-pointer relative after:content-[''] after:hidden checked:after:block after:absolute after:left-1.5 after:top-0.5 after:w-1.5 after:h-2.5 after:border-white after:border-b-2 after:border-r-2 after:rotate-45"
                                            />
                                        </td>
                                      ))}
                                      <td className="px-6 py-4 text-right sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10 font-bold text-indigo-600 transition-colors">
                                          Rp {costPerPerson.toLocaleString('id-ID')}
                                      </td>
                                  </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        );
      }
      case 5: {
        const totalGrand = personTotals.reduce((sum, p) => sum + p.total, 0);
        const totalTaxAndService = totalGrand - receiptSubtotal;

        return (
          <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-12">
            {/* Grand Total Card (Bento Style) */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-2xl p-10 relative overflow-hidden shadow-2xl shadow-indigo-600/30 dark:shadow-indigo-500/20 ring-1 ring-white/20 dark:ring-white/10 min-h-[260px] flex flex-col justify-between">
                    <div className="relative z-10">
                        <p className="font-label-caps text-label-caps text-on-primary/70 uppercase mb-2 text-xs font-bold tracking-widest">Grand Total Settlement</p>
                        <h3 className="text-6xl font-extrabold text-on-primary tracking-tighter">Rp {totalGrand.toLocaleString('id-ID')}</h3>
                    </div>
                    <div className="relative z-10 flex gap-12 mt-6">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-on-primary/60 mb-1 tracking-wider">Items Subtotal</p>
                            <p className="text-xl font-bold text-on-primary">Rp {receiptSubtotal.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="w-px h-10 bg-on-primary/20"></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-on-primary/60 mb-1 tracking-wider">Tax & Service</p>
                            <p className="text-xl font-bold text-on-primary">Rp {totalTaxAndService.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute right-20 top-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>
                </div>
                
                <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="font-label-caps text-label-caps text-slate-400 uppercase text-[10px] font-bold tracking-widest mb-4">Payment Intelligence</p>
                        {bill.payerId ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
                                  {personsMap.get(bill.payerId)?.name?.charAt(0) ?? 'P'}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Receipt Payer</p>
                                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{personsMap.get(bill.payerId)?.name ?? 'Unnamed'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase">To Receive</p>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">Rp {(totalGrand - (personTotals.find(p => p.id === bill.payerId)?.total || 0)).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 space-y-3">
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Receiving Method</p>
                              <div className="space-y-2">
                                <div className="relative group">
                                  <Icon name="account_balance" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                  <input 
                                    placeholder="Bank Name (e.g. BCA, Mandiri)"
                                    value={bill.persons.find(p => p.id === bill.payerId)?.paymentInfo?.bank || ''}
                                    onChange={(e) => updatePerson(bill.payerId, { paymentInfo: { bank: e.target.value } })}
                                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold transition-all"
                                  />
                                </div>
                                <div className="relative group">
                                  <Icon name="credit_card" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                  <input 
                                    placeholder="Account Number"
                                    value={bill.persons.find(p => p.id === bill.payerId)?.paymentInfo?.accountNumber || ''}
                                    onChange={(e) => updatePerson(bill.payerId, { paymentInfo: { accountNumber: e.target.value } })}
                                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold transition-all"
                                  />
                                </div>
                              </div>
                            </div>

                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const payer = bill.persons.find(p => p.id === bill.payerId);
                                const otherTotals = personTotals.filter(p => p.id !== bill.payerId && p.total > 0);
                                const totalToReceive = totalGrand - (personTotals.find(p => p.id === bill.payerId)?.total || 0);
                                
                                const message = `✨ *SplitMate Settlement: ${bill.title || 'Untitled Bill'}* ✨\n\n` + 
                                  `Total to Receive: *Rp ${totalToReceive.toLocaleString('id-ID')}*\n` +
                                  `━━━━━━━━━━━━━━━━━━━━\n\n` +
                                  otherTotals.map(p => `💸 *${p.name}*: Rp ${p.total.toLocaleString('id-ID')}`).join('\n') + 
                                  `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
                                  `🏦 *Transfer to ${payer.name}*\n` +
                                  `• ${payer.paymentInfo.bank || 'Bank (TBD)'}: ${payer.paymentInfo.accountNumber || 'Account (TBD)'}\n\n` +
                                  `_Generated with SplitMate Premium_`;
                                  
                                navigator.clipboard.writeText(message);
                                const btn = document.getElementById('copy-settlement-btn');
                                if (btn) {
                                  const originalText = btn.innerHTML;
                                  btn.innerHTML = '<span class="material-icons text-sm">check</span> COPIED!';
                                  setTimeout(() => btn.innerHTML = originalText, 2000);
                                }
                              }}
                              id="copy-settlement-btn"
                              className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-xl shadow-slate-900/10 dark:shadow-indigo-600/10"
                            >
                              <Icon name="content_copy" className="text-sm" />
                              Copy Professional Template
                            </motion.button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center px-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                             <Icon name="person_off" className="text-3xl text-slate-300 dark:text-slate-700 mb-3" />
                             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                                Please select who paid the bill in **Step 3** to enable settlement instructions and group distribution.
                             </p>
                          </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Member Breakdown Grid */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-6 flex items-center gap-2">
                <Icon name="groups" className="text-primary" />
                Member Breakdowns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {personTotals.map((p, i) => (
                    <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 flex items-center justify-center text-white font-bold text-lg", ["bg-primary", "bg-indigo-400", "bg-teal-500"][i % 3])}>
                                  {p.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Share Participant</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex-1 bg-white dark:bg-slate-900">
                            <div className="space-y-2 pt-4">
                                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                                    <span>Item Share</span>
                                    <span>Rp {p.subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                                    <span>Tax &amp; Service</span>
                                    <span>Rp {(p.tax + p.service).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-primary/5 dark:bg-primary/10 mt-auto border-t border-primary/10">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Total Due</span>
                                <span className="text-2xl font-extrabold text-primary">Rp {p.total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center gap-4 mt-8">
               <button className="px-8 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-800 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-slate-700 dark:text-slate-300">
                 <Icon name="file_download" />
                 Download PDF
               </button>
               <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                 <Icon name="share" />
                 Share with Friends
               </button>
            </div>
          </div>
        );
      }
      default:
        return <div>Unknown Step</div>;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': {
        const totalGrand = personTotals.reduce((sum, p) => sum + p.total, 0);

        return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-8 p-8"
        >
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Financial Dashboard</h1>
              <p className="text-slate-500 mt-2 font-medium">Overview of your bill breakdown activities.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveTab('bills'); setStep(1); }}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Icon name="add" />
              New Bill
            </motion.button>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-subtle surface-molded">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-lg">
                <Icon name="timeline" className="text-indigo-600" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Dinner at Le Petit Bistro', date: 'Today, 8:45 PM', amount: 1450000, status: 'Completed' },
                  { title: 'Soto Betawi H. Mamat', date: 'Yesterday, 1:15 PM', amount: 325000, status: 'Draft' },
                  { title: 'Grocery Run - Fruit City', date: '24 Oct, 4:30 PM', amount: 890000, status: 'Completed' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:border-indigo-200 dark:hover:border-indigo-900 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Icon name="receipt" className="text-xl" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-400 font-medium">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white">Rp {item.amount.toLocaleString('id-ID')}</p>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                        item.status === 'Completed' ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                      )}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Total Breakdown Activity</p>
                <h3 className="text-3xl font-black mb-4">Rp {totalGrand.toLocaleString('id-ID')}</h3>
                <div className="flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-2 py-1 rounded-lg">
                  <Icon name="verified" className="text-sm" />
                  Live Calculation
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-subtle surface-molded">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Icon name="architecture" className="text-indigo-600" />
                  Debt Architecture
                </h3>
                <DebtMap />
              </div>
            </div>
          </div>
        </motion.div>
      );
      }
    }

    if (activeTab === 'settings') {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto w-full p-8"
        >
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-8">System Settings</h1>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icon name="palette" className="text-indigo-600" />
                  Appearance & Interface
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-slate-500">Enable high-contrast night theme.</p>
                  </div>
                  <div 
                    onClick={() => {
                      const newMode = !settings.darkMode;
                      updateSettings({ darkMode: newMode });
                      if (newMode) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }}
                    className={cn(
                      "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                      settings.darkMode ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <motion.div 
                      layout
                      animate={{ x: settings.darkMode ? 28 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Liquid Animations</p>
                    <p className="text-xs text-slate-500">Fluid transitions and micro-interactions.</p>
                  </div>
                  <div 
                    onClick={() => updateSettings({ animations: !settings.animations })}
                    className={cn(
                      "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                      settings.animations ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <motion.div 
                      layout
                      animate={{ x: settings.animations ? 28 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icon name="payments" className="text-indigo-600" />
                  Currency & Localisation
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Default Currency</p>
                    <p className="text-xs text-slate-500">Select your preferred currency display.</p>
                  </div>
                  <select 
                    value={settings.currency || 'IDR (Rp)'}
                    onChange={(e) => updateSettings({ currency: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold outline-none ring-indigo-500/20 focus-visible:ring-2 cursor-pointer dark:text-slate-200"
                  >
                    <option value="IDR (Rp)">IDR (Rp)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Whole Number Rounding</p>
                    <p className="text-xs text-slate-500">Automatically round fractions for IDR.</p>
                  </div>
                  <div 
                    onClick={() => updateSettings({ roundNumbers: !settings.roundNumbers })}
                    className={cn(
                      "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                      settings.roundNumbers ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <motion.div 
                      layout
                      animate={{ x: settings.roundNumbers ? 28 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="p-8 flex-1 overflow-y-auto flex flex-col gap-6">
        <StepHeader 
          currentStep={step} 
          setStep={setStep}
          bill={bill}
          isScanning={isScanning}
          nextLabel={step === 1 ? "Next: Review Ledger" : step === 2 ? "Next: Add People" : step === 3 ? "Next: Assign Shares" : "Review Summary"}
          onNext={() => setStep(s => Math.min(s + 1, 5))}
          onBack={() => setStep(s => Math.max(s - 1, 1))}
          showActions={step < 5}
          nextDisabled={
            (step === 1 && (isScanning)) ||
            (step === 2 && bill.items.length === 0) ||
            (step === 3 && (!bill.title || bill.persons.length === 0 || !bill.payerId || bill.persons.some(p => !p.name.trim()))) ||
            (step === 4 && bill.items.some(item => bill.persons.filter(p => useBillStore.getState().assignments[p.id]?.[item.id]).length === 0))
          }
        />
        <AnimatePresence mode="wait">
          <div key={step}>
            {renderStep()}
          </div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 font-body-base text-slate-800 dark:text-slate-200 antialiased overflow-hidden h-screen flex">
      <SideNavBar currentStep={step} setStep={setStep} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-[280px] flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
        <TopNavBar />
        <div className="mt-16 flex-1 overflow-hidden flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

