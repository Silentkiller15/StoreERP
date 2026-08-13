const express = require("express");
const cors = require("cors");

const app = express();

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);

// ==================================================
// DATABASE BACKUP
// ==================================================

require("./backup");

// ==================================================
// DATABASE
// ==================================================

require("./database");

// ==================================================
// ROUTES
// ==================================================

const productRoutes =
  require("./routes/products");

const customerRoutes =
  require("./routes/customers");

const supplierRoutes =
  require("./routes/suppliers");

const purchaseRoutes =
  require("./routes/purchases");

const salesRoutes =
  require("./routes/sales");

const voucherRoutes =
  require("./routes/vouchers");

const companyRoutes =
  require("./routes/company");

   const { router: authRoutes } =
  require("./routes/auth");

const accountRoutes =
  require("./routes/accounts");

  const openingStockRoutes =
require("./routes/openingStock");

// ==================================================
// API ROUTES
// ==================================================

app.use(
  "/products",
  productRoutes
);

app.use(
  "/customers",
  customerRoutes
);

app.use(
  "/suppliers",
  supplierRoutes
);

app.use(
  "/purchases",
  purchaseRoutes
);

app.use(
  "/sales",
  salesRoutes
);

app.use(
  "/vouchers",
  voucherRoutes
);

app.use(
  "/company",
  companyRoutes
);

// Authentication routes
app.use(
  "/accounts",
  authRoutes
);

// Accounting routes
app.use(
  "/accounts",
  accountRoutes
);

// Opening Stock routes
app.use(
"/opening-stock",
openingStockRoutes
);

// ==================================================
// HOME
// ==================================================

app.get(
  "/",
  (req, res) => {
    res.send(
      "🚀 StoreERP API Running"
    );
  }
);

// ==================================================
// ERROR HANDLER
// ==================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "❌ Server Error:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Internal server error.",
    });
  }
);

// ==================================================
// SERVER
// ==================================================

const PORT = 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `✅ Server running on http://localhost:${PORT}`
    );
  }
);