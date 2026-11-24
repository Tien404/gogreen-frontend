type NavigationGroup = {
  label: string;
  items: { icon: string; label: string; path: string }[];
};

const workspaceGroup: NavigationGroup = {
  label: "Workspace",
  items: [
    { icon: "grid", label: "Overview", path: "" },
    { icon: "map", label: "Campus hubs", path: "hubs" },
  ],
};

export const studentNav: NavigationGroup[] = [
  workspaceGroup,
  {
    label: "Services",
    items: [
      { icon: "bike", label: "Find a ride", path: "find-ride" },
      { icon: "parking", label: "Parking", path: "parking" },
      { icon: "bolt", label: "Charging", path: "charging" },
    ],
  },
  {
    label: "Me",
    items: [
      { icon: "user", label: "My vehicles", path: "vehicles" },
      { icon: "activity", label: "Activity", path: "activity" },
    ],
  },
];

export const operatorNav: NavigationGroup[] = [
  workspaceGroup,
  {
    label: "Operations",
    items: [
      { icon: "bike", label: "Shared fleet", path: "fleet" },
      { icon: "alert", label: "Incidents", path: "incidents" },
      { icon: "dispatch", label: "Dispatch", path: "dispatch" },
      { icon: "bolt", label: "Charging", path: "charging" },
      { icon: "flask", label: "What-if scenarios", path: "what-if" },
    ],
  },
  {
    label: "Me",
    items: [{ icon: "activity", label: "Activity", path: "activity" }],
  },
];
