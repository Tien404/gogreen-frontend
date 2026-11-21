import { Alert, Button } from "../ui";
export function ApiLoadError({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <>
      <Alert tone="error">{message}</Alert>
      <Button type="button" variant="secondary" onClick={retry}>
        Retry loading
      </Button>
    </>
  );
}
