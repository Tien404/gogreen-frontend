import { useEffect, useState } from "react";
import { ApiError, apiErrorMessage } from "./errors";
type QueryError = {
  status: "error";
  message: string;
  code?: number;
};
type Ready<T> = {
  status: "ready";
  data: T;
};
type Result<T> = Ready<T> | QueryError;
export function useApiQuery<T>(
  load: (signal: AbortSignal) => Promise<T>,
  {
    retain = false,
    pollMs = 0,
    enabled = true,
  }: {
    retain?: boolean;
    pollMs?: number;
    enabled?: boolean;
  } = {},
) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<{
    load: typeof load;
    attempt: number;
    result: Result<T>;
    previous?: Ready<T>;
  }>();
  const current = settled?.load === load ? settled : undefined;
  const fresh = current?.attempt === attempt;
  const previous = retain
    ? current?.result.status === "ready"
      ? current.result
      : current?.previous
    : undefined;
  const refreshError =
    fresh && previous && current?.result.status === "error"
      ? current.result
      : undefined;
  const result = refreshError
    ? previous
    : fresh && current
      ? current.result
      : (previous ?? { status: "loading" as const });
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const fetchNext = async () => {
      let response: Result<T>;
      try {
        response = { status: "ready", data: await load(controller.signal) };
      } catch (error) {
        response = {
          status: "error",
          message: apiErrorMessage(error),
          code: error instanceof ApiError ? error.status : undefined,
        };
      }
      if (controller.signal.aborted) return;
      setSettled((old) => ({
        load,
        attempt,
        result: response,
        previous:
          retain &&
          old?.load === load &&
          response.status === "error" &&
          ![401, 403, 404].includes(response.code ?? 0)
            ? old.result.status === "ready"
              ? old.result
              : old.previous
            : undefined,
      }));
      if (
        pollMs > 0 &&
        (response.status === "ready" ||
          ![401, 403, 404].includes(response.code ?? 0))
      ) {
        timer = setTimeout(() => void fetchNext(), pollMs);
      }
    };
    void fetchNext();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [load, attempt, retain, pollMs, enabled]);
  return {
    result: result ?? { status: "loading" as const },
    refreshError,
    refreshing: !fresh && !!previous,
    retry: () => setAttempt((value) => value + 1),
  };
}
