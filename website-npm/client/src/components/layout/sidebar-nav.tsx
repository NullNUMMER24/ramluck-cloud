import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Server, 
  Boxes, 
  Monitor, 
  Network, 
  Settings, 
  LogOut, 
  X,
  ShoppingCart,
  FolderKanban
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon, children, isActive, onClick }: NavItemProps) => (
  <Link 
    href={href}
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-md ${
      isActive 
        ? "bg-primary/10 text-primary font-medium" 
        : "hover:bg-muted text-muted-foreground hover:text-foreground font-medium dark:hover:bg-slate-800"
    }`}
  >
    <span className="w-5">{icon}</span>
    <span>{children}</span>
  </Link>
);

interface SidebarNavProps {
  activePath: string;
}

export default function SidebarNav({ activePath }: SidebarNavProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logoutMutation } = useAuth();

  // Close sidebar on mobile when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close sidebar on mobile when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-background border-r dark:border-gray-800 shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">RAMLUCK-CLOUD</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <NavItem 
                href="/" 
                icon={<LayoutDashboard className="h-5 w-5" />} 
                isActive={activePath === "/"} 
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </NavItem>
            </li>
            <li>
              <NavItem 
                href="/users" 
                icon={<Users className="h-5 w-5" />} 
                isActive={activePath === "/users"} 
                onClick={() => setIsOpen(false)}
              >
                Users
              </NavItem>
            </li>
            <li>
              <NavItem 
                href="/groups" 
                icon={<UserCircle className="h-5 w-5" />} 
                isActive={activePath === "/groups"} 
                onClick={() => setIsOpen(false)}
              >
                Groups
              </NavItem>
            </li>
            <li>
              <NavItem 
                href="/vms" 
                icon={<Server className="h-5 w-5" />} 
                isActive={activePath === "/vms"} 
                onClick={() => setIsOpen(false)}
              >
                Virtual Machines
              </NavItem>
            </li>
            <li>
              <NavItem 
                href="/applications" 
                icon={<Boxes className="h-5 w-5" />} 
                isActive={activePath === "/applications"} 
                onClick={() => setIsOpen(false)}
              >
                Applications
              </NavItem>
            </li>
            <li>
              <NavItem 
                href="/os" 
                icon={<Monitor className="h-5 w-5" />} 
                isActive={activePath === "/os"} 
                onClick={() => setIsOpen(false)}
              >
                Operating Systems
              </NavItem>
            </li>
            <li>
              <NavItem 
                href="/hosts" 
                icon={<Network className="h-5 w-5" />} 
                isActive={activePath === "/hosts"} 
                onClick={() => setIsOpen(false)}
              >
                Hosts
              </NavItem>
            </li>
            <li>
              <NavItem 
                href="/customer-portal" 
                icon={<ShoppingCart className="h-5 w-5" />} 
                isActive={activePath === "/customer-portal"} 
                onClick={() => setIsOpen(false)}
              >
                Customer Portal
              </NavItem>
            </li>
            <li>
              <NavItem 
                href="/projects" 
                icon={<FolderKanban className="h-5 w-5" />} 
                isActive={activePath === "/projects"} 
                onClick={() => setIsOpen(false)}
              >
                Projects
              </NavItem>
            </li>
          </ul>

          <div className="pt-8 mt-8 border-t dark:border-gray-800">
            <NavItem 
              href="/settings" 
              icon={<Settings className="h-5 w-5" />} 
              isActive={activePath === "/settings"} 
              onClick={() => setIsOpen(false)}
            >
              Settings
            </NavItem>
            <Button 
              variant="ghost" 
              className="w-full mt-2 flex items-center justify-start space-x-3 p-3 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-500 font-medium"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5" />
              <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile header button to open sidebar */}
      <div className="lg:hidden fixed top-0 left-0 z-10 p-4">
        <button
          className="text-foreground focus:outline-none"
          onClick={() => setIsOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </>
  );
}
