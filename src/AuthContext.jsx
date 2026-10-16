import { createContext,  useEffect, useState } from "react";
import { api, tokenStorage, setTokenExpiredHandler } from "./api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // თუ ტოკენი გვაქვს, ჯერ ვამოწმებთ სერვერზე; თუ არა, პირდაპირ "არ არის შესული"
  const [status, setStatus] = useState(tokenStorage.get() ? "loading" : "unauthenticated");
  const [user, setUser] = useState(null);
  const [expired, setExpired] = useState(false);

  function signIn(token, userData) {
    tokenStorage.set(token);
    setUser(userData);
    setExpired(false);
    setStatus("authenticated");
  }

  function signOut() {
    tokenStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
  }

  // ვადაგასული ტოკენი → გამოსვლა + შეტყობინება
  useEffect(() => {
    setTokenExpiredHandler(() => {
      setExpired(true);
      signOut();
    });
  }, []);

  // გვერდის გახსნისას ვამოწმებთ ტოკენს
  useEffect(() => {
    if (!tokenStorage.get()) return;
    api
      .me()
      .then((data) => {
        setUser(data.user);
        setStatus("authenticated");
      })
      .catch(() => signOut());
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, expired, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

