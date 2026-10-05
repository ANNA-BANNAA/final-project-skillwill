export function AuthLayout({ title, children }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}