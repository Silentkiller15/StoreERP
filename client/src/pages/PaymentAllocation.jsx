import { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentAllocation() {
  const [data, setData] = useState({
    vouchers: [],
    sales: [],
    purchases: [],
  });

  const [type, setType] = useState("Receipt");
  const [voucherId, setVoucherId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");

  const [allocationDate, setAllocationDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==================================================
  // AUTH TOKEN
  // ==================================================

  const getAuthConfig = () => {
    const token =
      localStorage.getItem("storeerp_token");

    return {
      headers: {
        Authorization:
          "Bearer " + token,
      },
    };
  };

  // ==================================================
  // MONEY
  // ==================================================

  const money = (value) =>
    Number(value || 0).toFixed(2);

  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/accounts/allocation-data",
        getAuthConfig()
      );

      setData({
        vouchers:
          res.data?.vouchers || [],

        sales:
          res.data?.sales || [],

        purchases:
          res.data?.purchases || [],
      });
    } catch (err) {
      console.log(
        "Allocation Load Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load allocation data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==================================================
  // AVAILABLE VOUCHERS
  // ==================================================

  const availableVouchers =
    data.vouchers.filter(
      (voucher) =>
        voucher.voucherType === type &&
        Number(voucher.unallocated) >
          0.009
    );

  // ==================================================
  // AVAILABLE INVOICES
  // ==================================================

  const availableInvoices =
    type === "Receipt"
      ? data.sales.filter(
          (sale) =>
            Number(
              sale.outstanding
            ) > 0.009
        )
      : data.purchases.filter(
          (purchase) =>
            Number(
              purchase.outstanding
            ) > 0.009
        );

  // ==================================================
  // SELECTED VOUCHER
  // ==================================================

  const selectedVoucher =
    data.vouchers.find(
      (voucher) =>
        Number(voucher.id) ===
        Number(voucherId)
    );

  // ==================================================
  // SELECTED INVOICE
  // ==================================================

  const selectedInvoice =
    availableInvoices.find(
      (invoice) =>
        Number(invoice.id) ===
        Number(invoiceId)
    );

  // ==================================================
  // CHANGE TYPE
  // ==================================================

  const changeType = (value) => {
    setType(value);

    setVoucherId("");
    setInvoiceId("");
    setAmount("");
    setRemarks("");
  };

  // ==================================================
  // SAVE ALLOCATION
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------

    if (!voucherId) {
      alert(
        "Please select a voucher."
      );
      return;
    }

    if (!invoiceId) {
      alert(
        "Please select an invoice."
      );
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      alert(
        "Please enter a valid amount."
      );
      return;
    }

    const allocationAmount =
      Number(amount);

    // ----------------------------------------------
    // VOUCHER BALANCE
    // ----------------------------------------------

    const voucherAvailable =
      Number(
        selectedVoucher?.unallocated ||
          0
      );

    // ----------------------------------------------
    // INVOICE BALANCE
    // ----------------------------------------------

    const invoiceOutstanding =
      Number(
        selectedInvoice?.outstanding ||
          0
      );

    // ----------------------------------------------
    // CHECK VOUCHER
    // ----------------------------------------------

    if (
      allocationAmount >
      voucherAvailable + 0.009
    ) {
      alert(
        `Voucher has only ₹${money(
          voucherAvailable
        )} available.`
      );

      return;
    }

    // ----------------------------------------------
    // CHECK INVOICE
    // ----------------------------------------------

    if (
      allocationAmount >
      invoiceOutstanding + 0.009
    ) {
      alert(
        `Invoice has only ₹${money(
          invoiceOutstanding
        )} outstanding.`
      );

      return;
    }

    // ----------------------------------------------
    // SAVE
    // ----------------------------------------------

    try {
      setSaving(true);

      await axios.post(
        "http://localhost:5000/accounts/allocate",
        {
          voucherId:
            Number(voucherId),

          saleId:
            type === "Receipt"
              ? Number(invoiceId)
              : null,

          purchaseId:
            type === "Payment"
              ? Number(invoiceId)
              : null,

          amount:
            allocationAmount,

          allocationDate,

          remarks:
            remarks.trim(),
        },
        getAuthConfig()
      );

      alert(
        "Payment / Receipt Allocated Successfully"
      );

      // ------------------------------------------
      // RESET FORM
      // ------------------------------------------

      setVoucherId("");
      setInvoiceId("");
      setAmount("");
      setRemarks("");

      // ------------------------------------------
      // RELOAD DATA
      // ------------------------------------------

      await loadData();

    } catch (err) {
      console.log(
        "Allocation Save Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to save allocation"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div
      style={{
        padding: 20,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
            }}
          >
            💳 Receipt / Payment Allocation
          </h2>

          <p
            style={{
              margin:
                "5px 0 0 0",
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Allocate receipts against sales
            invoices and payments against
            purchase invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: loading
              ? "not-allowed"
              : "pointer",
            fontWeight: 600,
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ==================================================
          LOADING
      ================================================== */}

      {loading ? (
        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 10,
            border:
              "1px solid #e2e8f0",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Loading allocation data...
        </div>
      ) : (

        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 800,
            background: "white",
            padding: 25,
            borderRadius: 10,
            border:
              "1px solid #e2e8f0",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >

          {/* ==================================================
              ALLOCATION TYPE
          ================================================== */}

          <div
            style={{
              marginBottom: 18,
            }}
          >
            <label>
              <b>Allocation Type</b>
            </label>

            <select
              value={type}
              onChange={(e) =>
                changeType(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: 10,
                marginTop: 6,
                border:
                  "1px solid #cbd5e1",
                borderRadius: 6,
                boxSizing:
                  "border-box",
              }}
            >
              <option value="Receipt">
                Receipt → Sales Invoice
              </option>

              <option value="Payment">
                Payment → Purchase Invoice
              </option>
            </select>
          </div>

          {/* ==================================================
              VOUCHER
          ================================================== */}

          <div
            style={{
              marginBottom: 18,
            }}
          >
            <label>
              <b>
                {type === "Receipt"
                  ? "Receipt Voucher"
                  : "Payment Voucher"}
              </b>
            </label>

            <select
              value={voucherId}
              onChange={(e) => {
                setVoucherId(
                  e.target.value
                );

                setAmount("");
              }}
              style={{
                width: "100%",
                padding: 10,
                marginTop: 6,
                border:
                  "1px solid #cbd5e1",
                borderRadius: 6,
                boxSizing:
                  "border-box",
              }}
            >
              <option value="">
                Select Voucher
              </option>

              {availableVouchers.map(
                (voucher) => (
                  <option
                    key={voucher.id}
                    value={voucher.id}
                  >
                    {voucher.voucherNo}
                    {" — "}
                    {voucher.partyName ||
                      "Unknown Party"}
                    {" — ₹"}
                    {money(
                      voucher.unallocated
                    )}
                    {" available"}
                  </option>
                )
              )}
            </select>

            {/* NO VOUCHERS MESSAGE */}

            {availableVouchers.length ===
              0 && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "#dc2626",
                }}
              >
                No unallocated{" "}
                {type.toLowerCase()} vouchers
                available.
              </div>
            )}
          </div>

          {/* ==================================================
              INVOICE
          ================================================== */}

          <div
            style={{
              marginBottom: 18,
            }}
          >
            <label>
              <b>
                {type === "Receipt"
                  ? "Sales Invoice"
                  : "Purchase Invoice"}
              </b>
            </label>

            <select
              value={invoiceId}
              onChange={(e) => {
                setInvoiceId(
                  e.target.value
                );

                setAmount("");
              }}
              style={{
                width: "100%",
                padding: 10,
                marginTop: 6,
                border:
                  "1px solid #cbd5e1",
                borderRadius: 6,
                boxSizing:
                  "border-box",
              }}
            >
              <option value="">
                Select Invoice
              </option>

              {availableInvoices.map(
                (invoice) => (
                  <option
                    key={invoice.id}
                    value={invoice.id}
                  >
                    {type === "Receipt"
                      ? invoice.saleNo ||
                        invoice.invoiceNo
                      : invoice.purchaseNo}

                    {" — "}

                    {type === "Receipt"
                      ? invoice.customerName ||
                        "Cash Customer"
                      : invoice.supplierName ||
                        "Unknown Supplier"}

                    {" — Outstanding ₹"}

                    {money(
                      invoice.outstanding
                    )}
                  </option>
                )
              )}
            </select>

            {/* NO INVOICES MESSAGE */}

            {availableInvoices.length ===
              0 && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "#dc2626",
                }}
              >
                No outstanding{" "}
                {type === "Receipt"
                  ? "sales invoices"
                  : "purchase invoices"}{" "}
                available.
              </div>
            )}
          </div>

          {/* ==================================================
              SELECTED VOUCHER DETAILS
          ================================================== */}

          {selectedVoucher && (
            <div
              style={{
                padding: 14,
                marginBottom: 12,
                background: "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                borderRadius: 8,
                color: "#1e3a8a",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                Voucher Details
              </div>

              Voucher No:{" "}
              <b>
                {selectedVoucher.voucherNo}
              </b>

              <br />

              Party:{" "}
              <b>
                {selectedVoucher.partyName ||
                  "Unknown Party"}
              </b>

              <br />

              Voucher Amount:{" "}
              <b>
                ₹{" "}
                {money(
                  selectedVoucher.amount
                )}
              </b>

              <br />

              Already Allocated:{" "}
              <b>
                ₹{" "}
                {money(
                  selectedVoucher.allocated
                )}
              </b>

              <br />

              Available:{" "}
              <b>
                ₹{" "}
                {money(
                  selectedVoucher.unallocated
                )}
              </b>
            </div>
          )}

          {/* ==================================================
              SELECTED INVOICE DETAILS
          ================================================== */}

          {selectedInvoice && (
            <div
              style={{
                padding: 14,
                marginBottom: 18,
                background: "#fff7ed",
                border:
                  "1px solid #fed7aa",
                borderRadius: 8,
                color: "#7c2d12",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                Invoice Details
              </div>

              {type === "Receipt"
                ? "Invoice No"
                : "Purchase No"}
              :{" "}
              <b>
                {type === "Receipt"
                  ? selectedInvoice.saleNo ||
                    selectedInvoice.invoiceNo
                  : selectedInvoice.purchaseNo}
              </b>

              <br />

              {type === "Receipt"
                ? "Customer"
                : "Supplier"}
              :{" "}
              <b>
                {type === "Receipt"
                  ? selectedInvoice.customerName ||
                    "Cash Customer"
                  : selectedInvoice.supplierName ||
                    "Unknown Supplier"}
              </b>

              <br />

              Invoice Total:{" "}
              <b>
                ₹{" "}
                {money(
                  selectedInvoice.total ??
                    selectedInvoice.grandTotal
                )}
              </b>

              <br />

              Already Allocated:{" "}
              <b>
                ₹{" "}
                {money(
                  selectedInvoice.allocated
                )}
              </b>

              <br />

              Outstanding:{" "}
              <b>
                ₹{" "}
                {money(
                  selectedInvoice.outstanding
                )}
              </b>
            </div>
          )}

          {/* ==================================================
              AMOUNT
          ================================================== */}

          <div
            style={{
              marginBottom: 18,
            }}
          >
            <label>
              <b>Allocation Amount</b>
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              placeholder="Enter allocation amount"
              style={{
                width: "100%",
                padding: 10,
                marginTop: 6,
                boxSizing:
                  "border-box",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 6,
              }}
            />

            {/* QUICK MAX */}

            {selectedVoucher &&
              selectedInvoice && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  Maximum allocatable: ₹
                  {money(
                    Math.min(
                      Number(
                        selectedVoucher.unallocated ||
                          0
                      ),
                      Number(
                        selectedInvoice.outstanding ||
                          0
                      )
                    )
                  )}
                </div>
              )}
          </div>

          {/* ==================================================
              DATE
          ================================================== */}

          <div
            style={{
              marginBottom: 18,
            }}
          >
            <label>
              <b>Allocation Date</b>
            </label>

            <input
              type="date"
              value={allocationDate}
              onChange={(e) =>
                setAllocationDate(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: 10,
                marginTop: 6,
                border:
                  "1px solid #cbd5e1",
                borderRadius: 6,
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* ==================================================
              REMARKS
          ================================================== */}

          <div
            style={{
              marginBottom: 20,
            }}
          >
            <label>
              <b>Remarks</b>
            </label>

            <input
              type="text"
              value={remarks}
              onChange={(e) =>
                setRemarks(
                  e.target.value
                )
              }
              placeholder="Optional remarks"
              style={{
                width: "100%",
                padding: 10,
                marginTop: 6,
                boxSizing:
                  "border-box",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 6,
              }}
            />
          </div>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <button
            type="submit"
            disabled={
              saving ||
              !voucherId ||
              !invoiceId ||
              !amount
            }
            style={{
              padding:
                "11px 22px",

              background:
                saving ||
                !voucherId ||
                !invoiceId ||
                !amount
                  ? "#94a3b8"
                  : "#16a34a",

              color: "white",

              border: "none",

              borderRadius: 6,

              cursor:
                saving ||
                !voucherId ||
                !invoiceId ||
                !amount
                  ? "not-allowed"
                  : "pointer",

              fontWeight: "bold",
            }}
          >
            {saving
              ? "Saving..."
              : "💾 Allocate"}
          </button>

        </form>
      )}
    </div>
  );
}