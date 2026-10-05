import { z } from "zod";

const email = z.string().min(1, "შეიყვანეთ ელფოსტა").email("ელფოსტის ფორმატი არასწორია");

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