import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function SalesRegister() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // 1. Declare fetch function BEFORE useEffect
  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://mudhikhana.onrender.com/sales");
      setSales(res.data || []);
    } catch (err) {
      console.error("Error fetching sales register:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Trigger effect after function declaration
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // 3. Memoized filter prevents re-calculating on every unrelated render
  const filteredSales = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sales;

    return sales.filter((item) => {
      const saleNoMatch = item.saleNo?.toLowerCase().includes(keyword);
      const customerMatch = item.customerName?.toLowerCase().includes(keyword);
      return saleNoMatch || customerMatch;
    });
  }, [sales, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Sales Register</h1>
        <Link
          to="/sales"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          + New Sale Entry
        </Link>
      </div>

      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search by Invoice No or Customer Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading sales entries...</div>
      ) : (
        <div className="overflow-x-auto shadow-sm border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale / Invoice No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount (₹)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length > 0 ? (
                filteredSales.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {s.saleNo || s._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {s.date ? new Date(s.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {s.customerName || "Walk-in Customer"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      ₹{Number(s.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Link
                        to={`/invoice/${s._id || s.id}`}
                        className="text-emerald-600 hover:text-emerald-900 font-medium"
                      >
                        View Invoice
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No sales entries found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}