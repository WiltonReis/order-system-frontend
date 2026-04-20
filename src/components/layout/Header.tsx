import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const navItems = [
    { to: "/orders", label: "Pedidos", roles: ["ADMIN", "USER"] as const },
  ];

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

          <nav className="hidden items-center gap-1 sm:flex">
            {navItems
              .filter((i) => user && i.roles.includes(user.role))
              .map((item) => {
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Olá, <span className="font-medium text-foreground">{user?.name}</span>
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
