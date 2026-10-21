import { Link } from "react-router-dom";
import { useAuth } from "../useAuth";
import { useCart } from "../useCart";
import { useLang } from "../useLang";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Header() {
  const { status, user, signOut } = useAuth();
  const { cart } = useCart();
  const { lang, setLang, t } = useLang();
  const qty = cart?.totalQty ?? 0;

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <span className="header-logo-icon" aria-hidden="true">
          🍳
        </span>
        Kitchen Shop
      </Link>

      <nav className="header-links" aria-label={t("nav.main")}>
        <Link to="/">{t("nav.catalog")}</Link>
        <Link to="/about">{t("nav.about")}</Link>
        <Link to="/blog">{t("nav.blog")}</Link>
        <Link to="/contact">{t("nav.contact")}</Link>
      </nav>

      <nav className="header-nav">
        <button
          type="button"
          className="lang-btn"
          onClick={() => setLang(lang === "ka" ? "en" : "ka")}
          aria-label={t("lang.switch")}
        >
          {lang === "ka" ? "EN" : "KA"}
        </button>
        
        <ThemeSwitcher />

        {status === "authenticated" ? (
          <>
            <Link to="/cart" aria-label={t("cart.label", { count: qty })}>
              🛒
              {qty > 0 && <span className="badge">{qty}</span>}
            </Link>
            <Link to="/orders">{t("nav.orders")}</Link>
            <Link to="/profile">{user?.name}</Link>
            <button className="header-btn" onClick={signOut}>
              {t("nav.signOut")}
            </button>
          </>
        ) : status === "unauthenticated" ? (
          <>
            <Link to="/login">{t("nav.signIn")}</Link>
            <Link to="/register">{t("nav.signUp")}</Link>
          </>
        ) : null}
      </nav>
    </header>
  );
}
