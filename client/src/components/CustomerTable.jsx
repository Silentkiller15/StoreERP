export default function CustomerTable({
  customers,
  editCustomer,
  deleteCustomer,
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
        {customers.map((c) => (
          <tr key={c.id}>
            <td>{c.code}</td>
            <td>{c.name}</td>
            <td>{c.mobile}</td>
            <td>{c.email}</td>
            <td>{c.address}</td>
            <td>{c.gst}</td>

            <td>
              <button onClick={() => editCustomer(c)}>
                Edit
              </button>

              <button
                onClick={() => deleteCustomer(c.id)}
                style={{
                  marginLeft: 10,
                  background: "red",
                  color: "white",
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}