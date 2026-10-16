export function Input({ hasError, ...rest }) {
  return <input className="input" aria-invalid={hasError ? "true" : "false"} {...rest} />;
}