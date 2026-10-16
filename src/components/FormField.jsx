import { Input } from "./Input";
import { PasswordInput } from "./PasswordInput";

export function FormField({ label, id, error, password, ...inputProps }) {
  const Field = password ? PasswordInput : Input;

  return (
    <div className="field">
      <label htmlFor={id} className="field-label">{label}</label>
      <Field id={id} hasError={Boolean(error)} aria-describedby={error ? id + "-error" : undefined} {...inputProps} />
      {error && <p id={id + "-error"} className="field-error">{error}</p>}
    </div>
  );
}