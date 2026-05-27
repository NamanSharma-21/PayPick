# PayPick Premium Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the PayPick app into a professional utility website by adding a Transfer Cost Calculator, Source ➔ Destination corridors, a Capability Matrix filter (e.g., UPI, NFC, Cards), and automated Pros/Cons highlights based on reviews.

**Architecture:**
- **Types**: Add fee details (`fixed_fee`, `percent_fee`, `delivery_time_mins`), capability tags, and exchange rate metrics to `PaymentApp`.
- **Database / Seeding**: Update the schema and seed list with realistic data.
- **Calculator Logic**: Update the scoring algorithm (`scoring.ts`) to dynamically calculate costs and speed scores based on the active user input (amount, corridor, and filters).
- **UI Components**: Create a dashboard with filter cards for corridors & capabilities, a transfer input field, and visual cards displaying actual cost breakdowns.

**Tech Stack:** React, Dexie, Lucide React, Tailwind CSS.

---

### Task 1: Update Types and Seed Data
Extend types with specific transfer variables and capability boolean flags, and update seed data with realistic figures.

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/seed_data/default_data.ts`

**Step 1: Write a failing test or verify type compiler error**
Add features to `PaymentApp` in `src/types/index.ts`:
```typescript
export interface PaymentApp {
    id: string;
    name: string;
    country: string;
    features: string;
    base_rating: number;
    base_count: number;
    logo_url: string;
    cached_score: number;
    // New Calculator & Corridor Props
    fixed_fee: number;         // Flat fee in local currency
    percent_fee: number;       // Percent fee of transfer
    avg_speed_mins: number;    // Average speed in minutes
    supported_destinations: string[]; // Countries it can send to
    exchange_rate_markup: number;    // Currency markup percentage
    // Capabilities
    has_nfc: boolean;
    has_qr_code: boolean;
    has_debit_card: boolean;
    has_crypto: boolean;
}
```

**Step 2: Update default seed data**
In `src/seed_data/default_data.ts`, update the `defaultApps` list to populate these fields with realistic data for Venmo, CashApp, Zelle, Wise, Revolut, Paytm, PhonePe, and PayPal.

**Step 3: Run build to verify compile errors are resolved**
Run: `npm run build`
Expected: PASS

---

### Task 2: Update Scoring Algorithm with Dynamic Calculations
Update the scoring formula to factor in calculated transfer costs, speed ranges, and capability matches.

**Files:**
- Modify: `src/utils/scoring.ts`
- Modify: `src/utils/scoring.test.ts`

**Step 1: Write tests for dynamic fee and speed scores**
Update `scoring.test.ts` to test calculations with an input amount (e.g. transfer of $1000).

**Step 2: Implement dynamic scoring**
Update `calculateScore` in `src/utils/scoring.ts` to accept `transferAmount` and `destinationCountry`.
- **Lowest Fee Score**: Normalize calculated fee (`fixed_fee + amount * (percent_fee / 100) + amount * (markup / 100)`) against a range.
- **Fastest Score**: Normalize `avg_speed_mins` where instant = 100, >1 day = 0.
- Re-run vitest: `npx vitest run`
Expected: PASS

---

### Task 3: Redesign Dashboard Controls (Corridors, Calculator, and Capabilities)
Build the new controls panel into the user interface.

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add corridor select, amount input, and capability checkboxes**
Modify `App.tsx` to handle state for:
- `transferAmount` (numeric input, default 100)
- `destinationCountry` (select menu, e.g., US, UK, IN, EU)
- `selectedCapabilities` (object mapping flags like `nfc` or `qr_code`)

**Step 2: Connect states to query filters**
Filter the live query by corridor compatibilities (e.g. only show apps where `app.country === country` or `app.supported_destinations.includes(destinationCountry)`).

---

### Task 4: Upgrade App Cards with Cost & Sentiment Breakdowns
Add detailed pros/cons and a comparative calculator summary to each app recommendation card.

**Files:**
- Modify: `src/components/AppCard.tsx`

**Step 1: Implement cost display and review highlights**
Update `AppCard.tsx` to display:
- Calculated fee: e.g. "Fee: $3.50"
- Estimated delivery: e.g. "Arrives in 15 mins"
- Automated tags: e.g. "Pros: Highly Rated, Instant Transfer" or "Cons: High fees for large amounts".

**Step 2: Run build to verify**
Run: `npm run build`
Expected: PASS
