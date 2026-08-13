import { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "./CompanyHeader";

export default function PrintDayBook() {
  const [transactions, setTransactions] =
    useState([]);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // LOAD DAY BOOK DATA
  // ==========================================

  const loadDayBook = async () => {
    try {
      setLoading(true);

      const accountsRes =
        await axios.get(
          "https://mudhikhana.onrender.com/accounts"
        );

      const accounts =
        accountsRes.data || [];

      const allTransactions = [];

      for (const account of accounts) {
        try {
          const ledgerRes =
            await axios.get(
              `https://mudhikhana.onrender.com/accounts/${account.id}/ledger`
            );

          const ledger =
            ledgerRes.data || {};

          const accountTransactions =
            ledger.transactions || [];

          accountTransactions.forEach(
            (transaction) => {
              allTransactions.push({
                ...transaction,

                accountName:
                  account.name ||
                  account.accountName ||
                  `Account ${account.id}`,
              });
            }
          );
        } catch (err) {
          console.log(
            "Ledger load error:",
            account.id,
            err
          );
        }
      }

      // ==========================================
      // SORT BY DATE
      // ==========================================

      allTransactions.sort((a, b) => {
        const dateA = new Date(
          a.transactionDate ||
            a.date ||
            0
        );

        const dateB = new Date(
          b.transactionDate ||
            b.date ||
            0
        );

        if (
          dateA.getTime() !==
          dateB.getTime()
        ) {
          return (
            dateA.getTime() -
            dateB.getTime()
          );
        }

        return (
          Number(a.id || 0) -
          Number(b.id || 0)
        );
      });

      setTransactions(
        allTransactions
      );
    } catch (err) {
      console.log(
        "Day Book Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load Day Book"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDayBook();
  }, []);

  // ==========================================
  // MONEY
  // ==========================================

  const money = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  // ==========================================
  // DATE FILTER
  // ==========================================

  const filteredTransactions =
    selectedDate
      ? transactions.filter(
          (transaction) => {
            const transactionDate =
              transaction.transactionDate ||
              transaction.date ||
              "";

            return (
              String(
                transactionDate
              ).slice(0, 10) ===
              selectedDate
            );
          }
        )
      : transactions;

  // ==========================================
  // TOTALS
  // ==========================================

  const totalDebit =
    filteredTransactions.reduce(
      (sum, transaction) =>
        sum +
        (Number(
          transaction.debit
        ) || 0),
      0
    );

  const totalCredit =
    filteredTransactions.reduce(
      (sum, transaction) =>
        sum +
        (Number(
          transaction.credit
        ) || 0),
      0
    );

  const difference =
    totalDebit - totalCredit;

  const isBalanced =
    Math.abs(difference) <
    0.01;

  // ==========================================
  // PRINT
  // ==========================================

  const printReport = () => {
    window.print();
  };

  return (
    <>
      {/* ======================================
          MAIN PAGE
      ====================================== */}

      <div
        className="day-book-page"
        style={{
          padding: 24,
          background: "#f8fafc",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* ======================================
            SCREEN HEADER
        ====================================== */}

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
              🖨️ Print Day Book
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Chronological accounting
              transactions
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            {/* REFRESH */}

            <button
              onClick={loadDayBook}
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

            {/* PRINT */}

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
              🖨️ Print Day Book
            </button>
          </div>
        </div>

        {/* ======================================
            DATE FILTER
        ====================================== */}

        <div
          className="no-print"
          style={{
            background: "white",
            padding: 18,
            borderRadius: 10,
            border:
              "1px solid #e2e8f0",
            marginBottom: 20,
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 13,
              fontWeight: "bold",
              color: "#334155",
            }}
          >
            Filter by Date
          </label>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              style={{
                padding:
                  "9px 11px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
              }}
            />

            {selectedDate && (
              <button
                onClick={() =>
                  setSelectedDate("")
                }
                style={{
                  padding:
                    "9px 13px",
                  background: "white",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ======================================
            LOADING
        ====================================== */}

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

            Loading Day Book...
          </div>
        ) : (
          <div
            className="print-day-book"
            style={{
              width: "100%",
              maxWidth: 1200,
              margin: "0 auto",
              background: "white",
              padding: 30,
              border:
                "1px solid #d1d5db",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.08)",
              boxSizing: "border-box",
            }}
          >
            {/* ==================================
                COMPANY HEADER
            ================================== */}

            <CompanyHeader print={true} />

            {/* ==================================
                REPORT TITLE
            ================================== */}

            <div
              style={{
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              <h2
                style={{
                  margin:
                    "6px 0 0",
                  fontSize: 19,
                }}
              >
                Day Book
              </h2>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#64748b",
                  fontSize: 11,
                }}
              >
                {selectedDate
                  ? `Date: ${new Date(
                      selectedDate
                    ).toLocaleDateString(
                      "en-IN"
                    )}`
                  : `As on ${new Date().toLocaleDateString(
                      "en-IN"
                    )}`}
              </p>
            </div>

            {/* ==================================
                SUMMARY
            ================================== */}

            <div
              className="day-book-summary"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: 10,
                margin:
                  "15px 0 18px",
              }}
            >
              <div
                style={{
                  border:
                    "1px solid #d1d5db",
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                  }}
                >
                  ENTRIES
                </div>

                <h2
                  style={{
                    margin:
                      "4px 0",
                    color: "#2563eb",
                    fontSize: 17,
                  }}
                >
                  {
                    filteredTransactions.length
                  }
                </h2>
              </div>

              <div
                style={{
                  border:
                    "1px solid #d1d5db",
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                  }}
                >
                  TOTAL DEBIT
                </div>

                <h2
                  style={{
                    margin:
                      "4px 0",
                    color: "#2563eb",
                    fontSize: 17,
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
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                  }}
                >
                  TOTAL CREDIT
                </div>

                <h2
                  style={{
                    margin:
                      "4px 0",
                    color: "#15803d",
                    fontSize: 17,
                  }}
                >
                  ₹{" "}
                  {money(
                    totalCredit
                  )}
                </h2>
              </div>
            </div>

            {/* ==================================
                DAY BOOK TABLE
            ================================== */}

            <table
              className="day-book-table"
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
                      width: "10%",
                    }}
                  >
                    Date
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "12%",
                    }}
                  >
                    Voucher No
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "19%",
                    }}
                  >
                    Account
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "12%",
                    }}
                  >
                    Type
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "25%",
                    }}
                  >
                    Narration
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "11%",
                      textAlign:
                        "right",
                    }}
                  >
                    Debit
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "11%",
                      textAlign:
                        "right",
                    }}
                  >
                    Credit
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        ...tdStyle,
                        textAlign:
                          "center",
                        padding: 25,
                      }}
                    >
                      No transactions
                      found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(
                    (
                      transaction,
                      index
                    ) => (
                      <tr
                        key={
                          transaction.id ||
                          index
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          {transaction.transactionDate ||
                            transaction.date ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <b>
                            {transaction.voucherNo ||
                              transaction.voucherNumber ||
                              transaction.voucherId ||
                              "-"}
                          </b>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            transaction.accountName
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {transaction.voucherType ||
                            transaction.type ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {transaction.narration ||
                            transaction.description ||
                            "-"}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          {Number(
                            transaction.debit
                          ) > 0
                            ? `₹ ${money(
                                transaction.debit
                              )}`
                            : "-"}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          {Number(
                            transaction.credit
                          ) > 0
                            ? `₹ ${money(
                                transaction.credit
                              )}`
                            : "-"}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td
                    colSpan="5"
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

            {/* ==================================
                BALANCE STATUS
            ================================== */}

            <div
              className="day-book-balance"
              style={{
                marginTop: 15,
                padding: 9,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 11,
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
                ? "✓ Day Book is balanced"
                : "⚠ Debit and Credit totals are different"}
            </div>

            {/* ==================================
                SIGNATURES
            ================================== */}

            <div
              className="day-book-signatures"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 70,
                marginTop: 40,
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

            {/* ==================================
                FOOTER
            ================================== */}

            <div
              style={{
                marginTop: 15,
                paddingTop: 7,
                borderTop:
                  "1px solid #e5e7eb",
                textAlign: "center",
                fontSize: 8,
                color: "#64748b",
              }}
            >
              Generated by company
              accounting system
            </div>
          </div>
        )}
      </div>

      {/* ======================================
          PRINT CSS
      ====================================== */}

      <style>
        {`
          @media print {

            /* ==================================
               A4 LANDSCAPE
            ================================== */

            @page {
              size: A4 landscape;
              margin: 7mm;
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

            /* ==================================
               HIDE SIDEBAR
            ================================== */

            aside,
            nav,
            .sidebar {
              display: none !important;
            }

            /* ==================================
               HIDE SCREEN CONTROLS
            ================================== */

            .no-print {
              display: none !important;
            }

            /* ==================================
               MAIN PAGE
            ================================== */

            .day-book-page {
              width: 100% !important;
              min-height: 0 !important;

              margin: 0 !important;
              padding: 0 !important;

              background: white !important;

              box-sizing: border-box !important;
            }

            /* ==================================
               PRINT DOCUMENT
            ================================== */

            .print-day-book {
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

            /* ==================================
               COMPANY HEADER
            ================================== */

            .company-header {
              margin-bottom: 6px !important;
              padding-bottom: 7px !important;
            }

            .company-header h1 {
              font-size: 21px !important;
            }

            .company-header img {
              max-width: 65px !important;
              max-height: 50px !important;
            }

            /* ==================================
               REPORT HEADER
            ================================== */

            .print-day-book h2 {
              font-size: 16px !important;
            }

            /* ==================================
               SUMMARY
            ================================== */

            .day-book-summary {
              display: grid !important;

              grid-template-columns:
                repeat(3, 1fr) !important;

              gap: 6px !important;

              margin:
                7px 0 9px !important;
            }

            .day-book-summary > div {
              padding: 5px !important;
            }

            .day-book-summary h2 {
              font-size: 12px !important;
            }

            /* ==================================
               DAY BOOK TABLE
            ================================== */

            .day-book-table {
              width: 100% !important;

              border-collapse:
                collapse !important;

              table-layout:
                fixed !important;

              font-size: 8.5px !important;
            }

            .day-book-table th {
              padding: 4px !important;

              font-size: 8.5px !important;
            }

            .day-book-table td {
              padding: 3px !important;

              font-size: 8.5px !important;

              word-wrap:
                break-word !important;

              overflow-wrap:
                break-word !important;
            }

            /* ==================================
               REPEAT TABLE HEADER
            ================================== */

            .day-book-table thead {
              display:
                table-header-group !important;
            }

            .day-book-table tfoot {
              display:
                table-footer-group !important;
            }

            /* ==================================
               KEEP ROWS TOGETHER
            ================================== */

            .day-book-table tr {
              break-inside:
                avoid !important;

              page-break-inside:
                avoid !important;
            }

            /* ==================================
               BALANCE
            ================================== */

            .day-book-balance {
              margin-top: 7px !important;

              padding: 5px !important;

              font-size: 8.5px !important;

              break-inside:
                avoid !important;

              page-break-inside:
                avoid !important;
            }

            /* ==================================
               SIGNATURES
            ================================== */

            .day-book-signatures {
              margin-top: 20px !important;

              break-inside:
                avoid !important;

              page-break-inside:
                avoid !important;
            }

            /* ==================================
               FOOTER
            ================================== */

            .print-day-book > div {
              break-inside: avoid;
            }

            /* ==================================
               PRINT COLORS
            ================================== */

            * {
              -webkit-print-color-adjust:
                exact !important;

              print-color-adjust:
                exact !important;
            }
          }

          @media screen {
            .print-day-book {
              margin-bottom: 40px;
            }
          }
        `}
      </style>
    </>
  );
}

// ==========================================
// TABLE STYLES
// ==========================================

const thStyle = {
  padding: "7px",
  background: "#f1f5f9",
  border:
    "1px solid #cbd5e1",
  textAlign: "left",
  fontSize: 10,
};

const tdStyle = {
  padding: "6px",
  border:
    "1px solid #cbd5e1",
  fontSize: 10,
};