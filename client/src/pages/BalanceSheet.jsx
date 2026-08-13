import { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "./CompanyHeader";

export default function BalanceSheet() {
  const [report, setReport] = useState({
    assets: [],
    liabilities: [],
    capital: [],
    totalAssets: 0,
    totalLiabilities: 0,
    totalCapital: 0,
  });

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // LOAD BALANCE SHEET
  // ==================================================

  useEffect(() => {
    loadBalanceSheet();
  }, []);

  const loadBalanceSheet = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/accounts/balance-sheet"
      );

      setReport({
        assets: res.data.assets || [],

        liabilities:
          res.data.liabilities || [],

        capital:
          res.data.capital || [],

        totalAssets:
          Number(
            res.data.totalAssets
          ) || 0,

        totalLiabilities:
          Number(
            res.data.totalLiabilities
          ) || 0,

        totalCapital:
          Number(
            res.data.totalCapital
          ) || 0,
      });
    } catch (err) {
      console.log(
        "Balance Sheet Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load Balance Sheet"
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
  // BALANCE CHECK
  // ==================================================

  const balanceDifference =
    report.totalAssets -
    (
      report.totalLiabilities +
      report.totalCapital
    );

  const isBalanced =
    Math.abs(balanceDifference) <
    0.01;

  return (
    <>
      {/* ==================================================
          PRINT CSS
      ================================================== */}

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

              transform: none !important;
              rotate: none !important;

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

              transform: none !important;
              rotate: none !important;

              overflow: visible !important;
            }

            /* ==========================================
               HIDE SIDEBAR / NAVIGATION
            ========================================== */

            .sidebar,
            aside,
            nav {
              display: none !important;
            }

            /* ==========================================
               HIDE BUTTONS / SCREEN CONTROLS
            ========================================== */

            button,
            .no-print {
              display: none !important;
            }

            /* ==========================================
               MAIN PRINT AREA
            ========================================== */

            .balance-sheet-print-area {
              display: block !important;

              width: 100% !important;
              max-width: 100% !important;

              margin: 0 !important;
              padding: 0 !important;

              min-height: 0 !important;

              box-sizing: border-box !important;

              background: white !important;

              transform: none !important;
              rotate: none !important;
            }

            /* ==========================================
               COMPANY HEADER
            ========================================== */

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

            /* ==========================================
               REPORT HEADER
            ========================================== */

            .balance-sheet-header {
              width: 100% !important;

              margin-bottom: 10px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               SUMMARY CARDS
            ========================================== */

            .balance-summary {
              display: grid !important;

              grid-template-columns:
                repeat(3, 1fr) !important;

              gap: 7px !important;

              width: 100% !important;

              margin-bottom: 10px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .balance-summary > div {
              padding: 8px !important;
            }

            .balance-summary h2 {
              font-size: 14px !important;
            }

            /* ==========================================
               MAIN COLUMNS
            ========================================== */

            .balance-columns {
              display: grid !important;

              grid-template-columns:
                repeat(2, minmax(0, 1fr)) !important;

              gap: 10px !important;

              width: 100% !important;

              margin-bottom: 10px !important;
            }

            /* ==========================================
               CARDS
            ========================================== */

            .balance-card {
              box-shadow: none !important;

              overflow: visible !important;

              break-inside: auto !important;

              page-break-inside: auto !important;
            }

            /* ==========================================
               ACCOUNT ROWS
            ========================================== */

            .balance-account-row {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               TOTAL ROWS
            ========================================== */

            .balance-total {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               BALANCE CHECK
            ========================================== */

            .balance-check {
              break-inside: avoid !important;
              page-break-inside: avoid !important;

              margin-top: 10px !important;
            }

            /* ==========================================
               PRINT COLORS
            ========================================== */

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      {/* ==================================================
          MAIN BALANCE SHEET
      ================================================== */}

      <div
        className="balance-sheet-print-area"
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
          className="balance-sheet-header"
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <CompanyHeader
              print={false}
            />

            <h1
              style={{
                margin: "5px 0",
                fontSize: 26,
              }}
            >
              📋 Balance Sheet
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Assets, liabilities and
              capital position
            </p>
          </div>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div
            className="no-print"
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              onClick={
                loadBalanceSheet
              }
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
            Loading Balance Sheet...
          </div>
        ) : (
          <>
            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div
              className="balance-summary"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: 15,
                marginBottom: 25,
              }}
            >
              <SummaryCard
                title="🟢 Total Assets"
                value={
                  report.totalAssets
                }
                background="#ecfdf5"
                border="#a7f3d0"
              />

              <SummaryCard
                title="🔴 Total Liabilities"
                value={
                  report.totalLiabilities
                }
                background="#fef2f2"
                border="#fecaca"
              />

              <SummaryCard
                title="🔵 Total Capital"
                value={
                  report.totalCapital
                }
                background="#eff6ff"
                border="#bfdbfe"
              />
            </div>

            {/* ==================================================
                ASSETS / LIABILITIES + CAPITAL
            ================================================== */}

            <div
              className="balance-columns"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: 20,
              }}
            >
              {/* ==================================================
                  ASSETS
              ================================================== */}

              <div
                className="balance-card"
                style={{
                  background: "white",
                  border:
                    "1px solid #d1fae5",
                  borderRadius: 10,
                  padding: 20,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 19,
                      color: "#166534",
                    }}
                  >
                    🟢 Assets
                  </h2>

                  <span
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    Resources
                  </span>
                </div>

                {report.assets.length ===
                0 ? (
                  <div
                    style={{
                      padding:
                        "18px 0",
                      color:
                        "#64748b",
                      textAlign:
                        "center",
                    }}
                  >
                    No assets found.
                  </div>
                ) : (
                  report.assets.map(
                    (account) => (
                      <div
                        className="balance-account-row"
                        key={account.id}
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          padding:
                            "10px 0",
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >
                        <span
                          style={{
                            color:
                              "#334155",
                          }}
                        >
                          {
                            account.name
                          }
                        </span>

                        <span
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          ₹{" "}
                          {money(
                            account.balance
                          )}
                        </span>
                      </div>
                    )
                  )
                )}

                <div
                  className="balance-total"
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginTop: 15,
                    paddingTop: 12,
                    borderTop:
                      "2px solid #166534",
                    fontWeight:
                      "bold",
                    fontSize: 17,
                    color: "#166534",
                  }}
                >
                  <span>
                    Total Assets
                  </span>

                  <span>
                    ₹{" "}
                    {money(
                      report.totalAssets
                    )}
                  </span>
                </div>
              </div>

              {/* ==================================================
                  LIABILITIES + CAPITAL
              ================================================== */}

              <div
                className="balance-card"
                style={{
                  background: "white",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 20,
                  overflow: "hidden",
                }}
              >
                {/* LIABILITIES */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 19,
                      color: "#b91c1c",
                    }}
                  >
                    🔴 Liabilities
                  </h2>

                  <span
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    Obligations
                  </span>
                </div>

                {report.liabilities
                  .length === 0 ? (
                  <div
                    style={{
                      padding:
                        "18px 0",
                      color:
                        "#64748b",
                      textAlign:
                        "center",
                    }}
                  >
                    No liabilities
                    found.
                  </div>
                ) : (
                  report.liabilities.map(
                    (account) => (
                      <div
                        className="balance-account-row"
                        key={account.id}
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          padding:
                            "10px 0",
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >
                        <span
                          style={{
                            color:
                              "#334155",
                          }}
                        >
                          {
                            account.name
                          }
                        </span>

                        <span
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          ₹{" "}
                          {money(
                            account.balance
                          )}
                        </span>
                      </div>
                    )
                  )
                )}

                <div
                  className="balance-total"
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginTop: 15,
                    paddingTop: 12,
                    borderTop:
                      "2px solid #b91c1c",
                    fontWeight:
                      "bold",
                    color: "#b91c1c",
                  }}
                >
                  <span>
                    Total Liabilities
                  </span>

                  <span>
                    ₹{" "}
                    {money(
                      report.totalLiabilities
                    )}
                  </span>
                </div>

                {/* CAPITAL */}

                <div
                  style={{
                    marginTop: 30,
                    paddingTop: 20,
                    borderTop:
                      "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom: 10,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 19,
                        color:
                          "#1d4ed8",
                      }}
                    >
                      🔵 Capital
                    </h2>

                    <span
                      style={{
                        fontSize: 12,
                        color:
                          "#64748b",
                      }}
                    >
                      Owner's equity
                    </span>
                  </div>

                  {report.capital
                    .length === 0 ? (
                    <div
                      style={{
                        padding:
                          "18px 0",
                        color:
                          "#64748b",
                        textAlign:
                          "center",
                      }}
                    >
                      No capital
                      accounts found.
                    </div>
                  ) : (
                    report.capital.map(
                      (account) => (
                        <div
                          className="balance-account-row"
                          key={account.id}
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            padding:
                              "10px 0",
                            borderBottom:
                              "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              color:
                                "#334155",
                            }}
                          >
                            {
                              account.name
                            }
                          </span>

                          <span
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            ₹{" "}
                            {money(
                              account.balance
                            )}
                          </span>
                        </div>
                      )
                    )
                  )}

                  <div
                    className="balance-total"
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      marginTop: 15,
                      paddingTop: 12,
                      borderTop:
                        "2px solid #1d4ed8",
                      fontWeight:
                        "bold",
                      color:
                        "#1d4ed8",
                    }}
                  >
                    <span>
                      Total Capital
                    </span>

                    <span>
                      ₹{" "}
                      {money(
                        report.totalCapital
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                BALANCE CHECK
            ================================================== */}

            <div
              className="balance-check"
              style={{
                marginTop: 25,
                padding: 20,
                borderRadius: 10,

                background:
                  isBalanced
                    ? "#dcfce7"
                    : "#fee2e2",

                border:
                  isBalanced
                    ? "1px solid #86efac"
                    : "1px solid #fecaca",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom: 12,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                  }}
                >
                  ⚖️ Balance Check
                </h2>

                <strong
                  style={{
                    color:
                      isBalanced
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {isBalanced
                    ? "✅ BALANCED"
                    : "⚠️ NOT BALANCED"}
                </strong>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: 15,
                }}
              >
                <CheckValue
                  label="Total Assets"
                  value={
                    report.totalAssets
                  }
                />

                <CheckValue
                  label="Liabilities + Capital"
                  value={
                    report.totalLiabilities +
                    report.totalCapital
                  }
                />

                <CheckValue
                  label="Difference"
                  value={Math.abs(
                    balanceDifference
                  )}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
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
      className="balance-card"
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
          margin: "8px 0 0",
          fontSize: 23,
        }}
      >
        ₹ {money(value)}
      </h2>
    </div>
  );
}

// ==================================================
// BALANCE CHECK VALUE
// ==================================================

function CheckValue({
  label,
  value,
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
      style={{
        background:
          "rgba(255,255,255,0.65)",
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
          marginBottom: 5,
        }}
      >
        {label}
      </div>

      <strong>
        ₹ {money(value)}
      </strong>
    </div>
  );
}