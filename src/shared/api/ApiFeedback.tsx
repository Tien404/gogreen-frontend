import { Alert, Button } from "../ui";
import { apiErrorMessage } from "./errors";

export function ApiErrorNotice({ error }: { error: unknown }) {
  return error ? <Alert tone="error">{apiErrorMessage(error)}</Alert> : null;
}

export function ApiLoadError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <>
      <Alert tone="error">{message}</Alert>
      <Button type="button" variant="secondary" onClick={retry}>Retry loading</Button>
    </>
  );
}
