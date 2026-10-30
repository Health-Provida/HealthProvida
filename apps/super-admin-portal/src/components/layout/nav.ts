import {
  Activity,
  BadgeCheck,
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  ReceiptText,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof Building2;
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Provider Governance",
    items: [
      { label: "Hospitals & Clinics", to: "/providers", icon: Building2 },
      { label: "Verification Queue", to: "/verification", icon: BadgeCheck },
      { label: "Quality Audit", to: "/quality-audit", icon: ShieldCheck },
    ],
  },
  {
    label: "Commercial",
    items: [
      { label: "Tariff Management", to: "/tariffs", icon: ReceiptText },
      { label: "Promoted & Bidding", to: "/sponsored", icon: Megaphone },
      { label: "HMO Accounts", to: "/hmos", icon: CreditCard },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Encounters", to: "/encounters", icon: Stethoscope },
      { label: "Transactions", to: "/transactions", icon: BarChart3 },
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
      { label: "System Activity", to: "/activity", icon: Activity },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Admin Users", to: "/admin-users", icon: Users },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

export const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/providers": "Hospitals & Clinics",
  "/verification": "Verification Queue",
  "/quality-audit": "Quality Audit",
  "/tariffs": "Tariff Management",
  "/sponsored": "Promoted & Bidding",
  "/hmos": "HMO Accounts",
  "/encounters": "Encounters",
  "/transactions": "Transactions",
  "/analytics": "Analytics",
  "/activity": "System Activity",
  "/admin-users": "Admin Users",
  "/settings": "Settings",
};
