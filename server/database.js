const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "./store.db",
  (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(
        "✅ Connected to SQLite Database"
      );
    }
  }
);

// ==================================================
// DATABASE
// ==================================================

db.serialize(() => {

  // ==================================================
// OPENING STOCK
// ==================================================

db.run(`
  CREATE TABLE IF NOT EXISTS opening_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    openingDate TEXT NOT NULL,
    qty REAL DEFAULT 0,
    rate REAL DEFAULT 0,
    value REAL DEFAULT 0,
    remarks TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

  // ==================================================
  // PRODUCTS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      code TEXT,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT,
      purchase REAL DEFAULT 0,
      selling REAL DEFAULT 0,
      gst REAL DEFAULT 0,
      stock REAL DEFAULT 0
    )
  `);

  // ==================================================
  // VOUCHERS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      voucherNo TEXT,
      voucherType TEXT,
      voucherDate TEXT,
      partyName TEXT,
      amount REAL,
      remarks TEXT,
      debitAccountId INTEGER,
      creditAccountId INTEGER
    )
  `);

  // ==================================================
  // VOUCHER ALLOCATIONS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS voucher_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voucherId INTEGER NOT NULL,
      saleId INTEGER,
      purchaseId INTEGER,
      amount REAL NOT NULL DEFAULT 0,
      allocationDate TEXT NOT NULL,
      remarks TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      ownerId INTEGER
    )
  `);

  // ==================================================
  // CUSTOMERS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
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
  // SUPPLIERS
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
  // PURCHASES
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      purchaseNo TEXT,
      supplierId INTEGER,
      purchaseDate TEXT,
      paymentMode TEXT DEFAULT 'Cash',
      total REAL,
      gst REAL,
      grandTotal REAL
    )
  `);

  // ==================================================
  // PURCHASE ITEMS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      purchaseId INTEGER,
      productId INTEGER,
      qty REAL,
      rate REAL,
      gst REAL,
      total REAL
    )
  `);

  // ==================================================
  // SALES
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      saleNo TEXT,
      customerId INTEGER,
      saleDate TEXT,
      paymentMode TEXT DEFAULT 'Cash',
      total REAL,
      gst REAL,
      grandTotal REAL
    )
  `);

  // ==================================================
  // SALE ITEMS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      saleId INTEGER,
      productId INTEGER,
      qty REAL,
      rate REAL,
      gst REAL,
      total REAL
    )
  `);

  // ==================================================
  // STOCK MOVEMENTS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      productId INTEGER NOT NULL,
      movementDate TEXT NOT NULL,
      voucherType TEXT NOT NULL,
      voucherId INTEGER,
      voucherNo TEXT,
      qtyIn REAL DEFAULT 0,
      qtyOut REAL DEFAULT 0,
      remarks TEXT
    )
  `);

  // ==================================================
  // ACCOUNT GROUPS
  // ==================================================
  // These are common ERP master groups.
  // They are intentionally shared.
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS account_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      parentId INTEGER,
      nature TEXT
    )
  `);

  // ==================================================
  // ACCOUNTS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      code TEXT,
      name TEXT NOT NULL,
      groupId INTEGER,
      openingBalance REAL DEFAULT 0,
      openingType TEXT DEFAULT 'Debit',
      isActive INTEGER DEFAULT 1
    )
  `);

  // ==================================================
  // ACCOUNT TRANSACTIONS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS account_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      transactionDate TEXT NOT NULL,
      voucherType TEXT NOT NULL,
      voucherId INTEGER,
      voucherNo TEXT,
      accountId INTEGER NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      narration TEXT
    )
  `);

  // ==================================================
  // COMPANY
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS company (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      name TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      gstin TEXT,
      logo TEXT
    )
  `);

  // ==================================================
  // USERS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      recoveryQuestion TEXT,
      recoveryAnswerHash TEXT,
      role TEXT DEFAULT 'User',
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==================================================
  // LOGIN SESSIONS
  // ==================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      expiresAt TEXT NOT NULL,
      FOREIGN KEY (userId)
        REFERENCES users(id)
    )
  `);

  // ==================================================
  // DEFAULT ACCOUNT GROUPS
  // ==================================================

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Assets', NULL, 'Asset')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Current Assets', NULL, 'Asset')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Cash-in-Hand', NULL, 'Asset')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Bank Accounts', NULL, 'Asset')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Liabilities', NULL, 'Liability')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Current Liabilities', NULL, 'Liability')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Income', NULL, 'Income')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Sales Accounts', NULL, 'Income')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Expenses', NULL, 'Expense')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Purchase Accounts', NULL, 'Expense')
  `);

  db.run(`
    INSERT OR IGNORE INTO account_groups
    (name, parentId, nature)
    VALUES
    ('Capital Account', NULL, 'Capital')
  `);

  // ==================================================
  // MIGRATION
  // ==================================================

  const ownerTables = [
    "products",
    "customers",
    "suppliers",
    "purchases",
    "purchase_items",
    "sales",
    "sale_items",
    "vouchers",
    "stock_movements",
    "accounts",
    "account_transactions",
    "company",
    "voucher_allocations",
  ];

  // --------------------------------------------------
  // Add ownerId to existing tables one by one.
  // --------------------------------------------------

  const migrateOwnerColumns = (index = 0) => {

    if (index >= ownerTables.length) {
      console.log(
        "✅ All ownerId columns checked"
      );

      // After every ownerId column exists,
      // assign old data to the first user.
      assignOldData();

      return;
    }

    const table = ownerTables[index];

    db.all(
      `PRAGMA table_info(${table})`,
      [],
      (err, columns) => {

        if (err) {
          console.log(
            `❌ ${table} column check error:`,
            err.message
          );

          migrateOwnerColumns(index + 1);

          return;
        }

        const hasOwnerId =
          columns.some(
            (column) =>
              column.name === "ownerId"
          );

        if (hasOwnerId) {

          console.log(
            `✅ ${table} already has ownerId`
          );

          migrateOwnerColumns(index + 1);

          return;
        }

        db.run(
          `
          ALTER TABLE ${table}
          ADD COLUMN ownerId INTEGER
          `,
          (alterErr) => {

            if (alterErr) {

              console.log(
                `❌ Unable to add ownerId to ${table}:`,
                alterErr.message
              );

            } else {

              console.log(
                `✅ ownerId added to ${table}`
              );
            }

            migrateOwnerColumns(index + 1);
          }
        );
      }
    );
  };

  // ==================================================
  // ASSIGN EXISTING DATA TO ADMIN / FIRST USER
  // ==================================================

  const assignOldData = () => {

    db.get(
      `
      SELECT id
      FROM users
      ORDER BY id ASC
      LIMIT 1
      `,
      [],
      (err, user) => {

        if (err) {

          console.log(
            "❌ User lookup error:",
            err.message
          );

          return;
        }

        if (!user) {

          console.log(
            "ℹ️ No user exists yet."
          );

          console.log(
            "ℹ️ Existing ERP data will remain unassigned until an Admin user exists."
          );

          return;
        }

        const ownerId = user.id;

        console.log(
          `🔐 Assigning old ERP data to user ID ${ownerId}`
        );

        const tables = [
          "products",
          "customers",
          "suppliers",
          "purchases",
          "purchase_items",
          "sales",
          "sale_items",
          "vouchers",
          "stock_movements",
          "accounts",
          "account_transactions",
          "company",
        ];

        const assignTable = (index = 0) => {

          if (index >= tables.length) {

            console.log(
              `✅ Existing ERP data assigned to user ID ${ownerId}`
            );

            console.log(
              "✅ Database initialization completed"
            );

            return;
          }

          const table = tables[index];

          db.run(
            `
            UPDATE ${table}
            SET ownerId = ?
            WHERE ownerId IS NULL
            `,
            [ownerId],
            function (updateErr) {

              if (updateErr) {

                console.log(
                  `❌ ${table} owner migration error:`,
                  updateErr.message
                );

              } else {

                console.log(
                  `✅ ${table}: ${this.changes} old records assigned to user ${ownerId}`
                );
              }

              assignTable(index + 1);
            }
          );
        };

        assignTable();
      }
    );
  };

  // ==================================================
  // PURCHASE PAYMENT MODE MIGRATION
  // ==================================================

  db.all(
    `PRAGMA table_info(purchases)`,
    [],
    (err, columns) => {

      if (err) {

        console.log(
          "Purchase column check error:",
          err.message
        );

        return;
      }

      const exists =
        columns.some(
          (column) =>
            column.name ===
            "paymentMode"
        );

      if (!exists) {

        db.run(
          `
          ALTER TABLE purchases
          ADD COLUMN paymentMode TEXT
          DEFAULT 'Cash'
          `,
          (alterErr) => {

            if (alterErr) {

              console.log(
                "Purchase paymentMode error:",
                alterErr.message
              );

            } else {

              console.log(
                "✅ paymentMode added to purchases"
              );
            }
          }
        );
      }
    }
  );

  // ==================================================
  // SALES PAYMENT MODE MIGRATION
  // ==================================================

  db.all(
    `PRAGMA table_info(sales)`,
    [],
    (err, columns) => {

      if (err) {

        console.log(
          "Sales column check error:",
          err.message
        );

        return;
      }

      const exists =
        columns.some(
          (column) =>
            column.name ===
            "paymentMode"
        );

      if (!exists) {

        db.run(
          `
          ALTER TABLE sales
          ADD COLUMN paymentMode TEXT
          DEFAULT 'Cash'
          `,
          (alterErr) => {

            if (alterErr) {

              console.log(
                "Sales paymentMode error:",
                alterErr.message
              );

            } else {

              console.log(
                "✅ paymentMode added to sales"
              );
            }
          }
        );
      }
    }
  );

  // ==================================================
  // VOUCHER ACCOUNT COLUMNS
  // ==================================================

  db.all(
    `PRAGMA table_info(vouchers)`,
    [],
    (err, columns) => {

      if (err) {

        console.log(
          "Voucher column check error:",
          err.message
        );

        return;
      }

      const hasDebitAccount =
        columns.some(
          (column) =>
            column.name ===
            "debitAccountId"
        );

      const hasCreditAccount =
        columns.some(
          (column) =>
            column.name ===
            "creditAccountId"
        );

      if (!hasDebitAccount) {

        db.run(
          `
          ALTER TABLE vouchers
          ADD COLUMN debitAccountId INTEGER
          `,
          (alterErr) => {

            if (alterErr) {

              console.log(
                "Debit account migration error:",
                alterErr.message
              );
            } else {

              console.log(
                "✅ debitAccountId added to vouchers"
              );
            }
          }
        );
      }

      if (!hasCreditAccount) {

        db.run(
          `
          ALTER TABLE vouchers
          ADD COLUMN creditAccountId INTEGER
          `,
          (alterErr) => {

            if (alterErr) {

              console.log(
                "Credit account migration error:",
                alterErr.message
              );
            } else {

              console.log(
                "✅ creditAccountId added to vouchers"
              );
            }
          }
        );
      }
    }
  );

  // ==================================================
  // VOUCHER ALLOCATION COLUMN MIGRATION
  // ==================================================

  db.all(
    `PRAGMA table_info(voucher_allocations)`,
    [],
    (err, columns) => {

      if (err) {
        console.log(
          "Voucher allocation column check error:",
          err.message
        );
        return;
      }

      const hasAllocationDate =
        columns.some(
          (column) =>
            column.name === "allocationDate"
        );

      const hasRemarks =
        columns.some(
          (column) =>
            column.name === "remarks"
        );

      const hasOwnerId =
        columns.some(
          (column) =>
            column.name === "ownerId"
        );

      const addColumn = (sql, label, next) => {
        db.run(sql, (alterErr) => {
          if (alterErr) {
            console.log(
              `❌ ${label} migration error:`,
              alterErr.message
            );
          } else {
            console.log(
              `✅ ${label} added to voucher_allocations`
            );
          }
          next();
        });
      };

      const steps = [];

      if (!hasAllocationDate) {
        steps.push(
          (next) =>
            addColumn(
              `
              ALTER TABLE voucher_allocations
              ADD COLUMN allocationDate TEXT
              `,
              "allocationDate",
              next
            )
        );
      }

      if (!hasRemarks) {
        steps.push(
          (next) =>
            addColumn(
              `
              ALTER TABLE voucher_allocations
              ADD COLUMN remarks TEXT
              `,
              "remarks",
              next
            )
        );
      }

      if (!hasOwnerId) {
        steps.push(
          (next) =>
            addColumn(
              `
              ALTER TABLE voucher_allocations
              ADD COLUMN ownerId INTEGER
              `,
              "ownerId",
              next
            )
        );
      }

      const runSteps = (index = 0) => {
        if (index >= steps.length) {
          return;
        }

        steps[index](
          () => runSteps(index + 1)
        );
      };

      runSteps();
    }
  );

  // ==================================================
  // ACCOUNTING / OWNER INDEXES
  // ==================================================

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_account_transactions_owner_date
    ON account_transactions(ownerId, transactionDate, id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_account_transactions_owner_account
    ON account_transactions(ownerId, accountId)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_voucher_allocations_owner_voucher
    ON voucher_allocations(ownerId, voucherId)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_voucher_allocations_owner_sale
    ON voucher_allocations(ownerId, saleId)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_voucher_allocations_owner_purchase
    ON voucher_allocations(ownerId, purchaseId)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_stock_movements_owner_product_date
    ON stock_movements(ownerId, productId, movementDate, id)
  `);

  // ==================================================
  // START OWNER MIGRATION
  // ==================================================

  migrateOwnerColumns();

  // ==================================================
  // DATABASE READY MESSAGE
  // ==================================================

  console.log(
    "✅ Database initialization started"
  );
});

// ==================================================
// EXPORT
// ==================================================

module.exports = db;