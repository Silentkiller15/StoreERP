import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function Ledger() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ==================================================
  // LOAD ACCOUNTS
  // ==================================================

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/accounts"
      );

      setAccounts(res.data || []);
    } catch (err) {
      console.log(err);
      alert("Unable to load accounts");
    }
  };

  // ==================================================
  // LOAD LEDGER
  // ==================================================

  const loadLedger = async () => {
    if (!accountId) {
      alert("Please select an account");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/accounts/${accountId}/ledger`
      );

      setAccount(res.data.account);
      setTransactions(
        res.data.transactions || []
      );
    } catch (err) {
      console.log(err);

      setAccount(null);
      setTransactions([]);

      alert(
        err.response?.data?.message ||
          "Unable to load ledger"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // CLEAR
  // ==================================================

  const clearLedger = () => {
    setAccountId("");
    setAccount(null);
    setTransactions([]);
    setSearch("");
  };

  // ==================================================
  // TOTALS
  // ==================================================

  const totalDebit = transactions.reduce(
    (sum, item) =>
      sum + Number(item.debit || 0),
    0
  );

  const totalCredit = transactions.reduce(
    (sum, item) =>
      sum + Number(item.credit || 0),
    0
  );

  const openingBalance = account
    ? Number(account.openingBalance || 0)
    : 0;

  const openingType = account
    ? account.openingType
    : "Debit";

  const closingBalance =
    transactions.length > 0
      ? Number(
          transactions[
            transactions.length - 1
          ].balance || 0
        )
      : openingType === "Credit"
      ? -openingBalance
      : openingBalance;

  const displayBalance = Math.abs(
    closingBalance
  );

  const displayBalanceType =
    closingBalance >= 0
      ? "Debit"
      : "Credit";

  // ==================================================
  // SEARCH TRANSACTIONS
  // ==================================================

  const filteredTransactions = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return transactions;
    }

    return transactions.filter(
      (item) =>
        `${item.transactionDate || ""} ${
          item.voucherNo || ""
        } ${item.voucherType || ""} ${
          item.narration || ""
        }`
          .toLowerCase()
          .includes(keyword)
    );
  }, [transactions, search]);

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
  // STYLES
  // ==================================================

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.06)",
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
            📖 Ledger
          </h1>

          <div
            style={{
              color: "#64748b",
              fontSize: 13,
            }}
          >
            View account transactions,
            balances and running ledger
          </div>
        </div>

        {account && (
          <div
            style={{
              padding: "8px 13px",
              background: "#eff6ff",
              color: "#2563eb",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            ACCOUNT SELECTED
          </div>
        )}
      </div>

      {/* ==================================================
          ACCOUNT SELECTOR
      ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: 20,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            marginBottom: 15,
          }}
        >
          <div
            style={{
              color: "#0f172a",
              fontSize: 17,
              fontWeight: 900,
            }}
          >
            Select Account
          </div>

          <div
            style={{
              marginTop: 3,
              color: "#64748b",
              fontSize: 12,
            }}
          >
            Choose an account to view
            its complete ledger
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(280px, 1fr) auto auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 7,
                color: "#334155",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Account
            </label>

            <select
              value={accountId}
              onChange={(e) =>
                setAccountId(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "11px 12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                background: "#ffffff",
                fontSize: 13,
                outline: "none",
              }}
            >
              <option value="">
                Select Account
              </option>

              {accounts.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.code
                    ? `${item.code} - `
                    : ""}
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={loadLedger}
            disabled={loading}
            style={{
              padding:
                "11px 20px",
              background: loading
                ? "#94a3b8"
                : "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {loading
              ? "⏳ Loading..."
              : "🔎 View Ledger"}
          </button>

          <button
            type="button"
            onClick={clearLedger}
            style={{
              padding:
                "11px 20px",
              background: "#f1f5f9",
              color: "#475569",
              border:
                "1px solid #cbd5e1",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ==================================================
          ACCOUNT DETAILS
      ================================================== */}

      {account && (
        <>
          <div
            style={{
              ...cardStyle,
              padding: 20,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {String(
                  account.name || "?"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: 20,
                  }}
                >
                  {account.name}
                </h2>

                <div
                  style={{
                    marginTop: 3,
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  {account.code
                    ? `Account Code: ${account.code}`
                    : "Ledger Account"}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: 14,
                  background: "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: 9,
                }}
              >
                <div
                  style={{
                    color: "#64748b",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Account Group
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: "#0f172a",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {account.groupName ||
                    "-"}
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  background:
                    openingType ===
                    "Debit"
                      ? "#fff7ed"
                      : "#faf5ff",
                  border:
                    openingType ===
                    "Debit"
                      ? "1px solid #fed7aa"
                      : "1px solid #e9d5ff",
                  borderRadius: 9,
                }}
              >
                <div
                  style={{
                    color:
                      openingType ===
                      "Debit"
                        ? "#c2410c"
                        : "#7e22ce",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Opening Balance
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color:
                      openingType ===
                      "Debit"
                        ? "#9a3412"
                        : "#6b21a8",
                    fontSize: 16,
                    fontWeight: 900,
                  }}
                >
                  ₹ {money(openingBalance)}{" "}
                  <span
                    style={{
                      fontSize: 11,
                    }}
                  >
                    {openingType ===
                    "Debit"
                      ? "Dr"
                      : "Cr"}
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  background:
                    closingBalance >=
                    0
                      ? "#eff6ff"
                      : "#fef2f2",
                  border:
                    closingBalance >=
                    0
                      ? "1px solid #bfdbfe"
                      : "1px solid #fecaca",
                  borderRadius: 9,
                }}
              >
                <div
                  style={{
                    color:
                      closingBalance >=
                      0
                        ? "#1d4ed8"
                        : "#dc2626",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Closing Balance
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color:
                      closingBalance >=
                      0
                        ? "#1e40af"
                        : "#b91c1c",
                    fontSize: 16,
                    fontWeight: 900,
                  }}
                >
                  ₹ {money(displayBalance)}{" "}
                  <span
                    style={{
                      fontSize: 11,
                    }}
                  >
                    {displayBalanceType ===
                    "Debit"
                      ? "Dr"
                      : "Cr"}
                  </span>
                </div>
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
                "repeat(3, 1fr)",
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
                TOTAL DEBIT
              </div>

              <div
                style={{
                  marginTop: 7,
                  color: "#1e3a8a",
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                ₹ {money(totalDebit)}
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: "#3b82f6",
                  fontSize: 11,
                }}
              >
                Debit transactions
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
                TOTAL CREDIT
              </div>

              <div
                style={{
                  marginTop: 7,
                  color: "#166534",
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                ₹ {money(totalCredit)}
              </div>

              <div
                style={{
                  marginTop: 4,
                  color: "#16a34a",
                  fontSize: 11,
                }}
              >
                Credit transactions
              </div>
            </div>

            <div
              style={{
                ...cardStyle,
                padding: 18,
                background:
                  closingBalance >=
                  0
                    ? "#fff7ed"
                    : "#fef2f2",
                border:
                  closingBalance >=
                  0
                    ? "1px solid #fed7aa"
                    : "1px solid #fecaca",
              }}
            >
              <div
                style={{
                  color:
                    closingBalance >=
                    0
                      ? "#c2410c"
                      : "#dc2626",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                CLOSING BALANCE
              </div>

              <div
                style={{
                  marginTop: 7,
                  color:
                    closingBalance >=
                    0
                      ? "#9a3412"
                      : "#b91c1c",
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                ₹ {money(displayBalance)}
              </div>

              <div
                style={{
                  marginTop: 4,
                  color:
                    closingBalance >=
                    0
                      ? "#ea580c"
                      : "#ef4444",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {displayBalanceType}
              </div>
            </div>
          </div>

          {/* ==================================================
              LEDGER REGISTER
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
                gap: 15,
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
                  📋 Transaction Register
                </div>

                <div
                  style={{
                    marginTop: 3,
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  {filteredTransactions.length}{" "}
                  transaction
                  {filteredTransactions.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  displayed
                </div>
              </div>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="🔍 Search voucher, type or narration..."
                style={{
                  width: 330,
                  maxWidth: "100%",
                  padding:
                    "10px 12px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: 8,
                  outline: "none",
                  fontSize: 12,
                }}
              />
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
                  minWidth: 1000,
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
                      DATE
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
                      PARTICULARS
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      DEBIT
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      CREDIT
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign:
                          "right",
                      }}
                    >
                      BALANCE
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"
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
                          Loading Ledger...
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan="8"
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
                          No Transactions Found
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                          }}
                        >
                          This account
                          currently has no
                          ledger transactions.
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          padding: 50,
                          textAlign:
                            "center",
                          color:
                            "#64748b",
                        }}
                      >
                        🔍 No matching
                        transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(
                      (item, index) => {
                        const balance =
                          Number(
                            item.balance || 0
                          );

                        const debit =
                          Number(
                            item.debit || 0
                          );

                        const credit =
                          Number(
                            item.credit || 0
                          );

                        return (
                          <tr
                            key={
                              item.id ||
                              index
                            }
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
                                {index +
                                  1}
                              </span>
                            </td>

                            {/* DATE */}

                            <td
                              style={
                                tdStyle
                              }
                            >
                              {
                                item.transactionDate
                              }
                            </td>

                            {/* VOUCHER */}

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
                                {item.voucherNo ||
                                  "-"}
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
                                  padding:
                                    "5px 8px",
                                  background:
                                    "#f8fafc",
                                  border:
                                    "1px solid #e2e8f0",
                                  color:
                                    "#475569",
                                  borderRadius:
                                    6,
                                  fontSize:
                                    11,
                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  item.voucherType
                                }
                              </span>
                            </td>

                            {/* PARTICULARS */}

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <div
                                style={{
                                  maxWidth: 280,
                                  color:
                                    "#334155",
                                  fontWeight:
                                    600,
                                }}
                              >
                                {item.narration ||
                                  "-"}
                              </div>
                            </td>

                            {/* DEBIT */}

                            <td
                              style={{
                                ...tdStyle,
                                textAlign:
                                  "right",
                                color:
                                  debit > 0
                                    ? "#1d4ed8"
                                    : "#94a3b8",
                                fontWeight:
                                  debit > 0
                                    ? 800
                                    : 500,
                              }}
                            >
                              ₹{" "}
                              {money(debit)}
                            </td>

                            {/* CREDIT */}

                            <td
                              style={{
                                ...tdStyle,
                                textAlign:
                                  "right",
                                color:
                                  credit > 0
                                    ? "#15803d"
                                    : "#94a3b8",
                                fontWeight:
                                  credit > 0
                                    ? 800
                                    : 500,
                              }}
                            >
                              ₹{" "}
                              {money(credit)}
                            </td>

                            {/* BALANCE */}

                            <td
                              style={{
                                ...tdStyle,
                                textAlign:
                                  "right",
                              }}
                            >
                              <span
                                style={{
                                  display:
                                    "inline-block",
                                  padding:
                                    "6px 9px",
                                  borderRadius:
                                    6,
                                  background:
                                    balance >=
                                    0
                                      ? "#eff6ff"
                                      : "#fef2f2",
                                  color:
                                    balance >=
                                    0
                                      ? "#1d4ed8"
                                      : "#dc2626",
                                  fontWeight:
                                    900,
                                }}
                              >
                                ₹{" "}
                                {money(
                                  Math.abs(
                                    balance
                                  )
                                )}{" "}
                                {balance >=
                                0
                                  ? "Dr"
                                  : "Cr"}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>

                {/* FOOTER TOTAL */}

                {filteredTransactions.length >
                  0 && (
                  <tfoot>
                    <tr
                      style={{
                        background:
                          "#f8fafc",
                      }}
                    >
                      <td
                        colSpan="5"
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
                            "#1d4ed8",
                        }}
                      >
                        ₹{" "}
                        {money(
                          totalDebit
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "right",
                          fontWeight:
                            900,
                          color:
                            "#15803d",
                        }}
                      >
                        ₹{" "}
                        {money(
                          totalCredit
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "right",
                          fontWeight:
                            900,
                        }}
                      >
                        ₹{" "}
                        {money(
                          displayBalance
                        )}{" "}
                        {displayBalanceType ===
                        "Debit"
                          ? "Dr"
                          : "Cr"}
                      </td>
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
                  {
                    filteredTransactions.length
                  }
                </b>{" "}
                of{" "}
                <b
                  style={{
                    color:
                      "#334155",
                  }}
                >
                  {transactions.length}
                </b>{" "}
                transactions
              </span>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
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
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}