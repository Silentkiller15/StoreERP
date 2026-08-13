export default function DashboardView() {
  return (
    <>
      <h1>🏪 Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {[
          { title: "Products", value: 0 },
          { title: "Sales Today", value: "$0.00" },
          { title: "Purchases", value: "$0.00" },
          { title: "Cash", value: "$0.00" },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            }}
          >
            <h3>{card.title}</h3>
            <h2>{card.value}</h2>
          </div>
        ))}
      </div>
    </>
  );
}