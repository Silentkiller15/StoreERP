const express = require("express");
const router = express.Router();

const db = require("../database");
const { authenticate } = require("./auth");

// ==================================================
// DATABASE HELPERS
// ==================================================

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// ==================================================
// ACCOUNT HELPERS
// ==================================================

async function findAccountGroup(names) {
  for (const name of names) {
    const group = await dbGet(
      `
      SELECT id, name
      FROM account_groups
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
      LIMIT 1
      `,
      [name]
    );

    if (group) return group;
  }

  return null;
}

// ==================================================
// GET SALES ACCOUNT
// ==================================================

async function getSalesAccount(ownerId) {
  let account = await dbGet(
    `
    SELECT id, name, groupId
    FROM accounts
    WHERE ownerId = ?
      AND LOWER(TRIM(name)) IN ('sales', 'sale')
    ORDER BY id
    LIMIT 1
    `,
    [ownerId]
  );

  if (account) return account;

  const group = await findAccountGroup([
    "Sales",
    "Direct Income",
    "Income",
  ]);

  if (!group) {
    throw new Error(
      "Sales account not found and no suitable income group exists."
    );
  }

  const result = await dbRun(
    `
    INSERT INTO accounts
    (
      code,
      name,
      groupId,
      openingBalance,
      openingType,
      isActive,
      ownerId
    )
    VALUES (?, ?, ?, ?, ?, 1, ?)
    `,
    [
      null,
      "Sales",
      group.id,
      0,
      "Credit",
      ownerId,
    ]
  );

  return {
    id: result.lastID,
    name: "Sales",
    groupId: group.id,
  };
}

// ==================================================
// GET CASH ACCOUNT
// ==================================================

async function getCashAccount(ownerId) {
  const account = await dbGet(
    `
    SELECT id, name, groupId
    FROM accounts
    WHERE ownerId = ?
      AND (
        LOWER(TRIM(name)) = 'cash'
        OR LOWER(TRIM(name)) = 'cash in hand'
      )
    ORDER BY id
    LIMIT 1
    `,
    [ownerId]
  );

  if (!account) {
    throw new Error(
      "Cash account not found. Please create a Cash account first."
    );
  }

  return account;
}

// ==================================================
// GET / CREATE CUSTOMER ACCOUNT
// ==================================================

async function getCustomerAccount(
  customerId,
  ownerId
) {
  const customer = await dbGet(
    `
    SELECT id, name
    FROM customers
    WHERE id = ?
      AND ownerId = ?
    LIMIT 1
    `,
    [
      customerId,
      ownerId,
    ]
  );

  if (!customer) {
    throw new Error(
      "Customer not found for this account."
    );
  }

  let account = await dbGet(
    `
    SELECT id, name, groupId
    FROM accounts
    WHERE ownerId = ?
      AND LOWER(TRIM(name)) =
          LOWER(TRIM(?))
    ORDER BY id
    LIMIT 1
    `,
    [
      ownerId,
      customer.name,
    ]
  );

  if (account) {
    return account;
  }

  const group =
    await findAccountGroup([
      "Sundry Debtors",
      "Accounts Receivable",
      "Current Assets",
      "Current Asset",
      "Assets",
    ]);

  if (!group) {
    throw new Error(
      "Customer account group not found."
    );
  }

  const result = await dbRun(
    `
    INSERT INTO accounts
    (
      code,
      name,
      groupId,
      openingBalance,
      openingType,
      isActive,
      ownerId
    )
    VALUES (?, ?, ?, ?, ?, 1, ?)
    `,
    [
      null,
      customer.name.trim(),
      group.id,
      0,
      "Debit",
      ownerId,
    ]
  );

  return {
    id: result.lastID,
    name: customer.name,
    groupId: group.id,
  };
}

