import { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "./CompanyHeader";

export default function TrialBalance() {
  const [report, setReport] = useState({
    accounts: [],
    totalDebit: 0,
    totalCredit: 0,
    difference: 0,
    isBalanced: false,
  });

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // LOAD TRIAL BALANCE
  // ==================================================

  const loadTrialBalance = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/accounts/trial-balance"
      );

      setReport({
        accounts:
          res.data.accounts || [],

        totalDebit:
          Number(
            res.data.totalDebit
          ) || 0,

        totalCredit:
          Number(
            res.data.totalCredit
          ) || 0,

        difference:
          Number(
            res.data.difference
          ) || 0,

        isBalanced:
          Boolean(
            res.data.isBalanced
          ),
      });
    } catch (err) {
      console.log(
        "Trial Balance Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load Trial Balance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrialBalance();
  }, []);

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
               HIDE BUTTONS
            ========================================== */

            button,
            .no-print {
              display: none !important;
            }

            /* ==========================================
               MAIN PRINT AREA
            ========================================== */

            .trial-balance-print-area {
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
               TRIAL BALANCE HEADER
            ========================================== */

            .trial-balance-header {
              width: 100% !important;

              margin-bottom: 10px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               SUMMARY
            ========================================== */

            .trial-balance-summary {
              display: grid !important;

              grid-template-columns:
                repeat(3, 1fr) !important;

              gap: 8px !important;

              width: 100% !important;

              margin-bottom: 10px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .trial-balance-summary > div {
              padding: 8px !important;
            }

            .trial-balance-summary h2 {
              font-size: 14px !important;
            }

            /* ==========================================
               TABLE
            ========================================== */

            .trial-balance-table {
              width: 100% !important;
              max-width: 100% !important;

              border-collapse: collapse !important;

              font-size: 10px !important;

              table-layout: fixed !important;
            }

            .trial-balance-table th,
            .trial-balance-table td {
              padding: 5px 6px !important;

              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }

            .trial-balance-table thead {
              display: table-header-group !important;
            }

            .trial-balance-table tfoot {
              display: table-footer-group !important;
            }

            .trial-balance-table tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               BALANCE CHECK
            ========================================== */

            .trial-balance-check {
              break-inside: avoid !important;
              page-break-inside: avoid !important;

              margin-top: 10px !important;
              padding: 10px !important;
            }

            /* ==========================================
               CARDS
            ========================================== */

            .trial-balance-card {
              box-shadow: none !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
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
          MAIN TRIAL BALANCE
      ================================================== */}

      <div
        className="trial-balance-print-area"
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
          className="trial-balance-header"
          style={{
            marginBottom: 24,
          }}
        >
          {/* COMPANY INFORMATION */}

          <CompanyHeader
            print={false}
          />

          {/* REPORT TITLE + BUTTONS */}

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
                📊 Trial Balance
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Account-wise debit and
                credit balances
              </p>
            </div>

            {/* ACTION BUTTONS */}

            <div
              className="no-print"
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <button
                onClick={
                  loadTrialBalance
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
            Loading Trial Balance...
          </div>
        ) : (
          <>
            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div
              className="trial-balance-summary"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: 15,
                marginBottom: 20,
              }}
            >
              <SummaryCard
                title="💳 Total Debit"
                value={
                  report.totalDebit
                }
                background="#eff6ff"
                border="#bfdbfe"
              />

              <SummaryCard
                title="💰 Total Credit"
                value={
                  report.totalCredit
                }
                background="#f0fdf4"
                border="#bbf7d0"
              />

              <SummaryCard
                title={
                  report.isBalanced
                    ? "✅ Status"
                    : "⚠️ Difference"
                }
                value={
                  report.isBalanced
                    ? 0
                    : Math.abs(
                        report.difference
                      )
                }
                background={
                  report.isBalanced
                    ? "#dcfce7"
                    : "#fee2e2"
                }
                border={
                  report.isBalanced
                    ? "#86efac"
                    : "#fecaca"
                }
                status={
                  report.isBalanced
                    ? "Balanced"
                    : "Not Balanced"
                }
              />
            </div>

            {/* ==================================================
                TRIAL BALANCE TABLE
            ================================================== */}

            <div
              className="trial-balance-card"
              style={{
                background: "white",
                border:
                  "1px solid #e2e8f0",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding:
                    "15px 18px",
                  borderBottom:
                    "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                  }}
                >
                  📋 Account Balances
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  Debit and credit
                  balances by account
                </p>
              </div>

              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  className="trial-balance-table"
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
                          "#e2e8f0",
                      }}
                    >
                      <th
                        style={{
                          width: "12%",
                          padding: 10,
                          textAlign:
                            "left",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Code
                      </th>

                      <th
                        style={{
                          width: "28%",
                          padding: 10,
                          textAlign:
                            "left",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Account Name
                      </th>

                      <th
                        style={{
                          width: "25%",
                          padding: 10,
                          textAlign:
                            "left",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Group
                      </th>

                      <th
                        style={{
                          width: "17.5%",
                          padding: 10,
                          textAlign:
                            "right",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Debit
                      </th>

                      <th
                        style={{
                          width: "17.5%",
                          padding: 10,
                          textAlign:
                            "right",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Credit
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.accounts
                      .length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            padding: 30,
                            textAlign:
                              "center",
                            color:
                              "#64748b",
                          }}
                        >
                          No accounts
                          found.
                        </td>
                      </tr>
                    ) : (
                      report.accounts.map(
                        (account) => (
                          <tr
                            key={
                              account.id
                            }
                            style={{
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            <td
                              style={{
                                padding: 9,
                                color:
                                  "#64748b",
                              }}
                            >
                              {account.code ||
                                "-"}
                            </td>

                            <td
                              style={{
                                padding: 9,
                                fontWeight:
                                  500,
                              }}
                            >
                              {
                                account.name
                              }
                            </td>

                            <td
                              style={{
                                padding: 9,
                                color:
                                  "#64748b",
                              }}
                            >
                              {account.groupName ||
                                "-"}
                            </td>

                            <td
                              style={{
                                padding: 9,
                                textAlign:
                                  "right",
                              }}
                            >
                              ₹{" "}
                              {money(
                                account.debit
                              )}
                            </td>

                            <td
                              style={{
                                padding: 9,
                                textAlign:
                                  "right",
                              }}
                            >
                              ₹{" "}
                              {money(
                                account.credit
                              )}
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>

                  {/* TOTAL */}

                  <tfoot>
                    <tr
                      style={{
                        background:
                          "#f1f5f9",
                        fontWeight:
                          "bold",
                      }}
                    >
                      <td
                        colSpan="3"
                        style={{
                          padding: 12,
                          textAlign:
                            "right",
                          borderTop:
                            "2px solid #334155",
                        }}
                      >
                        TOTAL
                      </td>

                      <td
                        style={{
                          padding: 12,
                          textAlign:
                            "right",
                          borderTop:
                            "2px solid #334155",
                        }}
                      >
                        ₹{" "}
                        {money(
                          report.totalDebit
                        )}
                      </td>

                      <td
                        style={{
                          padding: 12,
                          textAlign:
                            "right",
                          borderTop:
                            "2px solid #334155",
                        }}
                      >
                        ₹{" "}
                        {money(
                          report.totalCredit
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ==================================================
                BALANCE CHECK
            ================================================== */}

            <div
              className="trial-balance-check"
              style={{
                marginTop: 20,
                padding: 20,
                borderRadius: 10,

                background:
                  report.isBalanced
                    ? "#dcfce7"
                    : "#fee2e2",

                border:
                  report.isBalanced
                    ? "1px solid #86efac"
                    : "1px solid #fecaca",

                color:
                  report.isBalanced
                    ? "#166534"
                    : "#991b1b",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
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

                <strong>
                  {report.isBalanced
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
                  label="Total Debit"
                  value={
                    report.totalDebit
                  }
                />

                <CheckValue
                  label="Total Credit"
                  value={
                    report.totalCredit
                  }
                />

                <CheckValue
                  label="Difference"
                  value={Math.abs(
                    report.difference
                  )}
                />
              </div>

              <div
                style={{
                  marginTop: 12,
                  fontWeight: 600,
                }}
              >
                {report.isBalanced
                  ? "✅ Trial Balance is Balanced"
                  : "⚠️ Trial Balance is Not Balanced"}
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
  status,
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
      className="trial-balance-card"
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

      {status ? (
        <h2
          style={{
            margin: "8px 0 0",
            fontSize: 23,
          }}
        >
          {status}
        </h2>
      ) : (
        <h2
          style={{
            margin: "8px 0 0",
            fontSize: 23,
          }}
        >
          ₹ {money(value)}
        </h2>
      )}
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