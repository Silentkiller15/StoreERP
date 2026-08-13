import { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "./CompanyHeader";

export default function ProfitLoss() {
  const [report, setReport] = useState({
    totalSales: 0,
    totalPurchases: 0,
    openingStock: 0,
    closingStock: 0,
    cogs: 0,
    grossProfit: 0,
    otherIncome: 0,
    expenses: 0,
    netProfit: 0,
    closingStockItems: [],
  });

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // LOAD PROFIT & LOSS
  // ==================================================

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/sales/profit-loss"
      );

      const data = res.data || {};

      setReport({
        totalSales:
          Number(data.totalSales) || 0,

        totalPurchases:
          Number(data.totalPurchases) || 0,

        openingStock:
          Number(data.openingStock) || 0,

        closingStock:
          Number(data.closingStock) || 0,

        cogs:
          Number(data.cogs) || 0,

        grossProfit:
          Number(data.grossProfit) || 0,

        otherIncome:
          Number(data.otherIncome) || 0,

        expenses:
          Number(data.expenses) || 0,

        netProfit:
          Number(data.netProfit) || 0,

        closingStockItems:
          data.closingStockItems || [],
      });

    } catch (err) {
      console.log(
        "Profit & Loss Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load Profit & Loss"
      );

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // MONEY
  // ==================================================

  const money = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  // ==================================================
  // CALCULATED VALUES
  // ==================================================

  const goodsAvailable =
    report.openingStock +
    report.totalPurchases;

  const grossProfit =
    report.totalSales -
    report.cogs;

  const netProfit =
    grossProfit +
    report.otherIncome -
    report.expenses;

  // ==================================================
  // PRINT CSS
  // ==================================================

  return (
    <>
      <style>
        {`
          @media print {

            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            html,
            body {
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: visible !important;

              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            #root {
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: visible !important;
            }

            .sidebar,
            aside,
            nav {
              display: none !important;
            }

            button,
            .no-print {
              display: none !important;
            }

            .profit-loss-print-area {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            .company-header {
              width: 100% !important;
              margin-bottom: 8px !important;
              padding-bottom: 8px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .company-header h1 {
              font-size: 22px !important;
            }

            .company-header img {
              max-width: 70px !important;
              max-height: 55px !important;
            }

            .profit-loss-header {
              width: 100% !important;
              margin-bottom: 10px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .profit-loss-summary {
              display: grid !important;
              grid-template-columns:
                repeat(4, 1fr) !important;
              gap: 7px !important;
              width: 100% !important;
              margin-bottom: 10px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .profit-loss-card {
              box-shadow: none !important;
            }

            .profit-loss-table {
              width: 100% !important;
              border-collapse: collapse !important;
            }

            .profit-loss-table tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .stock-table {
              width: 100% !important;
              border-collapse: collapse !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      {/* ==================================================
          MAIN REPORT
      ================================================== */}

      <div
        className="profit-loss-print-area"
        style={{
          padding: 24,
          background: "#f8fafc",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="profit-loss-header"
          style={{
            marginBottom: 24,
          }}
        >

          <CompanyHeader
            print={false}
          />

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginTop: 10,
            }}
          >

            <div>

              <h1
                style={{
                  margin: "5px 0",
                  fontSize: 26,
                }}
              >
                📈 Profit & Loss Report
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Inventory-based
                profitability
                statement
              </p>

            </div>

            <div
              className="no-print"
              style={{
                display: "flex",
                gap: 10,
              }}
            >

              <button
                onClick={loadReport}
                style={{
                  padding:
                    "10px 18px",
                  background:
                    "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🔄 Refresh
              </button>

              <button
                onClick={() =>
                  window.print()
                }
                style={{
                  padding:
                    "10px 18px",
                  background:
                    "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🖨️ Print
              </button>

            </div>

          </div>

        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (

          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 10,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading Profit & Loss...
          </div>

        ) : (

          <>

            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div
              className="profit-loss-summary"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: 15,
                marginBottom: 25,
              }}
            >

              <SummaryCard
                title="🛒 Total Sales"
                value={
                  report.totalSales
                }
                background="#eff6ff"
                border="#bfdbfe"
              />

              <SummaryCard
                title="📦 Purchases"
                value={
                  report.totalPurchases
                }
                background="#fff7ed"
                border="#fed7aa"
              />

              <SummaryCard
                title="📊 COGS"
                value={
                  report.cogs
                }
                background="#fef2f2"
                border="#fecaca"
              />

              <SummaryCard
                title={
                  netProfit >= 0
                    ? "💰 Net Profit"
                    : "⚠️ Net Loss"
                }
                value={Math.abs(
                  netProfit
                )}
                background={
                  netProfit >= 0
                    ? "#dcfce7"
                    : "#fee2e2"
                }
                border={
                  netProfit >= 0
                    ? "#86efac"
                    : "#fecaca"
                }
              />

            </div>

            {/* ==================================================
                MAIN P&L STATEMENT
            ================================================== */}

            <div
              className="profit-loss-card"
              style={{
                background: "white",
                border:
                  "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 20,
                maxWidth: 900,
                marginBottom: 20,
              }}
            >

              <h2
                style={{
                  margin:
                    "0 0 18px",
                  fontSize: 19,
                }}
              >
                📋 Profit & Loss Statement
              </h2>

              <table
                className="profit-loss-table"
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                }}
              >

                <tbody>

                  {/* SALES */}

                  <PLRow
                    label="Sales"
                    amount={
                      report.totalSales
                    }
                  />

                  {/* OPENING STOCK */}

                  <PLRow
                    label="Add: Opening Stock"
                    amount={
                      report.openingStock
                    }
                  />

                  {/* PURCHASES */}

                  <PLRow
                    label="Add: Purchases"
                    amount={
                      report.totalPurchases
                    }
                  />

                  {/* GOODS AVAILABLE */}

                  <tr
                    style={{
                      background:
                        "#f8fafc",
                    }}
                  >

                    <td
                      style={{
                        padding:
                          "13px 12px",
                        borderTop:
                          "2px solid #cbd5e1",
                        borderBottom:
                          "1px solid #e2e8f0",
                        fontWeight: 700,
                      }}
                    >
                      Goods Available
                      for Sale
                    </td>

                    <td
                      style={{
                        padding:
                          "13px 12px",
                        textAlign:
                          "right",
                        borderTop:
                          "2px solid #cbd5e1",
                        borderBottom:
                          "1px solid #e2e8f0",
                        fontWeight: 700,
                      }}
                    >
                      ₹{" "}
                      {money(
                        goodsAvailable
                      )}
                    </td>

                  </tr>

                  {/* CLOSING STOCK */}

                  <PLRow
                    label="Less: Closing Stock"
                    amount={
                      report.closingStock
                    }
                    negative
                  />

                  {/* COGS */}

                  <tr
                    style={{
                      background:
                        "#fff7ed",
                    }}
                  >

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        borderTop:
                          "2px solid #fed7aa",
                        borderBottom:
                          "1px solid #fed7aa",
                        fontWeight: 800,
                        color:
                          "#9a3412",
                      }}
                    >
                      Cost of Goods
                      Sold (COGS)
                    </td>

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        textAlign:
                          "right",
                        borderTop:
                          "2px solid #fed7aa",
                        borderBottom:
                          "1px solid #fed7aa",
                        fontWeight: 800,
                        color:
                          "#9a3412",
                      }}
                    >
                      ₹{" "}
                      {money(
                        report.cogs
                      )}
                    </td>

                  </tr>

                  {/* GROSS PROFIT */}

                  <tr
                    style={{
                      background:
                        "#f0fdf4",
                    }}
                  >

                    <td
                      style={{
                        padding:
                          "15px 12px",
                        borderBottom:
                          "1px solid #bbf7d0",
                        fontWeight: 800,
                        color:
                          "#166534",
                        fontSize: 16,
                      }}
                    >
                      Gross Profit
                    </td>

                    <td
                      style={{
                        padding:
                          "15px 12px",
                        textAlign:
                          "right",
                        borderBottom:
                          "1px solid #bbf7d0",
                        fontWeight: 800,
                        color:
                          "#166534",
                        fontSize: 16,
                      }}
                    >
                      ₹{" "}
                      {money(
                        Math.abs(
                          grossProfit
                        )
                      )}
                    </td>

                  </tr>

                  {/* OTHER INCOME */}

                  <PLRow
                    label="Add: Other Income"
                    amount={
                      report.otherIncome
                    }
                  />

                  {/* EXPENSES */}

                  <PLRow
                    label="Less: Expenses"
                    amount={
                      report.expenses
                    }
                    negative
                  />

                  {/* NET PROFIT */}

                  <tr
                    style={{
                      background:
                        netProfit >= 0
                          ? "#16a34a"
                          : "#dc2626",
                      color: "white",
                    }}
                  >

                    <td
                      style={{
                        padding:
                          "17px 12px",
                        fontWeight: 900,
                        fontSize: 18,
                      }}
                    >
                      {netProfit >=
                      0
                        ? "💰 Net Profit"
                        : "⚠️ Net Loss"}
                    </td>

                    <td
                      style={{
                        padding:
                          "17px 12px",
                        textAlign:
                          "right",
                        fontWeight: 900,
                        fontSize: 18,
                      }}
                    >
                      ₹{" "}
                      {money(
                        Math.abs(
                          netProfit
                        )
                      )}
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

            {/* ==================================================
                STOCK VALUATION
            ================================================== */}

            <div
              className="profit-loss-card"
              style={{
                background: "white",
                border:
                  "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 20,
                maxWidth: 900,
                marginBottom: 20,
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom:
                    15,
                }}
              >

                <div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: 18,
                    }}
                  >
                    📦 Closing Stock
                    Valuation
                  </h2>

                  <div
                    style={{
                      marginTop: 4,
                      color:
                        "#64748b",
                      fontSize: 12,
                    }}
                  >
                    Current stock
                    valued at the
                    latest available
                    purchase cost
                  </div>

                </div>

                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color:
                      "#2563eb",
                  }}
                >
                  ₹{" "}
                  {money(
                    report.closingStock
                  )}
                </div>

              </div>

              {report
                .closingStockItems
                .length === 0 ? (

                <div
                  style={{
                    padding: 20,
                    textAlign:
                      "center",
                    color:
                      "#64748b",
                    background:
                      "#f8fafc",
                    borderRadius: 8,
                  }}
                >
                  No closing stock
                  available.
                </div>

              ) : (

                <div
                  style={{
                    overflowX:
                      "auto",
                  }}
                >

                  <table
                    className="stock-table"
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                    }}
                  >

                    <thead>

                      <tr
                        style={{
                          background:
                            "#f8fafc",
                        }}
                      >

                        <th
                          style={{
                            padding: 10,
                            textAlign:
                              "left",
                            borderBottom:
                              "1px solid #e2e8f0",
                            fontSize: 12,
                            color:
                              "#475569",
                          }}
                        >
                          PRODUCT
                        </th>

                        <th
                          style={{
                            padding: 10,
                            textAlign:
                              "right",
                            borderBottom:
                              "1px solid #e2e8f0",
                            fontSize: 12,
                            color:
                              "#475569",
                          }}
                        >
                          QTY
                        </th>

                        <th
                          style={{
                            padding: 10,
                            textAlign:
                              "right",
                            borderBottom:
                              "1px solid #e2e8f0",
                            fontSize: 12,
                            color:
                              "#475569",
                          }}
                        >
                          COST RATE
                        </th>

                        <th
                          style={{
                            padding: 10,
                            textAlign:
                              "right",
                            borderBottom:
                              "1px solid #e2e8f0",
                            fontSize: 12,
                            color:
                              "#475569",
                          }}
                        >
                          VALUE
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {report
                        .closingStockItems
                        .map(
                          (
                            item
                          ) => (

                            <tr
                              key={
                                item.productId
                              }
                            >

                              <td
                                style={{
                                  padding:
                                    10,
                                  borderBottom:
                                    "1px solid #f1f5f9",
                                }}
                              >
                                {
                                  item.productName
                                }
                              </td>

                              <td
                                style={{
                                  padding:
                                    10,
                                  textAlign:
                                    "right",
                                  borderBottom:
                                    "1px solid #f1f5f9",
                                }}
                              >
                                {
                                  item.quantity
                                }
                              </td>

                              <td
                                style={{
                                  padding:
                                    10,
                                  textAlign:
                                    "right",
                                  borderBottom:
                                    "1px solid #f1f5f9",
                                }}
                              >
                                ₹{" "}
                                {money(
                                  item.costRate
                                )}
                              </td>

                              <td
                                style={{
                                  padding:
                                    10,
                                  textAlign:
                                    "right",
                                  borderBottom:
                                    "1px solid #f1f5f9",
                                  fontWeight:
                                    700,
                                }}
                              >
                                ₹{" "}
                                {money(
                                  item.value
                                )}
                              </td>

                            </tr>

                          )
                        )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

            {/* ==================================================
                FORMULA
            ================================================== */}

            <div
              className="profit-loss-card"
              style={{
                maxWidth: 900,
                padding: 18,
                background:
                  "#f8fafc",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 10,
                marginBottom: 20,
              }}
            >

              <b>
                📊 Accounting Calculation
              </b>

              <div
                style={{
                  marginTop: 10,
                  lineHeight: 1.9,
                  color:
                    "#475569",
                  fontSize: 13,
                }}
              >

                <div>
                  <b>
                    Goods Available =
                  </b>{" "}
                  Opening Stock +
                  Purchases
                </div>

                <div>
                  <b>
                    COGS =
                  </b>{" "}
                  Opening Stock +
                  Purchases −
                  Closing Stock
                </div>

                <div>
                  <b>
                    Gross Profit =
                  </b>{" "}
                  Sales − COGS
                </div>

                <div>
                  <b>
                    Net Profit =
                  </b>{" "}
                  Gross Profit +
                  Other Income −
                  Expenses
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color:
                      "#64748b",
                  }}
                >
                  GST is not included
                  in this calculation.
                </div>

              </div>

            </div>

          </>

        )}

      </div>
    </>
  );
}

// ==================================================
// P&L ROW
// ==================================================

function PLRow({
  label,
  amount,
  negative = false,
}) {
  const money = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <tr>

      <td
        style={{
          padding:
            "12px",
          borderBottom:
            "1px solid #e2e8f0",
          fontWeight: 600,
          color:
            "#334155",
        }}
      >
        {label}
      </td>

      <td
        style={{
          padding:
            "12px",
          textAlign:
            "right",
          borderBottom:
            "1px solid #e2e8f0",
          color:
            negative
              ? "#b91c1c"
              : "#0f172a",
        }}
      >
        {negative
          ? "− "
          : ""}
        ₹{" "}
        {money(amount)}
      </td>

    </tr>
  );
}

// ==================================================
// SUMMARY CARD
// ==================================================

function SummaryCard({
  title,
  value,
  background,
  border,
}) {
  const money = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <div
      className="profit-loss-card"
      style={{
        padding: 18,
        background,
        border:
          `1px solid ${border}`,
        borderRadius: 10,
      }}
    >

      <div
        style={{
          fontSize: 13,
          color: "#475569",
          fontWeight: 600,
        }}
      >
        {title}
      </div>

      <h2
        style={{
          margin:
            "8px 0 0",
          fontSize: 23,
        }}
      >
        ₹ {money(value)}
      </h2>

    </div>
  );
}