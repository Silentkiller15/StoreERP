export default function SupplierTable({
  suppliers,
  editSupplier,
  deleteSupplier,
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
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Mobile</th>
          <th>Email</th>
          <th>Address</th>
          <th>GST</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {suppliers.map((s) => (
          <tr key={s.id}>
            <td>{s.code}</td>
            <td>{s.name}</td>
            <td>{s.mobile}</td>
            <td>{s.email}</td>
            <td>{s.address}</td>
            <td>{s.gst}</td>

            <td>
              <button
                onClick={() => editSupplier(s)}
                style={{
                  marginRight: 10,
                }}
              >
                Edit
              </button>

              <button
                onClick={() => deleteSupplier(s.id)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}

        {suppliers.length === 0 && (
          <tr>
            <td
              colSpan="7"
              style={{
                textAlign: "center",
                padding: 20,
              }}
            >
              No suppliers found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}