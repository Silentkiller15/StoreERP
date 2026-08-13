import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function SupplierOutstanding() {
  // ==================================================
  // STATE
  // ==================================================

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] =
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

      const payables =
        res.data?.payables || [];

      // ==========================================
      // GROUP PURCHASES BY SUPPLIER
      // ==========================================

      const supplierMap = {};

      payables.forEach((item) => {
        const supplierName =
          item.supplierName ||
          "Unknown Supplier";

        if (!supplierMap[supplierName]) {
          supplierMap[supplierName] = {
            supplierName,
            purchases: [],
            total: 0,
            paid: 0,
            outstanding: 0,
          };
        }

        supplierMap[
          supplierName
        ].purchases.push(item);

        supplierMap[
          supplierName
        ].total +=
          Number(item.total) || 0;

        supplierMap[
          supplierName
        ].paid +=
          Number(item.paid) || 0;

        supplierMap[
          supplierName
        ].outstanding +=
          Number(item.outstanding) || 0;
      });

      setSuppliers(
        Object.values(supplierMap)
      );
    } catch (err) {
      console.log(
        "Supplier Outstanding Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load Supplier Outstanding"
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

  const totalPayable =
    suppliers.reduce(
      (sum, supplier) =>
        sum +
        Number(
          supplier.outstanding || 0
        ),
      0
    );

  const totalPurchaseValue =
    suppliers.reduce(
      (sum, supplier) =>
        sum +
        Number(
          supplier.total || 0
        ),
      0
    );

  const totalPaid =
    suppliers.reduce(
      (sum, supplier) =>
        sum +
        Number(
          supplier.paid || 0
        ),
      0
    );

  const totalPurchases =
    suppliers.reduce(
      (sum, supplier) =>
        sum +
        supplier.purchases.length,
      0
    );

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredSuppliers =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return suppliers;
      }

      return suppliers.filter(
        (supplier) =>
          `${supplier.supplierName}`
            .toLowerCase()
            .includes(keyword)
      );
    }, [
      suppliers,
      search,
    ]);

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

  const thStyle = {
    padding:
      "13px 12px",
    textAlign: "left",
    borderBottom:
      "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding:
      "13px 12px",
    borderBottom:
      "1px solid #f1f5f9",
    fontSize: "13px",
    color: "#475569",
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#f1f5f9",
        boxSizing: "border-box",
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
          marginBottom: "18px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "800",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
              marginBottom: "5px",
            }}
          >
            Suppliers
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              color: "#0f172a",
            }}
          >
            💳 Supplier Outstanding
          </h1>

          <div
            style={{
              marginTop: "5px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Track supplier balances,
            purchases and outstanding
            payments
          </div>
        </div>

        <button
          type="button"
          onClick={loadOutstanding}
          disabled={loading}
          style={{
            padding:
              "10px 17px",
            background:
              loading
                ? "#94a3b8"
                : "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor:
              loading
                ? "not-allowed"
                : "pointer",
            fontWeight: "800",
            fontSize: "13px",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        {/* TOTAL PAYABLE */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
            background: "#fff1f2",
            border:
              "1px solid #fecdd3",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#be123c",
              fontWeight: "800",
              textTransform:
                "uppercase",
              marginBottom: "8px",
            }}
          >
            Total Outstanding
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#be123c",
            }}
          >
            ₹ {money(totalPayable)}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#e11d48",
            }}
          >
            Amount payable
          </div>
        </div>

        {/* PURCHASE VALUE */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
            background: "#eff6ff",
            border:
              "1px solid #bfdbfe",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#1d4ed8",
              fontWeight: "800",
              textTransform:
                "uppercase",
              marginBottom: "8px",
            }}
          >
            Purchase Value
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#1d4ed8",
            }}
          >
            ₹{" "}
            {money(
              totalPurchaseValue
            )}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#3b82f6",
            }}
          >
            Total purchases
          </div>
        </div>

        {/* TOTAL PAID */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
            background: "#f0fdf4",
            border:
              "1px solid #bbf7d0",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#15803d",
              fontWeight: "800",
              textTransform:
                "uppercase",
              marginBottom: "8px",
            }}
          >
            Total Paid
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#15803d",
            }}
          >
            ₹ {money(totalPaid)}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#16a34a",
            }}
          >
            Payments made
          </div>
        </div>

        {/* SUPPLIERS */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
            background: "#faf5ff",
            border:
              "1px solid #e9d5ff",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#7e22ce",
              fontWeight: "800",
              textTransform:
                "uppercase",
              marginBottom: "8px",
            }}
          >
            Suppliers
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#7e22ce",
            }}
          >
            {suppliers.length}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#9333ea",
            }}
          >
            {totalPurchases} purchase entries
          </div>
        </div>
      </div>

      {/* ==================================================
          MAIN REGISTER
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow: "hidden",
        }}
      >
        {/* REGISTER HEADER */}

        <div
          style={{
            padding:
              "17px 20px",
            borderBottom:
              "1px solid #e2e8f0",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "800",
                color: "#0f172a",
                fontSize: "16px",
              }}
            >
              Supplier Outstanding
              Register
            </div>

            <div
              style={{
                marginTop: "3px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              {filteredSuppliers.length}{" "}
              supplier
              {filteredSuppliers.length ===
              1
                ? ""
                : "s"}{" "}
              displayed
            </div>
          </div>

          {/* SEARCH */}

          <div
            style={{
              position: "relative",
              width: "360px",
              maxWidth: "100%",
            }}
          >
            <span
              style={{
                position:
                  "absolute",
                left: "12px",
                top: "10px",
                fontSize: "16px",
              }}
            >
              🔍
            </span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search supplier..."
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding:
                  "10px 12px 10px 38px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                outline: "none",
                fontSize: "13px",
                background:
                  "#ffffff",
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
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: "38px",
                marginBottom: "10px",
              }}
            >
              ⏳
            </div>

            <div
              style={{
                fontWeight: "800",
                color: "#334155",
              }}
            >
              Loading supplier
              outstanding...
            </div>
          </div>
        ) : suppliers.length ===
          0 ? (
          /* ==================================================
              EMPTY
          ================================================== */

          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: "45px",
                marginBottom: "10px",
              }}
            >
              🚚
            </div>

            <div
              style={{
                fontSize: "17px",
                fontWeight: "800",
                color: "#334155",
              }}
            >
              No Outstanding
              Supplier Balances
            </div>

            <div
              style={{
                marginTop: "5px",
                fontSize: "13px",
              }}
            >
              There are currently no
              outstanding supplier
              payments.
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                TABLE
            ================================================== */}

            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth:
                    "900px",
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
                      SUPPLIER
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "center",
                      }}
                    >
                      PURCHASES
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
                      PAID
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
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSuppliers.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="7"
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
                              "35px",
                          }}
                        >
                          🔍
                        </div>

                        <div
                          style={{
                            marginTop:
                              "8px",
                            fontWeight:
                              "800",
                            color:
                              "#334155",
                          }}
                        >
                          No supplier
                          found
                        </div>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontSize:
                              "12px",
                          }}
                        >
                          Try another
                          search term.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map(
                      (
                        supplier,
                        index
                      ) => {
                        const isSelected =
                          selectedSupplier
                            ?.supplierName ===
                          supplier.supplierName;

                        return (
                          <tr
                            key={
                              supplier.supplierName
                            }
                            style={{
                              background:
                                isSelected
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

                            {/* SUPPLIER */}

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
                                      "38px",
                                    height:
                                      "38px",
                                    borderRadius:
                                      "50%",
                                    background:
                                      "#fee2e2",
                                    color:
                                      "#b91c1c",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    fontWeight:
                                      "900",
                                    fontSize:
                                      "15px",
                                    flexShrink:
                                      0,
                                  }}
                                >
                                  {String(
                                    supplier.supplierName ||
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
                                      supplier.supplierName
                                    }
                                  </div>

                                  <div
                                    style={{
                                      marginTop:
                                        "3px",
                                      fontSize:
                                        "11px",
                                      color:
                                        "#64748b",
                                    }}
                                  >
                                    Supplier
                                    account
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* PURCHASE COUNT */}

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
                                  fontSize:
                                    "12px",
                                }}
                              >
                                {
                                  supplier
                                    .purchases
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
                                color:
                                  "#334155",
                              }}
                            >
                              ₹{" "}
                              {money(
                                supplier.total
                              )}
                            </td>

                            {/* PAID */}

                            <td
                              style={{
                                ...tdStyle,
                                textAlign:
                                  "right",
                                color:
                                  "#15803d",
                                fontWeight:
                                  "700",
                              }}
                            >
                              ₹{" "}
                              {money(
                                supplier.paid
                              )}
                            </td>

                            {/* OUTSTANDING */}

                            <td
                              style={{
                                ...tdStyle,
                                textAlign:
                                  "right",
                              }}
                            >
                              <span
                                style={{
                                  display:
                                    "inline-block",
                                  padding:
                                    "6px 9px",
                                  borderRadius:
                                    "6px",
                                  background:
                                    "#fef2f2",
                                  color:
                                    "#dc2626",
                                  fontWeight:
                                    "900",
                                }}
                              >
                                ₹{" "}
                                {money(
                                  supplier.outstanding
                                )}
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
                                  setSelectedSupplier(
                                    supplier
                                  )
                                }
                                style={{
                                  padding:
                                    "8px 12px",
                                  border:
                                    "1px solid #bfdbfe",
                                  borderRadius:
                                    "7px",
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
                                👁 View
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>

                {/* TABLE FOOTER */}

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
                        color:
                          "#334155",
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
                      }}
                    >
                      ₹{" "}
                      {money(
                        totalPurchaseValue
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
                      }}
                    >
                      ₹{" "}
                      {money(
                        totalPaid
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
                      }}
                    >
                      ₹{" "}
                      {money(
                        totalPayable
                      )}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
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
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap: "10px",
                flexWrap:
                  "wrap",
                color:
                  "#64748b",
                fontSize: "12px",
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
                    filteredSuppliers.length
                  }
                </b>{" "}
                of{" "}
                <b
                  style={{
                    color:
                      "#334155",
                  }}
                >
                  {suppliers.length}
                </b>{" "}
                suppliers
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
          SUPPLIER DETAIL MODAL
      ================================================== */}

      {selectedSupplier && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() =>
            setSelectedSupplier(
              null
            )
          }
        >
          <div
            style={{
              width: "100%",
              maxWidth: "950px",
              maxHeight:
                "90vh",
              overflow:
                "auto",
              background:
                "#ffffff",
              borderRadius:
                "14px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.25)",
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
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap: "15px",
                position:
                  "sticky",
                top: 0,
                background:
                  "#ffffff",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "11px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius:
                      "50%",
                    background:
                      "#fee2e2",
                    color:
                      "#b91c1c",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontSize:
                      "18px",
                    fontWeight:
                      "900",
                  }}
                >
                  {String(
                    selectedSupplier.supplierName ||
                      "?"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <div
                    style={{
                      fontSize:
                        "17px",
                      fontWeight:
                        "900",
                      color:
                        "#0f172a",
                    }}
                  >
                    {
                      selectedSupplier.supplierName
                    }
                  </div>

                  <div
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                      marginTop:
                        "2px",
                    }}
                  >
                    Supplier Outstanding
                    Statement
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSupplier(
                    null
                  )
                }
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius:
                    "8px",
                  border:
                    "1px solid #e2e8f0",
                  background:
                    "#f8fafc",
                  color:
                    "#475569",
                  cursor:
                    "pointer",
                  fontSize:
                    "16px",
                }}
              >
                ✕
              </button>
            </div>

            {/* MODAL SUMMARY */}

            <div
              style={{
                padding:
                  "18px 22px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "12px",
              }}
            >
              <div
                style={{
                  padding:
                    "14px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "9px",
                  background:
                    "#f8fafc",
                }}
              >
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
                  Purchases
                </div>

                <div
                  style={{
                    marginTop:
                      "5px",
                    fontSize:
                      "19px",
                    fontWeight:
                      "900",
                    color:
                      "#0f172a",
                  }}
                >
                  {
                    selectedSupplier
                      .purchases
                      .length
                  }
                </div>
              </div>

              <div
                style={{
                  padding:
                    "14px",
                  border:
                    "1px solid #bbf7d0",
                  borderRadius:
                    "9px",
                  background:
                    "#f0fdf4",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#15803d",
                    fontWeight:
                      "800",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Paid
                </div>

                <div
                  style={{
                    marginTop:
                      "5px",
                    fontSize:
                      "19px",
                    fontWeight:
                      "900",
                    color:
                      "#15803d",
                  }}
                >
                  ₹{" "}
                  {money(
                    selectedSupplier.paid
                  )}
                </div>
              </div>

              <div
                style={{
                  padding:
                    "14px",
                  border:
                    "1px solid #fecaca",
                  borderRadius:
                    "9px",
                  background:
                    "#fef2f2",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#dc2626",
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
                      "5px",
                    fontSize:
                      "19px",
                    fontWeight:
                      "900",
                    color:
                      "#dc2626",
                  }}
                >
                  ₹{" "}
                  {money(
                    selectedSupplier.outstanding
                  )}
                </div>
              </div>
            </div>

            {/* ==================================================
                DETAIL TABLE
            ================================================== */}

            <div
              style={{
                padding:
                  "0 22px 22px",
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
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
                    }}
                  >
                    <th
                      style={
                        thStyle
                      }
                    >
                      PURCHASE NO
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
                      PAID
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
                  {selectedSupplier.purchases.map(
                    (
                      purchase,
                      index
                    ) => (
                      <tr
                        key={
                          purchase.id ||
                          index
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              fontWeight:
                                "800",
                              color:
                                "#2563eb",
                            }}
                          >
                            {
                              purchase.purchaseNo
                            }
                          </span>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            purchase.date
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
                            purchase.total
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
                              "700",
                          }}
                        >
                          ₹{" "}
                          {money(
                            purchase.paid
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
                          }}
                        >
                          ₹{" "}
                          {money(
                            purchase.outstanding
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
                      colSpan="2"
                      style={{
                        ...tdStyle,
                        textAlign:
                          "right",
                        fontWeight:
                          "900",
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
                      }}
                    >
                      ₹{" "}
                      {money(
                        selectedSupplier.total
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
                      }}
                    >
                      ₹{" "}
                      {money(
                        selectedSupplier.paid
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
                      }}
                    >
                      ₹{" "}
                      {money(
                        selectedSupplier.outstanding
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
                  setSelectedSupplier(
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
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}