const express = require("express");
const router = express.Router();

const db = require("../database");

// ==================================================
// AUTHENTICATION
// ==================================================

function authenticate(
  req,
  res,
  next
) {

  const auth =
    req.headers.authorization ||
    "";

  const token =
    auth.startsWith("Bearer ")
      ? auth.substring(7)
      : "";

  if (!token) {

    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });
  }

  db.get(
    `
    SELECT
      sessions.*,
      users.username,
      users.name,
      users.role

    FROM sessions

    INNER JOIN users
      ON users.id =
         sessions.userId

    WHERE sessions.token = ?

      AND sessions.expiresAt >
          datetime('now')

      AND users.isActive = 1

    LIMIT 1
    `,
    [
      token,
    ],
    (
      err,
      session
    ) => {

      if (err) {

        console.log(
          "Accounts Authentication Error:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Authentication error.",
        });
      }

      if (!session) {

        return res.status(401).json({
          success: false,
          message:
            "Session expired. Please login again.",
        });
      }

      req.user = {

        id:
          session.userId,

        username:
          session.username,

        name:
          session.name,

        role:
          session.role,
      };

      next();
    }
  );
}

// ==================================================
// DATABASE HELPERS
// ==================================================

function dbGet(
  sql,
  params = []
) {
  return new Promise(
    (resolve, reject) => {
      db.get(
        sql,
        params,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    }
  );
}

function dbAll(
  sql,
  params = []
) {
  return new Promise(
    (resolve, reject) => {
      db.all(
        sql,
        params,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    }
  );
}

function dbRun(
  sql,
  params = []
) {
  return new Promise(
    (resolve, reject) => {
      db.run(
        sql,
        params,
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this);
          }
        }
      );
    }
  );
}

// ==================================================
// CALCULATE ACCOUNT BALANCE
// ==================================================

function calculateBalance(
  account
) {
  const opening =
    Number(
      account.openingBalance
    ) || 0;

  const debit =
    Number(
      account.totalDebit
    ) || 0;

  const credit =
    Number(
      account.totalCredit
    ) || 0;

  const openingType =
    String(
      account.openingType ||
        "Debit"
    ).toLowerCase();

  let balance =
    openingType === "credit"
      ? -opening
      : opening;

  balance +=
    debit -
    credit;

  return balance;
}

// ==================================================
// ACCOUNT GROUPS
// ==================================================

router.get(
  "/groups",
  authenticate,
  async (req, res) => {
    try {

      const rows =
        await dbAll(
          `
          SELECT *
          FROM account_groups
          ORDER BY name ASC
          `
        );

      res.json(
        rows
      );

    } catch (err) {

      console.log(
        "Account Groups Error:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load account groups",
        error:
          err.message,
      });
    }
  }
);

// ==================================================
// BALANCE SHEET
// ==================================================

