const express = require("express");
const router = express.Router();
const db = require("../database");
const { authenticate } = require("./auth");

// ===========================
// GET COMPANY
// CURRENT USER ONLY
// ===========================
router.get("/", authenticate, (req, res) => {
  db.get(
    `
    SELECT *
    FROM company
    WHERE ownerId = ?
    ORDER BY id ASC
    LIMIT 1
    `,
    [req.user.id],
    (err, row) => {
      if (err) {
        console.log("Load Company Error:", err);
        return res.status(500).json({
          success: false,
          message: "Unable to load company details.",
        });
      }

      res.json(row || {});
    }
  );
});

// ===========================
// SAVE / UPDATE COMPANY
// CURRENT USER ONLY
// ===========================
router.post("/", authenticate, (req, res) => {
  const ownerId = req.user.id;

  const {
    name,
    address,
    phone,
    email,
    gstin,
    logo,
  } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({
      success: false,
      message: "Company name is required.",
    });
  }

  db.get(
    `
    SELECT id
    FROM company
    WHERE ownerId = ?
    ORDER BY id ASC
    LIMIT 1
    `,
    [ownerId],
    (err, row) => {
      if (err) {
        console.log("Company lookup error:", err);
        return res.status(500).json({
          success: false,
          message: "Unable to save company details.",
        });
      }

      const values = [
        String(name).trim(),
        address || "",
        phone || "",
        email || "",
        gstin || "",
        logo || "",
      ];

      if (row) {
        db.run(
          `
          UPDATE company
          SET
            name = ?,
            address = ?,
            phone = ?,
            email = ?,
            gstin = ?,
            logo = ?
          WHERE id = ?
            AND ownerId = ?
          `,
          [
            ...values,
            row.id,
            ownerId,
          ],
          function (updateErr) {
            if (updateErr) {
              console.log("Company update error:", updateErr);
              return res.status(500).json({
                success: false,
                message: "Unable to update company details.",
              });
            }

            res.json({
              success: true,
              message: "Company Updated Successfully",
            });
          }
        );
      } else {
        db.run(
          `
          INSERT INTO company
          (
            name,
            address,
            phone,
            email,
            gstin,
            logo,
            ownerId
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            ...values,
            ownerId,
          ],
          function (insertErr) {
            if (insertErr) {
              console.log("Company insert error:", insertErr);
              return res.status(500).json({
                success: false,
                message: "Unable to save company details.",
              });
            }

            res.json({
              success: true,
              message: "Company Saved Successfully",
              companyId: this.lastID,
            });
          }
        );
      }
    }
  );
});

module.exports = router;
