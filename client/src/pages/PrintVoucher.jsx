import { useEffect, useState } from "react";
import axios from "axios";
import CompanyHeader from "./CompanyHeader";

export default function PrintVoucher() {
  const [transactions, setTransactions] =
    useState([]);

  const [selectedVoucher, setSelectedVoucher] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // ==================================================
  // LOAD DATA
  // ==================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const accountsRes =
        await axios.get(
          "https://mudhikhana.onrender.com/accounts"
        );

      const accounts =
        accountsRes.data || [];

      const allTransactions = [];

      for (const account of accounts) {
        try {
          const ledgerRes =
            await axios.get(
              `https://mudhikhana.onrender.com/accounts/${account.id}/ledger`
            );

          const ledger =
            ledgerRes.data || {};

          const accountTransactions =
            ledger.transactions || [];

          accountTransactions.forEach(
            (transaction) => {
              allTransactions.push({
                ...transaction,
                accountName:
                  account.name,
              });
            }
          );
        } catch (err) {
          console.log(
            "Ledger error:",
            account.id,
            err
          );
        }
      }

      setTransactions(
        allTransactions
      );
    } catch (err) {
      console.log(
        "Print Voucher Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load vouchers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==================================================
  // GET VOUCHER NUMBER
  // ==================================================

  const getVoucherNo = (
    transaction
  ) =>
    transaction.voucherNo ||
    transaction.voucherNumber ||
    transaction.voucherId ||
    "";

  // ==================================================
  // CREATE UNIQUE VOUCHER LIST
  // ==================================================

  const voucherMap = {};

  transactions.forEach(
    (transaction) => {
      const voucherNo =
        getVoucherNo(transaction);

      if (!voucherNo) return;

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

  // ==================================================
  // SELECTED VOUCHER ENTRIES
  // ==================================================

  const entries =
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

  const firstEntry =
    entries[0];

  // ==================================================
  // TOTALS
  // ==================================================

  const totalDebit =
    entries.reduce(
      (sum, entry) =>
        sum +
        (Number(entry.debit) || 0),
      0
    );

  const totalCredit =
    entries.reduce(
      (sum, entry) =>
        sum +
        (Number(entry.credit) || 0),
      0
    );

  // ==================================================
  // NARRATION
  // ==================================================

  const narration =
    firstEntry?.narration ||
    firstEntry?.description ||
    "-";

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
  // PRINT
  // ==================================================

  const printVoucher = () => {
    if (!selectedVoucher) {
      alert(
        "Please select a voucher first."
      );

      return;
    }

    window.print();
  };

  // ==================================================
  // VOUCHER BALANCE
  // ==================================================

  const isBalanced =
    Math.abs(
      totalDebit -
        totalCredit
    ) < 0.01;

  return (
    <>
      {/* ==================================================
          MAIN SCREEN
      ================================================== */}

      <div
        className="voucher-page"
        style={{
          padding: 24,
          background: "#f8fafc",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* ==================================================
            SCREEN HEADER
        ================================================== */}

        <div
          className="no-print voucher-screen-header"
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 20,
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
              COMPANY
            </div>

            <h1
              style={{
                margin: "5px 0",
                fontSize: 26,
              }}
            >
              🖨️ Print Voucher
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Select a voucher and
              print the accounting
              document
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            {/* REFRESH */}

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

            {/* PRINT */}

            <button
              onClick={printVoucher}
              disabled={
                !selectedVoucher
              }
              style={{
                padding:
                  "10px 18px",
                background:
                  selectedVoucher
                    ? "#2563eb"
                    : "#cbd5e1",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor:
                  selectedVoucher
                    ? "pointer"
                    : "not-allowed",
                fontWeight: "bold",
              }}
            >
              🖨️ Print Voucher
            </button>
          </div>
        </div>

        {/* ==================================================
            VOUCHER SELECT
        ================================================== */}

        <div
          className="no-print"
          style={{
            background: "white",
            padding: 18,
            borderRadius: 10,
            marginBottom: 20,
            border:
              "1px solid #e2e8f0",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: "bold",
              fontSize: 13,
            }}
          >
            Select Voucher
          </label>

          <select
            value={selectedVoucher}
            onChange={(e) =>
              setSelectedVoucher(
                e.target.value
              )
            }
            style={{
              width: "100%",
              maxWidth: 500,
              padding: 11,
              border:
                "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 14,
              background: "white",
            }}
          >
            <option value="">
              -- Select Voucher --
            </option>

            {vouchers.map(
              (voucher) => (
                <option
                  key={
                    voucher.voucherNo
                  }
                  value={
                    voucher.voucherNo
                  }
                >
                  {voucher.voucherNo}
                  {" — "}
                  {voucher.type}
                  {" — "}
                  {voucher.date}
                </option>
              )
            )}
          </select>

          <div
            style={{
              marginTop: 8,
              color: "#64748b",
              fontSize: 11,
            }}
          >
            {vouchers.length} voucher
            {vouchers.length === 1
              ? ""
              : "s"} available
          </div>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div
            className="no-print"
            style={{
              background: "white",
              padding: 40,
              textAlign: "center",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 30,
                marginBottom: 10,
              }}
            >
              ⏳
            </div>

            Loading vouchers...
          </div>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading &&
          !selectedVoucher && (
            <div
              className="no-print"
              style={{
                background: "white",
                padding: 50,
                textAlign: "center",
                borderRadius: 10,
                color: "#64748b",
                border:
                  "1px solid #e2e8f0",
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
                Select a voucher above
                to preview it before
                printing.
              </p>
            </div>
          )}

        {/* ==================================================
            PRINT DOCUMENT
        ================================================== */}

        {selectedVoucher && (
          <div
            className="print-voucher"
            style={{
              width: "100%",
              maxWidth: 850,
              margin: "0 auto",
              background: "white",
              padding: 40,
              boxSizing: "border-box",
              border:
                "1px solid #d1d5db",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.08)",
            }}
          >
            {/* ==================================================
                COMPANY HEADER
            ================================================== */}

            <CompanyHeader print={true} />

            {/* ==================================================
                VOUCHER TITLE
            ================================================== */}

            <div
              style={{
                textAlign: "center",
                margin:
                  "16px 0",
              }}
            >
              <div
                style={{
                  display:
                    "inline-block",
                  padding:
                    "5px 16px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: 20,
                  fontSize: 11,
                  color: "#475569",
                }}
              >
                ACCOUNTING VOUCHER
              </div>

              <h2
                style={{
                  margin:
                    "8px 0 0",
                  textTransform:
                    "uppercase",
                  letterSpacing: 1,
                  fontSize: 21,
                }}
              >
                {firstEntry?.voucherType ||
                  firstEntry?.type ||
                  "Voucher"}
              </h2>
            </div>

            {/* ==================================================
                VOUCHER INFORMATION
            ================================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 10,
                marginBottom: 16,
                padding: 10,
                background:
                  "#f8fafc",
                border:
                  "1px solid #e2e8f0",
                borderRadius: 6,
              }}
            >
              <div>
                <b>
                  Voucher No:
                </b>{" "}
                {selectedVoucher}
              </div>

              <div
                style={{
                  textAlign:
                    "right",
                }}
              >
                <b>
                  Date:
                </b>{" "}
                {firstEntry?.transactionDate ||
                  "-"}
              </div>
            </div>

            {/* ==================================================
                ACCOUNT TABLE
            ================================================== */}

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                tableLayout:
                  "fixed",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...thStyle,
                      width: "38%",
                    }}
                  >
                    Account
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "32%",
                    }}
                  >
                    Narration
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "15%",
                      textAlign:
                        "right",
                    }}
                  >
                    Debit
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width: "15%",
                      textAlign:
                        "right",
                    }}
                  >
                    Credit
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map(
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
                        {Number(
                          entry.debit
                        ) > 0
                          ? `₹ ${money(
                              entry.debit
                            )}`
                          : "-"}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign:
                            "right",
                        }}
                      >
                        {Number(
                          entry.credit
                        ) > 0
                          ? `₹ ${money(
                              entry.credit
                            )}`
                          : "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td
                    colSpan="2"
                    style={{
                      ...tdStyle,
                      textAlign:
                        "right",
                      fontWeight:
                        "bold",
                      background:
                        "#f8fafc",
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
                        "bold",
                      background:
                        "#f8fafc",
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
                        "bold",
                      background:
                        "#f8fafc",
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

            {/* ==================================================
                NARRATION
            ================================================== */}

            <div
              style={{
                marginTop: 18,
                padding: 12,
                border:
                  "1px solid #d1d5db",
                borderRadius: 5,
                minHeight: 50,
              }}
            >
              <b>
                Narration:
              </b>

              <div
                style={{
                  marginTop: 6,
                }}
              >
                {narration}
              </div>
            </div>

            {/* ==================================================
                BALANCE CHECK
            ================================================== */}

            <div
              style={{
                marginTop: 12,
                padding: 8,
                textAlign: "right",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              {isBalanced ? (
                <span
                  style={{
                    color:
                      "#15803d",
                  }}
                >
                  ✓ Debit = Credit
                </span>
              ) : (
                <span
                  style={{
                    color:
                      "#dc2626",
                  }}
                >
                  ⚠ Voucher is not
                  balanced
                </span>
              )}
            </div>

            {/* ==================================================
                SIGNATURES
            ================================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                marginTop: 45,
                gap: 70,
              }}
            >
              <div
                style={{
                  borderTop:
                    "1px solid #111827",
                  paddingTop: 6,
                  textAlign:
                    "center",
                  fontSize: 11,
                }}
              >
                Prepared By
              </div>

              <div
                style={{
                  borderTop:
                    "1px solid #111827",
                  paddingTop: 6,
                  textAlign:
                    "center",
                  fontSize: 11,
                }}
              >
                Authorized Signature
              </div>
            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div
              style={{
                marginTop: 18,
                paddingTop: 8,
                borderTop:
                  "1px solid #e5e7eb",
                textAlign: "center",
                fontSize: 9,
                color: "#64748b",
              }}
            >
              Generated by company
              accounting system
            </div>
          </div>
        )}
      </div>

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
            }

            /* HIDE SIDEBAR */

            aside,
            nav,
            .sidebar {
              display: none !important;
            }

            /* HIDE SCREEN CONTROLS */

            .no-print {
              display: none !important;
            }

            /* PAGE */

            .voucher-page {
              width: 100% !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              box-sizing: border-box !important;
            }

            /* VOUCHER */

            .print-voucher {
              display: block !important;
              position: relative !important;

              width: 100% !important;
              max-width: none !important;

              margin: 0 !important;
              padding: 10px !important;

              background: white !important;

              border: none !important;
              box-shadow: none !important;

              box-sizing: border-box !important;

              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            /* COMPANY HEADER */

            .company-header {
              margin-bottom: 10px !important;
              padding-bottom: 8px !important;
            }

            .company-header h1 {
              font-size: 22px !important;
            }

            .company-header img {
              max-width: 70px !important;
              max-height: 55px !important;
            }

            /* TABLE */

            .print-voucher table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              font-size: 10px !important;
            }

            .print-voucher th {
              padding: 6px !important;
              font-size: 10px !important;
            }

            .print-voucher td {
              padding: 6px !important;
              font-size: 10px !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }

            .print-voucher tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .print-voucher > div {
              break-inside: avoid;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }

          @media screen {
            .print-voucher {
              margin-bottom: 40px;
            }
          }
        `}
      </style>
    </>
  );
}

// ==================================================
// TABLE STYLES
// ==================================================

const thStyle = {
  padding: "8px",
  background: "#f1f5f9",
  border:
    "1px solid #cbd5e1",
  textAlign: "left",
  fontSize: 11,
};

const tdStyle = {
  padding: "8px",
  border:
    "1px solid #cbd5e1",
  fontSize: 11,
};