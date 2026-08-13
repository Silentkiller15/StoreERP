import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

export default function VoucherDetail() {
  const { id } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Unused `accounts` state removed to resolve ESLint `no-unused-vars`

  // 1. Declare fetch function BEFORE useEffect using useCallback
  const loadVoucherDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`https://mudhikhana.onrender.com/vouchers/${id}`);
      setVoucher(res.data);
    } catch (err) {
      console.error("Error loading voucher detail:", err);
      setError("Failed to load voucher details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 2. Execute useEffect AFTER function declaration
  useEffect(() => {
    loadVoucherDetail();
  }, [loadVoucherDetail]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-gray-500">
        Loading voucher details...
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error || "Voucher not found."}
        </div>
        <Link to="/vouchers" className="text-blue-600 hover:underline">
          &larr; Back to Vouchers
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Voucher #{voucher.voucherNo || voucher._id}
        </h1>
        <Link
          to="/vouchers"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors"
        >
          Back to List
        </Link>
      </div>

      <div className="bg-white shadow border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <span className="text-sm font-medium text-gray-500 block">Date</span>
            <span className="text-gray-900">
              {voucher.date ? new Date(voucher.date).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 block">Type</span>
            <span className="text-gray-900 capitalize">{voucher.type || "General"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <span className="text-sm font-medium text-gray-500 block">Debit Account</span>
            <span className="text-gray-900 font-semibold">
              {voucher.debitAccountName || voucher.debitAccountId || "—"}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 block">Credit Account</span>
            <span className="text-gray-900 font-semibold">
              {voucher.creditAccountName || voucher.creditAccountId || "—"}
            </span>
          </div>
        </div>

        <div className="border-b pb-4">
          <span className="text-sm font-medium text-gray-500 block">Total Amount</span>
          <span className="text-2xl font-bold text-emerald-600">
            ₹{Number(voucher.amount || 0).toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-500 block">Narration / Remarks</span>
          <p className="text-gray-700 italic mt-1">
            {voucher.narration || voucher.remarks || "No narration provided."}
          </p>
        </div>
      </div>
    </div>
  );
}