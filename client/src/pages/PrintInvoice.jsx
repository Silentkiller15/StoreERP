import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PrintInvoice() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
  loadInvoice();
}, [id]);

  const loadInvoice = async () => {
    try {
      const loadInvoice = async () => {
  try {
    const saleRes = await axios.get(
      `https://mudhikhana.onrender.com/sales/${id}`
    );

    const companyRes = await axios.get(
      "https://mudhikhana.onrender.com/company"
    );

    setSale(saleRes.data);
    setCompany(companyRes.data);
  } catch (err) {
    console.log(err);
  }
};
    } catch (err) {
      console.log(err);
    }
  };

  if (!sale || !company) {
  return <div>Loading Invoice...</div>;
}

  return (
    <div
      style={{
        width: "800px",
        margin: "20px auto",
        background: "#fff",
        padding: "30px",
        border: "2px solid black",
        fontFamily: "Arial",
      }}
    >
      <style>
{`
@media print{
  .no-print{
    display:none;
  }

  body{
    margin:0;
  }

  @page{
    size:A4;
    margin:15mm;
  }
}

table{
  border-collapse:collapse;
}

th,td{
  border:1px solid black;
  padding:8px;
}
`}
</style>

      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>
  {company?.name}
</h1>

        <p style={{ margin: 3 }}>
          123 Main Road, Chennai - 600001
        </p>

        <p style={{ margin: 3 }}>
  Phone : {company?.phone || ""}
</p>

        <p style={{ margin: 3 }}>
  {company?.address || ""}
</p>

        <p style={{ margin: 3 }}>
  GSTIN : {company?.gstin || ""}
</p>
        <h2
          style={{
            borderTop: "2px solid black",
            borderBottom: "2px solid black",
            padding: 8,
            marginTop: 15,
          }}
        >
          TAX INVOICE
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <div>
          <b>Invoice No :</b> {sale.saleNo}
        </div>

        <div>
          <b>Date :</b> {sale.saleDate}
        </div>
      </div>

      <div style={{ marginTop: 15 }}>
        <b>Bill To</b>
        <br />
        {sale.customerName}
      </div>

      <table
        style={{
          width: "100%",
          marginTop: 20,
        }}
      >
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>GST %</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {sale.items.map((item, index) => (
            <tr key={index}>
              <td align="center">{index + 1}</td>

              <td>{item.productName}</td>

              <td align="center">{item.qty}</td>

              <td align="right">
                ₹ {Number(item.rate).toFixed(2)}
              </td>

              <td align="center">
                {item.gst}%
              </td>

              <td align="right">
                ₹ {Number(item.total).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          width: "320px",
          marginLeft: "auto",
          marginTop: 25,
        }}
      >
        <table style={{ width: "100%" }}>
          <tbody>
            <tr>
              <td>Sub Total</td>
              <td align="right">
                ₹ {Number(sale.total).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td>GST</td>
              <td align="right">
                ₹ {Number(sale.gst).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td>
                <b>Grand Total</b>
              </td>

              <td align="right">
                <b>
                  ₹ {Number(sale.grandTotal).toFixed(2)}
                </b>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 80,
        }}
      >
        <div>
          <b>Customer Signature</b>
        </div>

        <div style={{ textAlign: "center" }}>
          <b>For ABC STORE ERP</b>

          <br />
          <br />
          <br />

          Authorized Signature
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 50,
          fontStyle: "italic",
        }}
      >
        Thank you for your business!
      </div>

      <div
        className="no-print"
        style={{
          textAlign: "center",
          marginTop: 30,
        }}
      >
        <button
          onClick={() => window.print()}
          style={{
            padding: "12px 30px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          🖨 Print Invoice
        </button>
      </div>
    </div>
  );
}