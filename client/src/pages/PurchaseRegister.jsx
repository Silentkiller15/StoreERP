import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function PurchaseRegister() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // 1. Declare fetch function BEFORE useEffect using useCallback
  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/purchases");
      setPurchases(res.data || []);
    } catch (err) {
      console.error("Error fetching purchase register:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Trigger effect after function declaration
  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // 3. Memoized filter for performance
  const filteredPurchases = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return purchases;

    return purchases.filter((item) => {
      const purchaseNoMatch = item.purchaseNo?.toLowerCase().includes(keyword);
      const supplierMatch = item.supplierName?.toLowerCase().includes(keyword);
      return purchaseNoMatch || supplierMatch;
    });
  }, [purchases, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Register</h1>
        <Link
          to="/purchase-entry"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          + New Purchase Entry
        </Link>
      </div>

      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search by PO Number or Supplier Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading purchase entries...</div>
      ) : (
        <div className="overflow-x-auto shadow-sm border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase / PO No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
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
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {p.purchaseNo || p._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {p.date ? new Date(p.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.supplierName || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      ₹{Number(p.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Link
                        to={`/purchase/${p._id || p.id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No purchase records found matching your query.
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