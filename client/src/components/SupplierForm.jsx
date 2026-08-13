export default function SupplierForm({
  form,
  handleChange,
  saveSupplier,
  editId,
}) {
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
      }}
    >
      <input
        placeholder="Supplier Code"
        name="code"
        value={form.code}
        onChange={handleChange}
      />

      <input
        placeholder="Supplier Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        style={{ marginLeft: 10 }}
      />

      <input
        placeholder="Mobile"
        name="mobile"
        value={form.mobile}
        onChange={handleChange}
        style={{ marginLeft: 10 }}
      />

      <br />
      <br />

      <input
        placeholder="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        placeholder="Address"
        name="address"
        value={form.address}
        onChange={handleChange}
        style={{ marginLeft: 10, width: 250 }}
      />

      <input
        placeholder="GST Number"
        name="gst"
        value={form.gst}
        onChange={handleChange}
        style={{ marginLeft: 10 }}
      />

      <button
        onClick={saveSupplier}
        style={{
          marginLeft: 10,
          padding: "8px 20px",
        }}
      >
        {editId ? "Update" : "Save"}
      </button>
    </div>
  );
}