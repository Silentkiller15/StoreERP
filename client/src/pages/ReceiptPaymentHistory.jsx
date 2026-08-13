import { useEffect, useState } from "react";
import axios from "axios";

export default function ReceiptPaymentHistory() {
  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState("all");

  const loadHistory = async () => {
    try {
      setLoading(true);

      // ==========================================
      // GET ALL ACCOUNTS
      // ==========================================

      const accountsRes =
        await axios.get(
          "https://mudhikhana.onrender.com/accounts"
        );

      const accounts =
        accountsRes.data || [];

      const allTransactions = [];

      // ==========================================
      // LOAD LEDGER FOR EACH ACCOUNT
      // ==========================================

      for (const account of accounts) {
        try {
          const ledgerRes =
            await axios.get(
              `https://mudhikhana.onrender.com/accounts/${account.id}/ledger`
            );

          const ledgerData =
            ledgerRes.data || {};

          const accountTransactions =
            ledgerData.transactions || [];

          accountTransactions.forEach(
            (transaction) => {
              allTransactions.push({
                ...transaction,

                accountId:
                  account.id,

                accountName:
                  account.name,

                groupName:
                  account.groupName,
              });
            }
          );
        } catch (err) {
          console.log(
            `Unable to load account ${account.id}`,
            err
          );
        }
      }

      // ==========================================
      // IDENTIFY RECEIPTS / PAYMENTS
      // ==========================================

      const history =
        allTransactions
          .filter((transaction) => {
            const type = String(
              transaction.voucherType ||
                transaction.type ||
                ""
            ).toLowerCase();

            const debit =
              Number(
                transaction.debit
              ) || 0;

            const credit =
              Number(
                transaction.credit
              ) || 0;

            return (
              type.includes("receipt") ||
              type.includes("payment") ||
              type.includes("receipt voucher") ||
              type.includes("payment voucher")
            ) && (debit > 0 || credit > 0);
          })
          .map((transaction) => {
            const type = String(
              transaction.voucherType ||
                transaction.type ||
                ""
            ).toLowerCase();

            let transactionType =
              "Other";

            if (
              type.includes("receipt")
            ) {
              transactionType =
                "Receipt";
            }

            if (
              type.includes("payment")
            ) {
              transactionType =
                "Payment";
            }

            return {
              ...transaction,
              transactionType,
            };
          });

      // ==========================================
      // SORT NEWEST FIRST
      // ==========================================

      history.sort((a, b) => {
        const dateA = new Date(
          a.transactionDate || 0
        );

        const dateB = new Date(
          b.transactionDate || 0
        );

        if (
          dateA.getTime() !==
          dateB.getTime()
        ) {
          return (
            dateB.getTime() -
            dateA.getTime()
          );
        }

        return (
          Number(b.id || 0) -
          Number(a.id || 0)
        );
      });

      setTransactions(history);
    } catch (err) {
      console.log(
        "Receipt Payment History Error:",
        err
      );

      alert(
        "Unable to load Receipt / Payment History"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // ==========================================
  // MONEY FORMAT
  // ==========================================

  const money = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  // ==========================================
  // FILTER
  // ==========================================

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter(
          (transaction) =>
            transaction.transactionType.toLowerCase() ===
            filter
        );

  // ==========================================
  // TOTALS
  // ==========================================

  const totalReceipts =
    transactions
      .filter(
        (transaction) =>
          transaction.transactionType ===
          "Receipt"
      )
      .reduce((sum, transaction) => {
        const debit =
          Number(
            transaction.debit
          ) || 0;

        const credit =
          Number(
            transaction.credit
          ) || 0;

        return (
          sum +
          Math.max(
            debit,
            credit
          )
        );
      }, 0);

  const totalPayments =
    transactions
      .filter(
        (transaction) =>
          transaction.transactionType ===
          "Payment"
      )
      .reduce((sum, transaction) => {
        const debit =
          Number(
            transaction.debit
          ) || 0;

        const credit =
          Number(
            transaction.credit
          ) || 0;

        return (
          sum +
          Math.max(
            debit,
            credit
          )
        );
      }, 0);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      style={{
        padding: 24,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* ========================================
          HEADER
      ======================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 2,
              color: "#64748b",
            }}
          >
            STOREERP
          </div>

          <h1
            style={{
              margin: "5px 0",
              fontSize: 26,
              color: "#0f172a",
            }}
          >
            🧾 Receipt & Payment History
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            View receipt and payment
            transactions
          </p>
        </div>

        <button
          onClick={loadHistory}
          style={{
            padding: "9px 15px",
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
      </div>

      {/* ========================================
          SUMMARY
      ======================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        <div
          style={{
            background: "white",
            padding: 18,
            borderRadius: 10,
            borderLeft:
              "5px solid #16a34a",
            boxShadow:
              "0 2px 7px rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: 12,
            }}
          >
            🟢 Total Receipts
          </div>

          <h2
            style={{
              margin: "6px 0",
              color: "#15803d",
            }}
          >
            ₹ {money(totalReceipts)}
          </h2>
        </div>

        <div
          style={{
            background: "white",
            padding: 18,
            borderRadius: 10,
            borderLeft:
              "5px solid #dc2626",
            boxShadow:
              "0 2px 7px rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: 12,
            }}
          >
            🔴 Total Payments
          </div>

          <h2
            style={{
              margin: "6px 0",
              color: "#dc2626",
            }}
          >
            ₹ {money(totalPayments)}
          </h2>
        </div>

        <div
          style={{
            background: "white",
            padding: 18,
            borderRadius: 10,
            borderLeft:
              "5px solid #2563eb",
            boxShadow:
              "0 2px 7px rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: 12,
            }}
          >
            💰 Net Movement
          </div>

          <h2
            style={{
              margin: "6px 0",
              color:
                totalReceipts -
                  totalPayments >=
                0
                  ? "#2563eb"
                  : "#dc2626",
            }}
          >
            ₹{" "}
            {money(
              totalReceipts -
                totalPayments
            )}
          </h2>
        </div>
      </div>

      {/* ========================================
          FILTER
      ======================================== */}

      <div
        style={{
          marginTop: 20,
          padding: 12,
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: 10,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <b
          style={{
            fontSize: 13,
          }}
        >
          Show:
        </b>

        <button
          onClick={() =>
            setFilter("all")
          }
          style={{
            padding: "7px 13px",
            borderRadius: 7,
            cursor: "pointer",
            border:
              "1px solid #cbd5e1",
            background:
              filter === "all"
                ? "#334155"
                : "white",
            color:
              filter === "all"
                ? "white"
                : "#334155",
          }}
        >
          All
        </button>

        <button
          onClick={() =>
            setFilter("receipt")
          }
          style={{
            padding: "7px 13px",
            borderRadius: 7,
            cursor: "pointer",
            border:
              "1px solid #86efac",
            background:
              filter === "receipt"
                ? "#dcfce7"
                : "white",
            color: "#166534",
          }}
        >
          🟢 Receipts
        </button>

        <button
          onClick={() =>
            setFilter("payment")
          }
          style={{
            padding: "7px 13px",
            borderRadius: 7,
            cursor: "pointer",
            border:
              "1px solid #fca5a5",
            background:
              filter === "payment"
                ? "#fee2e2"
                : "white",
            color: "#991b1b",
          }}
        >
          🔴 Payments
        </button>
      </div>

      {/* ========================================
          TABLE
      ======================================== */}

      <div
        style={{
          marginTop: 16,
          background: "white",
          borderRadius: 10,
          border:
            "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: 50,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading receipt and payment
            history...
          </div>
        ) : filteredTransactions.length ===
          0 ? (
          <div
            style={{
              padding: 50,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: 35,
              }}
            >
              📋
            </div>

            <h3>
              No transactions found
            </h3>

            <p>
              Receipt and payment
              transactions will appear
              here.
            </p>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Date
                  </th>

                  <th style={thStyle}>
                    Type
                  </th>

                  <th style={thStyle}>
                    Voucher No
                  </th>

                  <th style={thStyle}>
                    Account
                  </th>

                  <th style={thStyle}>
                    Narration
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign: "right",
                    }}
                  >
                    Debit
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign: "right",
                    }}
                  >
                    Credit
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map(
                  (
                    transaction,
                    index
                  ) => (
                    <tr
                      key={
                        transaction.id ||
                        index
                      }
                    >
                      <td
                        style={tdStyle}
                      >
                        {transaction.transactionDate ||
                          "-"}
                      </td>

                      <td
                        style={tdStyle}
                      >
                        {transaction.transactionType ===
                        "Receipt" ? (
                          <span
                            style={{
                              background:
                                "#dcfce7",
                              color:
                                "#166534",
                              padding:
                                "4px 8px",
                              borderRadius:
                                20,
                              fontSize: 11,
                              fontWeight:
                                "bold",
                            }}
                          >
                            🟢 Receipt
                          </span>
                        ) : (
                          <span
                            style={{
                              background:
                                "#fee2e2",
                              color:
                                "#991b1b",
                              padding:
                                "4px 8px",
                              borderRadius:
                                20,
                              fontSize: 11,
                              fontWeight:
                                "bold",
                            }}
                          >
                            🔴 Payment
                          </span>
                        )}
                      </td>

                      <td
                        style={tdStyle}
                      >
                        <b>
                          {transaction.voucherNo ||
                            transaction.voucherId ||
                            "-"}
                        </b>
                      </td>

                      <td
                        style={tdStyle}
                      >
                        {
                          transaction.accountName
                        }
                      </td>

                      <td
                        style={tdStyle}
                      >
                        {transaction.narration ||
                          "-"}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "right",
                        }}
                      >
                        ₹{" "}
                        {money(
                          transaction.debit
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "right",
                        }}
                      >
                        ₹{" "}
                        {money(
                          transaction.credit
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px",
  background: "#f1f5f9",
  borderBottom:
    "1px solid #e2e8f0",
  textAlign: "left",
  fontSize: 12,
  color: "#475569",
};

const tdStyle = {
  padding: "11px 12px",
  borderBottom:
    "1px solid #f1f5f9",
  fontSize: 12,
};