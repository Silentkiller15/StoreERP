import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function OpeningStock() {
  const [products, setProducts] = useState([]);
  const [entries, setEntries] = useState([]);

  const [openingDate, setOpeningDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const createRow = () => ({
    productId: "",
    productName: "",
    qty: "",
    rate: "",
    remarks: "",
    value: 0,
  });

  const [items, setItems] = useState([
    createRow(),
  ]);

  const [loading, setLoading] =
    useState(false);

  const [loadingEntries, setLoadingEntries] =
    useState(true);

  // ==================================================
  // LOAD PRODUCTS
  // ==================================================

  useEffect(() => {
    loadProducts();
    loadOpeningStock();
  }, []);

  const loadProducts = async () => {
    try {
      const res =
        await axios.get(
          "http://localhost:5000/products"
        );

      setProducts(
        res.data || []
      );

    } catch (err) {
      console.log(
        "Load Products Error:",
        err
      );

      alert(
        "Unable to load products"
      );
    }
  };

  // ==================================================
  // LOAD EXISTING OPENING STOCK
  // ==================================================

  const loadOpeningStock =
    async () => {
      try {
        setLoadingEntries(
          true
        );

        const res =
          await axios.get(
            "http://localhost:5000/opening-stock"
          );

        setEntries(
          res.data?.rows || []
        );

      } catch (err) {
        console.log(
          "Load Opening Stock Error:",
          err
        );

        alert(
          err.response?.data
            ?.message ||
            "Unable to load Opening Stock"
        );

      } finally {
        setLoadingEntries(
          false
        );
      }
    };

  // ==================================================
  // UPDATE ROW
  // ==================================================

  const updateRow = (
    index,
    field,
    value
  ) => {

    setItems(
      (previous) => {

        const rows = [
          ...previous,
        ];

        const row = {
          ...rows[index],
          [field]: value,
        };

        const qty =
          Number(row.qty) || 0;

        const rate =
          Number(row.rate) || 0;

        row.value =
          qty * rate;

        rows[index] =
          row;

        return rows;
      }
    );
  };

  // ==================================================
  // PRODUCT SELECT
  // ==================================================

  const selectProduct = (
    index,
    productId
  ) => {

    const product =
      products.find(
        (p) =>
          String(p.id) ===
          String(productId)
      );

    setItems(
      (previous) => {

        const rows = [
          ...previous,
        ];

        rows[index] = {
          ...rows[index],

          productId,

          productName:
            product?.name ||
            "",

          rate:
            product
              ? Number(
                  product.purchase
                ) || 0
              : "",

          value:
            product
              ? (
                  Number(
                    rows[index].qty
                  ) || 0
                ) *
                (
                  Number(
                    product.purchase
                  ) || 0
                )
              : 0,
        };

        return rows;
      }
    );
  };

  // ==================================================
  // ADD ROW
  // ==================================================

  const addRow = () => {
    setItems(
      (previous) => [
        ...previous,
        createRow(),
      ]
    );
  };

  // ==================================================
  // REMOVE ROW
  // ==================================================

  const removeRow = (
    index
  ) => {

    setItems(
      (previous) => {

        const rows =
          previous.filter(
            (_, i) =>
              i !== index
          );

        return rows.length
          ? rows
          : [createRow()];
      }
    );
  };

  // ==================================================
  // TOTAL
  // ==================================================

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          (
            Number(
              item.value
            ) || 0
          ),
        0
      ),
    [items]
  );

  // ==================================================
  // SAVE
  // ==================================================

  const saveOpeningStock =
    async () => {

      if (!openingDate) {
        alert(
          "Please select Opening Stock date"
        );
        return;
      }

      const validItems =
        items.filter(
          (item) =>
            item.productId &&
            Number(item.qty) > 0
        );

      if (
        validItems.length === 0
      ) {
        alert(
          "Please enter at least one product"
        );
        return;
      }

      // ------------------------------------------
      // CHECK DUPLICATES IN SCREEN
      // ------------------------------------------

      const ids =
        validItems.map(
          (item) =>
            String(
              item.productId
            )
        );

      const duplicates =
        ids.filter(
          (id, index) =>
            ids.indexOf(id) !==
            index
        );

      if (
        duplicates.length > 0
      ) {
        alert(
          "The same product cannot be entered twice."
        );
        return;
      }

      // ------------------------------------------
      // VALIDATE VALUES
      // ------------------------------------------

      for (
        const item of validItems
      ) {

        if (
          Number(item.qty) <= 0
        ) {
          alert(
            "Opening quantity must be greater than zero."
          );
          return;
        }

        if (
          Number(item.rate) < 0
        ) {
          alert(
            "Opening cost cannot be negative."
          );
          return;
        }
      }

      try {

        setLoading(true);

        await axios.post(
          "http://localhost:5000/opening-stock",
          {
            openingDate,

            items:
              validItems.map(
                (item) => ({
                  productId:
                    Number(
                      item.productId
                    ),

                  qty:
                    Number(
                      item.qty
                    ),

                  rate:
                    Number(
                      item.rate
                    ) || 0,

                  remarks:
                    item.remarks ||
                    "Opening Stock",
                })
              ),
          }
        );

        alert(
          "Opening Stock Saved Successfully"
        );

        setItems([
          createRow(),
        ]);

        await loadOpeningStock();

      } catch (err) {

        console.log(
          "Save Opening Stock Error:",
          err
        );

        alert(
          err.response?.data
            ?.message ||
            "Unable to save Opening Stock"
        );

      } finally {

        setLoading(false);
      }
    };

  // ==================================================
  // DELETE
  // ==================================================

  const deleteEntry =
    async (id) => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this Opening Stock entry?"
        );

      if (!confirmed) {
        return;
      }

      try {

        await axios.delete(
          `http://localhost:5000/opening-stock/${id}`
        );

        alert(
          "Opening Stock Deleted Successfully"
        );

        await loadOpeningStock();

      } catch (err) {

        console.log(
          "Delete Opening Stock Error:",
          err
        );

        alert(
          err.response?.data
            ?.message ||
            "Unable to delete Opening Stock"
        );
      }
    };

  // ==================================================
  // MONEY
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
  // STYLES
  // ==================================================

  const card = {
    background:
      "#ffffff",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      "10px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.05)",
  };

  const input = {
    width: "100%",
    padding:
      "9px 10px",
    border:
      "1px solid #cbd5e1",
    borderRadius:
      "6px",
    boxSizing:
      "border-box",
    fontSize:
      "14px",
    outline:
      "none",
  };

  const label = {
    display:
      "block",
    fontSize:
      "12px",
    fontWeight:
      "700",
    color:
      "#475569",
    marginBottom:
      "6px",
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div
      style={{
        minHeight:
          "100vh",
        background:
          "#f8fafc",
        padding:
          "24px",
        boxSizing:
          "border-box",
      }}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          ...card,
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
                "700",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
            }}
          >
            Inventory
          </div>

          <h1
            style={{
              margin:
                "5px 0",
              fontSize:
                "26px",
              color:
                "#0f172a",
            }}
          >
            📦 Opening Stock
          </h1>

          <p
            style={{
              margin: 0,
              color:
                "#64748b",
              fontSize:
                "13px",
            }}
          >
            Enter the stock
            available at the
            beginning of the
            accounting period.
          </p>

        </div>

        <div
          style={{
            padding:
              "12px 18px",
            borderRadius:
              "8px",
            background:
              "#eff6ff",
            border:
              "1px solid #bfdbfe",
            color:
              "#1d4ed8",
            fontWeight:
              "700",
          }}
        >
          Total: ₹{" "}
          {money(total)}
        </div>

      </div>

      {/* ==================================================
          ENTRY FORM
      ================================================== */}

      <div
        style={{
          ...card,
          overflow:
            "hidden",
          marginBottom:
            "20px",
        }}
      >

        <div
          style={{
            padding:
              "16px 20px",
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
          }}
        >

          <div
            style={{
              fontWeight:
                "800",
              color:
                "#0f172a",
            }}
          >
            New Opening Stock
          </div>

          <div
            style={{
              fontSize:
                "12px",
              color:
                "#64748b",
            }}
          >
            Opening stock does
            not include GST.
          </div>

        </div>

        <div
          style={{
            padding:
              "20px",
          }}
        >

          {/* DATE */}

          <div
            style={{
              width:
                "250px",
              marginBottom:
                "20px",
            }}
          >

            <label
              style={label}
            >
              Opening Date
            </label>

            <input
              type="date"
              value={
                openingDate
              }
              onChange={(e) =>
                setOpeningDate(
                  e.target.value
                )
              }
              style={input}
            />

          </div>

          {/* TABLE */}

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
                  "900px",
                borderCollapse:
                  "collapse",
              }}
            >

              <thead>

                <tr
                  style={{
                    background:
                      "#f1f5f9",
                  }}
                >

                  <th
                    style={{
                      padding:
                        "11px",
                      width:
                        "50px",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    #
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      textAlign:
                        "left",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    PRODUCT
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      width:
                        "130px",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    QUANTITY
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      width:
                        "150px",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    COST / UNIT
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      width:
                        "170px",
                      textAlign:
                        "right",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    VALUE
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      width:
                        "220px",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    REMARKS
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      width:
                        "70px",
                    }}
                  >
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={
                        index
                      }
                    >

                      <td
                        style={{
                          padding:
                            "8px",
                          textAlign:
                            "center",
                          borderBottom:
                            "1px solid #f1f5f9",
                          color:
                            "#64748b",
                          fontWeight:
                            "700",
                        }}
                      >
                        {index +
                          1}
                      </td>

                      {/* PRODUCT */}

                      <td
                        style={{
                          padding:
                            "8px",
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >

                        <select
                          value={
                            item.productId
                          }
                          onChange={(
                            e
                          ) =>
                            selectProduct(
                              index,
                              e.target
                                .value
                            )
                          }
                          style={
                            input
                          }
                        >

                          <option value="">
                            Select Product
                          </option>

                          {products.map(
                            (
                              product
                            ) => (
                              <option
                                key={
                                  product.id
                                }
                                value={
                                  product.id
                                }
                              >
                                {
                                  product.name
                                }
                              </option>
                            )
                          )}

                        </select>

                      </td>

                      {/* QTY */}

                      <td
                        style={{
                          padding:
                            "8px",
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
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "qty",
                              e.target
                                .value
                            )
                          }
                          style={{
                            ...input,
                            textAlign:
                              "right",
                          }}
                        />

                      </td>

                      {/* RATE */}

                      <td
                        style={{
                          padding:
                            "8px",
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
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "rate",
                              e.target
                                .value
                            )
                          }
                          style={{
                            ...input,
                            textAlign:
                              "right",
                          }}
                        />

                      </td>

                      {/* VALUE */}

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
                        }}
                      >
                        ₹{" "}
                        {money(
                          item.value
                        )}
                      </td>

                      {/* REMARKS */}

                      <td
                        style={{
                          padding:
                            "8px",
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >

                        <input
                          value={
                            item.remarks
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "remarks",
                              e.target
                                .value
                            )
                          }
                          placeholder="Optional"
                          style={
                            input
                          }
                        />

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
                            removeRow(
                              index
                            )
                          }
                          style={{
                            width:
                              "32px",
                            height:
                              "32px",
                            border:
                              "none",
                            borderRadius:
                              "6px",
                            background:
                              "#fee2e2",
                            color:
                              "#dc2626",
                            cursor:
                              "pointer",
                            fontWeight:
                              "800",
                            fontSize:
                              "16px",
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

          {/* BUTTONS */}

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginTop:
                "18px",
            }}
          >

            <button
              type="button"
              onClick={
                addRow
              }
              style={{
                padding:
                  "10px 16px",
                background:
                  "#eff6ff",
                border:
                  "1px solid #bfdbfe",
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
              + Add Row
            </button>

            <button
              type="button"
              onClick={
                saveOpeningStock
              }
              disabled={
                loading
              }
              style={{
                minWidth:
                  "190px",
                padding:
                  "12px 20px",
                background:
                  loading
                    ? "#94a3b8"
                    : "#2563eb",
                color:
                  "white",
                border:
                  "none",
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
                : "✓ Save Opening Stock"}
            </button>

          </div>

        </div>

      </div>

      {/* ==================================================
          EXISTING OPENING STOCK
      ================================================== */}

      <div
        style={{
          ...card,
          overflow:
            "hidden",
        }}
      >

        <div
          style={{
            padding:
              "16px 20px",
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
              Existing Opening
              Stock
            </div>

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
              Opening inventory
              already entered
            </div>

          </div>

          <div
            style={{
              fontWeight:
                "800",
              color:
                "#2563eb",
            }}
          >
            ₹{" "}
            {money(
              entries.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  Number(
                    item.value
                  ),
                0
              )
            )}
          </div>

        </div>

        {loadingEntries ? (

          <div
            style={{
              padding:
                "30px",
              textAlign:
                "center",
              color:
                "#64748b",
            }}
          >
            Loading...
          </div>

        ) : entries.length ===
          0 ? (

          <div
            style={{
              padding:
                "30px",
              textAlign:
                "center",
              color:
                "#64748b",
            }}
          >
            No Opening Stock
            has been entered
            yet.
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
                      padding:
                        "11px",
                      textAlign:
                        "left",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    DATE
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      textAlign:
                        "left",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    PRODUCT
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      textAlign:
                        "right",
                      fontSize:
                        "12px",
                        color:
                        "#475569",
                    }}
                  >
                    QTY
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      textAlign:
                        "right",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    RATE
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      textAlign:
                        "right",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    VALUE
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      textAlign:
                        "left",
                      fontSize:
                        "12px",
                      color:
                        "#475569",
                    }}
                  >
                    REMARKS
                  </th>

                  <th
                    style={{
                      padding:
                        "11px",
                      width:
                        "80px",
                    }}
                  >
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody>

                {entries.map(
                  (
                    entry
                  ) => (

                    <tr
                      key={
                        entry.id
                      }
                    >

                      <td
                        style={{
                          padding:
                            "11px",
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >
                        {
                          entry.openingDate
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "11px",
                          borderBottom:
                            "1px solid #f1f5f9",
                          fontWeight:
                            "600",
                        }}
                      >
                        {
                          entry.productName
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "11px",
                          textAlign:
                            "right",
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >
                        {
                          entry.qty
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "11px",
                          textAlign:
                            "right",
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >
                        ₹{" "}
                        {money(
                          entry.rate
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "11px",
                          textAlign:
                            "right",
                          borderBottom:
                            "1px solid #f1f5f9",
                          fontWeight:
                            "800",
                        }}
                      >
                        ₹{" "}
                        {money(
                          entry.value
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "11px",
                          borderBottom:
                            "1px solid #f1f5f9",
                          color:
                            "#64748b",
                        }}
                      >
                        {
                          entry.remarks
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "11px",
                          textAlign:
                            "center",
                            borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            deleteEntry(
                              entry.id
                            )
                          }
                          style={{
                            border:
                              "none",
                            background:
                              "#fee2e2",
                            color:
                              "#dc2626",
                            padding:
                              "7px 10px",
                            borderRadius:
                              "6px",
                            cursor:
                              "pointer",
                            fontWeight:
                              "700",
                          }}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}