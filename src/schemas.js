import { z } from "zod";

const email = z
  .string()
  .min(1, "შეიყვანეთ ელფოსტა")
  .email("ელფოსტის ფორმატი არასწორია");

// პაროლის წესები (რეგისტრაცია და ახალი პაროლი)
const strongPassword = z
  .string()
  .min(8, "პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს")
  .regex(/\p{L}/u, "პაროლში უნდა იყოს მინიმუმ ერთი ასო")
  .regex(/\d/, "პაროლში უნდა იყოს მინიმუმ ერთი ციფრი");

// შესვლა: პაროლზე მხოლოდ "ცარიელი არ უნდა იყოს"
export const loginSchema = z.object({
  email: email,
  password: z.string().min(1, "შეიყვანეთ პაროლი"),
});

// რეგისტრაცია
export const registerSchema = z
  .object({
    name: z.string().min(2, "სახელი მინიმუმ 2 სიმბოლო უნდა იყოს"),
    email: email,
    password: strongPassword,
    confirmPassword: z.string().min(1, "გაიმეორეთ პაროლი"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "პაროლები არ ემთხვევა",
  });

// აღდგენა, ბიჯი 1
export const emailSchema = z.object({ email: email });

// აღდგენა, ბიჯი 2
export const codeSchema = z.object({
  code: z.string().min(1, "შეიყვანეთ კოდი"),
});

// აღდგენა, ბიჯი 3
export const newPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "გაიმეორეთ პაროლი"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "პაროლები არ ემთხვევა",
  });
// პროფილი: ცარიელი ველი დაშვებულია (ასუფთავებს), მაგრამ თუ შეავსე, წესები მოქმედებს
const optional = (rule) => z.union([z.literal(""), rule]);

export const profileSchema = z
  .object({
    name: z.string().min(2, "სახელი მინიმუმ 2 სიმბოლო უნდა იყოს"),
    email: email,
    phone: optional(
      z
        .string()
        .min(9, "ტელეფონი მინიმუმ 9 სიმბოლო უნდა იყოს")
        .max(20, "ტელეფონი მაქსიმუმ 20 სიმბოლო უნდა იყოს")
        .regex(/^\+?[\d\s()-]+$/, "მაგალითი: +995 555 12 34 56"),
    ),
    city: optional(z.string().min(2, "ქალაქი მინიმუმ 2 სიმბოლო უნდა იყოს")),
    address: optional(
      z.string().min(5, "მისამართი მინიმუმ 5 სიმბოლო უნდა იყოს"),
    ),
    newPassword: optional(strongPassword),
    confirmNewPassword: z.string(),
    currentPassword: z.string().min(1, "შეიყვანეთ მიმდინარე პაროლი"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "პაროლები არ ემთხვევა",
  });

// ბარათის ნომრის შემოწმება (Luhn)
function luhn(num) {
  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

// ვადა MM/YY, არა გასული
function notExpired(value) {
  const [mm, yy] = value.split("/");
  const month = Number(mm);
  const year = 2000 + Number(yy);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1)
  );
}

const digits = (v) => v.replace(/\s/g, "");

export const checkoutSchema = z.object({
  shipping: z.object({
    fullName: z.string().trim().min(2, "სახელი მინიმუმ 2 სიმბოლო უნდა იყოს"),
    phone: z
      .string()
      .min(9, "ტელეფონი მინიმუმ 9 სიმბოლო უნდა იყოს")
      .max(20, "ტელეფონი მაქსიმუმ 20 სიმბოლო უნდა იყოს")
      .regex(/^\+?[\d\s()-]+$/, "მაგალითი: +995 555 12 34 56"),
    city: z.string().trim().min(1, "შეიყვანეთ ქალაქი"),
    address: z.string().trim().min(5, "მისამართი მინიმუმ 5 სიმბოლო უნდა იყოს"),
  }),
  card: z.object({
    number: z
      .string()
      .refine(
        (v) => /^\d{13,19}$/.test(digits(v)),
        "ბარათის ნომერი 13–19 ციფრია",
      )
      .refine((v) => luhn(digits(v)), "ბარათის ნომერი არასწორია"),
    holder: z.string().trim().min(2, "შეიყვანეთ ბარათის მფლობელი"),
    expiry: z
      .string()
      .regex(/^\d{2}\/\d{2}$/, "ფორმატი: MM/YY")
      .refine(notExpired, "ბარათის ვადა გასულია"),
    cvc: z.string().regex(/^\d{3,4}$/, "CVC 3 ან 4 ციფრია"),
  }),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "სახელი მინიმუმ 2 სიმბოლო უნდა იყოს"),
  email: z
    .string()
    .min(1, "შეიყვანეთ ელფოსტა")
    .email("ელფოსტის ფორმატი არასწორია"),
  message: z
    .string()
    .trim()
    .min(10, "შეტყობინება მინიმუმ 10 სიმბოლო უნდა იყოს"),
});
