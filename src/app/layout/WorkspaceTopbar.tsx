import { currentProfile, initials } from "@/domain/identity";
import { useOptionalOperatorFeed } from "@/integration/operatorFeed";
import { Icon } from "@/shared/components/Icon";
import type { WorkspaceModel } from "./useWorkspace";
import { operatorNav, studentNav } from "./workspaceNavigation";
type WorkspaceTopbarProps = Pick<
  WorkspaceModel,
  | "menuRef"
  | "menu"
  | "setMenu"
  | "s"
  | "route"
  | "setNotifications"
  | "setProfile"
>;
export function WorkspaceTopbar({
  menuRef,
  menu,
  setMenu,
  s,
  route,
  setNotifications,
  setProfile,
}: WorkspaceTopbarProps) {
  const feed = useOptionalOperatorFeed();
  const alertCount =
    feed?.result.status === "ready" ? feed.result.data.data.alerts.length : 0;
  return (
    <header className="h-7 shrink-0 bg-panel flex items-center justify-between gap-4 max-[900px]:h-17.5 max-[600px]:h-16 py-0 px-6 max-[1200px]:py-0 max-[1200px]:px-5 max-[600px]:py-0 max-[600px]:px-4">
      <div className="flex items-center gap-3 text-xs max-[600px]:gap-1 max-[600px]:[&_>_svg]:hidden">
        <button
          ref={menuRef}
          data-slot="icon-button"
          className="hidden items-center justify-center w-9 h-9 bg-transparent border-0 border-solid rounded-xs text-content-muted hover:bg-surface-inset hover:text-accent max-[900px]:inline-flex"
          aria-expanded={menu}
          onClick={() => setMenu(true)}
          aria-label="Open navigation"
        >
          <Icon name="menu" />
        </button>
        <span className="text-content-muted max-[600px]:hidden">Workspace</span>
        <Icon name="chevron" size={14} />
        <strong className="font-medium max-[600px]:text-xs">
          {(s.role === "student" ? studentNav : operatorNav)
            .flatMap((group) => group.items)
            .find((item) => item.path.split("/")[0] === route)?.label ??
            (route === "parking"
              ? "Parking"
              : route === "demo"
                ? "Demo"
                : "Details")}
        </strong>
      </div>
      <div className="flex items-center gap-5 max-[600px]:gap-2">
        {!!feed && (
          <button
            data-slot="icon-button"
            className="inline-flex items-center justify-center w-9 h-9 bg-transparent border-0 border-solid rounded-xs text-content-muted hover:bg-surface-inset hover:text-accent relative"
            aria-label={
              alertCount
                ? `Open notifications, ${alertCount} active alerts`
                : "Open notifications"
            }
            onClick={() => setNotifications(true)}
          >
            <Icon name="bell" />
            {alertCount > 0 && (
              <i
                aria-hidden="true"
                className="absolute w-1.25 h-1.25 rounded-full bg-brand right-[8px] top-1.5"
              />
            )}
          </button>
        )}
        <button
          data-slot="avatar"
          className="w-9 h-9 bg-demo-surface rounded-lg text-demo grid place-items-center text-xs font-semibold shrink-0 hover:text-demo-hover hover:bg-demo-surface-hover focus-visible:outline-demo **:data-[slot~=workspace-avatar]:bg-demo-surface-hover **:data-[slot~=workspace-avatar]:text-demo **:data-[slot~=icon-box]:bg-demo-surface-hover **:data-[slot~=icon-box]:text-demo [&_small]:text-demo max-[600px]:w-8 max-[600px]:h-8"
          onClick={() => setProfile(true)}
          aria-label={"Open account profile"}
        >
          {initials(currentProfile(s).name)}
        </button>
      </div>
    </header>
  );
}
