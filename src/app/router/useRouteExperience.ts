import { config } from "@/config/app";
import { useEffect } from "react";
import { useLocation } from "react-router";

export function useRouteExperience() {
  const location = useLocation();

  useEffect(() => {
    // Run after the route commits and closing dialogs restore their focus.
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.getElementById("main-content")?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.key]);

  useEffect(() => {
    document.title = config.title;
  }, []);

  return location.pathname;
}
