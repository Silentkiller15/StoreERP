import { useEffect, useState } from "react";
import axios from "axios";

export default function StockLedger() {
  const [products, setProducts] = useState([]);
  const [ledger, setLedger] = useState([]);

  const [productId, setProductId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [creatingOpening, setCreatingOpening] =
    useState(false);

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  useEffect(() => {
    loadProducts();
    loadLedger();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/products"
      );

      setProducts(res.data);
    } catch (err) {
      console.log("Products Error:", err);

      alert("Unable to load products");
    }
  };

  // ==========================================
  // LOAD STOCK LEDGER
  // ==========================================

  const loadLedger = async () => {
    try {
      setLoading(true);

      const params = {};

      if (productId) {
        params.productId = productId;
      }

      if (fromDate) {
        params.fromDate = fromDate;
      }

      if (toDate) {
        params.toDate = toDate;
      }

      const res = await axios.get(
        "http://localhost:5000/products/stock-ledger",
        {
          params,
        }
      );

      console.log("Stock Ledger:", res.data);

      if (Array.isArray(res.data)) {
        setLedger(res.data);
      } else {
        setLedger(res.data.data || []);
      }
    } catch (err) {
      console.log(
        "Stock Ledger Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load stock ledger"
      );

      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE OPENING STOCK
  // ==========================================

  const createOpeningStock = async () => {
    const confirmed = window.confirm(
      "Create Opening Stock from the current stock quantities of all products?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCreatingOpening(true);

      const res = await axios.post(
        "http://localhost:5000/products/create-opening-stock",
        {
          date:
            new Date()
              .toISOString()
              .split("T")[0],
        }
      );

      console.log(
        "Opening Stock Response:",
        res.data
      );

      alert(
        res.data.message ||
          "Opening Stock Created Successfully"
      );

      // Refresh ledger
      await loadLedger();
    } catch (err) {
      console.log(
        "Opening Stock Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to create opening stock"
      );
    } finally {
      setCreatingOpening(false);
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = () => {
    loadLedger();
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setProductId("");
    setFromDate("");
    setToDate("");

    // Load all records after clearing
    setTimeout(() => {
      loadLedger();
    }, 0);
  };

  // ==========================================
  // TOTAL STOCK IN
  // ==========================================

  const totalIn = ledger.reduce(
    (sum, item) =>
      sum + Number(item.qtyIn || 0),
    0
  );

  // ==========================================
  // TOTAL STOCK OUT
  // ==========================================

  const totalOut = ledger.reduce(
    (sum, item) =>
      sum + Number(item.qtyOut || 0),
    0
  );

  // ==========================================
  // LAST BALANCE
  // ==========================================

  const closingBalance =
    ledger.length > 0
      ? Number(
          ledger[ledger.length - 1]
            .balance || 0
        )
      : 0;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      style={{
        padding: 20,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 15,
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            margin: 0,
          }}
        >
          📊 Stock Ledger
        </h2>

        <button
          type="button"
          onClick={createOpeningStock}
          disabled={creatingOpening}
          style={{
            padding: "10px 18px",
            background: creatingOpening
              ? "#9ca3af"
              : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: creatingOpening
              ? "not-allowed"
              : "pointer",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          {creatingOpening
            ? "Creating..."
            : "📦 Create Opening Stock"}
        </button>
      </div>

      {/* ======================================
          FILTER BOX
      ====================================== */}

      <div
        style={{
          display: "flex",
          gap: 15,
          flexWrap: "wrap",
          alignItems: "end",
          background: "white",
          padding: 20,
          borderRadius: 8,
          boxShadow:
            "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        {/* PRODUCT */}

        <div>
          <label>
            <b>Product</b>
          </label>

          <br />

          <select
            value={productId}
            onChange={(e) =>
              setProductId(e.target.value)
            }
            style={{
              padding: 8,
              minWidth: 220,
              border:
                "1px solid #d1d5db",
              borderRadius: 4,
            }}
          >
            <option value="">
              All Products
            </option>

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* FROM DATE */}

        <div>
          <label>
            <b>From Date</b>
          </label>

          <br />

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(e.target.value)
            }
            style={{
              padding: 8,
              border:
                "1px solid #d1d5db",
              borderRadius: 4,
            }}
          />
        </div>

        {/* TO DATE */}

        <div>
          <label>
            <b>To Date</b>
          </label>

          <br />

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(e.target.value)
            }
            style={{
              padding: 8,
              border:
                "1px solid #d1d5db",
              borderRadius: 4,
            }}
          />
        </div>

        {/* SEARCH */}

        <button
          type="button"
          onClick={handleSearch}
          style={{
            padding: "9px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          🔎 Search
        </button>

        {/* CLEAR */}

        <button
          type="button"
          onClick={clearFilters}
          style={{
            padding: "9px 18px",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div
        style={{
          display: "flex",
          gap: 15,
          flexWrap: "wrap",
          marginTop: 20,
        }}
      >
        {/* TOTAL IN */}

        <div
          style={{
            background: "white",
            padding: 18,
            borderRadius: 8,
            minWidth: 190,
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              color: "#64748b",
              marginBottom: 5,
            }}
          >
            Total Stock In
          </div>

          <strong
            style={{
              fontSize: 24,
            }}
          >
            {totalIn.toFixed(2)}
          </strong>
        </div>

        {/* TOTAL OUT */}

        <div
          style={{
            background: "white",
            padding: 18,
            borderRadius: 8,
            minWidth: 190,
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              color: "#64748b",
              marginBottom: 5,
            }}
          >
            Total Stock Out
          </div>

          <strong
            style={{
              fontSize: 24,
            }}
          >
            {totalOut.toFixed(2)}
          </strong>
        </div>

        {/* CLOSING BALANCE */}

        <div
          style={{
            background: "white",
            padding: 18,
            borderRadius: 8,
            minWidth: 190,
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              color: "#64748b",
              marginBottom: 5,
            }}
          >
            Closing Balance
          </div>

          <strong
            style={{
              fontSize: 24,
            }}
          >
            {closingBalance.toFixed(2)}
          </strong>
        </div>
      </div>

      {/* ======================================
          LEDGER TABLE
      ====================================== */}

      <div
        style={{
          background: "white",
          marginTop: 20,
          borderRadius: 8,
          overflowX: "auto",
          boxShadow:
            "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <table
          border="1"
          cellPadding="8"
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            minWidth: 950,
          }}
        >
          <thead>
            <tr
              style={{
                background: "#e2e8f0",
              }}
            >
              <th>Sl</th>
              <th>Date</th>
              <th>Voucher No</th>
              <th>Type</th>
              <th>Product</th>
              <th>Stock In</th>
              <th>Stock Out</th>
              <th>Balance</th>
              <th>Remarks</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign:
                      "center",
                    padding: 30,
                  }}
                >
                  Loading Stock Ledger...
                </td>
              </tr>
            ) : ledger.length ===
              0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign:
                      "center",
                    padding: 30,
                    color: "#64748b",
                  }}
                >
                  No Stock Movements
                  Found
                </td>
              </tr>
            ) : (
              ledger.map(
                (item, index) => (
                  <tr
                    key={
                      item.id ||
                      index
                    }
                  >
                    {/* SL */}

                    <td
                      style={{
                        textAlign:
                          "center",
                      }}
                    >
                      {index + 1}
                    </td>

                    {/* DATE */}

                    <td>
                      {
                        item.movementDate
                      }
                    </td>

                    {/* VOUCHER */}

                    <td>
                      {item.voucherNo ||
                        "-"}
                    </td>

                    {/* TYPE */}

                    <td>
                      {item.voucherType ||
                        "-"}
                    </td>

                    {/* PRODUCT */}

                    <td>
                      <b>
                        {item.productName ||
                          "-"}
                      </b>

                      {item.productCode && (
                        <div
                          style={{
                            fontSize: 12,
                            color:
                              "#64748b",
                            marginTop: 2,
                          }}
                        >
                          {
                            item.productCode
                          }
                        </div>
                      )}
                    </td>

                    {/* STOCK IN */}

                    <td
                      style={{
                        textAlign:
                          "right",
                        color:
                          Number(
                            item.qtyIn ||
                              0
                          ) > 0
                            ? "#16a34a"
                            : "#111827",
                        fontWeight:
                          Number(
                            item.qtyIn ||
                              0
                          ) > 0
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {Number(
                        item.qtyIn ||
                          0
                      ).toFixed(2)}
                    </td>

                    {/* STOCK OUT */}

                    <td
                      style={{
                        textAlign:
                          "right",
                        color:
                          Number(
                            item.qtyOut ||
                              0
                          ) > 0
                            ? "#dc2626"
                            : "#111827",
                        fontWeight:
                          Number(
                            item.qtyOut ||
                              0
                          ) > 0
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {Number(
                        item.qtyOut ||
                          0
                      ).toFixed(2)}
                    </td>

                    {/* BALANCE */}

                    <td
                      style={{
                        textAlign:
                          "right",
                        fontWeight:
                          "bold",
                      }}
                    >
                      {Number(
                        item.balance ||
                          0
                      ).toFixed(2)}
                    </td>

                    {/* REMARKS */}

                    <td>
                      {item.remarks ||
                        "-"}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}