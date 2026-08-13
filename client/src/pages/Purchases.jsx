import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Purchases() {
  const navigate = useNavigate();

  // Data collections
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [purchaseNo, setPurchaseNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState([]);

  // Line Item Entry State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  // 1. Fetch initial data cleanly before useEffect
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [suppRes, prodRes, purchRes] = await Promise.allSettled([
        api.get("/suppliers"),
        api.get("/products"),
        api.get("/purchases"),
      ]);

      if (suppRes.status === "fulfilled") setSuppliers(suppRes.value.data || []);
      if (prodRes.status === "fulfilled") setProducts(prodRes.value.data || []);
      if (purchRes.status === "fulfilled")
        setRecentPurchases(purchRes.value.data || []);
    } catch (err) {
      console.error("Error loading purchase data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Run effect on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle Supplier Select
  const handleSupplierChange = (e) => {
    const suppId = e.target.value;
    setSelectedSupplierId(suppId);
    if (suppId) {
      const found = suppliers.find((s) => (s._id || s.id) === suppId);
      setSupplierName(found ? found.name : "");
    } else {
      setSupplierName("");
    }
  };

  // Add Item to Purchase List
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const prod = products.find((p) => (p._id || p.id) === selectedProductId);
    if (!prod) return;

    const numQty = Number(quantity) || 1;
    const numCost = Number(unitCost) || 0;

    const existingIndex = items.findIndex(
      (i) => i.productId === selectedProductId
    );
    if (existingIndex > -1) {
      const updated = [...items];
      const newQty = updated[existingIndex].quantity + numQty;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        totalCost: newQty * numCost,
      };
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: selectedProductId,
          productName: prod.name,
          code: prod.code || "",
          quantity: numQty,
          unitCost: numCost,
          totalCost: numQty * numCost,
        },
      ]);
    }

    // Reset current item inputs
    setSelectedProductId("");
    setQuantity(1);
    setUnitCost(0);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate Total Purchase Amount
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  }, [items]);

  // Submit Purchase Entry
  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Please add at least one product item to save the purchase.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        supplierId: selectedSupplierId || null,
        supplierName: supplierName || "General Supplier",
        purchaseNo: purchaseNo || `PO-${Date.now()}`,
        date: purchaseDate,
        items,
        totalAmount,
      };

      await api.post("/purchases", payload);
      alert("Purchase entry saved successfully!");

      // Reset form & reload history
      setItems([]);
      setPurchaseNo("");
      setSelectedSupplierId("");
      setSupplierName("");
      loadInitialData();
    } catch (err) {
      console.error("Error creating purchase entry:", err);
      alert("Failed to save purchase entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading purchases module...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Purchases Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record vendor purchases and track recent restock bills.
        </p>
      </div>

      {/* New Purchase Entry Form */}
      <form onSubmit={handleSubmitPurchase} className="space-y-6">
        {/* Supplier & Header Metadata */}
        <div className="bg-white p-6 rounded-lg border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Supplier
            </label>
            <select
              value={selectedSupplierId}
              onChange={handleSupplierChange}
              className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm"
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO / Invoice Number
            </label>
            <input
              type="text"
              value={purchaseNo}
              onChange={(e) => setPurchaseNo(e.target.value)}
              placeholder="e.g. INV-9920"
              className="w-full border border-gray-300 p-2 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date *
            </label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white"
            />
          </div>
        </div>

        {/* Add Product Line Item Bar */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
          <h2 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
            Add Stock Item
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm"
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} {p.code ? `(${p.code})` : ""} - Current Stock:{" "}
                    {p.stock ?? 0}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Unit Purchase Cost (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            + Add to List
          </button>
        </div>

        {/* Added Items Table */}
        <div className="overflow-x-auto shadow-sm border rounded-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item / Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Unit Cost (₹)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Cost (₹)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.productName}
                      {item.code && (
                        <span className="text-gray-400 text-xs ml-2">
                          ({item.code})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-800">
                      ₹{item.unitCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ₹{item.totalCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-sm text-gray-400"
                  >
                    No items added yet. Choose a product above to add to this purchase entry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Submit Bar */}
        <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
          <div className="text-xl font-extrabold text-gray-900">
            Total Amount: ₹{totalAmount.toFixed(2)}
          </div>
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-md transition-colors"
          >
            {submitting ? "Saving..." : "Save Purchase Entry"}
          </button>
        </div>
      </form>

      {/* Recent Purchases List */}
      <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Recent Purchase History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  PO / Bill No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
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
              {recentPurchases.length > 0 ? (
                recentPurchases.map((purch) => (
                  <tr key={purch._id || purch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {purch.purchaseNo || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {purch.supplierName || "General Supplier"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {purch.date
                        ? new Date(purch.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                      ₹{Number(purch.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <button
                        onClick={() =>
                          navigate(`/purchase-detail/${purch._id || purch.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-6 text-center text-sm text-gray-400"
                  >
                    No purchase history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}