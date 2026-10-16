export function Alert({ variant = "success", children }) {
  return (
    <div className={"alert alert-" + variant} role={variant === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}