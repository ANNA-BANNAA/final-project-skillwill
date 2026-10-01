import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { emailSchema, codeSchema, newPasswordSchema } from "../schemas";
import { api } from "../api";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = ელფოსტა, 2 = კოდი, 3 = ახალი პაროლი
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [banner, setBanner] = useState("");
  const [tooMany, setTooMany] = useState(false); // 429
  const [done, setDone] = useState(false); // ბოლო დამადასტურებელი ეკრანი

  // თითო ბიჯს თავისი ფორმა აქვს
  const form1 = useForm({ resolver: zodResolver(emailSchema) });
  const form2 = useForm({ resolver: zodResolver(codeSchema) });
  const form3 = useForm({ resolver: zodResolver(newPasswordSchema) });

  // სერვერის 422 შეცდომები ველებზე
  function showFieldErrors(e, form) {
    Object.entries(e.errors).forEach(([field, message]) => form.setError(field, { message }));
  }

  // ბიჯი 1: ელფოსტა
  async function submitEmail(values) {
    setBanner("");
    try {
      await api.forgotPassword(values);
      // პასუხი ყოველთვის წარმატებულია, არ ვამბობთ არსებობს თუ არა ანგარიში
      setEmail(values.email);
      setTooMany(false);
      setStep(2);
    } catch (e) {
      if (e.status === 422 && e.errors) showFieldErrors(e, form1);
      else setBanner(e.code === "NETWORK_ERROR" ? e.message : "დაფიქსირდა შეცდომა, სცადეთ თავიდან");
    }
  }

  // ბიჯი 2: კოდი
  async function submitCode(values) {
    setBanner("");
    try {
      const data = await api.verifyResetCode({ email, code: values.code });
      setResetToken(data.resetToken);
      setStep(3);
    } catch (e) {
      if (e.code === "INVALID_RESET_CODE") {
        form2.setError("code", { message: "კოდი არასწორია ან ვადაგასულია" });
      } else if (e.code === "TOO_MANY_ATTEMPTS") {
        setTooMany(true);
      } else if (e.status === 422 && e.errors) {
        showFieldErrors(e, form2);
      } else {
        setBanner(e.code === "NETWORK_ERROR" ? e.message : "დაფიქსირდა შეცდომა, სცადეთ თავიდან");
      }
    }
  }

  // ბიჯი 3: ახალი პაროლი
  async function submitNewPassword(values) {
    setBanner("");
    try {
      await api.resetPassword({ resetToken, password: values.password });
      setDone(true);
    } catch (e) {
      if (e.status === 422 && e.errors) {
        showFieldErrors(e, form3);
      } else if (e.code === "RESET_TOKEN_USED" || e.status === 400) {
        setBanner("ბმულის ვადა გავიდა ან უკვე გამოყენებულია. მოითხოვეთ ახალი კოდი.");
      } else {
        setBanner(e.code === "NETWORK_ERROR" ? e.message : "დაფიქსირდა შეცდომა, სცადეთ თავიდან");
      }
    }
  }

  // "ახალი კოდის მოთხოვნა": ისევ ბიჯ 1-ზე
  function restart() {
    setTooMany(false);
    setBanner("");
    setResetToken("");
    form2.reset();
    setStep(1);
  }

  // ბოლო ეკრანი
  if (done) {
    return (
      <AuthLayout title="პაროლი შეიცვალა">
        <div className="form">
          <Alert>თქვენი პაროლი წარმატებით შეიცვალა. ახლა შეგიძლიათ ახალი პაროლით შესვლა.</Alert>
          <Button fullWidth onClick={() => navigate("/login", { replace: true })}>
            შესვლაზე გადასვლა
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="პაროლის აღდგენა">
      {/* ბიჯი 1 */}
      {step === 1 && (
        <form className="form" onSubmit={form1.handleSubmit(submitEmail)} noValidate>
          {banner && <Alert variant="error">{banner}</Alert>}
          <p>შეიყვანეთ ელფოსტა და გამოგიგზავნით 6-ციფრიან კოდს.</p>
          <FormField label="ელფოსტა" id="email" type="email" autoComplete="email"
            error={form1.formState.errors.email?.message} {...form1.register("email")} />
          <Button type="submit" fullWidth loading={form1.formState.isSubmitting}>
            კოდის გაგზავნა
          </Button>
        </form>
      )}

      {/* ბიჯი 2 */}
      {step === 2 && (
        <form className="form" onSubmit={form2.handleSubmit(submitCode)} noValidate>
          {banner && <Alert variant="error">{banner}</Alert>}
          {tooMany ? (
            <>
              <Alert variant="error">ძალიან ბევრი არასწორი მცდელობა. მოითხოვეთ ახალი კოდი.</Alert>
              <Button type="button" fullWidth onClick={restart}>ახალი კოდის მოთხოვნა</Button>
            </>
          ) : (
            <>
              <Alert>თუ ამ ელფოსტაზე ანგარიში არსებობს, გამოგიგზავნეთ კოდი.</Alert>
              <FormField label="6-ციფრიანი კოდი" id="code" inputMode="numeric" autoComplete="one-time-code"
                error={form2.formState.errors.code?.message} {...form2.register("code")} />
              <Button type="submit" fullWidth loading={form2.formState.isSubmitting}>
                შემოწმება
              </Button>
            </>
          )}
        </form>
      )}

      {/* ბიჯი 3 */}
      {step === 3 && (
        <form className="form" onSubmit={form3.handleSubmit(submitNewPassword)} noValidate>
          {banner && (
            <>
              <Alert variant="error">{banner}</Alert>
              <Button type="button" variant="secondary" fullWidth onClick={restart}>
                ახალი კოდის მოთხოვნა
              </Button>
            </>
          )}
          <FormField label="ახალი პაროლი" id="password" password autoComplete="new-password"
            error={form3.formState.errors.password?.message} {...form3.register("password")} />
          <FormField label="გაიმეორე პაროლი" id="confirmPassword" password autoComplete="new-password"
            error={form3.formState.errors.confirmPassword?.message} {...form3.register("confirmPassword")} />
          <Button type="submit" fullWidth loading={form3.formState.isSubmitting}>
            პაროლის შეცვლა
          </Button>
        </form>
      )}

      <div className="links">
        <Link to="/login">დაბრუნება შესვლაზე</Link>
      </div>
    </AuthLayout>
  );
}