import { Brand } from "@/shared/components/Brand";
import { Icon } from "@/shared/components/Icon";
import { Link } from "@/shared/ui";
import { Outlet, useLocation } from "react-router";
import { useApp } from "../providers/AppContext";
import "@/features/student-mobility/student-mobility.css";

const tabs = [
  {
    to: "/student",
    label: "Home",
    icon: "map",
    routes: ["", "hubs", "find-ride", "holds", "rides", "parking", "charging"],
  },
  {
    to: "/student/activity",
    label: "Activity",
    icon: "activity",
    routes: ["activity"],
  },
  {
    to: "/student/vehicles",
    label: "Account",
    icon: "user",
    routes: ["vehicles"],
  },
];

export function StudentLayout() {
  const { auth } = useApp();
  const { pathname } = useLocation();
  const route = pathname.split("/")[2] ?? "";

  return (
    <div className="student-layout">
      <a className="student-skip" href="#main-content">
        Skip to main content
      </a>
      <header className="student-header">
        <Link to="/student" aria-label="gogreen home" className="student-brand">
          <Brand />
        </Link>
        <nav className="student-tabs" aria-label="Student services">
          {tabs.map(({ to, label, icon, routes }) => (
            <Link
              to={to}
              key={to}
              aria-current={routes.includes(route) ? "page" : undefined}
              data-active={routes.includes(route)}
            >
              <Icon name={icon} size={21} />
              {label}
            </Link>
          ))}
        </nav>
        {auth.user?.name && (
          <Link
            to="/student/vehicles"
            className="ml-auto truncate text-sm font-medium text-content-muted hover:text-primary"
          >
            {auth.user.name}
          </Link>
        )}
      </header>
      <main id="main-content" className="student-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
