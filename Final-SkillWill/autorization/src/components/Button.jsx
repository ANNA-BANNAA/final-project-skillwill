export function Button({ loading, variant, fullWidth, children, ...rest }) {
  let className = "btn";
  if (variant === "secondary") className += " btn-secondary";
  if (fullWidth) className += " btn-full";

  return (
    <button className={className} {...rest} aria-busy={loading ? "true" : "false"}>
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  );
}