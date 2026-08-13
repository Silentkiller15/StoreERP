import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function Stock() {
  // ==================================================
  // PRODUCTS
  // ==================================================

  const [products, setProducts] = useState([]);

  // ==================================================
  // STOCK ENTRY ROW
  // ==================================================

  const createEmptyRow = () => ({
    productId: "",
    productName: "",
    currentStock: 0,
    qty: "",
    type: "add",
    newStock: 0,
  });

  const [entries, setEntries] = useState(
    Array.from(
      { length: 10 },
      () => createEmptyRow()
    )
  );

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  // ==================================================
  // LOAD PRODUCTS
  // ==================================================

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/products"
      );

      setProducts(res.data || []);
    } catch (err) {
      console.log(err);
      alert("Unable to load products");
    }
  };

  // ==================================================
  // SELECT PRODUCT
  // ==================================================

  const selectProduct = (
    index,
    productName
  ) => {
    setEntries((prev) => {
      const data = [...prev];

      const searchText = String(
        productName
      )
        .trim()
        .toLowerCase();

      const product = products.find(
        (p) =>
          String(p.name)
            .trim()
            .toLowerCase() ===
          searchText
      );

      const row = {
        ...data[index],
        productName,
      };

      if (product) {
        row.productId =
          product.id;

        row.productName =
          product.name;

        row.currentStock =
          Number(product.stock) || 0;

        const qty =
          Number(row.qty) || 0;

        row.newStock =
          row.type === "add"
            ? row.currentStock + qty
            : row.currentStock - qty;

        if (
          index ===
          data.length - 1
        ) {
          data.push(
            createEmptyRow()
          );
        }
      } else {
        row.productId = "";
        row.currentStock = 0;
        row.newStock = 0;
      }

      data[index] = row;

      return data;
    });
  };

  // ==================================================
  // UPDATE QUANTITY
  // ==================================================

  const updateQty = (
    index,
    value
  ) => {
    setEntries((prev) => {
      const data = [...prev];

      const row = {
        ...data[index],
        qty: value,
      };

      const qty =
        Number(value) || 0;

      if (row.type === "add") {
        row.newStock =
          Number(
            row.currentStock
          ) + qty;
      } else {
        row.newStock =
          Number(
            row.currentStock
          ) - qty;
      }

      data[index] = row;

      return data;
    });
  };

  // ==================================================
  // UPDATE TYPE
  // ==================================================

  const updateType = (
    index,
    value
  ) => {
    setEntries((prev) => {
      const data = [...prev];

      const row = {
        ...data[index],
        type: value,
      };

      const qty =
        Number(row.qty) || 0;

      if (value === "add") {
        row.newStock =
          Number(
            row.currentStock
          ) + qty;
      } else {
        row.newStock =
          Number(
            row.currentStock
          ) - qty;
      }

      data[index] = row;

      return data;
    });
  };

  // ==================================================
  // DELETE ENTRY ROW
  // ==================================================

  const removeRow = (index) => {
    setEntries((prev) => {
      const data = [...prev];

      data.splice(index, 1);

      if (data.length === 0) {
        data.push(
          createEmptyRow()
        );
      }

      return data;
    });
  };

  // ==================================================
  // VALID ENTRIES
  // ==================================================

  const validEntries =
    entries.filter(
      (entry) =>
        entry.productId &&
        Number(entry.qty) > 0
    );

  // ==================================================
  // TOTAL ADD / REDUCE
  // ==================================================

  const totalAdd =
    validEntries
      .filter(
        (entry) =>
          entry.type === "add"
      )
      .reduce(
        (sum, entry) =>
          sum +
          Number(entry.qty || 0),
        0
      );

  const totalReduce =
    validEntries
      .filter(
        (entry) =>
          entry.type === "reduce"
      )
      .reduce(
        (sum, entry) =>
          sum +
          Number(entry.qty || 0),
        0
      );

  // ==================================================
  // LOW STOCK COUNT
  // ==================================================

  const lowStockProducts =
    products.filter(
      (product) =>
        Number(product.stock) <= 5
    );

  // ==================================================
  // SAVE STOCK
  // ==================================================

  const saveStock = async () => {
    if (
      validEntries.length === 0
    ) {
      alert(
        "Please enter at least one product and quantity"
      );
      return;
    }

    // Prevent negative stock
    const negativeStock =
      validEntries.find(
        (entry) =>
          entry.type ===
            "reduce" &&
          Number(entry.qty) >
            Number(
              entry.currentStock
            )
      );

    if (negativeStock) {
      alert(
        `Cannot reduce more stock than available for ${negativeStock.productName}`
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Update stock for ${validEntries.length} product(s)?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      const items =
        validEntries.map(
          (entry) => ({
            productId:
              entry.productId,

            qty: Number(
              entry.qty
            ),

            type: entry.type,
          })
        );

      await axios.post(
        "http://localhost:5000/products/stock-adjustment",
        {
          items,
        }
      );

      alert(
        "Stock Updated Successfully"
      );

      setEntries(
        Array.from(
          { length: 10 },
          () => createEmptyRow()
        )
      );

      await loadProducts();
    } catch (err) {
      console.log(err);

      alert(
        "Unable to update stock"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // SEARCH STOCK REGISTER
  // ==================================================

  const filteredProducts =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return products;
      }

      return products.filter(
        (product) =>
          String(
            product.code || ""
          )
            .toLowerCase()
            .includes(keyword) ||
          String(
            product.name || ""
          )
            .toLowerCase()
            .includes(keyword) ||
          String(
            product.category || ""
          )
            .toLowerCase()
            .includes(keyword)
      );
    }, [products, search]);

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
    borderRadius: "7px",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    background: "#ffffff",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748b",
    textTransform:
      "uppercase",
    marginBottom: "6px",
    letterSpacing:
      "0.04em",
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
          marginBottom:
            "18px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "800",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
              marginBottom:
                "5px",
            }}
          >
            Inventory
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              color: "#0f172a",
            }}
          >
            📦 Stock Management
          </h1>

          <div
            style={{
              marginTop: "5px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Adjust inventory and
            monitor current stock
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "700",
            }}
          >
            PRODUCTS
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#2563eb",
            }}
          >
            {products.length}
          </div>
        </div>
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
          marginBottom:
            "18px",
        }}
      >

        {/* PRODUCTS */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "800",
              textTransform:
                "uppercase",
              marginBottom:
                "8px",
            }}
          >
            Total Products
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#0f172a",
            }}
          >
            {products.length}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            Items in inventory
          </div>
        </div>

        {/* LOW STOCK */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
            background:
              lowStockProducts.length >
              0
                ? "#fff7ed"
                : "#ffffff",
            border:
              lowStockProducts.length >
              0
                ? "1px solid #fed7aa"
                : "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color:
                lowStockProducts.length >
                0
                  ? "#c2410c"
                  : "#64748b",
              fontWeight: "800",
              textTransform:
                "uppercase",
              marginBottom:
                "8px",
            }}
          >
            Low Stock
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color:
                lowStockProducts.length >
                0
                  ? "#c2410c"
                  : "#0f172a",
            }}
          >
            {lowStockProducts.length}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color:
                lowStockProducts.length >
                0
                  ? "#ea580c"
                  : "#94a3b8",
            }}
          >
            5 or fewer units
          </div>
        </div>

        {/* ADD */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
            background:
              "#f0fdf4",
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
              marginBottom:
                "8px",
            }}
          >
            Pending Add
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#15803d",
            }}
          >
            +{totalAdd}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#16a34a",
            }}
          >
            Units in current entry
          </div>
        </div>

        {/* REDUCE */}

        <div
          style={{
            ...cardStyle,
            padding: "18px",
            background:
              "#fef2f2",
            border:
              "1px solid #fecaca",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#dc2626",
              fontWeight: "800",
              textTransform:
                "uppercase",
              marginBottom:
                "8px",
            }}
          >
            Pending Reduce
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#dc2626",
            }}
          >
            -{totalReduce}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#ef4444",
            }}
          >
            Units in current entry
          </div>
        </div>

      </div>

      {/* ==================================================
          STOCK ENTRY
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow: "hidden",
          marginBottom:
            "18px",
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
            alignItems:
              "center",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius:
                  "9px",
                background:
                  "#dbeafe",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "18px",
              }}
            >
              📦
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
                Stock Entry
              </div>

              <div
                style={{
                  fontSize:
                    "12px",
                  color:
                    "#64748b",
                }}
              >
                Add or reduce
                inventory
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize:
                "12px",
              color:
                "#64748b",
              fontWeight:
                "700",
            }}
          >
            {validEntries.length}{" "}
            product
            {validEntries.length ===
            1
              ? ""
              : "s"} selected
          </div>
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
                    "#f8fafc",
                }}
              >
                <th
                  style={{
                    width:
                      "55px",
                    padding:
                      "12px",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  #
                </th>

                <th
                  style={{
                    padding:
                      "12px",
                    textAlign:
                      "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  PRODUCT
                </th>

                <th
                  style={{
                    width:
                      "120px",
                    padding:
                      "12px",
                    textAlign:
                      "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  CURRENT
                </th>

                <th
                  style={{
                    width:
                      "150px",
                    padding:
                      "12px",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  ACTION
                </th>

                <th
                  style={{
                    width:
                      "130px",
                    padding:
                      "12px",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  QUANTITY
                </th>

                <th
                  style={{
                    width:
                      "130px",
                    padding:
                      "12px",
                    textAlign:
                      "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  NEW STOCK
                </th>

                <th
                  style={{
                    width:
                      "80px",
                    padding:
                      "12px",
                    textAlign:
                      "center",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>
              {entries.map(
                (
                  entry,
                  index
                ) => (
                  <tr
                    key={index}
                    style={{
                      background:
                        entry.productId
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
                        list={`stock-products-${index}`}
                        value={
                          entry.productName
                        }
                        placeholder="Search or type product..."
                        onChange={(
                          e
                        ) =>
                          selectProduct(
                            index,
                            e.target
                              .value
                          )
                        }
                        style={{
                          ...inputStyle,
                          padding:
                            "9px 10px",
                        }}
                      />

                      <datalist
                        id={`stock-products-${index}`}
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

                    {/* CURRENT STOCK */}

                    <td
                      style={{
                        padding:
                          "10px",
                        textAlign:
                          "right",
                        borderBottom:
                          "1px solid #f1f5f9",
                        fontWeight:
                          "800",
                        color:
                          "#0f172a",
                      }}
                    >
                      {Number(
                        entry.currentStock
                      )}

                      {entry.productId && (
                        <div
                          style={{
                            fontSize:
                              "10px",
                            color:
                              "#94a3b8",
                            fontWeight:
                              "500",
                            marginTop:
                              "2px",
                          }}
                        >
                          available
                        </div>
                      )}
                    </td>

                    {/* TYPE */}

                    <td
                      style={{
                        padding:
                          "8px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <select
                        value={
                          entry.type
                        }
                        onChange={(
                          e
                        ) =>
                          updateType(
                            index,
                            e.target
                              .value
                          )
                        }
                        style={{
                          ...inputStyle,
                          padding:
                            "9px 10px",
                          fontWeight:
                            "700",
                          color:
                            entry.type ===
                            "add"
                              ? "#15803d"
                              : "#dc2626",
                          background:
                            entry.type ===
                            "add"
                              ? "#f0fdf4"
                              : "#fef2f2",
                        }}
                      >
                        <option value="add">
                          + Add Stock
                        </option>

                        <option value="reduce">
                          − Reduce Stock
                        </option>
                      </select>
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
                          entry.qty
                        }
                        onChange={(
                          e
                        ) =>
                          updateQty(
                            index,
                            e.target
                              .value
                          )
                        }
                        placeholder="0"
                        style={{
                          ...inputStyle,
                          textAlign:
                            "right",
                          fontWeight:
                            "700",
                        }}
                      />
                    </td>

                    {/* NEW STOCK */}

                    <td
                      style={{
                        padding:
                          "10px",
                        textAlign:
                          "right",
                        borderBottom:
                          "1px solid #f1f5f9",
                        fontWeight:
                          "900",
                        fontSize:
                          "15px",
                        color:
                          entry.newStock <
                          0
                            ? "#dc2626"
                            : entry.newStock >
                              entry.currentStock
                            ? "#15803d"
                            : "#0f172a",
                      }}
                    >
                      {Number(
                        entry.newStock
                      )}

                      {entry.productId &&
                        Number(
                          entry.qty
                        ) > 0 && (
                          <div
                            style={{
                              fontSize:
                                "10px",
                              marginTop:
                                "2px",
                              color:
                                entry.type ===
                                "add"
                                  ? "#16a34a"
                                  : "#dc2626",
                            }}
                          >
                            {entry.type ===
                            "add"
                              ? "increase"
                              : "decrease"}
                          </div>
                        )}
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
                        title="Remove row"
                        style={{
                          width:
                            "32px",
                          height:
                            "32px",
                          border:
                            "none",
                          borderRadius:
                            "7px",
                          background:
                            "#fee2e2",
                          color:
                            "#dc2626",
                          cursor:
                            "pointer",
                          fontSize:
                            "18px",
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

        {/* ENTRY FOOTER */}

        <div
          style={{
            padding:
              "14px 20px",
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
              "15px",
            flexWrap:
              "wrap",
          }}
        >
          <div
            style={{
              display:
                "flex",
              gap:
                "15px",
              fontSize:
                "13px",
            }}
          >
            <span
              style={{
                color:
                  "#15803d",
                fontWeight:
                  "800",
              }}
            >
              + Add:{" "}
              {totalAdd}
            </span>

            <span
              style={{
                color:
                  "#dc2626",
                fontWeight:
                  "800",
              }}
            >
              − Reduce:{" "}
              {totalReduce}
            </span>
          </div>

          <button
            onClick={
              saveStock
            }
            disabled={
              saving
            }
            style={{
              padding:
                "11px 22px",
              border:
                "none",
              borderRadius:
                "8px",
              background:
                saving
                  ? "#94a3b8"
                  : "#2563eb",
              color:
                "white",
              cursor:
                saving
                  ? "not-allowed"
                  : "pointer",
              fontWeight:
                "800",
              fontSize:
                "14px",
            }}
          >
            {saving
              ? "Saving..."
              : "✓ Save Stock"}
          </button>
        </div>
      </div>

      {/* ==================================================
          STOCK REGISTER
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow:
            "hidden",
        }}
      >

        {/* HEADER */}

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
                  "9px",
                background:
                  "#dcfce7",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  "18px",
              }}
            >
              📊
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
                Stock Register
              </div>

              <div
                style={{
                  fontSize:
                    "12px",
                  color:
                    "#64748b",
                }}
              >
                Current inventory
                position
              </div>
            </div>
          </div>

          {/* SEARCH */}

          <div
            style={{
              position:
                "relative",
              width:
                "360px",
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
              onChange={(
                e
              ) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search code, product or category..."
              style={{
                ...inputStyle,
                padding:
                  "10px 12px 10px 38px",
              }}
            />
          </div>
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
                  style={{
                    padding:
                      "13px 15px",
                    textAlign:
                      "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  CODE
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",
                    textAlign:
                      "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  PRODUCT
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",
                    textAlign:
                      "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  CATEGORY
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",
                    textAlign:
                      "center",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  UNIT
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",
                    textAlign:
                      "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  PURCHASE
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",
                    textAlign:
                      "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  SELLING
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",
                    textAlign:
                      "center",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  GST
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",
                    textAlign:
                      "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                  }}
                >
                  STOCK
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding:
                        "50px",
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "40px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      📦
                    </div>

                    <div
                      style={{
                        fontWeight:
                          "800",
                        color:
                          "#334155",
                        fontSize:
                          "16px",
                      }}
                    >
                      {search
                        ? "No products found"
                        : "No products available"}
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
                        ? "Try another search term."
                        : "Products will appear here."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(
                  (
                    product,
                    index
                  ) => {
                    const stock =
                      Number(
                        product.stock
                      ) || 0;

                    const isLow =
                      stock <= 5;

                    const isOut =
                      stock <= 0;

                    return (
                      <tr
                        key={
                          product.id
                        }
                        style={{
                          background:
                            isOut
                              ? "#fff1f2"
                              : isLow
                              ? "#fffaf0"
                              : index %
                                    2 ===
                                  0
                              ? "#ffffff"
                              : "#fafafa",
                        }}
                      >

                        {/* CODE */}

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
                          {product.code ||
                            "—"}
                        </td>

                        {/* PRODUCT */}

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
                          {product.name}
                        </td>

                        {/* CATEGORY */}

                        <td
                          style={{
                            padding:
                              "13px 15px",
                            borderBottom:
                              "1px solid #f1f5f9",
                            color:
                              "#475569",
                          }}
                        >
                          {product.category ||
                            "—"}
                        </td>

                        {/* UNIT */}

                        <td
                          style={{
                            padding:
                              "13px 15px",
                            textAlign:
                              "center",
                            borderBottom:
                              "1px solid #f1f5f9",
                            color:
                              "#475569",
                          }}
                        >
                          {product.unit ||
                            "—"}
                        </td>

                        {/* PURCHASE */}

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
                            product.purchase ||
                              0
                          ).toFixed(
                            2
                          )}
                        </td>

                        {/* SELLING */}

                        <td
                          style={{
                            padding:
                              "13px 15px",
                            textAlign:
                              "right",
                            borderBottom:
                              "1px solid #f1f5f9",
                            fontWeight:
                              "700",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          ₹{" "}
                          {Number(
                            product.selling ||
                              0
                          ).toFixed(
                            2
                          )}
                        </td>

                        {/* GST */}

                        <td
                          style={{
                            padding:
                              "13px 15px",
                            textAlign:
                              "center",
                            borderBottom:
                              "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "4px 8px",
                              borderRadius:
                                "5px",
                              background:
                                "#f1f5f9",
                              color:
                                "#475569",
                              fontSize:
                                "12px",
                              fontWeight:
                                "700",
                            }}
                          >
                            {product.gst ||
                              0}
                            %
                          </span>
                        </td>

                        {/* STOCK */}

                        <td
                          style={{
                            padding:
                              "13px 15px",
                            textAlign:
                              "right",
                            borderBottom:
                              "1px solid #f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              alignItems:
                                "flex-end",
                              gap:
                                "3px",
                            }}
                          >
                            <span
                              style={{
                                fontSize:
                                  "16px",
                                fontWeight:
                                  "900",
                                color:
                                  isOut
                                    ? "#dc2626"
                                    : isLow
                                    ? "#c2410c"
                                    : "#15803d",
                              }}
                            >
                              {stock}
                            </span>

                            <span
                              style={{
                                fontSize:
                                  "10px",
                                fontWeight:
                                  "800",
                                color:
                                  isOut
                                    ? "#dc2626"
                                    : isLow
                                    ? "#ea580c"
                                    : "#16a34a",
                                textTransform:
                                  "uppercase",
                              }}
                            >
                              {isOut
                                ? "Out of stock"
                                : isLow
                                ? "Low stock"
                                : "Available"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* REGISTER FOOTER */}

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
              {
                filteredProducts.length
              }
            </b>{" "}
            of{" "}
            <b
              style={{
                color:
                  "#334155",
              }}
            >
              {products.length}
            </b>{" "}
            products
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