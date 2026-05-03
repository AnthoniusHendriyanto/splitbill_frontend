import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useBillStore = create(
  persist(
    (set, get) => ({
      bill: {
        id: uuidv4(),
        title: 'Dinner at Le Petit Bistro',
        items: [
          { id: uuidv4(), name: 'Wagyu Ribeye Steak', price: 450000 },
          { id: uuidv4(), name: 'Salmon Fillet', price: 280000 },
          { id: uuidv4(), name: 'Truffle Fries', price: 135000 },
          { id: uuidv4(), name: 'Red Wine Bottle', price: 850000 },
        ],
        persons: [
          { id: 'p1', name: 'Alex Rivera' },
          { id: 'p2', name: 'Sarah Jenkins' },
          { id: 'p3', name: 'Marcus Chen' },
        ],
        tax: 10,
        taxMode: 'percent', // 'percent' or 'amount'
        serviceCharge: 5,
        serviceMode: 'percent', // 'percent' or 'amount'
        payerId: 'p1', // ID of the person who paid
      },
      
      updateBill: (data) => set((state) => ({ 
        bill: { ...state.bill, ...data } 
      })),

      addPerson: () => set((state) => ({
        bill: {
          ...state.bill,
          persons: [...state.bill.persons, { 
            id: uuidv4(), 
            name: '', 
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
          items: [],
          persons: [],
          tax: 11,
          taxMode: 'percent',
          serviceCharge: 5,
          serviceMode: 'percent',
          payerId: null,
        },
        assignments: {},
      }),

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

        return bill.persons.map((person) => {
          let subtotal = 0;
          bill.items.forEach((item) => {
            const assignedPersons = bill.persons.filter((p) => assignments[p.id]?.[item.id]);
            if (assignments[person.id]?.[item.id] && assignedPersons.length > 0) {
              subtotal += item.price / assignedPersons.length;
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
        activeTab: 'bills',
        step: 2,
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
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export default useBillStore;
