# StoreERP — Stabilized Build

This copy is intended for daily-use testing after the stabilization pass.

## Start

### Backend
Open Command Prompt in `server` and run:

```bat
npm start
```

### Frontend
Open another Command Prompt in `client` and run:

```bat
npm run dev
```

Or double-click:

`Start StoreERP.bat`

## Database safety

The server now creates a timestamped backup of `server\store.db` at startup and keeps the newest 30 backups in:

`server\backups\`

Do not delete your original working copy until the stabilized build has been tested.

## Important

This build intentionally does not rewrite historical accounting data.

The stabilization work focuses on:
- safer voucher allocation validation
- owner-isolated company records
- safer public registration roles
- authenticated password changes
- voucher allocation table migration
- duplicate accounting route cleanup
- Trial Balance response consistency
- automatic database backups
- startup launcher

Before moving this build into live daily use, test:
1. Login/logout
2. Company details
3. Product/opening stock
4. Purchase
5. Sale
6. Receipt
7. Payment
8. Allocation
9. Day Book
10. Trial Balance
11. P&L
12. Balance Sheet
13. Cash/Bank Book
14. Customer/Supplier Outstanding
15. Backup creation

