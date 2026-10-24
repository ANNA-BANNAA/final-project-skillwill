export function Button({ 
  loading, 
  variant, 
  fullWidth, 
  children, 
  type = "button", // 👈 ნაგულისხმევად "button", ხოლო გადაცემისას გახდება "submit"
  disabled, 
  ...rest 
}) {
  let className = "btn";
  if (variant === "secondary") className += " btn-secondary";
  if (fullWidth) className += " btn-full";

  return (
    <button 
      type={type} 
      className={className} 
      disabled={disabled || loading} // 👈 იბლოკება ჩატვირთვისას ან როცა disabled-ია
      aria-busy={loading ? "true" : "false"} 
      {...rest}
    >
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  );
}