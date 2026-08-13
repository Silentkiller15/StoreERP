const express = require("express");

const router = express.Router();

const db = require("../database");

const { authenticate } =
  require("./auth");

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
            resolve(rows);
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
// GET OPENING STOCK
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
            os.id,
            os.productId,
            os.openingDate,
            os.qty,
            os.rate,
            os.value,
            os.remarks,

            p.code AS productCode,
            p.name AS productName,
            p.category,
            p.unit

          FROM opening_stock os

          INNER JOIN products p
            ON os.productId =
               p.id

           AND p.ownerId =
               os.ownerId

          WHERE os.ownerId = ?

          ORDER BY
            os.id ASC
          `,
          [ownerId]
        );

      const total =
        rows.reduce(
          (sum, row) =>
            sum +
            (
              Number(
                row.value
              ) || 0
            ),
          0
        );

      res.json({
        success: true,
        rows,
        total,
      });

    } catch (err) {

      console.log(
        "GET OPENING STOCK ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load Opening Stock",
        error:
          err.message,
      });
    }
  }
);

// ==================================================
// SAVE OPENING STOCK
//
// IMPORTANT:
//
// Opening Stock is BOTH:
//
// 1. An accounting opening balance
// 2. Actual physical stock
//
// Therefore we:
// - save opening_stock
// - increase products.stock
// - create stock_movements entry
//
// GST is NOT involved.
// ==================================================

router.post(
  "/",
  authenticate,
  async (req, res) => {

    try {

      const ownerId =
        req.user.id;

      const {
        openingDate,
        items,
      } = req.body;

      // ==================================================
      // VALIDATION
      // ==================================================

      if (!openingDate) {

        return res.status(400).json({
          success: false,
          message:
            "Opening date is required",
        });

      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "At least one Opening Stock item is required",
        });

      }

      // ==================================================
      // CHECK DUPLICATES
      // ==================================================

      const productIds =
        new Set();

      for (
        const item of items
      ) {

        const productId =
          Number(
            item.productId
          );

        const qty =
          Number(
            item.qty
          );

        const rate =
          Number(
            item.rate
          );

        if (!productId) {

          return res.status(400).json({
            success: false,
            message:
              "Product is required",
          });

        }

        if (
          !Number.isFinite(qty) ||
          qty <= 0
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Opening quantity must be greater than zero",
          });

        }

        if (
          !Number.isFinite(rate) ||
          rate < 0
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Opening cost cannot be negative",
          });

        }

        if (
          productIds.has(
            productId
          )
        ) {

          return res.status(400).json({
            success: false,
            message:
              "The same product cannot be entered twice",
          });

        }

        productIds.add(
          productId
        );

        // ==================================================
        // VERIFY PRODUCT
        // ==================================================

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
              productId,
              ownerId,
            ]
          );

        if (!product) {

          return res.status(403).json({
            success: false,
            message:
              "Invalid product selected",
          });

        }

        // ==================================================
        // PREVENT DUPLICATE OPENING
        // ==================================================

        const existing =
          await dbGet(
            `
            SELECT
              id

            FROM opening_stock

            WHERE productId = ?

              AND ownerId = ?

            LIMIT 1
            `,
            [
              productId,
              ownerId,
            ]
          );

        if (existing) {

          return res.status(400).json({
            success: false,
            message:
              `Opening Stock already exists for ${product.name}`,
          });

        }

      }

      // ==================================================
      // SAVE EACH ITEM
      // ==================================================

      for (
        const item of items
      ) {

        const productId =
          Number(
            item.productId
          );

        const qty =
          Number(
            item.qty
          );

        const rate =
          Number(
            item.rate
          ) || 0;

        const value =
          qty * rate;

        // ==================================================
        // INSERT OPENING STOCK
        // ==================================================

        const result =
          await dbRun(
            `
            INSERT INTO opening_stock
            (
              ownerId,
              productId,
              openingDate,
              qty,
              rate,
              value,
              remarks
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
              ownerId,

              productId,

              openingDate,

              qty,

              rate,

              value,

              item.remarks ||
                "Opening Stock",
            ]
          );

        const openingStockId =
          result.lastID;

        // ==================================================
        // UPDATE ACTUAL PRODUCT STOCK
        // ==================================================

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

            productId,

            ownerId,
          ]
        );

        // ==================================================
        // STOCK MOVEMENT
        // ==================================================

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
            productId,

            openingDate,

            "Opening Stock",

            openingStockId,

            `OPEN-${openingStockId}`,

            qty,

            0,

            "Opening Stock",

            ownerId,
          ]
        );
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      res.json({
        success: true,

        message:
          "Opening Stock Saved Successfully",
      });

    } catch (err) {

      console.log(
        "SAVE OPENING STOCK ERROR:",
        err
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to save Opening Stock",

        error:
          err.message,
      });
    }
  }
);

// ==================================================
// DELETE OPENING STOCK
//
// IMPORTANT:
// When opening stock is deleted,
// the quantity is ALSO removed from
// the actual product stock.
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

      if (!id) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid Opening Stock ID",
        });

      }

      // ==================================================
      // FIND ENTRY
      // ==================================================

      const existing =
        await dbGet(
          `
          SELECT
            *

          FROM opening_stock

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
          success: false,
          message:
            "Opening Stock entry not found",
        });

      }

      // ==================================================
      // CHECK CURRENT STOCK
      // ==================================================

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
            existing.productId,
            ownerId,
          ]
        );

      if (!product) {

        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });

      }

      const currentStock =
        Number(
          product.stock
        ) || 0;

      const openingQty =
        Number(
          existing.qty
        ) || 0;

      // ==================================================
      // DON'T ALLOW NEGATIVE STOCK
      // ==================================================

      if (
        currentStock <
        openingQty
      ) {

        return res.status(400).json({
          success: false,

          message:
            `Cannot delete Opening Stock for ${product.name} because current stock (${currentStock}) is less than the opening quantity (${openingQty}).`,
        });

      }

      // ==================================================
      // REMOVE OPENING QUANTITY
      // ==================================================

      await dbRun(
        `
        UPDATE products

        SET stock =
          COALESCE(stock, 0) - ?

        WHERE id = ?

          AND ownerId = ?
        `,
        [
          openingQty,

          existing.productId,

          ownerId,
        ]
      );

      // ==================================================
      // DELETE STOCK MOVEMENT
      // ==================================================

      await dbRun(
        `
        DELETE FROM stock_movements

        WHERE voucherType =
          'Opening Stock'

          AND voucherId = ?

          AND ownerId = ?
        `,
        [
          id,

          ownerId,
        ]
      );

      // ==================================================
      // DELETE OPENING STOCK
      // ==================================================

      await dbRun(
        `
        DELETE FROM opening_stock

        WHERE id = ?

          AND ownerId = ?
        `,
        [
          id,

          ownerId,
        ]
      );

      // ==================================================
      // SUCCESS
      // ==================================================

      res.json({
        success: true,

        message:
          "Opening Stock Deleted Successfully",
      });

    } catch (err) {

      console.log(
        "DELETE OPENING STOCK ERROR:",
        err
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to delete Opening Stock",

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