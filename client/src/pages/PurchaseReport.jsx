import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function PurchaseReport() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selected purchase for detailed modal/view
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // 1. Fetch Purchases cleanly using useCallback
  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/purchases");
      setPurchases(res.data || []);
    } catch (err) {
      console.error("Error fetching purchases:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Trigger fetch on mount
  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // Handle printing selected purchase modal
  const handlePrint = () => {
    window.print();
  };

  // Filtered purchases list
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch =
        p.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
        p.purchaseNo?.toLowerCase().includes(search.toLowerCase()) ||
        p._id?.toLowerCase().includes(search.toLowerCase());

      const purchaseDate = p.date ? new Date(p.date) : null;
      let matchesDate = true;

      if (startDate && purchaseDate) {
        matchesDate = matchesDate && purchaseDate >= new Date(startDate);
      }
      if (endDate && purchaseDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && purchaseDate <= end;
      }

      return matchesSearch && matchesDate;
    });
  }, [purchases, search, startDate, endDate]);

  // Aggregate stats
  const totalAmountSum = useMemo(() => {
    return filteredPurchases.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);
  }, [filteredPurchases]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Purchase Report & Register</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track inward stock entries, supplier purchases, and purchase history.
          </p>
        </div>
        <button
          onClick={loadPurchases}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-2 rounded-md transition-colors border"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Entries</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filteredPurchases.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Purchase Value</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">₹{totalAmountSum.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Avg Purchase / Entry</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{filteredPurchases.length > 0 ? (totalAmountSum / filteredPurchases.length).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      {/* Search & Date Range Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Search Supplier / Bill #</label>
          <input
            type="text"
            placeholder="Search supplier or purchase no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 p-2 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-md text-sm w-full bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-md text-sm w-full bg-white"
          />
        </div>
      </div>

      {/* Purchase Register Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading purchase register...</div>
      ) : (
        <div className="overflow-x-auto shadow-sm border rounded-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bill / Purchase #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Supplier Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Items Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Amount (₹)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((p) => {
                  const items = p.items || [];
                  return (
                    <tr key={p._id || p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {p.purchaseNo || p._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {p.date ? new Date(p.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {p.supplierName || "General Supplier"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                        {items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                        ₹{Number(p.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => setSelectedPurchase(p)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs px-3 py-1.5 rounded transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-400">
                    No purchase records match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Purchase Detail Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border max-w-2xl w-full p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
            {/* Modal Actions (Hidden during print) */}
            <div className="flex justify-between items-center print:hidden">
              <h2 className="text-xl font-bold text-gray-800">Purchase Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded text-xs font-medium"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Sheet Content */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-start text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Supplier Name</p>
                  <p className="font-bold text-gray-900 text-base mt-0.5">
                    {selectedPurchase.supplierName || "General Supplier"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Bill / Purchase No</p>
                  <p className="font-semibold text-blue-600 mt-0.5">
                    {selectedPurchase.purchaseNo || selectedPurchase._id}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Date: {selectedPurchase.date ? new Date(selectedPurchase.date).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 text-left font-semibold text-gray-600">Item</th>
                    <th className="py-2 text-right font-semibold text-gray-600">Qty</th>
                    <th className="py-2 text-right font-semibold text-gray-600">Unit Cost (₹)</th>
                    <th className="py-2 text-right font-semibold text-gray-600">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(selectedPurchase.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium text-gray-800">
                        {item.productName || item.name}
                      </td>
                      <td className="py-2.5 text-right text-gray-700">{item.quantity}</td>
                      <td className="py-2.5 text-right text-gray-700">
                        ₹{Number(item.unitCost || item.costPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">
                        ₹{Number(item.totalCost || item.quantity * (item.unitCost || item.costPrice) || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-3 flex justify-end">
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-700">Total Purchase Value: </span>
                  <span className="text-lg font-extrabold text-blue-600 ml-2">
                    ₹{Number(selectedPurchase.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="text-right print:hidden pt-2 border-t">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-md text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}