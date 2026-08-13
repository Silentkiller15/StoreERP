import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function CustomerLedger() {
  // ==================================================
  // STATE
  // ==================================================

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

  const [search, setSearch] =
    useState("");

  // ==================================================
  // LOAD CUSTOMERS
  // ==================================================

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/customers"
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
        "http://localhost:5000/accounts/outstanding"
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
    loadCustomers();
  }, []);

  // ==================================================
  // CUSTOMER CHANGE
  // ==================================================

  const handleCustomerChange = (
    event
  ) => {
    const name =
      event.target.value;

    setSelectedCustomer(name);

    setSearch("");

    loadStatement(name);
  };

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
  // FILTER STATEMENT
  // ==================================================

  const filteredInvoices =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return invoices;
      }

      return invoices.filter(
        (invoice) =>
          String(
            invoice.invoiceNo ||
              ""
          )
            .toLowerCase()
            .includes(keyword) ||
          String(
            invoice.date || ""
          )
            .toLowerCase()
            .includes(keyword)
      );
    }, [invoices, search]);

  // ==================================================
  // FILTERED TOTALS
  // ==================================================

  const filteredSales =
    filteredInvoices.reduce(
      (sum, invoice) =>
        sum +
        (Number(
          invoice.total
        ) || 0),
      0
    );

  const filteredReceived =
    filteredInvoices.reduce(
      (sum, invoice) =>
        sum +
        (Number(
          invoice.received
        ) || 0),
      0
    );

  const filteredOutstanding =
    filteredInvoices.reduce(
      (sum, invoice) =>
        sum +
        (Number(
          invoice.outstanding
        ) || 0),
      0
    );

  // ==================================================
  // CUSTOMER COUNT
  // ==================================================

  const customerCount =
    customers.length;

  // ==================================================
  // ACTIVE CUSTOMER OBJECT
  // ==================================================

  const activeCustomer =
    customers.find(
      (customer) => {
        const name =
          customer.name ||
          customer.customerName ||
          `Customer ${customer.id}`;

        return (
          String(name)
            .toLowerCase() ===
          String(
            selectedCustomer
          ).toLowerCase()
        );
      }
    );

  // ==================================================
  // STYLES
  // ==================================================

  const cardStyle = {
    background: "#ffffff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.06)",
  };

  const inputStyle = {
    width: "100%",
    padding:
      "10px 12px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    boxSizing:
      "border-box",
    fontSize: "14px",
    background:
      "#ffffff",
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div
      style={{
        minHeight:
          "100vh",
        padding:
          "24px",
        background:
          "#f1f5f9",
        boxSizing:
          "border-box",
      }}
    >

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding:
            "20px 24px",
          marginBottom:
            "18px",
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap:
            "20px",
          flexWrap:
            "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize:
                "12px",
              color:
                "#64748b",
              fontWeight:
                "800",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
              marginBottom:
                "5px",
            }}
          >
            Accounts Receivable
          </div>

          <h1
            style={{
              margin: 0,
              fontSize:
                "26px",
              color:
                "#0f172a",
            }}
          >
            📜 Customer Ledger
          </h1>

          <div
            style={{
              marginTop:
                "5px",
              color:
                "#64748b",
              fontSize:
                "13px",
            }}
          >
            Customer-wise sales,
            receipts and
            outstanding statement
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            loadStatement(
              selectedCustomer
            )
          }
          disabled={
            !selectedCustomer ||
            loadingStatement
          }
          style={{
            padding:
              "11px 18px",
            background:
              !selectedCustomer ||
              loadingStatement
                ? "#cbd5e1"
                : "#2563eb",
            color:
              "white",
            border:
              "none",
            borderRadius:
              "8px",
            cursor:
              !selectedCustomer ||
              loadingStatement
                ? "not-allowed"
                : "pointer",
            fontWeight:
              "800",
          }}
        >
          {loadingStatement
            ? "Loading..."
            : "↻ Refresh Statement"}
        </button>
      </div>

      {/* ==================================================
          CUSTOMER SELECTOR
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding:
            "20px",
          marginBottom:
            "18px",
        }}
      >
        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "14px",
            gap:
              "10px",
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontWeight:
                  "800",
                color:
                  "#0f172a",
              }}
            >
              👤 Select Customer
            </div>

            <div
              style={{
                marginTop:
                  "3px",
                fontSize:
                  "12px",
                color:
                  "#64748b",
              }}
            >
              Choose a customer
              to view their
              complete statement
            </div>
          </div>

          <span
            style={{
              padding:
                "5px 9px",
              borderRadius:
                "6px",
              background:
                "#f1f5f9",
              color:
                "#475569",
              fontSize:
                "11px",
              fontWeight:
                "800",
            }}
          >
            {customerCount}{" "}
            Customer
            {customerCount ===
            1
              ? ""
              : "s"}
          </span>
        </div>

        <select
          value={
            selectedCustomer
          }
          onChange={
            handleCustomerChange
          }
          disabled={
            loading
          }
          style={{
            ...inputStyle,
            maxWidth:
              "600px",
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
          CUSTOMER LOADING
      ================================================== */}

      {loading && (
        <div
          style={{
            ...cardStyle,
            padding:
              "50px 20px",
            textAlign:
              "center",
            marginBottom:
              "18px",
          }}
        >
          <div
            style={{
              fontSize:
                "36px",
              marginBottom:
                "10px",
            }}
          >
            ⏳
          </div>

          <div
            style={{
              fontWeight:
                "800",
              color:
                "#334155",
            }}
          >
            Loading Customers...
          </div>

          <div
            style={{
              marginTop:
                "5px",
              color:
                "#64748b",
              fontSize:
                "13px",
            }}
          >
            Please wait
          </div>
        </div>
      )}

      {/* ==================================================
          NO CUSTOMER SELECTED
      ================================================== */}

      {!loading &&
        !selectedCustomer && (
          <div
            style={{
              ...cardStyle,
              padding:
                "65px 20px",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize:
                  "48px",
                marginBottom:
                  "12px",
              }}
            >
              👥
            </div>

            <h2
              style={{
                margin:
                  "0 0 7px",
                color:
                  "#334155",
                fontSize:
                  "20px",
              }}
            >
              Select a Customer
            </h2>

            <p
              style={{
                margin: 0,
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              Choose a customer
              above to view
              their sales,
              receipts and
              outstanding balance.
            </p>
          </div>
        )}

      {/* ==================================================
          CUSTOMER STATEMENT
      ================================================== */}

      {selectedCustomer && (
        <>
          {/* ==================================================
              CUSTOMER IDENTITY
          ================================================== */}

          <div
            style={{
              ...cardStyle,
              padding:
                "18px 20px",
              marginBottom:
                "18px",
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "14px",
            }}
          >
            <div
              style={{
                width:
                  "48px",
                height:
                  "48px",
                borderRadius:
                  "50%",
                background:
                  "#dbeafe",
                color:
                  "#1d4ed8",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  "22px",
                fontWeight:
                  "900",
                flexShrink:
                  0,
              }}
            >
              {String(
                selectedCustomer
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontSize:
                    "11px",
                  color:
                    "#64748b",
                  fontWeight:
                    "800",
                  textTransform:
                    "uppercase",
                }}
              >
                Selected Customer
              </div>

              <div
                style={{
                  fontSize:
                    "19px",
                  fontWeight:
                    "900",
                  color:
                    "#0f172a",
                  marginTop:
                    "2px",
                }}
              >
                {selectedCustomer}
              </div>

              {activeCustomer?.phone && (
                <div
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#64748b",
                    marginTop:
                      "3px",
                  }}
                >
                  📞{" "}
                  {
                    activeCustomer.phone
                  }
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap:
                "14px",
              marginBottom:
                "18px",
            }}
          >

            {/* TOTAL SALES */}

            <div
              style={{
                ...cardStyle,
                padding:
                  "19px",
                background:
                  "#eff6ff",
                border:
                  "1px solid #bfdbfe",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#1d4ed8",
                    fontWeight:
                      "800",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Total Sales
                </div>

                <span
                  style={{
                    fontSize:
                      "20px",
                  }}
                >
                  🛒
                </span>
              </div>

              <div
                style={{
                  marginTop:
                    "8px",
                  fontSize:
                    "25px",
                  fontWeight:
                    "900",
                  color:
                    "#1d4ed8",
                }}
              >
                ₹{" "}
                {money(
                  totalSales
                )}
              </div>

              <div
                style={{
                  marginTop:
                    "5px",
                  fontSize:
                    "12px",
                  color:
                    "#3b82f6",
                }}
              >
                Total invoice value
              </div>
            </div>

            {/* TOTAL RECEIVED */}

            <div
              style={{
                ...cardStyle,
                padding:
                  "19px",
                background:
                  "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#15803d",
                    fontWeight:
                      "800",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Total Received
                </div>

                <span
                  style={{
                    fontSize:
                      "20px",
                  }}
                >
                  🟢
                </span>
              </div>

              <div
                style={{
                  marginTop:
                    "8px",
                  fontSize:
                    "25px",
                  fontWeight:
                    "900",
                  color:
                    "#15803d",
                }}
              >
                ₹{" "}
                {money(
                  totalReceived
                )}
              </div>

              <div
                style={{
                  marginTop:
                    "5px",
                  fontSize:
                    "12px",
                  color:
                    "#16a34a",
                }}
              >
                Payments received
              </div>
            </div>

            {/* OUTSTANDING */}

            <div
              style={{
                ...cardStyle,
                padding:
                  "19px",
                background:
                  totalOutstanding >
                  0
                    ? "#fef2f2"
                    : "#f0fdf4",
                border:
                  totalOutstanding >
                  0
                    ? "1px solid #fecaca"
                    : "1px solid #bbf7d0",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      totalOutstanding >
                      0
                        ? "#dc2626"
                        : "#15803d",
                    fontWeight:
                      "800",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Outstanding
                </div>

                <span
                  style={{
                    fontSize:
                      "20px",
                  }}
                >
                  {totalOutstanding >
                  0
                    ? "🔴"
                    : "✅"}
                </span>
              </div>

              <div
                style={{
                  marginTop:
                    "8px",
                  fontSize:
                    "25px",
                  fontWeight:
                    "900",
                  color:
                    totalOutstanding >
                    0
                      ? "#dc2626"
                      : "#15803d",
                }}
              >
                ₹{" "}
                {money(
                  totalOutstanding
                )}
              </div>

              <div
                style={{
                  marginTop:
                    "5px",
                  fontSize:
                    "12px",
                  color:
                    totalOutstanding >
                    0
                      ? "#ef4444"
                      : "#16a34a",
                }}
              >
                {totalOutstanding >
                0
                  ? "Amount receivable"
                  : "Account is settled"}
              </div>
            </div>
          </div>

          {/* ==================================================
              STATEMENT CARD
          ================================================== */}

          <div
            style={{
              ...cardStyle,
              overflow:
                "hidden",
            }}
          >

            {/* STATEMENT HEADER */}

            <div
              style={{
                padding:
                  "17px 20px",
                borderBottom:
                  "1px solid #e2e8f0",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap:
                  "15px",
                flexWrap:
                  "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight:
                      "800",
                    color:
                      "#0f172a",
                  }}
                >
                  📋 Customer Statement
                </div>

                <div
                  style={{
                    marginTop:
                      "3px",
                    fontSize:
                      "12px",
                    color:
                      "#64748b",
                  }}
                >
                  Invoice-wise
                  receivable details
                </div>
              </div>

              {/* SEARCH */}

              <div
                style={{
                  position:
                    "relative",
                  width:
                    "330px",
                  maxWidth:
                    "100%",
                }}
              >
                <span
                  style={{
                    position:
                      "absolute",
                    left:
                      "12px",
                    top:
                      "10px",
                    fontSize:
                      "16px",
                  }}
                >
                  🔍
                </span>

                <input
                  value={
                    search
                  }
                  onChange={(
                    e
                  ) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search invoice or date..."
                  style={{
                    ...inputStyle,
                    padding:
                      "10px 12px 10px 38px",
                  }}
                />
              </div>
            </div>

            {/* STATEMENT LOADING */}

            {loadingStatement && (
              <div
                style={{
                  padding:
                    "50px 20px",
                  textAlign:
                    "center",
                  color:
                    "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "32px",
                    marginBottom:
                      "8px",
                  }}
                >
                  ⏳
                </div>

                <div
                  style={{
                    fontWeight:
                      "800",
                    color:
                      "#334155",
                  }}
                >
                  Loading Statement...
                </div>
              </div>
            )}

            {/* EMPTY */}

            {!loadingStatement &&
              filteredInvoices.length ===
                0 && (
                <div
                  style={{
                    padding:
                      "55px 20px",
                    textAlign:
                      "center",
                    color:
                      "#64748b",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "42px",
                      marginBottom:
                        "10px",
                    }}
                  >
                    {search
                      ? "🔍"
                      : "📄"}
                  </div>

                  <div
                    style={{
                      fontSize:
                        "16px",
                      fontWeight:
                        "800",
                      color:
                        "#334155",
                    }}
                  >
                    {search
                      ? "No matching invoices found"
                      : "No Outstanding Invoices"}
                  </div>

                  <div
                    style={{
                      marginTop:
                        "5px",
                      fontSize:
                        "13px",
                    }}
                  >
                    {search
                      ? "Try another search term."
                      : "No outstanding invoice records were found for this customer."}
                  </div>
                </div>
              )}

            {/* TABLE */}

            {!loadingStatement &&
              filteredInvoices.length >
                0 && (
                <div
                  style={{
                    overflowX:
                      "auto",
                  }}
                >
                  <table
                    style={{
                      width:
                        "100%",
                      minWidth:
                        "800px",
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
                          style={
                            thStyle
                          }
                        >
                          #
                        </th>

                        <th
                          style={
                            thStyle
                          }
                        >
                          DATE
                        </th>

                        <th
                          style={
                            thStyle
                          }
                        >
                          INVOICE NO
                        </th>

                        <th
                          style={{
                            ...thStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          DEBIT
                        </th>

                        <th
                          style={{
                            ...thStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          RECEIVED
                        </th>

                        <th
                          style={{
                            ...thStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          BALANCE
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredInvoices.map(
                        (
                          invoice,
                          index
                        ) => {
                          const outstanding =
                            Number(
                              invoice.outstanding ||
                                0
                            );

                          return (
                            <tr
                              key={
                                invoice.id ||
                                index
                              }
                              style={{
                                background:
                                  index %
                                    2 ===
                                  0
                                    ? "#ffffff"
                                    : "#fafafa",
                              }}
                            >
                              {/* NUMBER */}

                              <td
                                style={
                                  tdStyle
                                }
                              >
                                <span
                                  style={{
                                    color:
                                      "#94a3b8",
                                    fontWeight:
                                      "700",
                                  }}
                                >
                                  {index +
                                    1}
                                </span>
                              </td>

                              {/* DATE */}

                              <td
                                style={
                                  tdStyle
                                }
                              >
                                {invoice.date ||
                                  "—"}
                              </td>

                              {/* INVOICE */}

                              <td
                                style={
                                  tdStyle
                                }
                              >
                                <span
                                  style={{
                                    color:
                                      "#2563eb",
                                    fontWeight:
                                      "800",
                                  }}
                                >
                                  {invoice.invoiceNo ||
                                    "—"}
                                </span>
                              </td>

                              {/* DEBIT */}

                              <td
                                style={{
                                  ...tdStyle,
                                  textAlign:
                                    "right",
                                  fontWeight:
                                    "700",
                                }}
                              >
                                ₹{" "}
                                {money(
                                  invoice.total
                                )}
                              </td>

                              {/* RECEIVED */}

                              <td
                                style={{
                                  ...tdStyle,
                                  textAlign:
                                    "right",
                                  color:
                                    "#15803d",
                                  fontWeight:
                                    "800",
                                }}
                              >
                                ₹{" "}
                                {money(
                                  invoice.received
                                )}
                              </td>

                              {/* BALANCE */}

                              <td
                                style={{
                                  ...tdStyle,
                                  textAlign:
                                    "right",
                                  fontWeight:
                                    "900",
                                  color:
                                    outstanding >
                                    0
                                      ? "#dc2626"
                                      : "#15803d",
                                }}
                              >
                                ₹{" "}
                                {money(
                                  invoice.outstanding
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>

                    {/* TOTAL */}

                    <tfoot>
                      <tr
                        style={{
                          background:
                            "#f8fafc",
                        }}
                      >
                        <td
                          colSpan="3"
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                            fontWeight:
                              "900",
                            borderTop:
                              "2px solid #cbd5e1",
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
                              "900",
                            borderTop:
                              "2px solid #cbd5e1",
                          }}
                        >
                          ₹{" "}
                          {money(
                            filteredSales
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                            fontWeight:
                              "900",
                            color:
                              "#15803d",
                            borderTop:
                              "2px solid #cbd5e1",
                          }}
                        >
                          ₹{" "}
                          {money(
                            filteredReceived
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                            fontWeight:
                              "900",
                            color:
                              filteredOutstanding >
                              0
                                ? "#dc2626"
                                : "#15803d",
                            borderTop:
                              "2px solid #cbd5e1",
                          }}
                        >
                          ₹{" "}
                          {money(
                            filteredOutstanding
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

            {/* ==================================================
                FOOTER
            ================================================== */}

            {!loadingStatement &&
              filteredInvoices.length >
                0 && (
                <div
                  style={{
                    padding:
                      "12px 20px",
                    borderTop:
                      "1px solid #e2e8f0",
                    background:
                      "#fafafa",
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap:
                      "10px",
                    flexWrap:
                      "wrap",
                    color:
                      "#64748b",
                    fontSize:
                      "12px",
                  }}
                >
                  <span>
                    Showing{" "}
                    <b
                      style={{
                        color:
                          "#334155",
                      }}
                    >
                      {
                        filteredInvoices.length
                      }
                    </b>{" "}
                    of{" "}
                    <b
                      style={{
                        color:
                          "#334155",
                      }}
                    >
                      {
                        invoices.length
                      }
                    </b>{" "}
                    invoices
                  </span>

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch(
                          ""
                        )
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        color:
                          "#2563eb",
                        cursor:
                          "pointer",
                        fontWeight:
                          "700",
                      }}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
}

// ==================================================
// TABLE STYLES
// ==================================================

const thStyle = {
  padding:
    "13px 12px",
  background:
    "#f8fafc",
  borderBottom:
    "1px solid #e2e8f0",
  textAlign:
    "left",
  fontSize:
    "11px",
  fontWeight:
    "800",
  color:
    "#64748b",
  whiteSpace:
    "nowrap",
};

const tdStyle = {
  padding:
    "13px 12px",
  borderBottom:
    "1px solid #f1f5f9",
  fontSize:
    "13px",
  color:
    "#475569",
  whiteSpace:
    "nowrap",
};