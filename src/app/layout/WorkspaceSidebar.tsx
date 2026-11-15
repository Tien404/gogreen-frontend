import { currentProfile, initials } from "@/domain/identity";
import { Brand } from "@/shared/components/Brand";
import { Icon } from "@/shared/components/Icon";
import { Confirm } from "@/shared/ui";
import { useState } from "react";
import { NavLink } from "react-router";
import { useApp } from "../providers/AppContext";
import type { WorkspaceModel } from "./useWorkspace";
import { operatorNav, studentNav } from "./workspaceNavigation";

type WorkspaceSidebarProps = Pick<
  WorkspaceModel,
  | "navRef"
  | "menu"
  | "handleNavigationKeyDown"
  | "closeMenu"
  | "enter"
  | "s"
  | "role"
  | "parkingMatch"
  | "setControls"
  | "go"
>;

export function WorkspaceSidebar({
  handleNavigationKeyDown,
  navRef,
  menu,
  closeMenu,
  enter,
  s,
  role,
  parkingMatch,
  setControls,
  go,
}: WorkspaceSidebarProps) {
  const { auth, mode, notify } = useApp();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    const result = await auth.signOut();
    if (result.error) {
      notify(result.error);
      setSigningOut(false);
    } else {
      go("/login");
    }
  };

  const profile = currentProfile(s);

  return (
    <aside
      ref={navRef}
      tabIndex={-1}
      aria-label="Workspace navigation"
      onKeyDown={handleNavigationKeyDown}
      data-open={menu}
      className="w-62.5 bg-panel fixed top-0 right-auto bottom-0 left-0 flex flex-col z-30 pt-5 pb-0 overflow-y-auto max-[1200px]:w-55 max-[900px]:w-55 max-[900px]:-translate-x-full max-[900px]:transition-transform max-[900px]:duration-200 max-[900px]:data-[open=true]:translate-x-0 max-[900px]:invisible max-[900px]:data-[open=true]:visible px-5 max-[1200px]:px-4"
    >
      <div className="mb-5 flex justify-between items-center max-[900px]:gap-2 max-[900px]:**:data-[slot~=brand]:text-sm">
        <Brand />
        <button
          data-slot="icon-button"
          className="hidden items-center justify-center w-9 h-9 bg-transparent border-0 border-solid rounded-xs text-content-muted hover:bg-surface-inset hover:text-accent max-[900px]:inline-flex"
          onClick={closeMenu}
          aria-label="Close navigation"
        >
          <Icon name="close" />
        </button>
      </div>
      {mode === "preview" && <button
        className="flex gap-2 items-center text-left bg-demo-surface rounded-xs w-full mb-5 hover:bg-demo-surface-hover [&_>_span:nth-child(2)]:flex-1 text-demo hover:text-demo-hover focus-visible:outline-demo **:data-[slot~=icon-box]:bg-demo-surface-hover **:data-[slot~=icon-box]:text-demo py-3 px-2"
        onClick={() => enter(s.role === "student" ? "operator" : "student")}
      >
        <span
          data-slot="workspace-avatar"
          className="w-8 h-8 bg-demo-surface-hover rounded-xs grid place-items-center text-demo"
        >
          <Icon name={s.role === "student" ? "user" : "grid"} />
        </span>
        <span>
          <strong className="block text-xs">
            {s.role === "student" ? "Student" : "Operator"} workspace
          </strong>
          <small className="leading-[1.6] text-xs text-demo">Demo</small>
        </span>
        <Icon name="settings" size={16} />
      </button>}
      <nav aria-label="Main navigation" className="space-y-5">
        {(s.role === "student" ? studentNav : operatorNav).map((group) => (
          <section
            key={group.label}
            aria-labelledby={`nav-${group.label.toLowerCase()}`}
          >
            <h2
              id={`nav-${group.label.toLowerCase()}`}
              className="text-content-muted text-xs font-medium tracking-wider uppercase mb-2 px-3"
            >
              {group.label}
            </h2>
            {group.items.map(({ icon, label, path }) => (
              <NavLink
                to={`/${role}${path ? `/${path}` : ""}`}
                key={path}
                end={!path}
                data-parking-active={path === "parking/new" && !!parkingMatch}
                className="flex items-center gap-3 rounded-xs text-sm text-content-muted w-full bg-transparent text-left mb-1 leading-5 hover:bg-surface-muted hover:text-content [[aria-current=page],[data-parking-active=true]]:bg-soft [[aria-current=page],[data-parking-active=true]]:text-accent [[aria-current=page],[data-parking-active=true]]:font-semibold [&:is([aria-current=page],[data-parking-active=true])_svg]:stroke-accent py-3 px-4"
              >
                <Icon name={icon} />
                {label}
                {mode === "preview" && path === "incidents" && (
                  <span className="ml-auto rounded-lg bg-danger-surface text-danger text-xs py-0 px-2">
                    {
                      s.incidents.filter(
                        (incident) => incident.status === "open",
                      ).length
                    }
                  </span>
                )}
              </NavLink>
            ))}
          </section>
        ))}
      </nav>
      <div className="mt-auto pt-6 max-[900px]:pt-5">
        {mode === "preview" && <button
          className="flex items-center gap-3 rounded-xs text-sm text-demo w-full bg-demo-surface text-left mb-1 leading-5 hover:bg-demo-surface-hover hover:text-demo-hover focus-visible:outline-demo py-3 px-4"
          onClick={() => setControls(true)}
        >
          <Icon name="settings" />
          Demo
        </button>}
        {mode === "preview" && <Confirm
          demo
          title="Leave this workspace?"
          description="Your changes remain available until you reload or reset."
          trigger={
            <button className="flex items-center gap-3 rounded-xs text-sm text-demo w-full bg-demo-surface text-left mb-1 leading-5 hover:bg-demo-surface-hover hover:text-demo-hover focus-visible:outline-demo py-3 px-4">
              <Icon name="logout" />
              Exit to entry
            </button>
          }
          onConfirm={() => go("/")}
        />}
        <button
          disabled={signingOut}
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xs py-3 px-4 text-sm text-content-muted hover:bg-soft hover:text-accent"
        >
          <Icon name="logout" /> {signingOut ? "Logging out…" : "Log out"}
        </button>
        <div className="border-t border-solid border-t-divider mt-4 mb-0 flex gap-3 items-center -mx-5 p-5 max-[1200px]:-mx-4 max-[1200px]:p-4">
          <div
            data-slot="avatar"
            className="w-9 h-9 bg-surface-inset rounded-lg text-content grid place-items-center text-xs font-semibold shrink-0"
          >
            {initials(profile.name)}
          </div>
          <span>
            <strong className="block text-xs">{profile.name}</strong>
            <small className="leading-[1.6] block text-xs">
              {s.role === "student" ? "Student" : "Operator"}
            </small>
          </span>
        </div>
      </div>
    </aside>
  );
}
