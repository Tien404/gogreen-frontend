import { LoadingState, Empty, Link } from "../ui";
import { ApiLoadError } from "./ApiFeedback";
type FeedbackQuery = {
  result:
    | {
        status: "loading" | "ready";
      }
    | {
        status: "error";
        message: string;
        code?: number;
      };
  refreshError?: {
    message: string;
  };
  retry: () => void;
};
export function RecordFeedback({
  query,
  item,
  back,
}: {
  query: FeedbackQuery;
  item: string;
  back?: string;
}) {
  if (query.result.status === "loading")
    return <LoadingState label={`Loading ${item}…`} />;
  if (query.result.status === "error" && query.result.code === 404 && back) {
    return (
      <Empty
        headingLevel={1}
        title="Record not found"
        text="Check the address or return to the list."
        action={<Link to={back}>Back to list</Link>}
      />
    );
  }
  const error =
    query.result.status === "error" ? query.result : query.refreshError;
  return error ? (
    <ApiLoadError message={error.message} retry={query.retry} />
  ) : null;
}
