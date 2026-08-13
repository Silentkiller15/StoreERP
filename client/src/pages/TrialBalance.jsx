import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function TrialBalance() {
  const [trialData, setTrialData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [asOfDate, setAsOfDate] = useState("");

  // 1. Declare async fetch function BEFORE useEffect
  const loadTrialBalance = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (asOfDate) params.date = asOfDate;

      const res = await axios.get("https://mudhikhana.onrender.com/reports/trial-balance", {
        params,
      });
      setTrialData(res.data || []);
    } catch (err) {
      console.error("Error loading trial balance:", err);
    } finally {
      setLoading(false);
    }
  }, [asOfDate]);

  // 2. Effect calls loadTrialBalance cleanly
  useEffect(() => {
    loadTrialBalance();
  }, [loadTrialBalance]);

  // Calculate overall totals safely
  const totalDebit = trialData.reduce(
    (sum, row) => sum + (Number(row.debit) || 0),
    0
  );
  const totalCredit = trialData.reduce(
    (sum, row) => sum + (Number(row.credit) || 0),
    0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Trial Balance</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">As of Date:</label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-md bg-white text-sm"
          />
          <button
            onClick={loadTrialBalance}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Calculating Trial Balance...</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Group / Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit (₹)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit (₹)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trialData.length > 0 ? (
                trialData.map((row, idx) => (
                  <tr key={row.accountId || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.accountName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.group || "General Ledger"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                      {row.debit > 0 ? `₹${Number(row.debit).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                      {row.credit > 0 ? `₹${Number(row.credit).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                    No ledger entries available to build trial balance.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
              <tr>
                <td colSpan="2" className="px-6 py-4 text-sm text-gray-900 uppercase">
                  Total
                </td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  ₹{totalDebit.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  ₹{totalCredit.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}