import { useState, useEffect } from "react";
import axios from "axios";

export default function Purchases({
  editingPurchaseId,
  setEditingPurchaseId,
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // ==================================================
  // PURCHASE NUMBER - EDITABLE
  // ==================================================

  const [purchaseNo, setPurchaseNo] = useState(
    "PO" + Math.floor(Math.random() * 100000)
  );

  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [supplierId, setSupplierId] = useState("");

  const [paymentMode, setPaymentMode] =
  useState("Cash");

  const createEmptyItem = () => ({
    productId: "",
    productName: "",
    qty: "",
    rate: 0,
    gst: 0,
    total: 0,
  });

  const [items, setItems] = useState(
    Array.from(
      { length: 10 },
      () => createEmptyItem()
    )
  );

  // ==================================================
  // LOAD SUPPLIERS + PRODUCTS
  // ==================================================

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  // ==================================================
  // LOAD PURCHASE FOR EDIT
  // ==================================================

  useEffect(() => {
    if (editingPurchaseId) {
      loadPurchase(editingPurchaseId);
    }
  }, [editingPurchaseId]);

  const loadSuppliers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/suppliers"
      );

      setSuppliers(res.data || []);
    } catch (err) {
      console.log(
        "Supplier Loading Error:",
        err
      );
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/products"
      );

      setProducts(res.data || []);
    } catch (err) {
      console.log(
        "Product Loading Error:",
        err
      );
    }
  };

  // ==================================================
  // LOAD EXISTING PURCHASE
  // ==================================================

  const loadPurchase = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/purchases/${id}`
      );

      const purchase =
        res.data.purchase;

      setPurchaseNo(
        purchase.purchaseNo || ""
      );

      setPurchaseDate(
        purchase.purchaseDate || ""
      );

      setSupplierId(
        purchase.supplierId || ""
      );

      setPaymentMode(
  purchase.paymentMode || "Cash"
);

      const loadedItems =
        (res.data.items || []).map(
          (item) => {
            const product =
              products.find(
                (p) =>
                  String(p.id) ===
                  String(item.productId)
              );

            return {
              productId:
                item.productId,

              productName:
                product?.name ||
                item.productName ||
                "",

              qty:
                Number(item.qty) || 0,

              rate:
                Number(item.rate) || 0,

              gst:
                Number(item.gst) || 0,

              total:
                (Number(item.qty) || 0) *
                (Number(item.rate) || 0),
            };
          }
        );

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
        "Purchase Loading Error:",
        err
      );

      alert(
        "Unable to load purchase"
      );
    }
  };

  // ==================================================
  // PRODUCT SELECT
  // ==================================================

  const selectProduct = (
    index,
    productName
  ) => {
    setItems((prevItems) => {
      const data = [
        ...prevItems,
      ];

      const product =
        products.find(
          (p) =>
            String(p.name)
              .toLowerCase() ===
            String(productName)
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
            product.purchase
          ) || 0;

        current.gst =
          Number(
            product.gst
          ) || 0;
      } else {
        current.productId = "";
        current.rate = 0;
        current.gst = 0;
      }

      current.total =
        (Number(
          current.qty
        ) || 0) *
        (Number(
          current.rate
        ) || 0);

      data[index] = current;

      // Automatically add another row
      // when the last row gets a product
      if (
        index === data.length - 1 &&
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
      const data = [
        ...prevItems,
      ];

      const item = {
        ...data[index],
        [field]: value,
      };

      item.total =
        (Number(
          item.qty
        ) || 0) *
        (Number(
          item.rate
        ) || 0);

      data[index] = item;

      return data;
    });
  };

  // ==================================================
  // REMOVE ITEM
  // ==================================================

  const removeItem = (
    index
  ) => {
    setItems((prevItems) => {
      const data = [
        ...prevItems,
      ];

      data.splice(index, 1);

      if (
        data.length === 0
      ) {
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

  const validItems =
    items.filter(
      (item) =>
        item.productId &&
        Number(item.qty) > 0
    );

  // ==================================================
  // TOTALS
  // ==================================================

  const subTotal =
    validItems.reduce(
      (sum, item) =>
        sum +
        Number(
          item.total || 0
        ),
      0
    );

  const gstTotal =
    validItems.reduce(
      (sum, item) =>
        sum +
        (Number(
          item.total || 0
        ) *
          Number(
            item.gst || 0
          )) /
          100,
      0
    );

  const grandTotal =
    subTotal + gstTotal;

  // ==================================================
  // SAVE / UPDATE PURCHASE
  // ==================================================

  const savePurchase =
    async () => {
      if (
        !purchaseNo.trim()
      ) {
        alert(
          "Please enter Purchase Number"
        );
        return;
      }

      if (!supplierId) {
        alert(
          "Please select supplier"
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

      try {
        const dataToSave =
          validItems.map(
            (item) => ({
              productId:
                item.productId,

              qty:
                Number(
                  item.qty
                ),

              rate:
                Number(
                  item.rate
                ),

              gst:
                Number(
                  item.gst
                ),

              total:
                Number(
                  item.total
                ),
            })
          );

        // ==========================================
        // UPDATE EXISTING PURCHASE
        // ==========================================

        if (
          editingPurchaseId
        ) {
          await axios.put(
            `http://localhost:5000/purchases/${editingPurchaseId}`,
            {
              purchaseNo,

              supplierId,

              purchaseDate,

              total:
                subTotal,

              gst:
                gstTotal,

              grandTotal,

              items:
                dataToSave,
            }
          );

          alert(
            "Purchase Updated Successfully"
          );

          setEditingPurchaseId(
            null
          );
        }

        // ==========================================
        // NEW PURCHASE
        // ==========================================

        else {
          await axios.post(
            "http://localhost:5000/purchases",
            {
              purchaseNo,

              supplierId,

              purchaseDate,

              total:
                subTotal,

              gst:
                gstTotal,

              grandTotal,

              items:
                dataToSave,
            }
          );

          alert(
            "Purchase Saved Successfully"
          );
        }

        window.location.reload();
      } catch (err) {
        console.log(
          "Purchase Save Error:",
          err
        );

        alert(
          err.response?.data?.message ||
            "Error Saving Purchase"
        );
      }
    };

  // ==================================================
  // FORMAT MONEY
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
        padding:
          "24px",
        boxSizing:
          "border-box",
      }}
    >
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          marginBottom:
            22,
          flexWrap:
            "wrap",
          gap: 15,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius:
                  12,
                background:
                  "#2563eb",
                color: "white",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: 22,
              }}
            >
              📥
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 25,
                  color:
                    "#0f172a",
                }}
              >
                {editingPurchaseId
                  ? "Edit Purchase"
                  : "Purchase Entry"}
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
                Record purchase
                invoices and
                inventory
                transactions
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display:
              "flex",
            gap: 10,
          }}
        >
          {editingPurchaseId && (
            <button
              type="button"
              onClick={() => {
                setEditingPurchaseId(
                  null
                );

                window.location.reload();
              }}
              style={{
                padding:
                  "10px 18px",
                background:
                  "white",
                color:
                  "#475569",
                border:
                  "1px solid #cbd5e1",
                borderRadius:
                  8,
                cursor:
                  "pointer",
                fontWeight:
                  600,
              }}
            >
              ✕ Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* ==================================================
          PURCHASE INFORMATION
      ================================================== */}

      <div
        style={{
          background:
            "white",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            14,
          padding:
            20,
          marginBottom:
            18,
          boxShadow:
            "0 2px 6px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap: 8,
            marginBottom:
              18,
          }}
        >
          <span
            style={{
              fontSize: 18,
            }}
          >
            🧾
          </span>

          <h2
            style={{
              margin: 0,
              fontSize: 17,
              color:
                "#0f172a",
            }}
          >
            Purchase Information
          </h2>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(3, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {/* ==================================================
              PURCHASE NUMBER - EDITABLE
          ================================================== */}

          <FieldCard
            label="Purchase Number"
            icon="🔢"
          >
            <input
              value={
                purchaseNo
              }
              onChange={(e) =>
                setPurchaseNo(
                  e.target.value
                )
              }
              placeholder="Enter Purchase Number"
              style={{
                ...inputStyle,
                background:
                  "white",
                color:
                  "#0f172a",
                fontWeight:
                  600,
              }}
            />
          </FieldCard>

          

          {/* ==================================================
              DATE
          ================================================== */}

          <FieldCard
            label="Purchase Date"
            icon="📅"
          >
            <input
              type="date"
              value={
                purchaseDate
              }
              onChange={(e) =>
                setPurchaseDate(
                  e.target.value
                )
              }
              style={
                inputStyle
              }
            />
          </FieldCard>

          {/* ==================================================
              SUPPLIER
          ================================================== */}

          <FieldCard
            label="Supplier"
            icon="🏢"
          >
            <select
              value={
                supplierId
              }
              onChange={(e) =>
                setSupplierId(
                  e.target.value
                )
              }
              style={
                inputStyle
              }
            >
              <option value="">
                Select Supplier
              </option>

              {suppliers.map(
                (
                  supplier
                ) => (
                  <option
                    key={
                      supplier.id
                    }
                    value={
                      supplier.id
                    }
                  >
                    {
                      supplier.name
                    }
                  </option>
                )
              )}
            </select>
          </FieldCard>
          <FieldCard
  label="Payment Mode"
  icon="💳"
>
  <select
    value={paymentMode}
    onChange={(e) =>
      setPaymentMode(e.target.value)
    }
    style={inputStyle}
  >
    <option value="Cash">
      Cash
    </option>

    <option value="Credit">
      Credit
    </option>
  </select>
</FieldCard>
        </div>
      </div>
      

      {/* ==================================================
          PRODUCT ENTRY
      ================================================== */}

      <div
        style={{
          background:
            "white",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            14,
          overflow:
            "hidden",
          boxShadow:
            "0 2px 6px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            padding:
              "18px 20px",
            borderBottom:
              "1px solid #e2e8f0",
            background:
              "#f8fafc",
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            flexWrap:
              "wrap",
            gap: 10,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                color:
                  "#0f172a",
              }}
            >
              📦 Purchase Items
            </h2>

            <p
              style={{
                margin:
                  "4px 0 0",
                fontSize: 12,
                color:
                  "#64748b",
              }}
            >
              Select products,
              enter quantity
              and purchase
              rate
            </p>
          </div>

          <div
            style={{
              padding:
                "7px 12px",
              background:
                "#eff6ff",
              color:
                "#1d4ed8",
              borderRadius:
                20,
              fontSize: 12,
              fontWeight:
                600,
            }}
          >
            {validItems.length}{" "}
            item
            {validItems.length ===
            1
              ? ""
              : "s"}
          </div>
        </div>

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
              width:
                "100%",
              minWidth:
                850,
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "#e2e8f0",
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
                  style={{
                    ...thStyle,
                    textAlign:
                      "left",
                    minWidth:
                      300,
                  }}
                >
                  Product
                </th>

                <th
                  style={{
                    ...thStyle,
                    width: 110,
                  }}
                >
                  Quantity
                </th>

                <th
                  style={{
                    ...thStyle,
                    width: 140,
                  }}
                >
                  Rate
                </th>

                <th
                  style={{
                    ...thStyle,
                    width: 160,
                  }}
                >
                  Amount
                </th>

                <th
                  style={{
                    ...thStyle,
                    width: 80,
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map(
                (
                  item,
                  index
                ) => {
                  const isUsed =
                    Boolean(
                      item.productId
                    );

                  return (
                    <tr
                      key={
                        index
                      }
                      style={{
                        background:
                          isUsed
                            ? "#ffffff"
                            : "#fafafa",
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      {/* SERIAL */}

                      <td
                        style={{
                          padding:
                            "10px 12px",
                          textAlign:
                            "center",
                          color:
                            "#64748b",
                          fontSize:
                            13,
                        }}
                      >
                        {index +
                          1}
                      </td>

                      {/* PRODUCT */}

                      <td
                        style={{
                          padding:
                            "8px 10px",
                        }}
                      >
                        <input
                          list={`purchase-products-${index}`}
                          value={
                            item.productName
                          }
                          placeholder="Type or select product..."
                          onChange={(
                            e
                          ) =>
                            selectProduct(
                              index,
                              e
                                .target
                                .value
                            )
                          }
                          style={{
                            ...tableInputStyle,
                            fontWeight:
                              isUsed
                                ? 600
                                : 400,
                          }}
                        />

                        <datalist
                          id={`purchase-products-${index}`}
                        >
                          {products.map(
                            (
                              product
                            ) => (
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
                        }}
                      >
                        <input
                          type="number"
                          min="0"
                          value={
                            item.qty
                          }
                          placeholder="0"
                          onChange={(
                            e
                          ) =>
                            updateItem(
                              index,
                              "qty",
                              e
                                .target
                                .value
                            )
                          }
                          style={{
                            ...tableInputStyle,
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
                              left:
                                10,
                              top:
                                "50%",
                              transform:
                                "translateY(-50%)",
                              color:
                                "#64748b",
                              fontSize:
                                13,
                            }}
                          >
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.rate
                            }
                            onChange={(
                              e
                            ) =>
                              updateItem(
                                index,
                                "rate",
                                e
                                  .target
                                  .value
                              )
                            }
                            style={{
                              ...tableInputStyle,
                              textAlign:
                                "right",
                              paddingLeft:
                                25,
                            }}
                          />
                        </div>
                      </td>

                      {/* AMOUNT */}

                      <td
                        style={{
                          padding:
                            "8px 12px",
                          textAlign:
                            "right",
                          fontWeight:
                            700,
                          color:
                            "#0f172a",
                        }}
                      >
                        ₹{" "}
                        {money(
                          item.total
                        )}
                      </td>

                      {/* DELETE */}

                      <td
                        style={{
                          padding:
                            "8px",
                          textAlign:
                            "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                          title="Remove item"
                          style={{
                            width:
                              34,
                            height:
                              34,
                            borderRadius:
                              8,
                            border:
                              "1px solid #fecaca",
                            background:
                              "#fef2f2",
                            color:
                              "#dc2626",
                            cursor:
                              "pointer",
                            fontSize:
                              15,
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                }
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
          display:
            "grid",
          gridTemplateColumns:
            "1fr 380px",
          gap: 18,
          marginTop: 18,
          alignItems:
            "start",
        }}
      >
        {/* ==================================================
            INFORMATION
        ================================================== */}

        <div
          style={{
            background:
              "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius:
              14,
            padding:
              20,
          }}
        >
          <div
            style={{
              display:
                "flex",
              gap: 12,
              alignItems:
                "flex-start",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius:
                  10,
                background:
                  "#dbeafe",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  18,
              }}
            >
              ℹ️
            </div>

            <div>
              <h3
                style={{
                  margin:
                    "0 0 5px",
                  color:
                    "#1e3a8a",
                  fontSize:
                    15,
                }}
              >
                Purchase Entry
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#475569",
                  fontSize:
                    12,
                  lineHeight:
                    1.6,
                }}
              >
                Select a supplier,
                enter the
                products and
                quantities, then
                save the purchase.
                Product purchase
                rates are loaded
                automatically when
                available.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            TOTALS
        ================================================== */}

        <div
          style={{
            background:
              "white",
            border:
              "1px solid #e2e8f0",
            borderRadius:
              14,
            padding:
              20,
            boxShadow:
              "0 2px 6px rgba(15,23,42,0.04)",
          }}
        >
          <h3
            style={{
              margin:
                "0 0 15px",
              fontSize:
                16,
              color:
                "#0f172a",
            }}
          >
            💰 Purchase Summary
          </h3>

          <TotalRow
            label="Sub Total"
            value={
              subTotal
            }
          />

          <TotalRow
            label="GST"
            value={
              gstTotal
            }
          />

          <div
            style={{
              borderTop:
                "2px solid #0f172a",
              marginTop:
                10,
              paddingTop:
                14,
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >
            <span
              style={{
                fontSize:
                  17,
                fontWeight:
                  800,
                color:
                  "#0f172a",
              }}
            >
              Grand Total
            </span>

            <span
              style={{
                fontSize:
                  22,
                fontWeight:
                  800,
                color:
                  "#2563eb",
              }}
            >
              ₹{" "}
              {money(
                grandTotal
              )}
            </span>
          </div>

          {/* SAVE */}

          <button
            type="button"
            onClick={
              savePurchase
            }
            style={{
              width:
                "100%",
              marginTop:
                18,
              padding:
                "13px 18px",
              background:
                editingPurchaseId
                  ? "#16a34a"
                  : "#2563eb",
              color:
                "white",
              border:
                "none",
              borderRadius:
                9,
              cursor:
                "pointer",
              fontSize:
                15,
              fontWeight:
                700,
              boxShadow:
                "0 3px 8px rgba(37,99,235,0.2)",
            }}
          >
            {editingPurchaseId
              ? "✓ Update Purchase"
              : "💾 Save Purchase"}
          </button>

          {/* CANCEL */}

          {editingPurchaseId && (
            <button
              type="button"
              onClick={() => {
                setEditingPurchaseId(
                  null
                );

                window.location.reload();
              }}
              style={{
                width:
                  "100%",
                marginTop:
                  9,
                padding:
                  "11px 18px",
                background:
                  "white",
                color:
                  "#475569",
                border:
                  "1px solid #cbd5e1",
                borderRadius:
                  9,
                cursor:
                  "pointer",
                fontWeight:
                  600,
              }}
            >
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* ==================================================
          RESPONSIVE CSS
      ================================================== */}

      <style>
        {`
          @media (max-width: 900px) {
            .purchase-responsive-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 700px) {
            .purchase-page-grid {
              grid-template-columns: 1fr !important;
            }

            div[style*="repeat(3, minmax(180px, 1fr))"] {
              grid-template-columns: 1fr !important;
            }
          }

          input:focus,
          select:focus {
            outline: none;
            border-color: #2563eb !important;
            box-shadow:
              0 0 0 3px rgba(37,99,235,0.10);
          }

          button:hover {
            filter: brightness(0.97);
          }
        `}
      </style>
    </div>
  );
}

// ==================================================
// FIELD CARD
// ==================================================

function FieldCard({
  label,
  icon,
  children,
}) {
  return (
    <div>
      <label
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap: 6,
          marginBottom:
            7,
          fontSize:
            12,
          fontWeight:
            700,
          color:
            "#475569",
        }}
      >
        <span>
          {icon}
        </span>

        {label}
      </label>

      {children}
    </div>
  );
}

// ==================================================
// TOTAL ROW
// ==================================================

function TotalRow({
  label,
  value,
}) {
  const money = (
    amount
  ) =>
    Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <div
      style={{
        display:
          "flex",
        justifyContent:
          "space-between",
        padding:
          "8px 0",
        color:
          "#475569",
        fontSize:
          13,
      }}
    >
      <span>
        {label}
      </span>

      <strong
        style={{
          color:
            "#0f172a",
        }}
      >
        ₹{" "}
        {money(
          value
        )}
      </strong>
    </div>
  );
}

// ==================================================
// STYLES
// ==================================================

const inputStyle = {
  width: "100%",
  height: 42,
  padding:
    "0 12px",
  border:
    "1px solid #cbd5e1",
  borderRadius: 8,
  background:
    "white",
  color:
    "#0f172a",
  fontSize: 14,
  boxSizing:
    "border-box",
};

const tableInputStyle = {
  width: "100%",
  height: 38,
  padding:
    "0 10px",
  border:
    "1px solid #cbd5e1",
  borderRadius: 7,
  background:
    "white",
  color:
    "#0f172a",
  fontSize: 13,
  boxSizing:
    "border-box",
};

const thStyle = {
  padding:
    "11px 10px",
  textAlign:
    "center",
  fontSize: 12,
  fontWeight: 700,
  color:
    "#334155",
  borderBottom:
    "1px solid #cbd5e1",
};