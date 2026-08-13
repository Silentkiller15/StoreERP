import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function Products() {
  // ==================================================
  // PRODUCTS
  // ==================================================

  const [products, setProducts] = useState([]);

  const [search, setSearch] =
    useState("");

  const [editId, setEditId] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  // ==================================================
  // FORM
  // ==================================================

  const emptyForm = {
    code: "",
    name: "",
    category: "",
    unit: "",
    purchase: "",
    selling: "",
    gst: "",
    stock: "",
  };

  const [form, setForm] =
    useState(emptyForm);

  // ==================================================
  // LOAD PRODUCTS
  // ==================================================

  useEffect(() => {
    loadProducts();
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
      console.error(err);

      alert(
        "Cannot connect to server"
      );
    }
  };

  // ==================================================
  // FORM CHANGE
  // ==================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================================================
  // CLEAR FORM
  // ==================================================

  const clearForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  // ==================================================
  // SAVE / UPDATE PRODUCT
  // ==================================================

  const saveProduct =
    async () => {
      if (
        !form.name.trim()
      ) {
        alert(
          "Enter Product Name"
        );
        return;
      }

      const product = {
        ...form,

        code:
          form.code ||
          "P" +
            Date.now()
              .toString()
              .slice(-5),
      };

      try {
        setSaving(true);

        if (editId) {
          await axios.put(
            `http://localhost:5000/products/${editId}`,
            product
          );

          alert(
            "Product Updated"
          );
        } else {
          await axios.post(
            "http://localhost:5000/products",
            product
          );

          alert(
            "Product Saved"
          );
        }

        clearForm();

        await loadProducts();
      } catch (err) {
        console.error(err);

        alert(
          "Error saving product"
        );
      } finally {
        setSaving(false);
      }
    };

  // ==================================================
  // EDIT PRODUCT
  // ==================================================

  const editProduct = (
    product
  ) => {
    setForm({
      code:
        product.code || "",
      name:
        product.name || "",
      category:
        product.category || "",
      unit:
        product.unit || "",
      purchase:
        product.purchase || "",
      selling:
        product.selling || "",
      gst:
        product.gst || "",
      stock:
        product.stock || "",
    });

    setEditId(
      product.id
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // DELETE PRODUCT
  // ==================================================

  const deleteProduct =
    async (id) => {
      if (
        !window.confirm(
          "Delete this product?"
        )
      ) {
        return;
      }

      try {
        await axios.delete(
          `http://localhost:5000/products/${id}`
        );

        alert(
          "Product Deleted"
        );

        await loadProducts();

        if (
          editId === id
        ) {
          clearForm();
        }
      } catch (err) {
        console.error(err);

        alert(
          "Delete failed"
        );
      }
    };

  // ==================================================
  // SEARCH
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
          `${product.code || ""} ${
            product.name || ""
          } ${
            product.category ||
            ""
          } ${product.unit || ""}`
            .toLowerCase()
            .includes(keyword)
      );
    }, [products, search]);

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (sum, product) =>
        sum +
        Number(
          product.stock || 0
        ),
      0
    );

  const lowStock =
    products.filter(
      (product) =>
        Number(
          product.stock || 0
        ) <= 5
    ).length;

  const categories =
    new Set(
      products
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean)
    ).size;

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
    borderRadius: "8px",
    outline: "none",
    boxSizing:
      "border-box",
    fontSize: "14px",
    background:
      "#ffffff",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "800",
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
        minHeight:
          "100vh",
        padding:
          "24px",
        background:
          "#f1f5f9",
        boxSizing:
          "border-box",
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
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: "20px",
          flexWrap:
            "wrap",
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
                "800",
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
              fontSize:
                "26px",
              color:
                "#0f172a",
            }}
          >
            📦 Product Master
          </h1>

          <div
            style={{
              marginTop:
                "5px",
              color:
                "#64748b",
              fontSize:
                "13px",
            }}
          >
            Manage products,
            prices, GST and
            inventory
          </div>
        </div>

        <button
          type="button"
          onClick={
            clearForm
          }
          style={{
            padding:
              "11px 18px",
            background:
              "#2563eb",
            color:
              "white",
            border:
              "none",
            borderRadius:
              "8px",
            cursor:
              "pointer",
            fontWeight:
              "800",
          }}
        >
          ＋ New Product
        </button>
      </div>

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap:
            "14px",
          marginBottom:
            "18px",
        }}
      >

        {/* TOTAL PRODUCTS */}

        <div
          style={{
            ...cardStyle,
            padding:
              "18px",
          }}
        >
          <div
            style={{
              fontSize:
                "11px",
              color:
                "#64748b",
              fontWeight:
                "800",
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
              fontSize:
                "25px",
              fontWeight:
                "900",
              color:
                "#0f172a",
            }}
          >
            {totalProducts}
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "12px",
              color:
                "#94a3b8",
            }}
          >
            Products in master
          </div>
        </div>

        {/* CATEGORIES */}

        <div
          style={{
            ...cardStyle,
            padding:
              "18px",
          }}
        >
          <div
            style={{
              fontSize:
                "11px",
              color:
                "#64748b",
              fontWeight:
                "800",
              textTransform:
                "uppercase",
              marginBottom:
                "8px",
            }}
          >
            Categories
          </div>

          <div
            style={{
              fontSize:
                "25px",
              fontWeight:
                "900",
              color:
                "#0f172a",
            }}
          >
            {categories}
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "12px",
              color:
                "#94a3b8",
            }}
          >
            Product categories
          </div>
        </div>

        {/* TOTAL STOCK */}

        <div
          style={{
            ...cardStyle,
            padding:
              "18px",
            background:
              "#eff6ff",
            border:
              "1px solid #bfdbfe",
          }}
        >
          <div
            style={{
              fontSize:
                "11px",
              color:
                "#1d4ed8",
              fontWeight:
                "800",
              textTransform:
                "uppercase",
              marginBottom:
                "8px",
            }}
          >
            Total Stock
          </div>

          <div
            style={{
              fontSize:
                "25px",
              fontWeight:
                "900",
              color:
                "#1d4ed8",
            }}
          >
            {totalStock}
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "12px",
              color:
                "#3b82f6",
            }}
          >
            Units available
          </div>
        </div>

        {/* LOW STOCK */}

        <div
          style={{
            ...cardStyle,
            padding:
              "18px",
            background:
              lowStock > 0
                ? "#fff7ed"
                : "#ffffff",
            border:
              lowStock > 0
                ? "1px solid #fed7aa"
                : "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize:
                "11px",
              color:
                lowStock > 0
                  ? "#c2410c"
                  : "#64748b",
              fontWeight:
                "800",
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
              fontSize:
                "25px",
              fontWeight:
                "900",
              color:
                lowStock > 0
                  ? "#c2410c"
                  : "#0f172a",
            }}
          >
            {lowStock}
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "12px",
              color:
                lowStock > 0
                  ? "#ea580c"
                  : "#94a3b8",
            }}
          >
            5 or fewer units
          </div>
        </div>
      </div>

      {/* ==================================================
          PRODUCT FORM
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          marginBottom:
            "18px",
          overflow:
            "hidden",
        }}
      >

        {/* FORM HEADER */}

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
                  editId
                    ? "#fef3c7"
                    : "#dbeafe",
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
              {editId
                ? "✏️"
                : "＋"}
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
                {editId
                  ? "Edit Product"
                  : "Add Product"}
              </div>

              <div
                style={{
                  fontSize:
                    "12px",
                  color:
                    "#64748b",
                }}
              >
                {editId
                  ? "Update product details"
                  : "Create a new product"}
              </div>
            </div>
          </div>

          {editId && (
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
              <span
                style={{
                  padding:
                    "5px 9px",
                  borderRadius:
                    "6px",
                  background:
                    "#fef3c7",
                  color:
                    "#92400e",
                  fontSize:
                    "11px",
                  fontWeight:
                    "800",
                }}
              >
                EDITING
              </span>

              <button
                type="button"
                onClick={
                  clearForm
                }
                style={{
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    "#64748b",
                  cursor:
                    "pointer",
                  fontWeight:
                    "700",
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* FORM BODY */}

        <div
          style={{
            padding:
              "20px",
          }}
        >

          {/* ROW 1 */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "1fr 2fr 1.2fr 1fr",
              gap:
                "14px",
              marginBottom:
                "14px",
            }}
          >

            {/* CODE */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Product Code
              </label>

              <input
                name="code"
                value={
                  form.code
                }
                onChange={
                  handleChange
                }
                placeholder="Auto generated"
                style={
                  inputStyle
                }
              />
            </div>

            {/* NAME */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Product Name *
              </label>

              <input
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter product name"
                style={
                  inputStyle
                }
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Category
              </label>

              <input
                name="category"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
                placeholder="Category"
                style={
                  inputStyle
                }
              />
            </div>

            {/* UNIT */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Unit
              </label>

              <input
                name="unit"
                value={
                  form.unit
                }
                onChange={
                  handleChange
                }
                placeholder="PCS / KG / BOX"
                style={
                  inputStyle
                }
              />
            </div>
          </div>

          {/* ROW 2 */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap:
                "14px",
            }}
          >

            {/* PURCHASE */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Purchase Price
              </label>

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
                      "12px",
                    top:
                      "10px",
                    color:
                      "#64748b",
                    fontWeight:
                      "700",
                  }}
                >
                  ₹
                </span>

                <input
                  type="number"
                  name="purchase"
                  value={
                    form.purchase
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0.00"
                  style={{
                    ...inputStyle,
                    paddingLeft:
                      "28px",
                  }}
                />
              </div>
            </div>

            {/* SELLING */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Selling Price
              </label>

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
                      "12px",
                    top:
                      "10px",
                    color:
                      "#64748b",
                    fontWeight:
                      "700",
                  }}
                >
                  ₹
                </span>

                <input
                  type="number"
                  name="selling"
                  value={
                    form.selling
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0.00"
                  style={{
                    ...inputStyle,
                    paddingLeft:
                      "28px",
                  }}
                />
              </div>
            </div>

            {/* GST */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                GST %
              </label>

              <div
                style={{
                  position:
                    "relative",
                }}
              >
                <input
                  type="number"
                  name="gst"
                  value={
                    form.gst
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                  style={{
                    ...inputStyle,
                    paddingRight:
                      "30px",
                  }}
                />

                <span
                  style={{
                    position:
                      "absolute",
                    right:
                      "12px",
                    top:
                      "10px",
                    color:
                      "#64748b",
                    fontWeight:
                      "700",
                  }}
                >
                  %
                </span>
              </div>
            </div>

            {/* STOCK */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Opening Stock
              </label>

              <input
                type="number"
                name="stock"
                value={
                  form.stock
                }
                onChange={
                  handleChange
                }
                placeholder="0"
                style={
                  inputStyle
                }
              />
            </div>
          </div>
        </div>

        {/* FORM FOOTER */}

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
              "flex-end",
            gap:
              "10px",
          }}
        >
          <button
            type="button"
            onClick={
              clearForm
            }
            disabled={
              saving
            }
            style={{
              padding:
                "10px 18px",
              border:
                "1px solid #cbd5e1",
              borderRadius:
                "8px",
              background:
                "#ffffff",
              color:
                "#475569",
              cursor:
                saving
                  ? "not-allowed"
                  : "pointer",
              fontWeight:
                "700",
            }}
          >
            Clear
          </button>

          <button
            type="button"
            onClick={
              saveProduct
            }
            disabled={
              saving
            }
            style={{
              padding:
                "10px 20px",
              border:
                "none",
              borderRadius:
                "8px",
              background:
                saving
                  ? "#94a3b8"
                  : editId
                  ? "#d97706"
                  : "#2563eb",
              color:
                "white",
              cursor:
                saving
                  ? "not-allowed"
                  : "pointer",
              fontWeight:
                "800",
            }}
          >
            {saving
              ? "Saving..."
              : editId
              ? "✓ Update Product"
              : "✓ Save Product"}
          </button>
        </div>
      </div>

      {/* ==================================================
          PRODUCT REGISTER
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow:
            "hidden",
        }}
      >

        {/* REGISTER HEADER */}

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
          <div>
            <div
              style={{
                fontWeight:
                  "800",
                color:
                  "#0f172a",
              }}
            >
              Product Register
            </div>

            <div
              style={{
                marginTop:
                  "3px",
                fontSize:
                  "12px",
                color:
                  "#64748b",
              }}
            >
              {filteredProducts.length}{" "}
              product
              {filteredProducts.length ===
              1
                ? ""
                : "s"} displayed
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
              onChange={(e) =>
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
                "1100px",
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
                      "13px 12px",
                    textAlign:
                      "center",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  #
                </th>

                <th
                  style={{
                    padding:
                      "13px 12px",
                    textAlign:
                      "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  CODE
                </th>

                <th
                  style={{
                    padding:
                      "13px 12px",
                    textAlign:
                      "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  PRODUCT
                </th>

                <th
                  style={{
                    padding:
                      "13px 12px",
                    textAlign:
                      "left",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  CATEGORY
                </th>

                <th
                  style={{
                    padding:
                      "13px 12px",
                    textAlign:
                      "center",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  UNIT
                </th>

                <th
                  style={{
                    padding:
                      "13px 12px",
                    textAlign:
                      "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  PURCHASE
                </th>

                <th
                  style={{
                    padding:
                      "13px 12px",
                    textAlign:
                      "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  SELLING
                </th>

                <th
                  style={{
                    padding:
                      "13px 12px",
                    textAlign:
                      "center",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  GST
                </th>

                <th
                  style={{
                    padding:
                      "13px 12px",
                    textAlign:
                      "right",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  STOCK
                </th>

                <th
                  style={{
                    padding:
                      "13px 12px",
                    textAlign:
                      "center",
                    borderBottom:
                      "1px solid #e2e8f0",
                    color:
                      "#64748b",
                    fontSize:
                      "11px",
                    fontWeight:
                      "800",
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="10"
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
                      📦
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
                        ? "No matching products found"
                        : "No Products Found"}
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
                        : "Create your first product above."}
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
                        product.stock ||
                          0
                      );

                    const isOut =
                      stock <= 0;

                    const isLow =
                      stock > 0 &&
                      stock <= 5;

                    return (
                      <tr
                        key={
                          product.id
                        }
                        style={{
                          background:
                            editId ===
                            product.id
                              ? "#fffbeb"
                              : isOut
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

                        {/* NUMBER */}

                        <td
                          style={{
                            padding:
                              "13px 12px",
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
                          {index + 1}
                        </td>

                        {/* CODE */}

                        <td
                          style={{
                            padding:
                              "13px 12px",
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

                        {/* NAME */}

                        <td
                          style={{
                            padding:
                              "13px 12px",
                            borderBottom:
                              "1px solid #f1f5f9",
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
                            {
                              product.name
                            }
                          </div>

                          {editId ===
                            product.id && (
                            <span
                              style={{
                                display:
                                  "inline-block",
                                marginTop:
                                  "4px",
                                fontSize:
                                  "9px",
                                padding:
                                  "3px 6px",
                                borderRadius:
                                  "4px",
                                background:
                                  "#fef3c7",
                                color:
                                  "#92400e",
                                fontWeight:
                                  "800",
                              }}
                            >
                              EDITING
                            </span>
                          )}
                        </td>

                        {/* CATEGORY */}

                        <td
                          style={{
                            padding:
                              "13px 12px",
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
                              "13px 12px",
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
                              "13px 12px",
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
                              "13px 12px",
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
                              "13px 12px",
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
                              "13px 12px",
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
                                fontWeight:
                                  "900",
                                fontSize:
                                  "15px",
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
                                  "9px",
                                fontWeight:
                                  "800",
                                textTransform:
                                  "uppercase",
                                color:
                                  isOut
                                    ? "#dc2626"
                                    : isLow
                                    ? "#ea580c"
                                    : "#16a34a",
                              }}
                            >
                              {isOut
                                ? "Out"
                                : isLow
                                ? "Low"
                                : "Available"}
                            </span>
                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td
                          style={{
                            padding:
                              "13px 12px",
                            textAlign:
                              "center",
                            borderBottom:
                              "1px solid #f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "center",
                              gap:
                                "7px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                editProduct(
                                  product
                                )
                              }
                              style={{
                                padding:
                                  "7px 10px",
                                border:
                                  "1px solid #bfdbfe",
                                borderRadius:
                                  "6px",
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
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteProduct(
                                  product.id
                                )
                              }
                              style={{
                                padding:
                                  "7px 10px",
                                border:
                                  "1px solid #fecaca",
                                borderRadius:
                                  "6px",
                                background:
                                  "#fef2f2",
                                color:
                                  "#dc2626",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  "800",
                                fontSize:
                                  "12px",
                              }}
                            >
                              🗑 Delete
                            </button>
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
            gap:
              "10px",
            flexWrap:
              "wrap",
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
      </div>
    </div>
  );
}