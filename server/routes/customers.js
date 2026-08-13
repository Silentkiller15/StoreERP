const express = require("express");
const router = express.Router();

const db = require("../database");

const {
  authenticate,
} = require("./accounts");

// ==================================================
// GET ALL CUSTOMERS
// ==================================================

router.get(
  "/",
  authenticate,
  (req, res) => {
    db.all(
      `
      SELECT *
      FROM customers
      WHERE ownerId = ?
      ORDER BY id DESC
      `,
      [req.user.id],
      (err, rows) => {
        if (err) {
          console.log(
            "Get Customers Error:",
            err
          );

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
// ADD CUSTOMER
// ==================================================

router.post(
  "/",
  authenticate,
  (req, res) => {
    const {
      code,
      name,
      mobile,
      email,
      address,
      gst,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name is required.",
      });
    }

    db.run(
      `
      INSERT INTO customers
      (
        code,
        name,
        mobile,
        email,
        address,
        gst,
        ownerId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        code,
        name,
        mobile,
        email,
        address,
        gst,
        req.user.id,
      ],
      function (err) {
        if (err) {
          console.log(
            "Add Customer Error:",
            err
          );

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
// UPDATE CUSTOMER
// ==================================================

router.put(
  "/:id",
  authenticate,
  (req, res) => {
    const {
      code,
      name,
      mobile,
      email,
      address,
      gst,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name is required.",
      });
    }

    db.run(
      `
      UPDATE customers
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
        req.user.id,
      ],
      function (err) {
        if (err) {
          console.log(
            "Update Customer Error:",
            err
          );

          return res
            .status(500)
            .json(err);
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message:
              "Customer not found.",
          });
        }

        res.json({
          success: true,
          message:
            "Customer updated successfully.",
        });
      }
    );
  }
);

// ==================================================
// DELETE CUSTOMER
// ==================================================

router.delete(
  "/:id",
  authenticate,
  (req, res) => {
    db.run(
      `
      DELETE FROM customers
      WHERE id = ?
      AND ownerId = ?
      `,
      [
        req.params.id,
        req.user.id,
      ],
      function (err) {
        if (err) {
          console.log(
            "Delete Customer Error:",
            err
          );

          return res
            .status(500)
            .json(err);
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message:
              "Customer not found.",
          });
        }

        res.json({
          success: true,
          message:
            "Customer deleted successfully.",
        });
      }
    );
  }
);

// ==================================================
// EXPORT
// ==================================================

module.exports = router;