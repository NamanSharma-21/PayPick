# PayPick Calculator & Cost Comparison Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive transfer fee calculator and comparative dashboard where users can input an amount and see side-by-side cost and speed breakdowns for each app.

**Architecture:** 
Introduce a reactive state for the transfer amount in the parent `App` component. Modify the scoring algorithm to factor in actual calculated fees based on input size, and render a comparison table showing estimated fees, delivery speed, and currency exchange rates side-by-side.

**Tech Stack:** React 18, Dexie, Lucide React, Tailwind CSS.

---

### Task 1: Extend Database Schema for Fee Structures
**Files:**
- Modify: `src/types/index.ts:1-12`
- Modify: `src/seed_data/default_data.ts:3-85`

**Step 1: Write a failing test** (Since database structural schema is verified via types, we ensure our mock types and data compile with the new properties).
Add the following fields to `PaymentApp` interface:
```typescript
export interface PaymentApp {
    // ... existing fields
    fixed_fee: number;      // e.g. $0.30
    percent_fee: number;    // e.g. 1.5 (meaning 1.5%)
    avg_speed_mins: number; // e.g. 5 mins, 1440 mins (24h)
}
```

**Step 2: Update default seed data**
Add realistic values for `fixed_fee`, `percent_fee`, and `avg_speed_mins` to the `defaultApps` list in `default_data.ts` (e.g., Zelle: $0 fee, 0 mins; Wise: 0.4% fee, 30 mins).

**Step 3: Run the build to verify TypeScript compiles**
Run: `npm run build`
Expected: PASS

---

### Task 2: Create a Cost Calculator Component
**Files:**
- Create: `src/components/TransferCalculator.tsx`
- Modify: `src/App.tsx`

**Step 1: Write the calculator component**
Create a new file `src/components/TransferCalculator.tsx` that exports a component with:
- An input for the transfer amount (e.g., default $100).
- Automatic calculation of estimated fees for each app using:
  `Fee = fixed_fee + (amount * (percent_fee / 100))`
- Displaying a comparative breakdown list sorted by the cheapest.

**Step 2: Integrate into App.tsx**
Render the `TransferCalculator` in the sidebar or above the recommendations grid.

**Step 3: Verify build**
Run: `npm run build`
Expected: PASS

---

### Task 3: Display Cost Analysis in App Cards
**Files:**
- Modify: `src/components/AppCard.tsx`

**Step 1: Update AppCard to show calculated cost**
Add a cost preview inside the `AppCard` displaying the exact dollar fee and estimated arrival time for the entered transfer amount.

**Step 2: Verify build**
Run: `npm run build`
Expected: PASS
