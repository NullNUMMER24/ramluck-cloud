import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import SidebarNav from "@/components/layout/sidebar-nav";
import { Moon, Sun, Monitor, Shield, Bell, Activity, Languages, Server } from "lucide-react";

export default function SettingsPage() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [activityReports, setActivityReports] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav activePath={location} />
      
      <div className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          
          <Separator />
          
          <Tabs defaultValue="appearance">
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex md:grid-cols-none gap-1">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Theme</h3>
                      <p className="text-sm text-muted-foreground">
                        Select the theme for the dashboard.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer ${theme === 'light' ? 'border-primary ring-2 ring-primary/20' : 'border-input'}`}
                        onClick={() => setTheme("light")}
                      >
                        <div className="mb-3 p-2 rounded-full bg-primary/10">
                          <Sun className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-medium">Light</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20' : 'border-input'}`}
                        onClick={() => setTheme("dark")}
                      >
                        <div className="mb-3 p-2 rounded-full bg-primary/10">
                          <Moon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-medium">Dark</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer ${theme === 'system' ? 'border-primary ring-2 ring-primary/20' : 'border-input'}`}
                        onClick={() => setTheme("system")}
                      >
                        <div className="mb-3 p-2 rounded-full bg-primary/10">
                          <Monitor className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-medium">System</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Your theme preference is saved automatically.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email.
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications in your browser.
                          </p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-base font-medium">Notification Types</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="security-alerts">Security Alerts</Label>
                          </div>
                          <Switch
                            id="security-alerts"
                            checked={securityAlerts}
                            onCheckedChange={setSecurityAlerts}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="system-updates">System Updates</Label>
                          </div>
                          <Switch
                            id="system-updates"
                            checked={systemUpdates}
                            onCheckedChange={setSystemUpdates}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="activity-reports">Activity Reports</Label>
                          </div>
                          <Switch
                            id="activity-reports"
                            checked={activityReports}
                            onCheckedChange={setActivityReports}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your password to keep your account secure.
                    </p>
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <input
                        id="current-password"
                        type="password"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <input
                        id="new-password"
                        type="password"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <input
                        id="confirm-password"
                        type="password"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button>Update Password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}