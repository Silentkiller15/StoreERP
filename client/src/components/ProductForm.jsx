export default function ProductForm({
  form,
  handleChange,
  saveProduct,
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
        placeholder="Product Code"
        name="code"
        value={form.code}
        onChange={handleChange}
      />

      <input
        placeholder="Product Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        style={{ marginLeft: 10 }}
      />

      <input
        placeholder="Category"
        name="category"
        value={form.category}
        onChange={handleChange}
        style={{ marginLeft: 10 }}
      />

      <input
        placeholder="Unit"
        name="unit"
        value={form.unit}
        onChange={handleChange}
        style={{ marginLeft: 10 }}
      />

      <br />
      <br />

      <input
        placeholder="Purchase Price"
        name="purchase"
        value={form.purchase}
        onChange={handleChange}
      />

      <input
        placeholder="Selling Price"
        name="selling"
        value={form.selling}
        onChange={handleChange}
        style={{ marginLeft: 10 }}
      />

      <input
        placeholder="GST %"
        name="gst"
        value={form.gst}
        onChange={handleChange}
        style={{ marginLeft: 10 }}
      />

      <input
        placeholder="Opening Stock"
        name="stock"
        value={form.stock}
        onChange={handleChange}
        style={{ marginLeft: 10 }}
      />

      <button
        onClick={saveProduct}
        style={{
          marginLeft: 10,
          padding: "8px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        {editId ? "Update Product" : "Save Product"}
      </button>
    </div>
  );
}