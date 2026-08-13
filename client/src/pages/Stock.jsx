import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // 1. Declare data fetching function BEFORE useEffect using useCallback
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://mudhikhana.onrender.com/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. useEffect defined AFTER the function declaration
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filter products based on search term
  const filteredProducts = products.filter((p) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      p.name?.toLowerCase().includes(keyword) ||
      p.category?.toLowerCase().includes(keyword) ||
      p.code?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Inventory</h1>
        <button
          onClick={loadProducts}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Refresh Stock
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products by name, code, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-500 font-medium">Loading stock items...</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-sm border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price (₹)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {p.code || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.category || "General"}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                        (p.stock || 0) <= 5 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {p.stock ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      ₹{Number(p.price || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No products found matching your search.
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