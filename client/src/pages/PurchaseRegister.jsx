import { useState, useEffect } from "react";
import axios from "axios";

export default function PurchaseRegister({
  setPage,
  setEditingPurchaseId,
}) {
  const [purchases, setPurchases] = useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // DELETE MODE
  // ==================================================

  const [deleteMode, setDeleteMode] =
    useState(false);

  const [selectedPurchases, setSelectedPurchases] =
    useState([]);

  // ==================================================
  // SEARCH / FILTER
  // ==================================================

  const [search, setSearch] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  // ==================================================
  // LOAD PURCHASES
  // ==================================================

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://mudhikhana.onrender.com/purchases"
      );

      setPurchases(
        res.data || []
      );
    } catch (err) {
      console.log(
        "Purchase Register Error:",
        err
      );

      alert(
        "Unable to load Purchase Register"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // SELECT PURCHASE
  // ==================================================

  const togglePurchaseSelection =
    (id) => {
      setSelectedPurchases(
        (prev) => {
          if (
            prev.includes(id)
          ) {
            return prev.filter(
              (purchaseId) =>
                purchaseId !== id
            );
          }

          return [
            ...prev,
            id,
          ];
        }
      );
    };

  // ==================================================
  // SELECT ALL
  // ==================================================

  const toggleSelectAll =
    () => {
      if (
        selectedPurchases.length ===
        filteredPurchases.length
      ) {
        setSelectedPurchases([]);
      } else {
        setSelectedPurchases(
          filteredPurchases.map(
            (purchase) =>
              purchase.id
          )
        );
      }
    };

  // ==================================================
  // DELETE SELECTED
  // ==================================================

  const deleteSelectedPurchases =
    async () => {
      if (
        selectedPurchases.length ===
        0
      ) {
        alert(
          "Please select at least one purchase"
        );

        return;
      }

      const message =
        selectedPurchases.length ===
        1
          ? "Are you sure you want to delete this purchase?"
          : `Are you sure you want to delete ${selectedPurchases.length} purchases?`;

      const ok =
        window.confirm(
          message
        );

      if (!ok) return;

      try {
        await Promise.all(
          selectedPurchases.map(
            (id) =>
              axios.delete(
                `https://mudhikhana.onrender.com/purchases/${id}`
              )
          )
        );

        alert(
          selectedPurchases.length ===
            1
            ? "Purchase Deleted Successfully"
            : `${selectedPurchases.length} Purchases Deleted Successfully`
        );

        setSelectedPurchases(
          []
        );

        setDeleteMode(false);

        await loadPurchases();
      } catch (err) {
        console.log(err);

        alert(
          "Error deleting selected purchases"
        );
      }
    };

  // ==================================================
  // CANCEL DELETE MODE
  // ==================================================

  const cancelDeleteMode =
    () => {
      setDeleteMode(false);

      setSelectedPurchases([]);
    };

  // ==================================================
  // PRINT PURCHASE
  // ==================================================

  const printPurchase =
    async (id) => {
      try {
        const res =
          await axios.get(
            `https://mudhikhana.onrender.com/purchases/${id}`
          );

        const purchase =
          res.data.purchase;

        const items =
          res.data.items || [];

        let html = `
          <html>
            <head>
              <title>Purchase Invoice</title>

              <style>
                @page {
                  size: A4 portrait;
                  margin: 15mm;
                }

                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  color: #111827;
                }

                h2 {
                  text-align: center;
                  margin-bottom: 20px;
                }

                .info {
                  margin-bottom: 15px;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }

                table,
                th,
                td {
                  border: 1px solid #333;
                }

                th,
                td {
                  padding: 8px;
                  text-align: center;
                }

                th {
                  background: #f1f5f9;
                }

                .total {
                  text-align: right;
                  margin-top: 20px;
                }
              </style>
            </head>

            <body>

              <h2>Purchase Invoice</h2>

              <div class="info">
                <p>
                  <b>Purchase No :</b>
                  ${purchase.purchaseNo || ""}
                </p>

                <p>
                  <b>Date :</b>
                  ${purchase.purchaseDate || ""}
                </p>

                <p>
                  <b>Supplier :</b>
                  ${purchase.supplierName || ""}
                </p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
        `;

        items.forEach(
          (item) => {
            html += `
              <tr>
                <td>
                  ${
                    item.productName ||
                    ""
                  }
                </td>

                <td>
                  ${Number(
                    item.qty || 0
                  )}
                </td>

                <td>
                  Rs. ${Number(
                    item.rate || 0
                  ).toFixed(2)}
                </td>

                <td>
                  Rs. ${Number(
                    item.total || 0
                  ).toFixed(2)}
                </td>
              </tr>
            `;
          }
        );

        html += `
                </tbody>
              </table>

              <div class="total">

                <p>
                  <b>
                    Sub Total :
                    Rs. ${Number(
                      purchase.total ||
                        0
                    ).toFixed(2)}
                  </b>
                </p>

                <p>
                  <b>
                    GST :
                    Rs. ${Number(
                      purchase.gst ||
                        0
                    ).toFixed(2)}
                  </b>
                </p>

                <p>
                  <b>
                    Grand Total :
                    Rs. ${Number(
                      purchase.grandTotal ||
                        0
                    ).toFixed(2)}
                  </b>
                </p>

              </div>

            </body>
          </html>
        `;

        const win =
          window.open(
            "",
            "",
            "width=900,height=700"
          );

        if (!win) {
          alert(
            "Please allow popups to print the purchase"
          );

          return;
        }

        win.document.write(
          html
        );

        win.document.close();

        win.focus();

        win.print();
      } catch (err) {
        console.log(err);

        alert(
          "Unable to Print Purchase"
        );
      }
    };

  // ==================================================
  // FILTERED PURCHASES
  // ==================================================

  const filteredPurchases =
    purchases.filter(
      (purchase) => {
        const searchText =
          search
            .trim()
            .toLowerCase();

        const matchesSearch =
          !searchText ||
          String(
            purchase.purchaseNo ||
              ""
          )
            .toLowerCase()
            .includes(searchText) ||
          String(
            purchase.supplierName ||
              ""
          )
            .toLowerCase()
            .includes(searchText);

        const matchesDate =
          !dateFilter ||
          String(
            purchase.purchaseDate ||
              ""
          ) === dateFilter;

        return (
          matchesSearch &&
          matchesDate
        );
      }
    );

  // ==================================================
  // TOTALS
  // ==================================================

  const totalPurchaseAmount =
    filteredPurchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.total || 0
        ),
      0
    );

  const totalGST =
    filteredPurchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.gst || 0
        ),
      0
    );

  const totalGrandAmount =
    filteredPurchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.grandTotal || 0
        ),
      0
    );

  // ==================================================
  // MONEY
  // ==================================================

  const money = (
    value
  ) =>
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
        minHeight:
          "100vh",
        background:
          "#f1f5f9",
        padding: 24,
        boxSizing:
          "border-box",
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          marginBottom: 22,
          gap: 15,
          flexWrap:
            "wrap",
        }}
      >
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background:
                "#2563eb",
              color:
                "white",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              fontSize: 23,
            }}
          >
            📥
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                color:
                  "#0f172a",
              }}
            >
              Purchase Register
            </h1>

            <p
              style={{
                margin:
                  "4px 0 0",
                color:
                  "#64748b",
                fontSize: 13,
              }}
            >
              View, manage and
              print purchase
              transactions
            </p>
          </div>
        </div>

        <div
          style={{
            display:
              "flex",
            gap: 9,
            flexWrap:
              "wrap",
          }}
        >
          <button
            onClick={
              loadPurchases
            }
            style={{
              ...secondaryButton,
            }}
          >
            🔄 Refresh
          </button>

          {!deleteMode ? (
            <button
              onClick={() =>
                setDeleteMode(
                  true
                )
              }
              style={{
                ...dangerButton,
              }}
            >
              🗑️ Delete
            </button>
          ) : (
            <>
              <button
                onClick={
                  deleteSelectedPurchases
                }
                disabled={
                  selectedPurchases.length ===
                  0
                }
                style={{
                  ...dangerButton,
                  background:
                    selectedPurchases.length >
                    0
                      ? "#dc2626"
                      : "#94a3b8",
                  cursor:
                    selectedPurchases.length >
                    0
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                🗑️ Delete Selected
                {selectedPurchases.length >
                  0 &&
                  ` (${selectedPurchases.length})`}
              </button>

              <button
                onClick={
                  cancelDeleteMode
                }
                style={{
                  ...secondaryButton,
                }}
              >
                Cancel
              </button>
            </>
          )}

          <button
            onClick={() =>
              setPage(
                "purchases"
              )
            }
            style={{
              ...primaryButton,
            }}
          >
            ＋ New Purchase
          </button>
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
            "repeat(4, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <SummaryCard
          icon="📄"
          title="Purchases"
          value={
            filteredPurchases.length
          }
          subtitle="Transactions"
        />

        <SummaryCard
          icon="🧾"
          title="Sub Total"
          value={`₹ ${money(
            totalPurchaseAmount
          )}`}
          subtitle="Before GST"
        />

        <SummaryCard
          icon="🧮"
          title="GST"
          value={`₹ ${money(
            totalGST
          )}`}
          subtitle="Total GST"
        />

        <SummaryCard
          icon="💰"
          title="Grand Total"
          value={`₹ ${money(
            totalGrandAmount
          )}`}
          subtitle="Purchase value"
        />
      </div>

      {/* ==================================================
          FILTER PANEL
      ================================================== */}

      <div
        style={{
          background:
            "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
          boxShadow:
            "0 2px 6px rgba(15,23,42,0.04)",
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
            marginBottom: 12,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                color:
                  "#0f172a",
              }}
            >
              🔎 Search & Filter
            </h3>

            <p
              style={{
                margin:
                  "3px 0 0",
                fontSize: 11,
                color:
                  "#64748b",
              }}
            >
              Search by purchase
              number or supplier
            </p>
          </div>

          {(search ||
            dateFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setDateFilter("");
              }}
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
                  600,
                fontSize:
                  12,
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "2fr 1fr",
            gap: 12,
          }}
        >
          <div
            style={{
              position:
                "relative",
            }}
          >
            <span
              style={{
                position:
                  "absolute",
                left: 12,
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
                color:
                  "#94a3b8",
              }}
            >
              🔎
            </span>

            <input
              type="text"
              placeholder="Search purchase no or supplier..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={{
                ...filterInput,
                paddingLeft: 38,
              }}
            />
          </div>

          <input
            type="date"
            value={
              dateFilter
            }
            onChange={(e) =>
              setDateFilter(
                e.target.value
              )
            }
            style={
              filterInput
            }
          />
        </div>
      </div>

      {/* ==================================================
          DELETE SELECT ALL
      ================================================== */}

      {deleteMode &&
        filteredPurchases.length >
          0 && (
          <div
            style={{
              background:
                "#fff7ed",
              border:
                "1px solid #fed7aa",
              borderRadius: 10,
              padding:
                "10px 14px",
              marginBottom:
                12,
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: 10,
            }}
          >
            <label
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: 8,
                cursor:
                  "pointer",
                fontSize: 13,
                fontWeight:
                  600,
                color:
                  "#9a3412",
              }}
            >
              <input
                type="checkbox"
                checked={
                  filteredPurchases.length >
                    0 &&
                  selectedPurchases.length ===
                    filteredPurchases.length
                }
                onChange={
                  toggleSelectAll
                }
              />

              Select All
            </label>

            <span
              style={{
                fontSize: 12,
                color:
                  "#9a3412",
              }}
            >
              {selectedPurchases.length}{" "}
              selected
            </span>
          </div>
        )}

      {/* ==================================================
          TABLE
      ================================================== */}

      <div
        style={{
          background:
            "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: 12,
          overflow:
            "hidden",
          boxShadow:
            "0 2px 6px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            padding:
              "16px 18px",
            borderBottom:
              "1px solid #e2e8f0",
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                color:
                  "#0f172a",
              }}
            >
              📋 Purchase Transactions
            </h2>

            <p
              style={{
                margin:
                  "4px 0 0",
                fontSize: 11,
                color:
                  "#64748b",
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
              textAlign:
                "center",
              color:
                "#64748b",
            }}
          >
            <div
              style={{
                fontSize: 30,
                marginBottom: 10,
              }}
            >
              📥
            </div>

            Loading Purchase
            Register...
          </div>
        ) : (
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
                  950,
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                    borderBottom:
                      "2px solid #e2e8f0",
                  }}
                >
                  {deleteMode && (
                    <th
                      style={{
                        ...thStyle,
                        width: 55,
                      }}
                    >
                      Select
                    </th>
                  )}

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
                        "left",
                    }}
                  >
                    Supplier
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Sub Total
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    GST
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Grand Total
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "center",
                      width: 190,
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPurchases.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={
                        deleteMode
                          ? 8
                          : 7
                      }
                      style={{
                        padding:
                          "55px 20px",
                        textAlign:
                          "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            40,
                          marginBottom:
                            10,
                        }}
                      >
                        📭
                      </div>

                      <div
                        style={{
                          fontWeight:
                            700,
                          color:
                            "#334155",
                          marginBottom:
                            5,
                        }}
                      >
                        No Purchases Found
                      </div>

                      <div
                        style={{
                          fontSize:
                            12,
                          color:
                            "#94a3b8",
                        }}
                      >
                        Try changing
                        your search or
                        date filter.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map(
                    (
                      purchase
                    ) => {
                      const selected =
                        selectedPurchases.includes(
                          purchase.id
                        );

                      return (
                        <tr
                          key={
                            purchase.id
                          }
                          style={{
                            background:
                              selected
                                ? "#fff1f2"
                                : "white",
                            borderBottom:
                              "1px solid #f1f5f9",
                          }}
                        >
                          {deleteMode && (
                            <td
                              style={{
                                textAlign:
                                  "center",
                                padding:
                                  "13px 8px",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  selected
                                }
                                onChange={() =>
                                  togglePurchaseSelection(
                                    purchase.id
                                  )
                                }
                              />
                            </td>
                          )}

                          <td
                            style={
                              tdStyle
                            }
                          >
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
                                borderRadius:
                                  6,
                                fontWeight:
                                  700,
                                fontSize:
                                  12,
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
                            <div
                              style={{
                                fontWeight:
                                  600,
                                color:
                                  "#334155",
                              }}
                            >
                              {
                                purchase.purchaseDate
                              }
                            </div>
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "left",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width:
                                    32,
                                  height:
                                    32,
                                  borderRadius:
                                    8,
                                  background:
                                    "#f1f5f9",
                                  display:
                                    "flex",
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
                                  fontWeight:
                                    600,
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
                                "#64748b",
                            }}
                          >
                            ₹{" "}
                            {money(
                              purchase.gst
                            )}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "right",
                            }}
                          >
                            <strong
                              style={{
                                color:
                                  "#0f172a",
                                fontSize:
                                  13,
                              }}
                            >
                              ₹{" "}
                              {money(
                                purchase.grandTotal
                              )}
                            </strong>
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "center",
                                gap: 6,
                              }}
                            >
                              <button
                                onClick={() => {
                                  setEditingPurchaseId(
                                    purchase.id
                                  );

                                  setPage(
                                    "purchases"
                                  );
                                }}
                                style={{
                                  ...actionButton,
                                  background:
                                    "#ecfdf5",
                                  color:
                                    "#15803d",
                                  borderColor:
                                    "#bbf7d0",
                                }}
                              >
                                ✏️ Edit
                              </button>

                              <button
                                onClick={() =>
                                  printPurchase(
                                    purchase.id
                                  )
                                }
                                style={{
                                  ...actionButton,
                                  background:
                                    "#eff6ff",
                                  color:
                                    "#2563eb",
                                  borderColor:
                                    "#bfdbfe",
                                }}
                              >
                                🖨️ Print
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>

              {filteredPurchases.length >
                0 && (
                <tfoot>
                  <tr
                    style={{
                      background:
                        "#f8fafc",
                      borderTop:
                        "2px solid #cbd5e1",
                    }}
                  >
                    <td
                      colSpan={
                        deleteMode
                          ? 4
                          : 3
                      }
                      style={{
                        padding:
                          "14px 12px",
                        fontWeight:
                          800,
                        textAlign:
                          "right",
                        color:
                          "#0f172a",
                      }}
                    >
                      TOTAL
                    </td>

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        textAlign:
                          "right",
                        fontWeight:
                          800,
                      }}
                    >
                      ₹{" "}
                      {money(
                        totalPurchaseAmount
                      )}
                    </td>

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        textAlign:
                          "right",
                        fontWeight:
                          800,
                      }}
                    >
                      ₹{" "}
                      {money(
                        totalGST
                      )}
                    </td>

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        textAlign:
                          "right",
                        fontWeight:
                          800,
                        color:
                          "#2563eb",
                      }}
                    >
                      ₹{" "}
                      {money(
                        totalGrandAmount
                      )}
                    </td>

                    <td />
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
          button:hover {
            filter: brightness(0.97);
          }

          input:focus {
            outline: none;
            border-color: #2563eb !important;
            box-shadow:
              0 0 0 3px rgba(37,99,235,0.10);
          }

          @media (max-width: 1000px) {
            .purchase-summary-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 700px) {
            .purchase-summary-grid {
              grid-template-columns:
                1fr !important;
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
        background:
          "white",
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
            width: 38,
            height: 38,
            borderRadius: 9,
            background:
              "#eff6ff",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            fontSize: 18,
          }}
        >
          {icon}
        </div>

        <span
          style={{
            fontSize: 10,
            color:
              "#94a3b8",
            fontWeight:
              700,
          }}
        >
          ●
        </span>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          color:
            "#64748b",
          fontWeight:
            600,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 19,
          fontWeight:
            800,
          color:
            "#0f172a",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 10,
          color:
            "#94a3b8",
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

