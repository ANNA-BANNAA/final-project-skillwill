import { Link } from "react-router-dom";
import { useLang } from "../useLang";
import { usePageTitle } from "../usePageTitle";

export default function AboutPage() {
  const { t } = useLang();
  usePageTitle(t("nav.about"));

  return (
    <main className="catalog page-text">
      <h1>ჩვენ შესახებ</h1>
      <p className="lead">
        Kitchen Shop არის ონლაინ მაღაზია, სადაც სამზარეულოსთვის საჭირო ყველა ნივთს
        ერთ ადგილას იპოვით: ჭურჭელს, დანებს, ტექნიკას და აქსესუარებს.
      </p>

      <div className="about-grid">
        <section className="pay-section">
          <h2>ჩვენი მისია</h2>
          <p>გავხადოთ სამზარეულოს ხარისხიანი ნივთები ხელმისაწვდომი და მარტივი შესარჩევი.</p>
        </section>
        <section className="pay-section">
          <h2>მიწოდება</h2>
          <p>თბილისში და რეგიონებში მივიტანთ სწრაფად. გარკვეული თანხიდან მიწოდება უფასოა.</p>
        </section>
        <section className="pay-section">
          <h2>გარანტია</h2>
          <p>ყველა პროდუქტზე მოქმედებს გარანტია და დაბრუნების შესაძლებლობა.</p>
        </section>
      </div>

      <p><Link to="/">კატალოგში გადასვლა →</Link></p>
    </main>
  );
}