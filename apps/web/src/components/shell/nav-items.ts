import type { Role } from "@/lib/session";

export interface NavItem {
  href: string;
  label: string;
  /** Omit to allow any authenticated role. */
  roles?: Role[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/help", label: "Help" },
    ],
  },
  {
    title: "Batch Tracking",
    items: [
      { href: "/batches", label: "Batches" },
      { href: "/vessels", label: "Vessel Lookup" },
    ],
  },
  {
    title: "Media Prep",
    items: [
      { href: "/media-prep/chemicals", label: "Chemicals" },
      { href: "/media-prep/recipes", label: "Recipes" },
      { href: "/media-prep/media-batches", label: "Media Batches" },
    ],
  },
  {
    title: "Cleanroom",
    items: [
      { href: "/subculture/workstations", label: "Workstations" },
      { href: "/subculture/sessions", label: "Subculture Sessions" },
    ],
  },
  {
    title: "Quality Control",
    items: [
      { href: "/qc/contamination-events", label: "Contamination Events" },
      { href: "/qc/discard-logs", label: "Discard Logs" },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/users", label: "Users", roles: ["ADMIN"] },
      { href: "/admin/species", label: "Species", roles: ["ADMIN", "LAB_MANAGER"] },
      { href: "/admin/locations", label: "Locations", roles: ["ADMIN", "LAB_MANAGER"] },
      {
        href: "/admin/vessel-labels",
        label: "Vessel Labels",
        roles: ["ADMIN", "LAB_MANAGER", "LAB_TECHNICIAN"],
      },
      { href: "/admin/reference-data", label: "Reference Data" },
    ],
  },
];
