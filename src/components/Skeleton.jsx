export function Skeleton({ count = 12 }) {
  const items = Array.from({ length: count });

  return (
    <div className="grid" aria-busy="true" aria-label="იტვირთება">
      {items.map((_, i) => (
        <div className="card skeleton" key={i}>
          <div className="card-image skeleton-block" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}