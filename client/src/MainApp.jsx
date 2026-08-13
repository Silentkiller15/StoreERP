import { useEffect, useState } from "react";
import axios from "axios";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/products"; // 👈 Fixed: lowercase 'products'
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/purchases"; // 👈 Fixed: lowercase 'purchases'
import Sales from "./pages/Sales";
import Stock from "./pages/Stock";
import StockLedger from "./pages/StockLedger";
import OpeningStock from "./pages/OpeningStock";

import SalesRegister from "./pages/SalesRegister";
import PurchaseRegister from "./pages/PurchaseRegister";

import Invoice from "./pages/invoice"; // 👈 Fixed: lowercase 'invoice'
import SalesReport from "./pages/SalesReport";
import PurchaseReport from "./pages/PurchaseReport";

import ProfitLoss from "./pages/ProfitLoss";
import Voucher from "./pages/Voucher";

import PrintInvoice from "./pages/PrintInvoice";
import Company from "./pages/Company";

import Accounts from "./pages/Accounts";
import Ledger from "./pages/Ledger";

import BalanceSheet from "./pages/BalanceSheet";
import TrialBalance from "./pages/TrialBalance";
import DayBook from "./pages/DayBook";
import Outstanding from "./pages/Outstanding";

import PaymentAllocation from "./pages/PaymentAllocation";
import CustomerOutstanding from "./pages/CustomerOutstanding";
import SupplierOutstanding from "./pages/SupplierOutstanding";
import CashBankBook from "./pages/CashBankBook";
import ReceiptPaymentHistory from "./pages/ReceiptPaymentHistory";

import CustomerLedger from "./pages/CustomerLedger";
import SupplierLedger from "./pages/SupplierLedger";

import VoucherDetail from "./pages/VoucherDetail";
import PrintVoucher from "./pages/PrintVoucher";

import PrintCustomerLedger from "./pages/PrintCustomerLedger";
import PrintSupplierLedger from "./pages/PrintSupplierLedger";
import PrintOutstanding from "./pages/PrintOutstanding";
import PrintTrialBalance from "./pages/PrintTrialBalance";
import PrintDayBook from "./pages/PrintDayBook";

import AccountingReconciliation from "./pages/AccountingReconciliation";

import Settings from "./pages/Settings";


// ==================================================
// API
// ==================================================

const API_URL = "https://mudhikhana.onrender.com";


