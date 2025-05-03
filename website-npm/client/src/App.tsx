import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import UsersPage from "@/pages/users-page";
import GroupsPage from "@/pages/groups-page";
import VmsPage from "@/pages/vms-page";
import ApplicationsPage from "@/pages/applications-page";
import OsPage from "@/pages/os-page";
import HostsPage from "@/pages/hosts-page";
import SettingsPage from "@/pages/settings-page";
import ProjectsPage from "@/pages/projects-page";
import CustomerPortalPage from "@/pages/customer-portal-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/customer-portal" component={CustomerPortalPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <ProtectedRoute path="/vms" component={VmsPage} />
      <ProtectedRoute path="/applications" component={ApplicationsPage} />
      <ProtectedRoute path="/os" component={OsPage} />
      <ProtectedRoute path="/hosts" component={HostsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/projects" component={ProjectsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ramluck-theme">
      <AuthProvider>
        <div className="app-container min-h-screen">
          <Router />
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
