import type { Role } from "@/domain/types";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useMatch } from "react-router";
import { useApp } from "../providers/AppContext";

export function useWorkspace(role: Role) {
  const { s, act, go, auth } = useApp();
  const location = useLocation();

  const route = location.pathname.split("/")[2] ?? "";

  const parkingMatch = useMatch("/student/parking/*");
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [profile, setProfile] = useState(false);
  const [controls, setControls] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => {
    setMenu(false);
    setTimeout(() => menuRef.current?.focus({ preventScroll: true }), 0);
  };

  const handleNavigationKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!menu) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();

      return;
    }

    if (e.key === "Tab") {
      const elements = Array.from(
        e.currentTarget.querySelectorAll<HTMLElement>(
          "a,button:not(:disabled),select",
        ),
      ).filter((el) => el.offsetParent !== null);

      const first = elements[0],
        last = elements[elements.length - 1];

      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === e.currentTarget)
      ) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  const enter = (nextRole: Role) => {
    auth.preview(nextRole);
    go(`/${nextRole}`);
  };

  useEffect(() => {
    if (menu) navRef.current?.focus();
  }, [menu]);

  return {
    handleNavigationKeyDown,
    auth,
    s,
    act,
    go,
    location,
    route,
    parkingMatch,
    menu,
    setMenu,
    notifications,
    setNotifications,
    profile,
    setProfile,
    controls,
    setControls,
    navRef,
    menuRef,
    closeMenu,
    enter,
    role,
  };
}

export type WorkspaceModel = ReturnType<typeof useWorkspace>;
