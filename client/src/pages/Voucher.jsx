import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function Voucher() {
  const [voucherNo, setVoucherNo] = useState("");
  const [voucherType, setVoucherType] = useState("Receipt");
  const [voucherDate, setVoucherDate] = useState("");
  const [partyName, setPartyName] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  const [debitAccountId, setDebitAccountId] =
    useState("");

  const [creditAccountId, setCreditAccountId] =
    useState("");

  const [accounts, setAccounts] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadAccounts();
    loadVouchers();
    resetForm();
  }, []);

  // ==================================================
  // LOAD ACCOUNTS
  // ==================================================

  const loadAccounts = async () => {
    try {
      const res = await axios.get(
        "https://mudhikhana.onrender.com/accounts"
      );

      setAccounts(res.data || []);
    } catch (err) {
      console.log("Load Accounts Error:", err);
      alert("Unable to load accounts");
    }
  };

  // ==================================================
  // LOAD VOUCHERS
  // ==================================================

  const loadVouchers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://mudhikhana.onrender.com/vouchers"
      );

      setVouchers(res.data || []);
    } catch (err) {
      console.log("Load Voucher Error:", err);
      alert("Unable to load vouchers");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // GENERATE VOUCHER NUMBER
  // ==================================================

  const generateVoucherNo = () => {
    const randomNo =
      "VCH" +
      Math.floor(
        10000 + Math.random() * 90000
      );

    setVoucherNo(randomNo);
  };

  // ==================================================
  // RESET FORM
  // ==================================================

  const resetForm = () => {
    setEditingId(null);

    generateVoucherNo();

    setVoucherType("Receipt");

    setVoucherDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setPartyName("");
    setAmount("");
    setRemarks("");
    setDebitAccountId("");
    setCreditAccountId("");
  };

  // ==================================================
  // SAVE / UPDATE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!voucherDate) {
      alert("Please select voucher date");
      return;
    }

    if (!partyName.trim()) {
      alert(
        "Please enter Party / Account Name"
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!debitAccountId) {
      alert("Please select Debit Account");
      return;
    }

    if (!creditAccountId) {
      alert("Please select Credit Account");
      return;
    }

    if (
      Number(debitAccountId) ===
      Number(creditAccountId)
    ) {
      alert(
        "Debit and Credit accounts cannot be the same"
      );
      return;
    }

    const data = {
      voucherNo,
      voucherType,
      voucherDate,
      partyName: partyName.trim(),
      amount: Number(amount),
      remarks: remarks.trim(),
      debitAccountId: Number(debitAccountId),
      creditAccountId: Number(creditAccountId),
    };

    try {
      if (editingId) {
        await axios.put(
          `https://mudhikhana.onrender.com/vouchers/${editingId}`,
          data
        );

        alert(
          "Voucher Updated Successfully"
        );
      } else {
        await axios.post(
          "https://mudhikhana.onrender.com/vouchers",
          data
        );

        alert(
          "Voucher Saved Successfully"
        );
      }

      resetForm();
      loadVouchers();
    } catch (err) {
      console.log(
        "Voucher Save Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Error Saving Voucher"
      );
    }
  };

  // ==================================================
  // EDIT VOUCHER
  // ==================================================

  const editVoucher = async (id) => {
    try {
      const res = await axios.get(
        `https://mudhikhana.onrender.com/vouchers/${id}`
      );

      const v = res.data;

      setEditingId(v.id);

      setVoucherNo(v.voucherNo || "");

      setVoucherType(
        v.voucherType || "Receipt"
      );

      setVoucherDate(v.voucherDate || "");

      setPartyName(v.partyName || "");

      setAmount(v.amount ?? "");

      setRemarks(v.remarks || "");

      setDebitAccountId(
        v.debitAccountId
          ? String(v.debitAccountId)
          : ""
      );

      setCreditAccountId(
        v.creditAccountId
          ? String(v.creditAccountId)
          : ""
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.log(
        "Edit Voucher Error:",
        err
      );

      alert("Unable to load voucher");
    }
  };

  // ==================================================
  // DELETE VOUCHER
  // ==================================================

  const deleteVoucher = async (id) => {
    if (
      !window.confirm(
        "Delete this voucher?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `https://mudhikhana.onrender.com/vouchers/${id}`
      );

      alert(
        "Voucher Deleted Successfully"
      );

      loadVouchers();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.log(
        "Delete Voucher Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Error deleting voucher"
      );
    }
  };

  // ==================================================
  // ACCOUNT NAME
  // ==================================================

  const getAccountName = (id) => {
    const account = accounts.find(
      (a) =>
        Number(a.id) === Number(id)
    );

    return account
      ? account.name
      : "-";
  };

  // ==================================================
  // TYPE STYLE
  // ==================================================

  const getTypeStyle = (type) => {
    if (type === "Receipt") {
      return {
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #bbf7d0",
      };
    }

    if (type === "Payment") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      };
    }

    if (type === "Contra") {
      return {
        background: "#dbeafe",
        color: "#1e40af",
        border: "1px solid #bfdbfe",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fde68a",
    };
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredVouchers = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return vouchers.filter((v) => {
      const matchesSearch =
        !keyword ||
        `${v.voucherNo || ""} ${
          v.voucherType || ""
        } ${v.partyName || ""} ${
          v.remarks || ""
        } ${
          v.debitAccountName ||
          getAccountName(v.debitAccountId)
        } ${
          v.creditAccountName ||
          getAccountName(v.creditAccountId)
        }`
          .toLowerCase()
          .includes(keyword);

      const matchesType =
        !typeFilter ||
        v.voucherType === typeFilter;

      return (
        matchesSearch &&
        matchesType
      );
    });
  }, [
    vouchers,
    accounts,
    search,
    typeFilter,
  ]);

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalAmount = vouchers.reduce(
    (sum, v) =>
      sum + Number(v.amount || 0),
    0
  );

  const receiptTotal = vouchers
    .filter(
      (v) =>
        v.voucherType === "Receipt"
    )
    .reduce(
      (sum, v) =>
        sum + Number(v.amount || 0),
      0
    );

  const paymentTotal = vouchers
    .filter(
      (v) =>
        v.voucherType === "Payment"
    )
    .reduce(
      (sum, v) =>
        sum + Number(v.amount || 0),
      0
    );

  // ==================================================
  // STYLES
  // ==================================================

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.06)",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 7,
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#ffffff",
    outline: "none",
    fontSize: 13,
  };

  const thStyle = {
    padding: "13px 12px",
    background: "#f8fafc",
    borderBottom:
      "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: 11,
    fontWeight: 800,
    textAlign: "left",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "13px 12px",
    borderBottom:
      "1px solid #f1f5f9",
    fontSize: 13,
    color: "#475569",
  };

  const money = (value) =>
    Number(value || 0).toLocaleString(
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
        minHeight: "100vh",
        padding: 24,
        background: "#f1f5f9",
        boxSizing: "border-box",
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: "20px 24px",
          marginBottom: 18,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#64748b",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Accounting
          </div>

          <h1
            style={{
              margin: "4px 0 5px",
              color: "#0f172a",
              fontSize: 26,
            }}
          >
            📒 Voucher Register
          </h1>

          <div
            style={{
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Create, edit and manage
            accounting vouchers
          </div>
        </div>

        <button
          type="button"
          onClick={resetForm}
          style={{
            padding: "10px 17px",
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          ➕ New Voucher
        </button>
      </div>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: 18,
            background: "#eff6ff",
            border:
              "1px solid #bfdbfe",
          }}
        >
          <div
            style={{
              color: "#1d4ed8",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            TOTAL VOUCHERS
          </div>

          <div
            style={{
              marginTop: 7,
              color: "#1e3a8a",
              fontSize: 25,
              fontWeight: 900,
            }}
          >
            {vouchers.length}
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: 18,
            background: "#f0fdf4",
            border:
              "1px solid #bbf7d0",
          }}
        >
          <div
            style={{
              color: "#15803d",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            RECEIPTS
          </div>

          <div
            style={{
              marginTop: 7,
              color: "#166534",
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            ₹ {money(receiptTotal)}
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: 18,
            background: "#fef2f2",
            border:
              "1px solid #fecaca",
          }}
        >
          <div
            style={{
              color: "#dc2626",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            PAYMENTS
          </div>

          <div
            style={{
              marginTop: 7,
              color: "#b91c1c",
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            ₹ {money(paymentTotal)}
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: 18,
            background: "#fff7ed",
            border:
              "1px solid #fed7aa",
          }}
        >
          <div
            style={{
              color: "#c2410c",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            TOTAL AMOUNT
          </div>

          <div
            style={{
              marginTop: 7,
              color: "#9a3412",
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            ₹ {money(totalAmount)}
          </div>
        </div>
      </div>

      {/* ==================================================
          FORM
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: 22,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 20,
            gap: 10,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: 18,
              }}
            >
              {editingId
                ? "✏️ Edit Voucher"
                : "📝 New Voucher"}
            </h2>

            <div
              style={{
                marginTop: 4,
                color: "#64748b",
                fontSize: 12,
              }}
            >
              Enter voucher details and
              accounting entries
            </div>
          </div>

          {editingId && (
            <span
              style={{
                padding:
                  "6px 10px",
                borderRadius: 6,
                background: "#ecfdf5",
                color: "#047857",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              EDIT MODE
            </span>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {/* VOUCHER NO */}

          <div>
            <label style={labelStyle}>
              Voucher No
            </label>

            <input
              value={voucherNo}
              readOnly
              style={{
                ...inputStyle,
                background: "#f8fafc",
                color: "#64748b",
                fontWeight: 800,
              }}
            />
          </div>

          {/* TYPE */}

          <div>
            <label style={labelStyle}>
              Voucher Type
            </label>

            <select
              value={voucherType}
              onChange={(e) =>
                setVoucherType(
                  e.target.value
                )
              }
              style={inputStyle}
            >
              <option value="Receipt">
                Receipt
              </option>

              <option value="Payment">
                Payment
              </option>

              <option value="Contra">
                Contra
              </option>

              <option value="Journal">
                Journal
              </option>
            </select>
          </div>

          {/* DATE */}

          <div>
            <label style={labelStyle}>
              Voucher Date
            </label>

            <input
              type="date"
              value={voucherDate}
              onChange={(e) =>
                setVoucherDate(
                  e.target.value
                )
              }
              required
              style={inputStyle}
            />
          </div>

          {/* PARTY */}

          <div>
            <label style={labelStyle}>
              Party / Particular
            </label>

            <input
              placeholder="Example: Gas Bill"
              value={partyName}
              onChange={(e) =>
                setPartyName(
                  e.target.value
                )
              }
              required
              style={inputStyle}
            />
          </div>

          {/* AMOUNT */}

          <div>
            <label style={labelStyle}>
              Amount
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              required
              style={{
                ...inputStyle,
                textAlign: "right",
                fontWeight: 800,
              }}
            />
          </div>

          {/* REMARKS */}

          <div>
            <label style={labelStyle}>
              Remarks
            </label>

            <input
              placeholder="Narration / Remarks"
              value={remarks}
              onChange={(e) =>
                setRemarks(
                  e.target.value
                )
              }
              style={inputStyle}
            />
          </div>

          {/* DEBIT */}

          <div>
            <label style={labelStyle}>
              Debit Account
            </label>

            <select
              value={debitAccountId}
              onChange={(e) =>
                setDebitAccountId(
                  e.target.value
                )
              }
              required
              style={inputStyle}
            >
              <option value="">
                Select Debit Account
              </option>

              {accounts.map(
                (account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* CREDIT */}

          <div>
            <label style={labelStyle}>
              Credit Account
            </label>

            <select
              value={creditAccountId}
              onChange={(e) =>
                setCreditAccountId(
                  e.target.value
                )
              }
              required
              style={inputStyle}
            >
              <option value="">
                Select Credit Account
              </option>

              {accounts.map(
                (account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ENTRY PREVIEW */}

          <div
            style={{
              padding: 12,
              background: "#f8fafc",
              border:
                "1px solid #e2e8f0",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            <span
              style={{
                fontWeight: 800,
                color: "#2563eb",
              }}
            >
              DR
            </span>

            <span>
              {getAccountName(
                debitAccountId
              )}
            </span>

            <span
              style={{
                margin: "0 4px",
              }}
            >
              →
            </span>

            <span
              style={{
                fontWeight: 800,
                color: "#15803d",
              }}
            >
              CR
            </span>

            <span>
              {getAccountName(
                creditAccountId
              )}
            </span>
          </div>

          {/* BUTTONS */}

          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              gap: 10,
              paddingTop: 5,
            }}
          >
            <button
              type="submit"
              style={{
                padding:
                  "11px 24px",
                background:
                  editingId
                    ? "#16a34a"
                    : "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {editingId
                ? "✓ Update Voucher"
                : "✓ Save Voucher"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding:
                    "11px 20px",
                  background:
                    "#f1f5f9",
                  color:
                    "#475569",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: 8,
                  cursor:
                    "pointer",
                  fontWeight:
                    800,
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ==================================================
          REGISTER
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow: "hidden",
        }}
      >
        {/* REGISTER HEADER */}

        <div
          style={{
            padding:
              "18px 20px",
            borderBottom:
              "1px solid #e2e8f0",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#0f172a",
                fontSize: 17,
                fontWeight: 900,
              }}
            >
              📋 Voucher Register
            </div>

            <div
              style={{
                marginTop: 3,
                color: "#64748b",
                fontSize: 12,
              }}
            >
              {filteredVouchers.length}{" "}
              voucher
              {filteredVouchers.length ===
              1
                ? ""
                : "s"}{" "}
              displayed
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="🔍 Search voucher..."
              style={{
                width: 260,
                padding:
                  "10px 12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                outline: "none",
                fontSize: 12,
              }}
            />

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value
                )
              }
              style={{
                padding:
                  "10px 12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                background:
                  "#ffffff",
                fontSize: 12,
              }}
            >
              <option value="">
                All Types
              </option>

              <option value="Receipt">
                Receipt
              </option>

              <option value="Payment">
                Payment
              </option>

              <option value="Contra">
                Contra
              </option>

              <option value="Journal">
                Journal
              </option>
            </select>
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
              minWidth: 1150,
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr>
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
                  VOUCHER NO
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  TYPE
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  DATE
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  PARTY
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  DEBIT ACCOUNT
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  CREDIT ACCOUNT
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign:
                      "right",
                  }}
                >
                  AMOUNT
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  REMARKS
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign:
                      "center",
                  }}
                >
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    style={{
                      padding: 60,
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 36,
                        marginBottom: 8,
                      }}
                    >
                      ⏳
                    </div>

                    <div
                      style={{
                        fontWeight: 800,
                        color:
                          "#334155",
                      }}
                    >
                      Loading Vouchers...
                    </div>
                  </td>
                </tr>
              ) : filteredVouchers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="10"
                    style={{
                      padding: 60,
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 40,
                        marginBottom: 8,
                      }}
                    >
                      📭
                    </div>

                    <div
                      style={{
                        fontWeight: 800,
                        color:
                          "#334155",
                      }}
                    >
                      No Vouchers Found
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                      }}
                    >
                      Try changing your
                      search or filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVouchers.map(
                  (v, index) => {
                    const typeStyle =
                      getTypeStyle(
                        v.voucherType
                      );

                    return (
                      <tr
                        key={v.id}
                        style={{
                          background:
                            index %
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
                                800,
                            }}
                          >
                            {index + 1}
                          </span>
                        </td>

                        {/* VOUCHER NO */}

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              padding:
                                "5px 8px",
                              background:
                                "#eff6ff",
                              color:
                                "#2563eb",
                              borderRadius:
                                6,
                              fontSize:
                                11,
                              fontWeight:
                                800,
                            }}
                          >
                            {v.voucherNo}
                          </span>
                        </td>

                        {/* TYPE */}

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "5px 9px",
                              borderRadius:
                                999,
                              fontSize:
                                11,
                              fontWeight:
                                800,
                              ...typeStyle,
                            }}
                          >
                            {v.voucherType}
                          </span>
                        </td>

                        {/* DATE */}

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {v.voucherDate}
                        </td>

                        {/* PARTY */}

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <div
                            style={{
                              color:
                                "#0f172a",
                              fontWeight:
                                700,
                            }}
                          >
                            {v.partyName}
                          </div>
                        </td>

                        {/* DEBIT */}

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              color:
                                "#1d4ed8",
                              fontWeight:
                                700,
                            }}
                          >
                            {v.debitAccountName ||
                              getAccountName(
                                v.debitAccountId
                              )}
                          </span>
                        </td>

                        {/* CREDIT */}

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              color:
                                "#15803d",
                              fontWeight:
                                700,
                            }}
                          >
                            {v.creditAccountName ||
                              getAccountName(
                                v.creditAccountId
                              )}
                          </span>
                        </td>

                        {/* AMOUNT */}

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                            color:
                              "#0f172a",
                            fontWeight:
                              900,
                          }}
                        >
                          ₹{" "}
                          {money(
                            v.amount
                          )}
                        </td>

                        {/* REMARKS */}

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              color:
                                "#64748b",
                            }}
                          >
                            {v.remarks ||
                              "-"}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "center",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              editVoucher(
                                v.id
                              )
                            }
                            style={{
                              padding:
                                "7px 10px",
                              marginRight:
                                5,
                              background:
                                "#eff6ff",
                              color:
                                "#2563eb",
                              border:
                                "1px solid #bfdbfe",
                              borderRadius:
                                7,
                              cursor:
                                "pointer",
                              fontWeight:
                                800,
                              fontSize:
                                11,
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteVoucher(
                                v.id
                              )
                            }
                            style={{
                              padding:
                                "7px 10px",
                              background:
                                "#fef2f2",
                              color:
                                "#dc2626",
                              border:
                                "1px solid #fecaca",
                              borderRadius:
                                7,
                              cursor:
                                "pointer",
                              fontWeight:
                                800,
                              fontSize:
                                11,
                            }}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>

            {filteredVouchers.length >
              0 && (
              <tfoot>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                  }}
                >
                  <td
                    colSpan="7"
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        900,
                      color:
                        "#334155",
                    }}
                  >
                    TOTAL
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        900,
                      color:
                        "#0f172a",
                    }}
                  >
                    ₹{" "}
                    {money(
                      filteredVouchers.reduce(
                        (sum, v) =>
                          sum +
                          Number(
                            v.amount ||
                              0
                          ),
                        0
                      )
                    )}
                  </td>

                  <td
                    colSpan="2"
                    style={
                      tdStyle
                    }
                  />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* FOOTER */}

        <div
          style={{
            padding:
              "12px 20px",
            borderTop:
              "1px solid #e2e8f0",
            background:
              "#fafafa",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            color: "#64748b",
            fontSize: 12,
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
              {filteredVouchers.length}
            </b>{" "}
            of{" "}
            <b
              style={{
                color:
                  "#334155",
              }}
            >
              {vouchers.length}
            </b>{" "}
            vouchers
          </span>

          {(search ||
            typeFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTypeFilter("");
              }}
              style={{
                border: "none",
                background:
                  "transparent",
                color:
                  "#2563eb",
                cursor:
                  "pointer",
                fontWeight:
                  800,
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}