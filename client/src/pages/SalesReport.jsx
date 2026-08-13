import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function SalesReport() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 1. Declare async function BEFORE useEffect
  const loadSalesReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get("https://mudhikhana.onrender.com/sales/report", {
        params,
      });
      setSales(res.data || []);
    } catch (err) {
      console.error("Error fetching sales report:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // 2. Trigger effect after function declaration
  useEffect(() => {
    loadSalesReport();
  }, [loadSalesReport]);

  const totalSalesAmount = sales.reduce(
    (sum, item) => sum + (Number(item.totalAmount) || 0),
    0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales Report</h1>

      {/* Date Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6 bg-gray-50 p-4 rounded-lg border">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-md bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-md bg-white"
          />
        </div>
        <button
          onClick={loadSalesReport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Apply Filter
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Generating report...</div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg shadow-sm mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Invoice No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.length > 0 ? (
                  sales.map((s) => (
                    <tr key={s._id || s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {s.saleNo || s._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {s.date ? new Date(s.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {s.customerName || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        ₹{Number(s.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                      No sales records found for the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end p-4 bg-emerald-50 rounded-lg font-bold text-lg text-emerald-800 border border-emerald-200">
            Total Sales: ₹{totalSalesAmount.toFixed(2)}
          </div>
        </>
      )}
    </div>
  );
}