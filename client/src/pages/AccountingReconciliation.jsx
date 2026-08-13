import { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "./CompanyHeader";

export default function AccountingReconciliation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        salesRes,
        purchasesRes,
        allocationRes,
      ] = await Promise.all([
        axios.get(
          "http://localhost:5000/sales"
        ),

        axios.get(
          "http://localhost:5000/purchases"
        ),

        axios.get(
          "http://localhost:5000/accounts/allocation-data"
        ),
      ]);

      setData({
        sales:
          salesRes.data || [],

        purchases:
          purchasesRes.data || [],

        allocationData:
          allocationRes.data || {},
      });
    } catch (err) {
      console.log(
        "Reconciliation Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load reconciliation data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==================================================
  // MONEY
  // ==================================================

  const money = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div
        style={{
          padding: 30,
          textAlign: "center",
          color: "#64748b",
        }}
      >
        Checking accounting data...
      </div>
    );
  }

  const sales =
    data?.sales || [];

  const purchases =
    data?.purchases || [];

  const allocationData =
    data?.allocationData || {};

  const allocationSales =
    allocationData.sales || [];

  const allocationPurchases =
    allocationData.purchases || [];

  const allocations =
    allocationData.allocations || [];

  // ==================================================
  // SALES
  // ==================================================

  const cashSales =
    sales.filter(
      (sale) =>
        String(
          sale.paymentMode || ""
        ).toLowerCase() === "cash"
    );

  const creditSales =
    sales.filter(
      (sale) =>
        String(
          sale.paymentMode || ""
        ).toLowerCase() === "credit"
    );

  const totalCashSales =
    cashSales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.grandTotal || 0
        ),
      0
    );

  const totalCreditSales =
    creditSales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.grandTotal || 0
        ),
      0
    );

  // ==================================================
  // CREDIT SALES / RECEIVABLES
  // ==================================================

  const creditSaleIds =
    new Set(
      creditSales.map(
        (sale) =>
          Number(sale.id)
      )
    );

  const creditSaleAllocationRows =
    allocationSales.filter(
      (sale) =>
        creditSaleIds.has(
          Number(sale.id)
        )
    );

  const creditSalesAllocated =
    creditSaleAllocationRows.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.allocated || 0
        ),
      0
    );

  const creditSalesOutstanding =
    creditSaleAllocationRows.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.outstanding || 0
        ),
      0
    );

  const creditSalesReconciledTotal =
    creditSalesAllocated +
    creditSalesOutstanding;

  const creditSalesDifference =
    totalCreditSales -
    creditSalesReconciledTotal;

  // ==================================================
  // PURCHASES
  // ==================================================

  const totalPurchases =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.grandTotal || 0
        ),
      0
    );

  /*
   * Your current purchase screen does not expose
   * a paymentMode field in the source.
   *
   * Therefore we do NOT pretend that we can
   * distinguish cash purchases from credit
   * purchases here.
   *
   * We use the allocation system to reconcile
   * supplier invoices that have Payment allocations.
   */

  const purchaseInvoiceRows =
    allocationPurchases;

  const purchaseAllocated =
    purchaseInvoiceRows.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.allocated || 0
        ),
      0
    );

  const purchaseOutstanding =
    purchaseInvoiceRows.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.outstanding || 0
        ),
      0
    );

  const purchaseReconciledTotal =
    purchaseAllocated +
    purchaseOutstanding;

  const purchaseDifference =
    totalPurchases -
    purchaseReconciledTotal;

  // ==================================================
  // RECEIPT ALLOCATIONS
  // ==================================================

  const receiptAllocations =
    allocations.filter(
      (allocation) =>
        allocation.saleId &&
        Number(
          allocation.amount
        ) > 0
    );

  const paymentAllocations =
    allocations.filter(
      (allocation) =>
        allocation.purchaseId &&
        Number(
          allocation.amount
        ) > 0
    );

  const totalReceiptAllocated =
    receiptAllocations.reduce(
      (sum, allocation) =>
        sum +
        Number(
          allocation.amount || 0
        ),
      0
    );

  const totalPaymentAllocated =
    paymentAllocations.reduce(
      (sum, allocation) =>
        sum +
        Number(
          allocation.amount || 0
        ),
      0
    );

  // ==================================================
  // STATUS CHECKS
  // ==================================================

  const creditSalesBalanced =
    Math.abs(
      creditSalesDifference
    ) < 0.01;

  const purchasesBalanced =
    Math.abs(
      purchaseDifference
    ) < 0.01;

  const overallBalanced =
    creditSalesBalanced &&
    purchasesBalanced;

  return (
    <>
      {/* ==================================================
          PRINT CSS
      ================================================== */}

      <style>
        {`
          @media print {

            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            html,
            body {
              width: 100% !important;
              height: auto !important;

              margin: 0 !important;
              padding: 0 !important;

              background: white !important;

              overflow: visible !important;

              transform: none !important;
              rotate: none !important;

              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            #root {
              width: 100% !important;
              height: auto !important;

              margin: 0 !important;
              padding: 0 !important;

              background: white !important;

              overflow: visible !important;

              transform: none !important;
              rotate: none !important;
            }

            /* ==========================================
               HIDE SIDEBAR / NAVIGATION
            ========================================== */

            .sidebar,
            aside,
            nav {
              display: none !important;
            }

            /* ==========================================
               HIDE BUTTONS
            ========================================== */

            button,
            .no-print {
              display: none !important;
            }

            /* ==========================================
               MAIN PRINT AREA
            ========================================== */

            .reconciliation-print-area {
              display: block !important;

              width: 100% !important;
              max-width: 100% !important;

              margin: 0 !important;
              padding: 0 !important;

              min-height: 0 !important;

              box-sizing: border-box !important;

              background: white !important;

              transform: none !important;
              rotate: none !important;
            }

            /* ==========================================
               COMPANY HEADER
            ========================================== */

            .company-header {
              width: 100% !important;

              margin-bottom: 8px !important;
              padding-bottom: 8px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .company-header h1 {
              font-size: 22px !important;
            }

            .company-header img {
              max-width: 70px !important;
              max-height: 55px !important;
            }

            /* ==========================================
               HEADER
            ========================================== */

            .reconciliation-header {
              break-inside: avoid !important;
              page-break-inside: avoid !important;

              margin-bottom: 10px !important;
            }

            /* ==========================================
               STATUS
            ========================================== */

            .reconciliation-status {
              break-inside: avoid !important;
              page-break-inside: avoid !important;

              margin-bottom: 10px !important;

              padding: 12px !important;
            }

            /* ==========================================
               SUMMARY
            ========================================== */

            .reconciliation-summary {
              display: grid !important;

              grid-template-columns:
                repeat(3, 1fr) !important;

              gap: 7px !important;

              margin-bottom: 10px !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .reconciliation-summary > div {
              padding: 8px !important;
            }

            /* ==========================================
               RECONCILIATION CARDS
            ========================================== */

            .reconciliation-card {
              break-inside: avoid !important;
              page-break-inside: avoid !important;

              margin-bottom: 10px !important;
            }

            .reconciliation-card-content {
              display: grid !important;

              grid-template-columns:
                repeat(3, 1fr) !important;
            }

            /* ==========================================
               MINI SECTIONS
            ========================================== */

            .reconciliation-section {
              break-inside: avoid !important;
              page-break-inside: avoid !important;

              margin-bottom: 10px !important;

              padding: 12px !important;
            }

            .reconciliation-mini-grid {
              display: grid !important;

              grid-template-columns:
                repeat(3, 1fr) !important;

              gap: 8px !important;
            }

            /* ==========================================
               EXPLANATION
            ========================================== */

            .reconciliation-explanation {
              break-inside: avoid !important;
              page-break-inside: avoid !important;

              margin-top: 10px !important;

              padding: 12px !important;
            }

            /* ==========================================
               FONT SIZES
            ========================================== */

            .reconciliation-print-area {
              font-size: 10px !important;
            }

            .reconciliation-print-area h1 {
              font-size: 20px !important;
            }

            .reconciliation-print-area h2 {
              font-size: 15px !important;
            }

            .reconciliation-print-area h3 {
              font-size: 13px !important;
            }

            .reconciliation-print-area p,
            .reconciliation-print-area li {
              font-size: 10px !important;
            }

            /* ==========================================
               PRINT COLORS
            ========================================== */

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      {/* ==================================================
          MAIN AREA
      ================================================== */}

      <div
        className="reconciliation-print-area"
        style={{
          padding: 24,
          background: "#f8fafc",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="reconciliation-header"
          style={{
            marginBottom: 24,
          }}
        >
          {/* ==========================================
              COMPANY INFORMATION
          ========================================== */}

          <CompanyHeader
            print={false}
          />

          {/* ==========================================
              REPORT TITLE + BUTTONS
          ========================================== */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <div>
              <h1
                style={{
                  margin: "5px 0",
                  fontSize: 26,
                }}
              >
                🔍 Accounting Reconciliation
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Reconcile cash sales,
                credit sales, receipts,
                purchases and payments
              </p>
            </div>

            {/* ACTION BUTTONS */}

            <div
              className="no-print"
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <button
                onClick={loadData}
                style={{
                  padding:
                    "10px 16px",
                  background: "white",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🔄 Refresh
              </button>

              <button
                onClick={() =>
                  window.print()
                }
                style={{
                  padding:
                    "10px 18px",
                  background:
                    "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================
            OVERALL STATUS
        ================================================== */}

        <div
          className="reconciliation-status"
          style={{
            background:
              overallBalanced
                ? "#dcfce7"
                : "#fef3c7",

            border:
              "1px solid " +
              (overallBalanced
                ? "#86efac"
                : "#fcd34d"),

            padding: 20,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 24,
            }}
          >
            {overallBalanced
              ? "✅"
              : "⚠️"}
          </div>

          <h2
            style={{
              margin: "5px 0",
              color:
                overallBalanced
                  ? "#166534"
                  : "#92400e",
            }}
          >
            {overallBalanced
              ? "Reconciliation Checks Passed"
              : "Review Reconciliation Differences"}
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: 13,
              color:
                overallBalanced
                  ? "#166534"
                  : "#92400e",
            }}
          >
            {overallBalanced
              ? "The available allocation data agrees with the relevant invoice totals."
              : "Some totals cannot currently be fully reconciled. Review the sections below."}
          </p>
        </div>

        {/* ==================================================
            SALES SUMMARY
        ================================================== */}

        <div
          className="reconciliation-summary"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <SummaryCard
            title="🛒 Total Sales"
            value={
              totalCashSales +
              totalCreditSales
            }
            subtitle="All sales"
          />

          <SummaryCard
            title="💵 Cash Sales"
            value={totalCashSales}
            subtitle={`${cashSales.length} cash sale(s)`}
          />

          <SummaryCard
            title="📒 Credit Sales"
            value={
              totalCreditSales
            }
            subtitle={`${creditSales.length} credit sale(s)`}
          />
        </div>

        {/* ==================================================
            CREDIT SALES RECONCILIATION
        ================================================== */}

        <ReconciliationCard
          title="📒 Credit Sales → Customer Receivables"
          description="Only credit sales are included in customer receivable reconciliation."
          leftLabel="Credit Sales"
          leftValue={
            totalCreditSales
          }
          rightLabel="Allocated + Outstanding"
          rightValue={
            creditSalesReconciledTotal
          }
          difference={
            creditSalesDifference
          }
          balanced={
            creditSalesBalanced
          }
        />

        {/* ==================================================
            RECEIPTS
        ================================================== */}

        <div
          className="reconciliation-section"
          style={{
            background: "white",
            border:
              "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              margin: "0 0 5px",
              fontSize: 18,
            }}
          >
            🧾 Customer Receipts
          </h2>

          <p
            style={{
              margin: "0 0 18px",
              color: "#64748b",
              fontSize: 12,
            }}
          >
            Receipt vouchers that have
            been allocated against
            sales invoices.
          </p>

          <div
            className="reconciliation-mini-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <MiniCard
              label="Allocated Receipts"
              value={
                totalReceiptAllocated
              }
            />

            <MiniCard
              label="Customer Outstanding"
              value={
                creditSalesOutstanding
              }
            />

            <MiniCard
              label="Credit Sales"
              value={
                totalCreditSales
              }
            />
          </div>
        </div>

        {/* ==================================================
            PURCHASES
        ================================================== */}

        <ReconciliationCard
          title="📥 Purchases → Supplier Payables"
          description="Purchase invoices are reconciled against Payment allocations."
          leftLabel="Purchase Total"
          leftValue={
            totalPurchases
          }
          rightLabel="Allocated + Outstanding"
          rightValue={
            purchaseReconciledTotal
          }
          difference={
            purchaseDifference
          }
          balanced={
            purchasesBalanced
          }
        />

        {/* ==================================================
            PAYMENTS
        ================================================== */}

        <div
          className="reconciliation-section"
          style={{
            background: "white",
            border:
              "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              margin: "0 0 5px",
              fontSize: 18,
            }}
          >
            💳 Supplier Payments
          </h2>

          <p
            style={{
              margin: "0 0 18px",
              color: "#64748b",
              fontSize: 12,
            }}
          >
            Payment vouchers allocated
            against purchase invoices.
          </p>

          <div
            className="reconciliation-mini-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            <MiniCard
              label="Allocated Payments"
              value={
                totalPaymentAllocated
              }
            />

            <MiniCard
              label="Supplier Outstanding"
              value={
                purchaseOutstanding
              }
            />
          </div>
        </div>

        {/* ==================================================
            EXPLANATION
        ================================================== */}

        <div
          className="reconciliation-explanation"
          style={{
            background: "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius: 10,
            padding: 18,
            marginTop: 20,
          }}
        >
          <h3
            style={{
              margin: "0 0 8px",
              color: "#1e40af",
              fontSize: 15,
            }}
          >
            ℹ️ How this reconciliation works
          </h3>

          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              color: "#1e3a8a",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <li>
              Cash sales are not
              treated as customer
              receivables.
            </li>

            <li>
              Credit sales are
              compared with their
              allocated receipts plus
              remaining outstanding.
            </li>

            <li>
              Receipt allocations come
              directly from the voucher
              allocation system.
            </li>

            <li>
              Purchase invoices are
              compared with their
              Payment allocations plus
              outstanding.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

// ==================================================
// SUMMARY CARD
// ==================================================

function SummaryCard({
  title,
  value,
  subtitle,
}) {
  const money = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <div
      style={{
        background: "white",
        padding: 18,
        borderRadius: 10,
        border:
          "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#475569",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          marginTop: 7,
        }}
      >
        ₹ {money(value)}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          marginTop: 4,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

// ==================================================
// MINI CARD
// ==================================================

function MiniCard({
  label,
  value,
}) {
  const money = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <div
      style={{
        background: "#f8fafc",
        padding: 15,
        borderRadius: 8,
        border:
          "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 19,
          fontWeight: 700,
          marginTop: 5,
        }}
      >
        ₹ {money(value)}
      </div>
    </div>
  );
}

// ==================================================
// RECONCILIATION CARD
// ==================================================

function ReconciliationCard({
  title,
  description,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  difference,
  balanced,
}) {
  const money = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <div
      className="reconciliation-card"
      style={{
        background: "white",
        borderRadius: 10,
        border:
          "1px solid #e2e8f0",
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: 16,
          borderBottom:
            "1px solid #e2e8f0",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
            }}
          >
            {title}
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "#64748b",
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: "bold",
            background:
              balanced
                ? "#dcfce7"
                : "#fee2e2",
            color:
              balanced
                ? "#166534"
                : "#991b1b",
            whiteSpace:
              "nowrap",
          }}
        >
          {balanced
            ? "✓ MATCH"
            : "⚠ DIFFERENCE"}
        </div>
      </div>

      <div
        className="reconciliation-card-content"
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr 1fr",
          gap: 1,
          background:
            "#e2e8f0",
        }}
      >
        <div
          style={{
            background: "white",
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
            }}
          >
            {leftLabel}
          </div>

          <h2
            style={{
              margin: "5px 0 0",
              fontSize: 20,
            }}
          >
            ₹ {money(leftValue)}
          </h2>
        </div>

        <div
          style={{
            background: "white",
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
            }}
          >
            {rightLabel}
          </div>

          <h2
            style={{
              margin: "5px 0 0",
              fontSize: 20,
            }}
          >
            ₹ {money(rightValue)}
          </h2>
        </div>

        <div
          style={{
            background: "white",
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
            }}
          >
            DIFFERENCE
          </div>

          <h2
            style={{
              margin: "5px 0 0",
              fontSize: 20,
              color:
                balanced
                  ? "#15803d"
                  : "#dc2626",
            }}
          >
            ₹{" "}
            {money(
              Math.abs(
                difference
              )
            )}
          </h2>
        </div>
      </div>
    </div>
  );
}