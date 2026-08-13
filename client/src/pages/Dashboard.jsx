import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // 1. Declare fetch function BEFORE useEffect using useCallback
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch overview metric endpoints in parallel
      const [salesRes, purchasesRes, customersRes, productsRes] = await Promise.allSettled([
        api.get("/sales"),
        api.get("/purchases"),
        api.get("/customers"),
        api.get("/products"),
      ]);

      const salesList = salesRes.status === "fulfilled" ? salesRes.value.data || [] : [];
      const purchasesList = purchasesRes.status === "fulfilled" ? purchasesRes.value.data || [] : [];
      const customersList = customersRes.status === "fulfilled" ? customersRes.value.data || [] : [];
      const productsList = productsRes.status === "fulfilled" ? productsRes.value.data || [] : [];

      const totalSales = salesList.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
      const totalPurchases = purchasesList.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
      const lowStockCount = productsList.filter((p) => (Number(p.stock) || 0) <= 5).length;

      setStats({
        totalSales,
        totalPurchases,
        totalCustomers: customersList.length,
        totalProducts: productsList.length,
        lowStockCount,
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Trigger effect after function declaration
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of your store's sales, inventory, and activities.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 font-medium">
          Loading metrics...
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Total Revenue
              </span>
              <p className="text-2xl font-extrabold text-gray-900 mt-2">
                ₹{stats.totalSales.toFixed(2)}
              </p>
              <Link
                to="/sales-register"
                className="text-xs text-emerald-600 hover:underline mt-4 inline-block font-semibold"
              >
                View Sales Register &rarr;
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Total Purchases
              </span>
              <p className="text-2xl font-extrabold text-gray-900 mt-2">
                ₹{stats.totalPurchases.toFixed(2)}
              </p>
              <Link
                to="/purchase-report"
                className="text-xs text-blue-600 hover:underline mt-4 inline-block font-semibold"
              >
                View Purchase Report &rarr;
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Active Customers
              </span>
              <p className="text-2xl font-extrabold text-gray-900 mt-2">
                {stats.totalCustomers}
              </p>
              <Link
                to="/customers"
                className="text-xs text-purple-600 hover:underline mt-4 inline-block font-semibold"
              >
                Manage Customers &rarr;
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Products in Stock
              </span>
              <p className="text-2xl font-extrabold text-gray-900 mt-2">
                {stats.totalProducts}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {stats.lowStockCount} items low in stock
              </p>
              <Link
                to="/stock"
                className="text-xs text-amber-600 hover:underline mt-2 inline-block font-semibold"
              >
                View Stock &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/sales"
                className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-800 font-semibold text-center transition-colors"
              >
                + New Sale
              </Link>
              <Link
                to="/purchase-entry"
                className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-800 font-semibold text-center transition-colors"
              >
                + New Purchase
              </Link>
              <Link
                to="/vouchers"
                className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-indigo-800 font-semibold text-center transition-colors"
              >
                Voucher Entry
              </Link>
              <Link
                to="/trial-balance"
                className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-800 font-semibold text-center transition-colors"
              >
                Trial Balance
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}