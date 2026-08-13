import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [outstanding, setOutstanding] =
    useState({
      totalReceivable: 0,
      totalPayable: 0,
    });

  const [balanceSheet, setBalanceSheet] =
    useState({
      totalAssets: 0,
      totalLiabilities: 0,
      totalCapital: 0,
      currentProfit: 0,
    });

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // AUTH CONFIG
  // ==================================================

  const getAuthConfig = () => {
    const token =
      localStorage.getItem(
        "storeerp_token"
      );

    return {
      headers: {
        Authorization:
          "Bearer " + token,
      },
    };
  };

  // ==================================================
  // LOAD DASHBOARD
  // ==================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const config =
        getAuthConfig();

      const [
        productRes,
        customerRes,
        supplierRes,
        salesRes,
        purchaseRes,
        outstandingRes,
        balanceRes,
      ] = await Promise.all([
        axios.get(
          "http://localhost:5000/products",
          config
        ),

        axios.get(
          "http://localhost:5000/customers",
          config
        ),

        axios.get(
          "http://localhost:5000/suppliers",
          config
        ),

        axios.get(
          "http://localhost:5000/sales",
          config
        ),

        axios.get(
          "http://localhost:5000/purchases",
          config
        ),

        axios.get(
          "http://localhost:5000/accounts/outstanding",
          config
        ),

        axios.get(
          "http://localhost:5000/accounts/balance-sheet",
          config
        ),
      ]);

      // ==================================================
      // BASIC DATA
      // ==================================================

      setProducts(
        Array.isArray(
          productRes.data
        )
          ? productRes.data
          : []
      );

      setCustomers(
        Array.isArray(
          customerRes.data
        )
          ? customerRes.data
          : []
      );

      setSuppliers(
        Array.isArray(
          supplierRes.data
        )
          ? supplierRes.data
          : []
      );

      setSales(
        Array.isArray(
          salesRes.data
        )
          ? salesRes.data
          : []
      );

      setPurchases(
        Array.isArray(
          purchaseRes.data
        )
          ? purchaseRes.data
          : []
      );

      // ==================================================
      // OUTSTANDING
      // ==================================================

      setOutstanding({
        totalReceivable:
          Number(
            outstandingRes.data
              ?.totalReceivable
          ) || 0,

        totalPayable:
          Number(
            outstandingRes.data
              ?.totalPayable
          ) || 0,
      });

      // ==================================================
      // BALANCE SHEET
      // ==================================================

      setBalanceSheet({
        totalAssets:
          Number(
            balanceRes.data
              ?.totalAssets
          ) || 0,

        totalLiabilities:
          Number(
            balanceRes.data
              ?.totalLiabilities
          ) || 0,

        totalCapital:
          Number(
            balanceRes.data
              ?.totalCapital
          ) || 0,

        currentProfit:
          Number(
            balanceRes.data
              ?.currentProfit
          ) || 0,
      });

    } catch (err) {
      console.log(
        "Dashboard Error:",
        err
      );

      if (
        err.response?.status ===
        401
      ) {
        console.log(
          "Dashboard authentication failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // TOTAL SALES
  // ==================================================

  const totalSales =
    sales.reduce(
      (sum, sale) =>
        sum +
        (Number(
          sale.grandTotal
        ) || 0),
      0
    );

  // ==================================================
  // TOTAL PURCHASES
  // ==================================================

  const totalPurchases =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        (Number(
          purchase.grandTotal
        ) || 0),
      0
    );

  // ==================================================
  // STOCK VALUE
  // ==================================================

  const stockValue =
    products.reduce(
      (sum, product) =>
        sum +
        (Number(
          product.stock
        ) || 0) *
          (Number(
            product.purchase
          ) || 0),
      0
    );

  // ==================================================
  // SIMPLE SALES / PURCHASE DIFFERENCE
  // ==================================================

  const estimatedProfit =
    totalSales -
    totalPurchases;

  // ==================================================
  // MONEY FORMAT
  // ==================================================

  const money = (value) =>
    Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div
        style={styles.page}
      >
        <div
          style={styles.loading}
        >
          <div
            style={
              styles.loadingIcon
            }
          >
            📊
          </div>

          <h3>
            Loading Dashboard...
          </h3>

          <p>
            Please wait while we
            load your financial
            data.
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div
      style={styles.page}
    >

      {/* ========================================
          HEADER
      ======================================== */}

      <div
        style={styles.header}
      >
        <div>
          <div
            style={
              styles.eyebrow
            }
          >
            STOREERP
          </div>

          <h1
            style={styles.title}
          >
            Dashboard
          </h1>

          <p
            style={styles.subtitle}
          >
            Overview of your business
            and financial performance
          </p>
        </div>

        <button
          onClick={loadData}
          style={
            styles.refreshButton
          }
        >
          🔄 Refresh
        </button>
      </div>

      {/* ========================================
          TOP KPI CARDS
      ======================================== */}

      <div
        style={styles.kpiGrid}
      >
        <KpiCard
          icon="🛒"
          title="Total Sales"
          value={`₹ ${money(
            totalSales
          )}`}
          subtitle={`${sales.length} sales`}
          background="#eff6ff"
          iconBackground="#dbeafe"
          iconColor="#2563eb"
        />

        <KpiCard
          icon="📥"
          title="Purchases"
          value={`₹ ${money(
            totalPurchases
          )}`}
          subtitle={`${purchases.length} purchases`}
          background="#f5f3ff"
          iconBackground="#ede9fe"
          iconColor="#7c3aed"
        />

        <KpiCard
          icon="🟢"
          title="Receivables"
          value={`₹ ${money(
            outstanding.totalReceivable
          )}`}
          subtitle="Customer outstanding"
          background="#ecfdf5"
          iconBackground="#d1fae5"
          iconColor="#059669"
        />

        <KpiCard
          icon="🔴"
          title="Payables"
          value={`₹ ${money(
            outstanding.totalPayable
          )}`}
          subtitle="Supplier outstanding"
          background="#fff1f2"
          iconBackground="#ffe4e6"
          iconColor="#e11d48"
        />
      </div>

      {/* ========================================
          SECOND ROW
      ======================================== */}

      <div
        style={styles.smallGrid}
      >
        <SmallCard
          icon="📦"
          title="Products"
          value={products.length}
          color="#2563eb"
        />

        <SmallCard
          icon="👥"
          title="Customers"
          value={customers.length}
          color="#059669"
        />

        <SmallCard
          icon="🚚"
          title="Suppliers"
          value={suppliers.length}
          color="#d97706"
        />

        <SmallCard
          icon="📦"
          title="Stock Value"
          value={`₹ ${money(
            stockValue
          )}`}
          color="#7c3aed"
        />
      </div>

      {/* ========================================
          FINANCIAL SECTION
      ======================================== */}

      <div
        style={
          styles.sectionTitle
        }
      >
        <div>
          <h2>
            Financial Overview
          </h2>

          <p>
            Current accounting position
          </p>
        </div>
      </div>

      <div
        style={styles.financeGrid}
      >

        {/* PROFIT */}

        <div
          style={{
            ...styles.financeCard,
            background:
              estimatedProfit >=
              0
                ? "linear-gradient(135deg, #047857, #10b981)"
                : "linear-gradient(135deg, #be123c, #f43f5e)",
          }}
        >
          <div
            style={
              styles.financeTop
            }
          >
            <span
              style={
                styles.financeIcon
              }
            >
              📈
            </span>

            <span
              style={
                styles.financeBadge
              }
            >
              Sales / Purchase
            </span>
          </div>

          <p
            style={
              styles.financeLabel
            }
          >
            Estimated Profit
          </p>

          <h2
            style={
              styles.financeValue
            }
          >
            ₹{" "}
            {money(
              estimatedProfit
            )}
          </h2>

          <p
            style={
              styles.financeDescription
            }
          >
            Sales minus purchases
          </p>
        </div>

        {/* ASSETS */}

        <div
          style={
            styles.whiteFinanceCard
          }
        >
          <div
            style={
              styles.cardHeader
            }
          >
            <span
              style={
                styles.roundIcon
              }
            >
              🟢
            </span>

            <div>
              <h3>
                Assets
              </h3>

              <p>
                Total business assets
              </p>
            </div>
          </div>

          <strong
            style={styles.amount}
          >
            ₹{" "}
            {money(
              balanceSheet.totalAssets
            )}
          </strong>
        </div>

        {/* LIABILITIES */}

        <div
          style={
            styles.whiteFinanceCard
          }
        >
          <div
            style={
              styles.cardHeader
            }
          >
            <span
              style={
                styles.roundIcon
              }
            >
              🔴
            </span>

            <div>
              <h3>
                Liabilities
              </h3>

              <p>
                Total liabilities
              </p>
            </div>
          </div>

          <strong
            style={styles.amount}
          >
            ₹{" "}
            {money(
              balanceSheet.totalLiabilities
            )}
          </strong>
        </div>

        {/* CAPITAL */}

        <div
          style={
            styles.whiteFinanceCard
          }
        >
          <div
            style={
              styles.cardHeader
            }
          >
            <span
              style={
                styles.roundIcon
              }
            >
              🔵
            </span>

            <div>
              <h3>
                Capital
              </h3>

              <p>
                Business capital
              </p>
            </div>
          </div>

          <strong
            style={styles.amount}
          >
            ₹{" "}
            {money(
              balanceSheet.totalCapital
            )}
          </strong>
        </div>
      </div>

      {/* ========================================
          OUTSTANDING SUMMARY
      ======================================== */}

      <div
        style={
          styles.sectionTitle
        }
      >
        <div>
          <h2>
            Outstanding Summary
          </h2>

          <p>
            Money to receive and pay
          </p>
        </div>
      </div>

      <div
        style={
          styles.outstandingGrid
        }
      >

        {/* RECEIVABLE */}

        <div
          style={
            styles.outstandingCard
          }
        >
          <div
            style={{
              ...styles.outstandingIcon,
              background:
                "#dcfce7",
            }}
          >
            👥
          </div>

          <div
            style={{ flex: 1 }}
          >
            <p
              style={styles.muted}
            >
              Customers Owe You
            </p>

            <h2
              style={
                styles.greenAmount
              }
            >
              ₹{" "}
              {money(
                outstanding.totalReceivable
              )}
            </h2>

            <div
              style={
                styles.progressTrack
              }
            >
              <div
                style={{
                  ...styles.progressGreen,
                  width:
                    outstanding.totalReceivable >
                    0
                      ? "75%"
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>

        {/* PAYABLE */}

        <div
          style={
            styles.outstandingCard
          }
        >
          <div
            style={{
              ...styles.outstandingIcon,
              background:
                "#fee2e2",
            }}
          >
            🚚
          </div>

          <div
            style={{ flex: 1 }}
          >
            <p
              style={styles.muted}
            >
              You Owe Suppliers
            </p>

            <h2
              style={
                styles.redAmount
              }
            >
              ₹{" "}
              {money(
                outstanding.totalPayable
              )}
            </h2>

            <div
              style={
                styles.progressTrack
              }
            >
              <div
                style={{
                  ...styles.progressRed,
                  width:
                    outstanding.totalPayable >
                    0
                      ? "45%"
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          ACCOUNTING RESULT
      ======================================== */}

      <div
        style={
          styles.accountingCard
        }
      >
        <div>
          <span
            style={
              styles.accountingIcon
            }
          >
            📊
          </span>
        </div>

        <div
          style={{ flex: 1 }}
        >
          <p
            style={styles.muted}
          >
            Accounting Current Profit /
            Loss
          </p>

          <h2
            style={{
              margin: "4px 0",
              color:
                balanceSheet.currentProfit >=
                0
                  ? "#047857"
                  : "#be123c",
            }}
          >
            ₹{" "}
            {money(
              balanceSheet.currentProfit
            )}
          </h2>

          <p
            style={styles.smallText}
          >
            Calculated from your
            accounting entries
          </p>
        </div>

        <div
          style={styles.statusBadge}
        >
          {balanceSheet.currentProfit >=
          0
            ? "✓ Profit"
            : "⚠ Loss"}
        </div>
      </div>

      {/* ========================================
          FOOTER
      ======================================== */}

      <div
        style={styles.footer}
      >
        <span>
          🏪 StoreERP
        </span>

        <span>
          Financial Dashboard
        </span>
      </div>
    </div>
  );
}

/* ============================================
   KPI CARD
============================================ */

function KpiCard({
  icon,
  title,
  value,
  subtitle,
  background,
  iconBackground,
  iconColor,
}) {
  return (
    <div
      style={{
        ...styles.kpiCard,
        background,
      }}
    >
      <div
        style={styles.kpiTop}
      >
        <div
          style={{
            ...styles.kpiIcon,
            background:
              iconBackground,
            color: iconColor,
          }}
        >
          {icon}
        </div>

        <span
          style={{
            color: iconColor,
          }}
        >
          ●
        </span>
      </div>

      <p
        style={styles.kpiTitle}
      >
        {title}
      </p>

      <h2
        style={styles.kpiValue}
      >
        {value}
      </h2>

      <p
        style={styles.kpiSubtitle}
      >
        {subtitle}
      </p>
    </div>
  );
}

/* ============================================
   SMALL CARD
============================================ */

function SmallCard({
  icon,
  title,
  value,
  color,
}) {
  return (
    <div
      style={styles.smallCard}
    >
      <div
        style={{
          ...styles.smallIcon,
          color,
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={styles.smallTitle}
        >
          {title}
        </p>

        <h3
          style={styles.smallValue}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}

/* ============================================
   STYLES
============================================ */

const styles = {
  page: {
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
    color: "#1e293b",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  eyebrow: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#64748b",
    marginBottom: "4px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  refreshButton: {
    border:
      "1px solid #cbd5e1",
    background: "white",
    color: "#334155",
    borderRadius: "8px",
    padding: "9px 15px",
    cursor: "pointer",
    fontWeight: "600",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },

  kpiCard: {
    padding: "18px",
    borderRadius: "12px",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.05)",
  },

  kpiTop: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  kpiIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    justifyContent:
      "center",
    alignItems: "center",
    fontSize: "20px",
  },

  kpiTitle: {
    margin: "14px 0 3px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "600",
  },

  kpiValue: {
    margin: 0,
    fontSize: "22px",
    color: "#0f172a",
  },

  kpiSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "11px",
  },

  smallGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "16px",
  },

  smallCard: {
    background: "white",
    border:
      "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  smallIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    background: "#f1f5f9",
    display: "flex",
    justifyContent:
      "center",
    alignItems: "center",
    fontSize: "18px",
  },

  smallTitle: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
  },

  smallValue: {
    margin: "3px 0 0",
    fontSize: "18px",
    color: "#0f172a",
  },

  sectionTitle: {
    marginTop: "30px",
    marginBottom: "14px",
  },

  financeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },

  financeCard: {
    borderRadius: "12px",
    padding: "20px",
    color: "white",
    minHeight: "145px",
    boxShadow:
      "0 4px 12px rgba(15, 23, 42, 0.10)",
  },

  financeTop: {
    display: "flex",
    justifyContent:
      "space-between",
  },

  financeIcon: {
    fontSize: "23px",
  },

  financeBadge: {
    fontSize: "10px",
    background:
      "rgba(255,255,255,0.18)",
    padding: "5px 8px",
    borderRadius: "20px",
  },

  financeLabel: {
    margin: "18px 0 4px",
    fontSize: "12px",
    opacity: 0.85,
  },

  financeValue: {
    margin: 0,
    fontSize: "25px",
  },

  financeDescription: {
    margin: "5px 0 0",
    fontSize: "11px",
    opacity: 0.8,
  },

  whiteFinanceCard: {
    background: "white",
    border:
      "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    minHeight: "105px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  cardHeader: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  roundIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#f1f5f9",
    display: "flex",
    justifyContent:
      "center",
    alignItems: "center",
  },

  amount: {
    display: "block",
    marginTop: "16px",
    fontSize: "20px",
  },

  outstandingGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  outstandingCard: {
    background: "white",
    border:
      "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },

  outstandingIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    display: "flex",
    justifyContent:
      "center",
    alignItems: "center",
    fontSize: "20px",
  },

  muted: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
  },

  greenAmount: {
    margin: "4px 0 8px",
    color: "#047857",
    fontSize: "22px",
  },

  redAmount: {
    margin: "4px 0 8px",
    color: "#be123c",
    fontSize: "22px",
  },

  progressTrack: {
    height: "5px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },

  progressGreen: {
    height: "100%",
    background: "#10b981",
    borderRadius: "10px",
  },

  progressRed: {
    height: "100%",
    background: "#f43f5e",
    borderRadius: "10px",
  },

  accountingCard: {
    marginTop: "16px",
    background: "white",
    border:
      "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  accountingIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#ede9fe",
    display: "flex",
    justifyContent:
      "center",
    alignItems: "center",
    fontSize: "20px",
  },

  smallText: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#94a3b8",
  },

  statusBadge: {
    padding: "7px 12px",
    borderRadius: "20px",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "700",
  },

  footer: {
    marginTop: "30px",
    paddingTop: "15px",
    borderTop:
      "1px solid #e2e8f0",
    display: "flex",
    justifyContent:
      "space-between",
    color: "#94a3b8",
    fontSize: "11px",
  },

  loading: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    justifyContent:
      "center",
    alignItems: "center",
    color: "#64748b",
  },

  loadingIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },
};