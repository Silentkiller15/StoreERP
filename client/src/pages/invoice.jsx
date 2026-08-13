import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function Invoice() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Declare fetch function BEFORE useEffect
  const loadSaleDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/sales/${id}`);
      setSale(res.data || null);
    } catch (err) {
      console.error("Error fetching invoice details:", err);
      setError("Failed to load invoice details. The sale record may not exist.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 2. Trigger effect cleanly
  useEffect(() => {
    loadSaleDetails();
  }, [loadSaleDetails]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
  }

  if (error || !sale) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error || "Invoice not found."}
        </div>
        <Link
          to="/sales-register"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          &larr; Back to Sales Register
        </Link>
      </div>
    );
  }

  const items = sale.items || [];
  const subtotal = Number(sale.subtotal) || Number(sale.totalAmount) || 0;
  const discount = Number(sale.discount) || 0;
  const totalAmount = Number(sale.totalAmount) || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden during print) */}
      <div className="print:hidden flex justify-between items-center">
        <Link
          to="/sales-register"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          &larr; Back to Sales Register
        </Link>
        <button
          onClick={handlePrint}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
        >
          🖨️ Print Invoice
        </button>
      </div>

      {/* Printable Invoice Sheet */}
      <div className="bg-white p-8 rounded-lg border shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mudhikhana</h1>
            <p className="text-xs text-gray-500 mt-1">Grocery & Daily Needs Store</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-emerald-600 uppercase">Tax Invoice</h2>
            <p className="text-xs text-gray-500 mt-1">Invoice #: {sale.invoiceNo || sale._id}</p>
            <p className="text-xs text-gray-500">
              Date: {sale.date ? new Date(sale.date).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        {/* Billed To / Store Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-gray-500 uppercase text-xs">Customer Details:</h3>
            <p className="font-bold text-gray-800 text-base mt-1">
              {sale.customerName || "Walk-in Customer"}
            </p>
            {sale.customerPhone && <p className="text-gray-600">Phone: {sale.customerPhone}</p>}
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-gray-500 uppercase text-xs">Payment Method:</h3>
            <p className="font-medium text-gray-800 mt-1">{sale.paymentMethod || "Cash"}</p>
          </div>
        </div>

        {/* Item Breakdown Table */}
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 text-left font-semibold text-gray-600">#</th>
              <th className="py-2 text-left font-semibold text-gray-600">Item Description</th>
              <th className="py-2 text-right font-semibold text-gray-600">Qty</th>
              <th className="py-2 text-right font-semibold text-gray-600">Rate (₹)</th>
              <th className="py-2 text-right font-semibold text-gray-600">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index}>
                  <td className="py-3 text-gray-400 text-xs">{index + 1}</td>
                  <td className="py-3 font-medium text-gray-800">
                    {item.productName}
                    {item.code && <span className="text-xs text-gray-400 ml-1">({item.code})</span>}
                  </td>
                  <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-700">
                    ₹{Number(item.unitPrice || 0).toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-semibold text-gray-900">
                    ₹{Number(item.totalPrice || item.quantity * item.unitPrice || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-400">
                  No line items in this invoice.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div className="border-t pt-4 flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2">
              <span>Total Paid:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t pt-6 text-center text-xs text-gray-400 space-y-1">
          <p>Thank you for shopping with Mudhikhana!</p>
          <p>Computer generated invoice, no signature required.</p>
        </div>
      </div>
    </div>
  );
}