const BASE_URL = import.meta.env.VITE_API_URL;

// ტოკენის შენახვა/წაკითხვა/წაშლა (მხოლოდ აქ ვეხებით localStorage-ს)
export const tokenStorage = {
  get: () => localStorage.getItem("accessToken"),
  set: (token) => localStorage.setItem("accessToken", token),
  clear: () => localStorage.removeItem("accessToken"),
};

// როცა ტოკენს ვადა გაუვა, AuthContext აქ ჩაწერს, რა უნდა მოხდეს
let onTokenExpired = null;
export function setTokenExpiredHandler(fn) {
  onTokenExpired = fn;
}

// სერვერის შეცდომა: ინახავს status-ს, code-ს და errors-ს
export class ApiError extends Error {
  constructor(status, body) {
    super(body.message || "შეცდომა");
    this.status = status;
    this.code = body.code || "UNKNOWN";
    this.errors = body.errors;
    this.body = body;
  }
}

// ერთი ფუნქცია ყველა მოთხოვნისთვის
async function request(path, method = "GET", body, signal) {
  const token = tokenStorage.get();
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = "Bearer " + token;

  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(0, {
      code: "NETWORK_ERROR",
      message: "სერვერთან დაკავშირება ვერ მოხერხდა",
    });
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 👈 შევასწორეთ: ნებისმიერ 401 სტატუსზე გამოვიძახოთ onTokenExpired (თუ განსაზღვრულია)
    if (res.status === 401 && onTokenExpired) {
      onTokenExpired();
    }
    throw new ApiError(res.status, data);
  }
  return data;
}

// ენდპოინტები
export const api = {
  register: (body) => request("/auth/register", "POST", body),
  login: (body) => request("/auth/login", "POST", body),
  me: () => request("/auth/me"),
  updateMe: (body) => request("/auth/me", "PATCH", body),
  forgotPassword: (body) => request("/auth/forgot-password", "POST", body),
  verifyResetCode: (body) => request("/auth/verify-reset-code", "POST", body),
  resetPassword: (body) => request("/auth/reset-password", "POST", body),

  // კატალოგი
  category: (slug) => request("/categories/" + slug),
  products: (query, signal) =>
    request("/products?" + query, "GET", undefined, signal),
  product: (slug) => request("/products/" + slug),

  // კალათა
  cart: () => request("/cart"),
  addToCart: (body) => request("/cart/items", "POST", body),
  updateCartItem: (id, body) => request("/cart/items/" + id, "PATCH", body),
  removeCartItem: (id) => request("/cart/items/" + id, "DELETE"),

  // ჩექაუთი
  checkout: () => request("/checkout"),
  createOrder: (body) => request("/orders", "POST", body),
  confirmOrder: (id, code) =>
    request(`/orders/${id}/confirm`, "POST", { code }),
  resendCode: (id) => request("/orders/" + id + "/resend-code", "POST"),
  order: (id) => request("/orders/" + id),
  orders: () => request("/orders"),
};