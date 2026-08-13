import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [groups, setGroups] = useState([]);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [openingBalance, setOpeningBalance] =
    useState("");
  const [openingType, setOpeningType] =
    useState("Debit");

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [groupFilter, setGroupFilter] =
    useState("");

  // ==================================================
  // LOAD DATA
  // ==================================================

  useEffect(() => {
    loadAccounts();
    loadGroups();
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
      console.log(err);
      alert("Unable to load accounts");
    }
  };

  // ==================================================
  // LOAD ACCOUNT GROUPS
  // ==================================================

  const loadGroups = async () => {
    try {
      const res = await axios.get(
        "https://mudhikhana.onrender.com/accounts/groups"
      );

      setGroups(res.data || []);
    } catch (err) {
      console.log(err);
      alert("Unable to load account groups");
    }
  };

  // ==================================================
  // RESET FORM
  // ==================================================

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setName("");
    setGroupId("");
    setOpeningBalance("");
    setOpeningType("Debit");
  };

  // ==================================================
  // SAVE ACCOUNT
  // ==================================================

  const saveAccount = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter Account Name");
      return;
    }

    if (!groupId) {
      alert("Please select Account Group");
      return;
    }

    const data = {
      code: code.trim(),
      name: name.trim(),
      groupId: Number(groupId),
      openingBalance:
        Number(openingBalance) || 0,
      openingType,
    };

    try {
      if (editingId) {
        await axios.put(
          `https://mudhikhana.onrender.com/accounts/${editingId}`,
          data
        );

        alert(
          "Account Updated Successfully"
        );
      } else {
        await axios.post(
          "https://mudhikhana.onrender.com/accounts",
          data
        );

        alert(
          "Account Created Successfully"
        );
      }

      resetForm();
      loadAccounts();
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Unable to save account"
      );
    }
  };

  // ==================================================
  // EDIT ACCOUNT
  // ==================================================

  const editAccount = (account) => {
    setEditingId(account.id);

    setCode(account.code || "");
    setName(account.name || "");

    setGroupId(
      account.groupId
        ? String(account.groupId)
        : ""
    );

    setOpeningBalance(
      account.openingBalance || ""
    );

    setOpeningType(
      account.openingType || "Debit"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // DELETE ACCOUNT
  // ==================================================

  const deleteAccount = async (id) => {
    if (
      !window.confirm(
        "Delete this account?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `https://mudhikhana.onrender.com/accounts/${id}`
      );

      alert(
        "Account Deleted Successfully"
      );

      loadAccounts();
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Unable to delete account"
      );
    }
  };

  // ==================================================
  // GROUP NAME
  // ==================================================

  const getGroupName = (groupId) => {
    const group = groups.find(
      (g) =>
        Number(g.id) ===
        Number(groupId)
    );

    return group
      ? group.name
      : "-";
  };

  // ==================================================
  // FILTERED ACCOUNTS
  // ==================================================

  const filteredAccounts = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return accounts.filter(
      (account) => {
        const matchesSearch =
          !keyword ||
          `${account.code || ""} ${
            account.name || ""
          } ${getGroupName(
            account.groupId
          )}`
            .toLowerCase()
            .includes(keyword);

        const matchesGroup =
          !groupFilter ||
          String(account.groupId) ===
            String(groupFilter);

        return (
          matchesSearch &&
          matchesGroup
        );
      }
    );
  }, [
    accounts,
    groups,
    search,
    groupFilter,
  ]);

  // ==================================================
  // SUMMARY
  // ==================================================

  const activeAccounts =
    accounts.filter(
      (account) =>
        Number(account.isActive) === 1
    ).length;

  const debitOpening =
    accounts
      .filter(
        (account) =>
          account.openingType ===
          "Debit"
      )
      .reduce(
        (sum, account) =>
          sum +
          Number(
            account.openingBalance
          ),
        0
      );

  const creditOpening =
    accounts
      .filter(
        (account) =>
          account.openingType ===
          "Credit"
      )
      .reduce(
        (sum, account) =>
          sum +
          Number(
            account.openingBalance
          ),
        0
      );

  // ==================================================
  // STYLES
  // ==================================================

  const cardStyle = {
    background: "#ffffff",
    border:
      "1px solid #e2e8f0",
    borderRadius: 12,
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.06)",
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    boxSizing: "border-box",
    border:
      "1px solid #cbd5e1",
    borderRadius: 8,
    outline: "none",
    fontSize: 13,
    background: "#ffffff",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 7,
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
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
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
            }}
          >
            Accounting
          </div>

          <h1
            style={{
              margin:
                "4px 0 5px",
              color: "#0f172a",
              fontSize: 26,
            }}
          >
            📚 Account Master
          </h1>

          <div
            style={{
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Manage ledger accounts,
            groups and opening balances
          </div>
        </div>

        <button
          type="button"
          onClick={resetForm}
          style={{
            padding:
              "10px 17px",
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          ➕ New Account
        </button>
      </div>

      {/* ==================================================
          SUMMARY CARDS
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
            TOTAL ACCOUNTS
          </div>

          <div
            style={{
              marginTop: 7,
              color: "#1e3a8a",
              fontSize: 25,
              fontWeight: 900,
            }}
          >
            {accounts.length}
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
            ACTIVE ACCOUNTS
          </div>

          <div
            style={{
              marginTop: 7,
              color: "#166534",
              fontSize: 25,
              fontWeight: 900,
            }}
          >
            {activeAccounts}
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
            DEBIT OPENING
          </div>

          <div
            style={{
              marginTop: 7,
              color: "#9a3412",
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            ₹{" "}
            {debitOpening.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
              }
            )}
          </div>
        </div>

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
            CREDIT OPENING
          </div>

          <div
            style={{
              marginTop: 7,
              color: "#6b21a8",
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            ₹{" "}
            {creditOpening.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
              }
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          ACCOUNT FORM
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
            marginBottom: 18,
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
                ? "✏️ Edit Account"
                : "➕ Create Account"}
            </h2>

            <div
              style={{
                marginTop: 4,
                color: "#64748b",
                fontSize: 12,
              }}
            >
              Enter account details
              and opening balance
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
          onSubmit={saveAccount}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {/* CODE */}

          <div>
            <label style={labelStyle}>
              Account Code
            </label>

            <input
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                )
              }
              placeholder="Example: CASH001"
              style={inputStyle}
            />
          </div>

          {/* NAME */}

          <div>
            <label style={labelStyle}>
              Account Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Example: Cash"
              required
              style={inputStyle}
            />
          </div>

          {/* GROUP */}

          <div>
            <label style={labelStyle}>
              Account Group
            </label>

            <select
              value={groupId}
              onChange={(e) =>
                setGroupId(
                  e.target.value
                )
              }
              required
              style={inputStyle}
            >
              <option value="">
                Select Group
              </option>

              {groups.map(
                (group) => (
                  <option
                    key={group.id}
                    value={group.id}
                  >
                    {group.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* OPENING BALANCE */}

          <div>
            <label style={labelStyle}>
              Opening Balance
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={
                openingBalance
              }
              onChange={(e) =>
                setOpeningBalance(
                  e.target.value
                )
              }
              placeholder="0.00"
              style={{
                ...inputStyle,
                textAlign: "right",
              }}
            />
          </div>

          {/* OPENING TYPE */}

          <div>
            <label style={labelStyle}>
              Opening Type
            </label>

            <select
              value={openingType}
              onChange={(e) =>
                setOpeningType(
                  e.target.value
                )
              }
              style={inputStyle}
            >
              <option value="Debit">
                Debit
              </option>

              <option value="Credit">
                Credit
              </option>
            </select>
          </div>

          {/* ACTIONS */}

          <div
            style={{
              display: "flex",
              alignItems:
                "flex-end",
              gap: 10,
            }}
          >
            <button
              type="submit"
              style={{
                padding:
                  "11px 20px",
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
                ? "✓ Update Account"
                : "✓ Save Account"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding:
                    "11px 18px",
                  background:
                    "#f1f5f9",
                  color:
                    "#475569",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ==================================================
          ACCOUNT REGISTER
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
                fontWeight: 900,
                fontSize: 17,
              }}
            >
              📋 Account Register
            </div>

            <div
              style={{
                marginTop: 3,
                color: "#64748b",
                fontSize: 12,
              }}
            >
              {filteredAccounts.length}{" "}
              account
              {filteredAccounts.length ===
              1
                ? ""
                : "s"}{" "}
              displayed
            </div>
          </div>

          {/* SEARCH + FILTER */}

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
              placeholder="🔍 Search account..."
              style={{
                width: 260,
                padding:
                  "10px 12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                outline: "none",
                fontSize: 13,
              }}
            />

            <select
              value={groupFilter}
              onChange={(e) =>
                setGroupFilter(
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
                fontSize: 13,
              }}
            >
              <option value="">
                All Groups
              </option>

              {groups.map(
                (group) => (
                  <option
                    key={group.id}
                    value={group.id}
                  >
                    {group.name}
                  </option>
                )
              )}
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
              minWidth: 950,
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
                  CODE
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  ACCOUNT NAME
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  GROUP
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign:
                      "right",
                  }}
                >
                  OPENING BALANCE
                </th>

                <th
                  style={
                    thStyle
                  }
                >
                  TYPE
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign:
                      "center",
                  }}
                >
                  STATUS
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
              {filteredAccounts.length ===
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
                      📚
                    </div>

                    <div
                      style={{
                        fontWeight: 800,
                        color:
                          "#334155",
                      }}
                    >
                      No Accounts Found
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                      }}
                    >
                      Try changing your
                      search or group
                      filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(
                  (
                    account,
                    index
                  ) => {
                    const active =
                      Number(
                        account.isActive
                      ) === 1;

                    return (
                      <tr
                        key={
                          account.id
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

                        {/* CODE */}

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
                                "#f1f5f9",
                              borderRadius:
                                6,
                              color:
                                "#475569",
                              fontSize:
                                11,
                              fontWeight:
                                800,
                            }}
                          >
                            {account.code ||
                              "-"}
                          </span>
                        </td>

                        {/* NAME */}

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
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
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
                                fontWeight:
                                  900,
                              }}
                            >
                              {String(
                                account.name ||
                                  "?"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div
                              style={{
                                fontWeight:
                                  800,
                                color:
                                  "#0f172a",
                              }}
                            >
                              {
                                account.name
                              }
                            </div>
                          </div>
                        </td>

                        {/* GROUP */}

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              padding:
                                "5px 8px",
                              borderRadius:
                                6,
                              background:
                                "#f8fafc",
                              border:
                                "1px solid #e2e8f0",
                              color:
                                "#475569",
                              fontSize:
                                11,
                              fontWeight:
                                700,
                            }}
                          >
                            {getGroupName(
                              account.groupId
                            )}
                          </span>
                        </td>

                        {/* OPENING */}

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "right",
                            fontWeight:
                              800,
                            color:
                              "#334155",
                          }}
                        >
                          ₹{" "}
                          {Number(
                            account.openingBalance ||
                              0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits:
                                2,
                            }
                          )}
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
                                6,
                              background:
                                account.openingType ===
                                "Debit"
                                  ? "#fff7ed"
                                  : "#f5f3ff",
                              color:
                                account.openingType ===
                                "Debit"
                                  ? "#c2410c"
                                  : "#7c3aed",
                              fontWeight:
                                800,
                              fontSize:
                                11,
                            }}
                          >
                            {account.openingType ||
                              "Debit"}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "center",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: 5,
                              padding:
                                "5px 9px",
                              borderRadius:
                                999,
                              background:
                                active
                                  ? "#dcfce7"
                                  : "#fee2e2",
                              color:
                                active
                                  ? "#15803d"
                                  : "#b91c1c",
                              fontSize:
                                11,
                              fontWeight:
                                800,
                            }}
                          >
                            <span>
                              ●
                            </span>

                            {active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* ACTIONS */}

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
                              editAccount(
                                account
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
                              deleteAccount(
                                account.id
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
          </table>
        </div>

        {/* REGISTER FOOTER */}

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
              {filteredAccounts.length}
            </b>{" "}
            of{" "}
            <b
              style={{
                color:
                  "#334155",
              }}
            >
              {accounts.length}
            </b>{" "}
            accounts
          </span>

          {(search ||
            groupFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setGroupFilter("");
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