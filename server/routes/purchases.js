const express = require("express");
const router = express.Router();

const db = require("../database");
const { authenticate } = require("./auth");

// ==================================================
// ASYNC DATABASE HELPERS
// ==================================================

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });

const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows || []);
    });
  });

// ==================================================
// FIND OR CREATE ACCOUNT GROUP
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

    if (group) {
      return group;
    }
  }

  return null;
}

// ==================================================
// FIND OR CREATE PURCHASE ACCOUNT
// ==================================================

async function getPurchaseAccount(ownerId) {
  let account = await dbGet(
    `
    SELECT id, name, groupId
    FROM accounts
    WHERE ownerId = ?
      AND LOWER(TRIM(name)) IN ('purchase', 'purchases')
    ORDER BY id
    LIMIT 1
    `,
    [ownerId]
  );

  if (account) {
    return account;
  }

  const group = await findAccountGroup([
    "Direct Expenses",
    "Expenses",
    "Purchase",
  ]);

  if (!group) {
    throw new Error(
      "Purchase account not found and no suitable account group exists."
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
      "Purchase",
      group.id,
      0,
      "Debit",
      ownerId,
    ]
  );

  account = {
    id: result.lastID,
    name: "Purchase",
    groupId: group.id,
  };

  console.log(
    `Purchase account created automatically for owner ${ownerId}`
  );

  return account;
}

// ==================================================
// FIND OR CREATE GST INPUT ACCOUNT
// ==================================================

async function getGSTInputAccount(ownerId) {
  let account = await dbGet(
    `
    SELECT id, name, groupId
    FROM accounts
    WHERE ownerId = ?
      AND LOWER(TRIM(name)) IN
      (
        'gst input',
        'input gst',
        'input tax',
        'gst receivable'
      )
    ORDER BY id
    LIMIT 1
    `,
    [ownerId]
  );

  if (account) {
    return account;
  }

  const group = await findAccountGroup([
    "Current Assets",
    "Current Asset",
    "Assets",
  ]);

  if (!group) {
    throw new Error(
      "GST Input account not found and no suitable asset group exists."
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
      "GST Input",
      group.id,
      0,
      "Debit",
      ownerId,
    ]
  );

  account = {
    id: result.lastID,
    name: "GST Input",
    groupId: group.id,
  };

  console.log(
    `GST Input account created automatically for owner ${ownerId}`
  );

  return account;
}

// ==================================================
// FIND OR CREATE SUPPLIER ACCOUNT
// ==================================================

async function getSupplierAccount(
  supplierId,
  ownerId
) {
  const supplier = await dbGet(
    `
    SELECT
      id,
      name
    FROM suppliers
    WHERE id = ?
      AND ownerId = ?
    LIMIT 1
    `,
    [
      supplierId,
      ownerId,
    ]
  );

  if (!supplier) {
    throw new Error(
      "Supplier not found for this account."
    );
  }

  let supplierAccount = await dbGet(
    `
    SELECT
      id,
      name,
      groupId
    FROM accounts
    WHERE ownerId = ?
      AND LOWER(TRIM(name)) =
          LOWER(TRIM(?))
    ORDER BY id
    LIMIT 1
    `,
    [
      ownerId,
      supplier.name,
    ]
  );

  if (supplierAccount) {
    return supplierAccount;
  }

  // ------------------------------------------
  // FIND CURRENT LIABILITIES GROUP
  // ------------------------------------------

  const liabilityGroup =
    await findAccountGroup([
      "Current Liabilities",
      "Current Liability",
      "Liabilities",
    ]);

  if (!liabilityGroup) {
    throw new Error(
      "Current Liabilities account group not found."
    );
  }

  // ------------------------------------------
  // CREATE SUPPLIER LEDGER
  // ------------------------------------------

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
      supplier.name.trim(),
      liabilityGroup.id,
      0,
      "Credit",
      ownerId,
    ]
  );

  supplierAccount = {
    id: result.lastID,
    name: supplier.name,
    groupId: liabilityGroup.id,
  };

  console.log(
    `Supplier account created automatically: ${supplier.name} for owner ${ownerId}`
  );

  return supplierAccount;
}

// ==================================================
// FIND OR CREATE CASH ACCOUNT
// ==================================================

