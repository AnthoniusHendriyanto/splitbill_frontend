# Project Context

## Project Structure
- **Frontend**: `/home/je22z/Desktop/Project Split Bill/splitbill_frontend` (React + Vite + Tailwind + Zustand)
- **Backend**: `/home/je22z/Desktop/Project Split Bill/splitbill_backend` (Go + gorilla/mux + PostgreSQL)

## Frontend Key Files
- `src/App.jsx` - Main app with all step components (Step1-Step5, Dashboard, Settings, StepHeader, PremiumModal)
- `src/store/useBillStore.js` - Zustand store for bill data (items, persons, assignments, calculations, completeBill)
- `src/store/useAuthStore.js` - Zustand store for auth (login, register, logout, JWT, guest mode)
- `src/config/api.js` - API base URL configuration
- `src/lib/api.js` - Centralized API client with JWT + auto-refresh
- `src/components/DebtMap.jsx` - Debt visualization component
- `src/components/FormattedPrice.jsx` - Currency-aware price display
- `src/utils/currency.js` - Currency conversion utilities (9 currencies)
- `src/pages/LoginPage.jsx` - Login page with guest mode option
- `src/pages/RegisterPage.jsx` - Register page
- `src/pages/BillDetailPage.jsx` - Completed bill detail view (fetches from backend)
- `src/main.jsx` - Router setup (/, /login, /register, /bill/:id)
- `docs/INTEGRATION.md` - Backend integration plan
- `docs/FEATURES.md` - Feature gap analysis
- `docs/USER_FLOW.md` - Complete user flow documentation

## Backend Key Files
- `cmd/api/main.go` - Entry point, dependency injection
- `internal/delivery/http/router.go` - Route definitions
- `internal/delivery/http/auth_handler.go` - Auth HTTP handlers
- `internal/delivery/http/bill_handler.go` - Bill HTTP handlers
- `internal/usecase/bill_usecase.go` - Business logic, split calculations
- `internal/usecase/auth_usecase.go` - Auth business logic
- `internal/repository/postgres/ocr_service.go` - Mock OCR service
- `internal/domain/bill.go` - Data models (Bill, Item, Person, Assignment, Payment)
- `migrations/001-009` - Database schema

## Current Status
- Frontend bill creation flow works locally (Steps 1-5 with local Zustand store)
- Auth UI built (login/register/logout) with useAuthStore
- Guest mode available (no account required)
- OCR upload uses centralized API client with auth header
- Dashboard shows bills from both local store AND backend API
- BillDetailPage fetches from backend when local bill not found
- completeBill now POSTs to backend when user is authenticated
- Delete bill functionality works (API + local fallback)
- Premium upgrade modal UI exists (shows $2.99/month)
- Settings page shows tier badge (Free/Premium)
- Percentage split logic exists in store (calculateTotals handles split_type: 'percentage')
- Feature gating: free users see PremiumModal when using custom split
- Login/Register redirect to Dashboard (not Bills tab)

## Fixed Backend Bugs
1. ✅ GetByID now uses `mux.Vars(r)["id"]` instead of query params
2. ✅ Delete now uses `mux.Vars(r)["id"]` instead of query params
3. ✅ OCR accepts both `image` and `receipt` field names

## Completed Frontend Integration
1. ✅ Created centralized API client (`src/lib/api.js`) with JWT + auto-refresh
2. ✅ OCR upload now sends auth header
3. ✅ completeBill POSTs to backend when authenticated
4. ✅ Dashboard fetches from backend when authenticated
5. ✅ BillDetailPage fetches from backend when not found locally
6. ✅ Delete bill functionality with API + local fallback
7. ✅ Added PremiumModal component with $2.99/month upgrade UI
8. ✅ Added tier badge in SideNavBar (shows Free/Premium, clickable for free users)
9. ✅ Added Subscription section in Settings with OCR usage display
10. ✅ Added feature gating in Step 4 - free users see PremiumModal when using custom split
11. ✅ Fixed login/register to redirect to Dashboard instead of Bills tab
12. ✅ Fixed hydration race condition - App redirects after hydration completes

## Remaining Features to Build
- Stripe checkout flow (frontend + backend)
- Share via link (backend endpoint + frontend)
- PDF export
- WhatsApp sharing with transfer notes
- OCR usage display + limit UX improvements

## Key Technical Decisions
- Used Zustand persist for auth state persistence in localStorage
- Hydration check uses useState with useEffect to prevent race conditions
- Guest mode allows using app without authentication
- AccessToken directly used for auth check (not getter) to avoid selector issues

## Commands
- Frontend dev: `npm run dev` (port 5173)
- Frontend build: `npm run build`
- Backend: `go run cmd/api/main.go` (port 8080)
- Backend requires PostgreSQL + .env file