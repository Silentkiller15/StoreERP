# StoreERP Stabilization Review

## Static verification

- Server JavaScript: all 13 `.js` files passed `node --check`.
- Client ESLint: 65 errors and 10 warnings remain in the uploaded project. These are mainly React hook/function-order/purity issues; they should be cleaned in a separate frontend cleanup pass.
- Full server runtime test could not be executed in this Linux environment because the ZIP contains Windows-native `sqlite3` binaries. This is an environment limitation, not a confirmed Windows runtime failure.

## Database snapshot reviewed

Current database contains:

- 4 users
- 13 accounts
- 42 account transactions
- 12 sales
- 11 purchases
- 3 vouchers
- 4 voucher allocations
- 2 products
- 2 opening-stock records

## Accounting checks

### Journal balancing

All existing voucher groups in `account_transactions` balance:
- No voucher currently has unequal total debit and credit.

### Allocation data requiring attention

Three existing `voucher_allocations` rows have `ownerId = NULL`. The stabilization migration will assign unowned legacy records to the first user, consistent with the existing ERP owner migration strategy.

One existing allocation has an unusual date value (`4`).

One sales invoice is historically over-allocated:
- Sale ID 10 has allocations totalling ₹150 against a ₹100 invoice.

These historical records were NOT silently changed by this stabilization pass. The live database should remain protected by the backup created before any migration runs.

### Stock check

Current product stock agrees with stock-movement totals in the reviewed database.

## Stabilization changes made

1. Added `npm start` to the server package.
2. Added automatic startup database backups; newest 30 backups are retained.
3. Added `voucher_allocations` creation/migration support to database initialization.
4. Added owner migration coverage for `voucher_allocations`.
5. Added accounting/owner indexes for faster daily reports.
6. Made company records owner-specific and authenticated.
7. Public registration is forced to the `User` role; users cannot self-register as Administrator.
8. Password changes now use the authenticated user's identity rather than trusting a supplied user ID.
9. Strengthened Payment/Receipt allocation validation:
   - Receipt → Sales only
   - Payment → Purchases only
   - exactly one invoice per allocation
   - voucher remaining amount checked
   - invoice outstanding amount checked
   - allocation date required
10. Removed duplicate Day Book and Trial Balance routes.
11. Trial Balance now returns the response structure expected by the frontend and includes opening balances in account balance calculation.
12. Added a Windows launcher: `Start StoreERP.bat`.

## Not silently changed

Historical accounting transactions, sales, purchases, allocations, stock, and balances were not rewritten.

That is intentional. A production accounting system should never silently rewrite historical financial records during a code stabilization pass.
