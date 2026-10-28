import { Link } from "react-router-dom";
import { POSTS } from "../blogPost";
import { useLang } from "../useLang";
import { usePageTitle } from "../usePageTitle";

export default function BlogPage() {
  const { t } = useLang();
  usePageTitle(t("nav.blog"));

  return (
    <main className="catalog page-text">
      <h1>ბლოგი</h1>
      <ul className="blog-list">
        {POSTS.map((p) => (
          <li key={p.id} className="blog-card">
            <span className="order-date">
              {new Date(p.date).toLocaleDateString("ka-GE")}
            </span>
            <h2>{p.title}</h2>
            <p>{p.excerpt}</p>
            <Link to={"/blog/" + p.id} className="order-link">
              წაიკითხე მეტი →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}