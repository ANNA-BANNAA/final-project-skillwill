
import { useTheme } from "../useTheme";
import { useLang } from "../useLang";

const OPTIONS = [
  { value: "light", icon: "☀️" },
  { value: "dark", icon: "🌙" },
  { value: "system", icon: "💻" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();

  return (
    <div className="theme-switch" role="group" aria-label={t("theme.label")}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          className={theme === o.value ? "theme-btn theme-btn-active" : "theme-btn"}
          aria-pressed={theme === o.value}
          aria-label={t("theme." + o.value)}
          title={t("theme." + o.value)}
          onClick={() => setTheme(o.value)}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}