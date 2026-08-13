export default function ProductTable({
  products,
  editProduct,
  deleteProduct,
}) {
  return (
    <table
      border="1"
      cellPadding="10"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white",
      }}
    >
      <thead>
        <tr style={{ background: "#2563eb", color: "white" }}>
          <th>Code</th>
          <th>Name</th>
          <th>Category</th>
          <th>Unit</th>
          <th>Purchase</th>
          <th>Selling</th>
          <th>GST</th>
          <th>Stock</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {products.length === 0 ? (
          <tr>
            <td colSpan="9" style={{ textAlign: "center" }}>
              No Products Found
            </td>
          </tr>
        ) : (
          products.map((p) => (
            <tr key={p.id}>
              <td>{p.code}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.unit}</td>
              <td>{p.purchase}</td>
              <td>{p.selling}</td>
              <td>{p.gst}</td>
              <td>{p.stock}</td>

              <td>
                <button
                  onClick={() => editProduct(p)}
                  style={{
                    background: "orange",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "8px",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(p.id)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}