import { useState } from "react";
import { Input } from "./Input";

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-wrapper">
      <Input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
      >
        {visible ? "დამალვა" : "ჩვენება"}
      </button>
    </div>
  );
}