// ==================================================
// LOGIN PAGE
// ==================================================

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");

  // LOGIN
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // CREATE ACCOUNT
  const [name, setName] = useState("");
  const [registerPassword, setRegisterPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [recoveryQuestion, setRecoveryQuestion] =
    useState("");
  const [recoveryAnswer, setRecoveryAnswer] =
    useState("");

  // FORGOT PASSWORD
  const [forgotUsername, setForgotUsername] =
    useState("");
  const [forgotQuestion, setForgotQuestion] =
    useState("");
  const [forgotAnswer, setForgotAnswer] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [forgotStep, setForgotStep] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  // ==================================================
  // CLEAR MESSAGES
  // ==================================================

  const clearMessages = () => {
    setError("");
    setMessage("");
  };


  // ==================================================
  // CHANGE LOGIN SCREEN
  // ==================================================

  const switchMode = (newMode) => {
    clearMessages();

    setMode(newMode);

    if (newMode === "forgot") {
      setForgotStep(1);
      setForgotQuestion("");
      setForgotAnswer("");
      setNewPassword("");
    }
  };


  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!username.trim()) {
      setError(
        "Please enter username."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter password."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/accounts/login`,
        {
          username:
            username.trim(),

          password:
            password,
        }
      );

      if (!res.data?.success) {
        setError(
          res.data?.message ||
            "Login failed."
        );

        return;
      }

      const token =
        res.data.token;

      const user =
        res.data.user;

      if (!token) {
        setError(
          "Login failed: no session token received."
        );

        return;
      }

      // SAVE TOKEN
      localStorage.setItem(
        "storeerp_token",
        token
      );

      // SAVE USER
      localStorage.setItem(
        "storeerp_user",
        JSON.stringify(
          user || {}
        )
      );

      // ATTACH TOKEN TO AXIOS
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // LOGIN SUCCESS
      onLogin(user);

    } catch (err) {

      console.log(
        "Login Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to connect to server."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==================================================
  // CREATE NEW ACCOUNT
  // ==================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!name.trim()) {
      setError(
        "Please enter your full name."
      );

      return;
    }

    if (!username.trim()) {
      setError(
        "Please enter a username."
      );

      return;
    }

    if (!registerPassword) {
      setError(
        "Please enter a password."
      );

      return;
    }

    if (registerPassword.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }

    if (
      registerPassword !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    if (!recoveryQuestion) {
      setError(
        "Please select a recovery question."
      );

      return;
    }

    if (!recoveryAnswer.trim()) {
      setError(
        "Please enter a recovery answer."
      );

      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/accounts/register`,
        {
          name:
            name.trim(),

          username:
            username.trim(),

          password:
            registerPassword,

          recoveryQuestion:
            recoveryQuestion,

          recoveryAnswer:
            recoveryAnswer.trim(),

          role:
            "User",
        }
      );

      if (!res.data?.success) {
        setError(
          res.data?.message ||
            "Unable to create account."
        );

        return;
      }

      setMessage(
        "Account created successfully. You can now login."
      );

      // Clear registration fields
      setName("");
      setRegisterPassword("");
      setConfirmPassword("");
      setRecoveryQuestion("");
      setRecoveryAnswer("");

      // Go back to login
      setMode("login");

    } catch (err) {

      console.log(
        "Register Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create account."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==================================================
  // FORGOT PASSWORD - GET QUESTION
  // ==================================================

  const handleGetRecoveryQuestion =
    async (e) => {

      e.preventDefault();

      clearMessages();

      if (!forgotUsername.trim()) {
        setError(
          "Please enter your username."
        );

        return;
      }

      try {
        setLoading(true);

        const res = await axios.post(
          `${API_URL}/accounts/forgot-question`,
          {
            username:
              forgotUsername.trim(),
          }
        );

        if (!res.data?.success) {
          setError(
            res.data?.message ||
              "Unable to find recovery information."
          );

          return;
        }

        setForgotQuestion(
          res.data.question
        );

        setForgotStep(2);

      } catch (err) {

        console.log(
          "Recovery Question Error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to find recovery information."
        );

      } finally {
        setLoading(false);
      }
    };


  // ==================================================
  // FORGOT PASSWORD - RESET
  // ==================================================

  const handleResetPassword =
    async (e) => {

      e.preventDefault();

      clearMessages();

      if (!forgotAnswer.trim()) {
        setError(
          "Please enter your recovery answer."
        );

        return;
      }

      if (!newPassword) {
        setError(
          "Please enter a new password."
        );

        return;
      }

      if (newPassword.length < 6) {
        setError(
          "New password must contain at least 6 characters."
        );

        return;
      }

      try {
        setLoading(true);

        const res = await axios.post(
          `${API_URL}/accounts/forgot-password`,
          {
            username:
              forgotUsername.trim(),

            recoveryAnswer:
              forgotAnswer.trim(),

            newPassword:
              newPassword,
          }
        );

        if (!res.data?.success) {
          setError(
            res.data?.message ||
              "Unable to reset password."
          );

          return;
        }

        setMessage(
          "Password changed successfully. You can now login."
        );

        // Put username into login box
        setUsername(
          forgotUsername.trim()
        );

        setPassword("");

        setForgotAnswer("");

        setNewPassword("");

        setForgotQuestion("");

        setForgotStep(1);

        setMode("login");

      } catch (err) {

        console.log(
          "Reset Password Error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to reset password."
        );

      } finally {
        setLoading(false);
      }
    };


  // ==================================================
  // INPUT STYLE
  // ==================================================

  const inputStyle = {
    width: "100%",
    padding: 11,
    border:
      "1px solid #cbd5e1",
    borderRadius: 7,
    boxSizing:
      "border-box",
    fontSize: 15,
  };


  // ==================================================
  // BUTTON STYLE
  // ==================================================

  const primaryButtonStyle = {
    width: "100%",
    padding: 12,
    border: "none",
    borderRadius: 7,

    background:
      loading
        ? "#94a3b8"
        : "#2563eb",

    color: "white",

    fontSize: 15,

    fontWeight: 700,

    cursor:
      loading
        ? "not-allowed"
        : "pointer",
  };


  // ==================================================
  // LINK BUTTON
  // ==================================================

  const linkButtonStyle = {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 600,
    padding: 4,
  };


  // ==================================================
  // MESSAGE
  // ==================================================

  const renderMessage = () => {

    if (error) {
      return (
        <div
          style={{
            marginBottom: 16,
            padding: 10,
            background:
              "#fee2e2",
            border:
              "1px solid #fecaca",
            color:
              "#991b1b",
            borderRadius: 7,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      );
    }

    if (message) {
      return (
        <div
          style={{
            marginBottom: 16,
            padding: 10,
            background:
              "#dcfce7",
            border:
              "1px solid #bbf7d0",
            color:
              "#166534",
            borderRadius: 7,
            fontSize: 13,
          }}
        >
          {message}
        </div>
      );
    }

    return null;
  };


  // ==================================================
  // LOGIN FORM
  // ==================================================

  const renderLogin = () => (
    <form
      onSubmit={
        handleLogin
      }
    >

      {/* USERNAME */}

      <div
        style={{
          marginBottom: 16,
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Username
        </label>

        <input
          type="text"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          placeholder="Enter username"
          autoComplete="username"
          style={inputStyle}
        />
      </div>


      {/* PASSWORD */}

      <div
        style={{
          marginBottom: 16,
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          placeholder="Enter password"
          autoComplete="current-password"
          style={inputStyle}
        />
      </div>


      {renderMessage()}


      {/* LOGIN */}

      <button
        type="submit"
        disabled={loading}
        style={
          primaryButtonStyle
        }
      >
        {loading
          ? "Logging in..."
          : "Login"}
      </button>


      {/* FORGOT PASSWORD */}

      <div
        style={{
          marginTop: 18,
          textAlign: "center",
          fontSize: 14,
        }}
      >
        <button
          type="button"
          onClick={() =>
            switchMode(
              "forgot"
            )
          }
          style={
            linkButtonStyle
          }
        >
          Forgot Password?
        </button>
      </div>


      {/* CREATE ACCOUNT */}

      <div
        style={{
          marginTop: 8,
          textAlign: "center",
          fontSize: 14,
          color: "#64748b",
        }}
      >
        Don't have an account?{" "}

        <button
          type="button"
          onClick={() =>
            switchMode(
              "register"
            )
          }
          style={
            linkButtonStyle
          }
        >
          Create New Account
        </button>
      </div>

    </form>
  );


  // ==================================================
  // CREATE ACCOUNT FORM
  // ==================================================

  const renderRegister = () => (
    <form
      onSubmit={
        handleRegister
      }
    >

      {/* FULL NAME */}

      <div
        style={{
          marginBottom: 13,
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Full Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          placeholder="Enter full name"
          style={inputStyle}
        />
      </div>


      {/* USERNAME */}

      <div
        style={{
          marginBottom: 13,
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Username
        </label>

        <input
          type="text"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          placeholder="Choose username"
          autoComplete="username"
          style={inputStyle}
        />
      </div>


      {/* PASSWORD */}

      <div
        style={{
          marginBottom: 13,
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Password
        </label>

        <input
          type="password"
          value={
            registerPassword
          }
          onChange={(e) =>
            setRegisterPassword(
              e.target.value
            )
          }
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          style={inputStyle}
        />
      </div>


      {/* CONFIRM PASSWORD */}

      <div
        style={{
          marginBottom: 13,
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Confirm Password
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
          placeholder="Confirm password"
          autoComplete="new-password"
          style={inputStyle}
        />
      </div>


      {/* RECOVERY QUESTION */}

      <div
        style={{
          marginBottom: 13,
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Recovery Question
        </label>

        <select
          value={
            recoveryQuestion
          }
          onChange={(e) =>
            setRecoveryQuestion(
              e.target.value
            )
          }
          style={inputStyle}
        >
          <option value="">
            Select a recovery question
          </option>

          <option value="What is your mother's maiden name?">
            What is your mother's maiden name?
          </option>

          <option value="What was the name of your first school?">
            What was the name of your first school?
          </option>

          <option value="What is your favorite food?">
            What is your favorite food?
          </option>

          <option value="What was your childhood nickname?">
            What was your childhood nickname?
          </option>

        </select>
      </div>


      {/* RECOVERY ANSWER */}

      <div
        style={{
          marginBottom: 16,
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Recovery Answer
        </label>

        <input
          type="text"
          value={
            recoveryAnswer
          }
          onChange={(e) =>
            setRecoveryAnswer(
              e.target.value
            )
          }
          placeholder="Enter your answer"
          style={inputStyle}
        />
      </div>


      {renderMessage()}


      {/* CREATE ACCOUNT */}

      <button
        type="submit"
        disabled={loading}
        style={
          primaryButtonStyle
        }
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>


      {/* BACK TO LOGIN */}

      <div
        style={{
          marginTop: 16,
          textAlign: "center",
          fontSize: 14,
        }}
      >
        Already have an account?{" "}

        <button
          type="button"
          onClick={() =>
            switchMode(
              "login"
            )
          }
          style={
            linkButtonStyle
          }
        >
          Back to Login
        </button>
      </div>

    </form>
  );


  // ==================================================
  // FORGOT PASSWORD
  // ==================================================

  const renderForgot = () => (
    <>
      {forgotStep === 1 ? (

        <form
          onSubmit={
            handleGetRecoveryQuestion
          }
        >

          <p
            style={{
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.5,
              marginTop: 0,
            }}
          >
            Enter your username and we
            will show your recovery
            question.
          </p>


          <div
            style={{
              marginBottom: 16,
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 700,
              }}
            >
              Username
            </label>

            <input
              type="text"
              value={
                forgotUsername
              }
              onChange={(e) =>
                setForgotUsername(
                  e.target.value
                )
              }
              placeholder="Enter username"
              autoComplete="username"
              style={inputStyle}
            />
          </div>


          {renderMessage()}


          <button
            type="submit"
            disabled={loading}
            style={
              primaryButtonStyle
            }
          >
            {loading
              ? "Checking..."
              : "Continue"}
          </button>

        </form>

      ) : (

        <form
          onSubmit={
            handleResetPassword
          }
        >

          {/* QUESTION */}

          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
              borderRadius: 7,
            }}
          >

            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 5,
              }}
            >
              Recovery Question
            </div>

            <div
              style={{
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {
                forgotQuestion
              }
            </div>

          </div>


          {/* ANSWER */}

          <div
            style={{
              marginBottom: 13,
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 700,
              }}
            >
              Recovery Answer
            </label>

            <input
              type="text"
              value={
                forgotAnswer
              }
              onChange={(e) =>
                setForgotAnswer(
                  e.target.value
                )
              }
              placeholder="Enter recovery answer"
              style={inputStyle}
            />
          </div>


          {/* NEW PASSWORD */}

          <div
            style={{
              marginBottom: 16,
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 700,
              }}
            >
              New Password
            </label>

            <input
              type="password"
              value={
                newPassword
              }
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>


          {renderMessage()}


          {/* RESET */}

          <button
            type="submit"
            disabled={loading}
            style={
              primaryButtonStyle
            }
          >
            {loading
              ? "Changing Password..."
              : "Reset Password"}
          </button>

        </form>
      )}


      {/* BACK */}

      <div
        style={{
          marginTop: 16,
          textAlign: "center",
          fontSize: 14,
        }}
      >
        <button
          type="button"
          onClick={() =>
            switchMode(
              "login"
            )
          }
          style={
            linkButtonStyle
          }
        >
          Back to Login
        </button>
      </div>

    </>
  );


  // ==================================================
  // LOGIN CONTAINER
  // ==================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "#f1f5f9",
        padding: 20,
        boxSizing:
          "border-box",
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          maxHeight: "95vh",
          overflowY: "auto",
          background:
            "#ffffff",
          padding: 30,
          borderRadius: 12,
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.12)",
          boxSizing:
            "border-box",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: 25,
          }}
        >

          <div
            style={{
              fontSize: 40,
              marginBottom: 8,
            }}
          >
            🏪
          </div>

          <h1
            style={{
              margin: 0,
              color:
                "#0f172a",
            }}
          >
            StoreERP
          </h1>

          <p
            style={{
              marginTop: 8,
              color:
                "#64748b",
            }}
          >
            {mode === "login"
              ? "Business Management System"
              : mode === "register"
              ? "Create your StoreERP account"
              : "Recover your StoreERP password"}
          </p>

        </div>


        {/* LOGIN */}

        {mode === "login" &&
          renderLogin()}


        {/* CREATE ACCOUNT */}

        {mode === "register" &&
          renderRegister()}


        {/* FORGOT PASSWORD */}

        {mode === "forgot" &&
          renderForgot()}

      </div>

    </div>
  );
}



// ==================================================
// MAIN APP
// ==================================================

export default function App() {

  // ==================================================
  // PAGE STATE
  // ==================================================

  const [page, setPage] =
    useState("dashboard");

  const [
    editingSaleId,
    setEditingSaleId,
  ] = useState(null);

  const [
    invoiceSaleId,
    setInvoiceSaleId,
  ] = useState(null);

  const [
    editingPurchaseId,
    setEditingPurchaseId,
  ] = useState(null);


  // ==================================================
  // AUTH STATE
  // ==================================================

  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);

  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);


  // ==================================================
  // CHECK SAVED LOGIN WHEN APP STARTS
  // ==================================================

  useEffect(() => {

    const checkSession =
      async () => {

        const token =
          localStorage.getItem(
            "storeerp_token"
          );

        const savedUser =
          localStorage.getItem(
            "storeerp_user"
          );


        // ==========================================
        // NO TOKEN
        // ==========================================

        if (!token) {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setCheckingSession(false);
          return;
        }


        // ==========================================
        // ATTACH TOKEN TO AXIOS
        // ==========================================

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;


        try {

          // IMPORTANT:
          // Backend route is /accounts/me

          const res =
            await axios.get(
              `${API_URL}/accounts/me`
            );


          if (
            res.data?.success &&
            res.data?.user
          ) {

            const user =
              res.data.user;

            setCurrentUser(
              user
            );

            setIsLoggedIn(
              true
            );

            // Keep user information
            // synchronized.

            localStorage.setItem(
              "storeerp_user",
              JSON.stringify(
                user
              )
            );

          } else {

            throw new Error(
              "Invalid session."
            );

          }

        } catch (err) {

          console.log(
            "Session Check Error:",
            err
          );

          // ========================================
          // INVALID SESSION
          // ========================================

          localStorage.removeItem(
            "storeerp_token"
          );

          localStorage.removeItem(
            "storeerp_user"
          );

          delete axios.defaults
            .headers.common[
              "Authorization"
            ];

          setIsLoggedIn(
            false
          );

          setCurrentUser(
            null
          );

        } finally {

          setCheckingSession(
            false
          );

        }
      };


    checkSession();

  }, []);


  // ==================================================
  // LOGIN SUCCESS
  // ==================================================

  const handleLogin = (
    user
  ) => {

    setCurrentUser(
      user
    );

    setIsLoggedIn(
      true
    );

    setPage(
      "dashboard"
    );
  };


  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout =
    async () => {

      const token =
        localStorage.getItem(
          "storeerp_token"
        );


      try {

        if (token) {

          await axios.post(
            `${API_URL}/accounts/logout`,
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        }

      } catch (err) {

        console.log(
          "Logout Error:",
          err
        );

      } finally {

        // ==========================================
        // REMOVE LOGIN
        // ==========================================

        localStorage.removeItem(
          "storeerp_token"
        );

        localStorage.removeItem(
          "storeerp_user"
        );

        delete axios.defaults
          .headers.common[
            "Authorization"
          ];

        setCurrentUser(
          null
        );

        setIsLoggedIn(
          false
        );

        setPage(
          "dashboard"
        );
      }
    };


  // ==================================================
  // CHECKING SESSION
  // ==================================================

  if (checkingSession) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "#f8fafc",
          color:
            "#475569",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        Checking login...
      </div>
    );
  }


  // ==================================================
  // LOGIN PAGE
  // ==================================================

  if (!isLoggedIn) {

    return (
      <Login
        onLogin={
          handleLogin
        }
      />
    );
  }


  // ==================================================
  // RENDER ERP PAGE
  // ==================================================

  const renderPage = () => {

    switch (page) {

      // ==========================================
      // DASHBOARD
      // ==========================================

      case "dashboard":
        return <Dashboard />;


      // ==========================================
      // PRODUCTS
      // ==========================================

      case "products":
        return <Products />;


      // ==========================================
      // CUSTOMERS
      // ==========================================

      case "customers":
        return <Customers />;


      // ==========================================
      // SUPPLIERS
      // ==========================================

      case "suppliers":
        return <Suppliers />;


      // ==========================================
      // PURCHASES
      // ==========================================

      case "purchases":
        return (
          <Purchases
            editingPurchaseId={
              editingPurchaseId
            }
            setEditingPurchaseId={
              setEditingPurchaseId
            }
          />
        );


      // ==========================================
      // PURCHASE REGISTER
      // ==========================================

      case "purchase-register":
        return (
          <PurchaseRegister
            setPage={
              setPage
            }
            setEditingPurchaseId={
              setEditingPurchaseId
            }
          />
        );


      // ==========================================
      // PURCHASE REPORT
      // ==========================================

      case "purchase-report":
        return (
          <PurchaseReport />
        );


      // ==========================================
      // SALES
      // ==========================================

      case "sales":
        return (
          <Sales
            editingSaleId={
              editingSaleId
            }
            setEditingSaleId={
              setEditingSaleId
            }
          />
        );


      // ==========================================
      // SALES REGISTER
      // ==========================================

      case "sales-register":
        return (
          <SalesRegister
            setPage={
              setPage
            }
            setEditingSaleId={
              setEditingSaleId
            }
            setInvoiceSaleId={
              setInvoiceSaleId
            }
          />
        );


      // ==========================================
      // SALES REPORT
      // ==========================================

      case "sales-report":
        return (
          <SalesReport />
        );


      // ==========================================
      // INVOICE
      // ==========================================

      case "invoice":
        return (
          <Invoice
            invoiceSaleId={
              invoiceSaleId
            }
          />
        );


      // ==========================================
      // STOCK
      // ==========================================

      case "stock":
        return <Stock />;

        // ==========================================
// OPENING STOCK
// ==========================================

case "opening-stock":
  return <OpeningStock />;


      // ==========================================
      // STOCK LEDGER
      // ==========================================

      case "stock-ledger":
        return (
          <StockLedger />
        );


      // ==========================================
      // VOUCHER
      // ==========================================

      case "voucher":
        return <Voucher />;


      // ==========================================
      // VOUCHER DETAIL
      // ==========================================

      case "voucher-detail":
        return (
          <VoucherDetail />
        );


      // ==========================================
      // PRINT VOUCHER
      // ==========================================

      case "print-voucher":
        return (
          <PrintVoucher />
        );


      // ==========================================
      // ACCOUNTS
      // ==========================================

      case "accounts":
        return <Accounts />;


      // ==========================================
      // LEDGER
      // ==========================================

      case "ledger":
        return <Ledger />;


      // ==========================================
      // CUSTOMER LEDGER
      // ==========================================

      case "customer-ledger":
        return (
          <CustomerLedger />
        );


      // ==========================================
      // PRINT CUSTOMER LEDGER
      // ==========================================

      case "print-customer-ledger":
        return (
          <PrintCustomerLedger />
        );


      // ==========================================
      // SUPPLIER LEDGER
      // ==========================================

      case "supplier-ledger":
        return (
          <SupplierLedger />
        );


      // ==========================================
      // PRINT SUPPLIER LEDGER
      // ==========================================

      case "print-supplier-ledger":
        return (
          <PrintSupplierLedger />
        );


      // ==========================================
      // PROFIT & LOSS
      // ==========================================

      case "profit":
        return <ProfitLoss />;


      // ==========================================
      // BALANCE SHEET
      // ==========================================

      case "balance":
        return (
          <BalanceSheet />
        );


      // ==========================================
      // TRIAL BALANCE
      // ==========================================

      case "trial-balance":
        return (
          <TrialBalance />
        );


      // ==========================================
      // PRINT TRIAL BALANCE
      // ==========================================

      case "print-trial-balance":
        return (
          <PrintTrialBalance />
        );


      // ==========================================
      // DAY BOOK
      // ==========================================

      case "day-book":
        return <DayBook />;


      // ==========================================
      // PRINT DAY BOOK
      // ==========================================

      case "print-day-book":
        return (
          <PrintDayBook />
        );


      // ==========================================
      // OUTSTANDING
      // ==========================================

      case "outstanding":
        return (
          <Outstanding />
        );


      // ==========================================
      // PRINT OUTSTANDING
      // ==========================================

      case "print-outstanding":
        return (
          <PrintOutstanding />
        );


      // ==========================================
      // ACCOUNTING RECONCILIATION
      // ==========================================

      case "accounting-reconciliation":
        return (
          <AccountingReconciliation />
        );


      // ==========================================
      // CUSTOMER OUTSTANDING
      // ==========================================

      case "customer-outstanding":
        return (
          <CustomerOutstanding />
        );


      // ==========================================
      // SUPPLIER OUTSTANDING
      // ==========================================

      case "supplier-outstanding":
        return (
          <SupplierOutstanding />
        );


      // ==========================================
      // CASH / BANK BOOK
      // ==========================================

      case "cash-bank-book":
        return (
          <CashBankBook />
        );


      // ==========================================
      // RECEIPT PAYMENT HISTORY
      // ==========================================

      case "receipt-payment-history":
        return (
          <ReceiptPaymentHistory />
        );


      // ==========================================
      // PAYMENT ALLOCATION
      // ==========================================

      case "payment-allocation":
        return (
          <PaymentAllocation />
        );


      // ==========================================
      // COMPANY
      // ==========================================

      case "company":
        return <Company />;


      // ==========================================
      // SETTINGS
      // ==========================================

      case "settings":
  return <Settings />;


      // ==========================================
      // PRINT INVOICE
      // ==========================================

      case "print-invoice":
        return (
          <PrintInvoice />
        );


      // ==========================================
      // DEFAULT
      // ==========================================

      default:
        return (
          <h1
            style={{
              padding: 20,
            }}
          >
            🚧 Module Coming Soon...
          </h1>
        );
    }
  };


  // ==================================================
  // MAIN LAYOUT
  // ==================================================

  return (
    <MainLayout
      page={page}
      setPage={setPage}

      setEditingSaleId={
        setEditingSaleId
      }

      setEditingPurchaseId={
        setEditingPurchaseId
      }

      setInvoiceSaleId={
        setInvoiceSaleId
      }

      currentUser={
        currentUser
      }

      onLogout={
        handleLogout
      }
    >
      {renderPage()}
    </MainLayout>
  );
}