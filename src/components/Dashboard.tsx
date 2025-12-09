import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Grid3X3,
  Clock,
  FileJson,
  Archive,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Wifi,
} from "lucide-react";
import { User as UserType } from "../App";
import {
  DashboardDataService,
  DashboardData,
} from "../services/DashboardDataService";
import jsonScannerAPI from "../services/api/jsonScanner";
import toolManagerAPI from "../services/api/toolManager";
import platesManagerAPI from "../services/api/platesManager";

interface DashboardProps {
  user: UserType;
}

export default function Dashboard({ user }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [apiStatus, setApiStatus] = useState<{
    jsonScanner: boolean;
    toolManager: boolean;
    platesManager: boolean;
  }>({
    jsonScanner: false,
    toolManager: false,
    platesManager: false,
  });

  useEffect(() => {
    loadDashboardData();
    checkAPIStatus();
    
    // Listen for refresh events from BackendStatus component
    const handleRefreshEvent = () => {
      loadDashboardData();
    };
    window.addEventListener('dashboardRefresh', handleRefreshEvent);
    
    return () => window.removeEventListener('dashboardRefresh', handleRefreshEvent);
  }, []); // Load data on mount

  const checkAPIStatus = async () => {
    const status = {
      jsonScanner: false,
      toolManager: false,
      platesManager: false,
    };

    try {
      await jsonScannerAPI.getStatus();
      status.jsonScanner = true;
    } catch {
      void 0; // Silently fail
    }

    try {
      await toolManagerAPI.getStatus();
      status.toolManager = true;
    } catch {
      void 0; // Silently fail
    }

    try {
      await platesManagerAPI.getPlates();
      status.platesManager = true;
    } catch {
      void 0; // Silently fail
    }

    setApiStatus(status);
    return status;
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Always use configured backend APIs
      const apiData = await DashboardDataService.loadFromBackends();
      setDashboardData(apiData);
      console.log("✅ Loaded data from configured backend APIs");
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      // Keep existing data if available
    } finally {
      setIsLoading(false);
    }
  };



  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);

      // In demo mode, fetch fresh data from demo-data files
      try {
        const [jsonResponse, toolResponse, plateResponse] = await Promise.all([
          fetch("/demo-data/jsonscanner-results.json"),
          fetch("/demo-data/toolmanager-results.json"),
          fetch("/demo-data/clampingplate-results.json"),
        ]);

        if (jsonResponse.ok) {
          const jsonData = await jsonResponse.json();
          localStorage.setItem("jsonScannerResults", JSON.stringify(jsonData));
          console.log(`✅ Refreshed ${jsonData.length} JSON Scanner results`);
        }

        if (toolResponse.ok) {
          const toolData = await toolResponse.json();
          localStorage.setItem("toolManagerResults", JSON.stringify(toolData));
          console.log("✅ Refreshed Tool Manager results");
        }

        if (plateResponse.ok) {
          const plateData = await plateResponse.json();
          localStorage.setItem(
            "clampingPlateResults",
            JSON.stringify(plateData)
          );
          console.log(
            `✅ Refreshed ${
              plateData.plates?.length || 0
            } Clamping Plate results`
          );
        }
      } catch (fetchError) {
        console.log("ℹ️ Could not fetch fresh demo data, using cached data");
      }

      await DashboardDataService.refreshData();
      await loadDashboardData();
      await checkAPIStatus();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatFullTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Unable to load dashboard data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Welcome back, <span className="font-semibold">{user.username}</span>! Here's what's happening with your CNC Management Dashboard
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.overview.totalProjects}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.overview.activeProjects}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.overview.completedToday}
            </div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Tools in Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.overview.toolsInUse}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              JSON Scanner
              <Badge
                variant={
                  dashboardData.modules.jsonScanner.status === "active"
                    ? "default"
                    : "secondary"
                }
              >
                {dashboardData.modules.jsonScanner.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Files Processed
              </span>
              <span className="font-bold">
                {dashboardData.modules.jsonScanner.filesProcessed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Last Scan</span>
              <span className="text-xs">
                {dashboardData.modules.jsonScanner.lastScan
                  ? formatTimestamp(dashboardData.modules.jsonScanner.lastScan)
                  : "Never"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Tool Manager
              <Badge
                variant={
                  dashboardData.modules.toolManager.status === "active"
                    ? "default"
                    : "secondary"
                }
              >
                {dashboardData.modules.toolManager.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Tools Tracked
              </span>
              <span className="font-bold">
                {dashboardData.modules.toolManager.toolsTracked}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Last Update</span>
              <span className="text-xs">
                {dashboardData.modules.toolManager.lastUpdate
                  ? formatTimestamp(
                      dashboardData.modules.toolManager.lastUpdate
                    )
                  : "Never"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Clamping Plates
              <Badge
                variant={
                  dashboardData.modules.clampingPlateManager.status === "active"
                    ? "default"
                    : "secondary"
                }
              >
                {dashboardData.modules.clampingPlateManager.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Plates Managed
              </span>
              <span className="font-bold">
                {dashboardData.modules.clampingPlateManager.platesManaged}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Last Update</span>
              <span className="text-xs">
                {dashboardData.modules.clampingPlateManager.lastUpdate
                  ? formatTimestamp(
                      dashboardData.modules.clampingPlateManager.lastUpdate
                    )
                  : "Never"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - User then Global */}
      <div className="space-y-4">
        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              My Activity
            </CardTitle>
            <CardDescription>
              Your recent updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto space-y-3 pr-2">
              {dashboardData.recentActivity.filter(a => a.user === user.username).length > 0 ? (
                dashboardData.recentActivity.filter(a => a.user === user.username).map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {activity.type === "json_analysis" && (
                        <FileJson className="h-4 w-4 text-muted-foreground" />
                      )}
                      {activity.type === "tool_inventory" && (
                        <Archive className="h-4 w-4 text-muted-foreground" />
                      )}
                      {activity.type === "plate_management" && (
                        <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="text-sm font-medium flex-1">{activity.project}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {activity.details}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatFullTimestamp(activity.timestamp)}
                      </span>
                      <Badge
                        variant={
                          activity.status === "completed"
                            ? "default"
                            : activity.status === "processing"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {activity.status === "completed" && (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        {activity.status === "processing" && (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {activity.status === "failed" && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Global Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Global Activity
            </CardTitle>
            <CardDescription>
              Latest updates from all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto space-y-3 pr-2">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {activity.type === "json_analysis" && (
                        <FileJson className="h-4 w-4 text-muted-foreground" />
                      )}
                      {activity.type === "tool_inventory" && (
                        <Archive className="h-4 w-4 text-muted-foreground" />
                      )}
                      {activity.type === "plate_management" && (
                        <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="text-sm font-medium flex-1">{activity.project}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {activity.details}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatFullTimestamp(activity.timestamp)}
                      </span>
                      <Badge
                        variant={
                          activity.status === "completed"
                            ? "default"
                            : activity.status === "processing"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {activity.status === "completed" && (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        {activity.status === "processing" && (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {activity.status === "failed" && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Completion Chart */}
      {dashboardData.charts.projectCompletion.some(
        (item) => item.completed > 0 || item.active > 0
      ) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Project Summary
            </CardTitle>
            <CardDescription>
              Completed and active projects over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center">
              {dashboardData.charts.projectCompletion.map((day) => (
                <div key={day.name} className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {day.name}
                  </div>
                  <div className="space-y-1">
                    <div
                      className="bg-green-200 dark:bg-green-800 rounded text-xs py-1"
                      title={`${day.completed} completed`}
                    >
                      {day.completed}
                    </div>
                    <div
                      className="bg-blue-200 dark:bg-blue-800 rounded text-xs py-1"
                      title={`${day.active} active`}
                    >
                      {day.active}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800 rounded"></div>
                <span>Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
