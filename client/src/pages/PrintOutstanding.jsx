import { useEffect, useState } from "react";
import axios from "axios";

export default function PrintOutstanding() {
  const [receivables, setReceivables] = useState([]);
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // COMPANY
  // ==================================================

  const [company, setCompany] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    gstin: "",
    logo: "",
  });

  // ==================================================
  // LOAD COMPANY
  // ==================================================

  const loadCompany = async () => {
    try {
      const res = await axios.get(
        "https://mudhikhana.onrender.com/company"
      );

      if (res.data) {
        setCompany({
          name: res.data.name || "",
          address: res.data.address || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          gstin: res.data.gstin || "",
          logo: res.data.logo || "",
        });
      }
    } catch (err) {
      console.log(
        "Company Load Error:",
        err
      );
    }
  };

  // ==================================================
  // LOAD OUTSTANDING
  // ==================================================

  const loadOutstanding = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://mudhikhana.onrender.com/accounts/outstanding"
      );

      setReceivables(
        res.data?.receivables || []
      );

      setPayables(
        res.data?.payables || []
      );
    } catch (err) {
      console.log(
        "Outstanding Report Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load outstanding report"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadCompany();
    loadOutstanding();
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
  // TOTAL RECEIVABLE
  // ==================================================

  const totalReceivable =
    receivables.reduce(
      (sum, item) =>
        sum +
        (Number(
          item.outstanding
        ) || 0),
      0
    );

  // ==================================================
  // TOTAL PAYABLE
  // ==================================================

  const totalPayable =
    payables.reduce(
      (sum, item) =>
        sum +
        (Number(
          item.outstanding
        ) || 0),
      0
    );

  // ==================================================
  // NET RECEIVABLE
  // ==================================================

  const netReceivable =
    totalReceivable -
    totalPayable;

  // ==================================================
  // PRINT
  // ==================================================

  const printReport = () => {
    window.print();
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div
      style={{
        padding: 24,
        background: "#f8fafc",
        minHeight: "100vh",
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
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 2,
              color: "#64748b",
              textTransform:
                "uppercase",
            }}
          >
            {company.name ||
              "COMPANY"}
          </div>

          <h1
            style={{
              margin: "5px 0",
              fontSize: 26,
            }}
          >
            🖨️ Print Outstanding Report
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Customer receivables and supplier
            payables
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          {/* REFRESH */}

          <button
            onClick={() => {
              loadCompany();
              loadOutstanding();
            }}
            style={{
              padding:
                "10px 15px",
              background: "white",
              border:
                "1px solid #cbd5e1",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🔄 Refresh
          </button>

          {/* PRINT */}

          <button
            onClick={
              printReport
            }
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
            🖨️ Print Report
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
          Loading outstanding report...
        </div>
      ) : (
        <div
          className="print-outstanding"
          style={{
            maxWidth: 950,
            margin: "0 auto",
            background: "white",
            padding: 35,
            border:
              "1px solid #d1d5db",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          {/* ==================================================
              COMPANY HEADER
          ================================================== */}

          <div
            style={{
              textAlign: "center",
              borderBottom:
                "2px solid #111827",
              paddingBottom: 15,
            }}
          >
            {/* LOGO */}

            {company.logo && (
              <img
                src={company.logo}
                alt="Company Logo"
                style={{
                  maxWidth: 100,
                  maxHeight: 70,
                  objectFit:
                    "contain",
                  marginBottom: 8,
                }}
              />
            )}

            {/* COMPANY NAME */}

            <h1
              style={{
                margin: 0,
                fontSize: 28,
              }}
            >
              {company.name ||
                "Your Company"}
            </h1>

            {/* ADDRESS */}

            {company.address && (
              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#475569",
                  fontSize: 12,
                }}
              >
                {company.address}
              </p>
            )}

            {/* PHONE / EMAIL */}

            {(company.phone ||
              company.email) && (
              <div
                style={{
                  marginTop: 5,
                  color: "#64748b",
                  fontSize: 11,
                }}
              >
                {company.phone && (
                  <span>
                    Phone:{" "}
                    {company.phone}
                  </span>
                )}

                {company.phone &&
                  company.email && (
                    <span>
                      {" "}
                      |{" "}
                    </span>
                  )}

                {company.email && (
                  <span>
                    Email:{" "}
                    {company.email}
                  </span>
                )}
              </div>
            )}

            {/* GSTIN */}

            {company.gstin && (
              <div
                style={{
                  marginTop: 4,
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                GSTIN:{" "}
                {company.gstin}
              </div>
            )}

            {/* REPORT TITLE */}

            <h2
              style={{
                margin:
                  "10px 0 0",
                fontSize: 20,
              }}
            >
              Outstanding Report
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
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: 12,
              margin:
                "20px 0 25px",
            }}
          >
            {/* RECEIVABLE */}

            <div
              style={{
                border:
                  "1px solid #d1d5db",
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                TOTAL RECEIVABLE
              </div>

              <h2
                style={{
                  margin:
                    "5px 0",
                  color: "#15803d",
                }}
              >
                ₹{" "}
                {money(
                  totalReceivable
                )}
              </h2>
            </div>

            {/* PAYABLE */}

            <div
              style={{
                border:
                  "1px solid #d1d5db",
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                TOTAL PAYABLE
              </div>

              <h2
                style={{
                  margin:
                    "5px 0",
                  color: "#dc2626",
                }}
              >
                ₹{" "}
                {money(
                  totalPayable
                )}
              </h2>
            </div>

            {/* NET */}

            <div
              style={{
                border:
                  "1px solid #d1d5db",
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                NET RECEIVABLE
              </div>

              <h2
                style={{
                  margin:
                    "5px 0",
                  color:
                    netReceivable >=
                    0
                      ? "#2563eb"
                      : "#dc2626",
                }}
              >
                ₹{" "}
                {money(
                  netReceivable
                )}
              </h2>
            </div>
          </div>

          {/* ==================================================
              RECEIVABLES
          ================================================== */}

          <div
            style={{
              marginTop: 20,
            }}
          >
            <h2
              style={{
                fontSize: 17,
                margin:
                  "0 0 10px",
                color: "#166534",
              }}
            >
              🟢 Receivables
            </h2>

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={
                      thStyle
                    }
                  >
                    Customer
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Invoice No
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Date
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Total
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Received
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Outstanding
                  </th>
                </tr>
              </thead>

              <tbody>
                {receivables.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        ...tdStyle,
                        textAlign:
                          "center",
                      }}
                    >
                      No Receivables Found
                    </td>
                  </tr>
                ) : (
                  receivables.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.id ||
                          index
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            item.customerName
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <b>
                            {
                              item.invoiceNo
                            }
                          </b>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            item.date
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
                            item.total
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
                            item.received
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
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
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        "bold",
                    }}
                  >
                    Total Receivable
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        "bold",
                    }}
                  >
                    ₹{" "}
                    {money(
                      totalReceivable
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ==================================================
              PAYABLES
          ================================================== */}

          <div
            style={{
              marginTop: 30,
            }}
          >
            <h2
              style={{
                fontSize: 17,
                margin:
                  "0 0 10px",
                color: "#991b1b",
              }}
            >
              🔴 Payables
            </h2>

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={
                      thStyle
                    }
                  >
                    Supplier
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Purchase No
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Date
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Total
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Paid
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Outstanding
                  </th>
                </tr>
              </thead>

              <tbody>
                {payables.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        ...tdStyle,
                        textAlign:
                          "center",
                      }}
                    >
                      No Payables Found
                    </td>
                  </tr>
                ) : (
                  payables.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={
                          item.id ||
                          index
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            item.supplierName
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <b>
                            {
                              item.purchaseNo
                            }
                          </b>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            item.date
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
                            item.total
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
                            item.paid
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
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
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        "bold",
                    }}
                  >
                    Total Payable
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        "bold",
                    }}
                  >
                    ₹{" "}
                    {money(
                      totalPayable
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ==================================================
              FINAL SUMMARY
          ================================================== */}

          <div
            style={{
              marginTop: 30,
              padding: 18,
              border:
                "1px solid #d1d5db",
            }}
          >
            <h3
              style={{
                margin:
                  "0 0 12px",
              }}
            >
              ⚖️ Outstanding Summary
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                padding: "6px 0",
              }}
            >
              <span>
                Customers owe you:
              </span>

              <strong
                style={{
                  color:
                    "#15803d",
                }}
              >
                ₹{" "}
                {money(
                  totalReceivable
                )}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                padding: "6px 0",
              }}
            >
              <span>
                You owe suppliers:
              </span>

              <strong
                style={{
                  color:
                    "#dc2626",
                }}
              >
                ₹{" "}
                {money(
                  totalPayable
                )}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                padding:
                  "10px 0 0",
                marginTop: 8,
                borderTop:
                  "1px solid #d1d5db",
                fontSize: 16,
              }}
            >
              <strong>
                Net Receivable:
              </strong>

              <strong
                style={{
                  color:
                    netReceivable >=
                    0
                      ? "#2563eb"
                      : "#dc2626",
                }}
              >
                ₹{" "}
                {money(
                  netReceivable
                )}
              </strong>
            </div>
          </div>

          {/* ==================================================
              SIGNATURE
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 100,
              marginTop: 70,
            }}
          >
            <div
              style={{
                borderTop:
                  "1px solid #111827",
                paddingTop: 8,
                textAlign:
                  "center",
              }}
            >
              Prepared By
            </div>

            <div
              style={{
                borderTop:
                  "1px solid #111827",
                paddingTop: 8,
                textAlign:
                  "center",
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
              marginTop: 30,
              paddingTop: 10,
              borderTop:
                "1px solid #e5e7eb",
              textAlign: "center",
              fontSize: 10,
              color: "#64748b",
            }}
          >
            Generated by{" "}
            {company.name ||
              "Your Company"}
          </div>
        </div>
      )}

      {/* ==================================================
          PRINT CSS
      ================================================== */}

      <style>
        {`
          @media print {

            @page {
              size: A4;
              margin: 8mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            body * {
              visibility: hidden !important;
            }

            .print-outstanding,
            .print-outstanding * {
              visibility: visible !important;
            }

            .print-outstanding {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;

              width: 100% !important;
              max-width: none !important;

              margin: 0 !important;
              padding: 5px !important;

              background: white !important;

              border: none !important;
              box-shadow: none !important;
            }

            .no-print {
              display: none !important;
            }

            table {
              page-break-inside: auto;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            thead {
              display: table-header-group;
            }

            tfoot {
              display: table-footer-group;
            }
          }

          @media screen {
            .print-outstanding {
              margin-bottom: 40px;
            }
          }
        `}
      </style>
    </div>
  );
}

// ==================================================
// TABLE STYLES
// ==================================================

const thStyle = {
  padding: "9px",
  background: "#f1f5f9",
  border:
    "1px solid #cbd5e1",
  textAlign: "left",
  fontSize: 11,
};

const tdStyle = {
  padding: "9px",
  border:
    "1px solid #cbd5e1",
  fontSize: 11,
};