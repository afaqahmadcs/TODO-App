export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string; // Material symbol icon name
  badge?: string | number;
  shortcut?: string;
}

export interface WorkspaceNavItem {
  id: string;
  label: string;
  href: string;
  color: string;
  metaBadge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
