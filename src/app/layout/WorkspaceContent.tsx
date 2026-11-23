import { config } from "@/config/app";
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
  | "setNotifications"
  | "location"
>;
export function WorkspaceContent({
  menu,
  menuRef,
  setMenu,
  s,
  route,
  setNotifications,
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
        setNotifications={setNotifications}
      />
      <main
        id="main-content"
        className="flex flex-1 flex-col w-full pt-5 pb-0 max-w-400 outline-none focus-visible:outline-3 focus-visible:outline-primary focus-visible:-outline-offset-4 min-[1600px]:pt-6 min-[1600px]:pb-0 max-[1200px]:pt-5 max-[1200px]:pb-0 max-[600px]:pt-5 max-[600px]:pb-0 px-6 mx-auto min-[1600px]:px-6 max-[1200px]:px-5 max-[600px]:px-4"
        tabIndex={-1}
      >
        <div className="flex-1">
          <div key={`${location.pathname}${location.search}-${s.persona}`}>
            <Outlet />
          </div>
        </div>
        <footer className="mt-6 flex justify-between text-sm text-content-muted gap-3 max-[600px]:flex-col max-[600px]:mt-5 max-[600px]:gap-1 py-5 px-0 max-[600px]:py-5 max-[600px]:px-0">
          <span>
            {config.brand} <span className="my-0 mx-2">·</span> {config.tagline}
          </span>
          <span>{config.campus}</span>
        </footer>
      </main>
    </div>
  );
}
