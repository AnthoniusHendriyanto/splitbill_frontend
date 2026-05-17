# Feature Gap Analysis

## Legend
- ✅ Built (Frontend)
- ❌ Not Built (Frontend)
- 🟡 Partially Built
- ⚡ Backend Issues

## 1. Authentication & User

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Register | ✅ | ✅ | useAuthStore + LoginPage |
| Login | ✅ | ✅ | useAuthStore + RegisterPage |
| Logout | ✅ | ✅ | Frontend clears local state, navigates to /login |
| Token Refresh | 🟡 | ✅ | Centralized api.js has refresh logic |
| Guest Mode | ✅ | ❌ | Works offline without backend |
| User Profile | ❌ | ✅ | `/users/me` endpoint not in backend router yet |
| Update Profile | ❌ | ❌ | Not in either side |
| Show User Tier | ✅ | ✅ | SideNavBar shows tier badge (Free/Premium) |

## 2. Bill Creation Flow

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Step 1: Photo/Upload/Manual | ✅ | ✅ | Uses centralized API client with auth header |
| Step 2: Edit Items | ✅ | ✅ | Item list editor works |
| Step 3: Add People | ✅ | ✅ | Person management works |
| Step 4: Assign Items | ✅ | ✅ | Assignment checkboxes work |
| Step 5: Summary & Settlement | ✅ | ✅ | Shows totals + DebtMap |
| Save & Finish (completeBill) | ✅ | ✅ | POSTs to backend when authenticated |

### OCR Flow - All Fixed
- ✅ Auth header now sent via centralized api.js
- ✅ Accepts both `image` and `receipt` field names
- ✅ PremiumModal shown on 429 (OCR_LIMIT_EXCEEDED)

## 3. Dashboard & Bill History

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Dashboard Page | ✅ | ✅ | Shows completed bills from local + backend |
| Bill Detail Page | ✅ | ✅ | Fetches from backend when not found locally |
| Bill List | ✅ | ✅ | Paginated fetch from backend |
| Delete Bill | ✅ | ✅ | Works with API + local fallback |
| Date Filter | ❌ | ✅ | Backend supports `from_date`/`to_date` |
| Running Balance | 🟡 | ❌ | Calculated from local `completedBills` only |

## 4. Split Types

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Equal Split | ✅ | ✅ | Current default |
| Custom Split (per-item) | ✅ | ✅ (Premium) | Step 4 UI exists, PremiumModal for free users |
| Percentage Split | ✅ | ✅ (Premium) | Store logic exists, UI in progress |
| Shared Items Split | ❌ | ✅ | No UI for this split type |
| Premium Gating | ✅ | ✅ (back) | PremiumModal shown to free users |

## 5. Premium / Tier System

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Free Tier | ✅ | ✅ | `tier: "free"` on registration |
| Premium Tier | 🟡 | 🟡 | DB + model exist, UI ready, Stripe not in router |
| OCR Usage Display | 🟡 | ✅ | Settings shows usage, endpoint not wired |
| OCR Limit Handling | ✅ | ✅ | PremiumModal shown on 429 |
| Upgrade UI | ✅ | ❌ | PremiumModal with $2.99/month pricing |
| Stripe Checkout Flow | ❌ | ❌ | `/premium/subscribe` not in router |
| Stripe Webhook | ❌ | ❌ | `/premium/webhook` not in router |

## 6. Settlement & Payments

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Who Owes Whom | ✅ | ✅ | DebtMap component shows debt architecture |
| Mark as Paid | ❌ | ❌ | `/payments/{bill_id}/settle` not in backend router |
| Payment History | ❌ | ❌ | `/payments/{bill_id}` not in backend router |
| Minimum Transfers | ✅ | 🟡 | Backend bill_usecase calculates payments, settlement_summary returned |

## 7. Sharing & Export

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Share via Link | ❌ | ❌ | Share repository exists but no HTTP handler |
| Copy Settlement Text | ✅ | ❌ | "Copy Professional Template" button exists (client-side only) |
| Download PDF | ❌ | ❌ | Button exists but non-functional |
| Share with Friends | ❌ | ❌ | Button exists but non-functional |
| WhatsApp Integration | ❌ | ❌ | No WA share functionality |
| Transfer Notes (Bank/QRIS) | 🟡 | ❌ | Input fields for bank/account exist but not saved to backend |

## 8. Multi-Currency

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Currency Selection | ✅ | ❌ | Settings page has currency picker (9 currencies) |
| FormattedPrice Component | ✅ | ❌ | Currency-aware display |
| Backend Currency Support | ❌ | ❌ | DB schema doesn't have currency field in bills table |
| Auto-Conversion | ❌ | ❌ | Not implemented anywhere |

## Summary: What MUST Be Built Next

### Immediate (Blocking Integration)
1. ✅ Fixed backend: `GetByID` and `Delete` handlers use `mux.Vars` instead of query params
2. ✅ Fixed frontend: Send `image` field name (not `receipt`) in OCR upload
3. ✅ Added auth header to OCR request via centralized API client
4. ✅ Created centralized API client with auto-refresh
5. ✅ POST bill to backend after Save & Finish
6. ✅ Fetch bills list from backend for Dashboard
7. ✅ Fetch bill detail from backend for BillDetailPage
8. ✅ Add `/users/me` endpoint to backend router (still needed)

### Medium Priority
9. ✅ Premium upgrade UI + Stripe flow (UI done, backend needed)
10. ✅ Percentage split logic in store
11. ✅ Feature gating in Step 4 - PremiumModal for free users
12. ✅ Delete bill from dashboard
13. 🟡 Token refresh interceptor (basic implementation)

### Nice to Have
14. Share via link
15. PDF export
16. WhatsApp sharing with transfer notes
17. Payment settlement tracking