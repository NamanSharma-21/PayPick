# PayPick Stability & Race Condition Fix Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve potential runtime errors and edge cases: Dexie schema crashes on reset, out-of-order currency rate updates (race conditions), and empty review displays.

---

### Task 1: Safe Table Truncation on Database Reset
**Files:**
- Modify: [db.ts](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/src/db/db.ts)

**Step 1: Replace db.delete() with table clears**
Instead of deleting the entire database with `db.delete()` which drops the schemas and crashes active live queries, use `db.apps.clear()` and `db.reviews.clear()`.

**Step 2: Verify build**
Run: `npm run build`
Expected: PASS

---

### Task 2: Fix Currency Fetch Race Condition
**Files:**
- Modify: [App.tsx](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/src/App.tsx)

**Step 1: Add cleanup active flags to exchange rate useEffect**
Add an `active` boolean flag to discard out-of-order fetch responses if the selected corridor changes before the request resolves.

**Step 2: Verify build**
Run: `npm run build`
Expected: PASS

---

### Task 3: Polish Empty Review Display Fallbacks
**Files:**
- Modify: [ReviewModal.tsx](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/src/components/ReviewModal.tsx)

**Step 1: Display default message for empty reviews**
Add a text fallback (`r.text.trim() || 'Rating only - no comment left.'`) to review items.

**Step 2: Verify build & tests**
Run: `npm run build && npx vitest run`
Expected: PASS
