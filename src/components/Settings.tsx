import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Settings as SettingsIcon, Palette, Type, Monitor, Bell, Clock, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface SettingsProps {
  theme: "auto" | "light" | "dark";
  fontSize: "small" | "normal" | "large";
  highContrast: boolean;
  onThemeChange: (theme: "auto" | "light" | "dark") => void;
  onFontSizeChange: (fontSize: "small" | "normal" | "large") => void;
  onHighContrastChange: (enabled: boolean) => void;
}

export default function Settings({
  theme,
  fontSize,
  highContrast,
  onThemeChange,
  onFontSizeChange,
  onHighContrastChange,
}: SettingsProps) {
  const { user } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [compactView, setCompactView] = useState(false);

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the dashboard looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Auto (System)
                  </div>
                </SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select value={fontSize} onValueChange={onFontSizeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Improve readability with enhanced contrast
              </p>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={onHighContrastChange}
            />
          </div>

          {/* Compact View */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact View</Label>
              <p className="text-sm text-muted-foreground">
                Show more information with tighter spacing
              </p>
            </div>
            <Switch
              checked={compactView}
              onCheckedChange={setCompactView}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Refresh Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data & Refresh
          </CardTitle>
          <CardDescription>
            Configure how often data is refreshed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Refresh */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">
                Automatically refresh dashboard data
              </p>
            </div>
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>

          {/* Refresh Interval */}
          {autoRefresh && (
            <div className="space-y-2">
              <Label>Refresh Interval (seconds)</Label>
              <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show toast notifications for important events
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          {/* Sound */}
          {notifications && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Play sound for critical notifications
                </p>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user?.username || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={user?.name || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={user?.role || ""} disabled className="capitalize" />
          </div>
          <p className="text-sm text-muted-foreground">
            Contact an administrator to update your profile information
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}