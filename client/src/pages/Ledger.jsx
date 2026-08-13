import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";

export default function Ledger() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch available accounts BEFORE useEffect
  const loadAccounts = useCallback(async () => {
    try {
      const res = await api.get("/accounts");
      setAccounts(res.data || []);
    } catch (err) {
      console.error("Error loading accounts:", err);
    }
  }, []);

  // 2. Fetch selected account ledger entries BEFORE useEffect
  const loadLedger = useCallback(async () => {
    if (!selectedAccount) {
      setLedgerEntries([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/ledger/${selectedAccount}`);
      setLedgerEntries(res.data || []);
    } catch (err) {
      console.error("Error loading ledger:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount]);

  // 3. Trigger effects cleanly after declarations
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  // Memoized total debit and credit calculations
  const totals = useMemo(() => {
    return ledgerEntries.reduce(
      (acc, entry) => {
        acc.debit += Number(entry.debit) || 0;
        acc.credit += Number(entry.credit) || 0;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [ledgerEntries]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Account Ledger</h1>

      <div className="max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Account
        </label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">-- Choose an Account --</option>
          {accounts.map((acc) => (
            <option key={acc._id || acc.id} value={acc._id || acc.id}>
              {acc.name} ({acc.type || "General"})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading ledger transactions...</div>
      ) : !selectedAccount ? (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700 rounded">
          Please select an account from the dropdown above to view its statement.
        </div>
      ) : (
        <div className="overflow-x-auto shadow-sm border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Particulars / Reference
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit (₹)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit (₹)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance (₹)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ledgerEntries.length > 0 ? (
                ledgerEntries.map((entry, idx) => (
                  <tr key={entry._id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.date ? new Date(entry.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {entry.particulars || "Transaction"} (#{entry.refNo || "N/A"})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {entry.debit > 0 ? `₹${Number(entry.debit).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {entry.credit > 0 ? `₹${Number(entry.credit).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800">
                      ₹{Number(entry.balance || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No transactions found for this account.
                  </td>
                </tr>
              )}
            </tbody>
            {ledgerEntries.length > 0 && (
              <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-sm text-gray-900 uppercase">
                    Total
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    ₹{totals.debit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    ₹{totals.credit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-blue-700">
                    ₹{(totals.debit - totals.credit).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}