import { useEffect, useState } from "react";
import axios from "axios";

export default function PrintCustomerLedger() {
  const [customers, setCustomers] =
    useState([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [invoices, setInvoices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingStatement, setLoadingStatement] =
    useState(false);

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
  // LOAD CUSTOMERS
  // ==================================================

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://mudhikhana.onrender.com/customers"
      );

      setCustomers(
        res.data || []
      );
    } catch (err) {
      console.log(
        "Customer Load Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD CUSTOMER STATEMENT
  // ==================================================

  const loadStatement = async (
    customerName
  ) => {
    if (!customerName) {
      setInvoices([]);
      return;
    }

    try {
      setLoadingStatement(true);

      const res = await axios.get(
        "https://mudhikhana.onrender.com/accounts/outstanding"
      );

      const receivables =
        res.data?.receivables || [];

      const customerInvoices =
        receivables.filter(
          (item) =>
            String(
              item.customerName || ""
            ).toLowerCase() ===
            String(
              customerName
            ).toLowerCase()
        );

      setInvoices(
        customerInvoices
      );
    } catch (err) {
      console.log(
        "Customer Statement Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load customer statement"
      );
    } finally {
      setLoadingStatement(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadCompany();
    loadCustomers();
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

  const totalSales =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        (Number(
          invoice.total
        ) || 0),
      0
    );

  const totalReceived =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        (Number(
          invoice.received
        ) || 0),
      0
    );

  const totalOutstanding =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        (Number(
          invoice.outstanding
        ) || 0),
      0
    );

  // ==================================================
  // PRINT
  // ==================================================

  const printStatement = () => {
    if (!selectedCustomer) {
      alert(
        "Please select a customer first."
      );

      return;
    }

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
              color: "#0f172a",
            }}
          >
            🖨️ Print Customer Ledger
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Print a customer statement
          </p>
        </div>

        <button
          onClick={
            printStatement
          }
          disabled={
            !selectedCustomer
          }
          style={{
            padding:
              "10px 18px",
            background:
              selectedCustomer
                ? "#2563eb"
                : "#cbd5e1",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor:
              selectedCustomer
                ? "pointer"
                : "not-allowed",
            fontWeight: "bold",
          }}
        >
          🖨️ Print Statement
        </button>
      </div>

      {/* ==================================================
          CUSTOMER SELECT
      ================================================== */}

      <div
        className="no-print"
        style={{
          background: "white",
          padding: 18,
          borderRadius: 10,
          marginBottom: 20,
          border:
            "1px solid #e2e8f0",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: "bold",
            fontSize: 13,
          }}
        >
          Select Customer
        </label>

        <select
          value={
            selectedCustomer
          }
          onChange={(e) => {
            const name =
              e.target.value;

            setSelectedCustomer(
              name
            );

            loadStatement(
              name
            );
          }}
          style={{
            width: "100%",
            maxWidth: 450,
            padding: 10,
            border:
              "1px solid #cbd5e1",
            borderRadius: 8,
            background: "white",
          }}
        >
          <option value="">
            -- Select Customer --
          </option>

          {customers.map(
            (customer) => {
              const id =
                customer.id;

              const name =
                customer.name ||
                customer.customerName ||
                `Customer ${id}`;

              return (
                <option
                  key={id}
                  value={name}
                >
                  {name}
                </option>
              );
            }
          )}
        </select>
      </div>

      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (
        <div
          className="no-print"
          style={{
            background: "white",
            padding: 40,
            textAlign: "center",
            borderRadius: 10,
          }}
        >
          Loading customers...
        </div>
      )}

      {/* ==================================================
          NO CUSTOMER
      ================================================== */}

      {!loading &&
        !selectedCustomer && (
          <div
            className="no-print"
            style={{
              background: "white",
              padding: 50,
              textAlign: "center",
              borderRadius: 10,
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: 40,
              }}
            >
              👥
            </div>

            <h3>
              Select a customer
            </h3>

            <p>
              Select a customer above
              to preview their
              statement.
            </p>
          </div>
        )}

      {/* ==================================================
          PRINTABLE STATEMENT
      ================================================== */}

      {selectedCustomer && (
        <div
          className="print-customer-ledger"
          style={{
            maxWidth: 850,
            margin: "0 auto",
            background: "white",
            padding: 40,
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

            <h1
              style={{
                margin: 0,
                fontSize: 28,
              }}
            >
              {company.name ||
                "Your Company"}
            </h1>

            {company.address && (
              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#475569",
                  fontSize: 12,
                }}
              >
                {company.address}
              </p>
            )}

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

            {company.gstin && (
              <div
                style={{
                  marginTop: 4,
                  color: "#475569",
                  fontSize: 11,
                  fontWeight:
                    "700",
                }}
              >
                GSTIN:{" "}
                {company.gstin}
              </div>
            )}

            <p
              style={{
                margin:
                  "8px 0 0",
                color: "#64748b",
              }}
            >
              Customer Account Statement
            </p>
          </div>

          {/* ==================================================
              CUSTOMER
          ================================================== */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              margin:
                "20px 0",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                CUSTOMER
              </div>

              <h2
                style={{
                  margin:
                    "5px 0",
                }}
              >
                {selectedCustomer}
              </h2>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                STATEMENT DATE
              </div>

              <h3
                style={{
                  margin:
                    "5px 0",
                }}
              >
                {new Date().toLocaleDateString(
                  "en-IN"
                )}
              </h3>
            </div>
          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 25,
            }}
          >
            <div
              style={{
                border:
                  "1px solid #d1d5db",
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                TOTAL SALES
              </div>

              <strong>
                ₹ {money(totalSales)}
              </strong>
            </div>

            <div
              style={{
                border:
                  "1px solid #d1d5db",
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                TOTAL RECEIVED
              </div>

              <strong>
                ₹{" "}
                {money(
                  totalReceived
                )}
              </strong>
            </div>

            <div
              style={{
                border:
                  "1px solid #d1d5db",
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                OUTSTANDING
              </div>

              <strong>
                ₹{" "}
                {money(
                  totalOutstanding
                )}
              </strong>
            </div>
          </div>

          {/* ==================================================
              STATEMENT TABLE
          ================================================== */}

          {loadingStatement ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
              }}
            >
              Loading statement...
            </div>
          ) : (
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
                    Date
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Invoice No
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Sales / Debit
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
                {invoices.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        ...tdStyle,
                        textAlign:
                          "center",
                        padding: 30,
                      }}
                    >
                      No outstanding
                      invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map(
                    (
                      invoice,
                      index
                    ) => (
                      <tr
                        key={
                          invoice.id ||
                          index
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            invoice.date
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <b>
                            {
                              invoice.invoiceNo
                            }
                          </b>
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
                            invoice.total
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
                            invoice.received
                          )}
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
                            invoice.outstanding
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
                    colSpan="2"
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        "bold",
                    }}
                  >
                    TOTAL
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
                      totalSales
                    )}
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
                      totalReceived
                    )}
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
                      totalOutstanding
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* ==================================================
              NARRATION
          ================================================== */}

          <div
            style={{
              marginTop: 35,
              fontSize: 11,
              color: "#64748b",
            }}
          >
            This statement is generated
            from{" "}
            {company.name ||
              "company"}{" "}
            accounting records.
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
              Customer Signature
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
              margin: 10mm;
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

            .print-customer-ledger,
            .print-customer-ledger * {
              visibility: visible !important;
            }

            .print-customer-ledger {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;

              width: 100% !important;
              max-width: none !important;

              margin: 0 !important;
              padding: 10px !important;

              background: white !important;

              border: none !important;
              box-shadow: none !important;
            }

            .no-print {
              display: none !important;
            }
          }

          @media screen {
            .print-customer-ledger {
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
  padding: "11px",
  background: "#f1f5f9",
  border:
    "1px solid #cbd5e1",
  textAlign: "left",
  fontSize: 12,
};

const tdStyle = {
  padding: "11px",
  border:
    "1px solid #cbd5e1",
  fontSize: 12,
};