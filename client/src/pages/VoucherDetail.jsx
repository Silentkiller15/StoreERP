import { useEffect, useState } from "react";
import axios from "axios";

export default function VoucherDetail() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] =
    useState([]);

  const [selectedVoucher, setSelectedVoucher] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  // ==========================================
  // LOAD ALL ACCOUNT TRANSACTIONS
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);

      const accountsRes =
        await axios.get(
          "http://localhost:5000/accounts"
        );

      const accountList =
        accountsRes.data || [];

      setAccounts(accountList);

      const allTransactions = [];

      for (const account of accountList) {
        try {
          const ledgerRes =
            await axios.get(
              `http://localhost:5000/accounts/${account.id}/ledger`
            );

          const ledger =
            ledgerRes.data || {};

          const accountTransactions =
            ledger.transactions || [];

          accountTransactions.forEach(
            (transaction) => {
              allTransactions.push({
                ...transaction,

                accountId:
                  account.id,

                accountName:
                  account.name,
              });
            }
          );
        } catch (err) {
          console.log(
            "Ledger load error:",
            account.id,
            err
          );
        }
      }

      // ========================================
      // SORT NEWEST FIRST
      // ========================================

      allTransactions.sort(
        (a, b) => {
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
        }
      );

      setTransactions(
        allTransactions
      );
    } catch (err) {
      console.log(
        "Voucher Detail Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load voucher data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // GET VOUCHER NUMBER
  // ==========================================

  const getVoucherNo = (
    transaction
  ) => {
    return (
      transaction.voucherNo ||
      transaction.voucherNumber ||
      transaction.voucherId ||
      ""
    );
  };

  // ==========================================
  // GET UNIQUE VOUCHERS
  // ==========================================

  const voucherMap = {};

  transactions.forEach(
    (transaction) => {
      const voucherNo =
        getVoucherNo(transaction);

      if (!voucherNo) {
        return;
      }

      if (!voucherMap[voucherNo]) {
        voucherMap[voucherNo] = {
          voucherNo,
          date:
            transaction.transactionDate ||
            "-",
          type:
            transaction.voucherType ||
            transaction.type ||
            "-",
        };
      }
    }
  );

  const vouchers =
    Object.values(voucherMap);

  // ==========================================
  // SELECTED VOUCHER ENTRIES
  // ==========================================

  const voucherEntries =
    selectedVoucher
      ? transactions.filter(
          (transaction) =>
            String(
              getVoucherNo(
                transaction
              )
            ) ===
            String(
              selectedVoucher
            )
        )
      : [];

  // ==========================================
  // TOTALS
  // ==========================================

  const totalDebit =
    voucherEntries.reduce(
      (sum, transaction) =>
        sum +
        (Number(
          transaction.debit
        ) || 0),
      0
    );

  const totalCredit =
    voucherEntries.reduce(
      (sum, transaction) =>
        sum +
        (Number(
          transaction.credit
        ) || 0),
      0
    );

  // ==========================================
  // VOUCHER HEADER INFORMATION
  // ==========================================

  const selectedEntry =
    voucherEntries[0];

  const voucherDate =
    selectedEntry?.transactionDate ||
    "-";

  const voucherType =
    selectedEntry?.voucherType ||
    selectedEntry?.type ||
    "-";

  const narration =
    selectedEntry?.narration ||
    selectedEntry?.description ||
    "-";

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
  // HANDLE VOUCHER CHANGE
  // ==========================================

  const handleVoucherChange =
    (event) => {
      setLoadingDetails(true);

      const value =
        event.target.value;

      setSelectedVoucher(value);

      setTimeout(() => {
        setLoadingDetails(false);
      }, 150);
    };

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
            🧾 Voucher Detail
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            View complete accounting
            entries for a voucher
          </p>
        </div>

        <button
          onClick={loadData}
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
          VOUCHER SELECT
      ======================================== */}

      <div
        style={{
          background: "white",
          padding: 18,
          borderRadius: 10,
          border:
            "1px solid #e2e8f0",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontSize: 13,
            fontWeight: "bold",
            color: "#334155",
          }}
        >
          Select Voucher
        </label>

        <select
          value={selectedVoucher}
          onChange={
            handleVoucherChange
          }
          style={{
            width: "100%",
            maxWidth: 450,
            padding: "10px 12px",
            border:
              "1px solid #cbd5e1",
            borderRadius: 8,
            background: "white",
            fontSize: 14,
          }}
        >
          <option value="">
            -- Select Voucher --
          </option>

          {vouchers.map(
            (voucher) => (
              <option
                key={voucher.voucherNo}
                value={
                  voucher.voucherNo
                }
              >
                {voucher.voucherNo} —{" "}
                {voucher.type} —{" "}
                {voucher.date}
              </option>
            )
          )}
        </select>
      </div>

      {/* ========================================
          LOADING
      ======================================== */}

      {loading && (
        <div
          style={{
            marginTop: 20,
            padding: 40,
            background: "white",
            borderRadius: 10,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Loading vouchers...
        </div>
      )}

      {/* ========================================
          NO VOUCHER SELECTED
      ======================================== */}

      {!loading &&
        !selectedVoucher && (
          <div
            style={{
              marginTop: 20,
              padding: 45,
              background: "white",
              borderRadius: 10,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: 40,
              }}
            >
              🧾
            </div>

            <h3>
              Select a voucher
            </h3>

            <p>
              Choose a voucher above
              to view its accounting
              entries.
            </p>
          </div>
        )}

      {/* ========================================
          VOUCHER DETAIL
      ======================================== */}

      {selectedVoucher &&
        !loadingDetails && (
          <>
            {/* ==================================
                HEADER CARD
            ================================== */}

            <div
              style={{
                marginTop: 20,
                background: "white",
                padding: 20,
                borderRadius: 10,
                border:
                  "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: 20,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: 12,
                    }}
                  >
                    Voucher No
                  </p>

                  <h3
                    style={{
                      margin:
                        "5px 0",
                    }}
                  >
                    {selectedVoucher}
                  </h3>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: 12,
                    }}
                  >
                    Date
                  </p>

                  <h3
                    style={{
                      margin:
                        "5px 0",
                    }}
                  >
                    {voucherDate}
                  </h3>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: 12,
                    }}
                  >
                    Voucher Type
                  </p>

                  <h3
                    style={{
                      margin:
                        "5px 0",
                    }}
                  >
                    {voucherType}
                  </h3>
                </div>
              </div>

              <div
                style={{
                  marginTop: 15,
                  paddingTop: 15,
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  Narration
                </p>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    fontSize: 13,
                  }}
                >
                  {narration}
                </p>
              </div>
            </div>

            {/* ==================================
                BALANCE STATUS
            ================================== */}

            <div
              style={{
                marginTop: 16,
                padding: 15,
                borderRadius: 10,
                background:
                  Math.abs(
                    totalDebit -
                      totalCredit
                  ) < 0.01
                    ? "#dcfce7"
                    : "#fee2e2",
                color:
                  Math.abs(
                    totalDebit -
                      totalCredit
                  ) < 0.01
                    ? "#166534"
                    : "#991b1b",
                fontWeight: "bold",
              }}
            >
              {Math.abs(
                totalDebit -
                  totalCredit
              ) < 0.01
                ? "✓ Voucher is balanced"
                : "⚠ Voucher is not balanced"}
            </div>

            {/* ==================================
                ENTRIES TABLE
            ================================== */}

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
              {voucherEntries.length ===
              0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No accounting entries
                  found for this voucher.
                </div>
              ) : (
                <div
                  style={{
                    overflowX:
                      "auto",
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
                        <th
                          style={
                            thStyle
                          }
                        >
                          Account
                        </th>

                        <th
                          style={
                            thStyle
                          }
                        >
                          Description
                        </th>

                        <th
                          style={{
                            ...thStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          Debit
                        </th>

                        <th
                          style={{
                            ...thStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          Credit
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {voucherEntries.map(
                        (
                          entry,
                          index
                        ) => (
                          <tr
                            key={
                              entry.id ||
                              index
                            }
                          >
                            <td
                              style={
                                tdStyle
                              }
                            >
                              <b>
                                {
                                  entry.accountName
                                }
                              </b>
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              {entry.narration ||
                                entry.description ||
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
                                entry.debit
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
                                entry.credit
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                    <tfoot>
                      <tr
                        style={{
                          background:
                            "#f8fafc",
                          fontWeight:
                            "bold",
                        }}
                      >
                        <td
                          colSpan="2"
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                          }}
                        >
                          TOTAL
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
                            totalDebit
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
                            totalCredit
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
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