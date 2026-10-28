import { Link, useParams } from "react-router-dom";
import { POSTS } from "../blogPost";
import { usePageTitle } from "../usePageTitle";

export default function BlogPostPage() {
  const { id } = useParams();
  const post = POSTS.find((p) => p.id === id);
  usePageTitle(post?.title); // return-მდე, რომ ჰუკი ყოველთვის გამოიძახებოდეს

  if (!post) {
    return (
      <main className="catalog">
        <div className="state-box">
          <p>სტატია ვერ მოიძებნა</p>
          <Link to="/blog">ბლოგზე დაბრუნება</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="catalog page-text">
      <Link to="/blog">← ბლოგი</Link>
      <article className="blog-article">
        <span className="order-date">
          {new Date(post.date).toLocaleDateString("ka-GE")}
        </span>
        <h1>{post.title}</h1>
        {post.body.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </article>
    </main>
  );
}