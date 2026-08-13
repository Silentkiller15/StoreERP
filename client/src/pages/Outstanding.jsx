import { useEffect, useState } from "react";
import axios from "axios";

export default function Outstanding() {
  const [report, setReport] = useState({
    receivables: [],
    payables: [],
    totalReceivable: 0,
    totalPayable: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadOutstanding = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://mudhikhana.onrender.com/accounts/outstanding"
      );

      setReport({
        receivables:
          res.data.receivables || [],

        payables:
          res.data.payables || [],

        totalReceivable:
          Number(
            res.data.totalReceivable
          ) || 0,

        totalPayable:
          Number(
            res.data.totalPayable
          ) || 0,
      });
    } catch (err) {
      console.log(
        "Outstanding Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load Outstanding Report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutstanding();
  }, []);

  const money = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  const netPosition =
    report.totalReceivable -
    report.totalPayable;

  return (
    <>
      {/* ==================================================
          PRINT CSS
      ================================================== */}

      <style>
        {`
          @media print {

            /* ==========================================
               FORCE A4 PORTRAIT
            ========================================== */

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
            }

            #root {
              width: 100% !important;
              height: auto !important;

              margin: 0 !important;
              padding: 0 !important;

              background: white !important;

              transform: none !important;
              rotate: none !important;
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

            .outstanding-print-area {
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
               HEADER
            ========================================== */

            .outstanding-header {
              display: flex !important;

              width: 100% !important;

              margin-bottom: 10px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               SUMMARY CARDS
            ========================================== */

            .outstanding-summary {
              display: grid !important;

              grid-template-columns:
                repeat(3, 1fr) !important;

              gap: 8px !important;

              width: 100% !important;

              margin-bottom: 12px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               SECTION
            ========================================== */

            .outstanding-section {
              width: 100% !important;

              break-inside: auto !important;
              page-break-inside: auto !important;

              margin-bottom: 12px !important;
            }

            /* ==========================================
               TABLE
            ========================================== */

            .outstanding-table {
              width: 100% !important;
              max-width: 100% !important;

              border-collapse: collapse !important;

              font-size: 9px !important;

              table-layout: fixed !important;
            }

            .outstanding-table th,
            .outstanding-table td {
              padding: 5px 5px !important;

              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }

            .outstanding-table thead {
              display: table-header-group !important;
            }

            .outstanding-table tfoot {
              display: table-footer-group !important;
            }

            .outstanding-table tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* ==========================================
               NET SUMMARY
            ========================================== */

            .outstanding-net-summary {
              break-inside: avoid !important;
              page-break-inside: avoid !important;

              margin-top: 12px !important;
            }

            /* ==========================================
               PRINT COLORS
            ========================================== */

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      {/* ==================================================
          MAIN OUTSTANDING REPORT
      ================================================== */}

      <div
        className="outstanding-print-area"
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
          className="outstanding-header"
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
              STOREERP
            </div>

            <h1
              style={{
                margin: "5px 0",
                fontSize: 26,
              }}
            >
              💰 Outstanding Report
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Receivables from customers
              and payables to suppliers
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
              onClick={loadOutstanding}
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
            Loading Outstanding Report...
          </div>
        ) : (
          <>
            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div
              className="outstanding-summary"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: 15,
                marginBottom: 20,
              }}
            >
              <SummaryCard
                title="🟢 Total Receivable"
                value={
                  report.totalReceivable
                }
                background="#dcfce7"
                border="#86efac"
                valueColor="#15803d"
              />

              <SummaryCard
                title="🔴 Total Payable"
                value={
                  report.totalPayable
                }
                background="#fee2e2"
                border="#fca5a5"
                valueColor="#dc2626"
              />

              <SummaryCard
                title={
                  netPosition >= 0
                    ? "💰 Net Receivable"
                    : "⚠️ Net Payable"
                }
                value={Math.abs(
                  netPosition
                )}
                background={
                  netPosition >= 0
                    ? "#eff6ff"
                    : "#fff7ed"
                }
                border={
                  netPosition >= 0
                    ? "#bfdbfe"
                    : "#fed7aa"
                }
                valueColor={
                  netPosition >= 0
                    ? "#2563eb"
                    : "#c2410c"
                }
              />
            </div>

            {/* ==================================================
                RECEIVABLES
            ================================================== */}

            <div
              className="outstanding-section"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 18,
                      color: "#15803d",
                    }}
                  >
                    🟢 Receivables
                  </h2>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      marginTop: 2,
                    }}
                  >
                    Amount customers owe
                    the business
                  </div>
                </div>

                <strong
                  style={{
                    color: "#15803d",
                  }}
                >
                  ₹{" "}
                  {money(
                    report.totalReceivable
                  )}
                </strong>
              </div>

              <div
                style={{
                  background: "white",
                  border:
                    "1px solid #bbf7d0",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <table
                  className="outstanding-table"
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
                          "#dcfce7",
                      }}
                    >
                      <th
                        style={{
                          width: "22%",
                          padding: 8,
                          textAlign:
                            "left",
                        }}
                      >
                        Customer
                      </th>

                      <th
                        style={{
                          width: "15%",
                          padding: 8,
                          textAlign:
                            "left",
                        }}
                      >
                        Invoice No
                      </th>

                      <th
                        style={{
                          width: "13%",
                          padding: 8,
                          textAlign:
                            "left",
                        }}
                      >
                        Date
                      </th>

                      <th
                        style={{
                          width: "16%",
                          padding: 8,
                          textAlign:
                            "right",
                        }}
                      >
                        Total
                      </th>

                      <th
                        style={{
                          width: "16%",
                          padding: 8,
                          textAlign:
                            "right",
                        }}
                      >
                        Received
                      </th>

                      <th
                        style={{
                          width: "18%",
                          padding: 8,
                          textAlign:
                            "right",
                        }}
                      >
                        Outstanding
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.receivables
                      .length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign:
                              "center",
                            padding: 20,
                            color:
                              "#64748b",
                          }}
                        >
                          No Receivables
                          Found
                        </td>
                      </tr>
                    ) : (
                      report.receivables.map(
                        (item) => (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            <td
                              style={{
                                padding: 7,
                                fontWeight:
                                  500,
                              }}
                            >
                              {
                                item.customerName
                              }
                            </td>

                            <td
                              style={{
                                padding: 7,
                              }}
                            >
                              {
                                item.invoiceNo
                              }
                            </td>

                            <td
                              style={{
                                padding: 7,
                              }}
                            >
                              {item.date}
                            </td>

                            <td
                              style={{
                                padding: 7,
                                textAlign:
                                  "right",
                              }}
                            >
                              ₹{" "}
                              {money(
                                item.total
                              )}
                            </td>

                            <td
                              style={{
                                padding: 7,
                                textAlign:
                                  "right",
                              }}
                            >
                              ₹{" "}
                              {money(
                                item.received
                              )}
                            </td>

                            <td
                              style={{
                                padding: 7,
                                textAlign:
                                  "right",
                                fontWeight:
                                  "bold",
                                color:
                                  "#15803d",
                              }}
                            >
                              ₹{" "}
                              {money(
                                item.outstanding
                              )}
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>

                  <tfoot>
                    <tr
                      style={{
                        background:
                          "#f0fdf4",
                        fontWeight:
                          "bold",
                      }}
                    >
                      <td
                        colSpan="5"
                        style={{
                          padding: 9,
                          textAlign:
                            "right",
                          borderTop:
                            "2px solid #15803d",
                        }}
                      >
                        Total Receivable
                      </td>

                      <td
                        style={{
                          padding: 9,
                          textAlign:
                            "right",
                          color:
                            "#15803d",
                          borderTop:
                            "2px solid #15803d",
                        }}
                      >
                        ₹{" "}
                        {money(
                          report.totalReceivable
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ==================================================
                PAYABLES
            ================================================== */}

            <div
              className="outstanding-section"
              style={{
                marginTop: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 18,
                      color: "#dc2626",
                    }}
                  >
                    🔴 Payables
                  </h2>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      marginTop: 2,
                    }}
                  >
                    Amount owed to
                    suppliers
                  </div>
                </div>

                <strong
                  style={{
                    color: "#dc2626",
                  }}
                >
                  ₹{" "}
                  {money(
                    report.totalPayable
                  )}
                </strong>
              </div>

              <div
                style={{
                  background: "white",
                  border:
                    "1px solid #fecaca",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <table
                  className="outstanding-table"
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
                          "#fee2e2",
                      }}
                    >
                      <th
                        style={{
                          width: "22%",
                          padding: 8,
                          textAlign:
                            "left",
                        }}
                      >
                        Supplier
                      </th>

                      <th
                        style={{
                          width: "15%",
                          padding: 8,
                          textAlign:
                            "left",
                        }}
                      >
                        Purchase No
                      </th>

                      <th
                        style={{
                          width: "13%",
                          padding: 8,
                          textAlign:
                            "left",
                        }}
                      >
                        Date
                      </th>

                      <th
                        style={{
                          width: "16%",
                          padding: 8,
                          textAlign:
                            "right",
                        }}
                      >
                        Total
                      </th>

                      <th
                        style={{
                          width: "16%",
                          padding: 8,
                          textAlign:
                            "right",
                        }}
                      >
                        Paid
                      </th>

                      <th
                        style={{
                          width: "18%",
                          padding: 8,
                          textAlign:
                            "right",
                        }}
                      >
                        Outstanding
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.payables
                      .length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign:
                              "center",
                            padding: 20,
                            color:
                              "#64748b",
                          }}
                        >
                          No Payables
                          Found
                        </td>
                      </tr>
                    ) : (
                      report.payables.map(
                        (item) => (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            <td
                              style={{
                                padding: 7,
                                fontWeight:
                                  500,
                              }}
                            >
                              {
                                item.supplierName
                              }
                            </td>

                            <td
                              style={{
                                padding: 7,
                              }}
                            >
                              {
                                item.purchaseNo
                              }
                            </td>

                            <td
                              style={{
                                padding: 7,
                              }}
                            >
                              {item.date}
                            </td>

                            <td
                              style={{
                                padding: 7,
                                textAlign:
                                  "right",
                              }}
                            >
                              ₹{" "}
                              {money(
                                item.total
                              )}
                            </td>

                            <td
                              style={{
                                padding: 7,
                                textAlign:
                                  "right",
                              }}
                            >
                              ₹{" "}
                              {money(
                                item.paid
                              )}
                            </td>

                            <td
                              style={{
                                padding: 7,
                                textAlign:
                                  "right",
                                fontWeight:
                                  "bold",
                                color:
                                  "#dc2626",
                              }}
                            >
                              ₹{" "}
                              {money(
                                item.outstanding
                              )}
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>

                  <tfoot>
                    <tr
                      style={{
                        background:
                          "#fef2f2",
                        fontWeight:
                          "bold",
                      }}
                    >
                      <td
                        colSpan="5"
                        style={{
                          padding: 9,
                          textAlign:
                            "right",
                          borderTop:
                            "2px solid #dc2626",
                        }}
                      >
                        Total Payable
                      </td>

                      <td
                        style={{
                          padding: 9,
                          textAlign:
                            "right",
                          color:
                            "#dc2626",
                          borderTop:
                            "2px solid #dc2626",
                        }}
                      >
                        ₹{" "}
                        {money(
                          report.totalPayable
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ==================================================
                NET POSITION
            ================================================== */}

            <div
              className="outstanding-net-summary"
              style={{
                marginTop: 18,
                padding: 16,

                background:
                  netPosition >= 0
                    ? "#eff6ff"
                    : "#fff7ed",

                border:
                  netPosition >= 0
                    ? "1px solid #bfdbfe"
                    : "1px solid #fed7aa",

                borderRadius: 10,
              }}
            >
              <h2
                style={{
                  margin:
                    "0 0 12px",
                  fontSize: 18,
                }}
              >
                ⚖️ Outstanding Summary
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <PositionValue
                  label="Customers Owe You"
                  value={
                    report.totalReceivable
                  }
                />

                <PositionValue
                  label="You Owe Suppliers"
                  value={
                    report.totalPayable
                  }
                />

                <PositionValue
                  label={
                    netPosition >= 0
                      ? "Net Receivable"
                      : "Net Payable"
                  }
                  value={Math.abs(
                    netPosition
                  )}
                  highlight
                />
              </div>

              <div
                style={{
                  marginTop: 12,
                  fontWeight: 600,
                  color:
                    netPosition >= 0
                      ? "#1d4ed8"
                      : "#c2410c",
                  fontSize: 13,
                }}
              >
                {netPosition >= 0
                  ? "💰 Your receivables are higher than your payables."
                  : "⚠️ Your payables are higher than your receivables."}
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
  valueColor,
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
        padding: 15,
        background,
        border:
          `1px solid ${border}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#475569",
          fontWeight: 600,
        }}
      >
        {title}
      </div>

      <h2
        style={{
          margin: "7px 0 0",
          fontSize: 20,
          color: valueColor,
        }}
      >
        ₹ {money(value)}
      </h2>
    </div>
  );
}

// ==================================================
// POSITION VALUE
// ==================================================

function PositionValue({
  label,
  value,
  highlight = false,
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
          "rgba(255,255,255,0.7)",
        borderRadius: 8,
        padding: 12,

        border: highlight
          ? "1px solid #cbd5e1"
          : "1px solid transparent",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <strong
        style={{
          fontSize: 16,
        }}
      >
        ₹ {money(value)}
      </strong>
    </div>
  );
}