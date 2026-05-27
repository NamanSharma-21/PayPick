# Developer Setup & Deployment Guide

This guide describes how to run, test, extend, and deploy the PayPick recommender application.

---

## 1. Quick Start Guide

### Prerequisites
Make sure you have Node.js (v18 or higher) and npm installed.

### Installation
Run the following commands to install dependencies:
```bash
cd Payment-Suggestion-App
npm install
```

### Run Locally
Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 2. Test Suite Configuration

We use **Vitest** for our unit testing suite. Tests are located in `src/utils/scoring.test.ts` and verify our recommender formulas.

### Run Tests Once
```bash
npx vitest run
```

### Run Tests in Watch Mode
```bash
npm run test
```

---

## 3. Database Seeding & Mock Data

The IndexedDB is structured and accessed locally.

### Automatic Seeding
When the app launches, the `App.tsx` component runs:
```typescript
await seedDatabaseIfEmpty();
```
If the database table is empty, it automatically populates itself using preconfigured models in [default_data.ts](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/src/seed_data/default_data.ts).

### Manual Seeding / CSV Upload
The **Admin Console** (accessible via the floating gear button at the bottom-right of the dashboard) allows importing custom apps and reviews via CSV upload.

#### Example App CSV Format:
```csv
id,name,country,features,base_rating,base_count,logo_url,fixed_fee,percent_fee,avg_speed_mins,supported_destinations,exchange_rate_markup,has_nfc,has_qr_code,has_debit_card,has_crypto
app_9,MyWallet,US,"instant,no-fee",4.5,200,,0.00,0.00,2,US,0.00,true,true,false,false
```

---

## 4. Live Simulations

The Admin Panel includes a **Live Review Simulator** button:
- Activating the simulation starts an interval that posts a new randomized rating (1 to 5 stars) to a random app every 2 seconds.
- You can watch live score adjustments and rank swaps happen in real-time as reviews feed in.

---

## 5. Vercel Deployment

PayPick includes a [vercel.json](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/vercel.json) file that handles SPA routes.

### Test Build
Before deploying, check that the TypeScript compiler compiles successfully:
```bash
npm run build
```

### Deployment Configuration
When importing the project in Vercel:
1. **Framework Preset**: `Vite`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**: None required.
