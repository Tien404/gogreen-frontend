import { config } from "@/config/app";
import { Alert, Button } from "@/shared/ui";
import { Outlet } from "react-router";
import type { WorkspaceModel } from "./useWorkspace";
import { WorkspaceTopbar } from "./WorkspaceTopbar";

type WorkspaceContentProps = Pick<
  WorkspaceModel,
  | "menu"
  | "menuRef"
  | "setMenu"
  | "s"
  | "route"
  | "setControls"
  | "setNotifications"
  | "setProfile"
  | "act"
  | "location"
>;

export function WorkspaceContent({
  menu,
  menuRef,
  setMenu,
  s,
  route,
  setControls,
  setNotifications,
  setProfile,
  act,
  location,
}: WorkspaceContentProps) {
  return (
    <div
      className="ml-62.5 min-w-0 flex flex-1 flex-col max-[1200px]:ml-55 max-[900px]:ml-0"
      inert={menu}
    >
      <WorkspaceTopbar
        menuRef={menuRef}
        menu={menu}
        setMenu={setMenu}
        s={s}
        route={route}
        setControls={setControls}
        setNotifications={setNotifications}
        setProfile={setProfile}
      />
      <main
        id="main-content"
        className="flex flex-1 flex-col w-full pt-5 pb-0 max-w-400 outline-none focus-visible:outline-3 focus-visible:outline-accent focus-visible:-outline-offset-4 min-[1600px]:pt-6 min-[1600px]:pb-0 max-[1200px]:pt-5 max-[1200px]:pb-0 max-[600px]:pt-5 max-[600px]:pb-0 px-6 mx-auto min-[1600px]:px-6 max-[1200px]:px-5 max-[600px]:px-4"
        tabIndex={-1}
      >
        <div className="flex-1">
          {s.loadFailed ? (
            <div
              data-slot="panel"
              className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
            >
              <Alert tone="error">
                This view could not load. Your local data is preserved.
              </Alert>
              <Button onClick={() => act({ type: "retry" })}>
                Retry loading
              </Button>
            </div>
          ) : (
            <div
              key={`${location.pathname}${location.search}-${s.preset}-${s.persona}`}
            >
              <Outlet />
            </div>
          )}
        </div>
        <footer className="mt-6 flex justify-between text-xs text-content-muted gap-3 max-[600px]:flex-col max-[600px]:mt-5 max-[600px]:gap-1 py-5 px-0 max-[600px]:py-5 max-[600px]:px-0">
          <span>
            {config.brand} <span className="my-0 mx-2">·</span> {config.tagline}
          </span>
          <span>
            {config.campus} <span className="my-0 mx-2">·</span> All data is
            fictional
          </span>
        </footer>
      </main>
    </div>
  );
}
