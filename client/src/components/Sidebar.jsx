import { useState } from "react";

export default function Sidebar({
  page,
  setPage,
  setEditingSaleId,
  setEditingPurchaseId,
  setInvoiceSaleId,
  companyName = "Your Company",

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  currentUser,
  onLogout,
}) {
  const [openSection, setOpenSection] =
    useState("sales");

  const sections = [
    {
  id: "inventory",
  name: "📦 Inventory",
  items: [
    {
      id: "products",
      name: "Products",
    },
    {
      id: "opening-stock",
      name: "Opening Stock",
    },
    {
      id: "stock",
      name: "Stock Register",
    },
    {
      id: "stock-ledger",
      name: "Stock Ledger",
    },
  ],
},

    {
      id: "sales",
      name: "🛒 Sales",
      items: [
        {
          id: "sales",
          name: "Sales",
        },
        {
          id: "sales-register",
          name: "Sales Register",
        },
        {
          id: "sales-report",
          name: "Sales Report",
        },
      ],
    },

    {
      id: "purchases",
      name: "📥 Purchases",
      items: [
        {
          id: "purchases",
          name: "Purchases",
        },
        {
          id: "purchase-register",
          name: "Purchase Register",
        },
        {
          id: "purchase-report",
          name: "Purchase Report",
        },
      ],
    },

    {
      id: "parties",
      name: "👥 Customers & Suppliers",
      items: [
        {
          id: "customers",
          name: "Customers",
        },
        {
          id: "customer-ledger",
          name: "Customer Ledger",
        },
        {
          id: "print-customer-ledger",
          name: "Print Customer Ledger",
        },
        {
          id: "customer-outstanding",
          name: "Customer Outstanding",
        },
        {
          id: "suppliers",
          name: "Suppliers",
        },
        {
          id: "supplier-ledger",
          name: "Supplier Ledger",
        },
        {
          id: "print-supplier-ledger",
          name: "Print Supplier Ledger",
        },
        {
          id: "supplier-outstanding",
          name: "Supplier Outstanding",
        },
        {
          id: "outstanding",
          name: "Outstanding",
        },
        {
          id: "print-outstanding",
          name: "Print Outstanding",
        },
      ],
    },

    {
      id: "accounts",
      name: "📒 Accounts",
      items: [
        {
          id: "accounts",
          name: "Account Master",
        },
        {
          id: "ledger",
          name: "Ledger",
        },
        {
          id: "voucher",
          name: "Voucher Register",
        },
        {
          id: "voucher-detail",
          name: "Voucher Detail",
        },
        {
          id: "payment-allocation",
          name: "Payment Allocation",
        },
        {
          id: "cash-bank-book",
          name: "Cash / Bank Book",
        },
        {
          id: "receipt-payment-history",
          name: "Receipt & Payment History",
        },
      ],
    },

    {
      id: "reports",
      name: "📊 Reports",
      items: [
        {
          id: "profit",
          name: "Profit & Loss",
        },
        {
          id: "balance",
          name: "Balance Sheet",
        },
        {
          id: "trial-balance",
          name: "Trial Balance",
        },
        {
          id: "day-book",
          name: "Day Book",
        },
        {
          id: "accounting-reconciliation",
          name: "Accounting Reconciliation",
        },
      ],
    },

    {
      id: "printing",
      name: "🖨️ Printing",
      items: [
        {
          id: "print-voucher",
          name: "Print Voucher",
        },
        {
          id: "print-trial-balance",
          name: "Print Trial Balance",
        },
        {
          id: "print-day-book",
          name: "Print Day Book",
        },
      ],
    },

    {
      id: "company",
      name: "🏢 Company",
      items: [
        {
          id: "company",
          name: "Company Settings",
        },
        {
          id: "settings",
          name: "Settings",
        },
      ],
    },
  ];

  const handleSection = (
    sectionId
  ) => {
    setOpenSection(
      openSection === sectionId
        ? null
        : sectionId
    );
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogoutClick = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmed) {
      return;
    }

    if (onLogout) {
      onLogout();
    }
  };

  // ==================================================
  // USER DISPLAY NAME
  // ==================================================

  const userName =
    currentUser?.name ||
    currentUser?.username ||
    "User";

  const userRole =
    currentUser?.role ||
    "User";

  // ==================================================
  // UI
  // ==================================================

  return (
    <div
      className="sidebar"
      style={{
        width: "250px",
        minWidth: "250px",
        height: "100vh",
        background:
          "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        padding: "16px 12px",
        boxSizing: "border-box",
        overflowY: "auto",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* =====================================
          LOGO / COMPANY NAME
      ===================================== */}

      <div
        style={{
          padding:
            "8px 8px 16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            marginBottom: "4px",
          }}
        >
          🏪
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: "800",
            letterSpacing: "0.5px",
            wordBreak: "break-word",
          }}
        >
          {companyName}
        </div>

        <div
          style={{
            fontSize: "10px",
            color: "#94a3b8",
            marginTop: "3px",
          }}
        >
          BUSINESS MANAGEMENT
        </div>
      </div>

      {/* =====================================
          CURRENT USER
      ===================================== */}

      <div
        style={{
          background:
            "rgba(255,255,255,0.08)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius: "9px",
          padding: "10px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "15px",
              flexShrink: 0,
            }}
          >
            {userName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                overflow: "hidden",
                textOverflow:
                  "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                marginTop: "2px",
              }}
            >
              {userRole}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          height: "1px",
          background: "#334155",
          marginBottom: "12px",
        }}
      />

      {/* =====================================
          DASHBOARD
      ===================================== */}

      <div
        onClick={() =>
          setPage("dashboard")
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "11px 12px",
          marginBottom: "8px",
          cursor: "pointer",
          borderRadius: "9px",
          background:
            page === "dashboard"
              ? "#2563eb"
              : "transparent",
          fontWeight:
            page === "dashboard"
              ? "700"
              : "500",
          transition:
            "all 0.2s ease",
        }}
      >
        🏠
        <span>
          Dashboard
        </span>
      </div>

      {/* =====================================
          SECTIONS
      ===================================== */}

      <div
        style={{
          flex: 1,
        }}
      >
        {sections.map(
          (section) => {
            const isOpen =
              openSection ===
              section.id;

            const hasActivePage =
              section.items.some(
                (item) =>
                  item.id === page
              );

            return (
              <div
                key={section.id}
                style={{
                  marginBottom: "5px",
                }}
              >
                {/* SECTION HEADER */}

                <div
                  onClick={() =>
                    handleSection(
                      section.id
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    padding:
                      "10px 12px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    background:
                      hasActivePage &&
                      !isOpen
                        ? "#334155"
                        : "transparent",
                    color:
                      hasActivePage
                        ? "#ffffff"
                        : "#cbd5e1",
                    fontWeight: "700",
                    fontSize: "13px",
                    transition:
                      "all 0.2s ease",
                  }}
                >
                  <span>
                    {section.name}
                  </span>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                    }}
                  >
                    {isOpen
                      ? "▼"
                      : "▶"}
                  </span>
                </div>

                {/* SECTION ITEMS */}

                {isOpen && (
                  <div
                    style={{
                      marginTop: "3px",
                      marginBottom: "5px",
                    }}
                  >
                    {section.items.map(
                      (item) => (
                        <div
                          key={item.id}
                          onClick={() =>
                            setPage(
                              item.id
                            )
                          }
                          style={{
                            padding:
                              "8px 10px 8px 30px",
                            margin:
                              "2px 0",
                            cursor:
                              "pointer",
                            borderRadius:
                              "7px",
                            fontSize:
                              "13px",
                            color:
                              page ===
                              item.id
                                ? "#ffffff"
                                : "#cbd5e1",
                            background:
                              page ===
                              item.id
                                ? "#2563eb"
                                : "transparent",
                            fontWeight:
                              page ===
                              item.id
                                ? "700"
                                : "400",
                            transition:
                              "all 0.2s ease",
                          }}
                        >
                          {item.name}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* =====================================
          LOGOUT BUTTON
      ===================================== */}

      <div
        style={{
          borderTop:
            "1px solid #334155",
          paddingTop: "12px",
          marginTop: "8px",
        }}
      >
        <button
          type="button"
          onClick={
            handleLogoutClick
          }
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            gap: "8px",
            padding: "11px 12px",
            border: "1px solid #475569",
            borderRadius: "8px",
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}