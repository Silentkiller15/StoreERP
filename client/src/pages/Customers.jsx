import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function Customers() {
  // ==================================================
  // CUSTOMERS
  // ==================================================

  const [customers, setCustomers] =
    useState([]);

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
    mobile: "",
    email: "",
    address: "",
    gst: "",
  };

  const [form, setForm] =
    useState(emptyForm);

  // ==================================================
  // LOAD CUSTOMERS
  // ==================================================

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res =
        await axios.get(
          "https://mudhikhana.onrender.com/customers"
        );

      setCustomers(
        res.data || []
      );
    } catch (err) {
      console.log(
        "Customer Load Error:",
        err
      );

      alert(
        "Unable to load customers"
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
  // SAVE / UPDATE CUSTOMER
  // ==================================================

  const saveCustomer =
    async () => {
      if (!form.name.trim()) {
        alert(
          "Enter Customer Name"
        );
        return;
      }

      const customer = {
        ...form,

        code:
          form.code ||
          "C" +
            Date.now()
              .toString()
              .slice(-5),
      };

      try {
        setSaving(true);

        if (editId) {
          await axios.put(
            `https://mudhikhana.onrender.com/customers/${editId}`,
            customer
          );

          alert(
            "Customer Updated"
          );
        } else {
          await axios.post(
            "https://mudhikhana.onrender.com/customers",
            customer
          );

          alert(
            "Customer Saved"
          );
        }

        clearForm();

        await loadCustomers();
      } catch (err) {
        console.log(
          "Customer Save Error:",
          err
        );

        alert(
          err.response?.data?.message ||
            "Error saving customer"
        );
      } finally {
        setSaving(false);
      }
    };

  // ==================================================
  // EDIT CUSTOMER
  // ==================================================

  const editCustomer = (
    customer
  ) => {
    setEditId(
      customer.id
    );

    setForm({
      code:
        customer.code || "",
      name:
        customer.name || "",
      mobile:
        customer.mobile || "",
      email:
        customer.email || "",
      address:
        customer.address || "",
      gst:
        customer.gst || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // DELETE CUSTOMER
  // ==================================================

  const deleteCustomer =
    async (id) => {
      if (
        !window.confirm(
          "Delete this customer?"
        )
      ) {
        return;
      }

      try {
        await axios.delete(
          `https://mudhikhana.onrender.com/customers/${id}`
        );

        alert(
          "Customer Deleted"
        );

        await loadCustomers();

        if (
          editId === id
        ) {
          clearForm();
        }
      } catch (err) {
        console.log(
          "Delete Customer Error:",
          err
        );

        alert(
          err.response?.data?.message ||
            "Delete failed"
        );
      }
    };

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredCustomers =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          `${customer.code || ""} ${
            customer.name || ""
          } ${
            customer.mobile || ""
          } ${
            customer.email || ""
          } ${
            customer.address || ""
          } ${
            customer.gst || ""
          }`
            .toLowerCase()
            .includes(keyword)
      );
    }, [
      customers,
      search,
    ]);

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalCustomers =
    customers.length;

  const customersWithMobile =
    customers.filter(
      (customer) =>
        String(
          customer.mobile || ""
        ).trim() !== ""
    ).length;

  const customersWithGST =
    customers.filter(
      (customer) =>
        String(
          customer.gst || ""
        ).trim() !== ""
    ).length;

  const customersWithEmail =
    customers.filter(
      (customer) =>
        String(
          customer.email || ""
        ).trim() !== ""
    ).length;

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
          gap:
            "20px",
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
            Masters
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
            👥 Customer Master
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
            Manage customer
            details, contact
            information and GST
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
          ＋ New Customer
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

        {/* TOTAL CUSTOMERS */}

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
            Total Customers
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
            {totalCustomers}
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
            Customers in master
          </div>
        </div>

        {/* MOBILE */}

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
            Mobile Available
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
            {customersWithMobile}
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
            Contact numbers
          </div>
        </div>

        {/* EMAIL */}

        <div
          style={{
            ...cardStyle,
            padding:
              "18px",
            background:
              "#f0fdf4",
            border:
              "1px solid #bbf7d0",
          }}
        >
          <div
            style={{
              fontSize:
                "11px",
              color:
                "#15803d",
              fontWeight:
                "800",
              textTransform:
                "uppercase",
              marginBottom:
                "8px",
            }}
          >
            Email Available
          </div>

          <div
            style={{
              fontSize:
                "25px",
              fontWeight:
                "900",
              color:
                "#15803d",
            }}
          >
            {customersWithEmail}
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "12px",
              color:
                "#16a34a",
            }}
          >
            Email addresses
          </div>
        </div>

        {/* GST */}

        <div
          style={{
            ...cardStyle,
            padding:
              "18px",
            background:
              "#faf5ff",
            border:
              "1px solid #e9d5ff",
          }}
        >
          <div
            style={{
              fontSize:
                "11px",
              color:
                "#7e22ce",
              fontWeight:
                "800",
              textTransform:
                "uppercase",
              marginBottom:
                "8px",
            }}
          >
            GST Available
          </div>

          <div
            style={{
              fontSize:
                "25px",
              fontWeight:
                "900",
              color:
                "#7e22ce",
            }}
          >
            {customersWithGST}
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "12px",
              color:
                "#9333ea",
            }}
          >
            GST registrations
          </div>
        </div>
      </div>

      {/* ==================================================
          CUSTOMER FORM
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
                : "👤"}
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
                  ? "Edit Customer"
                  : "Add Customer"}
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
                  ? "Update customer details"
                  : "Create a new customer"}
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
                "1fr 2fr 1.3fr 1fr",
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
                Customer Code
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
                Customer Name *
              </label>

              <input
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter customer name"
                style={
                  inputStyle
                }
              />
            </div>

            {/* MOBILE */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Mobile
              </label>

              <input
                name="mobile"
                value={
                  form.mobile
                }
                onChange={
                  handleChange
                }
                placeholder="Mobile number"
                style={
                  inputStyle
                }
              />
            </div>

            {/* GST */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                GST Number
              </label>

              <input
                name="gst"
                value={
                  form.gst
                }
                onChange={
                  handleChange
                }
                placeholder="GSTIN"
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
                "1fr 2fr",
              gap:
                "14px",
            }}
          >

            {/* EMAIL */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                placeholder="customer@example.com"
                style={
                  inputStyle
                }
              />
            </div>

            {/* ADDRESS */}

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Address
              </label>

              <textarea
                name="address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                placeholder="Customer address"
                rows="3"
                style={{
                  ...inputStyle,
                  resize:
                    "vertical",
                  fontFamily:
                    "inherit",
                }}
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
              saveCustomer
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
              ? "✓ Update Customer"
              : "✓ Save Customer"}
          </button>
        </div>
      </div>

      {/* ==================================================
          CUSTOMER REGISTER
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
              Customer Register
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
              {
                filteredCustomers.length
              }{" "}
              customer
              {filteredCustomers.length ===
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
                "380px",
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
              placeholder="Search code, name, mobile, email..."
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
                  style={
                    thStyle
                  }
                >
                  #
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  CODE
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  CUSTOMER
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  MOBILE
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  EMAIL
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  ADDRESS
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign:
                      "center",
                  }}
                >
                  GST
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign:
                      "center",
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="8"
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
                      👥
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
                        ? "No matching customers found"
                        : "No Customers Found"}
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
                        : "Create your first customer above."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(
                  (
                    customer,
                    index
                  ) => (
                    <tr
                      key={
                        customer.id
                      }
                      style={{
                        background:
                          editId ===
                          customer.id
                            ? "#fffbeb"
                            : index %
                                  2 ===
                                0
                            ? "#ffffff"
                            : "#fafafa",
                      }}
                    >

                      {/* NUMBER */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <span
                          style={{
                            color:
                              "#94a3b8",
                            fontWeight:
                              "700",
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>

                      {/* CODE */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <span
                          style={{
                            color:
                              "#2563eb",
                            fontWeight:
                              "800",
                          }}
                        >
                          {customer.code ||
                            "—"}
                        </span>
                      </td>

                      {/* CUSTOMER */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "9px",
                          }}
                        >
                          <div
                            style={{
                              width:
                                "34px",
                              height:
                                "34px",
                              borderRadius:
                                "50%",
                              background:
                                "#dbeafe",
                              color:
                                "#1d4ed8",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontWeight:
                                "900",
                              flexShrink:
                                0,
                            }}
                          >
                            {String(
                              customer.name ||
                                "?"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
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
                              {
                                customer.name
                              }
                            </div>

                            {editId ===
                              customer.id && (
                              <span
                                style={{
                                  display:
                                    "inline-block",
                                  marginTop:
                                    "3px",
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
                          </div>
                        </div>
                      </td>

                      {/* MOBILE */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {customer.mobile ? (
                          <span
                            style={{
                              color:
                                "#334155",
                            }}
                          >
                            📞{" "}
                            {
                              customer.mobile
                            }
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                "#94a3b8",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* EMAIL */}

                      <td
                        style={{
                          ...tdStyle,
                          maxWidth:
                            "220px",
                        }}
                      >
                        {customer.email ? (
                          <span
                            style={{
                              color:
                                "#475569",
                            }}
                          >
                            {
                              customer.email
                            }
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                "#94a3b8",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* ADDRESS */}

                      <td
                        style={{
                          ...tdStyle,
                          maxWidth:
                            "240px",
                          whiteSpace:
                            "normal",
                        }}
                      >
                        {customer.address ? (
                          <span
                            style={{
                              color:
                                "#475569",
                            }}
                          >
                            {
                              customer.address
                            }
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                "#94a3b8",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* GST */}

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "center",
                        }}
                      >
                        {customer.gst ? (
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "5px 8px",
                              borderRadius:
                                "5px",
                              background:
                                "#faf5ff",
                              color:
                                "#7e22ce",
                              fontSize:
                                "11px",
                              fontWeight:
                                "800",
                            }}
                          >
                            {
                              customer.gst
                            }
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                "#94a3b8",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}

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
                            gap:
                              "7px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              editCustomer(
                                customer
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
                              deleteCustomer(
                                customer.id
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
                  )
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
                filteredCustomers.length
              }
            </b>{" "}
            of{" "}
            <b
              style={{
                color:
                  "#334155",
              }}
            >
              {customers.length}
            </b>{" "}
            customers
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

// ==================================================
// TABLE STYLES
// ==================================================

const thStyle = {
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
  whiteSpace:
    "nowrap",
};

const tdStyle = {
  padding:
    "13px 12px",
  borderBottom:
    "1px solid #f1f5f9",
  fontSize:
    "13px",
  color:
    "#475569",
  whiteSpace:
    "nowrap",
};