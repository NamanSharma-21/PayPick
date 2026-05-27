# PayPick Documentation Index

Welcome to the official developer and user documentation for **PayPick**, the premium payment suggestion and cost recommender dashboard.

This folder contains detailed design specifications, system architectures, developer setup steps, and mathematical descriptions of the PayScore recommender logic.

## Documentation Matrix

| Document | Purpose | Audience |
| :--- | :--- | :--- |
| [ARCHITECTURE.md](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/docs/ARCHITECTURE.md) | Technical system architecture, state flows, reactive Dexie hooks, and Vercel configuration. | Architects / Core Developers |
| [SCORING.md](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/docs/SCORING.md) | In-depth breakdown of the 45-30-15-10 recommender algorithm weights and dynamic calculator logic. | Data Analysts / Developers |
| [DEVELOPER_GUIDE.md](file:///Users/sharmahouse/Documents/FDE/PayPick/Payment-Suggestion-App/docs/DEVELOPER_GUIDE.md) | Step-by-step dev installation, test suites execution, seed database structures, and deploy instructions. | Developers / Devops |

---

## Core Features of PayPick

1. **Transfer Calculator**: User enters an amount (e.g. `$1,000`) and the app reactively calculates actual fees and speeds.
2. **Corridor Routing**: Supports comparing source countries and destination countries (e.g. cross-border remittances like US ➔ India) with live exchange rates.
3. **Live Rates Integration**: Fetches real-time conversions automatically from a free, public API without user keys.
4. **Must-Have Capability Matrix**: Allows filtering options instantly based on device hardware support (NFC, QR Code / UPI, Debit Card, Cryptocurrency).
5. **Dynamic Pros & Cons**: Analyzes app ratings and calculator figures to print automated highlights for each card.