const primaryButton = {
  padding:
    "10px 16px",
  background:
    "#2563eb",
  color:
    "white",
  border:
    "none",
  borderRadius: 8,
  cursor:
    "pointer",
  fontWeight:
    700,
};

const secondaryButton = {
  padding:
    "10px 16px",
  background:
    "white",
  color:
    "#334155",
  border:
    "1px solid #cbd5e1",
  borderRadius: 8,
  cursor:
    "pointer",
  fontWeight:
    600,
};

const dangerButton = {
  padding:
    "10px 16px",
  background:
    "#dc2626",
  color:
    "white",
  border:
    "none",
  borderRadius: 8,
  cursor:
    "pointer",
  fontWeight:
    700,
};

const filterInput = {
  width:
    "100%",
  height: 42,
  boxSizing:
    "border-box",
  padding:
    "0 12px",
  border:
    "1px solid #cbd5e1",
  borderRadius: 8,
  background:
    "white",
  color:
    "#0f172a",
  fontSize: 13,
};

const thStyle = {
  padding:
    "12px 10px",
  textAlign:
    "center",
  fontSize: 11,
  fontWeight:
    700,
  color:
    "#475569",
  whiteSpace:
    "nowrap",
};

const tdStyle = {
  padding:
    "12px 10px",
  fontSize: 12,
  color:
    "#475569",
  whiteSpace:
    "nowrap",
};

const actionButton = {
  padding:
    "7px 10px",
  border:
    "1px solid",
  borderRadius: 7,
  cursor:
    "pointer",
  fontSize: 11,
  fontWeight:
    700,
};