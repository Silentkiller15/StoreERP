import { useState, useEffect } from "react";
import axios from "axios";

export default function Sales() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [saleNo] = useState(
    "SO" + Math.floor(Math.random() * 100000)
  );

  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [customerId, setCustomerId] = useState("");

  const [items, setItems] = useState([]);

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/customers");
      setCustomers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/products");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };
    const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        qty: 1,
        rate: 0,
        gst: 0,
        total: 0,
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const data = [...items];

    data[index][field] = value;

    if (field === "productId") {
      const p = products.find((x) => x.id == value);

      if (p) {
        data[index].rate = Number(p.selling);
        data[index].gst = Number(p.gst);
      }
    }

    data[index].total =
      Number(data[index].qty) *
      Number(data[index].rate);

    setItems(data);
  };

  const removeItem = (index) => {
    const data = [...items];
    data.splice(index, 1);
    setItems(data);
  };

  const subTotal = items.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );

  const gstTotal = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.total) * Number(item.gst)) / 100,
    0
  );

  const grandTotal = subTotal + gstTotal;

  const saveSale = async () => {
    try {
      await axios.post("http://localhost:5000/sales", {
        saleNo,
        customerId,
        saleDate,
        total: subTotal,
        gst: gstTotal,
        grandTotal,
        items,
      });

      alert("Sale Saved Successfully");

      window.location.reload();
    } catch (err) {
      console.log(err);
      alert("Error Saving Sale");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Sales Entry</h1>
            <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
          marginTop: 20,
        }}
      >
        <div>
          <label>Sale No</label>
          <br />
          <input
            value={saleNo}
            readOnly
            style={{ padding: 5, width: 150 }}
          />
        </div>

        <div>
          <label>Date</label>
          <br />
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            style={{ padding: 5 }}
          />
        </div>

        <div>
          <label>Customer</label>
          <br />
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            style={{ padding: 5, width: 220 }}
          >
            <option value="">Select Customer</option>

            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={addItem}
        style={{
          padding: "8px 15px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        + Add Product
      </button>

      <table
        border="1"
        cellPadding="8"
        style={{
          width: "100%",
          marginTop: 20,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>GST %</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
  {items.map((item, index) => (
    <tr key={index}>
              <td>
                <select
                  value={item.productId}
                  onChange={(e) =>
                    updateItem(index, "productId", e.target.value)
                  }
                  style={{ width: "200px", padding: "5px" }}
                >
                  <option value="">Select Product</option>

                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <input
                  type="number"
                  value={item.qty}
                  min="1"
                  onChange={(e) =>
                    updateItem(index, "qty", e.target.value)
                  }
                  style={{ width: "70px" }}
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) =>
                    updateItem(index, "rate", e.target.value)
                  }
                  style={{ width: "90px" }}
                />
              </td>

              <td style={{ textAlign: "center" }}>
                {item.gst}%
              </td>

              <td style={{ textAlign: "right" }}>
                ₹ {Number(item.total).toFixed(2)}
              </td>

              <td>
                <button
                  onClick={() => removeItem(index)}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
            <div
        style={{
          marginTop: 20,
          width: "300px",
          marginLeft: "auto",
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <strong>Sub Total</strong>
          <span>₹ {subTotal.toFixed(2)}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <strong>GST</strong>
          <span>₹ {gstTotal.toFixed(2)}</span>
        </div>

        <hr />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          <span>Grand Total</span>
          <span>₹ {grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={saveSale}
        style={{
          marginTop: 20,
          background: "#16a34a",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        💾 Save Sale
      </button>
            <button
        onClick={() => {
          setItems([]);
          setCustomerId("");
          setSaleDate(
            new Date().toISOString().split("T")[0]
          );
        }}
        style={{
          marginTop: 20,
          marginLeft: 10,
          background: "#6b7280",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        🔄 Clear
      </button>

      {items.length === 0 && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "#fef3c7",
            borderRadius: 8,
          }}
        >
          <b>No products added.</b> Click
          <b> + Add Product </b>
          to start creating a sale.
        </div>
      )}
            <div style={{ marginTop: 30 }}>
        <h3>Sale Summary</h3>

        <table
          border="1"
          cellPadding="8"
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th align="left">Description</th>
              <th align="right">Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Sub Total</td>
              <td align="right">
                ₹ {subTotal.toFixed(2)}
              </td>
            </tr>

            <tr>
              <td>GST</td>
              <td align="right">
                ₹ {gstTotal.toFixed(2)}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Grand Total</strong>
              </td>
              <td align="right">
                <strong>
                  ₹ {grandTotal.toFixed(2)}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
          </div>
    </div>
  );
}
      