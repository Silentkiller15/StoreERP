import { useEffect, useState } from "react";
import axios from "axios";

export default function Invoice({ saleId }) {
  const [sale, setSale] = useState(null);

  useEffect(() => {
    loadInvoice();
  }, []);

  const loadInvoice = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/sales/${saleId}`
      );
      setSale(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!sale) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  return (
    <div
      style={{
        width: "800px",
        margin: "20px auto",
        padding: 20,
        border: "1px solid #000",
        background: "#fff",
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        YOUR STORE NAME
      </h1>

      <p style={{ textAlign: "center" }}>
        Address | Phone | GST No.
      </p>

      <hr />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <b>Invoice No:</b> {sale.saleNo}
        </div>

        <div>
          <b>Date:</b> {sale.saleDate}
        </div>
      </div>

      <br />

      <div>
        <b>Customer:</b> {sale.customerName}
      </div>

      <br />

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
            <th>Product</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>GST</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td>{item.qty}</td>
              <td>₹ {Number(item.rate).toFixed(2)}</td>
              <td>{item.gst}%</td>
              <td>₹ {Number(item.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: 20,
          textAlign: "right",
        }}
      >
        <h3>Sub Total : ₹ {Number(sale.total).toFixed(2)}</h3>
        <h3>GST : ₹ {Number(sale.gst).toFixed(2)}</h3>
        <h2>Grand Total : ₹ {Number(sale.grandTotal).toFixed(2)}</h2>
      </div>

      <br />

      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "10px 25px",
            fontSize: 16,
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          🖨 Print Invoice
        </button>
      </div>
    </div>
  );
}