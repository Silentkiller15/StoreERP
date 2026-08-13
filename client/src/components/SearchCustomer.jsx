export default function SearchCustomer({
  search,
  setSearch,
}) {
  return (
    <input
      type="text"
      placeholder="Search Customer..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        width: "300px",
        padding: 10,
        marginBottom: 20,
      }}
    />
  );
}