import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Settings, RefreshCw, Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function CurrentConfig() {
  // Mock data - will be replaced with actual API calls
  const configStatus = {
    lastSync: "2025-12-10 08:30:15",
    version: "2024.2",
    isActive: true,
    configPath: "C:\\hyperMILL\\Config",
  };

  const configItems = [
    { name: "Machine Definitions", count: 12, status: "synced", lastModified: "2025-12-09" },
    { name: "Tool Libraries", count: 245, status: "synced", lastModified: "2025-12-10" },
    { name: "Material Databases", count: 38, status: "synced", lastModified: "2025-12-08" },
    { name: "Post Processors", count: 8, status: "synced", lastModified: "2025-12-07" },
    { name: "Templates", count: 54, status: "synced", lastModified: "2025-12-10" },
    { name: "Macros", count: 127, status: "warning", lastModified: "2025-11-28" },
    { name: "Automation Scripts", count: 23, status: "synced", lastModified: "2025-12-09" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">hyperMILL Configuration</h1>
          <p className="text-muted-foreground">
            View and manage your current hyperMILL configuration settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Config
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Status
          </CardTitle>
          <CardDescription>Current hyperMILL configuration overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                {configStatus.isActive ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <Badge variant="secondary">Inactive</Badge>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="text-lg font-semibold">{configStatus.version}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="text-sm font-medium">{configStatus.lastSync}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Config Path</p>
              <p className="text-sm font-mono truncate">{configStatus.configPath}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Items */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Components</CardTitle>
          <CardDescription>
            Overview of all configuration items and their sync status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.status === "synced" ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Synced
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Outdated
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.count} items • Last modified: {item.lastModified}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
