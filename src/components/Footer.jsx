import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h3 className="footer-title">Kitchen Shop</h3>
          <p>სამზარეულოს ნივთები თქვენი სახლისთვის.</p>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">კონტაქტი</h3>
          <p>
            ტელეფონი: <a href="tel:+995555123456">+995 555 12 34 56</a>
          </p>
          <p>
            ელფოსტა: <a href="mailto:info@kitchenshop.ge">info@kitchenshop.ge</a>
          </p>
          <p>თბილისი, რუსთაველის გამზ. 12</p>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">ბმულები</h3>
          <p><Link to="/">კატალოგი</Link></p>
          <p>
            <a href="https://example.com/blog" target="_blank" rel="noreferrer">
              ბლოგი
            </a>
          </p>
        </div>
      </div>

      <p className="footer-copy">© 2026 Kitchen Shop. ყველა უფლება დაცულია.</p>
    </footer>
  );
}