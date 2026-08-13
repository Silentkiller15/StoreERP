const express = require("express");
const crypto = require("crypto");

const router = express.Router();
const db = require("../database");

// ==================================================
// PASSWORD HASH
// ==================================================

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return `${salt}:${hash}`;
};

// ==================================================
// PASSWORD VERIFY
// ==================================================

const verifyPassword = (
  password,
  storedHash
) => {
  try {
    if (!storedHash) {
      return false;
    }

    const parts =
      storedHash.split(":");

    if (parts.length !== 2) {
      return false;
    }

    const salt = parts[0];
    const originalHash = parts[1];

    const hash = crypto
      .scryptSync(password, salt, 64)
      .toString("hex");

    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(originalHash, "hex")
    );
  } catch (err) {
    return false;
  }
};

// ==================================================
// RECOVERY ANSWER NORMALIZE
// ==================================================

const normalizeAnswer = (
  answer
) => {
  return String(answer || "")
    .trim()
    .toLowerCase();
};

// ==================================================
// CREATE SESSION
// ==================================================

const createSession = (
  userId,
  callback
) => {
  const token =
    crypto.randomBytes(48).toString("hex");

  const expiresAt =
    new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    ).toISOString();

  db.run(
    `
      INSERT INTO sessions
      (
        userId,
        token,
        expiresAt
      )
      VALUES (?, ?, ?)
    `,
    [
      userId,
      token,
      expiresAt,
    ],
    function (err) {
      callback(
        err,
        token,
        expiresAt
      );
    }
  );
};

// ==================================================
// LOGIN
// ==================================================

router.post(
  "/login",
  (req, res) => {
    const {
      username,
      password,
    } = req.body;

    if (
      !username ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Username and password are required.",
      });
    }

    db.get(
      `
        SELECT *
        FROM users
        WHERE LOWER(username) = LOWER(?)
        AND isActive = 1
      `,
      [username.trim()],
      (err, user) => {
        if (err) {
          console.log(
            "Login error:",
            err
          );

          return res.status(500).json({
            message:
              "Database error.",
          });
        }

        if (!user) {
          return res.status(401).json({
            message:
              "Invalid username or password.",
          });
        }

        const valid =
          verifyPassword(
            password,
            user.passwordHash
          );

        if (!valid) {
          return res.status(401).json({
            message:
              "Invalid username or password.",
          });
        }

        createSession(
          user.id,
          (
            sessionErr,
            token,
            expiresAt
          ) => {
            if (sessionErr) {
              console.log(
                "Session error:",
                sessionErr
              );

              return res.status(500).json({
                message:
                  "Unable to create login session.",
              });
            }

            res.json({
              success: true,

              token,

              expiresAt,

              user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
              },
            });
          }
        );
      }
    );
  }
);

// ==================================================
// CREATE ACCOUNT
// ==================================================

