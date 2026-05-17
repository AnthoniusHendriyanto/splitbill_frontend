# SplitMate Frontend 💎

SplitMate Frontend is a premium, high-end bill-splitting application designed with a "Fintech Luxury" aesthetic. Built on React 19 and Vite 8, it offers a seamless, animated experience for managing shared expenses with sophisticated "Scan-First" intelligence.

## Vision

SplitMate isn't just a utility; it's a financial companion. Our interface is designed to evoke confidence and clarity during the often-complex process of settling debts. With fluid animations, real-time derivation, and intuitive visualization, SplitMate turns a chore into a premium experience.

---

## Key Features

- **Poka-Yoke Wizard Flow**: A disciplined, 5-step sequential flow that guarantees data integrity (Scan → Review Ledger → Add People → Assign Shares → Settlement).
- **Payment Intelligence Layer**: Real-time financial state derivation using `useMemo` for subtotal, tax, service charges, and grand totals.
- **Glassmorphic UI**: A state-of-the-art design featuring smooth gradients, blur effects, and premium dark mode aesthetics.
- **Micro-Animations**: Powered by Framer Motion, every interaction—from dragging items to switching steps—is buttery smooth.
- **Zustand State Engine**: Centralized, high-performance state management for handling complex bill assignments.
- **Backend Integration**: Full API integration with JWT authentication, auto-refresh, and guest mode support.
- **Premium Tier System**: Gated features with upgrade modal ($2.99/month).
- **Multi-Currency Support**: 9 currencies (IDR, USD, EUR, etc.) with proper formatting.

---

## Tech Stack

- **Framework**: React 19 (Latest stable)
- **Build Tool**: Vite 8
- **State Management**: Zustand 5 (with persist middleware)
- **Animations**: Framer Motion 12
- **Styling**: Tailwind CSS 3.4+ with `tailwind-merge` and `clsx`
- **Icons**: Material Symbols Outlined
- **API Client**: Centralized `src/lib/api.js` with JWT + auto-refresh

---

## Prerequisites

- **Node.js**: Version 20 or higher.
- **Package Manager**: `npm` (v10+) or `pnpm` (recommended).

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AnthoniusHendriyanto/splitbill_frontend.git
cd splitbill_frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

---

## Architecture

### Directory Structure

```text
├── src/
│   ├── components/       # Primitive and composite UI components
│   ├── store/            # Zustand stores (useBillStore.js, useAuthStore.js)
│   ├── hooks/            # Custom hooks (e.g., useTheme)
│   ├── utils/            # Formatting and calculation helpers
│   ├── pages/            # Page components (Login, Register, BillDetail)
│   ├── lib/              # API client and utilities
│   ├── App.jsx           # Main Wizard Orchestrator
│   └── main.jsx          # Application entry
├── public/               # Static assets
└── tailwind.config.js    # Design system configuration
```

### Wizard Flow Logic

The application uses an index-based wizard orchestrator (`step` 1–5):

1. **Step 1 (Scan Receipt)**: OCR processing with camera/upload/manual entry.
2. **Step 2 (Review Ledger)**: Edit items, adjust service charge & tax.
3. **Step 3 (Add People)**: Add participants, select payer.
4. **Step 4 (Assign Shares)**: Equal/Custom/Percentage split (PremiumModal for free users).
5. **Step 5 (Settlement)**: Review totals, view DebtMap, save bill.

---

## Authentication

- **Login/Register**: Full JWT-based authentication
- **Guest Mode**: Use app without account (local-only)
- **Auto-Refresh**: Token refresh handled automatically
- **Tier System**: Free vs Premium badges in UI

---

## UI Components

| Component | Description |
|-----------|-------------|
| `StepHeader` | Handles navigation and sequential validation locks. |
| `PriceInput` | Precision-control for financial entries. |
| `DebtMap` | Visual architecture of who owes whom. |
| `AssignmentGrid` | Multi-column assignment interface for high-density data. |
| `PremiumModal` | Upgrade prompt for locked features ($2.99/month). |

---

## Deployment

### Vercel / Netlify

This project is optimized for modern edge deployment. Simply connect your GitHub repository to Vercel or Netlify; it will automatically detect Vite and deploy.

### Docker

```bash
docker build -t splitmate-frontend .
docker run -p 5173:5173 splitmate-frontend
```

---

## Contributing

We prioritize visual excellence. When contributing UI changes, ensure they align with the "Premium Fintech" design tokens.

1. Fork the Project.
2. Create your Feature Branch.
3. Commit your Changes using Conventional Commits.
4. Push to the Branch.
5. Open a Pull Request.

---

## License

Distributed under the MIT License.