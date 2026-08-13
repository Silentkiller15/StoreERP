import { useState } from "react";

export default function Settings({
  setPage,
  onLogout,
}) {
  const [activeSection, setActiveSection] =
    useState("general");

  const [darkMode, setDarkMode] =
    useState(false);

  const [notifications, setNotifications] =
    useState(true);

  const [autoRefresh, setAutoRefresh] =
    useState(true);

  const [dateFormat, setDateFormat] =
    useState("DD-MM-YYYY");

  const [currency, setCurrency] =
    useState("INR");

  const goTo = (page) => {
    if (setPage) {
      setPage(page);
    }
  };

  const sections = [
    {
      id: "general",
      icon: "⚙️",
      title: "General",
      description:
        "Basic application preferences",
    },
    {
      id: "accounting",
      icon: "📊",
      title: "Accounting",
      description:
        "Financial and accounting",
    },
    {
      id: "invoice",
      icon: "🧾",
      title: "Invoice & Print",
      description:
        "Invoice and printing",
    },
    {
      id: "appearance",
      icon: "🎨",
      title: "Appearance",
      description:
        "Application appearance",
    },
    {
      id: "security",
      icon: "🔐",
      title: "Security",
      description:
        "Login and user accounts",
    },
    {
      id: "system",
      icon: "💻",
      title: "System",
      description:
        "System information",
    },
  ];

  const cardStyle = {
    background: darkMode
      ? "#1e293b"
      : "#ffffff",
    border: darkMode
      ? "1px solid #334155"
      : "1px solid #e2e8f0",
    borderRadius: 14,
    boxShadow:
      "0 2px 10px rgba(15,23,42,0.06)",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: darkMode
      ? "#0f172a"
      : "#ffffff",
    color: darkMode
      ? "#ffffff"
      : "#0f172a",
    outline: "none",
    fontSize: 13,
  };

  const labelStyle = {
    display: "block",
    marginBottom: 7,
    color: darkMode
      ? "#cbd5e1"
      : "#334155",
    fontSize: 12,
    fontWeight: 800,
  };

  // ==================================================
  // TOGGLE
  // ==================================================

  const Toggle = ({
    checked,
    onChange,
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      style={{
        width: 46,
        height: 25,
        padding: 2,
        border: "none",
        borderRadius: 20,
        background: checked
          ? "#2563eb"
          : "#cbd5e1",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: checked
          ? "flex-end"
          : "flex-start",
      }}
    >
      <span
        style={{
          width: 21,
          height: 21,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );

  // ==================================================
  // GENERAL
  // ==================================================

  const GeneralSettings = () => (
    <div>
      <SectionHeader
        title="General Settings"
        description="Configure basic application preferences."
        darkMode={darkMode}
      />

      <div
        style={{
          display: "grid",
          gap: 14,
        }}
      >
        <SettingRow
          title="Automatic Refresh"
          description="Automatically refresh data when pages are opened."
          darkMode={darkMode}
        >
          <Toggle
            checked={autoRefresh}
            onChange={setAutoRefresh}
          />
        </SettingRow>

        <SettingRow
          title="Notifications"
          description="Show application notifications and success messages."
          darkMode={darkMode}
        >
          <Toggle
            checked={notifications}
            onChange={setNotifications}
          />
        </SettingRow>

        <div>
          <label style={labelStyle}>
            Date Format
          </label>

          <select
            value={dateFormat}
            onChange={(e) =>
              setDateFormat(
                e.target.value
              )
            }
            style={{
              ...inputStyle,
              maxWidth: 320,
            }}
          >
            <option value="DD-MM-YYYY">
              DD-MM-YYYY
            </option>

            <option value="DD/MM/YYYY">
              DD/MM/YYYY
            </option>

            <option value="YYYY-MM-DD">
              YYYY-MM-DD
            </option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>
            Currency
          </label>

          <select
            value={currency}
            onChange={(e) =>
              setCurrency(
                e.target.value
              )
            }
            style={{
              ...inputStyle,
              maxWidth: 320,
            }}
          >
            <option value="INR">
              ₹ Indian Rupee (INR)
            </option>

            <option value="USD">
              $ US Dollar (USD)
            </option>

            <option value="EUR">
              € Euro (EUR)
            </option>

            <option value="GBP">
              £ British Pound (GBP)
            </option>
          </select>
        </div>
      </div>
    </div>
  );

  // ==================================================
  // ACCOUNTING
  // ==================================================

  const AccountingSettings = () => (
    <div>
      <SectionHeader
        title="Accounting Settings"
        description="Open and manage your accounting modules."
        darkMode={darkMode}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <InfoCard
          icon="📒"
          title="Chart of Accounts"
          description="Manage ledger accounts and account structure."
          onClick={() =>
            goTo("accounts")
          }
        />

        <InfoCard
          icon="📖"
          title="Ledger"
          description="View account ledger transactions."
          onClick={() =>
            goTo("ledger")
          }
        />

        <InfoCard
          icon="💳"
          title="Voucher Management"
          description="Receipt, Payment, Contra and Journal vouchers."
          onClick={() =>
            goTo("voucher")
          }
        />

        <InfoCard
          icon="🔄"
          title="Payment Allocation"
          description="Allocate receipts and payments."
          onClick={() =>
            goTo(
              "payment-allocation"
            )
          }
        />

        <InfoCard
          icon="💰"
          title="Cash / Bank Book"
          description="View cash and bank transactions."
          onClick={() =>
            goTo("cash-bank-book")
          }
        />

        <InfoCard
          icon="⚖️"
          title="Balance Sheet"
          description="View assets, liabilities and capital."
          onClick={() =>
            goTo("balance")
          }
        />

        <InfoCard
          icon="📊"
          title="Trial Balance"
          description="View debit and credit balances."
          onClick={() =>
            goTo("trial-balance")
          }
        />

        <InfoCard
          icon="📅"
          title="Day Book"
          description="View daily accounting transactions."
          onClick={() =>
            goTo("day-book")
          }
        />

        <InfoCard
          icon="📈"
          title="Profit & Loss"
          description="View income and expense results."
          onClick={() =>
            goTo("profit")
          }
        />

        <InfoCard
          icon="🔍"
          title="Accounting Reconciliation"
          description="Reconcile accounting transactions."
          onClick={() =>
            goTo(
              "accounting-reconciliation"
            )
          }
        />

        <InfoCard
          icon="⏳"
          title="Outstanding"
          description="View overall outstanding balances."
          onClick={() =>
            goTo("outstanding")
          }
        />
      </div>
    </div>
  );

  // ==================================================
  // INVOICE
  // ==================================================

  const InvoiceSettings = () => (
    <div>
      <SectionHeader
        title="Invoice & Print"
        description="Open invoice and printing modules."
        darkMode={darkMode}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <InfoCard
          icon="🏢"
          title="Company Settings"
          description="Manage company information and logo."
          onClick={() =>
            goTo("company")
          }
        />

        <InfoCard
          icon="🧾"
          title="Sales Invoice"
          description="Create and view sales invoices."
          onClick={() =>
            goTo("invoice")
          }
        />

        <InfoCard
          icon="📊"
          title="Sales Register"
          description="View sales transactions."
          onClick={() =>
            goTo("sales-register")
          }
        />

        <InfoCard
          icon="📊"
          title="Purchase Register"
          description="View purchase transactions."
          onClick={() =>
            goTo("purchase-register")
          }
        />

        <InfoCard
          icon="👤"
          title="Customer Ledger"
          description="View customer ledger."
          onClick={() =>
            goTo("customer-ledger")
          }
        />

        <InfoCard
          icon="🚚"
          title="Supplier Ledger"
          description="View supplier ledger."
          onClick={() =>
            goTo("supplier-ledger")
          }
        />

        <InfoCard
          icon="👥"
          title="Customer Outstanding"
          description="View customer balances."
          onClick={() =>
            goTo(
              "customer-outstanding"
            )
          }
        />

        <InfoCard
          icon="🚚"
          title="Supplier Outstanding"
          description="View supplier balances."
          onClick={() =>
            goTo(
              "supplier-outstanding"
            )
          }
        />

        <InfoCard
          icon="🖨️"
          title="Outstanding Print"
          description="Print outstanding report."
          onClick={() =>
            goTo(
              "print-outstanding"
            )
          }
        />

        <InfoCard
          icon="📄"
          title="Voucher Print"
          description="Print vouchers."
          onClick={() =>
            goTo("print-voucher")
          }
        />
      </div>
    </div>
  );

  // ==================================================
  // APPEARANCE
  // ==================================================

  const AppearanceSettings = () => (
    <div>
      <SectionHeader
        title="Appearance"
        description="Customize application appearance."
        darkMode={darkMode}
      />

      <SettingRow
        title="Dark Mode"
        description="Switch the Settings interface to a darker appearance."
        darkMode={darkMode}
      >
        <Toggle
          checked={darkMode}
          onChange={setDarkMode}
        />
      </SettingRow>
    </div>
  );

  // ==================================================
  // SECURITY
  // ==================================================

  const SecuritySettings = () => {
    const [showCreate, setShowCreate] =
      useState(false);

    const [showChange, setShowChange] =
      useState(false);

    const [users, setUsers] =
      useState(() => {
        return JSON.parse(
          localStorage.getItem(
            "erpUsers"
          ) || "[]"
        );
      });

    // CREATE ACCOUNT

    const [newName, setNewName] =
      useState("");

    const [newUsername, setNewUsername] =
      useState("");

    const [newPassword, setNewPassword] =
      useState("");

    const [newRole, setNewRole] =
      useState("User");

    // NEW RECOVERY FIELDS

    const [newRecoveryQuestion, setNewRecoveryQuestion] =
      useState("");

    const [newRecoveryAnswer, setNewRecoveryAnswer] =
      useState("");

    // CHANGE PASSWORD

    const [currentPassword, setCurrentPassword] =
      useState("");

    const [changedPassword, setChangedPassword] =
      useState("");

    const [confirmPassword, setConfirmPassword] =
      useState("");

    const [securityMessage, setSecurityMessage] =
      useState("");

    const loggedInUsername =
      localStorage.getItem(
        "loggedInUser"
      ) || "admin";

    const saveUsers = (
      updatedUsers
    ) => {
      localStorage.setItem(
        "erpUsers",
        JSON.stringify(
          updatedUsers
        )
      );

      setUsers(updatedUsers);
    };

    // ==================================================
    // CREATE ACCOUNT
    // ==================================================

    const createAccount = () => {
      setSecurityMessage("");

      const name =
        newName.trim();

      const username =
        newUsername.trim();

      const recoveryAnswer =
        newRecoveryAnswer
          .trim()
          .toLowerCase();

      if (!name) {
        setSecurityMessage(
          "Please enter full name."
        );
        return;
      }

      if (!username) {
        setSecurityMessage(
          "Please enter username."
        );
        return;
      }

      if (!newPassword) {
        setSecurityMessage(
          "Please enter password."
        );
        return;
      }

      if (newPassword.length < 6) {
        setSecurityMessage(
          "Password must contain at least 6 characters."
        );
        return;
      }

      // ----------------------------------------------
      // RECOVERY VALIDATION
      // ----------------------------------------------

      if (!newRecoveryQuestion) {
        setSecurityMessage(
          "Please select a recovery question."
        );
        return;
      }

      if (!recoveryAnswer) {
        setSecurityMessage(
          "Please enter a recovery answer."
        );
        return;
      }

      const exists =
        users.some(
          (user) =>
            user.username
              .toLowerCase() ===
            username.toLowerCase()
        );

      if (exists) {
        setSecurityMessage(
          "Username already exists."
        );
        return;
      }

      const newUser = {
        id:
          Date.now().toString(),

        username,

        password:
          newPassword,

        name,

        role: newRole,

        // ------------------------------------------
        // RECOVERY INFORMATION
        // ------------------------------------------

        recoveryQuestion:
          newRecoveryQuestion,

        recoveryAnswer:
          recoveryAnswer,
      };

      saveUsers([
        ...users,
        newUser,
      ]);

      // Clear form

      setNewName("");
      setNewUsername("");
      setNewPassword("");
      setNewRole("User");

      setNewRecoveryQuestion("");
      setNewRecoveryAnswer("");

      setSecurityMessage(
        "Account created successfully. Forgot Password is now available for this account."
      );
    };

    // ==================================================
    // CHANGE PASSWORD
    // ==================================================

    const changePassword = () => {
      setSecurityMessage("");

      if (!currentPassword) {
        setSecurityMessage(
          "Enter your current password."
        );
        return;
      }

      if (!changedPassword) {
        setSecurityMessage(
          "Enter your new password."
        );
        return;
      }

      if (
        changedPassword.length < 6
      ) {
        setSecurityMessage(
          "New password must contain at least 6 characters."
        );
        return;
      }

      if (
        changedPassword !==
        confirmPassword
      ) {
        setSecurityMessage(
          "New passwords do not match."
        );
        return;
      }

      const index =
        users.findIndex(
          (user) =>
            user.username ===
            loggedInUsername
        );

      if (index === -1) {
        setSecurityMessage(
          "Current user was not found."
        );
        return;
      }

      if (
        users[index].password !==
        currentPassword
      ) {
        setSecurityMessage(
          "Current password is incorrect."
        );
        return;
      }

      const updatedUsers =
        [...users];

      updatedUsers[index] = {
        ...updatedUsers[index],
        password:
          changedPassword,
      };

      saveUsers(updatedUsers);

      setCurrentPassword("");
      setChangedPassword("");
      setConfirmPassword("");

      setSecurityMessage(
        "Password changed successfully."
      );
    };

    // ==================================================
    // DELETE ACCOUNT
    // ==================================================

    const deleteAccount = (
      username
    ) => {
      if (
        username === "admin"
      ) {
        alert(
          "The main admin account cannot be deleted."
        );
        return;
      }

      if (
        username ===
        loggedInUsername
      ) {
        alert(
          "You cannot delete the account you are currently using."
        );
        return;
      }

      if (
        !window.confirm(
          `Delete account "${username}"?`
        )
      ) {
        return;
      }

      saveUsers(
        users.filter(
          (user) =>
            user.username !==
            username
        )
      );
    };

    return (
      <div>
        <SectionHeader
          title="Security & User Accounts"
          description="Manage ERP users, passwords and login security."
          darkMode={darkMode}
        />

        {/* CURRENT USER */}

        <div
          style={{
            padding: 18,
            background:
              darkMode
                ? "#0f172a"
                : "#f8fafc",
            border:
              darkMode
                ? "1px solid #334155"
                : "1px solid #e2e8f0",
            borderRadius: 10,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              color:
                darkMode
                  ? "#94a3b8"
                  : "#64748b",
              fontSize: 10,
              fontWeight: 800,
              textTransform:
                "uppercase",
            }}
          >
            Currently Logged In
          </div>

          <div
            style={{
              marginTop: 5,
              color:
                darkMode
                  ? "#ffffff"
                  : "#0f172a",
              fontSize: 17,
              fontWeight: 900,
            }}
          >
            👤 {loggedInUsername}
          </div>
        </div>

        {/* ACTION BUTTONS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <ActionButton
            icon="👤"
            title="Create Account"
            description="Add a new ERP user."
            onClick={() => {
              setShowCreate(
                !showCreate
              );

              setShowChange(false);

              setSecurityMessage("");
            }}
          />

          <ActionButton
            icon="🔑"
            title="Change Password"
            description="Change your current password."
            onClick={() => {
              setShowChange(
                !showChange
              );

              setShowCreate(false);

              setSecurityMessage("");
            }}
          />

          <ActionButton
            icon="🚪"
            title="Logout"
            description="Sign out of the ERP."
            danger
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to logout?"
                )
              ) {
                if (onLogout) {
                  onLogout();
                }
              }
            }}
          />
        </div>

        {/* ==================================================
            CREATE ACCOUNT
        ================================================== */}

        {showCreate && (
          <div
            style={{
              padding: 20,
              marginBottom: 18,
              background:
                darkMode
                  ? "#0f172a"
                  : "#f8fafc",
              border:
                darkMode
                  ? "1px solid #334155"
                  : "1px solid #e2e8f0",
              borderRadius: 10,
            }}
          >
            <h3
              style={{
                margin:
                  "0 0 16px",
                color:
                  darkMode
                    ? "#ffffff"
                    : "#334155",
                fontSize: 15,
              }}
            >
              👤 Create New Account
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 13,
              }}
            >
              {/* NAME */}

              <div>
                <label
                  style={labelStyle}
                >
                  Full Name
                </label>

                <input
                  value={newName}
                  onChange={(e) =>
                    setNewName(
                      e.target.value
                    )
                  }
                  placeholder="Full name"
                  style={inputStyle}
                />
              </div>

              {/* USERNAME */}

              <div>
                <label
                  style={labelStyle}
                >
                  Username
                </label>

                <input
                  value={newUsername}
                  onChange={(e) =>
                    setNewUsername(
                      e.target.value
                    )
                  }
                  placeholder="Username"
                  style={inputStyle}
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  style={labelStyle}
                >
                  Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Minimum 6 characters"
                  style={inputStyle}
                />
              </div>

              {/* ROLE */}

              <div>
                <label
                  style={labelStyle}
                >
                  Role
                </label>

                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                >
                  <option>
                    User
                  </option>

                  <option>
                    Manager
                  </option>

                  <option>
                    Accountant
                  </option>

                  <option>
                    Administrator
                  </option>
                </select>
              </div>
            </div>

            {/* ==================================================
                RECOVERY SECTION
            ================================================== */}

            <div
              style={{
                marginTop: 18,
                padding: 16,
                background:
                  darkMode
                    ? "#1e293b"
                    : "#ffffff",
                border:
                  darkMode
                    ? "1px solid #334155"
                    : "1px solid #dbeafe",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  color:
                    darkMode
                      ? "#ffffff"
                      : "#1e3a8a",
                  fontSize: 13,
                  fontWeight: 900,
                  marginBottom: 5,
                }}
              >
                🔐 Password Recovery
              </div>

              <div
                style={{
                  color:
                    darkMode
                      ? "#94a3b8"
                      : "#64748b",
                  fontSize: 10,
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                This recovery information will
                allow the user to reset their
                password from the Login page if
                they forget it.
              </div>

              {/* RECOVERY QUESTION */}

              <div>
                <label
                  style={labelStyle}
                >
                  Recovery Question
                </label>

                <select
                  value={
                    newRecoveryQuestion
                  }
                  onChange={(e) =>
                    setNewRecoveryQuestion(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                >
                  <option value="">
                    Select a recovery question
                  </option>

                  <option>
                    What is your favorite color?
                  </option>

                  <option>
                    What was the name of your first school?
                  </option>

                  <option>
                    What is your favorite food?
                  </option>

                  <option>
                    What city were you born in?
                  </option>

                  <option>
                    What is the name of your first pet?
                  </option>
                </select>
              </div>

              {/* RECOVERY ANSWER */}

              <div
                style={{
                  marginTop: 13,
                }}
              >
                <label
                  style={labelStyle}
                >
                  Recovery Answer
                </label>

                <input
                  type="text"
                  value={
                    newRecoveryAnswer
                  }
                  onChange={(e) =>
                    setNewRecoveryAnswer(
                      e.target.value
                    )
                  }
                  placeholder="Enter recovery answer"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* CREATE BUTTON */}

            <button
              type="button"
              onClick={
                createAccount
              }
              style={{
                marginTop: 16,
                padding:
                  "11px 18px",
                background:
                  "#2563eb",
                color:
                  "#ffffff",
                border: "none",
                borderRadius: 8,
                cursor:
                  "pointer",
                fontWeight: 900,
              }}
            >
              👤 Create Account
            </button>
          </div>
        )}

        {/* ==================================================
            CHANGE PASSWORD
        ================================================== */}

        {showChange && (
          <div
            style={{
              padding: 20,
              marginBottom: 18,
              background:
                darkMode
                  ? "#0f172a"
                  : "#f8fafc",
              border:
                darkMode
                  ? "1px solid #334155"
                  : "1px solid #e2e8f0",
              borderRadius: 10,
            }}
          >
            <h3
              style={{
                margin:
                  "0 0 15px",
                color:
                  darkMode
                    ? "#ffffff"
                    : "#334155",
                fontSize: 15,
              }}
            >
              🔑 Change Password
            </h3>

            <div
              style={{
                display: "grid",
                gap: 13,
              }}
            >
              <div>
                <label
                  style={labelStyle}
                >
                  Current Password
                </label>

                <input
                  type="password"
                  value={
                    currentPassword
                  }
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  placeholder="Current password"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={labelStyle}
                >
                  New Password
                </label>

                <input
                  type="password"
                  value={
                    changedPassword
                  }
                  onChange={(e) =>
                    setChangedPassword(
                      e.target.value
                    )
                  }
                  placeholder="Minimum 6 characters"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={labelStyle}
                >
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={
                changePassword
              }
              style={{
                marginTop: 15,
                padding:
                  "11px 18px",
                background:
                  "#2563eb",
                color:
                  "#ffffff",
                border: "none",
                borderRadius: 8,
                cursor:
                  "pointer",
                fontWeight: 900,
              }}
            >
              🔑 Change Password
            </button>
          </div>
        )}

        {/* MESSAGE */}

        {securityMessage && (
          <div
            style={{
              marginBottom: 18,
              padding: 12,
              background:
                securityMessage.includes(
                  "successfully"
                )
                  ? "#f0fdf4"
                  : "#fef2f2",
              color:
                securityMessage.includes(
                  "successfully"
                )
                  ? "#15803d"
                  : "#b91c1c",
              border:
                securityMessage.includes(
                  "successfully"
                )
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {securityMessage}
          </div>
        )}

        {/* ==================================================
            USER LIST
        ================================================== */}

        <div>
          <h3
            style={{
              color:
                darkMode
                  ? "#ffffff"
                  : "#334155",
              fontSize: 15,
              margin:
                "0 0 12px",
            }}
          >
            👥 User Accounts
          </h3>

          <div
            style={{
              display: "grid",
              gap: 8,
            }}
          >
            {users.map(
              (user) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    gap: 15,
                    padding:
                      "13px 15px",
                    background:
                      darkMode
                        ? "#0f172a"
                        : "#f8fafc",
                    border:
                      darkMode
                        ? "1px solid #334155"
                        : "1px solid #e2e8f0",
                    borderRadius: 9,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color:
                          darkMode
                            ? "#ffffff"
                            : "#334155",
                        fontWeight: 900,
                        fontSize: 12,
                      }}
                    >
                      👤{" "}
                      {user.name ||
                        user.username}
                    </div>

                    <div
                      style={{
                        marginTop: 3,
                        color:
                          "#64748b",
                        fontSize: 10,
                      }}
                    >
                      @{user.username}
                      {" • "}
                      {user.role ||
                        "User"}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        color:
                          user.recoveryQuestion
                            ? "#15803d"
                            : "#b91c1c",
                        fontSize: 9,
                        fontWeight: 800,
                      }}
                    >
                      {user.recoveryQuestion
                        ? "✓ Password recovery configured"
                        : "⚠ Recovery not configured"}
                    </div>
                  </div>

                  {user.username ===
                  "admin" ? (
                    <span
                      style={{
                        padding:
                          "5px 8px",
                        background:
                          "#dbeafe",
                        color:
                          "#1d4ed8",
                        borderRadius:
                          6,
                        fontSize: 9,
                        fontWeight:
                          900,
                      }}
                    >
                      MAIN ADMIN
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        deleteAccount(
                          user.username
                        )
                      }
                      style={{
                        padding:
                          "6px 9px",
                        background:
                          "#fee2e2",
                        color:
                          "#b91c1c",
                        border:
                          "1px solid #fecaca",
                        borderRadius:
                          6,
                        cursor:
                          "pointer",
                        fontSize: 10,
                        fontWeight:
                          900,
                      }}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==================================================
  // SYSTEM
  // ==================================================

  const SystemSettings = () => (
    <div>
      <SectionHeader
        title="System Information"
        description="System information and quick access."
        darkMode={darkMode}
      />

      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <SystemRow
          label="Application"
          value="StoreERP"
          darkMode={darkMode}
        />

        <SystemRow
          label="Application Type"
          value="Business & Accounting ERP"
          darkMode={darkMode}
        />

        <SystemRow
          label="Currency"
          value={currency}
          darkMode={darkMode}
        />

        <SystemRow
          label="Date Format"
          value={dateFormat}
          darkMode={darkMode}
        />
      </div>
    </div>
  );

  // ==================================================
  // CONTENT
  // ==================================================

  const renderContent = () => {
    switch (activeSection) {
      case "accounting":
        return (
          <AccountingSettings />
        );

      case "invoice":
        return (
          <InvoiceSettings />
        );

      case "appearance":
        return (
          <AppearanceSettings />
        );

      case "security":
        return (
          <SecuritySettings />
        );

      case "system":
        return (
          <SystemSettings />
        );

      default:
        return (
          <GeneralSettings />
        );
    }
  };

  // ==================================================
  // MAIN UI
  // ==================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          darkMode
            ? "#0f172a"
            : "#f1f5f9",
        boxSizing:
          "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          ...cardStyle,
          padding:
            "20px 24px",
          marginBottom: 18,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: 15,
        }}
      >
        <div>
          <div
            style={{
              color:
                darkMode
                  ? "#94a3b8"
                  : "#64748b",
              fontSize: 11,
              fontWeight: 800,
              textTransform:
                "uppercase",
            }}
          >
            System Configuration
          </div>

          <h1
            style={{
              margin:
                "4px 0 5px",
              color:
                darkMode
                  ? "#ffffff"
                  : "#0f172a",
              fontSize: 26,
            }}
          >
            ⚙️ Settings
          </h1>

          <div
            style={{
              color:
                darkMode
                  ? "#94a3b8"
                  : "#64748b",
              fontSize: 13,
            }}
          >
            Configure your StoreERP
            application.
          </div>
        </div>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to logout?"
              )
            ) {
              if (onLogout) {
                onLogout();
              }
            }
          }}
          style={{
            padding:
              "10px 16px",
            background:
              "#fee2e2",
            color:
              "#b91c1c",
            border:
              "1px solid #fecaca",
            borderRadius: 8,
            cursor:
              "pointer",
            fontWeight: 900,
            fontSize: 12,
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* MAIN */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "280px minmax(0,1fr)",
          gap: 18,
          alignItems:
            "start",
        }}
      >
        {/* SIDEBAR */}

        <div
          style={{
            ...cardStyle,
            padding: 10,
          }}
        >
          {sections.map(
            (section) => {
              const active =
                activeSection ===
                section.id;

              return (
                <button
                  key={
                    section.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      section.id
                    )
                  }
                  style={{
                    width: "100%",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: 12,
                    padding:
                      "12px 11px",
                    marginBottom: 4,
                    border: "none",
                    borderRadius: 9,
                    cursor:
                      "pointer",
                    textAlign:
                      "left",
                    background:
                      active
                        ? "#eff6ff"
                        : "transparent",
                    color:
                      active
                        ? "#2563eb"
                        : "#475569",
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      background:
                        active
                          ? "#dbeafe"
                          : "#f8fafc",
                      fontSize: 17,
                    }}
                  >
                    {
                      section.icon
                    }
                  </span>

                  <span>
                    <div
                      style={{
                        fontSize:
                          12,
                        fontWeight:
                          900,
                      }}
                    >
                      {
                        section.title
                      }
                    </div>

                    <div
                      style={{
                        marginTop:
                          2,
                        color:
                          "#94a3b8",
                        fontSize:
                          9,
                      }}
                    >
                      {
                        section.description
                      }
                    </div>
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* CONTENT */}

        <div
          style={{
            ...cardStyle,
            padding: 24,
            minHeight: 500,
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ==================================================
// SECTION HEADER
// ==================================================

function SectionHeader({
  title,
  description,
  darkMode,
}) {
  return (
    <div
      style={{
        marginBottom: 22,
        paddingBottom: 16,
        borderBottom:
          darkMode
            ? "1px solid #334155"
            : "1px solid #e2e8f0",
      }}
    >
      <h2
        style={{
          margin: 0,
          color:
            darkMode
              ? "#ffffff"
              : "#0f172a",
          fontSize: 19,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          marginTop: 4,
          color:
            darkMode
              ? "#94a3b8"
              : "#64748b",
          fontSize: 12,
        }}
      >
        {description}
      </div>
    </div>
  );
}

// ==================================================
// SETTING ROW
// ==================================================

function SettingRow({
  title,
  description,
  children,
  darkMode,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
        gap: 20,
        padding: 16,
        background:
          darkMode
            ? "#0f172a"
            : "#f8fafc",
        border:
          darkMode
            ? "1px solid #334155"
            : "1px solid #e2e8f0",
        borderRadius: 10,
      }}
    >
      <div>
        <div
          style={{
            color:
              darkMode
                ? "#ffffff"
                : "#334155",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 3,
            color:
              darkMode
                ? "#94a3b8"
                : "#64748b",
            fontSize: 11,
          }}
        >
          {description}
        </div>
      </div>

      {children}
    </div>
  );
}

// ==================================================
// ACTION BUTTON
// ==================================================

function ActionButton({
  icon,
  title,
  description,
  onClick,
  danger,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 15,
        border:
          danger
            ? "1px solid #fecaca"
            : "1px solid #e2e8f0",
        background:
          danger
            ? "#fff7f7"
            : "#f8fafc",
        borderRadius: 10,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontSize: 20,
          marginBottom: 7,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color:
            danger
              ? "#b91c1c"
              : "#334155",
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 4,
          color: "#64748b",
          fontSize: 10,
          lineHeight: 1.4,
        }}
      >
        {description}
      </div>
    </button>
  );
}

// ==================================================
// INFO CARD
// ==================================================

function InfoCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems:
          "flex-start",
        gap: 14,
        padding: 17,
        background:
          "#f8fafc",
        border:
          "1px solid #e2e8f0",
        borderRadius: 10,
        cursor:
          onClick
            ? "pointer"
            : "default",
        textAlign:
          "left",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 9,
          background:
            "#eff6ff",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          fontSize: 19,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color:
              "#334155",
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 4,
            color:
              "#64748b",
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
    </button>
  );
}

// ==================================================
// SYSTEM ROW
// ==================================================

function SystemRow({
  label,
  value,
  darkMode,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        padding:
          "13px 15px",
        background:
          darkMode
            ? "#0f172a"
            : "#f8fafc",
        border:
          darkMode
            ? "1px solid #334155"
            : "1px solid #e2e8f0",
        borderRadius: 8,
      }}
    >
      <span
        style={{
          color:
            darkMode
              ? "#94a3b8"
              : "#64748b",
          fontSize: 12,
        }}
      >
        {label}
      </span>

      <b
        style={{
          color:
            darkMode
              ? "#ffffff"
              : "#334155",
          fontSize: 12,
        }}
      >
        {value}
      </b>
    </div>
  );
}