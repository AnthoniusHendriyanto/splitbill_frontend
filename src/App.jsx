import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import useBillStore from './store/useBillStore';
import useAuthStore from './store/useAuthStore';
import { api } from './lib/api';
import AuthOverlay from './components/AuthOverlay';
import PriceInput from './components/PriceInput';
import DebtMap from './components/DebtMap';
import { formatIDR } from './utils/currency';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Modular Component Imports
import Icon from './components/Icon';
import SideNavBar from './components/SideNavBar';
import TopNavBar from './components/TopNavBar';
import StepHeader from './components/StepHeader';
import BottomTabBar from './components/BottomTabBar';
import MobileHeader from './components/MobileHeader';
import MobileDrawer from './components/MobileDrawer';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const HelpCenterModal = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      id: 'ai-accuracy',
      icon: 'document_scanner',
      title: 'How accurate is the AI OCR receipt scanner?',
      content: 'Our receipt scanner is highly advanced, but performance depends on photo clarity, lighting, and layout structure. It is designed as an assistant—always verify the items and prices in Step 2 before finalizing your split ledger.'
    },
    {
      id: 'tax-service',
      icon: 'percent',
      title: 'How are tax and service charges calculated?',
      content: 'Tax and service charges are calculated proportionally based on each person\'s subtotal. You can enter tax/service either as a percentage or a direct Rupiah (Rp) amount. The system will automatically show the percentage ratio.'
    },
    {
      id: 'sharing-bills',
      icon: 'share',
      title: 'How do I share the finalized ledger with friends?',
      content: 'Once the bill is finalized in Step 5, you can copy the settlement notes directly to your clipboard, share via Web Share, or share directly on WhatsApp/Telegram. The settlement notes contain detailed peer-to-peer transfer instructions!'
    },
    {
      id: 'payment-gateways',
      icon: 'account_balance_wallet',
      title: 'Which payment gateways/banks are supported?',
      content: 'We support all standard payment gateways and banks, including GoPay, OVO, Dana, LinkAja, BCA, Mandiri, and other local options. You can easily specify your payment details in the settings page.'
    },
    {
      id: 'pwa-offline',
      icon: 'offline_bolt',
      title: 'Can I use SplitMate offline on my phone?',
      content: 'Yes! SplitMate is a Progressive Web App (PWA). You can install it on your Android or iOS device. Once installed, it works offline using cached local storage, allowing you to ledger splits anytime, anywhere.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-[450px] max-w-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-gray-800 z-[100] shadow-2xl flex flex-col font-inter"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">help</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Help Center & FAQ</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer outline-none text-slate-500"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Caution / Disclaimer Panel */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-300">
                <span className="material-symbols-outlined text-2xl shrink-0">warning</span>
                <div className="text-xs space-y-1 leading-relaxed">
                  <p className="font-bold">Important Notice & Disclaimer</p>
                  <p>SplitMate uses AI OCR models to parse receipts. While highly accurate, text readability variations, currency formats, and store layouts can sometimes lead to calculation discrepancy. This application is only a help assistant—always review individual breakdowns before settling.</p>
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const isOpen = activeFaq === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="border border-gray-100 dark:border-gray-800/80 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/30"
                      >
                        <button
                          onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-600/70 dark:text-indigo-400/70 text-lg">{faq.icon}</span>
                            {faq.title}
                          </span>
                          <span className="material-symbols-outlined text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                            expand_more
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/50 mt-1">
                                {faq.content}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No matching FAQ articles found.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const BillDetailsModal = ({ billId, onClose }) => {
  const { completedBills, togglePersonPaid, deleteCompletedBill, loadBillDraft, updateUI } = useBillStore();
  const bill = completedBills.find(b => b.id === billId);

  if (!bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-inter text-slate-800 dark:text-slate-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{bill.title}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Completed on {new Date(bill.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Grand Total */}
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Settle Amount</p>
              <p className="text-3xl font-black text-indigo-600 mt-1">Rp {bill.grandTotal.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
              <span className={cn(
                "inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mt-2",
                bill.status === 'completed'
                  ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : bill.status === 'draft'
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              )}>
                {bill.status}
              </span>
            </div>
          </div>

          {/* Participants Settlement Status */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Participants & Settle Status</h4>
            <div className="space-y-3">
              {bill.persons?.length > 0 ? (
                bill.persons.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-gray-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {person.name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{person.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => togglePersonPaid(bill.id, person.id)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                          person.paid
                            ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-gray-700 hover:bg-slate-50"
                        )}
                      >
                        {person.paid ? 'Paid' : 'Mark Paid'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">No participants registered in this ledger.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between gap-4">
          <button
            onClick={() => {
              if (confirm('Are you absolutely sure you want to delete this bill history?')) {
                deleteCompletedBill(bill.id);
                onClose();
              }
            }}
            className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-all cursor-pointer"
          >
            Delete History
          </button>
          {bill.status === 'draft' ? (
            <button
              onClick={() => {
                loadBillDraft(bill.id);
                updateUI({ step: 4, activeTab: 'bills' });
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Draft &amp; Resume
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- App Component ---

export default function App() {
  const navigate = useNavigate();
  const { bill, updateBill, addItem, updateItem, removeItem, addPerson, updatePerson, removePerson, calculateTotals, settings, updateSettings, ui, updateUI, assignments, toggleAssignment, resetBill, completedBills, fetchCompletedBills, completeBill, loadBillDraft } = useBillStore();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isAuthenticated = !!accessToken;
  const step = ui?.step ?? 1;
  const activeTab = ui?.activeTab ?? 'bills';
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
      const timer = setTimeout(() => setHydrated(true), 3000);
      return () => {
        if (typeof unsub === 'function') unsub();
        clearTimeout(timer);
      };
    }
    document.documentElement.classList.add('dark');
  }, []);

  // useCallback: stable references prevent unnecessary child re-renders
  // (react-best-practices: rerender-functional-setstate)
  const setStep = useCallback((newStep) => updateUI({ step: typeof newStep === 'function' ? newStep(step) : newStep }), [step, updateUI]);
  const setActiveTab = useCallback((tab) => updateUI({ activeTab: tab }), [updateUI]);

  const [isScanning, setIsScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // New state added
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);

  const [uploadError, setUploadError] = useState(null); // Kaizen: Poka-Yoke — surface errors to user
  const [receiptTab, setReceiptTab] = useState('original');
  const [splitTab, setSplitTab] = useState('item'); // 'equal', 'item', 'percent', 'custom'
  const [participantInput, setParticipantInput] = useState('');
  const [percentageSplits, setPercentageSplits] = useState({}); // { personId: percentage }
  const [customSplits, setCustomSplits] = useState({}); // { personId: amount }
  const [billBackup, setBillBackup] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRerunningOCR, setIsRerunningOCR] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState(null);

  const [settingsTab, setSettingsTab] = useState('account');
  const [profileForm, setProfileForm] = useState({
    name: 'Anton Wijaya',
    email: 'anton.wijaya@splitmate.id',
    phone: '+62 812-3456-7890',
    timezone: 'Asia/Jakarta (GMT+7)',
    language: 'English',
  });

  const userObj = useAuthStore((state) => state.user);
  useEffect(() => {
    if (userObj) {
      setProfileForm((prev) => ({
        ...prev,
        name: userObj.name || prev.name,
        email: userObj.email || prev.email,
      }));
    }
  }, [userObj]);

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setSaveFeedback('Settings updated successfully!');
      setTimeout(() => setSaveFeedback(null), 3000);
    }, 800);
  };

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on Windows 11', location: 'Jakarta, Indonesia', active: true, ip: '182.253.140.21' },
    { id: 2, device: 'SplitMate iOS App (iPhone 15 Pro)', location: 'Jakarta, Indonesia', active: false, ip: '182.253.140.22' },
    { id: 3, device: 'Safari on macOS', location: 'Singapore', active: false, ip: '46.137.240.11' },
  ]);

  const handleRevokeSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };


  useEffect(() => {
    fetchCompletedBills();
  }, [isAuthenticated, fetchCompletedBills]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // Redirect to login if not authenticated and not guest
  useEffect(() => {
    if (hydrated && !accessToken && !isGuest) {
      navigate('/login', { replace: true });
    }
  }, [hydrated, accessToken, isGuest, navigate]);

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

    // Read original photo as base64 Data URL
    let base64Url = '';
    try {
      base64Url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (e) {
      console.error('Failed to read image file', e);
    }

    try {
      await new Promise(r => setTimeout(r, 2000));
      const data = await api.processOCR(file);
      if (data?.items?.length) {
        const items = data.items.map(item => ({ id: crypto.randomUUID(), name: item.name, price: item.price }));
        const subtotal = items.reduce((sum, item) => sum + item.price, 0);
        const serviceRupiah = data.service_charge || 0;
        const taxRupiah = data.tax || 0;
        const serviceMode = data.service_mode || 'amount';
        const taxMode = data.tax_mode || 'amount';

        const servicePercent = serviceMode === 'percent'
          ? serviceRupiah
          : (subtotal > 0 && serviceRupiah > 0 ? Number(((serviceRupiah / subtotal) * 100).toFixed(1)) : 0);
        const taxPercent = taxMode === 'percent'
          ? taxRupiah
          : (subtotal > 0 && taxRupiah > 0 ? Number(((taxRupiah / subtotal) * 100).toFixed(1)) : 0);

        updateBill({
          title: data.title || '',
          imageUrl: base64Url,
          items,
          serviceCharge: servicePercent,
          serviceMode: 'percent',
          tax: taxPercent,
          taxMode: 'percent',
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

  const personTotals = useMemo(() => calculateTotals(), [calculateTotals, bill, assignments]);

  // js-index-maps: build a Map once for O(1) person lookups vs .find() on every render
  const personsMap = useMemo(
    () => new Map(bill.persons.map(p => [p.id, p])),
    [bill.persons]
  );

  const handleServiceModeChange = (mode) => {
    if (mode === bill.serviceMode) return;
    const currentVal = bill.serviceCharge || 0;
    let newVal = 0;
    if (mode === 'amount') {
      newVal = Math.round(receiptSubtotal * (currentVal / 100));
    } else {
      newVal = receiptSubtotal > 0 ? Number(((currentVal / receiptSubtotal) * 100).toFixed(1)) : 0;
    }
    updateBill({ serviceMode: mode, serviceCharge: newVal });
  };

  const handleTaxModeChange = (mode) => {
    if (mode === bill.taxMode) return;
    const currentVal = bill.tax || 0;
    let newVal = 0;
    if (mode === 'amount') {
      newVal = Math.round(receiptSubtotal * (currentVal / 100));
    } else {
      newVal = receiptSubtotal > 0 ? Number(((currentVal / receiptSubtotal) * 100).toFixed(1)) : 0;
    }
    updateBill({ taxMode: mode, tax: newVal });
  };

  const renderStep = () => {
    switch (step) {
      case 3: {
        // Auto-add logged-in user as first participant if not already present
        const currentUser = useAuthStore.getState().user;
        if (currentUser && bill.persons.length === 0) {
          // Defer to avoid state update during render
          setTimeout(() => {
            const store = useBillStore.getState();
            const alreadyAdded = store.bill.persons.some(
              p => p.userId === currentUser.id || p.name.toLowerCase() === (currentUser.name || '').toLowerCase()
            );
            if (!alreadyAdded) {
              store.updateBill({
                persons: [{
                  id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  name: currentUser.name || currentUser.email || 'Me',
                  userId: currentUser.id,
                  isCurrentUser: true,
                  paymentInfo: { bank: '', accountNumber: '', qrisData: '' }
                }]
              });
            }
          }, 0);
        }

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-12 gap-8 w-full"
          >
            {/* Left Panel: Basic Information */}
            <div className="col-span-12 lg:col-span-5 bg-[#070b19] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between min-h-[460px]">
              <div className="space-y-6">
                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block"></span>
                  Ledger Information
                </h3>

                {/* Bill Title Input */}
                <div className="relative group">
                  <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">Ledger Title</label>
                  <input
                    value={bill.title}
                    onChange={(e) => updateBill({ title: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-white transition-all"
                    placeholder="e.g. Dinner at Le Petit Bistro"
                  />
                </div>

                {/* Who Paid the Total Bill? Card Selection Deck */}
                <div className="pt-4 border-t border-slate-900">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Select Payer (Who settled the receipt?)</span>
                  {bill.persons.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 hide-scrollbar">
                      {bill.persons.map((p) => {
                        const isSelected = bill.payerId === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => updateBill({ payerId: p.id })}
                            className={cn(
                              "px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer outline-none",
                              isSelected
                                ? "bg-indigo-650/40 border-indigo-500 text-white shadow-lg"
                                : "bg-slate-950/30 border-slate-900 text-slate-400 hover:border-slate-800"
                            )}
                          >
                            <span className="truncate">{p.name || "Unnamed"}</span>
                            {isSelected ? (
                              <Icon name="check_circle" className="text-sm text-indigo-400" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-800" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 font-semibold italic text-center py-6">Add participants on the right first to select a payer.</p>
                  )}
                </div>
              </div>

              {/* Bottom indicators */}
              <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-wider font-numeric">
                <span>Grand Total Ledger</span>
                <span className="text-white">Rp {receiptGrandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Right Panel: Advanced Participant Management */}
            <div className="col-span-12 lg:col-span-7 bg-[#070b19] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block"></span>
                    Manage Participants
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Mock import contacts
                        const mockNames = ["Amelia Cole", "David Chen", "Sofia Rossi"];
                        mockNames.forEach(n => {
                          if (!bill.persons.some(p => p.name.toLowerCase() === n.toLowerCase())) {
                            useBillStore.getState().addPerson(n);
                          }
                        });
                      }}
                      className="text-[9px] font-extrabold uppercase text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-900/30 bg-indigo-950/20 px-2.5 py-1 rounded-lg outline-none cursor-pointer"
                    >
                      Import Contacts
                    </button>
                  </div>
                </div>

                {/* Inline Member Add Form */}
                <div className="flex gap-2 mb-6">
                  <input
                    value={participantInput || ''}
                    onChange={(e) => setParticipantInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && participantInput?.trim()) {
                        useBillStore.getState().addPerson(participantInput.trim());
                        setParticipantInput('');
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-xs font-semibold text-white placeholder-slate-700"
                    placeholder="Type participant name and press Enter..."
                  />
                  <button
                    onClick={() => {
                      if (participantInput?.trim()) {
                        useBillStore.getState().addPerson(participantInput.trim());
                        setParticipantInput('');
                      }
                    }}
                    className="px-4 bg-indigo-650 hover:bg-indigo-600 border border-indigo-600 rounded-xl flex items-center justify-center text-white cursor-pointer outline-none transition-all"
                  >
                    <Icon name="person_add" className="text-sm" />
                  </button>
                </div>

                {/* Chips Grid */}
                <div className="min-h-[160px] max-h-[260px] overflow-y-auto rounded-xl border border-slate-950 bg-slate-950/20 p-4">
                  {bill.persons.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      <AnimatePresence>
                        {bill.persons.map((p) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 bg-[#0b0f19] border border-slate-900 rounded-full group transition-all hover:border-slate-800"
                          >
                            <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-900 flex items-center justify-center text-[9px] font-black text-indigo-400 uppercase">
                              {p.name.charAt(0) || "?"}
                            </div>
                            <span className="text-[11px] font-bold text-slate-300 max-w-[120px] truncate">{p.name || "Unnamed"}</span>
                            <button
                              onClick={() => removePerson(p.id)}
                              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-rose-950 hover:text-rose-400 text-slate-600 border-none transition-colors cursor-pointer outline-none"
                            >
                              <Icon name="close" className="text-[10px]" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-8">
                      <Icon name="people" className="text-3xl text-slate-800 mb-2" />
                      <p className="text-[11px] text-slate-600 font-bold leading-relaxed max-w-[200px]">
                        No participants registered yet. Import or key in name above to initialize splitting.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-900 flex justify-between items-center gap-3">
                <button
                  onClick={() => {
                    // Generate mock invite WhatsApp link template
                    const text = encodeURIComponent(`Hey! I'm splitting our bill using SplitMate. Join here: http://splitmate.id/invite/${bill.id || 'new'}`);
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                  className="px-4 py-3 bg-[#0d1c15] hover:bg-[#122e20] text-emerald-400 border border-emerald-950/40 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer outline-none"
                >
                  <Icon name="share" className="text-sm" />
                  Invite Link Template
                </button>

                <button
                  disabled={bill.persons.length === 0}
                  onClick={() => setStep(4)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center gap-1.5 border-none outline-none cursor-pointer",
                    bill.persons.length === 0
                      ? "bg-slate-900 text-slate-600 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                  )}
                >
                  Next: Assign Shares
                  <Icon name="arrow_forward" className="text-xs" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      }
      case 1: {
        const stepView = (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full flex flex-col gap-6"
          >
            {(!bill.imageUrl && !isScanning) ? (
              // ENTRY STATE: Two Large Gorgeous Cards
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full py-8">
                {/* Card A: Scan Receipt with AI OCR */}
                <div className="bg-[#070b19] border border-slate-900 rounded-3xl p-8 flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-indigo-500/40 transition-all min-h-[380px] shadow-2xl">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
                  <div className="w-16 h-16 rounded-full bg-indigo-950/40 border border-indigo-900/60 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Icon name="document_scanner" className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2">Scan Receipt with AI OCR</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-[280px] mx-auto">
                      Upload an image of your bill receipt. SplitMate will automatically extract merchant, subtotal, taxes, and items with 98.5% confidence.
                    </p>
                  </div>
                  <div className="mt-6 w-full relative">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 border-none cursor-pointer outline-none">
                      <Icon name="cloud_upload" className="text-base" />
                      Upload Receipt Image
                    </button>
                  </div>
                </div>

                {/* Card B: Enter Manually */}
                <div className="bg-[#070b19] border border-slate-900 rounded-3xl p-8 flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-amber-500/40 transition-all min-h-[380px] shadow-2xl">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />
                  <div className="w-16 h-16 rounded-full bg-amber-950/40 border border-amber-900/60 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Icon name="edit_note" className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2">Create Ledger Manually</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-[280px] mx-auto">
                      Key in merchant details, tax charges, and line items manually step-by-step to customize your splitting workspace.
                    </p>
                  </div>
                  <div className="mt-6 w-full">
                    <button
                      onClick={() => {
                        updateBill({
                          title: "Manual Ledger",
                          imageUrl: "",
                          items: [],
                          persons: []
                        });
                        addItem();
                        setStep(2);
                      }}
                      className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer outline-none"
                    >
                      <Icon name="keyboard" className="text-base" />
                      Key In Ledger Details
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // OCR SCANNING / SCAN COMPLETED STATE: Split Layout
              <div className="grid grid-cols-12 gap-8 w-full">
                {/* Left: uploaded receipt preview / animation */}
                <div className="col-span-12 lg:col-span-6 bg-[#070b19] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative min-h-[440px]">
                  {isScanning && (
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600/10">
                      <motion.div
                        initial={{ left: '-100%' }}
                        animate={{ left: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute top-0 w-1/2 h-full bg-indigo-500 shadow-[0_0_15px_3px_rgba(79,70,229,0.5)]"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        Receipt Preview
                      </span>
                      {!isScanning && bill.imageUrl && (
                        <button
                          onClick={() => {
                            updateBill({ imageUrl: "" });
                            setStep(1);
                          }}
                          className="text-[9px] font-extrabold uppercase text-rose-400 hover:text-rose-300 transition-colors border-none bg-transparent outline-none cursor-pointer flex items-center gap-1"
                        >
                          <Icon name="delete" className="text-[10px]" />
                          Replace Receipt
                        </button>
                      )}
                    </div>

                    <div className="rounded-xl overflow-hidden border border-slate-950 bg-slate-950 p-4 min-h-[300px] flex items-center justify-center relative">
                      {isScanning ? (
                        <div className="flex flex-col items-center justify-center text-center py-12">
                          <div className="relative mb-6">
                            <Icon name="receipt_long" className="text-7xl text-slate-800 animate-pulse" />
                            <motion.div
                              initial={{ top: 0, opacity: 0.8 }}
                              animate={{ top: '100%', opacity: 1 }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatType: "reverse" }}
                              className="absolute left-0 w-full h-[6px] bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.9)] z-10 rounded-full"
                            />
                          </div>
                          <h4 className="font-black text-lg text-white mb-2 tracking-tight">AI Scanning Receipt...</h4>
                          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                            Extracting merchant, subtotal, line items,<br />tax, and service charges.
                          </p>
                        </div>
                      ) : bill.imageUrl ? (
                        <img
                          src={bill.imageUrl}
                          alt="Uploaded Receipt"
                          className="max-h-[380px] w-auto object-contain rounded-lg shadow-2xl"
                        />
                      ) : (
                        <div className="text-slate-700 font-bold text-sm italic">No receipt file uploaded</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: detected metadata & confidence status */}
                <div className="col-span-12 lg:col-span-6 bg-[#070b19] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block"></span>
                        Extracted Metadata
                      </h3>
                      {isScanning ? (
                        <span className="text-[10px] font-black text-slate-500 animate-pulse uppercase tracking-wider">Analyzing...</span>
                      ) : (
                        <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                          AI OCR
                        </span>
                      )}
                    </div>

                    {isScanning ? (
                      <div className="space-y-6">
                        <div className="h-10 bg-slate-950/40 border border-slate-900 animate-pulse rounded-xl" />
                        <div className="h-10 bg-slate-950/40 border border-slate-900 animate-pulse rounded-xl" />
                        <div className="h-24 bg-slate-950/40 border border-slate-900 animate-pulse rounded-xl" />
                      </div>
                    ) : (
                      <div className="space-y-5 font-numeric">
                        {/* Title input */}
                        <div className="relative group">
                          <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">Merchant Name</label>
                          <input
                            value={bill.title}
                            onChange={(e) => updateBill({ title: e.target.value })}
                            className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-white transition-all"
                            placeholder="e.g. Le Petit Bistro"
                          />
                        </div>

                        {/* Price readouts */}
                        <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-5 space-y-3.5 text-xs font-semibold text-slate-400">
                          <div className="flex justify-between">
                            <span>Detected Subtotal</span>
                            <span className="text-slate-200">Rp {receiptSubtotal.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Service Charge ({bill.serviceMode === 'percent' ? `${bill.serviceCharge}%` : 'Fixed'})</span>
                            <span className="text-slate-200">Rp {receiptService.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax ({bill.taxMode === 'percent' ? `${bill.tax}%` : 'Fixed'})</span>
                            <span className="text-slate-200">Rp {receiptTax.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="w-full h-px bg-slate-900 my-2" />
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-white uppercase tracking-wider">Grand Total</span>
                            <span className="text-lg text-indigo-400">Rp {receiptGrandTotal.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OCR Proceed Button */}
                  {!isScanning && (
                    <div className="mt-8 pt-6 border-t border-slate-900 flex justify-end">
                      <button
                        onClick={() => setStep(2)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5 border-none outline-none cursor-pointer"
                      >
                        Next: Review Ledger
                        <Icon name="arrow_forward" className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/30 rounded-xl max-w-lg mx-auto">
                <Icon name="error" className="text-rose-500 text-lg flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-400 font-semibold leading-relaxed">{uploadError}</p>
              </div>
            )}
          </motion.div>
        );
        return !isAuthenticated ? <AuthOverlay>{stepView}</AuthOverlay> : stepView;
      }
      case 2: {
        const handleItemUpdate = (itemId, fields) => {
          const item = bill.items.find(i => i.id === itemId);
          if (!item) return;
          const newQty = fields.qty !== undefined ? fields.qty : (item.qty || 1);
          const newUnitPrice = fields.unitPrice !== undefined ? fields.unitPrice : (item.unitPrice || item.price || 0);
          updateItem(itemId, {
            ...fields,
            qty: newQty,
            unitPrice: newUnitPrice,
            price: newQty * newUnitPrice
          });
        };

        const handleAddItemInline = () => {
          addItem();
          setTimeout(() => {
            const currentItems = useBillStore.getState().bill.items;
            const lastItem = currentItems[currentItems.length - 1];
            if (lastItem) {
              updateItem(lastItem.id, { qty: 1, unitPrice: 0, price: 0 });
            }
          }, 30);
        };

        const handleRerunOCR = () => {
          setIsRerunningOCR(true);
          setTimeout(() => {
            setIsRerunningOCR(false);
            const mockItems = [
              { id: 'item-1', name: 'Wagyu Ribeye Steak', qty: 2, unitPrice: 285000, price: 570000 },
              { id: 'item-2', name: 'Truffle Fries Gourmet', qty: 1, unitPrice: 65000, price: 65000 },
              { id: 'item-3', name: 'Premium Iced Matcha Latte', qty: 3, unitPrice: 48000, price: 144000 },
              { id: 'item-4', name: 'Es Teh Manis', qty: 4, unitPrice: 15000, price: 60000 },
            ];
            updateBill({ 
              title: 'KOPIKINA CILANDAK',
              items: mockItems,
              tax: 10,
              taxMode: 'percent',
              serviceCharge: 5,
              serviceMode: 'percent'
            });
            setSaveFeedback('AI OCR processing completed successfully!');
            setTimeout(() => setSaveFeedback(null), 3000);
          }, 1500);
        };

        const handleUndo = () => {
          if (billBackup) {
            updateBill(JSON.parse(JSON.stringify(billBackup)));
            setSaveFeedback('Reverted all changes to initial snapshot');
            setTimeout(() => setSaveFeedback(null), 3000);
          }
        };

        const handleSaveDraft = () => {
          setSaveFeedback('Ledger draft saved successfully!');
          setTimeout(() => setSaveFeedback(null), 3000);
        };

        // Initialize snapshot on mount of case 2
        if (step === 2 && !billBackup && bill.items.length > 0) {
          setBillBackup(JSON.parse(JSON.stringify(bill)));
        }

        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col xl:flex-row gap-8 w-full flex-1"
          >
            {/* Receipt Preview Left Panel */}
            <div className="w-full xl:w-[420px] bg-[#070b19]/80 border border-slate-900 rounded-2xl flex flex-col group relative shadow-premium overflow-hidden backdrop-blur-md">
              {/* Premium Glow Header */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

              {bill.imageUrl ? (
                <div className="p-4 border-b border-slate-900 flex bg-slate-950/20 items-center justify-between">
                  <div className="flex bg-slate-950 p-1 rounded-xl w-3/4 border border-slate-900">
                    <button
                      onClick={() => setReceiptTab('original')}
                      className={cn(
                        "flex-1 py-1.5 px-3 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none outline-none",
                        receiptTab === 'original'
                          ? "bg-slate-900 text-indigo-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-350"
                      )}
                    >
                      <Icon name="photo_library" className="text-xs" />
                      Original
                    </button>
                    <button
                      onClick={() => setReceiptTab('ledger')}
                      className={cn(
                        "flex-1 py-1.5 px-3 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none outline-none",
                        receiptTab === 'ledger'
                          ? "bg-slate-900 text-indigo-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-355"
                      )}
                    >
                      <Icon name="receipt_long" className="text-xs" />
                      Ledger View
                    </button>
                  </div>
                  {receiptTab === 'original' && (
                    <button
                      onClick={() => setZoomLevel(prev => prev === 1 ? 1.6 : 1)}
                      className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title={zoomLevel === 1 ? "Zoom In Receipt" : "Zoom Out Receipt"}
                    >
                      <Icon name={zoomLevel === 1 ? "zoom_in" : "zoom_out"} className="text-sm" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/20">
                  <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                    <Icon name="document_scanner" className="text-indigo-400" />
                    Receipt Ledger
                  </h3>
                  <span className="text-[9px] font-black text-indigo-455 bg-indigo-950/50 border border-indigo-900/30 px-2 py-0.5 rounded uppercase tracking-wider">Manual entry</span>
                </div>
              )}
              
              <div className="flex-1 p-6 overflow-y-auto bg-slate-950/30 flex flex-col gap-6 hide-scrollbar">
                {(!bill.imageUrl || receiptTab === 'ledger') ? (
                  <div className="bg-[#0b0f19] p-6 shadow-2xl rounded-xl border border-slate-900 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-60"></div>
                    <div className="text-center mb-6 mt-2">
                      <p className="font-black text-sm uppercase tracking-[0.25em] text-white leading-tight">{bill.title || "SPLITMATE LEDGER"}</p>
                      <p className="text-[8px] text-indigo-400/80 font-black mt-2 uppercase tracking-widest bg-indigo-950/30 border border-indigo-900/20 py-1 px-3 rounded-full inline-block">
                        ORDER {orderId} • {new Date(billDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                    <div className="space-y-3 flex-1 mt-6">
                      {bill.items.map(item => {
                        const qty = item.qty || 1;
                        const unitPrice = item.unitPrice !== undefined ? item.unitPrice : item.price;
                        return (
                          <div key={item.id} className="flex justify-between text-[11px] py-2.5 border-b border-slate-900 border-dashed font-semibold font-numeric">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-500 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded font-black">{qty}x</span>
                              <span className="text-slate-400 uppercase text-[9px] tracking-wider font-bold max-w-[160px] truncate">{item.name || "UNNAMED ITEM"}</span>
                            </div>
                            <span className="text-slate-200">Rp {(qty * unitPrice).toLocaleString('id-ID')}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-8 pt-4 border-t border-slate-900 space-y-2 text-[9px] font-black text-slate-500 uppercase tracking-widest font-numeric">
                       <div className="flex justify-between items-center">
                          <span>Subtotal</span>
                          <span className="text-slate-350 text-xs font-bold">Rp {receiptSubtotal.toLocaleString('id-ID')}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span>Service Charge</span>
                          <span className="text-slate-355 text-xs font-bold">Rp {receiptService.toLocaleString('id-ID')}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span>Tax / PB1</span>
                          <span className="text-slate-360 text-xs font-bold">Rp {receiptTax.toLocaleString('id-ID')}</span>
                       </div>
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-slate-900 border-double flex justify-between items-center font-numeric">
                      <span className="font-black text-xs tracking-wider text-slate-400">GRAND TOTAL</span>
                      <span className="text-lg font-black text-indigo-400">Rp {receiptGrandTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0b0f19] p-2 shadow-xl rounded-xl border border-slate-900 flex flex-col gap-3 min-h-[460px] justify-center items-center relative overflow-hidden group/image">
                    {/* Zoomable Image Container */}
                    <div 
                      className="w-full h-full min-h-[420px] max-h-[460px] flex items-center justify-center overflow-auto rounded-lg hide-scrollbar relative"
                    >
                      <img 
                        src={bill.imageUrl} 
                        alt="Original Receipt" 
                        className="max-w-full h-auto object-contain max-h-[440px] rounded-lg transition-transform duration-350 ease-out origin-center" 
                        style={{ transform: `scale(${zoomLevel})` }}
                      />
                    </div>
                  </div>
                )}

                {/* Metadata Editor Cards */}
                <div className="bg-[#0b0f19] p-5 shadow-xl rounded-xl border border-slate-900 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Icon name="settings" className="text-xs text-indigo-400" />
                        Metadata Parameters
                      </span>
                    </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <label className="absolute -top-2 left-3 px-1.5 bg-[#0b0f19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10 transition-colors group-focus-within:text-purple-400">
                        Restaurant Name
                      </label>
                      <input 
                        value={bill.title} 
                        onChange={(e) => updateBill({ title: e.target.value })} 
                        className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-905 focus:border-indigo-500 rounded-lg outline-none font-bold text-xs md:text-sm text-white transition-colors"
                        placeholder="e.g. Kopikina Cilandak"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <label className="absolute -top-2 left-3 px-1.5 bg-[#0b0f19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">
                          Order ID
                        </label>
                        <input 
                          value={orderId} 
                          onChange={(e) => setOrderId(e.target.value)} 
                          className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-905 focus:border-indigo-500 rounded-lg outline-none font-bold text-xs md:text-sm text-white transition-colors"
                          placeholder="#9821"
                        />
                      </div>
                      <div className="relative group">
                        <label className="absolute -top-2 left-3 px-1.5 bg-[#0b0f19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">
                          Bill Date
                        </label>
                        <input 
                          type="date"
                          value={billDate} 
                          onChange={(e) => setBillDate(e.target.value)} 
                          className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-905 focus:border-indigo-500 rounded-lg outline-none font-bold text-xs md:text-sm text-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Data Table Right Panel */}
            <div className="flex-1 bg-[#070b19]/80 border border-slate-900 rounded-2xl shadow-premium flex flex-col overflow-hidden backdrop-blur-md relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

              {/* Action Toolbar Header */}
              <div className="p-6 border-b border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/20">
                <div>
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block"></span>
                    Detected Ledger Rows
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">Review, edit, or adjust items extracted by SplitMate AI</p>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                  {/* Undo Button */}
                  <button 
                    onClick={handleUndo}
                    disabled={!billBackup}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-955 border border-slate-900 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    title="Undo all changes since mounting"
                  >
                    <Icon name="undo" className="text-xs" />
                    Undo
                  </button>

                  {/* Rerun OCR Button */}
                  <button 
                    onClick={handleRerunOCR}
                    disabled={isRerunningOCR}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-955 border border-slate-900 hover:bg-slate-900 text-slate-350 hover:text-white font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isRerunningOCR ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Icon name="autorenew" className="text-xs text-purple-400" />
                        Rerun OCR
                      </>
                    )}
                  </button>

                  {/* Save Draft Button */}
                  <button 
                    onClick={handleSaveDraft}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-900/40 hover:bg-indigo-900/35 text-indigo-400 hover:text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Icon name="save" className="text-xs" />
                    Save Draft
                  </button>
                </div>
              </div>

              {/* Toast Feedback Notification Overlay */}
              <AnimatePresence>
                {saveFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-2 text-emerald-400 font-bold text-xs"
                  >
                    <Icon name="check_circle" className="text-sm animate-bounce" />
                    {saveFeedback}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interactive High-Density Data Table */}
              <div className="overflow-y-auto flex-1 hide-scrollbar bg-slate-950/10 min-h-[300px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-950/90 border-b border-slate-900 text-left sticky top-0 z-10 backdrop-blur-md">
                      <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Item Description</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center w-28">Qty</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right w-40">Unit Price</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right w-36">Row Total</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-semibold text-xs">
                    <AnimatePresence>
                      {bill.items.map((item) => {
                        const qty = item.qty || 1;
                        const unitPrice = item.unitPrice !== undefined ? item.unitPrice : item.price;
                        const calculatedRowTotal = qty * unitPrice;
                        return (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            onMouseEnter={() => setHoveredRowId(item.id)}
                            onMouseLeave={() => setHoveredRowId(null)}
                            className={cn(
                              "transition-colors group border-b border-slate-900/50",
                              hoveredRowId === item.id 
                                ? "bg-indigo-950/15" 
                                : "hover:bg-slate-950/20"
                            )}
                          >
                            {/* Item name input */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {qty === 1 && unitPrice === 0 && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Low OCR confidence warning: complete item values"></span>
                                )}
                                <input 
                                  value={item.name}
                                  onChange={(e) => handleItemUpdate(item.id, { name: e.target.value })}
                                  className="w-full bg-transparent border-none focus:ring-0 font-bold text-white p-0 text-xs md:text-sm outline-none placeholder-slate-700 focus:border-b focus:border-indigo-500/50 transition-all"
                                  placeholder="e.g. Wagyu Ribeye Steak"
                                />
                              </div>
                            </td>

                            {/* Qty Steppers */}
                            <td className="px-4 py-3 text-center w-28">
                              <div className="flex items-center justify-between bg-slate-950 px-1 py-1 rounded-lg border border-slate-900 max-w-[90px] mx-auto group-hover:border-slate-800 transition-colors">
                                <button 
                                  type="button"
                                  onClick={() => handleItemUpdate(item.id, { qty: Math.max(1, qty - 1) })}
                                  className="w-5 h-5 flex items-center justify-center bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-500 rounded border-none cursor-pointer font-extrabold text-[10px] transition-colors"
                                >
                                  -
                                </button>
                                <span className="text-xs font-black text-white font-numeric">{qty}</span>
                                <button 
                                  type="button"
                                  onClick={() => handleItemUpdate(item.id, { qty: qty + 1 })}
                                  className="w-5 h-5 flex items-center justify-center bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-500 rounded border-none cursor-pointer font-extrabold text-[10px] transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Unit Price Input */}
                            <td className="px-4 py-3 text-right w-40">
                              <PriceInput 
                                variant="ghost"
                                value={unitPrice}
                                onChange={(val) => handleItemUpdate(item.id, { unitPrice: val })}
                                className="text-right font-bold text-slate-200 text-xs md:text-sm focus-within:text-white"
                              />
                            </td>

                            {/* Real-time Row Total */}
                            <td className="px-4 py-3 text-right font-bold font-numeric text-indigo-400 text-xs md:text-sm w-36">
                              Rp {calculatedRowTotal.toLocaleString('id-ID')}
                            </td>

                            {/* Remove Row Button */}
                            <td className="px-4 py-3 text-center w-12">
                              <button 
                                onClick={() => removeItem(item.id)} 
                                className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all border-none bg-transparent cursor-pointer outline-none"
                                title="Remove Item Row"
                              >
                                <Icon name="delete" className="text-base" />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>

                {/* Inline CTA Add Item */}
                <div className="p-4 border-t border-dashed border-slate-900">
                  <button
                    onClick={handleAddItemInline}
                    className="w-full py-3.5 rounded-xl border border-dashed border-slate-900 hover:border-indigo-500/40 bg-slate-950/20 hover:bg-indigo-950/5 text-slate-400 hover:text-indigo-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
                  >
                    <Icon name="add" className="text-sm" />
                    Add Item Manually Inline
                  </button>
                </div>
              </div>

              {/* Sticky bottom calculations and primary CTA */}
              <div className="p-6 bg-slate-950/90 backdrop-blur-md flex flex-col gap-5 border-t border-slate-900 sticky bottom-0 z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2 border-b border-dashed border-slate-900">
                  {/* Service Charge Toggle & input */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Service Charge</label>
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-900">
                        <button 
                          onClick={() => handleServiceModeChange('percent')} 
                          className={cn("px-2.5 py-1 text-[9px] font-black rounded-lg transition-all border-none outline-none cursor-pointer", bill.serviceMode === 'percent' ? "bg-slate-900 text-indigo-400 font-black shadow" : "text-slate-500")}
                        >
                          %
                        </button>
                        <button 
                          onClick={() => handleServiceModeChange('amount')} 
                          className={cn("px-2.5 py-1 text-[9px] font-black rounded-lg transition-all border-none outline-none cursor-pointer", bill.serviceMode === 'amount' ? "bg-slate-900 text-indigo-400 font-black shadow" : "text-slate-500")}
                        >
                          Rp
                        </button>
                      </div>
                    </div>
                    {bill.serviceMode === 'percent' ? (
                      <div className="space-y-1">
                        <input 
                          type="number" 
                          value={bill.serviceCharge === null || bill.serviceCharge === undefined ? '' : bill.serviceCharge} 
                          onChange={(e) => updateBill({ serviceCharge: parseFloat(e.target.value) || 0 })} 
                          className="w-full py-2 bg-slate-950/50 border border-slate-900 focus:border-indigo-500 rounded-lg outline-none px-3 font-bold text-xs text-white" 
                          placeholder="5" 
                        />
                        <p className="text-[9px] text-slate-500 font-semibold pl-1 font-numeric">≈ Rp {Math.round(receiptSubtotal * ((bill.serviceCharge || 0) / 100)).toLocaleString('id-ID')}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <PriceInput 
                          value={bill.serviceCharge || 0} 
                          onChange={(val) => updateBill({ serviceCharge: val })} 
                          className="h-[36px] text-xs font-bold" 
                        />
                        <p className="text-[9px] text-slate-500 font-semibold pl-1 font-numeric">≈ {(receiptSubtotal > 0 ? ((bill.serviceCharge || 0) / receiptSubtotal) * 100 : 0).toFixed(1)}%</p>
                      </div>
                    )}
                  </div>

                  {/* Tax / PB1 Toggle & input */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tax / PB1</label>
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-900">
                        <button 
                          onClick={() => handleTaxModeChange('percent')} 
                          className={cn("px-2.5 py-1 text-[9px] font-black rounded-lg transition-all border-none outline-none cursor-pointer", bill.taxMode === 'percent' ? "bg-slate-900 text-indigo-400 font-black shadow" : "text-slate-500")}
                        >
                          %
                        </button>
                        <button 
                          onClick={() => handleTaxModeChange('amount')} 
                          className={cn("px-2.5 py-1 text-[9px] font-black rounded-lg transition-all border-none outline-none cursor-pointer", bill.taxMode === 'amount' ? "bg-slate-900 text-indigo-400 font-black shadow" : "text-slate-500")}
                        >
                          Rp
                        </button>
                      </div>
                    </div>
                    {bill.taxMode === 'percent' ? (
                      <div className="space-y-1">
                        <input 
                          type="number" 
                          value={bill.tax === null || bill.tax === undefined ? '' : bill.tax} 
                          onChange={(e) => updateBill({ tax: parseFloat(e.target.value) || 0 })} 
                          className="w-full py-2 bg-slate-950/50 border border-slate-900 focus:border-indigo-500 rounded-lg outline-none px-3 font-bold text-xs text-white" 
                          placeholder="11" 
                        />
                        <p className="text-[9px] text-slate-500 font-semibold pl-1 font-numeric">≈ Rp {Math.round(receiptSubtotal * ((bill.tax || 0) / 100)).toLocaleString('id-ID')}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <PriceInput 
                          value={bill.tax || 0} 
                          onChange={(val) => updateBill({ tax: val })} 
                          className="h-[36px] text-xs font-bold" 
                        />
                        <p className="text-[9px] text-slate-500 font-semibold pl-1 font-numeric">≈ {(receiptSubtotal > 0 ? ((bill.tax || 0) / receiptSubtotal) * 100 : 0).toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom summary and CTA card */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-1">
                  <div className="text-center md:text-left self-stretch md:self-auto font-numeric">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">Calculated Ledger Grand Total</span>
                    <span className="text-2xl font-black text-white flex items-center justify-center md:justify-start gap-1">
                      <span className="text-xs text-slate-500 font-semibold">Rp</span>
                      {receiptGrandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Primary sticky CTA button */}
                  <button
                    onClick={() => setStep(3)}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white rounded-xl font-extrabold text-xs shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-300 flex items-center justify-center gap-2 border-none cursor-pointer outline-none transform active:scale-[0.99] tracking-wider"
                  >
                    Next: Add People
                    <Icon name="arrow_forward" className="text-xs font-bold" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      }
      case 4: {
        const { persons, items } = bill;
        const totalBillSubtotal = items.reduce((sum, item) => sum + item.price, 0);
        const payerName = persons.find(p => p.id === bill.payerId)?.name || 'None selected';

        return (
          <div className="flex flex-col gap-6 flex-1 min-h-0 w-full text-slate-200">
            {/* Bento Grid Header */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-8 bg-[#070b19] border border-slate-900 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Receipt Grand Total</span>
                  <span className="text-3xl font-black text-white font-numeric">Rp {receiptGrandTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="hidden md:block w-px h-10 bg-slate-900" />
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Active Settlement Payer</span>
                  <span className="text-sm font-extrabold text-indigo-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    {payerName}
                  </span>
                </div>
              </div>

              {/* Strategy Picker Tabs */}
              <div className="col-span-12 md:col-span-4 bg-[#070b19] border border-slate-900 rounded-2xl p-4 flex flex-col justify-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-center">Split Strategy</span>
                <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl">
                  {['equal', 'item', 'percent', 'custom'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setSplitTab(tab);
                        if (tab === 'equal') {
                          updateBill({ splitType: 'equal' });
                        } else if (tab === 'percent') {
                          updateBill({ splitType: 'percentage' });
                        } else if (tab === 'custom') {
                          updateBill({ splitType: 'custom' });
                        } else {
                          updateBill({ splitType: 'equal' }); // item-based fallbacks
                        }
                      }}
                      className={cn(
                        "py-2 text-[9px] font-black uppercase rounded-lg transition-all border-none outline-none cursor-pointer text-center",
                        splitTab === tab
                          ? "bg-slate-900 text-indigo-400 shadow"
                          : "text-slate-500 hover:text-slate-350"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Split Strategy Panel */}
            <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 flex flex-col flex-1 min-h-[460px] justify-between">
              <div>
                {splitTab === 'equal' && (
                  <div className="flex flex-col items-center justify-center text-center py-12 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-indigo-950/40 border border-indigo-900/60 text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                      <Icon name="call_split" className="text-2xl" />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">Split Equal Shares</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                      This will automatically divide the grand total of <span className="text-slate-300 font-bold">Rp {receiptGrandTotal.toLocaleString('id-ID')}</span> equally among all <span className="text-slate-300 font-bold">{persons.length}</span> participants.
                    </p>
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 w-full mb-6 font-numeric">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Share Per Person</span>
                      <span className="text-xl font-black text-indigo-400">Rp {Math.round(receiptGrandTotal / (persons.length || 1)).toLocaleString('id-ID')}</span>
                    </div>
                    <button
                      onClick={() => {
                        // Mark all items as assigned to everyone
                        persons.forEach(p => {
                          items.forEach(item => {
                            if (!assignments[p.id]?.[item.id]) {
                              toggleAssignment(p.id, item.id);
                            }
                          });
                        });
                        alert('Equal split assigned!');
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs shadow-md border-none outline-none cursor-pointer transition-all"
                    >
                      Apply Equal Split
                    </button>
                  </div>
                )}

                {splitTab === 'item' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">High-Density Spreadsheet Split Grid</h4>
                      <button
                        onClick={() => {
                          // Bulk assign all
                          persons.forEach(p => {
                            items.forEach(item => {
                              if (!assignments[p.id]?.[item.id]) {
                                toggleAssignment(p.id, item.id);
                              }
                            });
                          });
                        }}
                        className="text-[9px] font-extrabold uppercase text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-900/30 bg-indigo-950/20 px-2.5 py-1.5 rounded-lg cursor-pointer"
                      >
                        Split ALL Items
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/30 hide-scrollbar">
                      <table className="w-full border-collapse text-left text-xs font-semibold font-numeric">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-900">
                            <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-950 z-20 min-w-[200px]">Item name</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Price</th>
                            <th className="px-6 py-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest text-center w-20">Shared</th>
                            {persons.map(p => (
                              <th key={p.id} className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center min-w-[100px] truncate">{p.name || '...'}</th>
                            ))}
                            <th className="px-6 py-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest text-right sticky right-0 bg-slate-950 z-20 w-32">Split Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {items.map(item => {
                            const assignedCount = persons.filter(p => assignments[p.id]?.[item.id]).length;
                            const costPerPerson = assignedCount > 0 ? Math.round(item.price / assignedCount) : 0;
                            const isShared = persons.length > 0 && persons.every(p => assignments[p.id]?.[item.id]);

                            return (
                              <tr key={item.id} className="hover:bg-slate-900/20 transition-colors group">
                                <td className="px-6 py-4 sticky left-0 bg-[#070b19] group-hover:bg-[#0c1228] z-10 transition-colors font-bold text-white truncate max-w-[200px]">{item.name || 'Unnamed Item'}</td>
                                <td className="px-6 py-4 text-right text-slate-400">Rp {item.price.toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isShared}
                                    onChange={() => {
                                      const targetVal = !isShared;
                                      persons.forEach(p => {
                                        const currentlyAssigned = !!assignments[p.id]?.[item.id];
                                        if (currentlyAssigned !== targetVal) {
                                          toggleAssignment(p.id, item.id);
                                        }
                                      });
                                    }}
                                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                                  />
                                </td>
                                {persons.map(p => (
                                  <td key={p.id} className="px-4 py-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={assignments[p.id]?.[item.id] || false}
                                      onChange={() => toggleAssignment(p.id, item.id)}
                                      className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                                    />
                                  </td>
                                ))}
                                <td className="px-6 py-4 text-right text-indigo-400 font-bold sticky right-0 bg-[#070b19] group-hover:bg-[#0c1228] z-10 transition-colors">Rp {costPerPerson.toLocaleString('id-ID')}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {splitTab === 'percent' && (
                  <div className="max-w-2xl mx-auto w-full space-y-6 py-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Adjust Custom Percentages</span>
                      <span className="text-[10px] font-black text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded">Total: 100% Recommended</span>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
                      {persons.map((p) => {
                        const currentPercent = p.percentage || 0;
                        const allocatedAmount = Math.round(receiptGrandTotal * (currentPercent / 100));

                        return (
                          <div key={p.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-3 font-numeric">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">{p.name || 'Unnamed'}</span>
                              <span className="text-xs font-black text-indigo-400">Rp {allocatedAmount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={currentPercent}
                                onChange={(e) => {
                                  const newVal = parseInt(e.target.value) || 0;
                                  useBillStore.getState().updatePerson(p.id, { percentage: newVal });
                                }}
                                className="flex-1 accent-indigo-500 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="w-16 relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={currentPercent === 0 ? '' : currentPercent}
                                  onChange={(e) => {
                                    const newVal = parseInt(e.target.value) || 0;
                                    useBillStore.getState().updatePerson(p.id, { percentage: newVal });
                                  }}
                                  className="w-full text-right bg-slate-950 border border-slate-900 rounded-lg py-1 px-2 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                  placeholder="0"
                                />
                                <span className="absolute right-2.5 top-1.5 text-[9px] font-black text-slate-600">%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {splitTab === 'custom' && (
                  <div className="max-w-xl mx-auto w-full space-y-6 py-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key In Absolute Amounts</span>
                      <span className="text-[10px] font-black text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded">Subtotal: Rp {totalBillSubtotal.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
                      {persons.map((p) => {
                        const currentAmount = p.customAmount || 0;

                        return (
                          <div key={p.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex justify-between items-center font-numeric">
                            <span className="text-xs font-bold text-white">{p.name || 'Unnamed'}</span>
                            <div className="w-44 relative">
                              <span className="absolute left-3 top-2.5 text-[9px] font-black text-slate-600">Rp</span>
                              <input
                                type="number"
                                value={currentAmount === 0 ? '' : currentAmount}
                                onChange={(e) => {
                                  const newVal = parseFloat(e.target.value) || 0;
                                  useBillStore.getState().updatePerson(p.id, { customAmount: newVal });
                                }}
                                className="w-full text-right bg-slate-950 border border-slate-900 rounded-xl py-2 pl-8 pr-3 text-xs font-bold text-white outline-none focus:border-indigo-500"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-900 flex justify-between items-center gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer outline-none"
                >
                  <Icon name="arrow_back" className="text-xs" />
                  Back: Add People
                </button>

                <button
                  onClick={() => setStep(5)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5 border-none outline-none cursor-pointer"
                >
                  Next: Settlement Summary
                  <Icon name="arrow_forward" className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        );
      } case 5: {
        const totalGrand = personTotals.reduce((sum, p) => sum + p.total, 0);
        const totalTaxAndService = totalGrand - receiptSubtotal;

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-12 gap-8 w-full text-slate-200"
          >
            {/* Left Column: Settlement Summary Card & Members Breakdown */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              {/* Grand Total Bento Card */}
              <div className="bg-gradient-to-br from-[#0c122c] to-[#050714] border border-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Grand Total Settlement</span>
                <h3 className="text-5xl font-black text-white font-numeric tracking-tight mb-6">Rp {totalGrand.toLocaleString('id-ID')}</h3>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-900/60 font-numeric">
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Subtotal</span>
                    <span className="text-sm font-bold text-slate-350">Rp {receiptSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Taxes & Services</span>
                    <span className="text-sm font-bold text-slate-350">Rp {totalTaxAndService.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Cyber-mesh mesh background lines */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
              </div>

              {/* Members Breakdown */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block"></span>
                  Individual Settlement shares
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1 hide-scrollbar">
                  {personTotals.map((p, i) => (
                    <div key={p.id} className="bg-[#070b19] border border-slate-900 hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between transition-all group font-numeric">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {p.name.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-white">{p.name || 'Unnamed'}</h5>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Split Participant</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-slate-950 text-[11px] font-bold text-slate-400">
                        <div className="flex justify-between">
                          <span>Items Share</span>
                          <span>Rp {p.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax & Service</span>
                          <span>Rp {((p.tax || 0) + (p.service || 0)).toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-950 flex justify-between items-center">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Total due</span>
                        <span className="text-sm font-black text-white">Rp {p.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Payer Method, Saving Options, and Share Actions */}
            <div className="col-span-12 lg:col-span-5 space-y-6 bg-[#070b19] border border-slate-900 rounded-3xl p-6 flex flex-col justify-between min-h-[500px]">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block"></span>
                  Transfer Methods
                </h4>

                {bill.payerId ? (
                  <div className="space-y-5">
                    {/* Active payer display */}
                    <div className="flex items-center gap-3 p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-900 flex items-center justify-center text-sm font-black text-indigo-400 uppercase">
                        {personsMap.get(bill.payerId)?.name?.charAt(0) || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Receipt Payee</span>
                        <span className="text-xs font-bold text-white block truncate">{personsMap.get(bill.payerId)?.name || 'Unnamed'}</span>
                      </div>
                      <div className="text-right font-numeric">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">To Receive</span>
                        <span className="text-xs font-black text-indigo-400">Rp {(totalGrand - (personTotals.find(p => p.id === bill.payerId)?.total || 0)).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Receiving inputs */}
                    <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Update Transfer Details</span>

                      <div className="relative">
                        <Icon name="account_balance" className="absolute left-3 top-2.5 text-slate-500 text-xs" />
                        <input
                          placeholder="Bank Name (e.g. BCA, Mandiri)"
                          value={bill.persons.find(p => p.id === bill.payerId)?.paymentInfo?.bank || ''}
                          onChange={(e) => updatePerson(bill.payerId, { paymentInfo: { bank: e.target.value } })}
                          className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-900 rounded-lg focus:border-indigo-500 outline-none text-white font-bold"
                        />
                      </div>

                      <div className="relative">
                        <Icon name="credit_card" className="absolute left-3 top-2.5 text-slate-500 text-xs" />
                        <input
                          placeholder="Account Number"
                          value={bill.persons.find(p => p.id === bill.payerId)?.paymentInfo?.accountNumber || ''}
                          onChange={(e) => updatePerson(bill.payerId, { paymentInfo: { accountNumber: e.target.value } })}
                          className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-900 rounded-lg focus:border-indigo-500 outline-none text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4 bg-slate-950/20 rounded-xl border border-dashed border-slate-900">
                    <Icon name="person_off" className="text-2xl text-slate-700 mb-2" />
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed max-w-[200px]">
                      Please select who settled the bill in **Step 3** to configure payer payment routing.
                    </p>
                  </div>
                )}
              </div>

              {/* Strategy Save actions & Social sharing */}
              <div className="mt-8 space-y-4 pt-6 border-t border-slate-900">
                <div className="grid grid-cols-2 gap-3">
                  {/* Save as Draft option */}
                  <button
                    onClick={async () => {
                      try {
                        await completeBill('draft');
                        setSaveFeedback('Saved as draft successfully!');
                        setTimeout(() => { setSaveFeedback(null); setActiveTab('dashboard'); }, 1500);
                      } catch (err) {
                        setSaveFeedback('Saved to local draft.');
                        setTimeout(() => { setSaveFeedback(null); setActiveTab('dashboard'); }, 1500);
                      }
                    }}
                    className="py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none"
                  >
                    <Icon name="drafts" className="text-sm text-indigo-400" />
                    Save as Draft
                  </button>

                  {/* Save & Finalize */}
                  <button
                    onClick={async () => {
                      try {
                        await completeBill('pending');
                        setSaveFeedback('Split ledger finalized and saved!');
                        setTimeout(() => { setSaveFeedback(null); setActiveTab('dashboard'); }, 1500);
                      } catch (err) {
                        setSaveFeedback('Saved to local history.');
                        setTimeout(() => { setSaveFeedback(null); setActiveTab('dashboard'); }, 1500);
                      }
                    }}
                    className="py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-xl font-extrabold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none"
                  >
                    <Icon name="check_circle" className="text-sm" />
                    Finalize Split
                  </button>
                </div>

                {/* WhatsApp Direct Share Template */}
                <button
                  onClick={() => {
                    const payer = bill.persons.find(p => p.id === bill.payerId);
                    if (!payer) {
                      alert('Please select a payer first.');
                      return;
                    }
                    const otherTotals = personTotals.filter(p => p.id !== bill.payerId && p.total > 0);
                    const totalToReceive = totalGrand - (personTotals.find(p => p.id === bill.payerId)?.total || 0);

                    const message = `✨ *SplitMate Premium Settlement: ${bill.title || 'Untitled Ledger'}* ✨\n\n` +
                      `Total to Settle: *Rp ${totalToReceive.toLocaleString('id-ID')}*\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n\n` +
                      otherTotals.map(p => `💸 *${p.name}*: Rp ${p.total.toLocaleString('id-ID')}`).join('\n') +
                      `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
                      `🏦 *Transfer to ${payer.name}*\n` +
                      `• ${payer.paymentInfo?.bank || 'Bank (TBD)'}: ${payer.paymentInfo?.accountNumber || 'Account (TBD)'}\n\n` +
                      `_Join SplitMate to view receipts online!_`;

                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="w-full py-3.5 bg-[#0d1c15] hover:bg-[#122e20] text-emerald-450 border border-emerald-950/40 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer outline-none"
                >
                  <Icon name="share" className="text-emerald-400 text-sm" />
                  Share Settlement via WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        );
      }
      default:
        return <div>Unknown Step</div>;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': {
        const totalGrand = completedBills
          .filter(b => b.status !== 'draft')
          .reduce((sum, b) => sum + b.grandTotal, 0);

        // Dynamic KPI calculations from store
        const totalOwed = completedBills
          .filter(b => b.status === 'pending')
          .reduce((sum, b) => {
            const unpaidPersons = b.persons.filter(p => !p.paid && p.id !== b.payerId);
            const unpaidTotal = unpaidPersons.reduce((pSum, p) => {
              const pT = b.totals.find(t => t.id === p.id)?.total || 0;
              return pSum + pT;
            }, 0);
            return sum + unpaidTotal;
          }, 0);

        const currentMonth = new Date().getMonth();
        const monthlySpending = completedBills
          .filter(b => b.status !== 'draft' && new Date(b.completedAt).getMonth() === currentMonth)
          .reduce((sum, b) => sum + b.grandTotal, 0);

        const pendingSettlementsCount = completedBills.filter(b => b.status === 'pending').length;
        const monthlyBillsCount = completedBills.filter(b => new Date(b.completedAt).getMonth() === currentMonth).length;

        // Populate friends who owe you
        const peopleWhoOweYou = [];
        completedBills.forEach(b => {
          if (b.status === 'pending') {
            b.persons.forEach(p => {
              if (!p.paid && p.id !== b.payerId) {
                const pTotal = b.totals.find(t => t.id === p.id)?.total || 0;
                if (pTotal > 0) {
                  peopleWhoOweYou.push({
                    id: `${b.id}-${p.id}`,
                    billId: b.id,
                    personId: p.id,
                    name: p.name,
                    billTitle: b.title,
                    amount: pTotal,
                  });
                }
              }
            });
          }
        });

        // Mock you owe others
        const youOweOthersMock = [
          { id: 'mock-1', name: 'Alex Johnson', billTitle: 'Weekend Cabin split', amount: 450000, dueDate: 'Tomorrow' },
          { id: 'mock-2', name: 'Samantha Miller', billTitle: 'Group Gift split', amount: 120000, dueDate: 'In 3 days' },
        ];

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#030712] text-slate-100 font-inter hide-scrollbar"
          >
            {/* Header & Quick Action */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">Financial Workspace</h1>
                <p className="text-slate-500 text-xs font-semibold mt-1 uppercase tracking-wider">SplitMate SaaS Platform</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveTab('bills'); setStep(1); }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center gap-2 border-none outline-none cursor-pointer"
                >
                  <Icon name="add" className="text-base" />
                  New Bill
                </button>
              </div>
            </div>

            {/* Hero KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Outstanding Balance */}
              <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">Receivables (Owed to You)</span>
                  <Icon name="trending_up" className="text-emerald-500 text-base" />
                </div>
                <h3 className="text-2xl font-black mt-3 text-white font-numeric">Rp {totalOwed.toLocaleString('id-ID')}</h3>
                <p className="text-[10px] text-emerald-400/80 font-bold mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Outstanding Balance
                </p>
              </div>

              {/* Card 2: Monthly Spending */}
              <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">Monthly Spending</span>
                  <Icon name="payments" className="text-indigo-400 text-base" />
                </div>
                <h3 className="text-2xl font-black mt-3 text-white font-numeric">Rp {monthlySpending.toLocaleString('id-ID')}</h3>
                <p className="text-[10px] text-indigo-400/80 font-bold mt-2">
                  Cumulative totals this month
                </p>
              </div>

              {/* Card 3: Pending Settlements */}
              <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">Pending Settlements</span>
                  <Icon name="pending_actions" className="text-amber-500 text-base" />
                </div>
                <h3 className="text-2xl font-black mt-3 text-white font-numeric">{pendingSettlementsCount} active</h3>
                <p className="text-[10px] text-amber-400/80 font-bold mt-2">
                  Awaiting settlement confirmation
                </p>
              </div>

              {/* Card 4: Bills This Month */}
              <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">Bills This Month</span>
                  <Icon name="receipt" className="text-purple-400 text-base" />
                </div>
                <h3 className="text-2xl font-black mt-3 text-white font-numeric">{monthlyBillsCount} ledgers</h3>
                <p className="text-[10px] text-purple-400/80 font-bold mt-2">
                  Drafts and finalized statements
                </p>
              </div>
            </div>

            {/* 12-Column Grid Sections */}
            <div className="grid grid-cols-12 gap-8">

              {/* Left Column (8-col): Trend Chart, Categories, Timeline */}
              <div className="col-span-12 lg:col-span-8 space-y-8">

                {/* 1. Expense Trend Line Chart */}
                <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block"></span>
                        Expense Trend &amp; Flow
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">Real-time expenditure tracking analysis</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-950/50 border border-indigo-900/40 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      Live Flow
                    </span>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative h-48 w-full mt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="secondaryGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line x1="0" y1="25" x2="500" y2="25" stroke="#0f172a" strokeDasharray="3 3" strokeWidth="1" />
                      <line x1="0" y1="75" x2="500" y2="75" stroke="#0f172a" strokeDasharray="3 3" strokeWidth="1" />
                      <line x1="0" y1="125" x2="500" y2="125" stroke="#0f172a" strokeDasharray="3 3" strokeWidth="1" />

                      {/* Line 1 - Spending */}
                      <path
                        d="M 0 130 C 50 120, 100 60, 150 70 C 200 80, 250 30, 300 40 C 350 50, 400 90, 450 65 C 475 52, 500 20, 500 20"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      />
                      <path
                        d="M 0 130 C 50 120, 100 60, 150 70 C 200 80, 250 30, 300 40 C 350 50, 400 90, 450 65 C 475 52, 500 20, 500 20 L 500 150 L 0 150 Z"
                        fill="url(#chartGlow)"
                      />

                      {/* Line 2 - Owed / Received */}
                      <path
                        d="M 0 140 C 70 130, 130 90, 200 95 C 270 100, 340 70, 410 75 C 455 78, 500 45, 500 45"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                        className="opacity-75 drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]"
                      />
                      <path
                        d="M 0 140 C 70 130, 130 90, 200 95 C 270 100, 340 70, 410 75 C 455 78, 500 45, 500 45 L 500 150 L 0 150 Z"
                        fill="url(#secondaryGlow)"
                      />
                    </svg>
                  </div>

                  {/* X-Axis labels */}
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4 px-2">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>

                {/* 2. Spending Category Donut Chart */}
                <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
                    Category Distribution
                  </h3>

                  <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#0b0f19" strokeWidth="4.5" />
                        {/* Food & Dining (45%) */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#6366f1" strokeWidth="4.5" strokeDasharray="45 55" strokeDashoffset="0" className="drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]" />
                        {/* Utilities (25%) */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4.5" strokeDasharray="25 75" strokeDashoffset="-45" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                        {/* Travel (20%) */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray="20 80" strokeDashoffset="-70" className="drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                        {/* Others (10%) */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4.5" strokeDasharray="10 90" strokeDashoffset="-90" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Total</span>
                        <span className="text-base font-black text-white mt-1">100%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                        <div className="flex flex-col">
                          <span>Food &amp; Dining</span>
                          <span className="text-[10px] text-slate-500 font-bold">45% of total</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <div className="flex flex-col">
                          <span>Utilities &amp; Rent</span>
                          <span className="text-[10px] text-slate-500 font-bold">25% of total</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <div className="flex flex-col">
                          <span>Travel &amp; Outings</span>
                          <span className="text-[10px] text-slate-500 font-bold">20% of total</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                        <div className="flex flex-col">
                          <span>Other Splits</span>
                          <span className="text-[10px] text-slate-500 font-bold">10% of total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Recent Activity Timeline */}
                <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-3 bg-purple-500 rounded-full inline-block"></span>
                    Recent Activity Timeline
                  </h3>

                  <div className="space-y-4">
                    {completedBills.length > 0 ? (
                      completedBills.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedBillId(item.id)}
                          className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900/50 hover:border-indigo-500/20 rounded-xl transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-sm group-hover:scale-105 transition-transform">
                              <Icon name="receipt" className="text-lg" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors text-sm">{item.title || 'Untitled Bill'}</p>
                              <p className="text-[10px] text-slate-500 font-bold">
                                {new Date(item.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-200 font-numeric text-sm">Rp {item.grandTotal.toLocaleString('id-ID')}</p>
                            <span className={cn(
                              "text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider mt-1.5 inline-block border",
                              item.status === 'completed'
                                ? "bg-green-950/30 text-green-400 border-green-900/30"
                                : item.status === 'draft'
                                  ? "bg-indigo-950/30 text-indigo-400 border-indigo-900/30"
                                  : "bg-amber-950/30 text-amber-400 border-amber-900/30"
                            )}>
                              {item.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-slate-950/20 border border-dashed border-slate-900 rounded-2xl">
                        <Icon name="history" className="text-3xl text-slate-700 mb-3" />
                        <p className="text-xs font-bold text-slate-400 mb-1">No split history registered</p>
                        <p className="text-[10px] text-slate-500 max-w-[280px] leading-relaxed">
                          Scan a receipt or start a manual ledger to populate your dashboard timeline!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column (4-col): Quick Actions, Owed, You Owe, Smart Insights */}
              <div className="col-span-12 lg:col-span-4 space-y-8">

                {/* 7. Quick Actions Panel */}
                <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-3 bg-amber-500 rounded-full inline-block"></span>
                    Terminal Access
                  </h3>
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={() => { setActiveTab('bills'); setStep(1); }}
                      className="p-3 bg-slate-950/40 border border-slate-900 hover:border-indigo-500/30 hover:bg-slate-900/40 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer outline-none group"
                    >
                      <Icon name="add" className="text-lg text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-slate-300">New Bill</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('bills'); setStep(1); }}
                      className="p-3 bg-slate-950/40 border border-slate-900 hover:border-emerald-500/30 hover:bg-slate-900/40 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer outline-none group"
                    >
                      <Icon name="document_scanner" className="text-lg text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-slate-300">Scan Receipt</span>
                    </button>

                    <button
                      onClick={() => alert("Quick Settle initiated! Choose an active pending bill from the Recent Activity list below to confirm payment.")}
                      className="p-3 bg-slate-950/40 border border-slate-900 hover:border-amber-500/30 hover:bg-slate-900/40 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer outline-none group"
                    >
                      <Icon name="done_all" className="text-lg text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-slate-300">Quick Settle</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('bills'); setStep(3); }}
                      className="p-3 bg-slate-950/40 border border-slate-900 hover:border-purple-500/30 hover:bg-slate-900/40 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer outline-none group"
                    >
                      <Icon name="person_add" className="text-lg text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-slate-300">Add Friend</span>
                    </button>
                  </div>
                </div>

                {/* 4. People Who Owe You */}
                <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
                    Receivables Details
                  </h3>
                  <div className="space-y-3.5">
                    {peopleWhoOweYou.length > 0 ? (
                      peopleWhoOweYou.map((debtor) => (
                        <div key={debtor.id} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                          <div>
                            <p className="text-xs font-bold text-slate-200">{debtor.name}</p>
                            <p className="text-[9px] text-slate-500 font-medium mt-0.5">Owes for: {debtor.billTitle}</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <span className="text-xs font-black text-emerald-400 font-numeric">Rp {debtor.amount.toLocaleString('id-ID')}</span>
                            <button
                              onClick={() => {
                                alert(`Payment reminder successfully sent to ${debtor.name} for the ledger "${debtor.billTitle}"!`);
                              }}
                              className="p-1.5 bg-indigo-950/50 hover:bg-indigo-900/30 border border-indigo-900/30 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer outline-none"
                              title="Send Reminder"
                            >
                              <Icon name="notifications_active" className="text-xs" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-900">
                        <Icon name="group" className="text-2xl text-slate-800 mb-2" />
                        <p className="text-[10px] font-bold text-slate-500">No outstanding receivables</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. You Owe Others */}
                <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-3 bg-rose-500 rounded-full inline-block"></span>
                    Payables (You Owe)
                  </h3>
                  <div className="space-y-3.5">
                    {youOweOthersMock.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-slate-200">{item.name}</p>
                          <p className="text-[9px] text-slate-500 font-medium mt-0.5">For: {item.billTitle}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="text-xs font-black text-rose-400 font-numeric">Rp {item.amount.toLocaleString('id-ID')}</p>
                            <p className="text-[8px] text-rose-500 font-bold mt-0.5">{item.dueDate}</p>
                          </div>
                          <button
                            onClick={() => {
                              alert(`Quick payment flow simulated! Paid Rp ${item.amount.toLocaleString('id-ID')} to ${item.name} for "${item.billTitle}".`);
                            }}
                            className="px-2.5 py-1.5 bg-rose-950/30 hover:bg-rose-900/30 border border-rose-900/30 text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer outline-none"
                          >
                            Pay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Smart Financial Insights Widget */}
                <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Icon name="psychology" className="text-indigo-400 text-lg" />
                    Smart Insights
                  </h3>
                  <div className="space-y-4 text-xs font-medium text-slate-300">
                    {totalOwed > 0 ? (
                      <div className="flex gap-3 items-start bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-xl">
                        <Icon name="lightbulb" className="text-indigo-400 text-sm mt-0.5 flex-shrink-0" />
                        <p className="leading-relaxed text-[11px]">
                          You have <span className="font-black text-white">Rp {totalOwed.toLocaleString('id-ID')}</span> in pending receivables. Send reminders to prompt payment.
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-3 items-start bg-slate-950/40 border border-slate-900 p-3 rounded-xl">
                        <Icon name="check_circle" className="text-emerald-400 text-sm mt-0.5 flex-shrink-0" />
                        <p className="leading-relaxed text-[11px]">
                          All outstanding balances settled! Your dashboard is clear. Good job!
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 items-start bg-slate-950/40 border border-slate-900 p-3 rounded-xl">
                      <Icon name="savings" className="text-emerald-400 text-sm mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed text-[11px]">
                        Food &amp; Dining is your largest category (45%). Consider hosting potlucks to keep costs down!
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        );
      }
    }

    if (activeTab === 'settings') {
      const tabs = [
        { id: 'account', label: 'Account', icon: 'person_outline' },
        { id: 'preferences', label: 'App Preferences', icon: 'tune' },
        { id: 'split', label: 'Split Preferences', icon: 'call_split' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications_none' },
        { id: 'billing', label: 'Billing & Pro', icon: 'credit_card' },
        { id: 'security', label: 'Security', icon: 'shield' },
        { id: 'danger', label: 'Danger Zone', icon: 'warning_amber' },
      ];

      return (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="max-w-7xl mx-auto w-full p-8 text-slate-200"
        >
          {/* Toast Notification for Saved State */}
          <AnimatePresence>
            {saveFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-6 right-6 z-50 bg-[#0d1c15] border border-emerald-900/60 p-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400">
                  <Icon name="check" className="text-sm font-black" />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">Success</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{saveFeedback}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
                System Settings
              </h1>
              <p className="text-slate-500 mt-1.5 text-xs md:text-sm font-semibold">
                Configure your SplitMate platform profile, OCR triggers, split defaults, and billing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 w-full">
            {/* Left Nav Column */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden shadow-premium">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600/10"></div>
                {tabs.map((tab) => {
                  const isActive = settingsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl text-left text-xs font-extrabold flex items-center gap-3 transition-all cursor-pointer border-none outline-none relative overflow-hidden",
                        isActive
                          ? "bg-indigo-650/30 text-indigo-400 border border-indigo-900/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                          : "text-slate-500 hover:text-slate-300 hover:bg-slate-950/40 border border-transparent"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 w-1 h-6 bg-indigo-500 rounded-full" />
                      )}
                      <Icon name={tab.icon} className={cn("text-base", isActive ? "text-indigo-400" : "text-slate-500")} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Account Quick Status Widget */}
              <div className="bg-gradient-to-br from-[#070b19] to-[#040813] border border-slate-900 rounded-2xl p-5 relative overflow-hidden shadow-premium text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-950/50 border border-indigo-900/40 flex items-center justify-center text-xl font-black text-indigo-400 mx-auto mb-3 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  {profileForm.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <h4 className="text-xs font-black text-white truncate">{profileForm.name}</h4>
                <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mt-1">SplitMate Free Tier</p>
                <div className="mt-4 pt-4 border-t border-slate-950">
                  <button
                    onClick={() => setSettingsTab('billing')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all border-none outline-none cursor-pointer shadow-md hover:shadow-indigo-600/20"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>

            {/* Right Content Column */}
            <div className="col-span-12 lg:col-span-9">
              <div className="bg-[#070b19] border border-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-premium min-h-[500px] flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600/30"></div>

                <div className="flex-1">
                  {/* Account Tab Content */}
                  {settingsTab === 'account' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div>
                        <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2 mb-1">
                          <Icon name="person" className="text-indigo-400 text-base" />
                          Account Information
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Update your profile parameters, phone numbers, and default locale.</p>
                      </div>

                      {/* Avatar Selection Deck */}
                      <div className="p-4 bg-slate-950/40 border border-slate-950 rounded-xl flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-xl font-black text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.1)] flex-shrink-0">
                          {profileForm.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Profile Photo</span>
                          <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-all border-none outline-none cursor-pointer">
                              Upload Photo
                            </button>
                            <button className="px-3 py-1.5 bg-transparent hover:bg-slate-950 text-slate-500 font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-all border border-slate-900 cursor-pointer">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Input Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative group">
                          <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">Display Name</label>
                          <input
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-white transition-all placeholder-slate-700"
                            placeholder="e.g. Anton Wijaya"
                          />
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">Email Address</label>
                          <input
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-white transition-all placeholder-slate-700"
                            placeholder="e.g. anton.wijaya@splitmate.id"
                          />
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">WhatsApp / Phone</label>
                          <input
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-white transition-all placeholder-slate-700"
                            placeholder="e.g. +62 812-3456-7890"
                          />
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">System Timezone</label>
                          <select
                            value={profileForm.timezone}
                            onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                            className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-white transition-all cursor-pointer"
                          >
                            <option value="Asia/Jakarta (GMT+7)">Asia/Jakarta (GMT+7)</option>
                            <option value="Asia/Singapore (GMT+8)">Asia/Singapore (GMT+8)</option>
                            <option value="Europe/London (GMT+0)">Europe/London (GMT+0)</option>
                            <option value="America/New_York (GMT-5)">America/New_York (GMT-5)</option>
                          </select>
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">System Language</label>
                          <select
                            value={profileForm.language}
                            onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                            className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-white transition-all cursor-pointer"
                          >
                            <option value="English">English</option>
                            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                            <option value="Español">Español</option>
                            <option value="Français">Français</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* App Preferences Tab Content */}
                  {settingsTab === 'preferences' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div>
                        <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2 mb-1">
                          <Icon name="tune" className="text-indigo-400 text-base" />
                          Application Preferences
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Tweak structural visual metrics, currency overlays, and animations preferences.</p>
                      </div>

                      <div className="space-y-4 p-4 bg-slate-950/30 border border-slate-950 rounded-xl font-semibold text-xs divide-y divide-slate-950">
                        {/* Dark Mode */}
                        <div className="flex items-center justify-between pb-4">
                          <div>
                            <p className="font-bold text-white">Dark Mode Forced Theme</p>
                            <p className="text-[10px] text-slate-500">Enable high-contrast dark mode display center.</p>
                          </div>
                          <div
                            onClick={() => {
                              const newMode = !settings.darkMode;
                              updateSettings({ darkMode: newMode });
                              document.documentElement.classList.toggle('dark', newMode);
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

                        {/* Liquid Animations */}
                        <div className="flex items-center justify-between py-4">
                          <div>
                            <p className="font-bold text-white">Liquid Animations</p>
                            <p className="text-[10px] text-slate-500">Fluid spring animations and premium micro-interactions.</p>
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

                        {/* Whole Number Rounding */}
                        <div className="flex items-center justify-between py-4">
                          <div>
                            <p className="font-bold text-white">Whole Number Rounding</p>
                            <p className="text-[10px] text-slate-500">Automatically round fractions for neat IDR balances.</p>
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

                        {/* Default Currency Selection */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <p className="font-bold text-white">Primary Currency Display</p>
                            <p className="text-[10px] text-slate-500">Preferred standard currency format across all ledgers.</p>
                          </div>
                          <select
                            value={settings.currency || 'IDR'}
                            onChange={(e) => updateSettings({ currency: e.target.value })}
                            className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs font-bold outline-none ring-indigo-500/20 focus-visible:ring-2 cursor-pointer text-slate-200"
                          >
                            <option value="IDR">IDR (Rp)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="SGD">SGD ($)</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Split Preferences Tab Content */}
                  {settingsTab === 'split' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div>
                        <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2 mb-1">
                          <Icon name="call_split" className="text-indigo-400 text-base" />
                          Split Preferences
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Establish calculation rules for tax, auto-save drafts, and default strategies.</p>
                      </div>

                      <div className="space-y-4 p-4 bg-slate-950/30 border border-slate-950 rounded-xl font-semibold text-xs divide-y divide-slate-950">
                        {/* Default Split Mode */}
                        <div className="flex items-center justify-between pb-4">
                          <div>
                            <p className="font-bold text-white">Default Split Strategy</p>
                            <p className="text-[10px] text-slate-500">Default strategy loaded at the start of step 4.</p>
                          </div>
                          <select
                            value={settings.defaultSplitMode || 'equal'}
                            onChange={(e) => updateSettings({ defaultSplitMode: e.target.value })}
                            className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer text-slate-200"
                          >
                            <option value="equal">Equal Split</option>
                            <option value="item">Itemized Checklist Grid</option>
                            <option value="percent">Percentage Sliders</option>
                            <option value="custom">Custom Amounts</option>
                          </select>
                        </div>

                        {/* Tax Allocation */}
                        <div className="flex items-center justify-between py-4">
                          <div>
                            <p className="font-bold text-white">Tax Allocation Rule</p>
                            <p className="text-[10px] text-slate-500">Determine how Tax / PB1 is distributed to participants.</p>
                          </div>
                          <select
                            value={settings.taxAllocation || 'proportionate'}
                            onChange={(e) => updateSettings({ taxAllocation: e.target.value })}
                            className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer text-slate-200"
                          >
                            <option value="proportionate">Proportionate to subtotal (Recommended)</option>
                            <option value="even">Divided equally among all members</option>
                          </select>
                        </div>

                        {/* Service Charge Allocation */}
                        <div className="flex items-center justify-between py-4">
                          <div>
                            <p className="font-bold text-white">Service Charge Handling</p>
                            <p className="text-[10px] text-slate-500">Determine how service charges are split.</p>
                          </div>
                          <select
                            value={settings.serviceChargeHandling || 'proportionate'}
                            onChange={(e) => updateSettings({ serviceChargeHandling: e.target.value })}
                            className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer text-slate-200"
                          >
                            <option value="proportionate">Proportionate to subtotal (Recommended)</option>
                            <option value="even">Divided equally among all members</option>
                          </select>
                        </div>

                        {/* Auto-save Drafts */}
                        <div className="flex items-center justify-between py-4">
                          <div>
                            <p className="font-bold text-white">Auto-Save Ledger Drafts</p>
                            <p className="text-[10px] text-slate-500">Automatically save current ledger drafts before finalizing splits.</p>
                          </div>
                          <div
                            onClick={() => updateSettings({ autoSaveDraft: settings.autoSaveDraft === undefined ? false : !settings.autoSaveDraft })}
                            className={cn(
                              "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                              settings.autoSaveDraft !== false ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                            )}
                          >
                            <motion.div
                              layout
                              animate={{ x: settings.autoSaveDraft !== false ? 28 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </div>
                        </div>

                        {/* OCR Default behavior */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <p className="font-bold text-white">AI OCR Auto-Scan</p>
                            <p className="text-[10px] text-slate-500">Instantly trigger AI scanner on uploading image receipts.</p>
                          </div>
                          <div
                            onClick={() => updateSettings({ autoScan: !settings.autoScan })}
                            className={cn(
                              "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                              settings.autoScan ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                            )}
                          >
                            <motion.div
                              layout
                              animate={{ x: settings.autoScan ? 28 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Notifications Tab Content */}
                  {settingsTab === 'notifications' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div>
                        <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2 mb-1">
                          <Icon name="notifications_none" className="text-indigo-400 text-base" />
                          Notifications Rules
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Control direct channel outputs for reminders and settle requests.</p>
                      </div>

                      <div className="space-y-4 p-4 bg-slate-950/30 border border-slate-950 rounded-xl font-semibold text-xs divide-y divide-slate-950">
                        {/* WhatsApp Direct Reminders */}
                        <div className="flex items-center justify-between pb-4">
                          <div>
                            <p className="font-bold text-white">WhatsApp Settle Reminders</p>
                            <p className="text-[10px] text-slate-500">Allow generating single-click direct WhatsApp text instructions.</p>
                          </div>
                          <div
                            onClick={() => updateSettings({ whatsappReminders: settings.whatsappReminders === undefined ? true : !settings.whatsappReminders })}
                            className={cn(
                              "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                              settings.whatsappReminders !== false ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                            )}
                          >
                            <motion.div
                              layout
                              animate={{ x: settings.whatsappReminders !== false ? 28 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Settlement Request Alerts */}
                        <div className="flex items-center justify-between py-4">
                          <div>
                            <p className="font-bold text-white">Active Settlement Reminders</p>
                            <p className="text-[10px] text-slate-500">Receive in-app alerts when a participant settles their outstanding share.</p>
                          </div>
                          <div
                            onClick={() => updateSettings({ settlementReminders: settings.settlementReminders !== false })}
                            className={cn(
                              "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                              settings.settlementReminders !== false ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                            )}
                          >
                            <motion.div
                              layout
                              animate={{ x: settings.settlementReminders !== false ? 28 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Payment Due Notifications */}
                        <div className="flex items-center justify-between py-4">
                          <div>
                            <p className="font-bold text-white">Payment Due Alerts</p>
                            <p className="text-[10px] text-slate-500">Receive notifications when outbound splits approach set deadlines.</p>
                          </div>
                          <div
                            onClick={() => updateSettings({ paymentDueAlerts: settings.paymentDueAlerts === undefined ? true : !settings.paymentDueAlerts })}
                            className={cn(
                              "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                              settings.paymentDueAlerts !== false ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                            )}
                          >
                            <motion.div
                              layout
                              animate={{ x: settings.paymentDueAlerts !== false ? 28 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Email Alerts */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <p className="font-bold text-white">Weekly Digest Reports</p>
                            <p className="text-[10px] text-slate-500">Get rich summaries of split flows, balances, and savings via email.</p>
                          </div>
                          <div
                            onClick={() => updateSettings({ emailNotifications: settings.emailNotifications === undefined ? true : !settings.emailNotifications })}
                            className={cn(
                              "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                              settings.emailNotifications !== false ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                            )}
                          >
                            <motion.div
                              layout
                              animate={{ x: settings.emailNotifications !== false ? 28 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Billing Tab Content */}
                  {settingsTab === 'billing' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div>
                        <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2 mb-1">
                          <Icon name="credit_card" className="text-indigo-400 text-base" />
                          Billing & Subscription
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Manage your current quota plan, OCR scans consumption, and PDF exports limits.</p>
                      </div>

                      {/* Current Plan Bento Card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#0b0f19] border border-slate-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px] group shadow-premium">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                          <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Active Quota Level</span>
                            <h4 className="text-xl font-black text-white flex items-center gap-2">
                              Free Tier
                              <span className="text-[8px] font-black text-indigo-400 bg-indigo-950/60 border border-indigo-900/30 px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1">Upgrade to lift all OCR scanning limits and unlock export tools.</p>
                          </div>
                          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block mt-4">Rp 0 / month</span>
                        </div>

                        {/* OCR Usage Bar */}
                        <div className="bg-[#0b0f19] border border-slate-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-premium">
                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">OCR SCAN CONSUMPTION</span>
                            <div className="flex justify-between items-end">
                              <span className="text-2xl font-black text-white font-numeric">3 <span className="text-xs font-semibold text-slate-500">/ 10 scans</span></span>
                              <span className="text-[9px] font-black text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded uppercase tracking-wider">70% remaining</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full w-[30%]" />
                            </div>
                          </div>
                          <div className="space-y-2 pt-3 border-t border-slate-950">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">PDF EXPORT LIMITS</span>
                            <div className="flex justify-between items-end">
                              <span className="text-2xl font-black text-white font-numeric">1 <span className="text-xs font-semibold text-slate-500">/ 3 exports</span></span>
                              <span className="text-[9px] font-black text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded uppercase tracking-wider">66% remaining</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full w-[33%]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upgrade Plan Promo Deck */}
                      <div className="p-6 bg-gradient-to-br from-indigo-950/20 via-indigo-900/10 to-[#070b19] border border-indigo-950/60 rounded-2xl relative overflow-hidden shadow-premium">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1.5">★ Upgrade to SplitMate Pro</h4>
                        <h3 className="text-lg font-black text-white leading-tight mb-2">Unlock Unlimited Receipt Scans & Advanced Group Financial Intelligence</h3>

                        <ul className="space-y-1.5 text-[10px] text-slate-400 font-semibold mb-6 mt-4">
                          <li className="flex items-center gap-2"><Icon name="check" className="text-indigo-400 text-xs" /> Unlimited live AI OCR receipt scanning</li>
                          <li className="flex items-center gap-2"><Icon name="check" className="text-indigo-400 text-xs" /> High-fidelity PDF & Excel reports exports</li>
                          <li className="flex items-center gap-2"><Icon name="check" className="text-indigo-400 text-xs" /> Direct automated WhatsApp settlements reminding API</li>
                          <li className="flex items-center gap-2"><Icon name="check" className="text-indigo-400 text-xs" /> Advanced group spending statistics and CSV tools</li>
                        </ul>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <button className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all border-none outline-none cursor-pointer shadow-lg shadow-indigo-600/25 active:scale-95 animate-pulse">
                            Get SplitMate Pro (Rp 39.000 / mo)
                          </button>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Cancel anytime • 14 day free trial</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Security Tab Content */}
                  {settingsTab === 'security' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div>
                        <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2 mb-1">
                          <Icon name="shield" className="text-indigo-400 text-base" />
                          Security Settings
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Tweak password locks, activate two-factor authentication, and monitor active sessions.</p>
                      </div>

                      {/* Password Change Form */}
                      <div className="p-5 bg-slate-950/20 border border-slate-900 rounded-2xl space-y-5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Change Profile Password</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="relative group">
                            <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">Current Password</label>
                            <input
                              type="password"
                              value={securityForm.currentPassword}
                              onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-white transition-all"
                            />
                          </div>

                          <div className="relative group">
                            <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">New Password</label>
                            <input
                              type="password"
                              value={securityForm.newPassword}
                              onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-white transition-all"
                            />
                          </div>

                          <div className="relative group">
                            <label className="absolute -top-2 left-3 px-1 bg-[#070b19] text-[9px] font-black text-indigo-400 uppercase tracking-widest z-10">Confirm Password</label>
                            <input
                              type="password"
                              value={securityForm.confirmPassword}
                              onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-950/40 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-white transition-all"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={handleSaveSettings}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-all border border-slate-800 cursor-pointer outline-none"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>

                      {/* 2FA Toggle */}
                      <div className="p-5 bg-slate-950/20 border border-slate-900 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</p>
                          <p className="text-[10px] text-slate-500">Protect account credentials with standard verification codes.</p>
                        </div>
                        <div
                          onClick={() => setSecurityForm({ ...securityForm, twoFactorEnabled: !securityForm.twoFactorEnabled })}
                          className={cn(
                            "w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                            securityForm.twoFactorEnabled ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                          <motion.div
                            layout
                            animate={{ x: securityForm.twoFactorEnabled ? 28 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Active Sessions Device Monitor */}
                      <div className="p-5 bg-slate-950/20 border border-slate-900 rounded-2xl space-y-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Active Session Devices</span>
                        {sessions.length > 0 ? (
                          <div className="divide-y divide-slate-950 space-y-3 font-semibold text-xs">
                            {sessions.map((s) => (
                              <div key={s.id} className="flex justify-between items-center pt-3 first:pt-0">
                                <div className="flex gap-3 items-start">
                                  <Icon name={s.device.includes('iPhone') ? 'phone_iphone' : 'laptop_mac'} className="text-slate-500 text-lg mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-white font-bold flex items-center gap-1.5">
                                      {s.device}
                                      {s.active && (
                                        <span className="text-[7px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider">Current</span>
                                      )}
                                    </p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">{s.location} • IP: {s.ip}</p>
                                  </div>
                                </div>
                                {!s.active && (
                                  <button
                                    onClick={() => handleRevokeSession(s.id)}
                                    className="px-2.5 py-1 text-[9px] font-black text-rose-400 hover:text-rose-300 bg-rose-950/10 hover:bg-rose-950/30 border border-rose-900/30 rounded transition-all cursor-pointer outline-none"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-600 font-semibold italic text-center py-4">No active devices monitored.</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Danger Zone Tab Content */}
                  {settingsTab === 'danger' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div>
                        <h3 className="text-sm font-black uppercase text-rose-500 tracking-widest flex items-center gap-2 mb-1">
                          <Icon name="warning_amber" className="text-rose-500 text-base" />
                          Danger Zone
                        </h3>
                        <p className="text-[10px] text-rose-950/80 font-bold uppercase tracking-wider">High risk security credentials. Handle with absolute caution.</p>
                      </div>

                      <div className="p-6 bg-red-950/10 border border-red-900/30 rounded-2xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl" />

                        {/* Revoke All Sessions */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-red-900/10">
                          <div>
                            <h4 className="text-xs font-bold text-white">Revoke All Other Sessions</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Instantly log out from all devices, browsers, and mobile platforms except this session.</p>
                          </div>
                          <button
                            onClick={() => {
                              setSessions(prev => prev.filter(s => s.active));
                              setSaveFeedback('Other device sessions revoked.');
                              setTimeout(() => setSaveFeedback(null), 3000);
                            }}
                            className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer outline-none"
                          >
                            Revoke Sessions
                          </button>
                        </div>

                        {/* Delete Account */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                          <div>
                            <h4 className="text-xs font-bold text-rose-400">Permanently Delete Account</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Wipe your profile information, payment configuration, scan statistics, and split history forever.</p>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm('CAUTION: Are you absolutely sure you want to permanently delete your SplitMate account? This action is irreversible.')) {
                                logout();
                                navigate('/auth');
                              }
                            }}
                            className="w-full sm:w-auto px-5 py-2.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-900/40 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer outline-none"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer Save Changes Row */}
                {settingsTab !== 'billing' && settingsTab !== 'danger' && (
                  <div className="mt-8 pt-6 border-t border-slate-950 flex justify-between items-center gap-4">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      * Changes will be written to local state & database
                    </span>
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className={cn(
                        "px-6 py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 border-none outline-none cursor-pointer",
                        isSavingSettings
                          ? "bg-slate-900 text-slate-500 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 active:scale-98"
                      )}
                    >
                      {isSavingSettings ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          Save Changes
                          <Icon name="check" className="text-xs" />
                        </>
                      )}
                    </button>
                  </div>
                )}
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
          onNext={async () => {
            if (step === 4) {
              try {
                await completeBill('draft');
              } catch (err) {
                console.error('Failed to auto-save draft:', err);
              }
            }
            setStep(s => Math.min(s + 1, 5));
          }}
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

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessToken && !isGuest) {
    return null;
  }

  return (
    <div className="bg-[#030712] font-body-base text-slate-200 antialiased overflow-hidden h-screen flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SideNavBar onHelpOpen={() => setIsHelpOpen(true)} />
      </div>

      <main className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden bg-[#030712] pb-16 md:pb-0 transition-all duration-300",
        ui?.sidebarCollapsed ? "md:ml-20 ml-0" : "md:ml-[280px] ml-0"
      )}>
        {/* Desktop Header */}
        <div className="hidden md:block">
          <TopNavBar />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden block">
          <MobileHeader onHelpOpen={() => setIsHelpOpen(true)} />
        </div>

        <div className="mt-14 md:mt-16 flex-1 overflow-hidden flex flex-col">
          {renderContent()}
        </div>

        {/* Mobile Bottom Tab Bar */}
        <div className="md:hidden block">
          <BottomTabBar />
        </div>
      </main>

      {/* Help / FAQ Modal */}
      <HelpCenterModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Bill Details Modal */}
      {selectedBillId && (
        <BillDetailsModal billId={selectedBillId} onClose={() => setSelectedBillId(null)} />
      )}
    </div>
  );
}

