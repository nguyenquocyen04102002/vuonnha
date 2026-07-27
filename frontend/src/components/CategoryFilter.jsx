export default function CategoryFilter({ categories, activeId, onChange }) {
  return (
    <div className="category-bar">
      <button
        className={`category-pill ${!activeId ? "active" : ""}`}
        onClick={() => onChange(null)}
      >
        Tất cả
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          className={`category-pill ${activeId === c.id ? "active" : ""}`}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
