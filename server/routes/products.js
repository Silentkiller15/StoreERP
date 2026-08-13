const express = require("express");
const router = express.Router();

const db = require("../database");

// ==================================================
// AUTHENTICATION
// ==================================================

const {
  authenticate,
} = require("./accounts");

// ==================================================
// GET ALL PRODUCTS
// ==================================================

router.get(
  "/",
  authenticate,
  (req, res) => {
    db.all(
      `
      SELECT *
      FROM products
      WHERE ownerId = ?
      ORDER BY id DESC
      `,
      [req.user.id],
      (err, rows) => {
        if (err) {
          console.log(err);

          return res
            .status(500)
            .json(err);
        }

        res.json(rows);
      }
    );
  }
);

// ==================================================
// STOCK LEDGER
// GET ALL STOCK MOVEMENTS
// ==================================================

router.get(
  "/stock-ledger",
  authenticate,
  (req, res) => {
    const {
      productId,
      fromDate,
      toDate,
    } = req.query;

    let sql = `
      SELECT
        sm.id,
        sm.productId,
        sm.movementDate,
        sm.voucherType,
        sm.voucherId,
        sm.voucherNo,
        sm.qtyIn,
        sm.qtyOut,
        sm.remarks,
        p.name AS productName,
        p.code AS productCode
      FROM stock_movements sm
      LEFT JOIN products p
        ON sm.productId = p.id
      WHERE sm.ownerId = ?
      AND p.ownerId = ?
    `;

    const params = [
      req.user.id,
      req.user.id,
    ];

    // Product filter

    if (productId) {
      sql +=
        " AND sm.productId = ?";

      params.push(productId);
    }

    // From date

    if (fromDate) {
      sql +=
        " AND sm.movementDate >= ?";

      params.push(fromDate);
    }

    // To date

    if (toDate) {
      sql +=
        " AND sm.movementDate <= ?";

      params.push(toDate);
    }

    sql += `
      ORDER BY
        sm.movementDate ASC,
        sm.id ASC
    `;

    db.all(
      sql,
      params,
      (err, rows) => {
        if (err) {
          console.log(
            "Stock Ledger Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to load stock ledger",
            error: err.message,
          });
        }

        let balance = 0;

        const ledger =
          rows.map((row) => {
            const qtyIn =
              Number(row.qtyIn) || 0;

            const qtyOut =
              Number(row.qtyOut) || 0;

            balance =
              balance +
              qtyIn -
              qtyOut;

            return {
              ...row,
              qtyIn,
              qtyOut,
              balance,
            };
          });

        res.json({
          success: true,
          data: ledger,
        });
      }
    );
  }
);

// ==================================================
// STOCK LEDGER FOR ONE PRODUCT
// ==================================================

router.get(
  "/stock-ledger/product/:productId",
  authenticate,
  (req, res) => {
    const productId =
      Number(req.params.productId);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    db.all(
      `
      SELECT
        sm.id,
        sm.productId,
        sm.movementDate,
        sm.voucherType,
        sm.voucherId,
        sm.voucherNo,
        sm.qtyIn,
        sm.qtyOut,
        sm.remarks,
        p.name AS productName,
        p.code AS productCode
      FROM stock_movements sm
      LEFT JOIN products p
        ON sm.productId = p.id
      WHERE sm.productId = ?
      AND sm.ownerId = ?
      AND p.ownerId = ?
      ORDER BY
        sm.movementDate ASC,
        sm.id ASC
      `,
      [
        productId,
        req.user.id,
        req.user.id,
      ],
      (err, rows) => {
        if (err) {
          console.log(
            "Product Stock Ledger Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to load product ledger",
            error: err.message,
          });
        }

        let balance = 0;

        const ledger =
          rows.map((row) => {
            const qtyIn =
              Number(row.qtyIn) || 0;

            const qtyOut =
              Number(row.qtyOut) || 0;

            balance =
              balance +
              qtyIn -
              qtyOut;

            return {
              ...row,
              qtyIn,
              qtyOut,
              balance,
            };
          });

        res.json({
          success: true,
          data: ledger,
        });
      }
    );
  }
);

// ==================================================
// ADD PRODUCT
// ==================================================

