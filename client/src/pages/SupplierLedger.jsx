import { useEffect, useState } from "react";
import axios from "axios";

export default function SupplierLedger() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] =
    useState("");

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatement, setLoadingStatement] =
    useState(false);

  // ==========================================
  // LOAD SUPPLIERS
  // ==========================================

  const loadSuppliers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://mudhikhana.onrender.com/suppliers"
      );

      setSuppliers(res.data || []);
    } catch (err) {
      console.log(
        "Supplier Load Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load suppliers"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD SUPPLIER STATEMENT
  // ==========================================

  const loadStatement = async (
    supplierName
  ) => {
    if (!supplierName) {
      setPurchases([]);
      return;
    }

    try {
      setLoadingStatement(true);

      const res = await axios.get(
        "https://mudhikhana.onrender.com/accounts/outstanding"
      );

      const payables =
        res.data?.payables || [];

      const supplierPurchases =
        payables.filter(
          (item) =>
            String(
              item.supplierName || ""
            ).toLowerCase() ===
            String(
              supplierName
            ).toLowerCase()
        );

      setPurchases(
        supplierPurchases
      );
    } catch (err) {
      console.log(
        "Supplier Statement Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load supplier statement"
      );
    } finally {
      setLoadingStatement(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // ==========================================
  // CUSTOMER CHANGE
  // ==========================================

  const handleSupplierChange = (
    event
  ) => {
    const name =
      event.target.value;

    setSelectedSupplier(name);

    loadStatement(name);
  };

  // ==========================================
  // MONEY FORMAT
  // ==========================================

  const money = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  // ==========================================
  // TOTALS
  // ==========================================

  const totalPurchases =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        (Number(
          purchase.total
        ) || 0),
      0
    );

  const totalPaid =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        (Number(
          purchase.paid
        ) || 0),
      0
    );

  const totalOutstanding =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        (Number(
          purchase.outstanding
        ) || 0),
      0
    );

  return (
    <div
      style={{
        padding: 24,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* ========================================
          HEADER
      ======================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 24,
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
              color: "#0f172a",
            }}
          >
            📜 Supplier Ledger
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Supplier-wise purchases and
            outstanding statement
          </p>
        </div>

        <button
          onClick={() =>
            loadStatement(
              selectedSupplier
            )
          }
          disabled={
            !selectedSupplier ||
            loadingStatement
          }
          style={{
            padding: "9px 15px",
            background: "white",
            border:
              "1px solid #cbd5e1",
            borderRadius: 8,
            cursor:
              selectedSupplier
                ? "pointer"
                : "not-allowed",
            fontWeight: 600,
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ========================================
          SUPPLIER SELECT
      ======================================== */}

      <div
        style={{
          background: "white",
          padding: 18,
          borderRadius: 10,
          border:
            "1px solid #e2e8f0",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontSize: 13,
            fontWeight: "bold",
            color: "#334155",
          }}
        >
          Select Supplier
        </label>

        <select
          value={selectedSupplier}
          onChange={
            handleSupplierChange
          }
          style={{
            width: "100%",
            maxWidth: 450,
            padding: "10px 12px",
            border:
              "1px solid #cbd5e1",
            borderRadius: 8,
            background: "white",
            fontSize: 14,
          }}
        >
          <option value="">
            -- Select Supplier --
          </option>

          {suppliers.map(
            (supplier) => {
              const id =
                supplier.id;

              const name =
                supplier.name ||
                supplier.supplierName ||
                `Supplier ${id}`;

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

      {/* ========================================
          LOADING
      ======================================== */}

      {loading && (
        <div
          style={{
            marginTop: 20,
            padding: 30,
            background: "white",
            borderRadius: 10,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Loading suppliers...
        </div>
      )}

      {/* ========================================
          NO SUPPLIER
      ======================================== */}

      {!loading &&
        !selectedSupplier && (
          <div
            style={{
              marginTop: 20,
              padding: 40,
              background: "white",
              borderRadius: 10,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: 40,
              }}
            >
              🚚
            </div>

            <h3>
              Select a supplier
            </h3>

            <p>
              Choose a supplier above
              to view their statement.
            </p>
          </div>
        )}

      {/* ========================================
          SUPPLIER SUMMARY
      ======================================== */}

      {selectedSupplier &&
        !loadingStatement && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: 16,
                marginTop: 20,
              }}
            >
              {/* PURCHASES */}

              <div
                style={{
                  background: "white",
                  padding: 18,
                  borderRadius: 10,
                  borderLeft:
                    "5px solid #2563eb",
                }}
              >
                <div
                  style={{
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  📥 Total Purchases
                </div>

                <h2
                  style={{
                    margin: "5px 0",
                    color: "#2563eb",
                  }}
                >
                  ₹{" "}
                  {money(
                    totalPurchases
                  )}
                </h2>
              </div>

              {/* PAID */}

              <div
                style={{
                  background: "white",
                  padding: 18,
                  borderRadius: 10,
                  borderLeft:
                    "5px solid #16a34a",
                }}
              >
                <div
                  style={{
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  🟢 Total Paid
                </div>

                <h2
                  style={{
                    margin: "5px 0",
                    color: "#15803d",
                  }}
                >
                  ₹{" "}
                  {money(
                    totalPaid
                  )}
                </h2>
              </div>

              {/* OUTSTANDING */}

              <div
                style={{
                  background: "white",
                  padding: 18,
                  borderRadius: 10,
                  borderLeft:
                    "5px solid #dc2626",
                }}
              >
                <div
                  style={{
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  🔴 Outstanding
                </div>

                <h2
                  style={{
                    margin: "5px 0",
                    color: "#dc2626",
                  }}
                >
                  ₹{" "}
                  {money(
                    totalOutstanding
                  )}
                </h2>
              </div>
            </div>

            {/* ==================================
                STATEMENT TABLE
            ================================== */}

            <div
              style={{
                marginTop: 20,
                background: "white",
                borderRadius: 10,
                border:
                  "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 18,
                  borderBottom:
                    "1px solid #e2e8f0",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                  }}
                >
                  📋 Statement:{" "}
                  {selectedSupplier}
                </h3>
              </div>

              {purchases.length ===
              0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No outstanding
                  purchases found for
                  this supplier.
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
                          Purchase No
                        </th>

                        <th
                          style={{
                            ...thStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          Debit
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
                          Balance
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {purchases.map(
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
                              {
                                purchase.date
                              }
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <b>
                                {
                                  purchase.purchaseNo
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
                                fontWeight:
                                  "bold",
                                color:
                                  "#dc2626",
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
                          fontWeight:
                            "bold",
                        }}
                      >
                        <td
                          colSpan="2"
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          TOTAL
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
                            totalPurchases
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
                            totalPaid
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                            color:
                              "#dc2626",
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
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
}

const thStyle = {
  padding: "12px",
  background: "#f1f5f9",
  borderBottom:
    "1px solid #e2e8f0",
  textAlign: "left",
  fontSize: 12,
  color: "#475569",
};

const tdStyle = {
  padding: "11px 12px",
  borderBottom:
    "1px solid #f1f5f9",
  fontSize: 12,
};