import React, { useState, useEffect } from "react";
import axios from "axios";

// Pages & Components Imports
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Stock from "./pages/Stock";
import StockLedger from "./pages/StockLedger";
import OpeningStock from "./pages/OpeningStock";
import SalesRegister from "./pages/SalesRegister";
import PurchaseRegister from "./pages/PurchaseRegister";
import Invoice from "./pages/Invoice";
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [page, setPage] = useState("dashboard");

  // Shared state props across pages
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [invoiceSaleId, setInvoiceSaleId] = useState(null);

  // Check existing session token on initial mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("storeerp_token");
      const userStr = localStorage.getItem("storeerp_user");

      if (token && userStr) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Session restoration error:", err);
          localStorage.removeItem("storeerp_token");
          localStorage.removeItem("storeerp_user");
        }
      }
      setCheckingSession(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("storeerp_token", token);
    localStorage.setItem("storeerp_user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setCurrentUser(userData);
    setIsLoggedIn(true);
    setPage("dashboard");
  };

  const handleLogout = async () => {
    try {
      // Optional: Backend logout API call if needed
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clean up local auth state
      localStorage.removeItem("storeerp_token");
      localStorage.removeItem("storeerp_user");
      delete axios.defaults.headers.common["Authorization"];

      setIsLoggedIn(false);
      setCurrentUser(null);
      setPage("dashboard");
    }
  };

  // Loading screen while evaluating active session
  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1f5f9",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 42, marginBottom: 12 }}>🏪</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#64748b" }}>
          Loading StoreERP...
        </div>
      </div>
    );
  }

  // Fallback to Login Screen if unauthenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Dynamic route rendering switcher
  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard setPage={setPage} />;

      case "products":
        return <Products />;

      case "customers":
        return <Customers />;

      case "suppliers":
        return <Suppliers />;

      case "purchases":
        return (
          <Purchases
            editingPurchaseId={editingPurchaseId}
            setEditingPurchaseId={setEditingPurchaseId}
            setPage={setPage}
          />
        );

      case "sales":
        return (
          <Sales
            editingSaleId={editingSaleId}
            setEditingSaleId={setEditingSaleId}
            setInvoiceSaleId={setInvoiceSaleId}
            setPage={setPage}
          />
        );

      case "stock":
        return <Stock />;

      case "stock-ledger":
        return <StockLedger />;

      case "opening-stock":
        return <OpeningStock />;

      case "sales-register":
        return (
          <SalesRegister
            setEditingSaleId={setEditingSaleId}
            setInvoiceSaleId={setInvoiceSaleId}
            setPage={setPage}
          />
        );

      case "purchase-register":
        return (
          <PurchaseRegister
            setEditingPurchaseId={setEditingPurchaseId}
            setPage={setPage}
          />
        );

      case "invoice":
        return <Invoice invoiceSaleId={invoiceSaleId} setPage={setPage} />;

      case "sales-report":
        return <SalesReport />;

      case "purchase-report":
        return <PurchaseReport />;

      case "profit-loss":
        return <ProfitLoss />;

      case "voucher":
        return <Voucher />;

      case "print-invoice":
        return <PrintInvoice invoiceSaleId={invoiceSaleId} />;

      case "company":
        return <Company />;

      case "accounts":
        return <Accounts />;

      case "ledger":
        return <Ledger />;

      case "balance-sheet":
        return <BalanceSheet />;

      case "trial-balance":
        return <TrialBalance />;

      case "day-book":
        return <DayBook />;

      case "outstanding":
        return <Outstanding />;

      case "payment-allocation":
        return <PaymentAllocation />;

      case "customer-outstanding":
        return <CustomerOutstanding />;

      case "supplier-outstanding":
        return <SupplierOutstanding />;

      case "cash-bank-book":
        return <CashBankBook />;

      case "receipt-payment-history":
        return <ReceiptPaymentHistory />;

      case "customer-ledger":
        return <CustomerLedger />;

      case "supplier-ledger":
        return <SupplierLedger />;

      case "voucher-detail":
        return <VoucherDetail />;

      case "print-voucher":
        return <PrintVoucher />;

      case "print-customer-ledger":
        return <PrintCustomerLedger />;

      case "print-supplier-ledger":
        return <PrintSupplierLedger />;

      case "print-outstanding":
        return <PrintOutstanding />;

      case "print-trial-balance":
        return <PrintTrialBalance />;

      case "print-day-book":
        return <PrintDayBook />;

      case "accounting-reconciliation":
        return <AccountingReconciliation />;

      case "settings":
        return <Settings />;

      default:
        return <Dashboard setPage={setPage} />;
    }
  };

  // Main wrapper layout with navigation frame
  return (
    <MainLayout
      page={page}
      setPage={setPage}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderPage()}
    </MainLayout>
  );
}