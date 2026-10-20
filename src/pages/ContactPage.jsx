import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "../schemas";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  // API-ში შეტყობინების endpoint არ არის, ამიტომ გაგზავნას ვასიმულირებთ
  async function onSubmit() {
    setSent(false);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSent(true);
    reset();
  }

  return (
    <main className="catalog page-text">
      <h1>კონტაქტი</h1>

      <div className="contact-layout">
        <section className="pay-section">
          <h2>დაგვიკავშირდით</h2>
          <p>ტელეფონი: <a href="tel:+995555123456">+995 555 12 34 56</a></p>
          <p>ელფოსტა: <a href="mailto:info@kitchenshop.ge">info@kitchenshop.ge</a></p>
          <p>მისამართი: თბილისი, რუსთაველის გამზ. 12</p>
          <p>სამუშაო საათები: ორშაბათი–შაბათი, 10:00–19:00</p>
        </section>

        <form className="pay-section form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2>მოგვწერეთ</h2>
          {sent && <Alert variant="success">გმადლობთ! შეტყობინება მივიღეთ.</Alert>}
          <FormField label="სახელი" id="contactName" autoComplete="name"
            error={errors.name?.message} {...register("name")} />
          <FormField label="ელფოსტა" id="contactEmail" type="email" autoComplete="email"
            error={errors.email?.message} {...register("email")} />
          <div className="field">
            <label htmlFor="contactMessage" className="field-label">შეტყობინება</label>
            <textarea
              id="contactMessage"
              className="input"
              rows={5}
              aria-invalid={errors.message ? "true" : "false"}
              {...register("message")}
            />
            {errors.message && <p className="field-error">{errors.message.message}</p>}
          </div>
          <Button type="submit" fullWidth loading={isSubmitting}>გაგზავნა</Button>
        </form>
      </div>
    </main>
  );
}