router.post(
  "/",
  authenticate,
  (req, res) => {
    const {
      code,
      name,
      category,
      unit,
      purchase,
      selling,
      gst,
      stock,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message:
          "Product name is required",
      });
    }

    db.run(
      `
      INSERT INTO products
      (
        code,
        name,
        category,
        unit,
        purchase,
        selling,
        gst,
        stock,
        ownerId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        code,
        name,
        category,
        unit,
        purchase,
        selling,
        gst,
        stock,
        req.user.id,
      ],
      function (err) {
        if (err) {
          console.log(err);

          return res
            .status(500)
            .json(err);
        }

        res.json({
          success: true,
          id: this.lastID,
        });
      }
    );
  }
);

// ==================================================
// UPDATE PRODUCT
// ==================================================

router.put(
  "/:id",
  authenticate,
  (req, res) => {
    const {
      code,
      name,
      category,
      unit,
      purchase,
      selling,
      gst,
      stock,
    } = req.body;

    db.run(
      `
      UPDATE products
      SET
        code = ?,
        name = ?,
        category = ?,
        unit = ?,
        purchase = ?,
        selling = ?,
        gst = ?,
        stock = ?
      WHERE id = ?
      AND ownerId = ?
      `,
      [
        code,
        name,
        category,
        unit,
        purchase,
        selling,
        gst,
        stock,
        req.params.id,
        req.user.id,
      ],
      function (err) {
        if (err) {
          console.log(err);

          return res
            .status(500)
            .json(err);
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message:
              "Product not found",
          });
        }

        res.json({
          success: true,
          message:
            "Product Updated Successfully",
        });
      }
    );
  }
);

// ==================================================
// DELETE PRODUCT
// ==================================================

router.delete(
  "/:id",
  authenticate,
  (req, res) => {
    db.run(
      `
      DELETE FROM products
      WHERE id = ?
      AND ownerId = ?
      `,
      [
        req.params.id,
        req.user.id,
      ],
      function (err) {
        if (err) {
          console.log(err);

          return res
            .status(500)
            .json(err);
        }

        if (this.changes === 0) {
          return res.status(404).json({
            message:
              "Product not found",
          });
        }

        res.json({
          success: true,
          message:
            "Product Deleted Successfully",
        });
      }
    );
  }
);

// ==================================================
// BULK STOCK ADJUSTMENT
// ==================================================

router.post(
  "/stock-adjustment",
  authenticate,
  (req, res) => {
    const { items } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No stock entries received",
      });
    }

    const validItems =
      items.filter((item) => {
        return (
          item &&
          Number(item.productId) > 0 &&
          Number(item.qty) > 0 &&
          (
            item.type === "add" ||
            item.type === "reduce"
          )
        );
      });

    if (
      validItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid product and quantity",
      });
    }

    let completed = 0;
    let finished = false;

    const complete = () => {
      completed++;

      if (
        completed ===
          validItems.length &&
        !finished
      ) {
        finished = true;

        res.json({
          success: true,
          message:
            "Stock Updated Successfully",
        });
      }
    };

    validItems.forEach(
      (item) => {
        const productId =
          Number(item.productId);

        const qty =
          Number(item.qty);

        const type =
          item.type;

        const movementDate =
          item.date ||
          new Date()
            .toISOString()
            .split("T")[0];

        const voucherNo =
          item.voucherNo ||
          "ADJ-" +
            Date.now();

        const remarks =
          item.remarks ||
          (
            type === "add"
              ? "Stock Adjustment - IN"
              : "Stock Adjustment - OUT"
          );

        // ==================================================
        // ADD STOCK
        // ==================================================

        if (type === "add") {
          db.run(
            `
            UPDATE products
            SET stock =
              COALESCE(stock, 0) + ?
            WHERE id = ?
            AND ownerId = ?
            `,
            [
              qty,
              productId,
              req.user.id,
            ],
            function (err) {
              if (err) {
                console.log(
                  "Stock Add Error:",
                  err
                );

                if (!finished) {
                  finished = true;

                  return res.status(500).json({
                    success: false,
                    message:
                      "Error adding stock",
                    error:
                      err.message,
                  });
                }

                return;
              }

              if (this.changes === 0) {
                if (!finished) {
                  finished = true;

                  return res.status(404).json({
                    success: false,
                    message:
                      `Product ${productId} not found`,
                  });
                }

                return;
              }

              // Save movement

              db.run(
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
                  productId,
                  movementDate,
                  "Stock Adjustment",
                  null,
                  voucherNo,
                  qty,
                  0,
                  remarks,
                  req.user.id,
                ],
                (movementErr) => {
                  if (movementErr) {
                    console.log(
                      "Movement Save Error:",
                      movementErr
                    );
                  }

                  complete();
                }
              );
            }
          );

          return;
        }

        // ==================================================
        // REDUCE STOCK
        // ==================================================

        if (type === "reduce") {
          db.run(
            `
            UPDATE products
            SET stock =
              COALESCE(stock, 0) - ?
            WHERE id = ?
            AND ownerId = ?
            AND COALESCE(stock, 0) >= ?
            `,
            [
              qty,
              productId,
              req.user.id,
              qty,
            ],
            function (err) {
              if (err) {
                console.log(
                  "Stock Reduce Error:",
                  err
                );

                if (!finished) {
                  finished = true;

                  return res.status(500).json({
                    success: false,
                    message:
                      "Error reducing stock",
                    error:
                      err.message,
                  });
                }

                return;
              }

              if (this.changes === 0) {
                if (!finished) {
                  finished = true;

                  return res.status(400).json({
                    success: false,
                    message:
                      `Insufficient stock for product ID ${productId}`,
                  });
                }

                return;
              }

              // Save movement

              db.run(
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
                  productId,
                  movementDate,
                  "Stock Adjustment",
                  null,
                  voucherNo,
                  0,
                  qty,
                  remarks,
                  req.user.id,
                ],
                (movementErr) => {
                  if (movementErr) {
                    console.log(
                      "Movement Save Error:",
                      movementErr
                    );
                  }

                  complete();
                }
              );
            }
          );
        }
      }
    );
  }
);

// ==================================================
// CREATE OPENING STOCK ENTRIES
// ==================================================

router.post(
  "/create-opening-stock",
  authenticate,
  (req, res) => {
    const openingDate =
      req.body.date ||
      new Date()
        .toISOString()
        .split("T")[0];

    db.all(
      `
      SELECT
        id,
        name,
        stock
      FROM products
      WHERE COALESCE(stock, 0) > 0
      AND ownerId = ?
      `,
      [req.user.id],
      (err, products) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            success: false,
            message:
              "Unable to read products",
            error:
              err.message,
          });
        }

        if (
          products.length === 0
        ) {
          return res.json({
            success: true,
            message:
              "No products with opening stock found",
          });
        }

        let completed = 0;
        let skipped = 0;
        let failed = false;

        products.forEach(
          (product) => {
            db.get(
              `
              SELECT id
              FROM stock_movements
              WHERE productId = ?
              AND ownerId = ?
              AND voucherType =
                'Opening Stock'
              LIMIT 1
              `,
              [
                product.id,
                req.user.id,
              ],
              (
                checkErr,
                existing
              ) => {
                if (failed) return;

                if (checkErr) {
                  failed = true;

                  return res.status(500).json({
                    success: false,
                    message:
                      "Unable to check opening stock",
                    error:
                      checkErr.message,
                  });
                }

                if (existing) {
                  skipped++;
                  completed++;

                  if (
                    completed ===
                    products.length
                  ) {
                    res.json({
                      success: true,
                      message:
                        "Opening Stock Process Completed",
                      created:
                        products.length -
                        skipped,
                      skipped,
                    });
                  }

                  return;
                }

                db.run(
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
                    product.id,
                    openingDate,
                    "Opening Stock",
                    null,
                    "OPENING",
                    Number(
                      product.stock
                    ) || 0,
                    0,
                    "Opening Stock",
                    req.user.id,
                  ],
                  (insertErr) => {
                    if (insertErr) {
                      failed = true;

                      console.log(
                        "Opening Stock Error:",
                        insertErr
                      );

                      return res.status(500).json({
                        success: false,
                        message:
                          "Unable to create opening stock",
                        error:
                          insertErr.message,
                      });
                    }

                    completed++;

                    if (
                      completed ===
                      products.length
                    ) {
                      res.json({
                        success: true,
                        message:
                          "Opening Stock Created Successfully",
                        created:
                          products.length -
                          skipped,
                        skipped,
                      });
                    }
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// ==================================================
// EXPORT
// ==================================================

module.exports = router;