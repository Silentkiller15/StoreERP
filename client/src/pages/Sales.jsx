import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Sales() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);

  // Current Item Input State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  // 1. Declare fetch functions BEFORE useEffect
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [custRes, prodRes] = await Promise.allSettled([
        api.get("/customers"),
        api.get("/products"),
      ]);

      if (custRes.status === "fulfilled") setCustomers(custRes.value.data || []);
      if (prodRes.status === "fulfilled") setProducts(prodRes.value.data || []);
    } catch (err) {
      console.error("Error loading sales form data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Trigger effect cleanly
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle Customer Selection
  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (custId) {
      const found = customers.find((c) => (c._id || c.id) === custId);
      setCustomerName(found ? found.name : "");
    }
  };

  // Handle Product Selection for Line Item
  const handleProductChange = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    if (prodId) {
      const prod = products.find((p) => (p._id || p.id) === prodId);
      if (prod) {
        setUnitPrice(Number(prod.price) || 0);
      }
    } else {
      setUnitPrice(0);
    }
  };

  // Add Item to Line List
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const prod = products.find((p) => (p._id || p.id) === selectedProductId);
    if (!prod) return;

    const numQty = Number(quantity) || 1;
    const numPrice = Number(unitPrice) || 0;

    // Check if item already exists in list
    const existingIndex = items.findIndex((i) => i.productId === selectedProductId);
    if (existingIndex > -1) {
      const updated = [...items];
      const newQty = updated[existingIndex].quantity + numQty;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        totalPrice: newQty * numPrice,
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
          unitPrice: numPrice,
          totalPrice: numQty * numPrice,
        },
      ]);
    }

    // Reset Line Item Inputs
    setSelectedProductId("");
    setQuantity(1);
    setUnitPrice(0);
  };

  // Remove Item from Line List
  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Computed Totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    const disc = Number(discount) || 0;
    return Math.max(0, subtotal - disc);
  }, [subtotal, discount]);

  // Submit Sale Form
  const handleSubmitSale = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Please add at least one product item to complete the sale.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerId: selectedCustomerId || null,
        customerName: customerName || "Walk-in Customer",
        date: saleDate,
        items,
        subtotal,
        discount: Number(discount) || 0,
        totalAmount,
      };

      const res = await api.post("/sales", payload);
      alert("Sale recorded successfully!");
      
      const newSaleId = res.data?._id || res.data?.id;
      if (newSaleId) {
        navigate(`/invoice/${newSaleId}`);
      } else {
        navigate("/sales-register");
      }
    } catch (err) {
      console.error("Error creating sale:", err);
      alert("Failed to record sale. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading form components...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">New Sale Entry</h1>

      <form onSubmit={handleSubmitSale} className="space-y-6">
        {/* Customer & Header Details */}
        <div className="bg-white p-6 rounded-lg border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={handleCustomerChange}
              className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm"
            >
              <option value="">-- Walk-in Customer --</option>
              {customers.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name / Notes
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer"
              className="w-full border border-gray-300 p-2 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Date *
            </label>
            <input
              type="date"
              required
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white"
            />
          </div>
        </div>

        {/* Product Selection Bar */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-2">
          <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
            Add Product Item
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={handleProductChange}
                className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm"
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} {p.code ? `(${p.code})` : ""} - Stock: {p.stock ?? 0}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Unit Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            + Add to List
          </button>
        </div>

        {/* Selected Items Table */}
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
                  Unit Price (₹)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total (₹)
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
                      {item.code && <span className="text-gray-400 text-xs ml-2">({item.code})</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-800">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-800">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ₹{item.totalPrice.toFixed(2)}
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
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-400">
                    No items added to sale yet. Choose a product above to add.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total & Checkout Section */}
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">Discount Amount (₹):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="border border-gray-300 p-2 rounded-md text-sm w-32"
              />
            </div>
          </div>

          <div className="text-right space-y-1">
            <p className="text-sm text-gray-500">Subtotal: ₹{subtotal.toFixed(2)}</p>
            <p className="text-2xl font-extrabold text-gray-900">
              Total: ₹{totalAmount.toFixed(2)}
            </p>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-md transition-colors"
            >
              {submitting ? "Processing..." : "Complete & Print Sale"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}