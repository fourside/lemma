import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

const PATH_KEY = "lemma-last-path";
const SCROLL_KEY_PREFIX = "lemma-scroll-";

export function RestoreNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const savedPath = localStorage.getItem(PATH_KEY);
    if (savedPath && savedPath !== "/" && location.pathname === "/") {
      navigate(savedPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname !== "/login") {
      localStorage.setItem(PATH_KEY, location.pathname);
    }

    const scrollKey = SCROLL_KEY_PREFIX + location.pathname;
    const savedScroll = localStorage.getItem(scrollKey);
    if (savedScroll) {
      requestAnimationFrame(() => {
        window.scrollTo(0, Number(savedScroll));
      });
    }

    const handleScroll = () => {
      localStorage.setItem(scrollKey, String(window.scrollY));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return null;
}