async function getCashAccount(ownerId) {
  let account = await dbGet(
    `
    SELECT
      id,
      name,
      groupId
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

  if (account) {
    return account;
  }

  const group =
    await findAccountGroup([
      "Cash-in-Hand",
      "Cash",
      "Current Assets",
      "Assets",
    ]);

  if (!group) {
    throw new Error(
      "Cash account not found and no suitable asset group exists."
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
      "Cash",
      group.id,
      0,
      "Debit",
      ownerId,
    ]
  );

  return {
    id: result.lastID,
    name: "Cash",
    groupId: group.id,
  };
}


// ==================================================
// CREATE PURCHASE ACCOUNTING
// ==================================================

async function createPurchaseAccounting({
  purchaseId,
  purchaseNo,
  purchaseDate,
  supplierId,
  paymentMode,
  total,
  gst,
  grandTotal,
  ownerId,
}) {
  const subTotal =
    Number(total) || 0;

  const gstAmount =
    Number(gst) || 0;

  const finalAmount =
    Number(grandTotal) || 0;

  // ------------------------------------------
  // PURCHASE ACCOUNT
  // ------------------------------------------

  const purchaseAccount =
    await getPurchaseAccount(
      ownerId
    );

  // ------------------------------------------
  // GST INPUT ACCOUNT
  // ------------------------------------------

  let gstAccount = null;

  if (
    gstAmount > 0
  ) {
    gstAccount =
      await getGSTInputAccount(
        ownerId
      );
  }

  // ------------------------------------------
  // DEBIT PURCHASE
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
      purchaseDate,
      "Purchase",
      purchaseId,
      purchaseNo,
      purchaseAccount.id,
      subTotal,
      0,
      `Purchase ${purchaseNo}`,
      ownerId,
    ]
  );

  // ------------------------------------------
  // DEBIT INPUT GST
  // ------------------------------------------

  if (
    gstAccount &&
    gstAmount > 0
  ) {
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
        purchaseDate,
        "Purchase",
        purchaseId,
        purchaseNo,
        gstAccount.id,
        gstAmount,
        0,
        `Purchase ${purchaseNo}`,
        ownerId,
      ]
    );
  }

  // ------------------------------------------
  // CREDIT SIDE
  //
  // CASH PURCHASE:
  //       Credit Cash
  //
  // CREDIT PURCHASE:
  //       Credit Supplier
  // ------------------------------------------

  if (
    String(paymentMode || "Cash")
      .toLowerCase() ===
    "cash"
  ) {
    const cashAccount =
      await getCashAccount(
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
        purchaseDate,
        "Purchase",
        purchaseId,
        purchaseNo,
        cashAccount.id,
        0,
        finalAmount,
        `Cash Purchase ${purchaseNo}`,
        ownerId,
      ]
    );
  } else {
    const supplierAccount =
      await getSupplierAccount(
        supplierId,
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
        purchaseDate,
        "Purchase",
        purchaseId,
        purchaseNo,
        supplierAccount.id,
        0,
        finalAmount,
        `Credit Purchase ${purchaseNo}`,
        ownerId,
      ]
    );
  }
}
// ==================================================
// DELETE PURCHASE ACCOUNTING
// ==================================================

async function deletePurchaseAccounting(
  purchaseId,
  ownerId
) {
  await dbRun(
    `
    DELETE FROM account_transactions
    WHERE voucherType = 'Purchase'
      AND voucherId = ?
      AND ownerId = ?
    `,
    [
      purchaseId,
      ownerId,
    ]
  );
}

// ==================================================
// REPAIR OLD PURCHASE ACCOUNTING
// ==================================================

async function repairPurchaseAccounting() {
  try {
    const purchases = await dbAll(
      `
      SELECT
        id,
        purchaseNo,
        supplierId,
        purchaseDate,
        total,
        gst,
        grandTotal,
        ownerId
      FROM purchases
      ORDER BY id ASC
      `
    );

    for (const purchase of purchases) {
      const existing =
        await dbGet(
          `
          SELECT COUNT(*) AS count
          FROM account_transactions
          WHERE voucherType = 'Purchase'
            AND voucherId = ?
            AND ownerId = ?
          `,
          [
            purchase.id,
            purchase.ownerId,
          ]
        );

      if (
        Number(existing?.count || 0) > 0
      ) {
        continue;
      }

      try {
        await createPurchaseAccounting({
          purchaseId: purchase.id,
          purchaseNo: purchase.purchaseNo,
          purchaseDate: purchase.purchaseDate,
          supplierId: purchase.supplierId,
          total: purchase.total,
          gst: purchase.gst,
          grandTotal: purchase.grandTotal,
          ownerId: purchase.ownerId,
        });

        console.log(
          `Purchase accounting repaired: ${purchase.purchaseNo}`
        );
      } catch (err) {
        console.log(
          `Purchase accounting repair skipped for ${purchase.purchaseNo}:`,
          err.message
        );
      }
    }
  } catch (err) {
    console.log(
      "Purchase Accounting Repair Error:",
      err.message
    );
  }
}

// ==================================================
// RUN REPAIR AFTER DATABASE INITIALIZATION
// ==================================================

setTimeout(() => {
  repairPurchaseAccounting();
}, 3000);

// ==================================================
// GET ALL PURCHASES
// CURRENT USER ONLY
// ==================================================

router.get(
  "/",
  authenticate,
  (req, res) => {
    const ownerId = req.user.id;

    const sql = `
      SELECT
        p.id,
        p.purchaseNo,
        p.purchaseDate,
        p.total,
        p.gst,
        p.grandTotal,
        s.name AS supplierName
      FROM purchases p
      LEFT JOIN suppliers s
        ON p.supplierId = s.id
        AND s.ownerId = p.ownerId
      WHERE p.ownerId = ?
      ORDER BY p.id DESC
    `;

    db.all(
      sql,
      [ownerId],
      (err, rows) => {
        if (err) {
          console.log(
            "Get Purchases Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to load purchases",
            error: err.message,
          });
        }

        res.json(rows);
      }
    );
  }
);

// ==================================================
// PURCHASE REPORT
// CURRENT USER ONLY
// ==================================================

router.get(
  "/report/all",
  authenticate,
  (req, res) => {
    const ownerId = req.user.id;

    db.all(
      `
      SELECT
        purchases.id,
        purchases.purchaseNo,
        purchases.purchaseDate,
        suppliers.name AS supplierName,
        purchases.total,
        purchases.gst,
        purchases.grandTotal
      FROM purchases
      LEFT JOIN suppliers
        ON purchases.supplierId =
           suppliers.id
        AND suppliers.ownerId =
            purchases.ownerId
      WHERE purchases.ownerId = ?
      ORDER BY purchases.id DESC
      `,
      [ownerId],
      (err, rows) => {
        if (err) {
          console.log(
            "Purchase Report Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to load purchase report",
            error: err.message,
          });
        }

        res.json(rows);
      }
    );
  }
);

// ==================================================
// GET PURCHASE BY ID
// CURRENT USER ONLY
// ==================================================

router.get(
  "/:id",
  authenticate,
  async (req, res) => {
    try {
      const ownerId = req.user.id;
      const id = req.params.id;

      const purchase = await dbGet(
        `
        SELECT
          purchases.*,
          suppliers.name AS supplierName
        FROM purchases
        LEFT JOIN suppliers
          ON purchases.supplierId =
             suppliers.id
          AND suppliers.ownerId =
              purchases.ownerId
        WHERE purchases.id = ?
          AND purchases.ownerId = ?
        LIMIT 1
        `,
        [
          id,
          ownerId,
        ]
      );

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message:
            "Purchase not found",
        });
      }

      const items = await dbAll(
        `
        SELECT
          purchase_items.*,
          products.name AS productName
        FROM purchase_items
        LEFT JOIN products
          ON purchase_items.productId =
             products.id
          AND products.ownerId =
              purchase_items.ownerId
        WHERE purchase_items.purchaseId = ?
          AND purchase_items.ownerId = ?
        `,
        [
          id,
          ownerId,
        ]
      );

      res.json({
        purchase,
        items,
      });
    } catch (err) {
      console.log(
        "Get Purchase Error:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load purchase",
        error: err.message,
      });
    }
  }
);

// ==================================================
// SAVE PURCHASE
// ==================================================

router.post(
  "/",
  authenticate,
  async (req, res) => {
    const ownerId = req.user.id;

    const {
  purchaseNo,
  supplierId,
  purchaseDate,
  paymentMode,
  total,
  gst,
  grandTotal,
  items,
} = req.body;

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (
      !purchaseNo ||
      !String(purchaseNo).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase Number is required",
      });
    }

    if (!supplierId) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier is required",
      });
    }

    if (!purchaseDate) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase Date is required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter at least one product",
      });
    }

    try {
      // ----------------------------------------
      // VERIFY SUPPLIER BELONGS TO USER
      // ----------------------------------------

      const supplier =
        await dbGet(
          `
          SELECT id, name
          FROM suppliers
          WHERE id = ?
            AND ownerId = ?
          LIMIT 1
          `,
          [
            supplierId,
            ownerId,
          ]
        );

      if (!supplier) {
        return res.status(403).json({
          success: false,
          message:
            "Supplier does not belong to this account",
        });
      }

      // ----------------------------------------
      // VERIFY PRODUCTS BELONG TO USER
      // ----------------------------------------

      for (const item of items) {
        const product =
          await dbGet(
            `
            SELECT id
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
              "One of the selected products does not belong to this account",
          });
        }
      }

      // ----------------------------------------
      // BEGIN TRANSACTION
      // ----------------------------------------

      await dbRun(
        "BEGIN TRANSACTION"
      );

      // ----------------------------------------
      // INSERT PURCHASE
      // ----------------------------------------

      const purchaseResult =
        await dbRun(
          `
          INSERT INTO purchases
          (
            purchaseNo,
            supplierId,
            purchaseDate,
            total,
            gst,
            grandTotal,
            ownerId
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            purchaseNo,
            supplierId,
            purchaseDate,
            Number(total) || 0,
            Number(gst) || 0,
            Number(grandTotal) || 0,
            ownerId,
          ]
        );

      const purchaseId =
        purchaseResult.lastID;

      // ----------------------------------------
      // SAVE ITEMS + STOCK
      // ----------------------------------------

      for (const item of items) {
        const qty =
          Number(item.qty) || 0;

        const rate =
          Number(item.rate) || 0;

        const itemGst =
          Number(item.gst) || 0;

        const itemTotal =
          Number(item.total) ||
          qty * rate;

        // --------------------------------------
        // INSERT PURCHASE ITEM
        // --------------------------------------

        await dbRun(
          `
          INSERT INTO purchase_items
          (
            purchaseId,
            productId,
            qty,
            rate,
            gst,
            total,
            ownerId
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            purchaseId,
            item.productId,
            qty,
            rate,
            itemGst,
            itemTotal,
            ownerId,
          ]
        );

        // --------------------------------------
        // ADD STOCK
        // --------------------------------------

        await dbRun(
          `
          UPDATE products
          SET stock =
            COALESCE(stock, 0) + ?
          WHERE id = ?
            AND ownerId = ?
          `,
          [
            qty,
            item.productId,
            ownerId,
          ]
        );

        // --------------------------------------
        // STOCK MOVEMENT
        // --------------------------------------

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
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            item.productId,
            purchaseDate,
            "Purchase",
            purchaseId,
            purchaseNo,
            qty,
            0,
            "Purchase Stock IN",
            ownerId,
          ]
        );
      }

      // ----------------------------------------
      // ACCOUNTING
      // ----------------------------------------

      await createPurchaseAccounting({
  purchaseId,
  purchaseNo,
  purchaseDate,
  supplierId,
  paymentMode: paymentMode || "Cash",
  total,
  gst,
  grandTotal,
  ownerId,
});

      // ----------------------------------------
      // COMMIT
      // ----------------------------------------

      await dbRun(
        "COMMIT"
      );

      return res.json({
        success: true,
        message:
          "Purchase Saved Successfully",
        purchaseId,
      });
    } catch (err) {
      try {
        await dbRun(
          "ROLLBACK"
        );
      } catch (rollbackErr) {
        console.log(
          "Purchase Rollback Error:",
          rollbackErr
        );
      }

      console.log(
        "Purchase Save Error:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to save purchase",
        error: err.message,
      });
    }
  }
);

