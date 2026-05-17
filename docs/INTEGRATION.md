# Integration Plan: Frontend ↔ Backend

## Architecture Overview

```
Frontend (React + Vite, :5173)  ──HTTP──►  Backend (Go, :8080)
                                               │
                                               ▼
                                       PostgreSQL
```

## API Base URL

- Development: `http://localhost:8080/api/v1`
- Config: `src/config/api.js`

## Auth Flow

### Current State
- `useAuthStore` has `login`, `register`, `logout` actions
- Stores `user`, `accessToken`, `refreshToken` in localStorage
- Guest mode available (no account required)
- Login/Register pages redirect to Dashboard after success

### What Works Now
- Every API call includes `Authorization: Bearer <accessToken>` header via centralized api.js
- Auto-refresh interceptor in api.js handles 401s
- Guest mode works without authentication

### Endpoint: POST /api/v1/auth/register
- **Request**: `{ email, password, name }`
- **Response**: `{ user: { id, email, name, tier }, access_token, refresh_token }`
- **Frontend**: ✅ Implemented in useAuthStore

### Endpoint: POST /api/v1/auth/login
- **Request**: `{ email, password }`
- **Response**: `{ user: { id, email, name, tier }, access_token, refresh_token }`
- **Frontend**: ✅ Implemented in useAuthStore

### Endpoint: POST /api/v1/auth/refresh
- **Request**: `{ refresh_token }`
- **Response**: `{ access_token, refresh_token }`
- **Frontend**: ✅ Implemented in centralized api.js

## Bills API

### Endpoint: POST /api/v1/bills
- **Auth**: Required
- **Request**: `{ title, items: [{name, price}], persons: [{name}], split_type, assignments: [{item_id, person_id}], service_charge, tax }`
- **Response**: Created bill with payments calculated
- **Frontend**: ✅ Implemented - POSTs to backend when authenticated

### Endpoint: GET /api/v1/bills
- **Auth**: Required
- **Query**: `?page=1&limit=20&from_date=&to_date=`
- **Response**: `{ data: [{id, title, grand_total, person_count, created_at}], pagination: {page, limit, total_items, total_pages} }`
- **Frontend**: ✅ Implemented - Dashboard fetches from backend

### Endpoint: GET /api/v1/bills/{id}
- **Auth**: Required
- **Response**: Full bill with items, persons, payments, assignments, settlement_summary
- **Frontend**: ✅ Implemented - BillDetailPage fetches from backend

### Endpoint: DELETE /api/v1/bills/{id}
- **Auth**: Required
- **Response**: 204 No Content
- **Frontend**: ✅ Implemented with API + local fallback

## OCR API

### Endpoint: POST /api/v1/ocr
- **Auth**: Required
- **FormData**: `image` field (multipart file) - also accepts `receipt` for compatibility
- **Response**: `{ items: [{name, price}], service_charge, tax, total, confidence }`
- **Frontend**: ✅ Uses centralized api.js with auth header

## Fixed Backend Bugs

1. ✅ **GetByID uses correct param source**
   - File: `bill_handler.go`
   - Now uses `mux.Vars(r)["id"]`

2. ✅ **Delete uses correct param source**
   - File: `bill_handler.go`
   - Now uses `mux.Vars(r)["id"]`

3. ✅ **OCR form field name**
   - Backend accepts both `image` and `receipt` for compatibility

4. ⚠️ **CORS handling is manual in each handler**
   - Currently CORS headers set per-route inline. Could use global CORS middleware.

## Missing Backend Endpoints (needed for full functionality)

| Endpoint | Priority | Notes |
|----------|----------|-------|
| PUT /api/v1/bills/{id} | Medium | Update bill |
| GET /api/v1/users/me | High | User profile + OCR usage (needed for Settings) |
| PUT /api/v1/users/me | Medium | Update profile |
| POST /api/v1/auth/logout | Medium | Invalidate refresh token |
| GET /api/v1/payments/{bill_id} | Low | Payment settlement view |
| POST /api/v1/payments/{bill_id}/settle | Low | Mark payment as paid |
| POST /api/v1/premium/subscribe | Medium | Stripe checkout - frontend UI ready |
| POST /api/v1/premium/webhook | Medium | Stripe webhook |
| GET /api/v1/shares/{token} | Low | Share bill view |

## Frontend API Client Implementation

Centralized API helper created at `src/lib/api.js`:

```javascript
const api = {
  async request(path, options = {}) {
    const token = useAuthStore.getState().accessToken;
    const res = await fetch(`${API.base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (res.status === 401) {
      // Attempt token refresh
      const refreshed = await refreshToken();
      if (refreshed) return this.request(path, options); // retry
      // Force logout
      useAuthStore.getState().logout();
      throw new Error('Session expired');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
  },

  get(path, params) { /* ... */ },
  post(path, body) { /* ... */ },
  upload(path, formData) { /* no Content-Type header */ },
};
```

## Feature Gating Implementation

Free users see PremiumModal when trying to use:
- Custom split (checking assignment checkboxes in Step 4)
- Percentage-based splitting

PremiumModal shows $2.99/month upgrade with feature list.

## Guest Mode

Users can use the app without authentication:
- All local features work
- Bills saved to local Zustand store (not backend)
- Cannot access Dashboard (fetches from API)
- Can create bills and see settlement
- Tier badge shows "guest" instead of "free"/"premium"