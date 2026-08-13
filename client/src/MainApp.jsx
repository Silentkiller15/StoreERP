import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout & Navigation (Adjust path if you use a distinct layout wrapper)
import Navbar from "./components/Navbar";

// Core Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";

// Sales & Invoicing
import Sales from "./pages/Sales";
import SalesRegister from "./pages/SalesRegister";
import Invoice from "./pages/Invoice";

// Purchases & Stock Inward
import Purchases from "./pages/Purchases";
import PurchaseReport from "./pages/PurchaseReport";

// Accounting & Vouchers
import Accounts from "./pages/Accounts";
import Vouchers from "./pages/Vouchers";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        {/* Top Navigation Bar */}
        <Navbar />

        {/* Main Content Viewport */}
        <main className="flex-1 pb-12">
          <Routes>
            {/* Home / Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Inventory & Master Data */}
            <Route path="/products" element={<Products />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/customers" element={<Customers />} />

            {/* Sales Module */}
            <Route path="/sales" element={<Sales />} />
            <Route path="/sales-register" element={<SalesRegister />} />
            <Route path="/invoice/:id" element={<Invoice />} />

            {/* Purchases Module */}
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchase-report" element={<PurchaseReport />} />

            {/* Accounting Module */}
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/vouchers" element={<Vouchers />} />

            {/* Fallback Catch-All Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}