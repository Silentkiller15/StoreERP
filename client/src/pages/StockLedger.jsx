import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function StockLedger() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Declare loadProducts BEFORE useEffect with useCallback
  const loadProducts = useCallback(async () => {
    try {
      const res = await axios.get("https://mudhikhana.onrender.com/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  }, []);

  // 2. Declare loadLedger BEFORE useEffect with useCallback
  const loadLedger = useCallback(async () => {
    if (!selectedProduct) {
      setLedger([]);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `https://mudhikhana.onrender.com/stock-ledger/${selectedProduct}`
      );
      setLedger(res.data || []);
    } catch (err) {
      console.error("Error loading stock ledger:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedProduct]);

  // 3. Effects called AFTER function declarations
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Stock Ledger</h1>

      <div className="mb-6 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Product
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choose a Product --</option>
          {products.map((prod) => (
            <option key={prod._id || prod.id} value={prod._id || prod.id}>
              {prod.name} {prod.code ? `(${prod.code})` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading ledger data...</div>
      ) : !selectedProduct ? (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700">
          Please select a product from the dropdown above to view its transaction history.
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
                  Type / Reference
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In (Qty)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Out (Qty)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ledger.length > 0 ? (
                ledger.map((entry, index) => (
                  <tr key={entry._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.date
                        ? new Date(entry.date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {entry.type || "Transaction"} (#{entry.refNo || "N/A"})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-medium">
                      {entry.qtyIn > 0 ? `+${entry.qtyIn}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                      {entry.qtyOut > 0 ? `-${entry.qtyOut}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800">
                      {entry.balance ?? 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No stock movement recorded for this product yet.
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