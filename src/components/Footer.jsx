import { Link } from "react-router-dom";
import { useLang } from "../useLang";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h3 className="footer-title">Kitchen Shop</h3>
          <p>{t("footer.tagline")}</p>
        </div>
        <div className="footer-col">
          <h3 className="footer-title">{t("footer.contact")}</h3>
          <p>{t("footer.phone")}: <a href="tel:+995555123456">+995 555 12 34 56</a></p>
          <p>{t("footer.email")}: <a href="mailto:info@kitchenshop.ge">info@kitchenshop.ge</a></p>
          <p>{t("footer.address")}</p>
        </div>
        <div className="footer-col">
          <h3 className="footer-title">{t("footer.links")}</h3>
          <p><Link to="/">{t("nav.catalog")}</Link></p>
          <p><Link to="/about">{t("nav.about")}</Link></p>
          <p><Link to="/blog">{t("nav.blog")}</Link></p>
          <p><Link to="/contact">{t("nav.contact")}</Link></p>
        </div>
      </div>
      <p className="footer-copy">{t("footer.rights")}</p>
    </footer>
  );
}