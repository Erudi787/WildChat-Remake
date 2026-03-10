"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const settingsNav = [
  { label: "Profile", href: "/lobby/settings", icon: "👤" },
  { label: "Password", href: "/lobby/settings/password", icon: "🔒" },
  { label: "Account", href: "/lobby/settings/account", icon: "🗑️" },
];

export default function SettingsPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Settings sidebar */}
      <div className="w-56 border-r bg-card flex-shrink-0 hidden md:block">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Settings</h2>
        </div>
        <nav className="p-2 space-y-1">
          {settingsNav.map((item) => {
            const isActive =
              item.href === "/lobby/settings"
                ? pathname === "/lobby/settings"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-b px-4 py-2 flex gap-2 w-full absolute top-0 left-0 z-10 bg-card">
        {settingsNav.map((item) => {
          const isActive =
            item.href === "/lobby/settings"
              ? pathname === "/lobby/settings"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
    </div>
  );
}
