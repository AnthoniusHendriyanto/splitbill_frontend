# User Flow & Tier System

## Overview

Complete user journey from registration through bill settlement, mapped to frontend screens and backend API calls.

```
Registration/Login
       │
       ▼
   Dashboard ───► View Bill History (requires auth)
       │
       ▼
  Create Bill
       │
       ├──► Take Photo (OCR)
       ├──► Upload Image (OCR)
       └──► Manual Entry
       │
       ▼
  Review & Edit Items
       │
       ▼
  Add People
       │
       ▼
  Choose Split Method
       │
       ├──► Equal Split (Free)
       ├──► Custom Split (Premium - shows PremiumModal for free users)
       └──► Percentage Split (Premium - UI in progress)
       │
       ▼
  Assign Items (if custom)
       │
       ▼
  Summary & Settlement
       │
       ▼
  Save Bill ──► Dashboard
       │
       ▼
  Share / Export / Pay
```

---

## Free Tier

### Limits
- **OCR Scans**: 5 per month (resets 1st of each month)
- **Split Methods**: Equal split only
- **Bill History**: 30 days retention
- **Custom Split**: ❌ Locked - shows PremiumModal
- **Percentage Split**: ❌ Locked - shows PremiumModal
- **Share via Link**: ❌ Locked
- **Export PDF**: ❌ Locked

### UI Behavior
- Show usage banner after 3/5 OCR scans: "You've used 3 of 5 free scans this month"
- On 5th scan: show "OCR limit reached. Upgrade to Premium."
- On trying custom split: show modal "This is a Premium feature. Upgrade to unlock."
- On trying percentage split: same modal
- Settings page shows tier badge: "FREE" with "Upgrade" button
- SideNavBar shows tier badge (clickable to show PremiumModal)

---

## Premium Tier ($2.99/month)

### Features
- Unlimited OCR scans
- Custom split (per-item assignment)
- Percentage split
- Unlimited bill history (no 30-day limit)
- Share bill via link
- Export to PDF
- Priority support

### UI Behavior
- SideNavBar shows "✨ Premium" badge
- Settings page shows badge: "PREMIUM ✨"
- All features unlocked
- No usage limit banners
- No upgrade prompts

---

## Step-by-Step User Flow

### 0. Authentication

#### Screen: Login / Register
**Frontend**: `LoginPage.jsx`, `RegisterPage.jsx`
**Backend**: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`

**Flow**:
1. User enters email + password → taps Login
2. `useAuthStore.login()` → POST /api/v1/auth/login
3. On success: store `user`, `accessToken`, `refreshToken`
4. Update UI state to Dashboard (activeTab: 'dashboard')
5. Redirect to Dashboard
6. If 401: show error "Invalid email or password"
7. If registering: POST /api/v1/auth/register → auto-login → Dashboard

#### Guest Mode
- Users can tap "Continue as Guest" on login page
- No account required
- All local features work
- Cannot access Dashboard (requires API)
- Can create bills and see settlement
- Can upgrade to Premium (shows modal)