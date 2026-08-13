import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function CashBankBook() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] =
    useState("all");

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ==================================================
  // LOAD CASH / BANK BOOK
  // ==================================================

  const loadCashBankBook = async () => {
    try {
      setLoading(true);

      const accountsRes = await axios.get(
        "http://localhost:5000/accounts"
      );

      const allAccounts =
        accountsRes.data || [];

      // Only Cash / Bank accounts
      const cashBankAccounts =
        allAccounts.filter((account) => {
          const group = String(
            account.groupName || ""
          ).toLowerCase();

          const name = String(
            account.name || ""
          ).toLowerCase();

          return (
            group.includes("cash") ||
            group.includes("bank") ||
            name.includes("cash") ||
            name.includes("bank")
          );
        });

      setAccounts(cashBankAccounts);

      // Load all account transactions
      const transactionResults = [];

      for (const account of cashBankAccounts) {
        try {
          const res = await axios.get(
            `http://localhost:5000/accounts/${account.id}/ledger`
          );

          const accountData = res.data;

          const openingBalance =
            Number(
              accountData.openingBalance
            ) || 0;

          const openingType =
            accountData.openingType ||
            "Debit";

          const accountTransactions =
            accountData.transactions || [];

          accountTransactions.forEach(
            (transaction) => {
              transactionResults.push({
                ...transaction,

                accountId: account.id,

                accountName: account.name,

                openingBalance,

                openingType,
              });
            }
          );
        } catch (accountErr) {
          console.log(
            "Account Ledger Error:",
            accountErr
          );
        }
      }

      // Sort by date and transaction ID
      transactionResults.sort(
        (a, b) => {
          const dateA = new Date(
            a.transactionDate
          );

          const dateB = new Date(
            b.transactionDate
          );

          if (
            dateA.getTime() !==
            dateB.getTime()
          ) {
            return (
              dateA.getTime() -
              dateB.getTime()
            );
          }

          return (
            Number(a.id || 0) -
            Number(b.id || 0)
          );
        }
      );

      setTransactions(
        transactionResults
      );
    } catch (err) {
      console.log(
        "Cash Bank Book Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load Cash / Bank Book"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashBankBook();
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
  // FILTER
  // ==================================================

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) => {
        const accountMatch =
          selectedAccount === "all" ||
          Number(
            transaction.accountId
          ) ===
            Number(selectedAccount);

        const keyword =
          search.trim().toLowerCase();

        const searchMatch =
          !keyword ||
          `${transaction.accountName || ""} ${
            transaction.transactionDate ||
            ""
          } ${
            transaction.voucherType || ""
          } ${
            transaction.voucherNo ||
            transaction.voucherId ||
            ""
          } ${
            transaction.narration || ""
          }`
            .toLowerCase()
            .includes(keyword);

        return (
          accountMatch &&
          searchMatch
        );
      }
    );
  }, [
    transactions,
    selectedAccount,
    search,
  ]);

  // ==================================================
  // TOTALS
  // ==================================================

  const totalDebit =
    filteredTransactions.reduce(
      (sum, transaction) =>
        sum +
        (Number(
          transaction.debit
        ) || 0),
      0
    );

  const totalCredit =
    filteredTransactions.reduce(
      (sum, transaction) =>
        sum +
        (Number(
          transaction.credit
        ) || 0),
      0
    );

  const netMovement =
    totalDebit - totalCredit;

  // ==================================================
  // SELECTED ACCOUNT
  // ==================================================

  const selectedAccountData =
    accounts.find(
      (account) =>
        Number(account.id) ===
        Number(selectedAccount)
    );

  // ==================================================
  // DEBIT / CREDIT COUNT
  // ==================================================

  const debitTransactions =
    filteredTransactions.filter(
      (transaction) =>
        Number(transaction.debit || 0) >
        0
    ).length;

  const creditTransactions =
    filteredTransactions.filter(
      (transaction) =>
        Number(transaction.credit || 0) >
        0
    ).length;

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
            Banking & Cash Management
          </div>

          <h1
            style={{
              margin: "4px 0 5px",
              color: "#0f172a",
              fontSize: 26,
            }}
          >
            🏦 Cash / Bank Book
          </h1>

          <div
            style={{
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Monitor cash and bank account
            movements in one place
          </div>
        </div>

        <button
          type="button"
          onClick={loadCashBankBook}
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
          🔄 Refresh
        </button>
      </div>

      {/* ==================================================
          ACCOUNT FILTER
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
              Account Selection
            </div>

            <div
              style={{
                marginTop: 3,
                color: "#64748b",
                fontSize: 12,
              }}
            >
              Select a specific Cash or Bank
              account or view all accounts
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <select
              value={selectedAccount}
              onChange={(e) =>
                setSelectedAccount(
                  e.target.value
                )
              }
              style={{
                minWidth: 280,
                padding:
                  "11px 12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                background:
                  "#ffffff",
                outline: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <option value="all">
                All Cash / Bank Accounts
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

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="🔍 Search transactions..."
              style={{
                width: 260,
                padding:
                  "11px 12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                outline: "none",
                fontSize: 13,
              }}
            />
          </div>
        </div>

        {selectedAccountData && (
          <div
            style={{
              marginTop: 16,
              padding: 13,
              background: "#eff6ff",
              border:
                "1px solid #bfdbfe",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius:
                  "50%",
                background:
                  "#dbeafe",
                color:
                  "#1d4ed8",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontWeight: 900,
              }}
            >
              {String(
                selectedAccountData.name ||
                  "?"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  color:
                    "#1e3a8a",
                  fontWeight:
                    900,
                  fontSize: 13,
                }}
              >
                {
                  selectedAccountData.name
                }
              </div>

              <div
                style={{
                  color:
                    "#64748b",
                  fontSize: 11,
                }}
              >
                Selected Cash / Bank
                Account
              </div>
            </div>
          </div>
        )}
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
        {/* DEBIT */}

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
              fontSize: 23,
              fontWeight: 900,
            }}
          >
            ₹ {money(totalDebit)}
          </div>

          <div
            style={{
              marginTop: 4,
              color: "#64748b",
              fontSize: 11,
            }}
          >
            {debitTransactions} debit
            transactions
          </div>
        </div>

        {/* CREDIT */}

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
              fontSize: 23,
              fontWeight: 900,
            }}
          >
            ₹ {money(totalCredit)}
          </div>

          <div
            style={{
              marginTop: 4,
              color: "#64748b",
              fontSize: 11,
            }}
          >
            {creditTransactions} credit
            transactions
          </div>
        </div>

        {/* NET */}

        <div
          style={{
            ...cardStyle,
            padding: 18,
            background:
              netMovement >= 0
                ? "#fff7ed"
                : "#fef2f2",
            border:
              netMovement >= 0
                ? "1px solid #fed7aa"
                : "1px solid #fecaca",
          }}
        >
          <div
            style={{
              color:
                netMovement >= 0
                  ? "#c2410c"
                  : "#dc2626",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            NET MOVEMENT
          </div>

          <div
            style={{
              marginTop: 7,
              color:
                netMovement >= 0
                  ? "#9a3412"
                  : "#b91c1c",
              fontSize: 23,
              fontWeight: 900,
            }}
          >
            ₹{" "}
            {money(
              Math.abs(
                netMovement
              )
            )}
          </div>

          <div
            style={{
              marginTop: 4,
              color: "#64748b",
              fontSize: 11,
            }}
          >
            {netMovement >= 0
              ? "Debit movement"
              : "Credit movement"}
          </div>
        </div>

        {/* TRANSACTIONS */}

        <div
          style={{
            ...cardStyle,
            padding: 18,
            background: "#faf5ff",
            border:
              "1px solid #e9d5ff",
          }}
        >
          <div
            style={{
              color: "#7e22ce",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            TRANSACTIONS
          </div>

          <div
            style={{
              marginTop: 7,
              color: "#6b21a8",
              fontSize: 23,
              fontWeight: 900,
            }}
          >
            {filteredTransactions.length}
          </div>

          <div
            style={{
              marginTop: 4,
              color: "#64748b",
              fontSize: 11,
            }}
          >
            Matching transactions
          </div>
        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      {loading ? (
        <div
          style={{
            ...cardStyle,
            padding: 60,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 10,
            }}
          >
            ⏳
          </div>

          <div
            style={{
              color: "#334155",
              fontWeight: 800,
            }}
          >
            Loading Cash / Bank Book...
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            padding: 60,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 45,
              marginBottom: 10,
            }}
          >
            🏦
          </div>

          <div
            style={{
              color: "#334155",
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            No Cash or Bank Accounts
            Found
          </div>

          <div
            style={{
              marginTop: 5,
              color: "#64748b",
              fontSize: 12,
            }}
          >
            Create a Cash or Bank account
            to view transactions here.
          </div>
        </div>
      ) : (
        /* ==================================================
           TRANSACTION REGISTER
        ================================================== */

        <div
          style={{
            ...cardStyle,
            overflow: "hidden",
          }}
        >
          {/* HEADER */}

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
                  color:
                    "#0f172a",
                  fontSize: 17,
                  fontWeight:
                    900,
                }}
              >
                📋 Transaction Register
              </div>

              <div
                style={{
                  marginTop: 3,
                  color:
                    "#64748b",
                  fontSize: 12,
                }}
              >
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
                transactions
              </div>
            </div>

            {(search ||
              selectedAccount !==
                "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedAccount(
                    "all"
                  );
                }}
                style={{
                  padding:
                    "8px 12px",
                  background:
                    "#f1f5f9",
                  color:
                    "#475569",
                  border:
                    "1px solid #cbd5e1",
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
                Clear Filters
              </button>
            )}
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
                minWidth: 1100,
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
                    ACCOUNT
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    VOUCHER
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
                    NARRATION
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
                {filteredTransactions.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="9"
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
                          color:
                            "#334155",
                          fontWeight:
                            800,
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
                        Try changing your
                        account or search
                        filter.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(
                    (
                      transaction,
                      index
                    ) => {
                      const debit =
                        Number(
                          transaction.debit ||
                            0
                        );

                      const credit =
                        Number(
                          transaction.credit ||
                            0
                        );

                      const balance =
                        Number(
                          transaction.balance ||
                            0
                        );

                      return (
                        <tr
                          key={`${transaction.accountId}-${transaction.id}-${index}`}
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
                            <span
                              style={{
                                color:
                                  "#334155",
                                fontWeight:
                                  600,
                              }}
                            >
                              {
                                transaction.transactionDate
                              }
                            </span>
                          </td>

                          {/* ACCOUNT */}

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
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 30,
                                  height: 30,
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
                                  fontSize:
                                    11,
                                  fontWeight:
                                    900,
                                }}
                              >
                                {String(
                                  transaction.accountName ||
                                    "?"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <span
                                style={{
                                  color:
                                    "#0f172a",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {
                                  transaction.accountName
                                }
                              </span>
                            </div>
                          </td>

                          {/* VOUCHER TYPE */}

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
                                  800,
                              }}
                            >
                              {transaction.voucherType ||
                                "-"}
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
                              {transaction.voucherNo ||
                                transaction.voucherId ||
                                "-"}
                            </span>
                          </td>

                          {/* NARRATION */}

                          <td
                            style={
                              tdStyle
                            }
                          >
                            <div
                              style={{
                                maxWidth: 260,
                                color:
                                  "#475569",
                              }}
                            >
                              {transaction.narration ||
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
                            {money(
                              debit
                            )}
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
                            {money(
                              credit
                            )}
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

              {/* TOTAL */}

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
                      colSpan="6"
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
                        Math.abs(
                          netMovement
                        )
                      )}
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
              flexWrap: "wrap",
              gap: 10,
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

            <span>
              {accounts.length} Cash /
              Bank account
              {accounts.length ===
              1
                ? ""
                : "s"}{" "}
              available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}