// ==================================================
// UPDATE PURCHASE
// ==================================================

router.put(
  "/:id",
  authenticate,
  async (req, res) => {
    const ownerId = req.user.id;
    const purchaseId =
      req.params.id;

    const {
      supplierId,
      purchaseDate,
      total,
      gst,
      grandTotal,
      items,
    } = req.body;

    if (!supplierId) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier is required",
      });
    }

    if (!purchaseDate) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase Date is required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter at least one product",
      });
    }

    try {
      // ----------------------------------------
      // LOAD OLD PURCHASE
      // ----------------------------------------

      const oldPurchase =
        await dbGet(
          `
          SELECT *
          FROM purchases
          WHERE id = ?
            AND ownerId = ?
          LIMIT 1
          `,
          [
            purchaseId,
            ownerId,
          ]
        );

      if (!oldPurchase) {
        return res.status(404).json({
          success: false,
          message:
            "Purchase not found",
        });
      }

      // ----------------------------------------
      // VERIFY SUPPLIER
      // ----------------------------------------

      const supplier =
        await dbGet(
          `
          SELECT id, name
          FROM suppliers
          WHERE id = ?
            AND ownerId = ?
          LIMIT 1
          `,
          [
            supplierId,
            ownerId,
          ]
        );

      if (!supplier) {
        return res.status(403).json({
          success: false,
          message:
            "Supplier does not belong to this account",
        });
      }

      // ----------------------------------------
      // VERIFY PRODUCTS
      // ----------------------------------------

      for (const item of items) {
        const product =
          await dbGet(
            `
            SELECT id
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
              "One of the selected products does not belong to this account",
          });
        }
      }

      // ----------------------------------------
      // OLD ITEMS
      // ----------------------------------------

      const oldItems =
        await dbAll(
          `
          SELECT *
          FROM purchase_items
          WHERE purchaseId = ?
            AND ownerId = ?
          `,
          [
            purchaseId,
            ownerId,
          ]
        );

      // ----------------------------------------
      // BEGIN TRANSACTION
      // ----------------------------------------

      await dbRun(
        "BEGIN TRANSACTION"
      );

      // ----------------------------------------
      // REMOVE OLD STOCK
      // ----------------------------------------

      for (const oldItem of oldItems) {
        await dbRun(
          `
          UPDATE products
          SET stock =
            COALESCE(stock, 0) - ?
          WHERE id = ?
            AND ownerId = ?
          `,
          [
            Number(oldItem.qty) || 0,
            oldItem.productId,
            ownerId,
          ]
        );
      }

      // ----------------------------------------
      // DELETE OLD STOCK MOVEMENTS
      // ----------------------------------------

      await dbRun(
        `
        DELETE FROM stock_movements
        WHERE voucherType = 'Purchase'
          AND voucherId = ?
          AND ownerId = ?
        `,
        [
          purchaseId,
          ownerId,
        ]
      );

      // ----------------------------------------
      // DELETE OLD ACCOUNTING
      // ----------------------------------------

      await deletePurchaseAccounting(
        purchaseId,
        ownerId
      );

      // ----------------------------------------
      // DELETE OLD ITEMS
      // ----------------------------------------

      await dbRun(
        `
        DELETE FROM purchase_items
        WHERE purchaseId = ?
          AND ownerId = ?
        `,
        [
          purchaseId,
          ownerId,
        ]
      );

      // ----------------------------------------
      // UPDATE PURCHASE
      // ----------------------------------------

      await dbRun(
        `
        UPDATE purchases
        SET
          supplierId = ?,
          purchaseDate = ?,
          total = ?,
          gst = ?,
          grandTotal = ?
        WHERE id = ?
          AND ownerId = ?
        `,
        [
          supplierId,
          purchaseDate,
          Number(total) || 0,
          Number(gst) || 0,
          Number(grandTotal) || 0,
          purchaseId,
          ownerId,
        ]
      );

      // ----------------------------------------
      // INSERT NEW ITEMS
      // ----------------------------------------

      for (const item of items) {
        const qty =
          Number(item.qty) || 0;

        const rate =
          Number(item.rate) || 0;

        const itemGst =
          Number(item.gst) || 0;

        const itemTotal =
          Number(item.total) ||
          qty * rate;

        await dbRun(
          `
          INSERT INTO purchase_items
          (
            purchaseId,
            productId,
            qty,
            rate,
            gst,
            total,
            ownerId
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            purchaseId,
            item.productId,
            qty,
            rate,
            itemGst,
            itemTotal,
            ownerId,
          ]
        );

        // --------------------------------------
        // ADD STOCK
        // --------------------------------------

        await dbRun(
          `
          UPDATE products
          SET stock =
            COALESCE(stock, 0) + ?
          WHERE id = ?
            AND ownerId = ?
          `,
          [
            qty,
            item.productId,
            ownerId,
          ]
        );

        // --------------------------------------
        // STOCK MOVEMENT
        // --------------------------------------

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
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            item.productId,
            purchaseDate,
            "Purchase",
            purchaseId,
            oldPurchase.purchaseNo,
            qty,
            0,
            "Purchase Stock IN",
            ownerId,
          ]
        );
      }

      // ----------------------------------------
      // RECREATE ACCOUNTING
      // ----------------------------------------

      await createPurchaseAccounting({
        purchaseId,
        purchaseNo:
          oldPurchase.purchaseNo,
        purchaseDate,
        supplierId,
        total,
        gst,
        grandTotal,
        ownerId,
      });

      // ----------------------------------------
      // COMMIT
      // ----------------------------------------

      await dbRun(
        "COMMIT"
      );

      return res.json({
        success: true,
        message:
          "Purchase Updated Successfully",
      });
    } catch (err) {
      try {
        await dbRun(
          "ROLLBACK"
        );
      } catch (rollbackErr) {
        console.log(
          "Purchase Update Rollback Error:",
          rollbackErr
        );
      }

      console.log(
        "Purchase Update Error:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update purchase",
        error: err.message,
      });
    }
  }
);

