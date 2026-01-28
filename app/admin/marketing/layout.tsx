"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Facebook,
  Settings,
  ChevronRight,
} from "lucide-react";

const marketingNav = [
  {
    name: "Overview",
    href: "/admin/marketing",
    icon: LayoutDashboard,
  },
  {
    name: "Google Ads",
    href: "/admin/marketing/google-ads",
    icon: TrendingUp,
    badge: "Ads + GA4 + GSC",
  },
  {
    name: "Meta Ads",
    href: "/admin/marketing/meta-ads",
    icon: Facebook,
    badge: "FB + IG",
  },
  {
    name: "Settings",
    href: "/admin/marketing/settings",
    icon: Settings,
  },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Sub-navigation */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-1 py-2 overflow-x-auto">
            {marketingNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/marketing" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {item.badge && (
                    <span className="text-xs opacity-70">({item.badge})</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
