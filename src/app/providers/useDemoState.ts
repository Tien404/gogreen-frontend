import { fixtures } from "@/mocks/fixtures";
import { transition } from "@/store/transition";
import { type Action } from "@/store/types";
import { useEffect, useRef, useState } from "react";

export function useDemoState() {
  // This hook is owned by App, above route layouts, to preserve operational state.
  const [s, setS] = useState(fixtures);
  const stateRef = useRef(s);
  const [toast, setToast] = useState("");

  const act = (action: Action) => {
    const result = transition(stateRef.current, action);

    stateRef.current = result.state;
    setS(result.state);
    setToast(result.message);

    return result;
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 6000);

    return () => clearTimeout(timer);
  }, [toast]);

  return { s, act, toast, notify: setToast, dismissToast: () => setToast("") };
}