// ==================================================
// DELETE PURCHASE
// ==================================================

router.delete(
  "/:id",
  authenticate,
  async (req, res) => {
    const ownerId = req.user.id;
    const purchaseId =
      req.params.id;

    try {
      // ----------------------------------------
      // LOAD PURCHASE
      // ----------------------------------------

      const purchase =
        await dbGet(
          `
          SELECT *
          FROM purchases
          WHERE id = ?
            AND ownerId = ?
          LIMIT 1
          `,
          [
            purchaseId,
            ownerId,
          ]
        );

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message:
            "Purchase not found",
        });
      }

      // ----------------------------------------
      // LOAD ITEMS
      // ----------------------------------------

      const items =
        await dbAll(
          `
          SELECT *
          FROM purchase_items
          WHERE purchaseId = ?
            AND ownerId = ?
          `,
          [
            purchaseId,
            ownerId,
          ]
        );

      // ----------------------------------------
      // BEGIN TRANSACTION
      // ----------------------------------------

      await dbRun(
        "BEGIN TRANSACTION"
      );

      // ----------------------------------------
      // REMOVE STOCK
      // ----------------------------------------

      for (const item of items) {
        await dbRun(
          `
          UPDATE products
          SET stock =
            COALESCE(stock, 0) - ?
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

      // ----------------------------------------
      // DELETE STOCK MOVEMENTS
      // ----------------------------------------

      await dbRun(
        `
        DELETE FROM stock_movements
        WHERE voucherType = 'Purchase'
          AND voucherId = ?
          AND ownerId = ?
        `,
        [
          purchaseId,
          ownerId,
        ]
      );

      // ----------------------------------------
      // DELETE ACCOUNTING
      // ----------------------------------------

      await deletePurchaseAccounting(
        purchaseId,
        ownerId
      );

      // ----------------------------------------
      // DELETE ITEMS
      // ----------------------------------------

      await dbRun(
        `
        DELETE FROM purchase_items
        WHERE purchaseId = ?
          AND ownerId = ?
        `,
        [
          purchaseId,
          ownerId,
        ]
      );

      // ----------------------------------------
      // DELETE PURCHASE
      // ----------------------------------------

      const result =
        await dbRun(
          `
          DELETE FROM purchases
          WHERE id = ?
            AND ownerId = ?
          `,
          [
            purchaseId,
            ownerId,
          ]
        );

      if (result.changes === 0) {
        throw new Error(
          "Purchase not found"
        );
      }

      // ----------------------------------------
      // COMMIT
      // ----------------------------------------

      await dbRun(
        "COMMIT"
      );

      return res.json({
        success: true,
        message:
          "Purchase Deleted Successfully",
      });
    } catch (err) {
      try {
        await dbRun(
          "ROLLBACK"
        );
      } catch (rollbackErr) {
        console.log(
          "Purchase Delete Rollback Error:",
          rollbackErr
        );
      }

      console.log(
        "Purchase Delete Error:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete purchase",
        error: err.message,
      });
    }
  }
);

// ==================================================
// EXPORT
// ==================================================

module.exports = router;