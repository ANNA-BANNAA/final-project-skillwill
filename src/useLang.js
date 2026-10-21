import { useContext } from "react";
import { LangContext } from "./LangContext";

export function useLang() {
  return useContext(LangContext);
}