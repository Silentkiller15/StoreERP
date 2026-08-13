import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ==================================================
// NUMBER TO WORDS
// ==================================================

const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convert = (n) => {
    if (n < 20) {
      return ones[n];
    }

    if (n < 100) {
      return (
        tens[Math.floor(n / 10)] +
        (n % 10
          ? " " + ones[n % 10]
          : "")
      );
    }

    if (n < 1000) {
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100
          ? " " + convert(n % 100)
          : "")
      );
    }

    if (n < 100000) {
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000
          ? " " + convert(n % 1000)
          : "")
      );
    }

    return n.toString();
  };

  return convert(
    Math.floor(Number(num) || 0)
  );
};

// ==================================================
// SALES REGISTER
// ==================================================

export default function SalesRegister({
  setPage,
  setEditingSaleId,
}) {
  // ==================================================
  // SALES
  // ==================================================

  const [sales, setSales] =
    useState([]);

  // ==================================================
  // DELETE MODE
  // ==================================================

  const [deleteMode, setDeleteMode] =
    useState(false);

  const [selectedSales, setSelectedSales] =
    useState([]);

  const [deleting, setDeleting] =
    useState(false);

  // ==================================================
  // SEARCH
  // ==================================================

  const [search, setSearch] =
    useState("");

  // ==================================================
  // LOAD SALES
  // ==================================================

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const res =
        await axios.get(
          "http://localhost:5000/sales"
        );

      setSales(res.data || []);
    } catch (err) {
      console.log(err);
      alert(
        "Unable to load sales"
      );
    }
  };

  // ==================================================
  // SELECT / UNSELECT SALE
  // ==================================================

  const toggleSaleSelection = (
    id
  ) => {
    setSelectedSales((prev) => {
      if (prev.includes(id)) {
        return prev.filter(
          (saleId) =>
            saleId !== id
        );
      }

      return [...prev, id];
    });
  };

  // ==================================================
  // SELECT ALL
  // ==================================================

  const toggleSelectAll = () => {
    if (
      selectedSales.length ===
      filteredSales.length
    ) {
      setSelectedSales([]);
    } else {
      setSelectedSales(
        filteredSales.map(
          (sale) => sale.id
        )
      );
    }
  };

  // ==================================================
  // DELETE SELECTED SALES
  // ==================================================

  const deleteSelectedSales =
    async () => {
      if (
        selectedSales.length === 0
      ) {
        alert(
          "Please select at least one sale"
        );
        return;
      }

      const message =
        selectedSales.length === 1
          ? "Are you sure you want to delete this sale?"
          : `Are you sure you want to delete ${selectedSales.length} sales?`;

      const ok =
        window.confirm(message);

      if (!ok) return;

      try {
        setDeleting(true);

        await Promise.all(
          selectedSales.map(
            (id) =>
              axios.delete(
                `http://localhost:5000/sales/${id}`
              )
          )
        );

        alert(
          selectedSales.length === 1
            ? "Sale Deleted Successfully"
            : `${selectedSales.length} Sales Deleted Successfully`
        );

        setSelectedSales([]);
        setDeleteMode(false);

        await loadSales();
      } catch (err) {
        console.log(err);

        alert(
          "Unable to delete selected sales"
        );
      } finally {
        setDeleting(false);
      }
    };

  // ==================================================
  // SEARCH / FILTER
  // ==================================================

  const filteredSales = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return sales;
    }

    return sales.filter(
      (sale) =>
        String(
          sale.saleNo || ""
        )
          .toLowerCase()
          .includes(keyword) ||
        String(
          sale.customerName || ""
        )
          .toLowerCase()
          .includes(keyword) ||
        String(
          sale.saleDate || ""
        )
          .toLowerCase()
          .includes(keyword)
    );
  }, [sales, search]);

  // ==================================================
  // TOTALS
  // ==================================================

  const totalSales =
    filteredSales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.total || 0
        ),
      0
    );

  const totalGST =
    filteredSales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.gst || 0
        ),
      0
    );

  const totalGrand =
    filteredSales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.grandTotal || 0
        ),
      0
    );

  // ==================================================
  // PRINT INVOICE
  // ==================================================

  const printInvoice = async (
    sale
  ) => {
    try {
      const res =
        await axios.get(
          `http://localhost:5000/sales/${sale.id}`
        );

      const invoice =
        res.data;

      const companyRes =
        await axios.get(
          "http://localhost:5000/company"
        );

      const company =
        companyRes.data;

      const doc =
        new jsPDF();

      // ==================================================
      // COMPANY LOGO
      // ==================================================

      if (company.logo) {
        try {
          const logo =
            new Image();

          logo.src =
            company.logo;

          await new Promise(
            (resolve) => {
              logo.onload =
                resolve;

              logo.onerror =
                resolve;
            }
          );

          if (
            logo.complete &&
            logo.naturalWidth > 0
          ) {
            doc.addImage(
              logo,
              "WEBP",
              90,
              8,
              30,
              30
            );
          }
        } catch (
          logoError
        ) {
          console.log(
            "Logo error:",
            logoError
          );
        }
      }

      // ==================================================
      // COMPANY NAME
      // ==================================================

      doc.setFontSize(20);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        company.name ||
          "ABC STORE ERP",
        105,
        48,
        {
          align: "center",
        }
      );

      // ==================================================
      // COMPANY ADDRESS
      // ==================================================

      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        company.address ||
          "",
        105,
        55,
        {
          align: "center",
        }
      );

      // ==================================================
      // PHONE
      // ==================================================

      if (company.phone) {
        doc.text(
          `Phone : ${company.phone}`,
          105,
          62,
          {
            align: "center",
          }
        );
      }

      // ==================================================
      // EMAIL
      // ==================================================

      if (company.email) {
        doc.text(
          `Email : ${company.email}`,
          105,
          69,
          {
            align: "center",
          }
        );
      }

      // ==================================================
      // GSTIN
      // ==================================================

      if (company.gstin) {
        doc.text(
          `GSTIN : ${company.gstin}`,
          105,
          76,
          {
            align: "center",
          }
        );
      }

      // ==================================================
      // INVOICE TITLE
      // ==================================================

      doc.setFontSize(16);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "TAX INVOICE",
        105,
        86,
        {
          align: "center",
        }
      );

      doc.line(
        15,
        91,
        195,
        91
      );

      // ==================================================
      // INVOICE DETAILS
      // ==================================================

      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        `Invoice No : ${
          invoice.saleNo || ""
        }`,
        15,
        102
      );

      doc.text(
        `Date : ${
          invoice.saleDate || ""
        }`,
        145,
        102
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      // ==================================================
      // BILL TO
      // ==================================================

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "BILL TO",
        15,
        113
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Customer : ${
          invoice.customerName ||
          ""
        }`,
        15,
        120
      );

      doc.text(
        `Mobile : ${
          invoice.customerMobile ||
          ""
        }`,
        15,
        127
      );

      doc.text(
        `Address : ${
          invoice.customerAddress ||
          ""
        }`,
        15,
        134
      );

      // ==================================================
      // PRODUCT TABLE
      // ==================================================

      const rows =
        (invoice.items || []).map(
          (item) => [
            item.productName ||
              "",
            Number(
              item.qty
            ),
            Number(
              item.rate
            ).toFixed(2),
            Number(
              item.total
            ).toFixed(2),
          ]
        );

      autoTable(doc, {
        startY: 142,

        head: [
          [
            "Product",
            "Qty",
            "Rate",
            "Total",
          ],
        ],

        body: rows,

        theme: "grid",

        headStyles: {
          fontStyle:
            "bold",

          halign:
            "center",
        },

        columnStyles: {
          0: {
            halign:
              "left",
          },

          1: {
            halign:
              "center",
          },

          2: {
            halign:
              "right",
          },

          3: {
            halign:
              "right",
          },
        },

        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
      });

      // ==================================================
      // TOTALS
      // ==================================================

      const y =
        doc.lastAutoTable
          .finalY + 10;

      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Sub Total : Rs. ${Number(
          invoice.total || 0
        ).toFixed(2)}`,
        130,
        y
      );

      // ==================================================
      // GRAND TOTAL
      // ==================================================

      doc.setFontSize(14);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        `Grand Total : Rs. ${Number(
          invoice.grandTotal ||
            0
        ).toFixed(2)}`,
        130,
        y + 12
      );

      doc.line(
        125,
        y + 15,
        195,
        y + 15
      );

      // ==================================================
      // AMOUNT IN WORDS
      // ==================================================

      const amountWords =
        numberToWords(
          invoice.grandTotal ||
            0
        );

      doc.setFontSize(10);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Amount in Words : Rupees ${amountWords} Only`,
        15,
        y + 30
      );

      // ==================================================
      // SIGNATURES
      // ==================================================

      doc.line(
        15,
        y + 50,
        80,
        y + 50
      );

      doc.text(
        "Customer Signature",
        15,
        y + 57
      );

      doc.line(
        130,
        y + 50,
        195,
        y + 50
      );

      doc.text(
        "Authorized Signature",
        130,
        y + 57
      );

      // ==================================================
      // THANK YOU
      // ==================================================

      doc.setFontSize(10);

      doc.text(
        "Thank you for your business!",
        105,
        y + 75,
        {
          align: "center",
        }
      );

      // ==================================================
      // SAVE PDF
      // ==================================================

      doc.save(
        `${
          invoice.saleNo ||
          "Invoice"
        }.pdf`
      );
    } catch (err) {
      console.log(err);

      alert(
        "Unable to print invoice"
      );
    }
  };

  // ==================================================
  // EXIT DELETE MODE
  // ==================================================

  const cancelDeleteMode = () => {
    setDeleteMode(false);
    setSelectedSales([]);
  };

  // ==================================================
  // STYLES
  // ==================================================

  const cardStyle = {
    background:
      "#ffffff",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      "12px",

    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.06)",
  };

  const moneyStyle = {
    fontSize:
      "22px",

    fontWeight:
      "900",

    color:
      "#0f172a",
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
            Sales
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
            📋 Sales Register
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
            View, search,
            print and manage
            sales invoices
          </div>
        </div>

        <button
          onClick={() => {
            setEditingSaleId(
              null
            );

            setPage(
              "sales"
            );
          }}
          style={{
            border:
              "none",

            background:
              "#2563eb",

            color:
              "white",

            padding:
              "12px 18px",

            borderRadius:
              "8px",

            cursor:
              "pointer",

            fontWeight:
              "800",

            fontSize:
              "14px",
          }}
        >
          + New Sale
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

        {/* INVOICES */}

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
                "12px",

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
            Invoices
          </div>

          <div
            style={
              moneyStyle
            }
          >
            {filteredSales.length}
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
            Sales records
          </div>
        </div>

        {/* TAXABLE */}

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
                "12px",

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
            Taxable Value
          </div>

          <div
            style={
              moneyStyle
            }
          >
            ₹{" "}
            {totalSales.toFixed(
              2
            )}
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
            Before GST
          </div>
        </div>

        {/* GST */}

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
                "12px",

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
            Total GST
          </div>

          <div
            style={
              moneyStyle
            }
          >
            ₹{" "}
            {totalGST.toFixed(
              2
            )}
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
            Tax collected
          </div>
        </div>

        {/* GRAND TOTAL */}

        <div
          style={{
            ...cardStyle,

            padding:
              "18px",

            border:
              "1px solid #bfdbfe",

            background:
              "#eff6ff",
          }}
        >
          <div
            style={{
              fontSize:
                "12px",

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
            Grand Total
          </div>

          <div
            style={{
              ...moneyStyle,

              color:
                "#1d4ed8",
            }}
          >
            ₹{" "}
            {totalGrand.toFixed(
              2
            )}
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
            Invoice value
          </div>
        </div>

      </div>

      {/* ==================================================
          REGISTER CARD
      ================================================== */}

      <div
        style={{
          ...cardStyle,

          overflow:
            "hidden",
        }}
      >

        {/* ==================================================
            TOOLBAR
        ================================================== */}

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
              "14px",

            flexWrap:
              "wrap",
          }}
        >

          {/* SEARCH */}

          <div
            style={{
              flex:
                "1 1 300px",

              maxWidth:
                "450px",

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
              placeholder="Search sale no, customer or date..."
              style={{
                width:
                  "100%",

                padding:
                  "10px 12px 10px 38px",

                border:
                  "1px solid #cbd5e1",

                borderRadius:
                  "8px",

                outline:
                  "none",

                boxSizing:
                  "border-box",

                fontSize:
                  "14px",
              }}
            />
          </div>

          {/* ACTIONS */}

          <div
            style={{
              display:
                "flex",

              gap:
                "8px",

              alignItems:
                "center",
            }}
          >

            {!deleteMode ? (
              <button
                onClick={() =>
                  setDeleteMode(
                    true
                  )
                }
                style={{
                  background:
                    "#fee2e2",

                  color:
                    "#dc2626",

                  border:
                    "1px solid #fecaca",

                  padding:
                    "10px 15px",

                  borderRadius:
                    "7px",

                  cursor:
                    "pointer",

                  fontWeight:
                    "800",
                }}
              >
                🗑 Delete
              </button>
            ) : (
              <>
                <button
                  onClick={
                    deleteSelectedSales
                  }
                  disabled={
                    selectedSales.length ===
                      0 ||
                    deleting
                  }
                  style={{
                    background:
                      selectedSales.length >
                        0 &&
                      !deleting
                        ? "#dc2626"
                        : "#cbd5e1",

                    color:
                      selectedSales.length >
                        0 &&
                      !deleting
                        ? "white"
                        : "#64748b",

                    border:
                      "none",

                    padding:
                      "10px 15px",

                    borderRadius:
                      "7px",

                    cursor:
                      selectedSales.length >
                        0 &&
                      !deleting
                        ? "pointer"
                        : "not-allowed",

                    fontWeight:
                      "800",
                  }}
                >
                  {deleting
                    ? "Deleting..."
                    : "🗑 Delete Selected"}

                  {selectedSales.length >
                    0 &&
                    !deleting &&
                    ` (${selectedSales.length})`}
                </button>

                <button
                  onClick={
                    cancelDeleteMode
                  }
                  style={{
                    background:
                      "#f1f5f9",

                    color:
                      "#475569",

                    border:
                      "1px solid #cbd5e1",

                    padding:
                      "10px 15px",

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
              </>
            )}
          </div>
        </div>

        {/* ==================================================
            DELETE MODE BAR
        ================================================== */}

        {deleteMode && (
          <div
            style={{
              padding:
                "10px 20px",

              background:
                "#fff7ed",

              borderBottom:
                "1px solid #fed7aa",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              fontSize:
                "13px",

              color:
                "#9a3412",
            }}
          >
            <span>
              Select the invoices
              you want to delete.
            </span>

            {filteredSales.length >
              0 && (
              <label
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "7px",

                  cursor:
                    "pointer",

                  fontWeight:
                    "700",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedSales.length ===
                      filteredSales.length &&
                    filteredSales.length >
                      0
                  }
                  onChange={
                    toggleSelectAll
                  }
                />

                Select All
              </label>
            )}
          </div>
        )}

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

                {deleteMode && (
                  <th
                    style={{
                      width:
                        "55px",

                      padding:
                        "13px 10px",

                      borderBottom:
                        "1px solid #e2e8f0",
                    }}
                  >
                    ✓
                  </th>
                )}

                <th
                  style={{
                    padding:
                      "13px 15px",

                    textAlign:
                      "left",

                    borderBottom:
                      "1px solid #e2e8f0",

                    fontSize:
                      "11px",

                    color:
                      "#64748b",

                    fontWeight:
                      "800",
                  }}
                >
                  SALE NO
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",

                    textAlign:
                      "left",

                    borderBottom:
                      "1px solid #e2e8f0",

                    fontSize:
                      "11px",

                    color:
                      "#64748b",

                    fontWeight:
                      "800",
                  }}
                >
                  DATE
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",

                    textAlign:
                      "left",

                    borderBottom:
                      "1px solid #e2e8f0",

                    fontSize:
                      "11px",

                    color:
                      "#64748b",

                    fontWeight:
                      "800",
                  }}
                >
                  CUSTOMER
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",

                    textAlign:
                      "right",

                    borderBottom:
                      "1px solid #e2e8f0",

                    fontSize:
                      "11px",

                    color:
                      "#64748b",

                    fontWeight:
                      "800",
                  }}
                >
                  TAXABLE
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",

                    textAlign:
                      "right",

                    borderBottom:
                      "1px solid #e2e8f0",

                    fontSize:
                      "11px",

                    color:
                      "#64748b",

                    fontWeight:
                      "800",
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

                    fontSize:
                      "11px",

                    color:
                      "#64748b",

                    fontWeight:
                      "800",
                  }}
                >
                  GRAND TOTAL
                </th>

                <th
                  style={{
                    padding:
                      "13px 15px",

                    textAlign:
                      "center",

                    borderBottom:
                      "1px solid #e2e8f0",

                    fontSize:
                      "11px",

                    color:
                      "#64748b",

                    fontWeight:
                      "800",
                  }}
                >
                  ACTIONS
                </th>

              </tr>
            </thead>

            <tbody>

              {/* ==================================================
                  EMPTY
              ================================================== */}

              {filteredSales.length ===
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
                      🧾
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
                        ? "No matching sales found"
                        : "No Sales Found"}
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
                        : "Sales invoices will appear here."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map(
                  (
                    sale,
                    index
                  ) => {
                    const selected =
                      selectedSales.includes(
                        sale.id
                      );

                    return (
                      <tr
                        key={
                          sale.id
                        }
                        style={{
                          background:
                            selected
                              ? "#fff1f2"
                              : index %
                                  2 ===
                                0
                              ? "#ffffff"
                              : "#fafafa",
                        }}
                      >

                        {/* CHECKBOX */}

                        {deleteMode && (
                          <td
                            style={{
                              textAlign:
                                "center",

                              padding:
                                "12px 10px",

                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                selected
                              }
                              onChange={() =>
                                toggleSaleSelection(
                                  sale.id
                                )
                              }
                              style={{
                                width:
                                  "16px",

                                height:
                                  "16px",

                                cursor:
                                  "pointer",
                              }}
                            />
                          </td>
                        )}

                        {/* SALE NO */}

                        <td
                          style={{
                            padding:
                              "13px 15px",

                            borderBottom:
                              "1px solid #f1f5f9",

                            fontWeight:
                              "800",

                            color:
                              "#2563eb",
                          }}
                        >
                          {sale.saleNo}
                        </td>

                        {/* DATE */}

                        <td
                          style={{
                            padding:
                              "13px 15px",

                            borderBottom:
                              "1px solid #f1f5f9",

                            color:
                              "#475569",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {sale.saleDate}
                        </td>

                        {/* CUSTOMER */}

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
                                  "32px",

                                height:
                                  "32px",

                                borderRadius:
                                  "50%",

                                background:
                                  "#dbeafe",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                fontSize:
                                  "14px",
                              }}
                            >
                              👤
                            </div>

                            <span>
                              {sale.customerName ||
                                "Cash Customer"}
                            </span>
                          </div>
                        </td>

                        {/* TAXABLE */}

                        <td
                          style={{
                            padding:
                              "13px 15px",

                            textAlign:
                              "right",

                            borderBottom:
                              "1px solid #f1f5f9",

                            color:
                              "#334155",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          ₹{" "}
                          {Number(
                            sale.total ||
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
                              "right",

                            borderBottom:
                              "1px solid #f1f5f9",

                            color:
                              "#64748b",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          ₹{" "}
                          {Number(
                            sale.gst ||
                              0
                          ).toFixed(
                            2
                          )}
                        </td>

                        {/* GRAND TOTAL */}

                        <td
                          style={{
                            padding:
                              "13px 15px",

                            textAlign:
                              "right",

                            borderBottom:
                              "1px solid #f1f5f9",

                            fontWeight:
                              "900",

                            color:
                              "#0f172a",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          ₹{" "}
                          {Number(
                            sale.grandTotal ||
                              0
                          ).toFixed(
                            2
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td
                          style={{
                            padding:
                              "10px 12px",

                            textAlign:
                              "center",

                            borderBottom:
                              "1px solid #f1f5f9",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",

                              justifyContent:
                                "center",

                              gap:
                                "6px",
                            }}
                          >

                            {/* PRINT */}

                            <button
                              onClick={() =>
                                printInvoice(
                                  sale
                                )
                              }
                              title="Print invoice"
                              style={{
                                border:
                                  "1px solid #bfdbfe",

                                background:
                                  "#eff6ff",

                                color:
                                  "#1d4ed8",

                                padding:
                                  "8px 10px",

                                borderRadius:
                                  "7px",

                                cursor:
                                  "pointer",

                                fontWeight:
                                  "700",
                              }}
                            >
                              🖨
                            </button>

                            {/* EDIT */}

                            <button
                              onClick={() => {
                                setEditingSaleId(
                                  sale.id
                                );

                                setPage(
                                  "sales"
                                );
                              }}
                              title="Edit sale"
                              style={{
                                border:
                                  "1px solid #bbf7d0",

                                background:
                                  "#f0fdf4",

                                color:
                                  "#15803d",

                                padding:
                                  "8px 10px",

                                borderRadius:
                                  "7px",

                                cursor:
                                  "pointer",

                                fontWeight:
                                  "700",
                              }}
                            >
                              ✏️
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

            {/* ==================================================
                FOOTER TOTAL
            ================================================== */}

            {filteredSales.length >
              0 && (
              <tfoot>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                  }}
                >

                  {deleteMode && (
                    <td />
                  )}

                  <td
                    colSpan={
                      3
                    }
                    style={{
                      padding:
                        "15px",

                      borderTop:
                        "2px solid #cbd5e1",

                      fontWeight:
                        "900",

                      color:
                        "#0f172a",
                    }}
                  >
                    TOTAL
                  </td>

                  <td
                    style={{
                      padding:
                        "15px",

                      textAlign:
                        "right",

                      borderTop:
                        "2px solid #cbd5e1",

                      fontWeight:
                        "900",
                    }}
                  >
                    ₹{" "}
                    {totalSales.toFixed(
                      2
                    )}
                  </td>

                  <td
                    style={{
                      padding:
                        "15px",

                      textAlign:
                        "right",

                      borderTop:
                        "2px solid #cbd5e1",

                      fontWeight:
                        "900",
                    }}
                  >
                    ₹{" "}
                    {totalGST.toFixed(
                      2
                    )}
                  </td>

                  <td
                    style={{
                      padding:
                        "15px",

                      textAlign:
                        "right",

                      borderTop:
                        "2px solid #cbd5e1",

                      fontWeight:
                        "900",

                      color:
                        "#2563eb",
                    }}
                  >
                    ₹{" "}
                    {totalGrand.toFixed(
                      2
                    )}
                  </td>

                  <td
                    style={{
                      borderTop:
                        "2px solid #cbd5e1",
                    }}
                  />

                </tr>
              </tfoot>
            )}

          </table>
        </div>

        {/* ==================================================
            REGISTER FOOTER
        ================================================== */}

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
              {filteredSales.length}
            </b>{" "}
            of{" "}
            <b
              style={{
                color:
                  "#334155",
              }}
            >
              {sales.length}
            </b>{" "}
            sales
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