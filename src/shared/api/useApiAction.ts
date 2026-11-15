import { useRef, useState } from "react";

export function useApiAction() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function run<T>(task: () => Promise<T>) {
    if (locked.current) return { ok: false } as const;
    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      return { ok: true, data: await task() } as const;
    } catch (failure) {
      setError(failure);
      return { ok: false, failure } as const;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return { busy, error, setError, run };
}
