const express = require("express");
const router = express.Router();
const db = require("../database");

const { authenticate } = require("./auth");

// ==================================================
// CREATE SUPPLIERS TABLE
// ==================================================
db.run(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER,
    code TEXT,
    name TEXT,
    mobile TEXT,
    email TEXT,
    address TEXT,
    gst TEXT
  )
`);

// ==================================================
// ADD ownerId TO EXISTING SUPPLIERS TABLE
// ==================================================
db.all(
  `PRAGMA table_info(suppliers)`,
  [],
  (err, columns) => {
    if (err) {
      console.log(
        "Supplier column check error:",
        err.message
      );
      return;
    }

    const exists = columns.some(
      (column) => column.name === "ownerId"
    );

    if (!exists) {
      db.run(
        `ALTER TABLE suppliers ADD COLUMN ownerId INTEGER`,
        (alterErr) => {
          if (alterErr) {
            console.log(
              "Supplier ownerId error:",
              alterErr.message
            );
          } else {
            console.log(
              "✅ ownerId added to suppliers"
            );
          }
        }
      );
    }
  }
);

// ==================================================
// GET ALL SUPPLIERS
// ==================================================
router.get(
  "/",
  authenticate,
  (req, res) => {
    const ownerId = req.user.id;

    db.all(
      `
      SELECT *
      FROM suppliers
      WHERE ownerId = ?
      ORDER BY id DESC
      `,
      [ownerId],
      (err, rows) => {
        if (err) {
          console.log(
            "Get Suppliers Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message: "Unable to load suppliers",
            error: err.message,
          });
        }

        res.json(rows);
      }
    );
  }
);

// ==================================================
// ADD SUPPLIER
// ==================================================
router.post(
  "/",
  authenticate,
  (req, res) => {
    const ownerId = req.user.id;

    const {
      code,
      name,
      mobile,
      email,
      address,
      gst,
    } = req.body;

    db.run(
      `
      INSERT INTO suppliers
      (
        ownerId,
        code,
        name,
        mobile,
        email,
        address,
        gst
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ownerId,
        code,
        name,
        mobile,
        email,
        address,
        gst,
      ],
      function (err) {
        if (err) {
          console.log(
            "Add Supplier Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message: "Unable to add supplier",
            error: err.message,
          });
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
// UPDATE SUPPLIER
// ==================================================
router.put(
  "/:id",
  authenticate,
  (req, res) => {
    const ownerId = req.user.id;

    const {
      code,
      name,
      mobile,
      email,
      address,
      gst,
    } = req.body;

    db.run(
      `
      UPDATE suppliers
      SET
        code = ?,
        name = ?,
        mobile = ?,
        email = ?,
        address = ?,
        gst = ?
      WHERE id = ?
      AND ownerId = ?
      `,
      [
        code,
        name,
        mobile,
        email,
        address,
        gst,
        req.params.id,
        ownerId,
      ],
      function (err) {
        if (err) {
          console.log(
            "Update Supplier Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message: "Unable to update supplier",
            error: err.message,
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "Supplier not found",
          });
        }

        res.json({
          success: true,
        });
      }
    );
  }
);

// ==================================================
// DELETE SUPPLIER
// ==================================================
router.delete(
  "/:id",
  authenticate,
  (req, res) => {
    const ownerId = req.user.id;

    db.run(
      `
      DELETE FROM suppliers
      WHERE id = ?
      AND ownerId = ?
      `,
      [
        req.params.id,
        ownerId,
      ],
      function (err) {
        if (err) {
          console.log(
            "Delete Supplier Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message: "Unable to delete supplier",
            error: err.message,
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "Supplier not found",
          });
        }

        res.json({
          success: true,
        });
      }
    );
  }
);

module.exports = router;