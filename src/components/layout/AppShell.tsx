import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LayoutDashboard, Upload, Table2, LogOut, Menu, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const nav = [
  { to: "/", label: "Project", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/results", label: "Results", icon: Table2 },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="grid size-9 place-items-center rounded-xl text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-hero)" }}
            >
              <GraduationCap className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">GPA Studio</div>
              <div className="text-[11px] text-muted-foreground">Result processing</div>
            </div>
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            {nav.map((n) => {
              const active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-sm text-muted-foreground sm:block">{user?.email}</div>
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="sm:hidden">
              <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  {user?.email ? (
                    <DropdownMenuLabel className="px-2 text-xs text-muted-foreground">
                      {user.email}
                    </DropdownMenuLabel>
                  ) : null}
                  <DropdownMenuSeparator />
                  {nav.map((n) => {
                    const Icon = n.icon;
                    return (
                      <DropdownMenuItem asChild key={n.to} onClick={() => setMobileMenuOpen(false)}>
                        <Link to={n.to} className="flex items-center gap-2 rounded-sm px-2 py-1.5">
                          <Icon className="size-4" />
                          {n.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      <Toaster />
    </div>
  );
}