router.get(
  "/balance-sheet",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      // ==================================================
      // ACCOUNT BALANCES
      // ==================================================

      const rows =
        await dbAll(
          `
          SELECT
            accounts.id,
            accounts.code,
            accounts.name,
            accounts.groupId,
            accounts.openingBalance,
            accounts.openingType,

            account_groups.name
              AS groupName,

            account_groups.nature
              AS groupNature,

            COALESCE(
              SUM(
                account_transactions.debit
              ),
              0
            ) AS totalDebit,

            COALESCE(
              SUM(
                account_transactions.credit
              ),
              0
            ) AS totalCredit

          FROM accounts

          LEFT JOIN account_groups
            ON accounts.groupId =
               account_groups.id

          LEFT JOIN account_transactions
            ON accounts.id =
               account_transactions.accountId

           AND account_transactions.ownerId =
               ?

          WHERE accounts.ownerId = ?

          GROUP BY
            accounts.id,
            accounts.code,
            accounts.name,
            accounts.groupId,
            accounts.openingBalance,
            accounts.openingType,
            account_groups.name,
            account_groups.nature

          ORDER BY
            accounts.name ASC
          `,
          [
            ownerId,
            ownerId,
          ]
        );

      // ==================================================
      // ARRAYS
      // ==================================================

      const assets = [];

      const liabilities = [];

      const capital = [];

      let totalAssets = 0;

      let totalLiabilities = 0;

      let totalCapital = 0;

      let totalIncome = 0;

      let totalExpenses = 0;

      // ==================================================
      // PROCESS ACCOUNTS
      // ==================================================

      rows.forEach(
        (account) => {

          const balance =
            calculateBalance(
              account
            );

          const nature =
            String(
              account.groupNature ||
                ""
            ).toLowerCase();

          const item = {

            id:
              account.id,

            code:
              account.code || "",

            name:
              account.name,

            groupId:
              account.groupId,

            groupName:
              account.groupName ||
              "",

            openingBalance:
              Number(
                account.openingBalance
              ) || 0,

            openingType:
              account.openingType ||
              "Debit",

            totalDebit:
              Number(
                account.totalDebit
              ) || 0,

            totalCredit:
              Number(
                account.totalCredit
              ) || 0,

            balance:
              Math.abs(
                balance
              ),
          };

          // ------------------------------------------
          // INCOME
          // ------------------------------------------

          if (
            nature === "income"
          ) {

            totalIncome +=
              Math.max(
                0,
                -balance
              );

            return;
          }

          // ------------------------------------------
          // EXPENSE
          // ------------------------------------------

          if (
            nature === "expense"
          ) {

            totalExpenses +=
              Math.max(
                0,
                balance
              );

            return;
          }

          // ------------------------------------------
          // ASSET
          // ------------------------------------------

          if (
            nature === "asset"
          ) {

            if (
              balance >
              0.0001
            ) {

              assets.push(
                item
              );

              totalAssets +=
                balance;
            }

            return;
          }

          // ------------------------------------------
          // LIABILITY
          // ------------------------------------------

          if (
            nature === "liability"
          ) {

            if (
              balance <
              -0.0001
            ) {

              liabilities.push(
                {
                  ...item,
                  balance:
                    Math.abs(
                      balance
                    ),
                }
              );

              totalLiabilities +=
                Math.abs(
                  balance
                );
            }

            return;
          }

          // ------------------------------------------
          // CAPITAL
          // ------------------------------------------

          if (
            nature === "capital"
          ) {

            if (
              Math.abs(
                balance
              ) >
              0.0001
            ) {

              capital.push(
                item
              );

              totalCapital +=
                -balance;
            }
          }
        }
      );

      // ==================================================
// SALES / PURCHASES FROM LEDGER
// ==================================================

let ledgerSales = 0;

let ledgerPurchases = 0;

rows.forEach(
  (account) => {

    const accountName =
      String(
        account.name || ""
      )
        .trim()
        .toLowerCase();

    const balance =
      calculateBalance(
        account
      );

    if (
      accountName === "sales"
    ) {

      ledgerSales =
        Math.abs(
          balance
        );
    }

    if (
      accountName === "purchase"
    ) {

      ledgerPurchases =
        Math.max(
          balance,
          0
        );
    }
  }
);

const totalSales =
  ledgerSales;

const totalPurchases =
  ledgerPurchases;
      // ==================================================
      // OPENING STOCK
      // ==================================================

      const openingRow =
        await dbGet(
          `
          SELECT
            COALESCE(
              SUM(value),
              0
            ) AS openingStock

          FROM opening_stock

          WHERE ownerId = ?
          `,
          [
            ownerId,
          ]
        );

      // ==================================================
      // CLOSING STOCK
      // ==================================================

      const stockRows =
        await dbAll(
          `
          SELECT
            p.id,

            p.name,

            COALESCE(
              p.stock,
              0
            ) AS quantity,

            COALESCE(

              (
                SELECT
                  pi.rate

                FROM purchase_items pi

                INNER JOIN purchases pu
                  ON pi.purchaseId =
                     pu.id

                 AND pu.ownerId =
                     pi.ownerId

                WHERE
                  pi.productId =
                    p.id

                  AND pi.ownerId =
                    ?

                ORDER BY
                  pu.purchaseDate DESC,
                  pi.id DESC

                LIMIT 1
              ),

              (
                SELECT
                  os.rate

                FROM opening_stock os

                WHERE
                  os.productId =
                    p.id

                  AND os.ownerId =
                    ?

                ORDER BY
                  os.openingDate ASC,
                  os.id ASC

                LIMIT 1
              ),

              p.purchase,

              0

            ) AS costRate

          FROM products p

          WHERE p.ownerId = ?
          `,
          [
            ownerId,
            ownerId,
            ownerId,
          ]
        );

      let closingStock =
        0;

      stockRows.forEach(
        (item) => {

          const quantity =
            Number(
              item.quantity
            ) || 0;

          const costRate =
            Number(
              item.costRate
            ) || 0;

          closingStock +=
            quantity *
            costRate;
        }
      );
            // ==================================================
      // BASIC VALUES
      // ==================================================

      const openingStock =
        Number(
          openingRow?.openingStock
        ) || 0;

      // ==================================================
      // COGS
      //
      // Opening Stock
      // + Purchases
      // - Closing Stock
      // = COGS
      // ==================================================

      let cogs =
        openingStock +
        totalPurchases -
        closingStock;

      if (
        Math.abs(cogs) <
        0.005
      ) {

        cogs = 0;
      }

      // ==================================================
      // GROSS PROFIT
      // ==================================================

      const actualGrossProfit =
        totalSales -
        cogs;

      // ==================================================
// OTHER INCOME / OTHER EXPENSES
// ==================================================
//
// Use ledger account balances instead of voucher type.
//
// Sales is already included in totalSales.
// Purchase is already included in COGS.
// Therefore neither should be counted again.
//

let otherIncome = 0;

const actualExpenses = 0;
// ==================================================
// NET PROFIT / LOSS
// ==================================================

const actualCurrentProfit =
  actualGrossProfit +
  otherIncome -
  actualExpenses;

  console.log(
  "=== BALANCE SHEET DEBUG ==="
);

console.log({
  totalSales,
  totalPurchases,
  openingStock,
  closingStock,
  cogs,
  actualGrossProfit,
  otherIncome,
  actualExpenses,
  actualCurrentProfit,
});

console.log(
  "==========================="
);

      // ==================================================
      // ADD CLOSING STOCK
      // ASSET
      // ==================================================

      if (
        closingStock >
        0.0001
      ) {

        assets.push({

          id:
            "closing-stock",

          code:
            "",

          name:
            "Closing Stock / Inventory",

          groupName:
            "Current Assets",

          balance:
            closingStock,

          openingBalance:
            openingStock,

          openingType:
            "Debit",

          totalDebit:
            closingStock,

          totalCredit:
            0,
        });

        totalAssets +=
          closingStock;
      }

      // ==================================================
      // ADD CURRENT PROFIT / LOSS
      // TO CAPITAL
      // ==================================================

      if (
        Math.abs(
          actualCurrentProfit
        ) >
        0.0001
      ) {

        capital.push({

          id:
            "current-profit",

          code:
            "",

          name:
            actualCurrentProfit >= 0
              ? "Current Profit"
              : "Current Loss",

          groupName:
            "Current Year Result",

          balance:
            Math.abs(
              actualCurrentProfit
            ),

          openingBalance:
            0,

          openingType:
            actualCurrentProfit >= 0
              ? "Credit"
              : "Debit",

          totalDebit:
            actualCurrentProfit < 0
              ? Math.abs(
                  actualCurrentProfit
                )
              : 0,

          totalCredit:
            actualCurrentProfit > 0
              ? actualCurrentProfit
              : 0,
        });

        if (
          actualCurrentProfit >
          0
        ) {

          totalCapital +=
            actualCurrentProfit;

        } else {

          totalCapital -=
            Math.abs(
              actualCurrentProfit
            );
        }
      }

      // ==================================================
      // TOTALS
      // ==================================================

      const liabilitiesPlusCapital =
        totalLiabilities +
        totalCapital;

      const difference =
        totalAssets -
        liabilitiesPlusCapital;

      const isBalanced =
        Math.abs(
          difference
        ) < 0.01;

      // ==================================================
      // RESPONSE
      // ==================================================

      res.json({

        success:
          true,

        assets,

        liabilities,

        capital,

        totalAssets,

        totalLiabilities,

        totalCapital,

        totalIncome,

        totalExpenses,

        currentProfit:
          actualCurrentProfit,

        openingStock,

        closingStock,

        cogs,

        grossProfit:
          actualGrossProfit,

        otherIncome,

        expenses:
          actualExpenses,

        liabilitiesPlusCapital,

        difference,

        isBalanced,
      });

    } catch (err) {

      console.log(
        "Balance Sheet Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to load Balance Sheet",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// OUTSTANDING
// CURRENT USER ONLY
// ==================================================

router.get(
  "/outstanding",
  authenticate,
  (req, res) => {

    const ownerId =
      req.user.id;

    // ==================================================
    // RECEIVABLES
    // ==================================================

    db.all(
      `
      SELECT
        sales.id,

        sales.saleNo
          AS invoiceNo,

        sales.saleDate
          AS date,

        sales.grandTotal
          AS total,

        customers.name
          AS customerName,

        COALESCE(
          (
            SELECT
              SUM(
                voucher_allocations.amount
              )

            FROM voucher_allocations

            WHERE
              voucher_allocations.saleId =
                sales.id

              AND voucher_allocations.ownerId =
                ?
          ),
          0
        ) AS received

      FROM sales

      LEFT JOIN customers
        ON sales.customerId =
           customers.id

       AND customers.ownerId =
           sales.ownerId

      WHERE sales.ownerId = ?

      ORDER BY
        sales.saleDate ASC,
        sales.id ASC
      `,
      [
        ownerId,
        ownerId,
      ],
      (
        salesErr,
        salesRows
      ) => {

        if (salesErr) {

          console.log(
            "Receivables Error:",
            salesErr
          );

          return res.status(500).json({

            success:
              false,

            message:
              "Unable to load receivables",

            error:
              salesErr.message,
          });
        }

        // ==================================================
        // PAYABLES
        // ==================================================

        db.all(
          `
          SELECT
            purchases.id,

            purchases.purchaseNo,

            purchases.purchaseDate
              AS date,

            purchases.grandTotal
              AS total,

            suppliers.name
              AS supplierName,

            COALESCE(
              (
                SELECT
                  SUM(
                    voucher_allocations.amount
                  )

                FROM voucher_allocations

                WHERE
                  voucher_allocations.purchaseId =
                    purchases.id

                  AND voucher_allocations.ownerId =
                    ?
              ),
              0
            ) AS paid

          FROM purchases

          LEFT JOIN suppliers
            ON purchases.supplierId =
               suppliers.id

           AND suppliers.ownerId =
               purchases.ownerId

          WHERE purchases.ownerId = ?

          ORDER BY
            purchases.purchaseDate ASC,
            purchases.id ASC
          `,
          [
            ownerId,
            ownerId,
          ],
          (
            purchaseErr,
            purchaseRows
          ) => {

            if (purchaseErr) {

              console.log(
                "Payables Error:",
                purchaseErr
              );

              return res.status(500).json({

                success:
                  false,

                message:
                  "Unable to load payables",

                error:
                  purchaseErr.message,
              });
            }

            const receivables =
              (
                salesRows ||
                []
              )
                .map(
                  (sale) => {

                    const total =
                      Number(
                        sale.total
                      ) || 0;

                    const received =
                      Number(
                        sale.received
                      ) || 0;

                    return {

                      id:
                        sale.id,

                      customerName:
                        sale.customerName ||
                        "Cash Customer",

                      invoiceNo:
                        sale.invoiceNo,

                      date:
                        sale.date,

                      total,

                      received,

                      outstanding:
                        Math.max(
                          0,
                          total -
                            received
                        ),
                    };
                  }
                )
                .filter(
                  (item) =>
                    item.outstanding >
                    0.009
                );

            const payables =
              (
                purchaseRows ||
                []
              )
                .map(
                  (purchase) => {

                    const total =
                      Number(
                        purchase.total
                      ) || 0;

                    const paid =
                      Number(
                        purchase.paid
                      ) || 0;

                    return {

                      id:
                        purchase.id,

                      supplierName:
                        purchase.supplierName ||
                        "Unknown Supplier",

                      purchaseNo:
                        purchase.purchaseNo,

                      date:
                        purchase.date,

                      total,

                      paid,

                      outstanding:
                        Math.max(
                          0,
                          total -
                            paid
                        ),
                    };
                  }
                )
                .filter(
                  (item) =>
                    item.outstanding >
                    0.009
                );

            const totalReceivable =
              receivables.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  Number(
                    item.outstanding
                  ),
                0
              );

            const totalPayable =
              payables.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  Number(
                    item.outstanding
                  ),
                0
              );

            res.json({

              success:
                true,

              receivables,

              payables,

              totalReceivable,

              totalPayable,
            });
          }
        );
      }
    );
  }
);
// ==================================================
// PAYMENT / RECEIPT ALLOCATION DATA
// CURRENT USER ONLY
// ==================================================

