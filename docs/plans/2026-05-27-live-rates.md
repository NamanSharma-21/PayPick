# PayPick Real-Time Rates Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically fetch live currency exchange rates from the internet on corridor changes and compute exact payout amounts in the UI.

**Architecture:**
- **Exchange Rate Fetcher**: Implement a React hook or `useEffect` inside `App.tsx` that triggers on changes to the Source/Destination corridor.
- **Dynamic Conversion Calculation**: Calculate the exact conversion payouts using real-time API rates combined with each app's exchange rate markup.
- **UI Enhancement**: Show the live conversion rate and the net received amount in local currency (e.g. ₹ INR, £ GBP, € EUR, $ USD).

**Tech Stack:** JavaScript Fetch API, Open Exchange Rate API (free no-auth endpoint).

---

### Task 1: Fetch Live Exchange Rates in App.tsx
**Files:**
- Modify: [App.tsx](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/src/App.tsx)

**Step 1: Implement currencyMap and Fetch logic**
Add state for `exchangeRate` and `rateLoading`. Fetch the rates from `https://open.er-api.com/v6/latest/{SourceCurrency}` when `country` or `destinationCountry` changes.

**Step 2: Update live query inputs**
Pass `exchangeRate` dynamically into the scoring function.

**Step 3: Verify build**
Run: `npm run build`
Expected: PASS

---

### Task 2: Update AppCard to Display Live Converted Payouts
**Files:**
- Modify: [AppCard.tsx](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/src/components/AppCard.tsx)

**Step 1: Compute converted payouts**
Accept `exchangeRate` as a prop in `AppCard.tsx`. Update the calculator box to show the final payout amount in the recipient's currency (e.g. "Recipient Receives: ₹95,150.00").

**Step 2: Verify build**
Run: `npm run build`
Expected: PASS
