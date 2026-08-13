import { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "./CompanyHeader";

export default function DayBook() {
  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

    const [fromDate, setFromDate] =
  useState("");

const [toDate, setToDate] =
  useState("");

  // ==================================================
  // LOAD DAY BOOK
  // ==================================================

  const loadDayBook = async () => {
  try {
    setLoading(true);

    const params = {};

    if (fromDate) {
      params.fromDate = fromDate;
    }

    if (toDate) {
      params.toDate = toDate;
    }

    const res = await axios.get(
      "https://mudhikhana.onrender.com/accounts/day-book",
      {
        params,
      }
    );

    setTransactions(
      res.data.transactions || []
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
  // TOTAL DEBIT
  // ==================================================

  const totalDebit =
    transactions.reduce(
      (sum, transaction) =>
        sum +
        (Number(transaction.debit) || 0),
      0
    );

  // ==================================================
  // TOTAL CREDIT
  // ==================================================

  const totalCredit =
    transactions.reduce(
      (sum, transaction) =>
        sum +
        (Number(transaction.credit) || 0),
      0
    );

  const isBalanced =
    Math.abs(
      totalDebit - totalCredit
    ) < 0.01;

  return (
    <>
      {/* ==================================================
          PRINT CSS
      ================================================== */}

      <style>
        {`
          @media print {

            @page {
              size: A4 landscape;
              margin: 8mm;
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

            .day-book-print-area {
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
               DAY BOOK HEADER
            ========================================== */

            .day-book-header {
              width: 100% !important;

              margin-bottom: 10px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               SUMMARY
            ========================================== */

            .day-book-summary {
              display: grid !important;

              grid-template-columns:
                repeat(3, 1fr) !important;

              gap: 10px !important;

              width: 100% !important;

              margin-bottom: 12px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .day-book-summary > div {
              padding: 8px !important;
            }

            .day-book-summary h2 {
              font-size: 14px !important;
            }

            /* ==========================================
               TABLE
            ========================================== */

            .day-book-table {
              width: 100% !important;
              max-width: 100% !important;

              border-collapse: collapse !important;

              font-size: 9px !important;

              table-layout: fixed !important;
            }

            .day-book-table th,
            .day-book-table td {
              padding: 5px 6px !important;

              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }

            .day-book-table thead {
              display: table-header-group !important;
            }

            .day-book-table tfoot {
              display: table-footer-group !important;
            }

            .day-book-table tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               BALANCE CHECK
            ========================================== */

            .day-book-balance-check {
              margin-top: 10px !important;

              padding: 8px !important;

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
          MAIN DAY BOOK
      ================================================== */}

      <div
        className="day-book-print-area"
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
          className="day-book-header"
          style={{
            marginBottom: 20,
          }}
        >
          {/* ==========================================
              COMPANY INFORMATION
          ========================================== */}

          <CompanyHeader
            print={false}
          />

          {/* ==========================================
              DAY BOOK TITLE + BUTTONS
          ========================================== */}

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
                📖 Day Book
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Daily accounting
                transactions
              </p>
            </div>

            {/* ==================================================
    DATE FILTER
================================================== */}

<div
  className="no-print"
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 15,
  }}
>
  <label
    style={{
      fontWeight: 600,
      fontSize: 13,
    }}
  >
    From:
  </label>

  <input
    type="date"
    value={fromDate}
    onChange={(e) =>
      setFromDate(e.target.value)
    }
    style={{
      padding: "9px 10px",
      border:
        "1px solid #cbd5e1",
      borderRadius: 7,
    }}
  />

  <label
    style={{
      fontWeight: 600,
      fontSize: 13,
    }}
  >
    To:
  </label>

  <input
    type="date"
    value={toDate}
    onChange={(e) =>
      setToDate(e.target.value)
    }
    style={{
      padding: "9px 10px",
      border:
        "1px solid #cbd5e1",
      borderRadius: 7,
    }}
  />

  <button
    onClick={loadDayBook}
    style={{
      padding:
        "9px 16px",
      background:
        "#2563eb",
      color: "white",
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    🔍 Filter
  </button>

  <button
    onClick={() => {
      setFromDate("");
      setToDate("");

      setTimeout(
        () => loadDayBook(),
        0
      );
    }}
    style={{
      padding:
        "9px 16px",
      background:
        "#64748b",
      color: "white",
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    ✖ Clear
  </button>
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
                onClick={loadDayBook}
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
            Loading Day Book...
          </div>
        ) : (
          <>
            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div
              className="day-book-summary"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: 15,
                marginBottom: 20,
              }}
            >
              <SummaryCard
                title="🧾 Transactions"
                value={
                  transactions.length
                }
                isCurrency={false}
                background="#eff6ff"
                border="#bfdbfe"
              />

              <SummaryCard
                title="💳 Total Debit"
                value={totalDebit}
                background="#fff7ed"
                border="#fed7aa"
              />

              <SummaryCard
                title="💰 Total Credit"
                value={totalCredit}
                background="#f0fdf4"
                border="#bbf7d0"
              />
            </div>

            {/* ==================================================
                DAY BOOK TABLE
            ================================================== */}

            <div
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
                  background:
                    "#f8fafc",
                  borderBottom:
                    "1px solid #e2e8f0",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                  }}
                >
                  📋 Transaction Details
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  All accounting
                  transactions recorded
                  in the system
                </p>
              </div>

              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  className="day-book-table"
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
                          width: "9%",
                          padding: 10,
                          textAlign:
                            "left",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Date
                      </th>

                      <th
                        style={{
                          width: "10%",
                          padding: 10,
                          textAlign:
                            "left",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Voucher Type
                      </th>

                      <th
                        style={{
                          width: "10%",
                          padding: 10,
                          textAlign:
                            "left",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Voucher No
                      </th>

                      <th
                        style={{
                          width: "17%",
                          padding: 10,
                          textAlign:
                            "left",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Account
                      </th>

                      <th
                        style={{
                          width: "29%",
                          padding: 10,
                          textAlign:
                            "left",
                          borderBottom:
                            "2px solid #cbd5e1",
                        }}
                      >
                        Narration
                      </th>

                      <th
                        style={{
                          width: "12.5%",
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
                          width: "12.5%",
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
                    {transactions.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign:
                              "center",
                            padding: 30,
                            color:
                              "#64748b",
                          }}
                        >
                          No Transactions
                          Found
                        </td>
                      </tr>
                    ) : (
                      transactions.map(
                        (
                          transaction
                        ) => (
                          <tr
                            key={
                              transaction.id
                            }
                            style={{
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            <td
                              style={{
                                padding: 9,
                                verticalAlign:
                                  "top",
                              }}
                            >
                              {
                                transaction.transactionDate
                              }
                            </td>

                            <td
                              style={{
                                padding: 9,
                                verticalAlign:
                                  "top",
                              }}
                            >
                              {
                                transaction.voucherType
                              }
                            </td>

                            <td
                              style={{
                                padding: 9,
                                verticalAlign:
                                  "top",
                              }}
                            >
                              {
                                transaction.voucherNo
                              }
                            </td>

                            <td
                              style={{
                                padding: 9,
                                verticalAlign:
                                  "top",
                                fontWeight:
                                  500,
                              }}
                            >
                              {
                                transaction.accountName
                              }
                            </td>

                            <td
                              style={{
                                padding: 9,
                                verticalAlign:
                                  "top",
                                color:
                                  "#475569",
                              }}
                            >
                              {
                                transaction.narration
                              }
                            </td>

                            <td
                              style={{
                                padding: 9,
                                textAlign:
                                  "right",
                                verticalAlign:
                                  "top",
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
                                padding: 9,
                                textAlign:
                                  "right",
                                verticalAlign:
                                  "top",
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

                  {/* ==================================================
                      TOTALS
                  ================================================== */}

                  {transactions.length >
                    0 && (
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
                          colSpan="5"
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
                            totalDebit
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
                            totalCredit
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* ==================================================
                DAY BOOK BALANCE CHECK
            ================================================== */}

            <div
              className="day-book-balance-check"
              style={{
                marginTop: 20,
                padding: 18,
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
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>
                    ⚖️ Day Book Balance
                  </strong>

                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 12,
                      color:
                        "#64748b",
                    }}
                  >
                    Debit and credit
                    totals for the
                    displayed transactions
                  </div>
                </div>

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
                    : "⚠️ DIFFERENCE"}
                </strong>
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
  isCurrency = true,
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
        {isCurrency
          ? `₹ ${money(value)}`
          : value}
      </h2>
    </div>
  );
}