// ==================================================
// CREATE SALES ACCOUNTING
//
// CASH SALE:
//
// Cash A/c       DR
// Sales A/c      CR
//
// CREDIT SALE:
//
// Customer A/c   DR
// Sales A/c      CR
//
// GST: NOT USED
// ==================================================

async function createSaleAccounting({
  saleId,
  saleNo,
  saleDate,
  customerId,
  paymentMode,
  amount,
  ownerId,
}) {
  const salesAccount =
    await getSalesAccount(ownerId);

  const saleAmount =
    Number(amount) || 0;

  // ------------------------------------------
  // SALES CREDIT
  // ------------------------------------------

  await dbRun(
    `
    INSERT INTO account_transactions
    (
      transactionDate,
      voucherType,
      voucherId,
      voucherNo,
      accountId,
      debit,
      credit,
      narration,
      ownerId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      saleDate,
      "Sale",
      saleId,
      saleNo,
      salesAccount.id,
      0,
      saleAmount,
      `Sale ${saleNo}`,
      ownerId,
    ]
  );

  // ------------------------------------------
  // CASH SALE
  // ------------------------------------------

  if (
    String(paymentMode).toLowerCase() ===
    "cash"
  ) {
    const cashAccount =
      await getCashAccount(ownerId);

    await dbRun(
      `
      INSERT INTO account_transactions
      (
        transactionDate,
        voucherType,
        voucherId,
        voucherNo,
        accountId,
        debit,
        credit,
        narration,
        ownerId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        saleDate,
        "Sale",
        saleId,
        saleNo,
        cashAccount.id,
        saleAmount,
        0,
        `Cash Sale ${saleNo}`,
        ownerId,
      ]
    );

  } else {

    // ----------------------------------------
    // CREDIT SALE
    // ----------------------------------------

    const customerAccount =
      await getCustomerAccount(
        customerId,
        ownerId
      );

    await dbRun(
      `
      INSERT INTO account_transactions
      (
        transactionDate,
        voucherType,
        voucherId,
        voucherNo,
        accountId,
        debit,
        credit,
        narration,
        ownerId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        saleDate,
        "Sale",
        saleId,
        saleNo,
        customerAccount.id,
        saleAmount,
        0,
        `Credit Sale ${saleNo}`,
        ownerId,
      ]
    );
  }
}

// ==================================================
// GET ALL SALES
// ==================================================

router.get(
  "/",
  authenticate,
  async (req, res) => {
    try {
      const ownerId = req.user.id;

      const rows = await dbAll(
        `
        SELECT
          sales.id,
          sales.ownerId,
          sales.saleNo,
          sales.customerId,
          sales.saleDate,
          sales.paymentMode,
          sales.total,

          0 AS gst,

          sales.total AS grandTotal,

          customers.name AS customerName

        FROM sales

        LEFT JOIN customers
          ON sales.customerId =
             customers.id

         AND customers.ownerId =
             sales.ownerId

        WHERE sales.ownerId = ?

        ORDER BY sales.id DESC
        `,
        [ownerId]
      );

      res.json(rows);

    } catch (err) {

      console.log(
        "GET SALES ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load sales",
        error:
          err.message,
      });
    }
  }
);

// ==================================================
// SALES REPORT
// ==================================================

router.get(
  "/report/all",
  authenticate,
  async (req, res) => {
    try {
      const ownerId = req.user.id;

      const rows = await dbAll(
        `
        SELECT
          sales.id,
          sales.saleNo,
          sales.saleDate,

          customers.name
            AS customerName,

          sales.total,

          0 AS gst,

          sales.total
            AS grandTotal,

          sales.paymentMode

        FROM sales

        LEFT JOIN customers
          ON sales.customerId =
             customers.id

         AND customers.ownerId =
             sales.ownerId

        WHERE sales.ownerId = ?

        ORDER BY sales.id DESC
        `,
        [ownerId]
      );

      res.json(rows);

    } catch (err) {

      console.log(
        "SALES REPORT ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load sales report",
        error:
          err.message,
      });
    }
  }
);

// ==================================================
// PROFIT & LOSS
// INVENTORY BASED
// GST EXCLUDED
// ==================================================

router.get(
  "/profit-loss",
  authenticate,
  async (req, res) => {
    try {
      const ownerId = req.user.id;

      // ==================================================
      // SALES
      // GST EXCLUDED -> use total, NOT grandTotal
      // ==================================================

      const salesResult =
        await dbGet(
          `
          SELECT
            COALESCE(
              SUM(total),
              0
            ) AS totalSales

          FROM sales

          WHERE ownerId = ?
          `,
          [ownerId]
        );

      // ==================================================
      // PURCHASES
      // GST EXCLUDED -> use total
      // ==================================================

      const purchasesResult =
        await dbGet(
          `
          SELECT
            COALESCE(
              SUM(total),
              0
            ) AS totalPurchases

          FROM purchases

          WHERE ownerId = ?
          `,
          [ownerId]
        );

      // ==================================================
      // OPENING STOCK
      // ==================================================

      const openingResult =
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
          [ownerId]
        );

      // ==================================================
      // CLOSING STOCK
      //
      // Current physical stock × latest available cost
      //
      // If a purchase exists, use latest purchase rate.
      // Otherwise use opening-stock rate.
      // Finally fall back to product.purchase.
      // ==================================================

      const stockItems =
        await dbAll(
          `
          SELECT
            p.id AS productId,
            p.name AS productName,
            COALESCE(
              p.stock,
              0
            ) AS quantity,

            COALESCE(
              (
                SELECT pi.rate

                FROM purchase_items pi

                INNER JOIN purchases pu
                  ON pi.purchaseId =
                     pu.id

                 AND pu.ownerId =
                     pi.ownerId

                WHERE pi.ownerId = ?

                  AND pi.productId =
                      p.id

                ORDER BY
                  pu.purchaseDate DESC,
                  pi.id DESC

                LIMIT 1
              ),

              (
                SELECT os.rate

                FROM opening_stock os

                WHERE os.ownerId = ?

                  AND os.productId =
                      p.id

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

          ORDER BY
            p.name ASC
          `,
          [
            ownerId,
            ownerId,
            ownerId,
          ]
        );

      let closingStock = 0;

      const closingStockItems =
        [];

      for (
        const item of stockItems
      ) {

        const quantity =
          Number(
            item.quantity
          ) || 0;

        const costRate =
          Number(
            item.costRate
          ) || 0;

        const value =
          quantity *
          costRate;

        closingStock +=
          value;

        if (
          quantity !== 0
        ) {
          closingStockItems.push({
            productId:
              item.productId,

            productName:
              item.productName,

            quantity,

            costRate,

            value,
          });
        }
      }

      // ==================================================
      // NUMBERS
      // ==================================================

      const totalSales =
        Number(
          salesResult?.totalSales
        ) || 0;

      const totalPurchases =
        Number(
          purchasesResult?.totalPurchases
        ) || 0;

      const openingStock =
        Number(
          openingResult?.openingStock
        ) || 0;

      // ==================================================
      // COGS
      //
      // Opening Stock
      // + Purchases
      // - Closing Stock
      // =================
      // COGS
      // ==================================================

      let cogs =
        openingStock +
        totalPurchases -
        closingStock;

      // Prevent a tiny negative amount
      // caused by floating point calculations.

      if (
        Math.abs(cogs) <
        0.005
      ) {
        cogs = 0;
      }

      // ==================================================
      // GROSS PROFIT
      // ==================================================

      const grossProfit =
        totalSales -
        cogs;

      // ==================================================
      // OTHER INCOME
      // ==================================================

      const receiptsResult =
        await dbGet(
          `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS otherIncome

          FROM vouchers

          WHERE ownerId = ?

            AND voucherType =
                'Receipt'
          `,
          [ownerId]
        );

      const otherIncome =
        Number(
          receiptsResult?.otherIncome
        ) || 0;

      // ==================================================
      // EXPENSES
      // ==================================================

      const paymentsResult =
        await dbGet(
          `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS expenses

          FROM vouchers

          WHERE ownerId = ?

            AND voucherType =
                'Payment'
          `,
          [ownerId]
        );

      const expenses =
        Number(
          paymentsResult?.expenses
        ) || 0;

      // ==================================================
      // NET PROFIT
      // ==================================================

      const netProfit =
        grossProfit +
        otherIncome -
        expenses;

      // ==================================================
      // RESPONSE
      // ==================================================

      res.json({
        success: true,

        totalSales,

        totalPurchases,

        openingStock,

        closingStock,

        cogs,

        grossProfit,

        otherIncome,

        expenses,

        netProfit,

        closingStockItems,
      });

    } catch (err) {

      console.log(
        "PROFIT LOSS ERROR:",
        err
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to calculate Profit & Loss",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// SAVE SALE
// NO GST
// ==================================================

router.post(
  "/",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const {
        customerId,
        paymentMode,
        saleDate,
        items,
      } = req.body;

      // ------------------------------------------
      // VALIDATE CUSTOMER
      // ------------------------------------------

      if (!customerId) {

        return res.status(400).json({
          success: false,
          message:
            "Customer is required",
        });
      }

      // ------------------------------------------
      // VALIDATE PAYMENT MODE
      // ------------------------------------------

      if (
        paymentMode !== "Cash" &&
        paymentMode !== "Credit"
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Payment mode must be Cash or Credit",
        });
      }

      // ------------------------------------------
      // VALIDATE DATE
      // ------------------------------------------

      if (!saleDate) {

        return res.status(400).json({
          success: false,
          message:
            "Sale date is required",
        });
      }

      // ------------------------------------------
      // VALIDATE ITEMS
      // ------------------------------------------

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "At least one item is required",
        });
      }

      // ------------------------------------------
      // CHECK CUSTOMER BELONGS TO USER
      // ------------------------------------------

      const customer =
        await dbGet(
          `
          SELECT
            id,
            name

          FROM customers

          WHERE id = ?

            AND ownerId = ?

          LIMIT 1
          `,
          [
            customerId,
            ownerId,
          ]
        );

      if (!customer) {

        return res.status(403).json({
          success: false,
          message:
            "Customer does not belong to this account",
        });
      }

      // ------------------------------------------
      // CLEAN ITEMS
      // ------------------------------------------

      const cleanItems = [];

      let saleTotal = 0;

      for (
        const item of items
      ) {

        if (!item.productId) {
          continue;
        }

        const product =
          await dbGet(
            `
            SELECT
              id,
              name,
              stock

            FROM products

            WHERE id = ?

              AND ownerId = ?

            LIMIT 1
            `,
            [
              item.productId,
              ownerId,
            ]
          );

        if (!product) {

          return res.status(403).json({
            success: false,
            message:
              "Selected product does not belong to this account",
          });
        }

        const qty =
          Number(
            item.qty
          ) || 0;

        const rate =
          Number(
            item.rate
          ) || 0;

        if (qty <= 0) {

          return res.status(400).json({
            success: false,
            message:
              `Quantity must be greater than zero for ${product.name}`,
          });
        }

        if (rate < 0) {

          return res.status(400).json({
            success: false,
            message:
              `Invalid rate for ${product.name}`,
          });
        }

        const availableStock =
          Number(
            product.stock
          ) || 0;

        if (
          qty >
          availableStock
        ) {

          return res.status(400).json({
            success: false,
            message:
              `Insufficient stock for ${product.name}. Available: ${availableStock}`,
          });
        }

        const itemTotal =
          qty * rate;

        saleTotal +=
          itemTotal;

        cleanItems.push({

          productId:
            item.productId,

          qty,

          rate,

          total:
            itemTotal,
        });
      }

      if (
        cleanItems.length === 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "At least one valid product is required",
        });
      }

      // ------------------------------------------
      // GENERATE SALE NUMBER
      // ------------------------------------------

      const lastSale =
        await dbGet(
          `
          SELECT
            saleNo

          FROM sales

          WHERE ownerId = ?

          ORDER BY id DESC

          LIMIT 1
          `,
          [
            ownerId,
          ]
        );

      let nextNumber = 1;

      if (
        lastSale &&
        lastSale.saleNo
      ) {

        const match =
          String(
            lastSale.saleNo
          ).match(
            /(\d+)$/
          );

        if (match) {

          nextNumber =
            Number(
              match[1]
            ) + 1;
        }
      }

      const saleNo =
        `SAL-${String(
          nextNumber
        ).padStart(4, "0")}`;

      // ------------------------------------------
      // INSERT SALE
      // GST = 0
      // GRAND TOTAL = TOTAL
      // ------------------------------------------

      const saleResult =
        await dbRun(
          `
          INSERT INTO sales
          (
            saleNo,
            customerId,
            saleDate,
            paymentMode,
            total,
            gst,
            grandTotal,
            ownerId
          )

          VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?,
            0,
            ?,
            ?
          )
          `,
          [
            saleNo,
            customerId,
            saleDate,
            paymentMode,
            saleTotal,
            saleTotal,
            ownerId,
          ]
        );

      const saleId =
        saleResult.lastID;

      // ------------------------------------------
      // INSERT ITEMS
      // REDUCE STOCK
      // CREATE STOCK MOVEMENTS
      // ------------------------------------------

      for (
        const item of cleanItems
      ) {

        await dbRun(
          `
          INSERT INTO sale_items
          (
            saleId,
            productId,
            qty,
            rate,
            gst,
            total,
            ownerId
          )

          VALUES
          (
            ?,
            ?,
            ?,
            ?,
            0,
            ?,
            ?
          )
          `,
          [
            saleId,
            item.productId,
            item.qty,
            item.rate,
            item.total,
            ownerId,
          ]
        );

        // ----------------------------------------
        // REDUCE STOCK
        // ----------------------------------------

        await dbRun(
          `
          UPDATE products

          SET stock =
            COALESCE(stock, 0) - ?

          WHERE id = ?

            AND ownerId = ?
          `,
          [
            item.qty,
            item.productId,
            ownerId,
          ]
        );

        // ----------------------------------------
        // STOCK MOVEMENT
        // ----------------------------------------

        await dbRun(
          `
          INSERT INTO stock_movements
          (
            productId,
            movementDate,
            voucherType,
            voucherId,
            voucherNo,
            qtyIn,
            qtyOut,
            remarks,
            ownerId
          )

          VALUES
          (
            ?,
            ?,
            'Sale',
            ?,
            ?,
            0,
            ?,
            ?,
            ?
          )
          `,
          [
            item.productId,
            saleDate,
            saleId,
            saleNo,
            item.qty,
            "Sales Stock OUT",
            ownerId,
          ]
        );
      }

      // ------------------------------------------
      // ACCOUNTING ENTRY
      //
      // CASH SALE:
      // Cash DR
      // Sales CR
      //
      // CREDIT SALE:
      // Customer DR
      // Sales CR
      //
      // GST NOT USED
      // ------------------------------------------

      await createSaleAccounting({

        saleId,

        saleNo,

        saleDate,

        customerId,

        paymentMode,

        amount:
          saleTotal,

        ownerId,
      });

      // ------------------------------------------
      // SUCCESS
      // ------------------------------------------

      res.json({

        success:
          true,

        message:
          "Sale Saved Successfully",

        id:
          saleId,

        saleId,

        saleNo,

        total:
          saleTotal,

        gst:
          0,

        grandTotal:
          saleTotal,
      });

    } catch (err) {

      console.log(
        "SAVE SALE ERROR:",
        err
      );

      res.status(500).json({

        success:
          false,

        message:
          "Unable to save sale",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// GET SINGLE SALE
// ==================================================

router.get(
  "/:id",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const saleId =
        req.params.id;

      const sale =
        await dbGet(
          `
          SELECT
            sales.id,
            sales.ownerId,
            sales.saleNo,
            sales.customerId,
            sales.saleDate,
            sales.paymentMode,
            sales.total,

            0 AS gst,

            sales.total
              AS grandTotal,

            customers.name
              AS customerName,

            customers.mobile
              AS customerMobile,

            customers.address
              AS customerAddress

          FROM sales

          LEFT JOIN customers
            ON sales.customerId =
               customers.id

           AND customers.ownerId =
               sales.ownerId

          WHERE sales.id = ?

            AND sales.ownerId = ?

          LIMIT 1
          `,
          [
            saleId,
            ownerId,
          ]
        );

      if (!sale) {
        return res.status(404).json({
          success: false,
          message:
            "Sale not found",
        });
      }

      const items =
        await dbAll(
          `
          SELECT
            sale_items.id,
            sale_items.saleId,
            sale_items.productId,
            sale_items.qty,
            sale_items.rate,

            0 AS gst,

            sale_items.total,

            products.name
              AS productName

          FROM sale_items

          LEFT JOIN products
            ON sale_items.productId =
               products.id

           AND products.ownerId =
               sale_items.ownerId

          WHERE sale_items.saleId = ?

            AND sale_items.ownerId = ?
          `,
          [
            saleId,
            ownerId,
          ]
        );

      sale.items =
        items;

      res.json(sale);

    } catch (err) {

      console.log(
        "GET SINGLE SALE ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load sale",
        error:
          err.message,
      });
    }
  }
);

// ==================================================
// UPDATE SALE
// NO GST
// ==================================================

router.put(
  "/:id",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const saleId =
        req.params.id;

      const {
        customerId,
        paymentMode,
        saleDate,
        items,
      } = req.body;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message:
            "Customer is required",
        });
      }

      if (
        paymentMode !== "Cash" &&
        paymentMode !== "Credit"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment mode must be Cash or Credit",
        });
      }

      if (!saleDate) {
        return res.status(400).json({
          success: false,
          message:
            "Sale date is required",
        });
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one item is required",
        });
      }

      // ------------------------------------------
      // FIND OLD SALE
      // ------------------------------------------

      const oldSale =
        await dbGet(
          `
          SELECT *
          FROM sales

          WHERE id = ?

            AND ownerId = ?

          LIMIT 1
          `,
          [
            saleId,
            ownerId,
          ]
        );

      if (!oldSale) {
        return res.status(404).json({
          success: false,
          message:
            "Sale not found",
        });
      }

      // ------------------------------------------
      // VERIFY CUSTOMER
      // ------------------------------------------

      const customer =
        await dbGet(
          `
          SELECT id
          FROM customers

          WHERE id = ?

            AND ownerId = ?

          LIMIT 1
          `,
          [
            customerId,
            ownerId,
          ]
        );

      if (!customer) {
        return res.status(403).json({
          success: false,
          message:
            "Customer does not belong to this account",
        });
      }

      // ------------------------------------------
      // OLD ITEMS
      // ------------------------------------------

      const oldItems =
        await dbAll(
          `
          SELECT *
          FROM sale_items

          WHERE saleId = ?

            AND ownerId = ?
          `,
          [
            saleId,
            ownerId,
          ]
        );

      // ------------------------------------------
      // STOCK THAT WILL BE RESTORED
      // ------------------------------------------

      const restoredStock = {};

      for (
        const item of oldItems
      ) {

        restoredStock[
          item.productId
        ] =
          (
            restoredStock[
              item.productId
            ] || 0
          ) +
          (
            Number(item.qty) || 0
          );
      }

      // ------------------------------------------
      // VALIDATE NEW ITEMS
      // ------------------------------------------

      let saleTotal = 0;

      const cleanItems = [];

      for (
        const item of items
      ) {

        if (!item.productId) {
          continue;
        }

        const product =
          await dbGet(
            `
            SELECT
              id,
              name,
              stock

            FROM products

            WHERE id = ?

              AND ownerId = ?

            LIMIT 1
            `,
            [
              item.productId,
              ownerId,
            ]
          );

        if (!product) {
          return res.status(403).json({
            success: false,
            message:
              "Selected product does not belong to this account",
          });
        }

        const qty =
          Number(item.qty) || 0;

        const rate =
          Number(item.rate) || 0;

        const available =
          (
            Number(product.stock) || 0
          ) +
          (
            restoredStock[
              item.productId
            ] || 0
          );

        if (qty <= 0) {
          return res.status(400).json({
            success: false,
            message:
              `Quantity must be greater than zero for ${product.name}`,
          });
        }

        if (qty > available) {
          return res.status(400).json({
            success: false,
            message:
              `Insufficient stock for ${product.name}. Available: ${available}`,
          });
        }

        const itemTotal =
          qty * rate;

        saleTotal +=
          itemTotal;

        cleanItems.push({
          productId:
            item.productId,

          qty,

          rate,

          total:
            itemTotal,
        });
      }

      if (
        cleanItems.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one valid product is required",
        });
      }

      // ------------------------------------------
      // RESTORE OLD STOCK
      // ------------------------------------------

      for (
        const item of oldItems
      ) {

        await dbRun(
          `
          UPDATE products

          SET stock =
            COALESCE(stock, 0) + ?

          WHERE id = ?

            AND ownerId = ?
          `,
          [
            Number(item.qty) || 0,
            item.productId,
            ownerId,
          ]
        );
      }

      // ------------------------------------------
      // DELETE OLD ITEMS
      // ------------------------------------------

      await dbRun(
        `
        DELETE FROM sale_items

        WHERE saleId = ?

          AND ownerId = ?
        `,
        [
          saleId,
          ownerId,
        ]
      );

      // ------------------------------------------
      // DELETE OLD STOCK MOVEMENTS
      // ------------------------------------------

      await dbRun(
        `
        DELETE FROM stock_movements

        WHERE voucherType = 'Sale'

          AND voucherId = ?

          AND ownerId = ?
        `,
        [
          saleId,
          ownerId,
        ]
      );

      // ------------------------------------------
      // DELETE OLD ACCOUNTING
      // ------------------------------------------

      await dbRun(
        `
        DELETE FROM account_transactions

        WHERE voucherType = 'Sale'

          AND voucherId = ?

          AND ownerId = ?
        `,
        [
          saleId,
          ownerId,
        ]
      );

      // ------------------------------------------
      // UPDATE SALE
      // ------------------------------------------

      await dbRun(
        `
        UPDATE sales

        SET
          customerId = ?,
          paymentMode = ?,
          saleDate = ?,
          total = ?,
          gst = 0,
          grandTotal = ?

        WHERE id = ?

          AND ownerId = ?
        `,
        [
          customerId,
          paymentMode,
          saleDate,
          saleTotal,
          saleTotal,
          saleId,
          ownerId,
        ]
      );

      // ------------------------------------------
      // INSERT NEW ITEMS
      // ------------------------------------------

      for (
        const item of cleanItems
      ) {

        await dbRun(
          `
          INSERT INTO sale_items
          (
            saleId,
            productId,
            qty,
            rate,
            gst,
            total,
            ownerId
          )

          VALUES
          (
            ?,
            ?,
            ?,
            ?,
            0,
            ?,
            ?
          )
          `,
          [
            saleId,
            item.productId,
            item.qty,
            item.rate,
            item.total,
            ownerId,
          ]
        );

        await dbRun(
          `
          UPDATE products

          SET stock =
            COALESCE(stock, 0) - ?

          WHERE id = ?

            AND ownerId = ?
          `,
          [
            item.qty,
            item.productId,
            ownerId,
          ]
        );

        await dbRun(
          `
          INSERT INTO stock_movements
          (
            productId,
            movementDate,
            voucherType,
            voucherId,
            voucherNo,
            qtyIn,
            qtyOut,
            remarks,
            ownerId
          )

          VALUES
          (
            ?,
            ?,
            'Sale',
            ?,
            ?,
            0,
            ?,
            ?,
            ?
          )
          `,
          [
            item.productId,
            saleDate,
            saleId,
            oldSale.saleNo,
            item.qty,
            "Sales Stock OUT",
            ownerId,
          ]
        );
      }

      // ------------------------------------------
      // NEW ACCOUNTING
      // ------------------------------------------

      await createSaleAccounting({
        saleId,

        saleNo:
          oldSale.saleNo,

        saleDate,

        customerId,

        paymentMode,

        amount:
          saleTotal,

        ownerId,
      });

      res.json({
        success: true,

        message:
          "Sale Updated Successfully",

        total:
          saleTotal,
      });

    } catch (err) {

      console.log(
        "UPDATE SALE ERROR:",
        err
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to update sale",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// DELETE SALE
// ==================================================

router.delete(
  "/:id",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const saleId =
        req.params.id;

      const sale =
        await dbGet(
          `
          SELECT *
          FROM sales

          WHERE id = ?

            AND ownerId = ?

          LIMIT 1
          `,
          [
            saleId,
            ownerId,
          ]
        );

      if (!sale) {
        return res.status(404).json({
          success: false,
          message:
            "Sale not found",
        });
      }

      const items =
        await dbAll(
          `
          SELECT *
          FROM sale_items

          WHERE saleId = ?

            AND ownerId = ?
          `,
          [
            saleId,
            ownerId,
          ]
        );

      // ------------------------------------------
      // RESTORE STOCK
      // ------------------------------------------

      for (
        const item of items
      ) {

        await dbRun(
          `
          UPDATE products

          SET stock =
            COALESCE(stock, 0) + ?

          WHERE id = ?

            AND ownerId = ?
          `,
          [
            Number(item.qty) || 0,
            item.productId,
            ownerId,
          ]
        );
      }

      // ------------------------------------------
      // DELETE STOCK MOVEMENTS
      // ------------------------------------------

      await dbRun(
        `
        DELETE FROM stock_movements

        WHERE voucherType = 'Sale'

          AND voucherId = ?

          AND ownerId = ?
        `,
        [
          saleId,
          ownerId,
        ]
      );

      // ------------------------------------------
      // DELETE ACCOUNTING
      // ------------------------------------------

      await dbRun(
        `
        DELETE FROM account_transactions

        WHERE voucherType = 'Sale'

          AND voucherId = ?

          AND ownerId = ?
        `,
        [
          saleId,
          ownerId,
        ]
      );

      // ------------------------------------------
      // DELETE SALE ITEMS
      // ------------------------------------------

      await dbRun(
        `
        DELETE FROM sale_items

        WHERE saleId = ?

          AND ownerId = ?
        `,
        [
          saleId,
          ownerId,
        ]
      );

      // ------------------------------------------
      // DELETE SALE
      // ------------------------------------------

      await dbRun(
        `
        DELETE FROM sales

        WHERE id = ?

          AND ownerId = ?
        `,
        [
          saleId,
          ownerId,
        ]
      );

      res.json({
        success: true,
        message:
          "Sale Deleted Successfully",
      });

    } catch (err) {

      console.log(
        "DELETE SALE ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete sale",
        error:
          err.message,
      });
    }
  }
);

// ==================================================
// EXPORT
// ==================================================

module.exports = router;