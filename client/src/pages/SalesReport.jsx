import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function SalesReport() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================================
  // LOAD SALES REPORT
  // ==================================================

  useEffect(() => {
    loadSalesReport();
  }, []);

  const loadSalesReport = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://mudhikhana.onrender.com/sales/report/all"
      );

      setSales(res.data || []);
    } catch (err) {
      console.log(err);
      alert("Unable to load Sales Report");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredSales = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return sales;
    }

    return sales.filter(
      (sale) =>
        String(sale.saleNo || "")
          .toLowerCase()
          .includes(keyword) ||
        String(sale.customerName || "")
          .toLowerCase()
          .includes(keyword) ||
        String(sale.saleDate || "")
          .toLowerCase()
          .includes(keyword)
    );
  }, [sales, search]);

  // ==================================================
  // TOTALS
  // ==================================================

  const totalSales = filteredSales.reduce(
    (sum, sale) =>
      sum +
      Number(sale.grandTotal || 0),
    0
  );

  const totalTaxable = filteredSales.reduce(
    (sum, sale) =>
      sum +
      Number(sale.total || 0),
    0
  );

  const totalGST = filteredSales.reduce(
    (sum, sale) =>
      sum +
      Number(sale.gst || 0),
    0
  );

  // ==================================================
  // STYLES
  // ==================================================

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.06)",
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
          padding: "20px 24px",
          marginBottom: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "5px",
            }}
          >
            Reports
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              color: "#0f172a",
            }}
          >
            📊 Sales Report
          </h1>

          <div
            style={{
              marginTop: "5px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Review sales transactions
            and invoice totals
          </div>
        </div>

        <button
          onClick={loadSalesReport}
          disabled={loading}
          style={{
            border: "none",
            background:
              loading
                ? "#94a3b8"
                : "#2563eb",
            color: "white",
            padding: "11px 17px",
            borderRadius: "8px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            fontWeight: "800",
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
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: "14px",
          marginBottom: "18px",
        }}
      >

        {/* INVOICES */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "800",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Sales Invoices
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#0f172a",
            }}
          >
            {filteredSales.length}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            Transactions
          </div>
        </div>

        {/* TAXABLE */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "800",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Taxable Sales
          </div>

          <div
            style={{
              fontSize: "22px",
              fontWeight: "900",
              color: "#0f172a",
            }}
          >
            ₹{" "}
            {totalTaxable.toFixed(2)}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            Before GST
          </div>
        </div>

        {/* GST */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "800",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            GST
          </div>

          <div
            style={{
              fontSize: "22px",
              fontWeight: "900",
              color: "#0f172a",
            }}
          >
            ₹{" "}
            {totalGST.toFixed(2)}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            Total tax
          </div>
        </div>

        {/* GRAND TOTAL */}

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
              fontSize: "12px",
              color: "#1d4ed8",
              fontWeight: "800",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Total Sales
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#1d4ed8",
            }}
          >
            ₹{" "}
            {totalSales.toFixed(2)}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#3b82f6",
            }}
          >
            Including GST
          </div>
        </div>
      </div>

      {/* ==================================================
          REPORT TABLE
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow: "hidden",
        }}
      >

        {/* TOOLBAR */}

        <div
          style={{
            padding: "17px 20px",
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
              }}
            >
              Sales Transactions
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                marginTop: "3px",
              }}
            >
              Detailed sales report
            </div>
          </div>

          <div
            style={{
              position: "relative",
              width: "360px",
              maxWidth: "100%",
            }}
          >
            <span
              style={{
                position: "absolute",
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
              placeholder="Search sale no, customer or date..."
              style={{
                width: "100%",
                padding:
                  "10px 12px 10px 38px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "8px",
                outline: "none",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
          </div>
        </div>

        {/* TABLE */}

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "850px",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                }}
              >
                <th
                  style={{
                    padding: "13px 15px",
                    textAlign: "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  #
                </th>

                <th
                  style={{
                    padding: "13px 15px",
                    textAlign: "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  SALE NO
                </th>

                <th
                  style={{
                    padding: "13px 15px",
                    textAlign: "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  DATE
                </th>

                <th
                  style={{
                    padding: "13px 15px",
                    textAlign: "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  CUSTOMER
                </th>

                <th
                  style={{
                    padding: "13px 15px",
                    textAlign: "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  TAXABLE
                </th>

                <th
                  style={{
                    padding: "13px 15px",
                    textAlign: "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  GST
                </th>

                <th
                  style={{
                    padding: "13px 15px",
                    textAlign: "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  GRAND TOTAL
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="7"
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
                      📊
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
                        ? "No matching sales found"
                        : "No Sales Found"}
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
                        ? "Try a different search term."
                        : "Sales will appear here once invoices are created."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map(
                  (sale, index) => (
                    <tr
                      key={sale.id}
                      style={{
                        background:
                          index % 2 ===
                          0
                            ? "#ffffff"
                            : "#fafafa",
                      }}
                    >
                      <td
                        style={{
                          padding:
                            "13px 15px",
                          borderBottom:
                            "1px solid #f1f5f9",
                          color:
                            "#64748b",
                          fontWeight:
                            "700",
                        }}
                      >
                        {index + 1}
                      </td>

                      <td
                        style={{
                          padding:
                            "13px 15px",
                          borderBottom:
                            "1px solid #f1f5f9",
                          color:
                            "#2563eb",
                          fontWeight:
                            "800",
                        }}
                      >
                        {sale.saleNo}
                      </td>

                      <td
                        style={{
                          padding:
                            "13px 15px",
                          borderBottom:
                            "1px solid #f1f5f9",
                          color:
                            "#475569",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {sale.saleDate}
                      </td>

                      <td
                        style={{
                          padding:
                            "13px 15px",
                          borderBottom:
                            "1px solid #f1f5f9",
                          fontWeight:
                            "700",
                          color:
                            "#0f172a",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "9px",
                          }}
                        >
                          <div
                            style={{
                              width:
                                "32px",
                              height:
                                "32px",
                              borderRadius:
                                "50%",
                              background:
                                "#dbeafe",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >
                            👤
                          </div>

                          <span>
                            {sale.customerName ||
                              "Cash Customer"}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{
                          padding:
                            "13px 15px",
                          textAlign:
                            "right",
                          borderBottom:
                            "1px solid #f1f5f9",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        ₹{" "}
                        {Number(
                          sale.total ||
                            0
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "13px 15px",
                          textAlign:
                            "right",
                          borderBottom:
                            "1px solid #f1f5f9",
                          color:
                            "#64748b",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        ₹{" "}
                        {Number(
                          sale.gst ||
                            0
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "13px 15px",
                          textAlign:
                            "right",
                          borderBottom:
                            "1px solid #f1f5f9",
                          fontWeight:
                            "900",
                          color:
                            "#0f172a",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        ₹{" "}
                        {Number(
                          sale.grandTotal ||
                            0
                        ).toFixed(
                          2
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>

            {/* ==================================================
                TOTAL FOOTER
            ================================================== */}

            {filteredSales.length >
              0 && (
              <tfoot>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                  }}
                >
                  <td
                    colSpan="4"
                    style={{
                      padding:
                        "15px",
                      borderTop:
                        "2px solid #cbd5e1",
                      fontWeight:
                        "900",
                      color:
                        "#0f172a",
                    }}
                  >
                    TOTAL
                  </td>

                  <td
                    style={{
                      padding:
                        "15px",
                      textAlign:
                        "right",
                      borderTop:
                        "2px solid #cbd5e1",
                      fontWeight:
                        "900",
                    }}
                  >
                    ₹{" "}
                    {totalTaxable.toFixed(
                      2
                    )}
                  </td>

                  <td
                    style={{
                      padding:
                        "15px",
                      textAlign:
                        "right",
                      borderTop:
                        "2px solid #cbd5e1",
                      fontWeight:
                        "900",
                    }}
                  >
                    ₹{" "}
                    {totalGST.toFixed(
                      2
                    )}
                  </td>

                  <td
                    style={{
                      padding:
                        "15px",
                      textAlign:
                        "right",
                      borderTop:
                        "2px solid #cbd5e1",
                      fontWeight:
                        "900",
                      color:
                        "#2563eb",
                    }}
                  >
                    ₹{" "}
                    {totalSales.toFixed(
                      2
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* ==================================================
            FOOTER
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
              {filteredSales.length}
            </b>{" "}
            of{" "}
            <b
              style={{
                color:
                  "#334155",
              }}
            >
              {sales.length}
            </b>{" "}
            sales
          </span>

          {search && (
            <button
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
      </div>
    </div>
  );
}