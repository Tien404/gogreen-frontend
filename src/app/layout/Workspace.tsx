import { type Role } from "@/domain/types";
import { Brand } from "@/shared/components/Brand";
import { Icon } from "@/shared/components/Icon";
import { Button, Link } from "@/shared/ui";
import { Navigate, useLocation } from "react-router";
import { SessionFeedback } from "@/features/auth/components/SessionFeedback";
import { useApp } from "../providers/AppContext";
import { OperatorFeedProvider } from "../providers/OperatorFeedProvider";
import { StudentLayout } from "./StudentLayout";
import { useWorkspace } from "./useWorkspace";
import { WorkspaceContent } from "./WorkspaceContent";
import { WorkspaceDialogs } from "./WorkspaceDialogs";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
type WorkspaceGuardProps = {
  role: Role;
};
function WorkspaceGuard({ role }: WorkspaceGuardProps) {
  const { auth, go } = useApp();
  const location = useLocation();
  if (auth.status !== "ready") return <SessionFeedback auth={auth} />;
  if (!auth.user) {
    const returnTo = location.pathname + location.search + location.hash;
    return (
      <Navigate replace to={`/login?${new URLSearchParams({ returnTo })}`} />
    );
  }
  if (auth.user.role !== role)
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-dvh flex flex-col items-center justify-center gap-5 text-center *:data-[slot~=brand]:mb-5 p-5"
      >
        <Brand />
        <h1 className="leading-[1.15] text-4xl">
          This workspace is for{" "}
          {role === "operator" ? "campus operators" : "students"}.
        </h1>
        <p className="leading-[1.65]">
          You’re logged in as {auth.user.name}. Continue to your workspace.
        </p>
        <Button onClick={() => go(`/${auth.user!.role}`)}>
          Open workspace <Icon name="arrow" />
        </Button>
        <Link to="/">Return to entry</Link>
      </main>
    );
  // Reset transient menus and dialogs on every navigation, including Back/Forward.

  if (role === "student") return <StudentLayout key={location.key} />;
  return (
    <OperatorFeedProvider>
      <WorkspaceLayout key={location.key} role={role} />
    </OperatorFeedProvider>
  );
}
export function StudentWorkspace() {
  return <WorkspaceGuard role="student" />;
}
export function OperatorWorkspace() {
  return <WorkspaceGuard role="operator" />;
}
type WorkspaceLayoutProps = {
  role: Role;
};
function WorkspaceLayout({ role }: WorkspaceLayoutProps) {
  const {
    s,
    go,
    location,
    route,
    parkingMatch,
    menu,
    setMenu,
    notifications,
    setNotifications,
    handleNavigationKeyDown,
    navRef,
    menuRef,
    closeMenu,
  } = useWorkspace(role);
  return (
    <div className="workspace flex min-h-dvh">
      <a
        className="fixed -top-25 left-67.5 z-300 bg-primary text-on-dark rounded-lg focus:top-3 focus:text-on-dark max-[900px]:left-5 py-3 px-5"
        href="#main-content"
      >
        Skip to main content
      </a>
      <WorkspaceSidebar
        handleNavigationKeyDown={handleNavigationKeyDown}
        navRef={navRef}
        menu={menu}
        closeMenu={closeMenu}
        s={s}
        role={role}
        parkingMatch={parkingMatch}
        go={go}
      />
      {menu && (
        <button
          className="hidden max-[900px]:block max-[900px]:fixed max-[900px]:top-0 max-[900px]:right-0 max-[900px]:bottom-0 max-[900px]:left-0 max-[900px]:bg-overlay/50 max-[900px]:border-0 max-[900px]:border-solid max-[900px]:z-25"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}
      <WorkspaceContent
        menu={menu}
        menuRef={menuRef}
        setMenu={setMenu}
        s={s}
        route={route}
        setNotifications={setNotifications}
        location={location}
      />
      <WorkspaceDialogs
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </div>
  );
}
