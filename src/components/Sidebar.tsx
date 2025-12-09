import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import {
  Grid3X3,
  Wrench,
  Settings,
  LogOut,
  X,
  Menu,
  Plus,
  Circle,
  Lock,
  Zap,
  Clock,
  History,
  Search,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Building2,
  FileJson,
  Upload,
  Archive,
  FolderOpen,
  Target,
} from "lucide-react";
import { AppView } from "../App";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  avatar?: string;
  company?: {
    name: string;
    logo?: string;
  };
}

interface SidebarProps {
  user: User;
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const healthStatusItems = [
  { id: "new-plates", label: "New Plates", icon: Plus },
  { id: "used-plates", label: "Used Plates", icon: Circle },
  { id: "locked-plates", label: "Locked Plates", icon: Lock },
] as const;

const occupancyStatusItems = [
  { id: "free-plates", label: "Free Plates", icon: Circle },
  { id: "in-use-plates", label: "In Use Plates", icon: Zap },
] as const;

const myPlatesItems = [
  { id: "ongoing-work", label: "Ongoing Work", icon: Clock },
  { id: "history", label: "History", icon: History },
] as const;

export default function Sidebar({
  user,
  currentView,
  onViewChange,
  isOpen,
  onToggle,
  onLogout,
}: SidebarProps) {
  const [expandedApps, setExpandedApps] = useState<string[]>([
    "analyzer",
    "plates",
    "tools",
  ]);

  const toggleApp = (appId: string) => {
    setExpandedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  return (
    <>
      {/* Mobile/Tablet overlay */}
      {isOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Mobile/Tablet toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="xl:hidden fixed top-4 left-4 z-50"
        onClick={onToggle}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside
        style={{ 
          backgroundColor: 'var(--sidebar, #e0e0e0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
        className={`
        fixed top-0 left-0 z-40 h-screen max-h-screen border-r border-sidebar-border
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
        w-64
        xl:relative xl:translate-x-0 xl:h-full
        flex flex-col overflow-hidden
        shadow-lg xl:shadow-none
      `}
      >
        {/* Header - Company Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            {/* Company Logo */}
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              {user.company?.logo ? (
                <img
                  src={user.company.logo}
                  alt="Company Logo"
                  className="w-8 h-8 rounded"
                />
              ) : (
                <Building2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            {isOpen && (
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-sidebar-foreground truncate">
                  {user.company?.name || "Your Company"}
                </h2>
                <p className="text-xs text-sidebar-muted-foreground">
                  CNC Management System
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
          {/* Dashboard */}
          <div>
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start ${
                !isOpen && "lg:justify-center"
              }`}
              onClick={() => onViewChange("dashboard")}
            >
              <Grid3X3 className="h-4 w-4" />
              {isOpen && <span className="ml-3">Dashboard</span>}
            </Button>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Apps Section */}
          {isOpen && (
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide px-3">
              Applications
            </h3>
          )}

          {/* JSON File Analyzer App */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-between ${
                !isOpen && "lg:justify-center"
              }`}
              onClick={() => toggleApp("analyzer")}
            >
              <div className="flex items-center">
                <FileJson className="h-4 w-4" />
                {isOpen && <span className="ml-3">JSON File Analyzer</span>}
              </div>
              {isOpen &&
                (expandedApps.includes("analyzer") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
            </Button>

            {isOpen && expandedApps.includes("analyzer") && (
              <div className="ml-6 space-y-1">
                <Button
                  variant={
                    currentView === "all-auto-results" ? "default" : "ghost"
                  }
                  size="sm"
                  className={`w-full justify-start ${
                    currentView === "all-auto-results" ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => onViewChange("all-auto-results")}
                >
                  <FolderOpen className="h-3 w-3 mr-2" />
                  All Auto Results
                </Button>
                <Button
                  variant={
                    currentView === "my-auto-results" ? "default" : "ghost"
                  }
                  size="sm"
                  className={`w-full justify-start ${
                    currentView === "my-auto-results" ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => onViewChange("my-auto-results")}
                >
                  <Archive className="h-3 w-3 mr-2" />
                  My Auto Results
                </Button>
                <Button
                  variant={
                    currentView === "my-manual-results" ? "default" : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onViewChange("my-manual-results")}
                >
                  <Search className="h-3 w-3 mr-2" />
                  My Manual Results
                </Button>
                <Button
                  variant={
                    currentView === "manual-upload" ? "default" : "ghost"
                  }
                  size="sm"
                  className={`w-full justify-start ${
                    currentView === "manual-upload" ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => onViewChange("manual-upload")}
                >
                  <Upload className="h-3 w-3 mr-2" />
                  Manual Upload
                </Button>
              </div>
            )}
          </div>

          {/* Matrix Tools Manager App */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-between ${
                !isOpen && "lg:justify-center"
              }`}
              onClick={() => toggleApp("tools")}
            >
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4" />
                {isOpen && <span className="ml-3">Matrix Tools Manager</span>}
              </div>
              {isOpen &&
                (expandedApps.includes("tools") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
            </Button>

            {isOpen && expandedApps.includes("tools") && (
              <div className="ml-6 space-y-1">
                <Button
                  variant={
                    currentView === "tool-details" ? "default" : "ghost"
                  }
                  size="sm"
                  className={`w-full justify-start ${
                    currentView === "tool-details" ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => onViewChange("tool-details")}
                >
                  <Target className="h-3 w-3 mr-2" />
                  Today's Matrix Tools
                </Button>
                <Button
                  variant={
                    currentView === "remaining-tools" ? "default" : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onViewChange("remaining-tools")}
                >
                  <Archive className="h-3 w-3 mr-2" />
                  Remaining Matrix Tools
                </Button>
                <Button
                  variant={
                    currentView === "non-matrix-tools" ? "default" : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onViewChange("non-matrix-tools")}
                >
                  <Wrench className="h-3 w-3 mr-2" />
                  All Tool Usage
                </Button>
                <Button
                  variant={
                    currentView === "my-matrix-tools" ? "default" : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onViewChange("my-matrix-tools")}
                >
                  <Clock className="h-3 w-3 mr-2" />
                  My Matrix Tools
                </Button>
              </div>
            )}
          </div>

          {/* Plates Manager App */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-between ${
                !isOpen && "lg:justify-center"
              }`}
              onClick={() => toggleApp("plates")}
            >
              <div className="flex items-center">
                <Wrench className="h-4 w-4" />
                {isOpen && <span className="ml-3">Plates Manager</span>}
              </div>
              {isOpen &&
                (expandedApps.includes("plates") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
            </Button>

            {isOpen && expandedApps.includes("plates") && (
              <div className="ml-6 space-y-1">
                <Button
                  variant={currentView === "all-plates" ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start ${
                    currentView === "all-plates" ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => onViewChange("all-plates")}
                >
                  All Plates
                </Button>

                <div className="space-y-1 mt-2">
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    Health Status
                  </div>
                  {healthStatusItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentView === item.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start pl-4"
                        onClick={() => onViewChange(item.id as AppView)}
                      >
                        <Icon className="h-3 w-3 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-1 mt-2">
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    Occupancy
                  </div>
                  {occupancyStatusItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentView === item.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start pl-4"
                        onClick={() => onViewChange(item.id as AppView)}
                      >
                        <Icon className="h-3 w-3 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-1 mt-2">
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    My Plates
                  </div>
                  {myPlatesItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentView === item.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start pl-4"
                        onClick={() => onViewChange(item.id as AppView)}
                      >
                        <Icon className="h-3 w-3 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          {isOpen ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.isAdmin ? "Administrator" : "User"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onViewChange("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>

                {user.isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onViewChange("admin-settings")}
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                    Admin Settings
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewChange("settings")}
                className="w-full"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {user.isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewChange("admin-settings")}
                  className="w-full"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
