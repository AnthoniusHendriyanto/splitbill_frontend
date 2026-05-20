import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../lib/api';
import useAuthStore from './useAuthStore';

const useBillStore = create(
  persist(
    (set, get) => ({
      bill: {
        id: uuidv4(),
        title: '',
        imageUrl: '',
        items: [],
        persons: [],
        tax: 11,
        taxMode: 'percent',
        serviceCharge: 5,
        serviceMode: 'percent',
        payerId: null,
        splitType: 'equal',
      },
      
      updateBill: (data) => set((state) => ({ 
        bill: { ...state.bill, ...data } 
      })),

      addPerson: (name) => set((state) => ({
        bill: {
          ...state.bill,
          persons: [...state.bill.persons, { 
            id: uuidv4(), 
            name: name || '', 
            paymentInfo: { bank: '', accountNumber: '', qrisData: '' } 
          }]
        }
      })),

      updatePerson: (id, data) => set((state) => ({
        bill: {
          ...state.bill,
          persons: state.bill.persons.map(p => {
            if (p.id === id) {
              const updatedPerson = { ...p, ...data };
              // Deep merge paymentInfo if it exists in both
              if (data.paymentInfo && p.paymentInfo) {
                updatedPerson.paymentInfo = { ...p.paymentInfo, ...data.paymentInfo };
              }
              return updatedPerson;
            }
            return p;
          })
        }
      })),

      removePerson: (id) => set((state) => {
        const { [id]: removed, ...restAssignments } = state.assignments;
        return {
          bill: {
            ...state.bill,
            persons: state.bill.persons.filter(p => p.id !== id)
          },
          assignments: restAssignments
        };
      }),

      addItem: () => set((state) => ({
        bill: {
          ...state.bill,
          items: [...state.bill.items, { id: uuidv4(), name: '', price: 0 }]
        }
      })),

      updateItem: (id, data) => set((state) => ({
        bill: {
          ...state.bill,
          items: state.bill.items.map(item => item.id === id ? { ...item, ...data } : item)
        }
      })),

      removeItem: (id) => set((state) => ({
        bill: {
          ...state.bill,
          items: state.bill.items.filter(item => item.id !== id)
        }
      })),

      resetBill: () => set({
        bill: {
          id: uuidv4(),
          title: '',
          imageUrl: '',
          items: [],
          persons: [],
          tax: 11,
          taxMode: 'percent',
          serviceCharge: 5,
          serviceMode: 'percent',
          payerId: null,
          splitType: 'equal',
        },
        assignments: {},
      }),

      completedBills: [],

      fetchCompletedBills: async () => {
        const isAuth = useAuthStore.getState().isAuthenticated;
        if (!isAuth) return;
        try {
          const res = await api.getBills();
          if (res && res.data) {
            const mapped = res.data.map(bill => ({
              id: bill.id,
              title: bill.title,
              completedAt: bill.created_at,
              grandTotal: bill.grand_total,
              personCount: bill.person_count,
              totals: [],
              items: [],
              persons: [],
              assignments: {},
              serverData: bill,
            }));
            set({ completedBills: mapped });
          }
        } catch (err) {
          console.error('Failed to fetch bills from server:', err);
        }
      },

      completeBill: async (customStatus = null) => {
        const state = get();
        const totals = state.calculateTotals();
        const grandTotal = totals.reduce((sum, p) => sum + p.total, 0);
        const isAuth = useAuthStore.getState().isAuthenticated;

        // Prepare bill data for API
        const billData = {
          title: state.bill.title || 'Untitled Bill',
          items: state.bill.items.map(item => ({ name: item.name, price: item.price })),
          persons: state.bill.persons.map(p => ({ name: p.name })),
          split_type: 'custom', // Using custom for now (Step 4 assignments)
          assignments: Object.entries(state.assignments).flatMap(([personId, items]) =>
            Object.entries(items)
              .filter(([, assigned]) => assigned)
              .map(([itemId]) => ({ person_id: personId, item_id: itemId }))
          ),
          service_charge: state.bill.serviceCharge || 0,
          tax: state.bill.tax || 0,
        };

        let serverBill = null;

        // Try to save to backend if authenticated
        if (isAuth) {
          try {
            serverBill = await api.createBill(billData);
          } catch (err) {
            console.error('Failed to save bill to server:', err);
            // Continue with local save
          }
        }

        // Always save locally
        set((state) => {
          const mappedPersons = state.bill.persons.map(p => {
            const pTotal = totals.find(t => t.id === p.id)?.total || 0;
            return {
              ...p,
              paid: (p.id === state.bill.payerId || pTotal === 0) ? true : false,
              paymentInfo: p.paymentInfo ? { ...p.paymentInfo } : undefined
            };
          });

          const isAllPaid = mappedPersons.every(p => p.paid);
          const finalStatus = customStatus || (isAllPaid ? 'completed' : 'pending');

          return {
            completedBills: [
              {
                id: serverBill?.id || state.bill.id || uuidv4(),
                title: state.bill.title || 'Untitled Bill',
                completedAt: new Date().toISOString(),
                imageUrl: state.bill.imageUrl || '',
                items: state.bill.items.map(item => ({ ...item })),
                persons: mappedPersons,
                assignments: JSON.parse(JSON.stringify(state.assignments)),
                payerId: state.bill.payerId,
                serviceCharge: state.bill.serviceCharge,
                serviceMode: state.bill.serviceMode,
                tax: state.bill.tax,
                taxMode: state.bill.taxMode,
                totals: totals,
                grandTotal: grandTotal,
                status: finalStatus,
                // Store server data if available
                serverData: serverBill || null,
              },
              ...state.completedBills.filter(b => b.id !== (serverBill?.id || state.bill.id)),
            ],
          };
        });

        return serverBill;
      },

      loadBillDraft: (id) => {
        const state = get();
        const billToLoad = state.completedBills.find(b => b.id === id);
        if (!billToLoad) return;

        set({
          bill: {
            id: billToLoad.id,
            title: billToLoad.title,
            imageUrl: billToLoad.imageUrl || '',
            items: billToLoad.items.map(item => ({ ...item })),
            persons: billToLoad.persons.map(p => ({ 
              id: p.id, 
              name: p.name, 
              paymentInfo: p.paymentInfo ? { ...p.paymentInfo } : { bank: '', accountNumber: '', qrisData: '' } 
            })),
            tax: billToLoad.tax,
            taxMode: billToLoad.taxMode,
            serviceCharge: billToLoad.serviceCharge,
            serviceMode: billToLoad.serviceMode,
            payerId: billToLoad.payerId,
            splitType: 'equal',
          },
          assignments: JSON.parse(JSON.stringify(billToLoad.assignments || {})),
        });
      },

      getCompletedBill: (id) => {
        return get().completedBills.find(b => b.id === id) || null;
      },

      deleteCompletedBill: async (id) => {
        const state = get();
        const bill = state.completedBills.find(b => b.id === id);
        
        // Try to delete from server if authenticated and has server ID
        const isAuth = useAuthStore.getState().isAuthenticated;
        if (isAuth && bill?.serverData?.id) {
          try {
            await api.deleteBill(bill.serverData.id);
          } catch (err) {
            console.error('Failed to delete bill from server:', err);
          }
        }
        
        // Always delete locally
        set((state) => ({
          completedBills: state.completedBills.filter(b => b.id !== id),
        }));
      },

      togglePersonPaid: (billId, personId) => set((state) => ({
        completedBills: state.completedBills.map(b => {
          if (b.id === billId) {
            const updatedPersons = b.persons.map(p => {
              if (p.id === personId) {
                return { ...p, paid: !p.paid };
              }
              return p;
            });
            const allPaid = updatedPersons.every(p => p.paid);
            return {
              ...b,
              persons: updatedPersons,
              status: allPaid ? 'completed' : 'pending'
            };
          }
          return b;
        })
      })),

      assignments: {}, // { personId: { itemId: boolean } }

      toggleAssignment: (personId, itemId) => set((state) => {
        const personAssignments = state.assignments[personId] || {};
        return {
          assignments: {
            ...state.assignments,
            [personId]: {
              ...personAssignments,
              [itemId]: !personAssignments[itemId]
            }
          }
        };
      }),

      // Selection Strategy: Calculate Shares
      calculateTotals: () => {
        const { bill, assignments, settings } = get();
        const totalBillSubtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
        
        // Convert percentages to absolute values based on mode
        const totalTax = bill.taxMode === 'percent' 
          ? totalBillSubtotal * (bill.tax / 100) 
          : bill.tax;
          
        const totalService = bill.serviceMode === 'percent' 
          ? totalBillSubtotal * (bill.serviceCharge / 100) 
          : bill.serviceCharge;

        const grandTotal = totalBillSubtotal + totalTax + totalService;

        // Calculate percentage-based split
        if (bill.splitType === 'percentage') {
          return bill.persons.map((person) => {
            const percentage = person.percentage || 0;
            const personShare = grandTotal * (percentage / 100);
            
            // Distribute proportionally based on their share of the subtotal
            const shareRatio = percentage / 100;
            const personTax = totalTax * shareRatio;
            const personService = totalService * shareRatio;
            const personSubtotal = personShare - personTax - personService;

            return {
              ...person,
              subtotal: settings.roundNumbers ? Math.round(personSubtotal) : Number(personSubtotal.toFixed(2)),
              tax: settings.roundNumbers ? Math.round(personTax) : Number(personTax.toFixed(2)),
              service: settings.roundNumbers ? Math.round(personService) : Number(personService.toFixed(2)),
              total: settings.roundNumbers ? Math.round(personShare) : Number(personShare.toFixed(2)),
            };
          });
        }

        // Equal or custom split
        if (bill.splitType === 'custom') {
          return bill.persons.map((person) => {
            const customSubtotal = person.customAmount || 0;
            const shareRatio = totalBillSubtotal > 0 ? customSubtotal / totalBillSubtotal : 0;
            const personTax = totalTax * shareRatio;
            const personService = totalService * shareRatio;

            return {
              ...person,
              subtotal: settings.roundNumbers ? Math.round(customSubtotal) : Number(customSubtotal.toFixed(2)),
              tax: settings.roundNumbers ? Math.round(personTax) : Number(personTax.toFixed(2)),
              service: settings.roundNumbers ? Math.round(personService) : Number(personService.toFixed(2)),
              total: settings.roundNumbers ? Math.round(customSubtotal + personTax + personService) : Number((customSubtotal + personTax + personService).toFixed(2)),
            };
          });
        }

        return bill.persons.map((person) => {
          let subtotal = 0;
          bill.items.forEach((item) => {
            const assignedPersons = bill.persons.filter((p) => assignments[p.id]?.[item.id]);
            const sharers = assignedPersons.length > 0 ? assignedPersons : bill.persons;
            const isAssigned = assignedPersons.length > 0 ? (assignments[person.id]?.[item.id] || false) : true;
            if (isAssigned && sharers.length > 0) {
              subtotal += item.price / sharers.length;
            }
          });

          const shareRatio = totalBillSubtotal > 0 ? subtotal / totalBillSubtotal : 0;
          const personTax = totalTax * shareRatio;
          const personService = totalService * shareRatio;

          return {
            ...person,
            subtotal: settings.roundNumbers ? Math.round(subtotal) : Number(subtotal.toFixed(2)),
            tax: settings.roundNumbers ? Math.round(personTax) : Number(personTax.toFixed(2)),
            service: settings.roundNumbers ? Math.round(personService) : Number(personService.toFixed(2)),
            total: settings.roundNumbers ? Math.round(subtotal + personTax + personService) : Number((subtotal + personTax + personService).toFixed(2))
          };
        });
      },

      settings: {
        darkMode: true,
        animations: true,
        currency: 'IDR',
        autoScan: true,
        roundNumbers: true,
      },

      ui: {
        activeTab: 'dashboard',
        step: 1,
      },

      updateSettings: (data) => set((state) => ({
        settings: { ...state.settings, ...data }
      })),

      updateUI: (data) => set((state) => ({
        ui: { ...state.ui, ...data }
      })),
    }),
    {
      name: 'splitmate-storage',
      partialize: (state) => ({ 
        settings: state.settings, 
        completedBills: state.completedBills,
        bill: state.bill,
        assignments: state.assignments,
      }),
    }
  )
);

export default useBillStore;
