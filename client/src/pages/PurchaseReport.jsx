import { useEffect, useState } from "react";
import axios from "axios";

export default function PurchaseReport() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // ==================================================
  // LOAD REPORT
  // ==================================================

  useEffect(() => {
    loadPurchaseReport();
  }, []);

  const loadPurchaseReport = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/purchases/report/all"
      );

      setPurchases(res.data || []);
    } catch (err) {
      console.log(
        "Purchase Report Error:",
        err
      );

      alert(
        "Unable to load Purchase Report"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredPurchases =
    purchases.filter((purchase) => {
      const text =
        search.trim().toLowerCase();

      const matchesSearch =
        !text ||
        String(
          purchase.purchaseNo || ""
        )
          .toLowerCase()
          .includes(text) ||
        String(
          purchase.supplierName || ""
        )
          .toLowerCase()
          .includes(text);

      const matchesDate =
        !dateFilter ||
        String(
          purchase.purchaseDate || ""
        ) === dateFilter;

      return (
        matchesSearch &&
        matchesDate
      );
    });

  // ==================================================
  // TOTAL
  // ==================================================

  const totalPurchases =
    filteredPurchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.grandTotal || 0
        ),
      0
    );

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
  // UI
  // ==================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 22,
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#2563eb",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 23,
            }}
          >
            📊
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                color: "#0f172a",
              }}
            >
              Purchase Report
            </h1>

            <p
              style={{
                margin: "4px 0 0",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Purchase summary and
              supplier transaction report
            </p>
          </div>
        </div>

        <button
          onClick={loadPurchaseReport}
          style={{
            padding: "10px 16px",
            background: "white",
            color: "#334155",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <SummaryCard
          icon="📄"
          title="Purchase Transactions"
          value={
            filteredPurchases.length
          }
          subtitle="Transactions shown"
        />

        <SummaryCard
          icon="💰"
          title="Total Purchases"
          value={`₹ ${money(
            totalPurchases
          )}`}
          subtitle="Grand purchase value"
        />
      </div>

      {/* ==================================================
          SEARCH
      ================================================== */}

      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
          boxShadow:
            "0 2px 6px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                color: "#0f172a",
              }}
            >
              🔎 Search & Filter
            </h3>

            <p
              style={{
                margin: "3px 0 0",
                fontSize: 11,
                color: "#64748b",
              }}
            >
              Search by purchase number
              or supplier
            </p>
          </div>

          {(search || dateFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setDateFilter("");
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 12,
          }}
        >
          <div
            style={{
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform:
                  "translateY(-50%)",
                color: "#94a3b8",
              }}
            >
              🔎
            </span>

            <input
              type="text"
              placeholder="Search purchase no or supplier..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                ...inputStyle,
                paddingLeft: 38,
              }}
            />
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* ==================================================
          REPORT TABLE
      ================================================== */}

      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow:
            "0 2px 6px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            padding: "16px 18px",
            borderBottom:
              "1px solid #e2e8f0",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                color: "#0f172a",
              }}
            >
              📋 Purchase Transactions
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                color: "#64748b",
              }}
            >
              {filteredPurchases.length}{" "}
              transaction
              {filteredPurchases.length ===
              1
                ? ""
                : "s"}{" "}
              shown
            </p>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: 50,
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
              📊
            </div>

            Loading Purchase Report...
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: 750,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom:
                      "2px solid #e2e8f0",
                  }}
                >
                  <th style={thStyle}>
                    #
                  </th>

                  <th style={thStyle}>
                    Purchase No
                  </th>

                  <th style={thStyle}>
                    Date
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign: "left",
                    }}
                  >
                    Supplier
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign: "right",
                    }}
                  >
                    Grand Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPurchases.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        padding: 55,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 40,
                          marginBottom: 10,
                        }}
                      >
                        📭
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          color: "#334155",
                        }}
                      >
                        No Purchases Found
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          marginTop: 5,
                        }}
                      >
                        Try changing your
                        search or date filter.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map(
                    (purchase, index) => (
                      <tr
                        key={purchase.id}
                        style={{
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          {index + 1}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "5px 9px",
                              background:
                                "#eff6ff",
                              color:
                                "#1d4ed8",
                              borderRadius: 6,
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {
                              purchase.purchaseNo
                            }
                          </span>
                        </td>

                        <td style={tdStyle}>
                          {
                            purchase.purchaseDate
                          }
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background:
                                  "#f1f5f9",
                                display: "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              🏢
                            </div>

                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  "#334155",
                              }}
                            >
                              {
                                purchase.supplierName
                              }
                            </span>
                          </div>
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign: "right",
                          }}
                        >
                          <strong
                            style={{
                              fontSize: 14,
                              color: "#0f172a",
                            }}
                          >
                            ₹{" "}
                            {money(
                              purchase.grandTotal
                            )}
                          </strong>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>

              {filteredPurchases.length >
                0 && (
                <tfoot>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderTop:
                        "2px solid #cbd5e1",
                    }}
                  >
                    <td
                      colSpan="4"
                      style={{
                        padding:
                          "14px 12px",
                        textAlign: "right",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      TOTAL PURCHASES
                    </td>

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        textAlign: "right",
                        fontWeight: 800,
                        color: "#2563eb",
                        fontSize: 15,
                      }}
                    >
                      ₹{" "}
                      {money(
                        totalPurchases
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* ==================================================
          RESPONSIVE CSS
      ================================================== */}

      <style>
        {`
          input:focus {
            outline: none;
            border-color: #2563eb !important;
            box-shadow:
              0 0 0 3px rgba(37,99,235,0.10);
          }

          button:hover {
            filter: brightness(0.97);
          }

          @media (max-width: 700px) {
            .purchase-report-filter {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

// ==================================================
// SUMMARY CARD
// ==================================================

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div
      style={{
        background: "white",
        border:
          "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 16,
        boxShadow:
          "0 2px 6px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 9,
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          color: "#64748b",
          fontWeight: 600,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 20,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 10,
          color: "#94a3b8",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

// ==================================================
// STYLES
// ==================================================

const inputStyle = {
  width: "100%",
  height: 42,
  boxSizing: "border-box",
  padding: "0 12px",
  border:
    "1px solid #cbd5e1",
  borderRadius: 8,
  background: "white",
  color: "#0f172a",
  fontSize: 13,
};

const thStyle = {
  padding: "12px 10px",
  textAlign: "center",
  fontSize: 11,
  fontWeight: 700,
  color: "#475569",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "13px 10px",
  fontSize: 12,
  color: "#475569",
  whiteSpace: "nowrap",
};