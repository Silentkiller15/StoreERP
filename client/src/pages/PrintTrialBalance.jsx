import { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "./CompanyHeader";

export default function PrintTrialBalance() {
  const [accounts, setAccounts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // LOAD TRIAL BALANCE
  // ==================================================

  const loadTrialBalance = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/accounts"
      );

      const accountList =
        res.data || [];

      const rows = [];

      for (const account of accountList) {
        try {
          const ledgerRes =
            await axios.get(
              `http://localhost:5000/accounts/${account.id}/ledger`
            );

          const ledger =
            ledgerRes.data || {};

          const transactions =
            ledger.transactions || [];

          let debit = 0;
          let credit = 0;

          transactions.forEach(
            (transaction) => {
              debit +=
                Number(
                  transaction.debit
                ) || 0;

              credit +=
                Number(
                  transaction.credit
                ) || 0;
            }
          );

          rows.push({
            id: account.id,

            name:
              account.name ||
              account.accountName ||
              `Account ${account.id}`,

            type:
              account.type ||
              account.accountType ||
              "-",

            debit,
            credit,
          });
        } catch (err) {
          console.log(
            "Account ledger error:",
            account.id,
            err
          );
        }
      }

      setAccounts(rows);
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

  // ==================================================
  // TOTALS
  // ==================================================

  const totalDebit =
    accounts.reduce(
      (sum, account) =>
        sum + account.debit,
      0
    );

  const totalCredit =
    accounts.reduce(
      (sum, account) =>
        sum + account.credit,
      0
    );

  const difference =
    totalDebit - totalCredit;

  const isBalanced =
    Math.abs(difference) <
    0.01;

  // ==================================================
  // PRINT
  // ==================================================

  const printReport = () => {
    window.print();
  };

  return (
    <>
      {/* ==================================================
          MAIN PAGE
      ================================================== */}

      <div
        className="trial-balance-page"
        style={{
          padding: 24,
          background: "#f8fafc",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* ==================================================
            SCREEN HEADER
        ================================================== */}

        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: "bold",
                letterSpacing: 2,
                color: "#64748b",
              }}
            >
              COMPANY
            </div>

            <h1
              style={{
                margin: "5px 0",
                fontSize: 26,
              }}
            >
              🖨️ Print Trial Balance
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Account-wise debit and
              credit summary
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              onClick={loadTrialBalance}
              style={{
                padding:
                  "10px 15px",
                background: "white",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🔄 Refresh
            </button>

            <button
              onClick={printReport}
              disabled={loading}
              style={{
                padding:
                  "10px 18px",
                background: loading
                  ? "#cbd5e1"
                  : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "bold",
              }}
            >
              🖨️ Print Trial Balance
            </button>
          </div>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div
            className="no-print"
            style={{
              background: "white",
              padding: 50,
              borderRadius: 10,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: 30,
                marginBottom: 10,
              }}
            >
              ⏳
            </div>

            Loading Trial Balance...
          </div>
        ) : (
          <div
            className="print-trial-balance"
            style={{
              width: "100%",
              maxWidth: 900,
              margin: "0 auto",
              background: "white",
              padding: 35,
              border:
                "1px solid #d1d5db",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.08)",
              boxSizing: "border-box",
            }}
          >
            {/* ==================================================
                COMPANY HEADER
            ================================================== */}

            <CompanyHeader print={true} />

            {/* ==================================================
                REPORT TITLE
            ================================================== */}

            <div
              style={{
                textAlign: "center",
                marginBottom: 15,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                Trial Balance
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                As on{" "}
                {new Date().toLocaleDateString(
                  "en-IN"
                )}
              </p>
            </div>

            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div
              className="trial-summary"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: 12,
                margin:
                  "18px 0 20px",
              }}
            >
              <div
                style={{
                  border:
                    "1px solid #d1d5db",
                  padding: 12,
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                    fontWeight:
                      "bold",
                  }}
                >
                  TOTAL DEBIT
                </div>

                <h2
                  style={{
                    margin:
                      "4px 0",
                    color: "#2563eb",
                    fontSize: 18,
                  }}
                >
                  ₹{" "}
                  {money(
                    totalDebit
                  )}
                </h2>
              </div>

              <div
                style={{
                  border:
                    "1px solid #d1d5db",
                  padding: 12,
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                    fontWeight:
                      "bold",
                  }}
                >
                  TOTAL CREDIT
                </div>

                <h2
                  style={{
                    margin:
                      "4px 0",
                    color: "#15803d",
                    fontSize: 18,
                  }}
                >
                  ₹{" "}
                  {money(
                    totalCredit
                  )}
                </h2>
              </div>

              <div
                style={{
                  border:
                    "1px solid #d1d5db",
                  padding: 12,
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                    fontWeight:
                      "bold",
                  }}
                >
                  DIFFERENCE
                </div>

                <h2
                  style={{
                    margin:
                      "4px 0",
                    color: isBalanced
                      ? "#15803d"
                      : "#dc2626",
                    fontSize: 18,
                  }}
                >
                  ₹{" "}
                  {money(
                    Math.abs(
                      difference
                    )
                  )}
                </h2>
              </div>
            </div>

            {/* ==================================================
                BALANCE STATUS
            ================================================== */}

            <div
              style={{
                marginBottom: 18,
                padding: 10,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 12,
                background:
                  isBalanced
                    ? "#dcfce7"
                    : "#fee2e2",
                color:
                  isBalanced
                    ? "#166534"
                    : "#991b1b",
                border:
                  "1px solid " +
                  (isBalanced
                    ? "#86efac"
                    : "#fca5a5"),
                borderRadius: 5,
              }}
            >
              {isBalanced
                ? "✓ Trial Balance is balanced"
                : "⚠ Trial Balance is not balanced"}
            </div>

            {/* ==================================================
                ACCOUNT TABLE
            ================================================== */}

            <table
              className="trial-balance-table"
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                tableLayout:
                  "fixed",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...thStyle,
                      width: "7%",
                    }}
                  >
                    #
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "35%",
                    }}
                  >
                    Account
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "20%",
                    }}
                  >
                    Type
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "19%",
                      textAlign:
                        "right",
                    }}
                  >
                    Debit
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "19%",
                      textAlign:
                        "right",
                    }}
                  >
                    Credit
                  </th>
                </tr>
              </thead>

              <tbody>
                {accounts.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        ...tdStyle,
                        textAlign:
                          "center",
                        padding: 25,
                      }}
                    >
                      No account data
                      found.
                    </td>
                  </tr>
                ) : (
                  accounts.map(
                    (
                      account,
                      index
                    ) => (
                      <tr
                        key={
                          account.id ||
                          index
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          {index + 1}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <b>
                            {
                              account.name
                            }
                          </b>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            account.type
                          }
                        </td>

                        <td
                          style={{
                            ...tdStyle,
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
                            ...tdStyle,
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

              <tfoot>
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        "bold",
                      background:
                        "#f1f5f9",
                    }}
                  >
                    GRAND TOTAL
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        "bold",
                      background:
                        "#f1f5f9",
                    }}
                  >
                    ₹{" "}
                    {money(
                      totalDebit
                    )}
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        "bold",
                      background:
                        "#f1f5f9",
                    }}
                  >
                    ₹{" "}
                    {money(
                      totalCredit
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* ==================================================
                FOOTER SUMMARY
            ================================================== */}

            <div
              className="trial-footer-summary"
              style={{
                marginTop: 20,
                padding: 12,
                border:
                  "1px solid #d1d5db",
                borderRadius: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                }}
              >
                <span>
                  Total Accounts:
                </span>

                <strong>
                  {accounts.length}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginTop: 6,
                }}
              >
                <span>
                  Debit Total:
                </span>

                <strong>
                  ₹{" "}
                  {money(
                    totalDebit
                  )}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginTop: 6,
                }}
              >
                <span>
                  Credit Total:
                </span>

                <strong>
                  ₹{" "}
                  {money(
                    totalCredit
                  )}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop:
                    "1px solid #e5e7eb",
                }}
              >
                <span>
                  Difference:
                </span>

                <strong
                  style={{
                    color: isBalanced
                      ? "#15803d"
                      : "#dc2626",
                  }}
                >
                  ₹{" "}
                  {money(
                    Math.abs(
                      difference
                    )
                  )}
                </strong>
              </div>
            </div>

            {/* ==================================================
                SIGNATURES
            ================================================== */}

            <div
              className="trial-signatures"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 80,
                marginTop: 45,
              }}
            >
              <div
                style={{
                  borderTop:
                    "1px solid #111827",
                  paddingTop: 6,
                  textAlign:
                    "center",
                  fontSize: 10,
                }}
              >
                Prepared By
              </div>

              <div
                style={{
                  borderTop:
                    "1px solid #111827",
                  paddingTop: 6,
                  textAlign:
                    "center",
                  fontSize: 10,
                }}
              >
                Authorized Signature
              </div>
            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div
              style={{
                marginTop: 18,
                paddingTop: 8,
                borderTop:
                  "1px solid #e5e7eb",
                textAlign: "center",
                fontSize: 9,
                color: "#64748b",
              }}
            >
              Generated by company
              accounting system
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          PRINT CSS
      ================================================== */}

      <style>
        {`
          @media print {

            @page {
              size: A4 portrait;
              margin: 8mm;
            }

            html,
            body {
              width: 100% !important;
              height: auto !important;

              margin: 0 !important;
              padding: 0 !important;

              background: white !important;

              overflow: visible !important;

              transform: none !important;
              rotate: none !important;

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

            /* ==========================================
               HIDE SIDEBAR
            ========================================== */

            aside,
            nav,
            .sidebar {
              display: none !important;
            }

            /* ==========================================
               HIDE SCREEN CONTROLS
            ========================================== */

            .no-print {
              display: none !important;
            }

            /* ==========================================
               MAIN PAGE
            ========================================== */

            .trial-balance-page {
              width: 100% !important;
              min-height: 0 !important;

              margin: 0 !important;
              padding: 0 !important;

              background: white !important;

              box-sizing: border-box !important;
            }

            /* ==========================================
               REPORT
            ========================================== */

            .print-trial-balance {
              display: block !important;

              position: relative !important;

              width: 100% !important;
              max-width: none !important;

              margin: 0 !important;
              padding: 0 !important;

              background: white !important;

              border: none !important;
              box-shadow: none !important;

              box-sizing: border-box !important;

              font-size: 9px !important;
            }

            /* ==========================================
               COMPANY HEADER
            ========================================== */

            .company-header {
              margin-bottom: 8px !important;
              padding-bottom: 8px !important;
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

            .print-trial-balance h2 {
              font-size: 16px !important;
            }

            /* ==========================================
               SUMMARY
            ========================================== */

            .trial-summary {
              display: grid !important;

              grid-template-columns:
                repeat(3, 1fr) !important;

              gap: 6px !important;

              margin:
                10px 0 !important;
            }

            .trial-summary > div {
              padding: 7px !important;
            }

            .trial-summary h2 {
              font-size: 13px !important;
            }

            /* ==========================================
               TABLE
            ========================================== */

            .trial-balance-table {
              width: 100% !important;

              border-collapse:
                collapse !important;

              table-layout:
                fixed !important;

              font-size: 8.5px !important;
            }

            .trial-balance-table th {
              padding: 5px !important;

              font-size: 8.5px !important;
            }

            .trial-balance-table td {
              padding: 4px !important;

              font-size: 8.5px !important;

              word-wrap:
                break-word !important;

              overflow-wrap:
                break-word !important;
            }

            .trial-balance-table thead {
              display:
                table-header-group !important;
            }

            .trial-balance-table tfoot {
              display:
                table-footer-group !important;
            }

            .trial-balance-table tr {
              break-inside:
                avoid !important;

              page-break-inside:
                avoid !important;
            }

            /* ==========================================
               FOOTER SUMMARY
            ========================================== */

            .trial-footer-summary {
              margin-top: 10px !important;

              padding: 8px !important;

              font-size: 9px !important;

              break-inside:
                avoid !important;

              page-break-inside:
                avoid !important;
            }

            /* ==========================================
               SIGNATURES
            ========================================== */

            .trial-signatures {
              margin-top: 25px !important;

              break-inside:
                avoid !important;

              page-break-inside:
                avoid !important;
            }

            /* ==========================================
               PRINT COLORS
            ========================================== */

            * {
              -webkit-print-color-adjust:
                exact !important;

              print-color-adjust:
                exact !important;
            }
          }

          @media screen {
            .print-trial-balance {
              margin-bottom: 40px;
            }
          }
        `}
      </style>
    </>
  );
}

// ==================================================
// TABLE STYLES
// ==================================================

const thStyle = {
  padding: "8px",
  background: "#f1f5f9",
  border:
    "1px solid #cbd5e1",
  textAlign: "left",
  fontSize: 11,
};

const tdStyle = {
  padding: "7px",
  border:
    "1px solid #cbd5e1",
  fontSize: 11,
};