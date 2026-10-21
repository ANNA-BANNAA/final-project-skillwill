import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

const QUERY = "(prefers-color-scheme: dark)";

function readTheme() {
  try {
    const saved = localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

// სამი მდგომარეობა → ორი რეალური: light/dark
function apply(pref) {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia(QUERY).matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#1e293b" : "#ffffff");
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme); // "light" | "dark" | "system"

  useEffect(() => {
    apply(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage შეიძლება მიუწვდომელი იყოს
    }

    // system რეჟიმში ვუსმენთ სისტემის თემის ცვლილებას ცოცხლად
    if (theme !== "system") return;
    const mq = window.matchMedia(QUERY);
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}