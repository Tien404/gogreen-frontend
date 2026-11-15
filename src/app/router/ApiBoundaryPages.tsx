import { Empty, Link } from "@/shared/ui";
import { Navigate, useLocation } from "react-router";
import { useApp } from "../providers/AppContext";

export function PendingApiPage() {
  const { auth } = useApp();
  return (
    <Empty
      title="This workflow is not connected yet"
      text="Hub availability is available in this workspace."
      action={<Link to={`/${auth.user!.role}/hubs`}>View campus hubs</Link>}
    />
  );
}

export function LoginInsteadOfSignUp() {
  const { search } = useLocation();
  return <Navigate replace to={`/login${search}`} />;
}


export function OperatorChargingRedirect() {
  return <Navigate replace to="/operator/charging" />;
}