router.get(
  "/allocation-data",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      // ==================================================
      // PAYMENT / RECEIPT VOUCHERS
      // ==================================================

      const vouchers =
        await dbAll(
          `
          SELECT
            id,
            voucherNo,
            voucherType,
            voucherDate,
            partyName,
            amount

          FROM vouchers

          WHERE ownerId = ?

            AND voucherType IN (
              'Receipt',
              'Payment'
            )

          ORDER BY
            voucherDate ASC,
            id ASC
          `,
          [
            ownerId,
          ]
        );

      // ==================================================
      // SALES
      // ==================================================

      const sales =
        await dbAll(
          `
          SELECT
            sales.id,

            sales.saleNo
              AS invoiceNo,

            sales.saleDate
              AS date,

            sales.grandTotal
              AS total,

            customers.name
              AS customerName

          FROM sales

          LEFT JOIN customers
            ON sales.customerId =
               customers.id

           AND customers.ownerId =
               sales.ownerId

          WHERE sales.ownerId = ?

          ORDER BY
            sales.saleDate ASC,
            sales.id ASC
          `,
          [
            ownerId,
          ]
        );

      // ==================================================
      // PURCHASES
      // ==================================================

      const purchases =
        await dbAll(
          `
          SELECT
            purchases.id,

            purchases.purchaseNo,

            purchases.purchaseDate
              AS date,

            purchases.grandTotal
              AS total,

            suppliers.name
              AS supplierName

          FROM purchases

          LEFT JOIN suppliers
            ON purchases.supplierId =
               suppliers.id

           AND suppliers.ownerId =
               purchases.ownerId

          WHERE purchases.ownerId = ?

          ORDER BY
            purchases.purchaseDate ASC,
            purchases.id ASC
          `,
          [
            ownerId,
          ]
        );

      // ==================================================
      // EXISTING ALLOCATIONS
      // ==================================================

      const allocations =
        await dbAll(
          `
          SELECT
            *

          FROM voucher_allocations

          WHERE ownerId = ?

          ORDER BY
            id ASC
          `,
          [
            ownerId,
          ]
        );

      // ==================================================
      // FORMAT VOUCHERS
      // ==================================================

      const voucherData =
        vouchers.map(
          (voucher) => {

            const allocated =
              allocations
                .filter(
                  (allocation) =>
                    Number(
                      allocation.voucherId
                    ) ===
                    Number(
                      voucher.id
                    )
                )
                .reduce(
                  (
                    sum,
                    allocation
                  ) =>
                    sum +
                    (
                      Number(
                        allocation.amount
                      ) || 0
                    ),
                  0
                );

            const amount =
              Number(
                voucher.amount
              ) || 0;

            return {

              ...voucher,

              amount,

              allocated,

              unallocated:
                Math.max(
                  0,
                  amount -
                    allocated
                ),
            };
          }
        );

      // ==================================================
      // FORMAT SALES
      // ==================================================

      const salesData =
        sales.map(
          (sale) => {

            const allocated =
              allocations
                .filter(
                  (allocation) =>
                    Number(
                      allocation.saleId
                    ) ===
                    Number(
                      sale.id
                    )
                )
                .reduce(
                  (
                    sum,
                    allocation
                  ) =>
                    sum +
                    (
                      Number(
                        allocation.amount
                      ) || 0
                    ),
                  0
                );

            const total =
              Number(
                sale.total
              ) || 0;

            return {

              ...sale,

              total,

              allocated,

              outstanding:
                Math.max(
                  0,
                  total -
                    allocated
                ),
            };
          }
        );

      // ==================================================
      // FORMAT PURCHASES
      // ==================================================

      const purchasesData =
        purchases.map(
          (purchase) => {

            const allocated =
              allocations
                .filter(
                  (allocation) =>
                    Number(
                      allocation.purchaseId
                    ) ===
                    Number(
                      purchase.id
                    )
                )
                .reduce(
                  (
                    sum,
                    allocation
                  ) =>
                    sum +
                    (
                      Number(
                        allocation.amount
                      ) || 0
                    ),
                  0
                );

            const total =
              Number(
                purchase.total
              ) || 0;

            return {

              ...purchase,

              total,

              allocated,

              outstanding:
                Math.max(
                  0,
                  total -
                    allocated
                ),
            };
          }
        );

      // ==================================================
      // RESPONSE
      // ==================================================

      res.json({

        success:
          true,

        vouchers:
          voucherData,

        sales:
          salesData,

        purchases:
          purchasesData,

        allocations:
          allocations || [],
      });

    } catch (err) {

      console.log(
        "Allocation Data Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to load allocation data",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// ACCOUNTS
// CURRENT USER ONLY
// ==================================================

router.get(
  "/",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const rows =
        await dbAll(
          `
          SELECT
            accounts.*,

            account_groups.name
              AS groupName,

            account_groups.nature
              AS groupNature

          FROM accounts

          LEFT JOIN account_groups
            ON accounts.groupId =
               account_groups.id

          WHERE accounts.ownerId = ?

          ORDER BY
            accounts.name ASC
          `,
          [
            ownerId,
          ]
        );

      res.json(
        rows
      );

    } catch (err) {

      console.log(
        "Accounts Load Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to load accounts",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// CREATE PAYMENT / RECEIPT ALLOCATION
// CURRENT USER ONLY
// ==================================================

router.post(
  "/allocate",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const {
        voucherId,
        saleId,
        purchaseId,
        amount,
        allocationDate,
        remarks,
      } = req.body;

      const numericVoucherId =
        Number(voucherId);

      const numericSaleId =
        saleId
          ? Number(saleId)
          : null;

      const numericPurchaseId =
        purchaseId
          ? Number(purchaseId)
          : null;

      const allocationAmount =
        Number(amount);

      if (!numericVoucherId) {

        return res.status(400).json({
          success: false,
          message:
            "Voucher is required.",
        });
      }

      if (
        !Number.isFinite(
          allocationAmount
        ) ||
        allocationAmount <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Allocation amount must be greater than zero.",
        });
      }

      if (!allocationDate) {

        return res.status(400).json({
          success: false,
          message:
            "Allocation date is required.",
        });
      }

      if (
        (
          numericSaleId &&
          numericPurchaseId
        ) ||
        (
          !numericSaleId &&
          !numericPurchaseId
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Select exactly one Sales invoice or Purchase invoice.",
        });
      }

      const voucher =
        await dbGet(
          `
          SELECT
            id,
            voucherType,
            amount

          FROM vouchers

          WHERE id = ?

            AND ownerId = ?

          LIMIT 1
          `,
          [
            numericVoucherId,
            ownerId,
          ]
        );

      if (!voucher) {

        return res.status(404).json({
          success: false,
          message:
            "Voucher not found.",
        });
      }

      // --------------------------------------------------
      // RECEIPT -> SALES
      // PAYMENT -> PURCHASES
      // --------------------------------------------------

      if (
        voucher.voucherType ===
          "Receipt" &&
        !numericSaleId
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Receipt vouchers can only be allocated against Sales invoices.",
        });
      }

      if (
        voucher.voucherType ===
          "Payment" &&
        !numericPurchaseId
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Payment vouchers can only be allocated against Purchase invoices.",
        });
      }

      if (
        voucher.voucherType !==
          "Receipt" &&
        voucher.voucherType !==
          "Payment"
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Only Receipt and Payment vouchers can be allocated.",
        });
      }

      // --------------------------------------------------
      // VOUCHER REMAINING AMOUNT
      // --------------------------------------------------

      const voucherAllocated =
        await dbGet(
          `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS allocated

          FROM voucher_allocations

          WHERE voucherId = ?

            AND ownerId = ?
          `,
          [
            numericVoucherId,
            ownerId,
          ]
        );

      const voucherAmount =
        Number(
          voucher.amount
        ) || 0;

      const voucherAlreadyAllocated =
        Number(
          voucherAllocated?.allocated
        ) || 0;

      const voucherOutstanding =
        Math.max(
          0,
          voucherAmount -
            voucherAlreadyAllocated
        );

      if (
        allocationAmount >
        voucherOutstanding +
          0.009
      ) {

        return res.status(400).json({
          success: false,
          message:
            `Allocation exceeds the voucher's remaining amount of ₹${voucherOutstanding.toFixed(2)}.`,
        });
      }

      // --------------------------------------------------
      // INVOICE REMAINING AMOUNT
      // --------------------------------------------------

      let invoiceTotal = 0;

      let invoiceAlreadyAllocated =
        0;

      let invoiceLabel = "";

      if (
        numericSaleId
      ) {

        const sale =
          await dbGet(
            `
            SELECT
              id,
              saleNo,
              grandTotal

            FROM sales

            WHERE id = ?

              AND ownerId = ?

            LIMIT 1
            `,
            [
              numericSaleId,
              ownerId,
            ]
          );

        if (!sale) {

          return res.status(404).json({
            success: false,
            message:
              "Sales invoice not found.",
          });
        }

        invoiceTotal =
          Number(
            sale.grandTotal
          ) || 0;

        invoiceLabel =
          sale.saleNo ||
          `Sale #${sale.id}`;

        const allocated =
          await dbGet(
            `
            SELECT
              COALESCE(
                SUM(amount),
                0
              ) AS allocated

            FROM voucher_allocations

            WHERE saleId = ?

              AND ownerId = ?
            `,
            [
              numericSaleId,
              ownerId,
            ]
          );

        invoiceAlreadyAllocated =
          Number(
            allocated?.allocated
          ) || 0;

      } else {

        const purchase =
          await dbGet(
            `
            SELECT
              id,
              purchaseNo,
              grandTotal

            FROM purchases

            WHERE id = ?

              AND ownerId = ?

            LIMIT 1
            `,
            [
              numericPurchaseId,
              ownerId,
            ]
          );

        if (!purchase) {

          return res.status(404).json({
            success: false,
            message:
              "Purchase invoice not found.",
          });
        }

        invoiceTotal =
          Number(
            purchase.grandTotal
          ) || 0;

        invoiceLabel =
          purchase.purchaseNo ||
          `Purchase #${purchase.id}`;

        const allocated =
          await dbGet(
            `
            SELECT
              COALESCE(
                SUM(amount),
                0
              ) AS allocated

            FROM voucher_allocations

            WHERE purchaseId = ?

              AND ownerId = ?
            `,
            [
              numericPurchaseId,
              ownerId,
            ]
          );

        invoiceAlreadyAllocated =
          Number(
            allocated?.allocated
          ) || 0;
      }

      const invoiceOutstanding =
        Math.max(
          0,
          invoiceTotal -
            invoiceAlreadyAllocated
        );

      if (
        allocationAmount >
        invoiceOutstanding +
          0.009
      ) {

        return res.status(400).json({
          success: false,
          message:
            `Allocation exceeds the outstanding amount of ${invoiceLabel}, which is ₹${invoiceOutstanding.toFixed(2)}.`,
        });
      }

      // --------------------------------------------------
      // SAVE
      // --------------------------------------------------

      const result =
        await dbRun(
          `
          INSERT INTO voucher_allocations
          (
            voucherId,
            saleId,
            purchaseId,
            amount,
            allocationDate,
            remarks,
            ownerId
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            numericVoucherId,
            numericSaleId,
            numericPurchaseId,
            allocationAmount,
            allocationDate,
            remarks || "",
            ownerId,
          ]
        );

      res.json({
        success: true,
        message:
          "Allocation saved successfully.",
        id:
          result.lastID,
      });

    } catch (err) {

      console.log(
        "Allocation Save Error:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to save allocation.",
        error:
          err.message,
      });
    }
  }
);
// ==================================================
// DAY BOOK
// CURRENT USER ONLY
// ==================================================

router.get(
  "/day-book",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const {
        fromDate,
        toDate,
      } = req.query;

      let sql = `
        SELECT
          account_transactions.*,

          accounts.name
            AS accountName,

          vouchers.voucherNo,

          vouchers.voucherDate,

          vouchers.voucherType

        FROM account_transactions

        LEFT JOIN accounts
          ON accounts.id =
             account_transactions.accountId

         AND accounts.ownerId =
             account_transactions.ownerId

        LEFT JOIN vouchers
          ON vouchers.id =
             account_transactions.voucherId

         AND vouchers.ownerId =
             account_transactions.ownerId

        WHERE
          account_transactions.ownerId = ?
      `;

      const params = [
        ownerId,
      ];

      // --------------------------------------------------
      // DATE FILTER
      // --------------------------------------------------

      if (
        fromDate
      ) {

        sql += `
          AND DATE(
            account_transactions.transactionDate
          ) >= DATE(?)
        `;

        params.push(
          fromDate
        );
      }

      if (
        toDate
      ) {

        sql += `
          AND DATE(
            account_transactions.transactionDate
          ) <= DATE(?)
        `;

        params.push(
          toDate
        );
      }

      sql += `
        ORDER BY
          account_transactions.transactionDate ASC,
          account_transactions.id ASC
      `;

      const rows =
        await dbAll(
          sql,
          params
        );

      res.json({

        success:
          true,

        rows,

        transactions:
          rows,
      });

    } catch (err) {

      console.log(
        "Day Book Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to load Day Book",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// TRIAL BALANCE
// CURRENT USER ONLY
// ==================================================

router.get(
  "/trial-balance",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const rows =
        await dbAll(
          `
          SELECT
            accounts.id,
            accounts.code,
            accounts.name,
            accounts.openingBalance,
            accounts.openingType,

            account_groups.name
              AS groupName,

            account_groups.nature
              AS groupNature,

            COALESCE(
              SUM(
                account_transactions.debit
              ),
              0
            ) AS totalDebit,

            COALESCE(
              SUM(
                account_transactions.credit
              ),
              0
            ) AS totalCredit

          FROM accounts

          LEFT JOIN account_groups
            ON accounts.groupId =
               account_groups.id

          LEFT JOIN account_transactions
            ON accounts.id =
               account_transactions.accountId

           AND account_transactions.ownerId =
               accounts.ownerId

          WHERE accounts.ownerId = ?

          GROUP BY
            accounts.id,
            accounts.code,
            accounts.name,
            accounts.openingBalance,
            accounts.openingType,
            account_groups.name,
            account_groups.nature

          ORDER BY
            accounts.name ASC
          `,
          [
            ownerId,
          ]
        );

      let totalDebit =
        0;

      let totalCredit =
        0;

      const accounts =
        rows.map(
          (account) => {

            const balance =
              calculateBalance(
                account
              );

            const debit =
              balance > 0
                ? Number(
                    balance.toFixed(
                      2
                    )
                  )
                : 0;

            const credit =
              balance < 0
                ? Number(
                    Math.abs(
                      balance
                    ).toFixed(
                      2
                    )
                  )
                : 0;

            totalDebit +=
              debit;

            totalCredit +=
              credit;

            return {

              id:
                account.id,

              code:
                account.code || "",

              name:
                account.name,

              groupName:
                account.groupName ||
                "",

              nature:
                account.groupNature ||
                "",

              debit,

              credit,
            };
          }
        );

      totalDebit =
        Number(
          totalDebit.toFixed(
            2
          )
        );

      totalCredit =
        Number(
          totalCredit.toFixed(
            2
          )
        );

      const difference =
        Number(
          (
            totalDebit -
            totalCredit
          ).toFixed(
            2
          )
        );

      const isBalanced =
        Math.abs(
          difference
        ) < 0.01;

      res.json({

        success:
          true,

        accounts,

        totalDebit,

        totalCredit,

        difference,

        isBalanced,
      });

    } catch (err) {

      console.log(
        "Trial Balance Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to load Trial Balance",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// SINGLE ACCOUNT
// CURRENT USER ONLY
// ==================================================

router.get(
  "/:id",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const accountId =
        Number(
          req.params.id
        );

      const account =
        await dbGet(
          `
          SELECT
            accounts.*,

            account_groups.name
              AS groupName,

            account_groups.nature
              AS groupNature

          FROM accounts

          LEFT JOIN account_groups
            ON accounts.groupId =
               account_groups.id

          WHERE
            accounts.id = ?

            AND accounts.ownerId = ?

          LIMIT 1
          `,
          [
            accountId,
            ownerId,
          ]
        );

      if (!account) {

        return res.status(404).json({

          success:
            false,

          message:
            "Account not found.",
        });
      }

      res.json({

        success:
          true,

        account,
      });

    } catch (err) {

      console.log(
        "Single Account Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to load account",

        error:
          err.message,
      });
    }
  }
);
// ==================================================
// ACCOUNT LEDGER
// ==================================================

router.get(
  "/:id/ledger",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const accountId =
        Number(
          req.params.id
        );

      const account =
        await dbGet(
          `
          SELECT
            *

          FROM accounts

          WHERE id = ?

            AND ownerId = ?

          LIMIT 1
          `,
          [
            accountId,
            ownerId,
          ]
        );

      if (!account) {

        return res.status(404).json({

          success:
            false,

          message:
            "Account not found",
        });
      }

      const transactions =
        await dbAll(
          `
          SELECT
            account_transactions.*,

            vouchers.voucherNo,
            vouchers.voucherDate,
            vouchers.voucherType

          FROM account_transactions

          LEFT JOIN vouchers
            ON vouchers.id =
               account_transactions.voucherId

           AND vouchers.ownerId =
               account_transactions.ownerId

          WHERE
            account_transactions.accountId = ?

            AND account_transactions.ownerId = ?

          ORDER BY
            account_transactions.id ASC
          `,
          [
            accountId,
            ownerId,
          ]
        );

      let balance =
        Number(
          account.openingBalance
        ) || 0;

      if (
        String(
          account.openingType ||
            "Debit"
        ).toLowerCase() ===
        "credit"
      ) {

        balance =
          -balance;
      }

      const ledger =
        transactions.map(
          (transaction) => {

            const debit =
              Number(
                transaction.debit
              ) || 0;

            const credit =
              Number(
                transaction.credit
              ) || 0;

            balance +=
              debit -
              credit;

            return {

              ...transaction,

              balance,
            };
          }
        );

      res.json({

        success:
          true,

        account,

        transactions:
          ledger,
      });

    } catch (err) {

      console.log(
        "Account Ledger Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to load account ledger",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// CREATE ACCOUNT
// ==================================================

router.post(
  "/",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const {
        code,
        name,
        groupId,
        openingBalance,
        openingType,
      } = req.body;

      if (!name) {

        return res.status(400).json({

          success:
            false,

          message:
            "Account name is required",
        });
      }

      if (!groupId) {

        return res.status(400).json({

          success:
            false,

          message:
            "Account group is required",
        });
      }

      const group =
        await dbGet(
          `
          SELECT
            id

          FROM account_groups

          WHERE id = ?

          LIMIT 1
          `,
          [
            Number(
              groupId
            ),
          ]
        );

      if (!group) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid account group",
        });
      }

      const existing =
        await dbGet(
          `
          SELECT
            id

          FROM accounts

          WHERE ownerId = ?

            AND name = ?

          LIMIT 1
          `,
          [
            ownerId,
            name.trim(),
          ]
        );

      if (existing) {

        return res.status(400).json({

          success:
            false,

          message:
            "An account with this name already exists",
        });
      }

      const result =
        await dbRun(
          `
          INSERT INTO accounts
          (
            ownerId,
            code,
            name,
            groupId,
            openingBalance,
            openingType
          )

          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
          `,
          [
            ownerId,

            code ||
              null,

            name.trim(),

            Number(
              groupId
            ),

            Number(
              openingBalance
            ) || 0,

            openingType ||
              "Debit",
          ]
        );

      res.json({

        success:
          true,

        message:
          "Account created successfully",

        id:
          result.lastID,
      });

    } catch (err) {

      console.log(
        "Create Account Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to create account",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// UPDATE ACCOUNT
// ==================================================

router.put(
  "/:id",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const id =
        Number(
          req.params.id
        );

      const {
        code,
        name,
        groupId,
        openingBalance,
        openingType,
      } = req.body;

      const existing =
        await dbGet(
          `
          SELECT
            id

          FROM accounts

          WHERE id = ?

            AND ownerId = ?

          LIMIT 1
          `,
          [
            id,
            ownerId,
          ]
        );

      if (!existing) {

        return res.status(404).json({

          success:
            false,

          message:
            "Account not found",
        });
      }

      await dbRun(
        `
        UPDATE accounts

        SET
          code = ?,
          name = ?,
          groupId = ?,
          openingBalance = ?,
          openingType = ?

        WHERE id = ?

          AND ownerId = ?
        `,
        [
          code ||
            null,

          name.trim(),

          Number(
            groupId
          ),

          Number(
            openingBalance
          ) || 0,

          openingType ||
            "Debit",

          id,

          ownerId,
        ]
      );

      res.json({

        success:
          true,

        message:
          "Account updated successfully",
      });

    } catch (err) {

      console.log(
        "Update Account Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to update account",

        error:
          err.message,
      });
    }
  }
);
// ==================================================
// DELETE ACCOUNT
// ==================================================

router.delete(
  "/:id",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const id =
        Number(
          req.params.id
        );

      const account =
        await dbGet(
          `
          SELECT
            id,
            name

          FROM accounts

          WHERE id = ?

            AND ownerId = ?

          LIMIT 1
          `,
          [
            id,
            ownerId,
          ]
        );

      if (!account) {

        return res.status(404).json({

          success:
            false,

          message:
            "Account not found",
        });
      }

      const transaction =
        await dbGet(
          `
          SELECT
            id

          FROM account_transactions

          WHERE accountId = ?

            AND ownerId = ?

          LIMIT 1
          `,
          [
            id,
            ownerId,
          ]
        );

      if (transaction) {

        return res.status(400).json({

          success:
            false,

          message:
            "This account cannot be deleted because transactions already exist.",
        });
      }

      await dbRun(
        `
        DELETE FROM accounts

        WHERE id = ?

          AND ownerId = ?
        `,
        [
          id,
          ownerId,
        ]
      );

      res.json({

        success:
          true,

        message:
          "Account deleted successfully",
      });

    } catch (err) {

      console.log(
        "Delete Account Error:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to delete account",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// EXPORT
// ==================================================

module.exports =
  router;

module.exports.authenticate =
  authenticate;