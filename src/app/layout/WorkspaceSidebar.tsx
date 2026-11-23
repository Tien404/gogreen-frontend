import { currentProfile, initials } from "@/domain/identity";
import { Brand } from "@/shared/components/Brand";
import { Icon } from "@/shared/components/Icon";
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
  | "s"
  | "role"
  | "parkingMatch"
  | "go"
>;
export function WorkspaceSidebar({
  handleNavigationKeyDown,
  navRef,
  menu,
  closeMenu,
  s,
  role,
  parkingMatch,
  go,
}: WorkspaceSidebarProps) {
  const { auth, notify } = useApp();
  const [signingOut, setSigningOut] = useState(false);
  const signOut = async () => {
    setSigningOut(true);
    const result = await auth.signOut();
    if (result.error) {
      notify(result.error, "error");
      setSigningOut(false);
    } else {
      notify("Signed out successfully.", "info");
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
          className="hidden items-center justify-center w-9 h-9 bg-transparent border-0 border-solid rounded-lg text-content-muted hover:bg-surface-inset hover:text-primary max-[900px]:inline-flex"
          onClick={closeMenu}
          aria-label="Close navigation"
        >
          <Icon name="close" />
        </button>
      </div>

      <nav aria-label="Main navigation" className="space-y-5">
        {(s.role === "student" ? studentNav : operatorNav).map((group) => (
          <section
            key={group.label}
            aria-labelledby={`nav-${group.label.toLowerCase()}`}
          >
            <h2
              id={`nav-${group.label.toLowerCase()}`}
              className="text-content-muted text-sm font-medium tracking-wider uppercase mb-2 px-3"
            >
              {group.label}
            </h2>
            {group.items.map(({ icon, label, path }) => (
              <NavLink
                to={`/${role}${path ? `/${path}` : ""}`}
                key={path}
                end={!path}
                data-parking-active={path === "parking/new" && !!parkingMatch}
                className="flex items-center gap-3 rounded-lg text-sm text-content-muted w-full bg-transparent text-left mb-1 leading-5 hover:bg-surface-muted hover:text-content [[aria-current=page],[data-parking-active=true]]:bg-soft [[aria-current=page],[data-parking-active=true]]:text-primary [[aria-current=page],[data-parking-active=true]]:font-semibold [&_svg]:stroke-current py-3 px-4"
              >
                <Icon name={icon} />
                {label}
              </NavLink>
            ))}
          </section>
        ))}
      </nav>
      <div className="mt-auto pt-6 max-[900px]:pt-5">
        <button
          disabled={signingOut}
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg py-3 px-4 text-sm text-content-muted hover:bg-soft hover:text-primary"
        >
          <Icon name="logout" /> {signingOut ? "Logging out…" : "Log out"}
        </button>
        <div className="border-t border-solid border-t-divider mt-4 mb-0 flex gap-3 items-center -mx-5 p-5 max-[1200px]:-mx-4 max-[1200px]:p-4">
          <div
            data-slot="avatar"
            className="w-9 h-9 bg-surface-inset rounded-full text-content grid place-items-center text-sm font-semibold shrink-0"
          >
            {initials(profile.name)}
          </div>
          <span>
            <strong className="block text-sm">{profile.name}</strong>
            <small className="leading-[1.6] block text-sm">
              {s.role === "student" ? "Student" : "Operator"}
            </small>
          </span>
        </div>
      </div>
    </aside>
  );
}
