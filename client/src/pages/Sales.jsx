import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function Sales({
  editingSaleId,
  setEditingSaleId,
}) {
  // ==================================================
  // MASTER DATA
  // ==================================================

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // ==================================================
  // SALE HEADER
  // ==================================================

  const [saleNo, setSaleNo] = useState(
    "SO" + Math.floor(Math.random() * 100000)
  );

  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [customerId, setCustomerId] = useState("");

  const [paymentMode, setPaymentMode] =
    useState("Cash");

  // ==================================================
  // UI STATE
  // ==================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // SALE ITEMS
  // ==================================================

  const createEmptyItem = () => ({
    productId: "",
    productName: "",
    qty: "",
    rate: 0,
    total: 0,
  });

  const [items, setItems] = useState(
    Array.from(
      { length: 10 },
      () => createEmptyItem()
    )
  );

  // ==================================================
  // LOAD MASTER DATA
  // ==================================================

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, []);

  // ==================================================
  // LOAD EDIT SALE
  // ==================================================

  useEffect(() => {
    if (editingSaleId) {
      loadSale(editingSaleId);
    }
  }, [editingSaleId, products.length]);

  // ==================================================
  // LOAD CUSTOMERS
  // ==================================================

  const loadCustomers = async () => {
    try {
      const res = await axios.get(
        "https://mudhikhana.onrender.com/customers"
      );

      setCustomers(res.data || []);
    } catch (err) {
      console.log(
        "Load Customers Error:",
        err
      );
    }
  };

  // ==================================================
  // LOAD PRODUCTS
  // ==================================================

  const loadProducts = async () => {
    try {
      const res = await axios.get(
        "https://mudhikhana.onrender.com/products"
      );

      setProducts(res.data || []);
    } catch (err) {
      console.log(
        "Load Products Error:",
        err
      );
    }
  };

  // ==================================================
  // LOAD SALE FOR EDIT
  // ==================================================

  const loadSale = async (id) => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `https://mudhikhana.onrender.com/sales/${id}`
      );

      const sale = res.data;

      setSaleNo(
        sale.saleNo ||
          "SO" +
            Math.floor(
              Math.random() * 100000
            )
      );

      setSaleDate(
        sale.saleDate ||
          new Date()
            .toISOString()
            .split("T")[0]
      );

      setCustomerId(
        sale.customerId || ""
      );

      setPaymentMode(
        sale.paymentMode || "Cash"
      );

      const loadedItems = (
        sale.items || []
      ).map((item) => {
        const product =
          products.find(
            (p) =>
              String(p.id) ===
              String(item.productId)
          );

        const qty =
          Number(item.qty) || 0;

        const rate =
          Number(item.rate) || 0;

        return {
          productId:
            item.productId,

          productName:
            product?.name ||
            item.productName ||
            "",

          qty,

          rate,

          total:
            qty * rate,
        };
      });

      while (
        loadedItems.length < 10
      ) {
        loadedItems.push(
          createEmptyItem()
        );
      }

      setItems(loadedItems);
    } catch (err) {
      console.log(
        "Load Sale Error:",
        err
      );

      setError(
        "Unable to load sale"
      );

      alert(
        "Unable to load sale"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // PRODUCT SELECTION
  // ==================================================

  const selectProduct = (
    index,
    productName
  ) => {
    setItems((prevItems) => {
      const data = [...prevItems];

      const product =
        products.find(
          (p) =>
            String(p.name)
              .toLowerCase() ===
            String(productName)
              .trim()
              .toLowerCase()
        );

      const current = {
        ...data[index],
        productName,
      };

      if (product) {
        current.productId =
          product.id;

        current.productName =
          product.name;

        current.rate =
          Number(
            product.selling
          ) || 0;
      } else {
        current.productId = "";
        current.rate = 0;
      }

      current.total =
        (Number(current.qty) || 0) *
        (Number(current.rate) || 0);

      data[index] = current;

      // Automatically add a new row
      // when the final row is used.
      if (
        index ===
          data.length - 1 &&
        product
      ) {
        data.push(
          createEmptyItem()
        );
      }

      return data;
    });
  };

  // ==================================================
  // UPDATE ITEM
  // ==================================================

  const updateItem = (
    index,
    field,
    value
  ) => {
    setItems((prevItems) => {
      const data = [...prevItems];

      const item = {
        ...data[index],
        [field]: value,
      };

      item.total =
        (Number(item.qty) || 0) *
        (Number(item.rate) || 0);

      data[index] = item;

      return data;
    });
  };

  // ==================================================
  // REMOVE ITEM
  // ==================================================

  const removeItem = (index) => {
    setItems((prevItems) => {
      const data = [...prevItems];

      data.splice(index, 1);

      if (data.length === 0) {
        data.push(
          createEmptyItem()
        );
      }

      return data;
    });
  };

  // ==================================================
  // VALID ITEMS
  // ==================================================

  const validItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.productId &&
          Number(item.qty) > 0
      ),
    [items]
  );

  // ==================================================
  // TOTAL
  // NO GST
  // ==================================================

  const grandTotal = useMemo(
    () =>
      validItems.reduce(
        (sum, item) =>
          sum +
          Number(
            item.total || 0
          ),
        0
      ),
    [validItems]
  );

  const subTotal = grandTotal;

  // ==================================================
  // CUSTOMER
  // ==================================================

  const selectedCustomer =
    customers.find(
      (customer) =>
        String(customer.id) ===
        String(customerId)
    );

  const customerName =
    selectedCustomer?.name ||
    "Select Customer";

  // ==================================================
  // SAVE SALE
  // ==================================================

  const saveSale = async () => {
    setError("");

    if (!saleNo.trim()) {
      alert(
        "Please enter Sale Number"
      );
      return;
    }

    if (!customerId) {
      alert(
        "Please select customer"
      );
      return;
    }

    if (
      validItems.length === 0
    ) {
      alert(
        "Please enter at least one product"
      );
      return;
    }

    if (!paymentMode) {
      alert(
        "Please select payment mode"
      );
      return;
    }

    try {
      setLoading(true);

      // ------------------------------------------
      // PREPARE ITEMS
      // NO GST
      // ------------------------------------------

      const dataToSave =
        validItems.map(
          (item) => ({
            productId:
              item.productId,

            qty:
              Number(item.qty),

            rate:
              Number(item.rate),

            total:
              Number(item.total),
          })
        );

      // ------------------------------------------
      // COMMON DATA
      // ------------------------------------------

      const saleData = {
        saleNo,
        customerId,
        paymentMode,
        saleDate,

        total:
          subTotal,

        grandTotal:
          grandTotal,

        // Kept as zero because the
        // database may still have a GST
        // column. GST is NOT used.
        gst: 0,

        items:
          dataToSave,
      };

      // ------------------------------------------
      // UPDATE
      // ------------------------------------------

      if (editingSaleId) {
        await axios.put(
          `https://mudhikhana.onrender.com/sales/${editingSaleId}`,
          saleData
        );

        alert(
          "Sale Updated Successfully"
        );

        setEditingSaleId(null);
      }

      // ------------------------------------------
      // NEW SALE
      // ------------------------------------------

      else {
        await axios.post(
          "https://mudhikhana.onrender.com/sales",
          saleData
        );

        alert(
          "Sale Saved Successfully"
        );
      }

      window.location.reload();

    } catch (err) {
      console.log(
        "Save Sale Error:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Error Saving Sale";

      setError(message);

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // CANCEL EDIT
  // ==================================================

  const cancelEdit = () => {
    setEditingSaleId(null);
    window.location.reload();
  };

  // ==================================================
  // STYLES
  // ==================================================

  const pageStyle = {
    minHeight: "100vh",
    padding: "24px",
    background: "#f1f5f9",
    boxSizing: "border-box",
  };

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
    padding: "10px 12px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "7px",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    background: "#ffffff",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div style={pageStyle}>

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: "20px 24px",
          marginBottom: "18px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>

          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "700",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
              marginBottom: "5px",
            }}
          >
            Sales
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "26px",
              color: "#0f172a",
            }}
          >
            {editingSaleId
              ? "✏️ Edit Sale"
              : "🧾 Sales Entry"}
          </h2>

          <div
            style={{
              marginTop: "5px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Create and manage
            customer sales
          </div>

        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >

          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "700",
              textTransform:
                "uppercase",
              marginBottom: "5px",
            }}
          >
            Invoice
          </div>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "#2563eb",
            }}
          >
            {saleNo}
          </div>

        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 15px",
            borderRadius: "8px",
            background: "#fef2f2",
            border:
              "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ==================================================
          SALE INFORMATION
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: "20px",
          marginBottom: "18px",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "18px",
          }}
        >

          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            📋
          </div>

          <div>

            <div
              style={{
                fontWeight: "800",
                color: "#0f172a",
              }}
            >
              Sale Information
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Enter invoice and
              customer details
            </div>

          </div>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr 2fr 1.2fr",
            gap: "16px",
          }}
        >

          {/* SALE NUMBER */}

          <div>

            <label
              style={labelStyle}
            >
              Sale No
            </label>

            <input
              value={saleNo}
              onChange={(e) =>
                setSaleNo(
                  e.target.value
                )
              }
              style={{
                ...inputStyle,
                fontWeight: "700",
                color: "#2563eb",
              }}
              placeholder="Sale Number"
            />

          </div>

          {/* DATE */}

          <div>

            <label
              style={labelStyle}
            >
              Sale Date
            </label>

            <input
              type="date"
              value={saleDate}
              onChange={(e) =>
                setSaleDate(
                  e.target.value
                )
              }
              style={inputStyle}
            />

          </div>

          {/* CUSTOMER */}

          <div>

            <label
              style={labelStyle}
            >
              Customer
            </label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(
                  e.target.value
                )
              }
              style={inputStyle}
            >

              <option value="">
                Select Customer
              </option>

              {customers.map(
                (customer) => (
                  <option
                    key={
                      customer.id
                    }
                    value={
                      customer.id
                    }
                  >
                    {customer.name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* PAYMENT MODE */}

          <div>

            <label
              style={labelStyle}
            >
              Payment Mode
            </label>

            <select
              value={paymentMode}
              onChange={(e) =>
                setPaymentMode(
                  e.target.value
                )
              }
              style={inputStyle}
            >

              <option value="Cash">
                💵 Cash
              </option>

              <option value="Credit">
                🧾 Credit / Customer
              </option>

            </select>

          </div>

        </div>

        {/* PAYMENT INFORMATION */}

        <div
          style={{
            marginTop: "18px",
            padding: "12px 15px",
            borderRadius: "8px",

            background:
              paymentMode ===
              "Cash"
                ? "#f0fdf4"
                : "#eff6ff",

            border:
              paymentMode ===
              "Cash"
                ? "1px solid #bbf7d0"
                : "1px solid #bfdbfe",

            color:
              paymentMode ===
              "Cash"
                ? "#166534"
                : "#1d4ed8",

            fontSize: "13px",
          }}
        >

          {paymentMode ===
          "Cash" ? (
            <>
              💵{" "}
              <b>Cash Sale</b>
              {" — "}
              Cash will be debited
              automatically.
            </>
          ) : (
            <>
              🧾{" "}
              <b>Credit Sale</b>
              {" — "}
              Customer account
              will be debited
              automatically.
            </>
          )}

        </div>

      </div>

      {/* ==================================================
          PRODUCTS
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow: "hidden",
          marginBottom: "18px",
        }}
      >

        {/* HEADER */}

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
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >

            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background:
                  "#dcfce7",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              🛒
            </div>

            <div>

              <div
                style={{
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Sale Items
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Add products,
                quantity and
                selling rate
              </div>

            </div>

          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            {validItems.length} item
            {validItems.length ===
            1
              ? ""
              : "s"}
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
                  background:
                    "#f8fafc",
                }}
              >

                <th
                  style={{
                    width: "55px",
                    padding: "12px",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#475569",
                    fontSize: "12px",
                  }}
                >
                  #
                </th>

                <th
                  style={{
                    padding: "12px",
                    textAlign:
                      "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#475569",
                    fontSize: "12px",
                  }}
                >
                  PRODUCT
                </th>

                <th
                  style={{
                    width: "110px",
                    padding: "12px",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#475569",
                    fontSize: "12px",
                  }}
                >
                  QTY
                </th>

                <th
                  style={{
                    width: "140px",
                    padding: "12px",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#475569",
                    fontSize: "12px",
                  }}
                >
                  RATE
                </th>

                <th
                  style={{
                    width: "150px",
                    padding: "12px",
                    textAlign:
                      "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#475569",
                    fontSize: "12px",
                  }}
                >
                  AMOUNT
                </th>

                <th
                  style={{
                    width: "80px",
                    padding: "12px",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color: "#475569",
                    fontSize: "12px",
                  }}
                >
                  ACTION
                </th>

              </tr>

            </thead>

            <tbody>

              {items.map(
                (item, index) => (
                  <tr
                    key={index}
                    style={{
                      background:
                        item.productId
                          ? "#ffffff"
                          : "#fafafa",
                    }}
                  >

                    {/* NUMBER */}

                    <td
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "10px",
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

                    {/* PRODUCT */}

                    <td
                      style={{
                        padding:
                          "8px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >

                      <input
                        list={`sales-products-${index}`}
                        value={
                          item.productName
                        }
                        onChange={(e) =>
                          selectProduct(
                            index,
                            e.target.value
                          )
                        }
                        placeholder="Search or type product..."
                        style={{
                          ...inputStyle,
                          padding:
                            "9px 10px",
                        }}
                      />

                      <datalist
                        id={`sales-products-${index}`}
                      >

                        {products.map(
                          (product) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.name
                              }
                            />
                          )
                        )}

                      </datalist>

                    </td>

                    {/* QUANTITY */}

                    <td
                      style={{
                        padding:
                          "8px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >

                      <input
                        type="number"
                        min="0"
                        value={
                          item.qty
                        }
                        onChange={(e) =>
                          updateItem(
                            index,
                            "qty",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        style={{
                          ...inputStyle,
                          textAlign:
                            "right",
                        }}
                      />

                    </td>

                    {/* RATE */}

                    <td
                      style={{
                        padding:
                          "8px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >

                      <input
                        type="number"
                        min="0"
                        value={
                          item.rate
                        }
                        onChange={(e) =>
                          updateItem(
                            index,
                            "rate",
                            e.target.value
                          )
                        }
                        style={{
                          ...inputStyle,
                          textAlign:
                            "right",
                        }}
                      />

                    </td>

                    {/* AMOUNT */}

                    <td
                      style={{
                        padding:
                          "8px 12px",
                        textAlign:
                          "right",
                        borderBottom:
                          "1px solid #f1f5f9",
                        fontWeight:
                          "800",
                        color:
                          item.total > 0
                            ? "#0f172a"
                            : "#94a3b8",
                      }}
                    >
                      ₹{" "}
                      {Number(
                        item.total || 0
                      ).toFixed(2)}
                    </td>

                    {/* DELETE */}

                    <td
                      style={{
                        padding:
                          "8px",
                        textAlign:
                          "center",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            index
                          )
                        }
                        title="Remove row"
                        style={{
                          width: "32px",
                          height: "32px",
                          border: "none",
                          borderRadius:
                            "7px",
                          background:
                            "#fee2e2",
                          color:
                            "#dc2626",
                          cursor:
                            "pointer",
                          fontSize:
                            "15px",
                          fontWeight:
                            "700",
                        }}
                      >
                        ×
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ==================================================
          BOTTOM SECTION
      ================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 380px",
          gap: "18px",
          alignItems: "start",
        }}
      >

        {/* ==================================================
            ACCOUNTING PREVIEW
        ================================================== */}

        <div
          style={{
            ...cardStyle,
            padding: "20px",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom:
                "18px",
            }}
          >

            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background:
                  "#fef3c7",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              📒
            </div>

            <div>

              <div
                style={{
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Accounting Preview
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Expected accounting
                effect of this sale
              </div>

            </div>

          </div>

          <div
            style={{
              border:
                "1px solid #e2e8f0",
              borderRadius: "9px",
              overflow: "hidden",
            }}
          >

            {/* DEBIT */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                padding:
                  "13px 15px",
                background:
                  "#f8fafc",
                borderBottom:
                  "1px solid #e2e8f0",
              }}
            >

              <div>

                <span
                  style={{
                    display:
                      "inline-block",
                    padding:
                      "3px 7px",
                    marginRight:
                      "8px",
                    borderRadius:
                      "5px",
                    background:
                      "#dbeafe",
                    color:
                      "#1d4ed8",
                    fontSize:
                      "10px",
                    fontWeight:
                      "800",
                  }}
                >
                  DEBIT
                </span>

                {paymentMode ===
                "Cash"
                  ? "Cash"
                  : customerName}

              </div>

              <b>
                ₹{" "}
                {grandTotal.toFixed(
                  2
                )}
              </b>

            </div>

            {/* SALES CREDIT */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                padding:
                  "13px 15px",
              }}
            >

              <div>

                <span
                  style={{
                    display:
                      "inline-block",
                    padding:
                      "3px 7px",
                    marginRight:
                      "8px",
                    borderRadius:
                      "5px",
                    background:
                      "#dcfce7",
                    color:
                      "#15803d",
                    fontSize:
                      "10px",
                    fontWeight:
                      "800",
                  }}
                >
                  CREDIT
                </span>

                Sales

              </div>

              <b>
                ₹{" "}
                {grandTotal.toFixed(
                  2
                )}
              </b>

            </div>

          </div>

        </div>

        {/* ==================================================
            TOTAL SUMMARY
        ================================================== */}

        <div
          style={{
            ...cardStyle,
            overflow: "hidden",
          }}
        >

          <div
            style={{
              padding:
                "16px 20px",
              background:
                "#0f172a",
              color: "white",
              fontWeight:
                "800",
              fontSize: "15px",
            }}
          >
            💰 Invoice Summary
          </div>

          <div
            style={{
              padding: "20px",
            }}
          >

            {/* SUB TOTAL */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                paddingBottom:
                  "12px",
                color: "#475569",
                fontSize: "14px",
              }}
            >

              <span>
                Sub Total
              </span>

              <b
                style={{
                  color:
                    "#0f172a",
                }}
              >
                ₹{" "}
                {subTotal.toFixed(
                  2
                )}
              </b>

            </div>

            <div
              style={{
                borderTop:
                  "1px dashed #cbd5e1",
                marginBottom:
                  "14px",
              }}
            />

            {/* GRAND TOTAL */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "18px",
              }}
            >

              <div>

                <div
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#64748b",
                    textTransform:
                      "uppercase",
                    fontWeight:
                      "700",
                  }}
                >
                  Grand Total
                </div>

                <div
                  style={{
                    fontSize:
                      "26px",
                    fontWeight:
                      "900",
                    color:
                      "#2563eb",
                    marginTop:
                      "3px",
                  }}
                >
                  ₹{" "}
                  {grandTotal.toFixed(
                    2
                  )}
                </div>

              </div>

            </div>

            {/* PAYMENT BADGE */}

            <div
              style={{
                padding:
                  "10px 12px",
                borderRadius:
                  "7px",

                background:
                  paymentMode ===
                  "Cash"
                    ? "#f0fdf4"
                    : "#eff6ff",

                border:
                  paymentMode ===
                  "Cash"
                    ? "1px solid #bbf7d0"
                    : "1px solid #bfdbfe",

                color:
                  paymentMode ===
                  "Cash"
                    ? "#166534"
                    : "#1d4ed8",

                fontSize:
                  "12px",
                fontWeight:
                  "700",
                textAlign:
                  "center",
              }}
            >

              {paymentMode ===
              "Cash"
                ? "💵 CASH SALE"
                : "🧾 CREDIT SALE"}

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          ACTION BAR
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: "16px 20px",
          marginTop: "18px",
          display: "flex",
          justifyContent:
            "flex-end",
          alignItems: "center",
          gap: "10px",
        }}
      >

        {/* CANCEL */}

        {editingSaleId && (
          <button
            type="button"
            onClick={cancelEdit}
            disabled={loading}
            style={{
              padding:
                "11px 18px",
              border:
                "1px solid #cbd5e1",
              background:
                "#ffffff",
              color:
                "#475569",
              borderRadius:
                "7px",
              cursor:
                "pointer",
              fontWeight:
                "700",
            }}
          >
            Cancel
          </button>
        )}

        {/* PRINT */}

        {editingSaleId && (
          <button
            type="button"
            onClick={() =>
              window.open(
                `/print-invoice/${editingSaleId}`,
                "_blank"
              )
            }
            style={{
              padding:
                "11px 18px",
              border:
                "1px solid #bfdbfe",
              background:
                "#eff6ff",
              color:
                "#1d4ed8",
              borderRadius:
                "7px",
              cursor:
                "pointer",
              fontWeight:
                "700",
            }}
          >
            🖨 Print
          </button>
        )}

        {/* SAVE */}

        <button
          type="button"
          onClick={saveSale}
          disabled={loading}
          style={{
            minWidth: "155px",
            padding:
              "12px 22px",
            border: "none",

            background:
              loading
                ? "#94a3b8"
                : editingSaleId
                ? "#16a34a"
                : "#2563eb",

            color: "white",
            borderRadius:
              "7px",

            cursor:
              loading
                ? "not-allowed"
                : "pointer",

            fontWeight:
              "800",
            fontSize:
              "14px",
          }}
        >
          {loading
            ? "Saving..."
            : editingSaleId
            ? "✓ Update Sale"
            : "✓ Save Sale"}
        </button>

      </div>

      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          Please wait...
        </div>
      )}

    </div>
  );
}