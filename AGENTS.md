# ShopLedger

## Stack
- Node.js, CommonJS, Express 4, and body-parser; browser UI is served from `public/`.
- Persistent app data is JSON in `data/db.json`; shop and business settings are in `config.js`.

## Module map
- `routes/customers.js` — customer and Khata settlement endpoints.
- `routes/orders.js` — order listing, lookup, placement, and cancellation.
- `routes/products.js` — product and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export.
- `lib/coupons.js` — coupon normalization, validation, and discount calculation.
- `lib/dates.js` — current date, date key normalization, and fiscal year.
- `lib/inventory.js` — product lookup, sellable stock, stock checks and updates, summaries.
- `lib/invoice.js` — printable invoice figures and HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges, reversals, and settlements.
- `lib/orders.js` — add, retrieve, cancel, and list orders.
- `lib/pricing.js` — subtotal, discounts, line tax, and checkout totals.
- `lib/reports.js` — dashboard summary and invoice reconciliation.
- `lib/store.js` — JSON store reads/writes and audit log updates.
- `lib/tax.js` — GST rate lookup and CGST/SGST split.

## Commands
- Start the app: `npm start` (`node server.js`; default port 3000, overridable with `PORT`).
- Run tests: `node --test` (Node's built-in test runner; no test files are currently present). `npm test` is a placeholder that exits with an error.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed.
Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
