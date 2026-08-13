import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function CustomerOutstanding() {
  // ==================================================
  // STATE
  // ==================================================

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] =
    useState(null);
  const [search, setSearch] = useState("");

  // ==================================================
  // LOAD OUTSTANDING
  // ==================================================

  const loadOutstanding = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/accounts/outstanding"
      );

      const receivables =
        res.data?.receivables || [];

      // Group invoices by customer
      const customerMap = {};

      receivables.forEach((item) => {
        const customerName =
          item.customerName ||
          "Unknown Customer";

        if (!customerMap[customerName]) {
          customerMap[customerName] = {
            customerName,
            invoices: [],
            total: 0,
            received: 0,
            outstanding: 0,
          };
        }

        customerMap[
          customerName
        ].invoices.push(item);

        customerMap[
          customerName
        ].total +=
          Number(item.total) || 0;

        customerMap[
          customerName
        ].received +=
          Number(item.received) || 0;

        customerMap[
          customerName
        ].outstanding +=
          Number(item.outstanding) || 0;
      });

      setCustomers(
        Object.values(customerMap)
      );
    } catch (err) {
      console.log(
        "Customer Outstanding Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load Customer Outstanding"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadOutstanding();
  }, []);

  // ==================================================
  // MONEY FORMAT
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

  const totalReceivable =
    customers.reduce(
      (sum, customer) =>
        sum +
        (Number(
          customer.outstanding
        ) || 0),
      0
    );

  const totalSales =
    customers.reduce(
      (sum, customer) =>
        sum +
        (Number(
          customer.total
        ) || 0),
      0
    );

  const totalReceived =
    customers.reduce(
      (sum, customer) =>
        sum +
        (Number(
          customer.received
        ) || 0),
      0
    );

  // ==================================================
  // CUSTOMER COUNTS
  // ==================================================

  const customersWithOutstanding =
    customers.filter(
      (customer) =>
        Number(
          customer.outstanding
        ) > 0
    ).length;

  const settledCustomers =
    customers.filter(
      (customer) =>
        Number(
          customer.outstanding
        ) <= 0
    ).length;

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredCustomers =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return customers;
      }

      return customers.filter(
        (customer) => {
          const invoiceText =
            customer.invoices
              .map(
                (invoice) =>
                  `${invoice.invoiceNo || ""} ${
                    invoice.date || ""
                  }`
              )
              .join(" ");

          return `${customer.customerName} ${invoiceText}`
            .toLowerCase()
            .includes(keyword);
        }
      );
    }, [customers, search]);

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
            💰 Customer Outstanding
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
            Track customer balances,
            payments and outstanding
            invoices
          </div>
        </div>

        <button
          type="button"
          onClick={
            loadOutstanding
          }
          disabled={loading}
          style={{
            padding:
              "11px 18px",
            background:
              loading
                ? "#94a3b8"
                : "#2563eb",
            color:
              "white",
            border:
              "none",
            borderRadius:
              "8px",
            cursor:
              loading
                ? "not-allowed"
                : "pointer",
            fontWeight:
              "800",
          }}
        >
          {loading
            ? "Loading..."
            : "↻ Refresh"}
        </button>
      </div>

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
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
              "18px",
            background:
              "#eff6ff",
            border:
              "1px solid #bfdbfe",
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
              marginBottom:
                "8px",
            }}
          >
            Total Sales
          </div>

          <div
            style={{
              fontSize:
                "24px",
              fontWeight:
                "900",
              color:
                "#1d4ed8",
            }}
          >
            ₹ {money(totalSales)}
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

        {/* RECEIVED */}

        <div
          style={{
            ...cardStyle,
            padding:
              "18px",
            background:
              "#f0fdf4",
            border:
              "1px solid #bbf7d0",
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
              marginBottom:
                "8px",
            }}
          >
            Total Received
          </div>

          <div
            style={{
              fontSize:
                "24px",
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
              "18px",
            background:
              totalReceivable > 0
                ? "#fef2f2"
                : "#f0fdf4",
            border:
              totalReceivable > 0
                ? "1px solid #fecaca"
                : "1px solid #bbf7d0",
          }}
        >
          <div
            style={{
              fontSize:
                "11px",
              color:
                totalReceivable > 0
                  ? "#dc2626"
                  : "#15803d",
              fontWeight:
                "800",
              textTransform:
                "uppercase",
              marginBottom:
                "8px",
            }}
          >
            Total Receivable
          </div>

          <div
            style={{
              fontSize:
                "24px",
              fontWeight:
                "900",
              color:
                totalReceivable > 0
                  ? "#dc2626"
                  : "#15803d",
            }}
          >
            ₹{" "}
            {money(
              totalReceivable
            )}
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "12px",
              color:
                totalReceivable > 0
                  ? "#ef4444"
                  : "#16a34a",
            }}
          >
            {totalReceivable > 0
              ? "Amount to be collected"
              : "All balances settled"}
          </div>
        </div>

        {/* CUSTOMERS */}

        <div
          style={{
            ...cardStyle,
            padding:
              "18px",
          }}
        >
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
              marginBottom:
                "8px",
            }}
          >
            Customers
          </div>

          <div
            style={{
              fontSize:
                "24px",
              fontWeight:
                "900",
              color:
                "#0f172a",
            }}
          >
            {customers.length}
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "12px",
              color:
                "#64748b",
            }}
          >
            {customersWithOutstanding}{" "}
            outstanding ·{" "}
            {settledCustomers} settled
          </div>
        </div>
      </div>

      {/* ==================================================
          SEARCH / REGISTER HEADER
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow:
            "hidden",
        }}
      >
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
              Customer Outstanding Register
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
              Customer-wise receivable
              summary
            </div>
          </div>

          <div
            style={{
              position:
                "relative",
              width:
                "370px",
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
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search customer or invoice..."
              style={{
                ...inputStyle,
                padding:
                  "10px 12px 10px 38px",
              }}
            />
          </div>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div
            style={{
              padding:
                "60px 20px",
              textAlign:
                "center",
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
              Loading Customer Outstanding...
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
        ) : customers.length ===
          0 ? (
          <div
            style={{
              padding:
                "60px 20px",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize:
                  "45px",
                marginBottom:
                  "10px",
              }}
            >
              💰
            </div>

            <div
              style={{
                fontSize:
                  "17px",
                fontWeight:
                  "800",
                color:
                  "#334155",
              }}
            >
              No Outstanding Customer Balances
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
              No customer receivable
              records were found.
            </div>
          </div>
        ) : filteredCustomers.length ===
          0 ? (
          <div
            style={{
              padding:
                "60px 20px",
              textAlign:
                "center",
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
              🔍
            </div>

            <div
              style={{
                fontSize:
                  "17px",
                fontWeight:
                  "800",
                color:
                  "#334155",
              }}
            >
              No Matching Customers
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
              Try a different search term.
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                CUSTOMER TABLE
            ================================================== */}

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
                    "950px",
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
                      CUSTOMER
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "center",
                      }}
                    >
                      INVOICES
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      TOTAL
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
                      OUTSTANDING
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "center",
                      }}
                    >
                      STATUS
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "center",
                      }}
                    >
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map(
                    (
                      customer,
                      index
                    ) => {
                      const outstanding =
                        Number(
                          customer.outstanding ||
                            0
                        );

                      const settled =
                        outstanding <=
                        0;

                      return (
                        <tr
                          key={
                            customer.customerName
                          }
                          style={{
                            background:
                              selectedCustomer?.customerName ===
                              customer.customerName
                                ? "#eff6ff"
                                : index %
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

                          {/* CUSTOMER */}

                          <td
                            style={
                              tdStyle
                            }
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap:
                                  "10px",
                              }}
                            >
                              <div
                                style={{
                                  width:
                                    "36px",
                                  height:
                                    "36px",
                                  borderRadius:
                                    "50%",
                                  background:
                                    settled
                                      ? "#dcfce7"
                                      : "#fee2e2",
                                  color:
                                    settled
                                      ? "#15803d"
                                      : "#dc2626",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontWeight:
                                    "900",
                                  flexShrink:
                                    0,
                                }}
                              >
                                {String(
                                  customer.customerName ||
                                    "?"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>
                                <div
                                  style={{
                                    fontWeight:
                                      "800",
                                    color:
                                      "#0f172a",
                                  }}
                                >
                                  {
                                    customer.customerName
                                  }
                                </div>

                                <div
                                  style={{
                                    fontSize:
                                      "11px",
                                    color:
                                      "#64748b",
                                    marginTop:
                                      "2px",
                                  }}
                                >
                                  Customer account
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* INVOICES */}

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            <span
                              style={{
                                display:
                                  "inline-block",
                                minWidth:
                                  "30px",
                                padding:
                                  "5px 8px",
                                borderRadius:
                                  "6px",
                                background:
                                  "#f1f5f9",
                                color:
                                  "#334155",
                                fontWeight:
                                  "800",
                              }}
                            >
                              {
                                customer
                                  .invoices
                                  .length
                              }
                            </span>
                          </td>

                          {/* TOTAL */}

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
                              customer.total
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
                              customer.received
                            )}
                          </td>

                          {/* OUTSTANDING */}

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "right",
                              fontWeight:
                                "900",
                              color:
                                settled
                                  ? "#15803d"
                                  : "#dc2626",
                            }}
                          >
                            ₹{" "}
                            {money(
                              customer.outstanding
                            )}
                          </td>

                          {/* STATUS */}

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            <span
                              style={{
                                display:
                                  "inline-block",
                                padding:
                                  "5px 9px",
                                borderRadius:
                                  "6px",
                                background:
                                  settled
                                    ? "#dcfce7"
                                    : "#fee2e2",
                                color:
                                  settled
                                    ? "#15803d"
                                    : "#dc2626",
                                fontSize:
                                  "10px",
                                fontWeight:
                                  "900",
                              }}
                            >
                              {settled
                                ? "SETTLED"
                                : "OUTSTANDING"}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCustomer(
                                  customer
                                )
                              }
                              style={{
                                padding:
                                  "7px 11px",
                                border:
                                  "1px solid #bfdbfe",
                                borderRadius:
                                  "6px",
                                background:
                                  "#eff6ff",
                                color:
                                  "#2563eb",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  "800",
                                fontSize:
                                  "12px",
                              }}
                            >
                              📋 View Statement
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>

                {/* TABLE TOTAL */}

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
                        filteredCustomers.reduce(
                          (sum, customer) =>
                            sum +
                            Number(
                              customer.total ||
                                0
                            ),
                          0
                        )
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
                        filteredCustomers.reduce(
                          (sum, customer) =>
                            sum +
                            Number(
                              customer.received ||
                                0
                            ),
                          0
                        )
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
                          "#dc2626",
                        borderTop:
                          "2px solid #cbd5e1",
                      }}
                    >
                      ₹{" "}
                      {money(
                        filteredCustomers.reduce(
                          (sum, customer) =>
                            sum +
                            Number(
                              customer.outstanding ||
                                0
                            ),
                          0
                        )
                      )}
                    </td>

                    <td
                      colSpan="2"
                      style={{
                        borderTop:
                          "2px solid #cbd5e1",
                      }}
                    />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ==================================================
                REGISTER FOOTER
            ================================================== */}

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
                    filteredCustomers.length
                  }
                </b>{" "}
                of{" "}
                <b
                  style={{
                    color:
                      "#334155",
                  }}
                >
                  {customers.length}
                </b>{" "}
                customers
              </span>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
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
          </>
        )}
      </div>

      {/* ==================================================
          CUSTOMER STATEMENT MODAL
      ================================================== */}

      {selectedCustomer && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
            zIndex: 1000,
          }}
          onClick={() =>
            setSelectedCustomer(
              null
            )
          }
        >
          <div
            style={{
              width:
                "100%",
              maxWidth:
                "1050px",
              maxHeight:
                "90vh",
              background:
                "#ffffff",
              borderRadius:
                "14px",
              boxShadow:
                "0 20px 50px rgba(15, 23, 42, 0.25)",
              overflow:
                "hidden",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}

            <div
              style={{
                padding:
                  "18px 22px",
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
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "12px",
                }}
              >
                <div
                  style={{
                    width:
                      "42px",
                    height:
                      "42px",
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
                    fontWeight:
                      "900",
                    fontSize:
                      "18px",
                  }}
                >
                  {String(
                    selectedCustomer.customerName ||
                      "?"
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
                    Customer Statement
                  </div>

                  <div
                    style={{
                      fontSize:
                        "19px",
                      fontWeight:
                        "900",
                      color:
                        "#0f172a",
                    }}
                  >
                    {
                      selectedCustomer.customerName
                    }
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(
                    null
                  )
                }
                style={{
                  width:
                    "34px",
                  height:
                    "34px",
                  border:
                    "none",
                  borderRadius:
                    "7px",
                  background:
                    "#f1f5f9",
                  color:
                    "#475569",
                  cursor:
                    "pointer",
                  fontSize:
                    "17px",
                  fontWeight:
                    "800",
                }}
              >
                ✕
              </button>
            </div>

            {/* MODAL SUMMARY */}

            <div
              style={{
                padding:
                  "16px 22px",
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap:
                  "10px",
                background:
                  "#f8fafc",
                borderBottom:
                  "1px solid #e2e8f0",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#64748b",
                    fontWeight:
                      "800",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Total
                </div>

                <div
                  style={{
                    marginTop:
                      "3px",
                    fontWeight:
                      "900",
                    color:
                      "#0f172a",
                  }}
                >
                  ₹{" "}
                  {money(
                    selectedCustomer.total
                  )}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#64748b",
                    fontWeight:
                      "800",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Received
                </div>

                <div
                  style={{
                    marginTop:
                      "3px",
                    fontWeight:
                      "900",
                    color:
                      "#15803d",
                  }}
                >
                  ₹{" "}
                  {money(
                    selectedCustomer.received
                  )}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#64748b",
                    fontWeight:
                      "800",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Outstanding
                </div>

                <div
                  style={{
                    marginTop:
                      "3px",
                    fontWeight:
                      "900",
                    color:
                      Number(
                        selectedCustomer.outstanding ||
                          0
                      ) > 0
                        ? "#dc2626"
                        : "#15803d",
                  }}
                >
                  ₹{" "}
                  {money(
                    selectedCustomer.outstanding
                  )}
                </div>
              </div>
            </div>

            {/* MODAL TABLE */}

            <div
              style={{
                maxHeight:
                  "55vh",
                overflowY:
                  "auto",
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width:
                    "100%",
                  minWidth:
                    "700px",
                  borderCollapse:
                    "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#f8fafc",
                      position:
                        "sticky",
                      top: 0,
                      zIndex: 1,
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
                      INVOICE NO
                    </th>

                    <th
                      style={
                        thStyle
                      }
                    >
                      DATE
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      TOTAL
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
                      OUTSTANDING
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedCustomer.invoices.map(
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
                          {index + 1}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color:
                              "#2563eb",
                            fontWeight:
                              "800",
                          }}
                        >
                          {invoice.invoiceNo ||
                            "—"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {invoice.date ||
                            "—"}
                        </td>

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

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                            color:
                              Number(
                                invoice.outstanding ||
                                  0
                              ) > 0
                                ? "#dc2626"
                                : "#15803d",
                            fontWeight:
                              "900",
                          }}
                        >
                          ₹{" "}
                          {money(
                            invoice.outstanding
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

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
                        selectedCustomer.total
                      )}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        textAlign:
                          "right",
                        color:
                          "#15803d",
                        fontWeight:
                          "900",
                        borderTop:
                          "2px solid #cbd5e1",
                      }}
                    >
                      ₹{" "}
                      {money(
                        selectedCustomer.received
                      )}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        textAlign:
                          "right",
                        color:
                          "#dc2626",
                        fontWeight:
                          "900",
                        borderTop:
                          "2px solid #cbd5e1",
                      }}
                    >
                      ₹{" "}
                      {money(
                        selectedCustomer.outstanding
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* MODAL FOOTER */}

            <div
              style={{
                padding:
                  "13px 22px",
                borderTop:
                  "1px solid #e2e8f0",
                background:
                  "#fafafa",
                display:
                  "flex",
                justifyContent:
                  "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(
                    null
                  )
                }
                style={{
                  padding:
                    "9px 18px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius:
                    "8px",
                  background:
                    "#ffffff",
                  color:
                    "#475569",
                  cursor:
                    "pointer",
                  fontWeight:
                    "800",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
  textAlign:
    "left",
  borderBottom:
    "1px solid #e2e8f0",
  color:
    "#64748b",
  fontSize:
    "11px",
  fontWeight:
    "800",
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