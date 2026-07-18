import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Store,
  Star,
  Users,
  UserCog,
  Truck,
  Tags,
  TicketPercent,
  Wallet,
  Bell,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Image,
  Activity,
  Server,
  Radio,
} from "lucide-react";
import { useBackendMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

type NavGroup = {
  label: string;
  items: NavItem[];
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  /** Roles allowed to see this item. If omitted, all authenticated roles can see it. */
  roles?: string[];
  hidden?: boolean;
};

/**
 * All roles that are considered "admin-level" (not restaurant_owner).
 * restaurant_owner is intentionally excluded — they only see their shop's pages.
 */
const ADMIN_ROLES = ["super_admin", "admin", "manager"];

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { href: "/orders", label: "Orders", icon: ShoppingCart },
      { href: "/products", label: "Products", icon: Package },
      { href: "/categories", label: "Categories", icon: Tags },
      {
        href: "/shops",
        label: "Shops",
        icon: Store,
        // restaurant_owner sees their own shop profile via /shops
      },
      { href: "/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/customers", label: "Customers", icon: Users, roles: ADMIN_ROLES },
      { href: "/staff", label: "Staff", icon: UserCog, roles: ADMIN_ROLES },
      { href: "/deliverymen", label: "Delivery", icon: Truck, roles: ADMIN_ROLES },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/promotions", label: "Promotions", icon: Tags },
      { href: "/banners", label: "Bannières", icon: Image, roles: ADMIN_ROLES },
      { href: "/vouchers", label: "Vouchers", icon: TicketPercent },
      { href: "/notifications", label: "Notifications", icon: Bell, roles: ADMIN_ROLES },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/wallets", label: "Wallets", icon: Wallet, roles: ADMIN_ROLES },
      { href: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/live-tracking", label: "Suivi Live", icon: Radio, roles: ADMIN_ROLES },
      { href: "/roles", label: "Roles", icon: Shield, roles: ["super_admin"] },
      { href: "/audit", label: "Audit", icon: Activity, roles: ADMIN_ROLES },
      { href: "/monitoring", label: "Monitoring", icon: Server, roles: ADMIN_ROLES },
      { href: "/settings", label: "Settings", icon: Settings, roles: ADMIN_ROLES },
    ],
  },
];

function NavList({
  groups,
  location,
  showLabels = true,
  onNavigate,
}: {
  groups: NavGroup[];
  location: string;
  showLabels?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-6">
      {groups.map((group, idx) => (
        <div key={idx} className="px-3">
          {showLabels && (
            <h3 className="mb-2 px-4 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              {group.label}
            </h3>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="block" onClick={onNavigate}>
                  <div
                    className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    } ${!showLabels && "justify-center"}`}
                  >
                    <item.icon className={`h-5 w-5 ${showLabels ? "mr-3" : ""}`} />
                    {showLabels && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: me } = useBackendMe();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!me) return null;

  const role = me.user.role;

  const handleLogout = () => {
    localStorage.removeItem("jatek_backend_token");
    setLocation("/login");
  };

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !item.hidden &&
          (!item.roles || item.roles.includes(role))
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 border-r border-border bg-sidebar flex-col hidden md:flex`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen && <span className="font-black text-xl text-primary tracking-tight">Jatek Merchant</span>}
          {!sidebarOpen && <span className="font-black text-xl text-primary tracking-tight mx-auto">J</span>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-sidebar-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavList groups={filteredGroups} location={location} showLabels={sidebarOpen} />
        </div>
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border flex flex-col">
          <SheetHeader className="h-16 shrink-0 flex flex-row items-center justify-start px-6 border-b border-sidebar-border space-y-0">
            <SheetTitle className="font-black text-xl text-primary tracking-tight text-left">
              Jatek Merchant
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto min-h-0 py-4">
            <NavList
              groups={filteredGroups}
              location={location}
              showLabels
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card gap-2">
          <div className="flex items-center md:hidden gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-black text-xl text-primary tracking-tight">Jatek</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-full flex items-center justify-start space-x-3 px-3 hover:bg-accent rounded-full border border-border">
                  <Avatar className="h-7 w-7 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {me.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-semibold leading-none">{me.user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize leading-none mt-1">{me.user.role.replace("_", " ")}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Demo: Switch Role</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => { localStorage.removeItem("jatek_backend_token"); setLocation("/login"); }}>
                  Go to Login
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-background p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
