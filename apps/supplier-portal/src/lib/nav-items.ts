export interface NavItem {
  label: string;
  href: string;
  iconSrc: string;
  badge?: number;
  badgeClassName?: string;
}

export const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    iconSrc: "/nav-icons/%F0%9F%93%8A.png",
  },
  {
    label: "List New Car",
    href: "/list-new-car",
    iconSrc: "/nav-icons/%F0%9F%9A%97.png",
  },
  {
    label: "List Used Car",
    href: "/list-used-car",
    iconSrc: "/nav-icons/%F0%9F%8F%B7%EF%B8%8F.png",
  },
  {
    label: "List a Part",
    href: "/list-a-part",
    iconSrc: "/nav-icons/%F0%9F%94%A7.png",
  },
];

export const manageNavItems: NavItem[] = [
  {
    label: "My Listings",
    href: "/my-listings",
    iconSrc: "/nav-icons/%F0%9F%93%8B.png",
    badge: 8,
    badgeClassName: "bg-portal-ink text-white",
  },
  {
    label: "Inquiries",
    href: "/inquiries",
    iconSrc: "/nav-icons/%F0%9F%92%AC.png",
    badge: 3,
    badgeClassName: "bg-brand-green-500 text-white",
  },
  {
    label: "Settings",
    href: "/settings",
    iconSrc: "/nav-icons/%E2%9A%99%EF%B8%8F.png",
  },
];
