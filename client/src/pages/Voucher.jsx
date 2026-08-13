import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [voucherType, setVoucherType] = useState("Payment");
  const [voucherNo, setVoucherNo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [debitAccountId, setDebitAccountId] = useState("");
  const [creditAccountId, setCreditAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  // Search/Filter State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // 1. Declare fetch functions BEFORE useEffect
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [vouchersRes, accountsRes] = await Promise.allSettled([
        api.get("/vouchers"),
        api.get("/accounts"),
      ]);

      if (vouchersRes.status === "fulfilled") {
        setVouchers(vouchersRes.value.data || []);
      }
      if (accountsRes.status === "fulfilled") {
        setAccounts(accountsRes.value.data || []);
      }
    } catch (err) {
      console.error("Error loading voucher data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Trigger effect on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const resetForm = () => {
    setVoucherType("Payment");
    setVoucherNo("");
    setDate(new Date().toISOString().split("T")[0]);
    setDebitAccountId("");
    setCreditAccountId("");
    setAmount("");
    setNarration("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!debitAccountId || !creditAccountId) {
      alert("Please select both Debit and Credit accounts.");
      return;
    }
    if (debitAccountId === creditAccountId) {
      alert("Debit and Credit accounts cannot be the same.");
      return;
    }

    try {
      setSubmitting(true);
      const debitAcc = accounts.find((a) => (a._id || a.id) === debitAccountId);
      const creditAcc = accounts.find((a) => (a._id || a.id) === creditAccountId);

      const payload = {
        voucherType,
        voucherNo: voucherNo || `VCH-${Date.now()}`,
        date,
        debitAccountId,
        debitAccountName: debitAcc ? debitAcc.name : "",
        creditAccountId,
        creditAccountName: creditAcc ? creditAcc.name : "",
        amount: Number(amount) || 0,
        narration,
      };

      await api.post("/vouchers", payload);
      alert("Voucher saved successfully!");
      resetForm();
      loadInitialData();
    } catch (err) {
      console.error("Error saving voucher:", err);
      alert("Failed to save voucher. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    try {
      await api.delete(`/vouchers/${id}`);
      loadInitialData();
    } catch (err) {
      console.error("Error deleting voucher:", err);
    }
  };

  // Filtered Vouchers List
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchesSearch =
        v.voucherNo?.toLowerCase().includes(search.toLowerCase()) ||
        v.narration?.toLowerCase().includes(search.toLowerCase()) ||
        v.debitAccountName?.toLowerCase().includes(search.toLowerCase()) ||
        v.creditAccountName?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "ALL" || v.voucherType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [vouchers, search, typeFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Voucher Entry & Register</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create receipt, payment, and journal accounting vouchers.
        </p>
      </div>

      {/* New Voucher Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">New Voucher Entry</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher Type *
            </label>
            <select
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm"
            >
              <option value="Payment">Payment Voucher</option>
              <option value="Receipt">Receipt Voucher</option>
              <option value="Journal">Journal Voucher</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher Number
            </label>
            <input
              type="text"
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full border border-gray-300 p-2 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Debit Account (Dr) *
            </label>
            <select
              required
              value={debitAccountId}
              onChange={(e) => setDebitAccountId(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm"
            >
              <option value="">-- Select Debit Account --</option>
              {accounts.map((a) => (
                <option key={a._id || a.id} value={a._id || a.id}>
                  {a.name} ({a.type || "General"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Account (Cr) *
            </label>
            <select
              required
              value={creditAccountId}
              onChange={(e) => setCreditAccountId(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm"
            >
              <option value="">-- Select Credit Account --</option>
              {accounts.map((a) => (
                <option key={a._id || a.id} value={a._id || a.id}>
                  {a.name} ({a.type || "General"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 p-2 rounded-md text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Narration / Description
          </label>
          <input
            type="text"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="e.g. Paid cash for office stationery expenses"
            className="w-full border border-gray-300 p-2 rounded-md text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-md transition-colors"
        >
          {submitting ? "Saving Voucher..." : "Save Voucher"}
        </button>
      </form>

      {/* Filter & Register */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
          <input
            type="text"
            placeholder="Search by voucher no, account, or narration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 p-2 rounded-md text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 p-2 rounded-md text-sm bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="Payment">Payment</option>
              <option value="Receipt">Receipt</option>
              <option value="Journal">Journal</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading vouchers...</div>
        ) : (
          <div className="overflow-x-auto shadow-sm border rounded-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Voucher No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type / Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Debit (Dr) / Credit (Cr)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Narration
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount (₹)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVouchers.length > 0 ? (
                  filteredVouchers.map((v) => (
                    <tr key={v._id || v.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {v.voucherNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold mr-2">
                          {v.voucherType}
                        </span>
                        {v.date ? new Date(v.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <div><strong className="text-emerald-700">Dr:</strong> {v.debitAccountName || "N/A"}</div>
                        <div><strong className="text-blue-700">Cr:</strong> {v.creditAccountName || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {v.narration || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                        ₹{Number(v.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleDelete(v._id || v.id)}
                          className="text-red-600 hover:text-red-900 font-medium text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-400">
                      No vouchers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}