import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Package, ShoppingCart, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/types";

interface NavItem {
  to: "/orders" | "/products" | "/users" | "/dashboard";
  label: string;
  icon: typeof Package;
  roles: readonly Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "USER"] },
  { to: "/orders", label: "Pedidos", icon: ShoppingCart, roles: ["ADMIN", "USER"] },
  { to: "/products", label: "Produtos", icon: Package, roles: ["ADMIN", "USER"] },
  { to: "/users", label: "Usuários", icon: Users, roles: ["ADMIN"] },
];

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const visibleItems = NAV_ITEMS.filter((i) => user && i.roles.includes(user.role));

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/orders" className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Package className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="text-sm font-semibold tracking-tight">OMS</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {visibleItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Olá, <span className="font-medium text-foreground">{user?.name}</span>
            {user && (
              <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {user.role}
              </span>
            )}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
        {visibleItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
