import { useEffect } from "react";

export function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? title + " — Kitchen Shop" : "Kitchen Shop";
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute("content", description);
  }, [title, description]);
}