router.post(
  "/register",
  (req, res) => {
    const {
      name,
      username,
      password,
      recoveryQuestion,
      recoveryAnswer,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message:
          "Full name is required.",
      });
    }

    if (!username?.trim()) {
      return res.status(400).json({
        message:
          "Username is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        message:
          "Password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters.",
      });
    }

    if (!recoveryQuestion) {
      return res.status(400).json({
        message:
          "Recovery question is required.",
      });
    }

    if (!recoveryAnswer?.trim()) {
      return res.status(400).json({
        message:
          "Recovery answer is required.",
      });
    }

    const passwordHash =
      hashPassword(password);

    const recoveryAnswerHash =
      hashPassword(
        normalizeAnswer(
          recoveryAnswer
        )
      );

    db.run(
      `
        INSERT INTO users
        (
          name,
          username,
          passwordHash,
          recoveryQuestion,
          recoveryAnswerHash,
          role
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        username.trim(),
        passwordHash,
        recoveryQuestion,
        recoveryAnswerHash,
        "User",
      ],
      function (err) {
        if (err) {
          if (
            String(err.message)
              .toLowerCase()
              .includes("unique")
          ) {
            return res.status(409).json({
              message:
                "Username already exists.",
            });
          }

          console.log(
            "Register error:",
            err
          );

          return res.status(500).json({
            message:
              "Unable to create account.",
          });
        }

        res.json({
          success: true,
          message:
            "Account created successfully.",
          userId: this.lastID,
        });
      }
    );
  }
);

// ==================================================
// FORGOT PASSWORD - GET RECOVERY QUESTION
// ==================================================

router.post(
  "/forgot-question",
  (req, res) => {
    const {
      username,
    } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({
        message:
          "Username is required.",
      });
    }

    db.get(
      `
        SELECT
          id,
          username,
          recoveryQuestion
        FROM users
        WHERE LOWER(username) = LOWER(?)
        AND isActive = 1
      `,
      [username.trim()],
      (err, user) => {
        if (err) {
          return res.status(500).json({
            message:
              "Database error.",
          });
        }

        if (
          !user ||
          !user.recoveryQuestion
        ) {
          return res.status(404).json({
            message:
              "No recovery information found for this account.",
          });
        }

        res.json({
          success: true,
          question:
            user.recoveryQuestion,
        });
      }
    );
  }
);

// ==================================================
// FORGOT PASSWORD - RESET
// ==================================================

router.post(
  "/forgot-password",
  (req, res) => {
    const {
      username,
      recoveryAnswer,
      newPassword,
    } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({
        message:
          "Username is required.",
      });
    }

    if (!recoveryAnswer?.trim()) {
      return res.status(400).json({
        message:
          "Recovery answer is required.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        message:
          "New password is required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must contain at least 6 characters.",
      });
    }

    db.get(
      `
        SELECT *
        FROM users
        WHERE LOWER(username) = LOWER(?)
        AND isActive = 1
      `,
      [username.trim()],
      (err, user) => {
        if (err) {
          return res.status(500).json({
            message:
              "Database error.",
          });
        }

        if (!user) {
          return res.status(404).json({
            message:
              "Account not found.",
          });
        }

        if (
          !user.recoveryAnswerHash
        ) {
          return res.status(400).json({
            message:
              "Recovery information has not been configured for this account.",
          });
        }

        const valid =
          verifyPassword(
            normalizeAnswer(
              recoveryAnswer
            ),
            user.recoveryAnswerHash
          );

        if (!valid) {
          return res.status(401).json({
            message:
              "Incorrect recovery answer.",
          });
        }

        const passwordHash =
          hashPassword(
            newPassword
          );

        db.run(
          `
            UPDATE users
            SET passwordHash = ?
            WHERE id = ?
          `,
          [
            passwordHash,
            user.id,
          ],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({
                message:
                  "Unable to reset password.",
              });
            }

            // Invalidate existing sessions
            db.run(
              `
                DELETE FROM sessions
                WHERE userId = ?
              `,
              [user.id]
            );

            res.json({
              success: true,
              message:
                "Password reset successfully.",
            });
          }
        );
      }
    );
  }
);

// ==================================================
// CHANGE PASSWORD
// ==================================================

router.post(
  "/change-password",
  authenticate,
  (req, res) => {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const userId = req.user.id;

    if (!currentPassword) {
      return res.status(400).json({
        message:
          "Current password is required.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        message:
          "New password is required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must contain at least 6 characters.",
      });
    }

    db.get(
      `
        SELECT *
        FROM users
        WHERE id = ?
        AND isActive = 1
      `,
      [userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({
            message:
              "Database error.",
          });
        }

        if (!user) {
          return res.status(404).json({
            message:
              "User not found.",
          });
        }

        if (
          !verifyPassword(
            currentPassword,
            user.passwordHash
          )
        ) {
          return res.status(401).json({
            message:
              "Current password is incorrect.",
          });
        }

        const passwordHash =
          hashPassword(
            newPassword
          );

        db.run(
          `
            UPDATE users
            SET passwordHash = ?
            WHERE id = ?
          `,
          [
            passwordHash,
            userId,
          ],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({
                message:
                  "Unable to change password.",
              });
            }

            db.run(
              `
                DELETE FROM sessions
                WHERE userId = ?
              `,
              [userId]
            );

            res.json({
              success: true,
              message:
                "Password changed successfully.",
            });
          }
        );
      }
    );
  }
);

// ==================================================
// LOGOUT
// ==================================================

router.post(
  "/logout",
  (req, res) => {
    const auth =
      req.headers.authorization || "";

    const token =
      auth.startsWith("Bearer ")
        ? auth.substring(7)
        : "";

    if (!token) {
      return res.json({
        success: true,
      });
    }

    db.run(
      `
        DELETE FROM sessions
        WHERE token = ?
      `,
      [token],
      () => {
        res.json({
          success: true,
          message:
            "Logged out successfully.",
        });
      }
    );
  }
);

// ==================================================
// AUTH MIDDLEWARE
// ==================================================

function authenticate(
  req,
  res,
  next
) {
  const auth =
    req.headers.authorization || "";

  const token =
    auth.startsWith("Bearer ")
      ? auth.substring(7)
      : "";

  if (!token) {
    return res.status(401).json({
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
        return res.status(500).json({
          message:
            "Authentication error.",
        });
      }

      if (!session) {
        return res.status(401).json({
          message:
            "Session expired. Please login again.",
        });
      }

      req.user = {
        id: session.userId,
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
// CURRENT USER
// ==================================================

router.get(
  "/me",
  authenticate,
  (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);

// ==================================================

module.exports = {
  router,
  authenticate,
};