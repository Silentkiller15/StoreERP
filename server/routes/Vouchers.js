const express = require("express");
const router = express.Router();
const db = require("../database");

// ==================================================
// AUTHENTICATION
// ==================================================

const authenticate = (req, res, next) => {
  const auth =
    req.headers.authorization || "";

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
      ON users.id = sessions.userId

    WHERE sessions.token = ?
      AND sessions.expiresAt > datetime('now')
      AND users.isActive = 1
    `,
    [token],
    (err, session) => {
      if (err) {
        console.log(
          "Voucher Authentication Error:",
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
        id: session.userId,
        username:
          session.username,
        name: session.name,
        role: session.role,
      };

      next();
    }
  );
};

// ==================================================
// GET ALL VOUCHERS
// CURRENT USER ONLY
// ==================================================

router.get(
  "/",
  authenticate,
  (req, res) => {
    db.all(
      `
      SELECT
        vouchers.*,

        debitAccount.name
          AS debitAccountName,

        creditAccount.name
          AS creditAccountName

      FROM vouchers

      LEFT JOIN accounts AS debitAccount
        ON vouchers.debitAccountId =
           debitAccount.id
       AND debitAccount.ownerId =
           vouchers.ownerId

      LEFT JOIN accounts AS creditAccount
        ON vouchers.creditAccountId =
           creditAccount.id
       AND creditAccount.ownerId =
           vouchers.ownerId

      WHERE vouchers.ownerId = ?

      ORDER BY
        vouchers.id DESC
      `,
      [req.user.id],
      (err, rows) => {
        if (err) {
          console.log(
            "Get Vouchers Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to load vouchers",
            error: err.message,
          });
        }

        res.json(rows || []);
      }
    );
  }
);

// ==================================================
// GET SINGLE VOUCHER
// CURRENT USER ONLY
// ==================================================

router.get(
  "/:id",
  authenticate,
  (req, res) => {
    db.get(
      `
      SELECT
        vouchers.*,

        debitAccount.name
          AS debitAccountName,

        creditAccount.name
          AS creditAccountName

      FROM vouchers

      LEFT JOIN accounts AS debitAccount
        ON vouchers.debitAccountId =
           debitAccount.id
       AND debitAccount.ownerId =
           vouchers.ownerId

      LEFT JOIN accounts AS creditAccount
        ON vouchers.creditAccountId =
           creditAccount.id
       AND creditAccount.ownerId =
           vouchers.ownerId

      WHERE vouchers.id = ?
        AND vouchers.ownerId = ?
      `,
      [
        req.params.id,
        req.user.id,
      ],
      (err, row) => {
        if (err) {
          console.log(
            "Get Voucher Error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to load voucher",
            error: err.message,
          });
        }

        if (!row) {
          return res.status(404).json({
            success: false,
            message:
              "Voucher Not Found",
          });
        }

        res.json(row);
      }
    );
  }
);

// ==================================================
// SAVE VOUCHER
// ==================================================

router.post(
  "/",
  authenticate,
  (req, res) => {
    const ownerId =
      req.user.id;

    const {
      voucherNo,
      voucherType,
      voucherDate,
      partyName,
      amount,
      remarks,
      debitAccountId,
      creditAccountId,
    } = req.body;

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!voucherNo) {
      return res.status(400).json({
        success: false,
        message:
          "Voucher number is required",
      });
    }

    if (!voucherType) {
      return res.status(400).json({
        success: false,
        message:
          "Voucher type is required",
      });
    }

    if (!voucherDate) {
      return res.status(400).json({
        success: false,
        message:
          "Voucher date is required",
      });
    }

    if (
      !partyName ||
      !partyName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Party / Account Name is required",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid amount is required",
      });
    }

    if (!debitAccountId) {
      return res.status(400).json({
        success: false,
        message:
          "Please select Debit Account",
      });
    }

    if (!creditAccountId) {
      return res.status(400).json({
        success: false,
        message:
          "Please select Credit Account",
      });
    }

    if (
      Number(debitAccountId) ===
      Number(creditAccountId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Debit and Credit accounts cannot be the same",
      });
    }

    // ----------------------------------------------
    // VERIFY DEBIT ACCOUNT BELONGS TO USER
    // ----------------------------------------------

    db.get(
      `
      SELECT id
      FROM accounts
      WHERE id = ?
        AND ownerId = ?
      `,
      [
        Number(debitAccountId),
        ownerId,
      ],
      (debitCheckErr, debitAccount) => {
        if (debitCheckErr) {
          return res.status(500).json({
            success: false,
            message:
              "Unable to verify Debit Account",
            error:
              debitCheckErr.message,
          });
        }

        if (!debitAccount) {
          return res.status(403).json({
            success: false,
            message:
              "Debit Account does not belong to the current user.",
          });
        }

        // ------------------------------------------
        // VERIFY CREDIT ACCOUNT
        // ------------------------------------------

        db.get(
          `
          SELECT id
          FROM accounts
          WHERE id = ?
            AND ownerId = ?
          `,
          [
            Number(creditAccountId),
            ownerId,
          ],
          (
            creditCheckErr,
            creditAccount
          ) => {
            if (creditCheckErr) {
              return res.status(500).json({
                success: false,
                message:
                  "Unable to verify Credit Account",
                error:
                  creditCheckErr.message,
              });
            }

            if (!creditAccount) {
              return res.status(403).json({
                success: false,
                message:
                  "Credit Account does not belong to the current user.",
              });
            }

            // ----------------------------------------
            // SAVE VOUCHER
            // ----------------------------------------

            db.run(
              `
              INSERT INTO vouchers
              (
                voucherNo,
                voucherType,
                voucherDate,
                partyName,
                amount,
                remarks,
                debitAccountId,
                creditAccountId,
                ownerId
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `,
              [
                voucherNo,
                voucherType,
                voucherDate,
                partyName.trim(),
                Number(amount),
                remarks || "",
                Number(debitAccountId),
                Number(creditAccountId),
                ownerId,
              ],
              function (err) {
                if (err) {
                  console.log(
                    "Save Voucher Error:",
                    err
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      "Unable to save voucher",
                    error:
                      err.message,
                  });
                }

                const voucherId =
                  this.lastID;

                // ----------------------------------
                // DEBIT LEDGER
                // ----------------------------------

                db.run(
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
                    voucherDate,
                    voucherType,
                    voucherId,
                    voucherNo,
                    Number(
                      debitAccountId
                    ),
                    Number(amount),
                    0,
                    remarks ||
                      partyName,
                    ownerId,
                  ],
                  (debitErr) => {
                    if (debitErr) {
                      console.log(
                        "Debit Ledger Error:",
                        debitErr
                      );

                      return res.status(500).json({
                        success: false,
                        message:
                          "Voucher saved but Debit ledger entry failed",
                        error:
                          debitErr.message,
                      });
                    }

                    // ------------------------------
                    // CREDIT LEDGER
                    // ------------------------------

                    db.run(
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
                        voucherDate,
                        voucherType,
                        voucherId,
                        voucherNo,
                        Number(
                          creditAccountId
                        ),
                        0,
                        Number(amount),
                        remarks ||
                          partyName,
                        ownerId,
                      ],
                      (creditErr) => {
                        if (creditErr) {
                          console.log(
                            "Credit Ledger Error:",
                            creditErr
                          );

                          return res.status(500).json({
                            success: false,
                            message:
                              "Voucher saved but Credit ledger entry failed",
                            error:
                              creditErr.message,
                          });
                        }

                        res.json({
                          success: true,
                          voucherId,
                          message:
                            "Voucher Saved Successfully",
                        });
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
  }
);

// ==================================================
// UPDATE VOUCHER
// CURRENT USER ONLY
// ==================================================

router.put(
  "/:id",
  authenticate,
  (req, res) => {
    const voucherId =
      Number(req.params.id);

    const ownerId =
      req.user.id;

    const {
      voucherType,
      voucherDate,
      partyName,
      amount,
      remarks,
      debitAccountId,
      creditAccountId,
    } = req.body;

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!voucherType) {
      return res.status(400).json({
        success: false,
        message:
          "Voucher type is required",
      });
    }

    if (!voucherDate) {
      return res.status(400).json({
        success: false,
        message:
          "Voucher date is required",
      });
    }

    if (
      !partyName ||
      !partyName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Party / Account Name is required",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid amount is required",
      });
    }

    if (!debitAccountId) {
      return res.status(400).json({
        success: false,
        message:
          "Please select Debit Account",
      });
    }

    if (!creditAccountId) {
      return res.status(400).json({
        success: false,
        message:
          "Please select Credit Account",
      });
    }

    if (
      Number(debitAccountId) ===
      Number(creditAccountId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Debit and Credit accounts cannot be the same",
      });
    }

    // ----------------------------------------------
    // VERIFY VOUCHER BELONGS TO USER
    // ----------------------------------------------

    db.get(
      `
      SELECT id
      FROM vouchers
      WHERE id = ?
        AND ownerId = ?
      `,
      [
        voucherId,
        ownerId,
      ],
      (voucherCheckErr, voucher) => {
        if (voucherCheckErr) {
          return res.status(500).json({
            success: false,
            message:
              "Unable to verify voucher",
            error:
              voucherCheckErr.message,
          });
        }

        if (!voucher) {
          return res.status(404).json({
            success: false,
            message:
              "Voucher Not Found",
          });
        }

        // ------------------------------------------
        // VERIFY ACCOUNTS
        // ------------------------------------------

        db.get(
          `
          SELECT id
          FROM accounts
          WHERE id = ?
            AND ownerId = ?
          `,
          [
            Number(debitAccountId),
            ownerId,
          ],
          (debitErr, debitAccount) => {
            if (debitErr) {
              return res.status(500).json({
                success: false,
                message:
                  "Unable to verify Debit Account",
                error:
                  debitErr.message,
              });
            }

            if (!debitAccount) {
              return res.status(403).json({
                success: false,
                message:
                  "Debit Account does not belong to the current user.",
              });
            }

            db.get(
              `
              SELECT id
              FROM accounts
              WHERE id = ?
                AND ownerId = ?
              `,
              [
                Number(
                  creditAccountId
                ),
                ownerId,
              ],
              (
                creditErr,
                creditAccount
              ) => {
                if (creditErr) {
                  return res.status(500).json({
                    success: false,
                    message:
                      "Unable to verify Credit Account",
                    error:
                      creditErr.message,
                  });
                }

                if (!creditAccount) {
                  return res.status(403).json({
                    success: false,
                    message:
                      "Credit Account does not belong to the current user.",
                  });
                }

                // ----------------------------------
                // UPDATE VOUCHER
                // ----------------------------------

                db.run(
                  `
                  UPDATE vouchers
                  SET
                    voucherType = ?,
                    voucherDate = ?,
                    partyName = ?,
                    amount = ?,
                    remarks = ?,
                    debitAccountId = ?,
                    creditAccountId = ?
                  WHERE id = ?
                    AND ownerId = ?
                  `,
                  [
                    voucherType,
                    voucherDate,
                    partyName.trim(),
                    Number(amount),
                    remarks || "",
                    Number(
                      debitAccountId
                    ),
                    Number(
                      creditAccountId
                    ),
                    voucherId,
                    ownerId,
                  ],
                  function (err) {
                    if (err) {
                      console.log(
                        "Update Voucher Error:",
                        err
                      );

                      return res.status(500).json({
                        success: false,
                        message:
                          "Unable to update voucher",
                        error:
                          err.message,
                      });
                    }

                    if (
                      this.changes ===
                      0
                    ) {
                      return res.status(404).json({
                        success: false,
                        message:
                          "Voucher Not Found",
                      });
                    }

                    // ------------------------------
                    // DELETE OLD LEDGER
                    // ------------------------------

                    db.run(
                      `
                      DELETE FROM account_transactions
                      WHERE voucherId = ?
                        AND ownerId = ?
                      `,
                      [
                        voucherId,
                        ownerId,
                      ],
                      (deleteErr) => {
                        if (deleteErr) {
                          return res.status(500).json({
                            success: false,
                            message:
                              "Unable to update ledger entries",
                            error:
                              deleteErr.message,
                          });
                        }

                        // ----------------------------
                        // NEW DEBIT ENTRY
                        // ----------------------------

                        db.run(
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
                          SELECT
                            voucherDate,
                            voucherType,
                            id,
                            voucherNo,
                            ?,
                            ?,
                            0,
                            ?,
                            ?
                          FROM vouchers
                          WHERE id = ?
                            AND ownerId = ?
                          `,
                          [
                            Number(
                              debitAccountId
                            ),
                            Number(amount),
                            remarks ||
                              partyName,
                            ownerId,
                            voucherId,
                            ownerId,
                          ],
                          (newDebitErr) => {
                            if (newDebitErr) {
                              return res.status(500).json({
                                success: false,
                                message:
                                  "Unable to create Debit entry",
                                error:
                                  newDebitErr.message,
                              });
                            }

                            // --------------------------
                            // NEW CREDIT ENTRY
                            // --------------------------

                            db.run(
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
                              SELECT
                                voucherDate,
                                voucherType,
                                id,
                                voucherNo,
                                ?,
                                0,
                                ?,
                                ?,
                                ?
                              FROM vouchers
                              WHERE id = ?
                                AND ownerId = ?
                              `,
                              [
                                Number(
                                  creditAccountId
                                ),
                                Number(amount),
                                remarks ||
                                  partyName,
                                ownerId,
                                voucherId,
                                ownerId,
                              ],
                              (newCreditErr) => {
                                if (
                                  newCreditErr
                                ) {
                                  return res.status(500).json({
                                    success: false,
                                    message:
                                      "Unable to create Credit entry",
                                    error:
                                      newCreditErr.message,
                                  });
                                }

                                res.json({
                                  success: true,
                                  message:
                                    "Voucher Updated Successfully",
                                });
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
          }
        );
      }
    );
  }
);

// ==================================================
// DELETE VOUCHER
// CURRENT USER ONLY
// ==================================================

router.delete(
  "/:id",
  authenticate,
  (req, res) => {
    const voucherId =
      Number(req.params.id);

    const ownerId =
      req.user.id;

    // ----------------------------------------------
    // CHECK VOUCHER
    // ----------------------------------------------

    db.get(
      `
      SELECT id
      FROM vouchers
      WHERE id = ?
        AND ownerId = ?
      `,
      [
        voucherId,
        ownerId,
      ],
      (checkErr, voucher) => {
        if (checkErr) {
          return res.status(500).json({
            success: false,
            message:
              "Unable to verify voucher",
            error:
              checkErr.message,
          });
        }

        if (!voucher) {
          return res.status(404).json({
            success: false,
            message:
              "Voucher Not Found",
          });
        }

        // ------------------------------------------
        // DELETE LEDGER ENTRIES
        // ------------------------------------------

        db.run(
          `
          DELETE FROM account_transactions
          WHERE voucherId = ?
            AND ownerId = ?
          `,
          [
            voucherId,
            ownerId,
          ],
          (ledgerErr) => {
            if (ledgerErr) {
              console.log(
                "Delete Ledger Error:",
                ledgerErr
              );

              return res.status(500).json({
                success: false,
                message:
                  "Unable to delete ledger entries",
                error:
                  ledgerErr.message,
              });
            }

            // --------------------------------------
            // DELETE VOUCHER
            // --------------------------------------

            db.run(
              `
              DELETE FROM vouchers
              WHERE id = ?
                AND ownerId = ?
              `,
              [
                voucherId,
                ownerId,
              ],
              function (voucherErr) {
                if (voucherErr) {
                  console.log(
                    "Delete Voucher Error:",
                    voucherErr
                  );

                  return res.status(500).json({
                    success: false,
                    message:
                      "Unable to delete voucher",
                    error:
                      voucherErr.message,
                  });
                }

                if (
                  this.changes ===
                  0
                ) {
                  return res.status(404).json({
                    success: false,
                    message:
                      "Voucher Not Found",
                  });
                }

                res.json({
                  success: true,
                  message:
                    "Voucher Deleted Successfully",
                });
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