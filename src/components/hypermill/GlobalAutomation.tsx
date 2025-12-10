import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { 
  Workflow, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Play,
  Settings,
  FolderOpen,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function GlobalAutomation() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with actual API calls
  const automationScripts = [
    {
      name: "Auto NC Generation",
      description: "Automatically generates NC code when job is approved",
      enabled: true,
      trigger: "Job Approval",
      lastRun: "2025-12-10 09:15:00",
      runCount: 1247,
      status: "running",
      path: "C:\\hyperMILL\\AutomationCenter\\Scripts\\",
    },
    {
      name: "Tool List Export",
      description: "Exports tool lists to Excel after toolpath calculation",
      enabled: true,
      trigger: "Toolpath Complete",
      lastRun: "2025-12-10 08:45:00",
      runCount: 892,
      status: "running",
      path: "C:\\hyperMILL\\AutomationCenter\\Scripts\\",
    },
    {
      name: "Backup Project Files",
      description: "Creates backup of project files at end of day",
      enabled: true,
      trigger: "Scheduled (Daily)",
      lastRun: "2025-12-09 18:00:00",
      runCount: 365,
      status: "idle",
      path: "C:\\hyperMILL\\AutomationCenter\\Scripts\\",
    },
    {
      name: "Stock Collision Check",
      description: "Validates stock dimensions before calculation",
      enabled: false,
      trigger: "Before Calculation",
      lastRun: "2025-12-08 14:20:00",
      runCount: 543,
      status: "disabled",
      path: "C:\\hyperMILL\\AutomationCenter\\Scripts\\",
    },
  ];

  const triggers = [
    { name: "Job Approval", count: 3 },
    { name: "Toolpath Complete", count: 5 },
    { name: "Before Calculation", count: 2 },
    { name: "After Simulation", count: 1 },
    { name: "Scheduled", count: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Automation</h1>
          <p className="text-muted-foreground">
            Manage Automation Center scripts and workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Script
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Scripts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automationScripts.filter(s => s.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {automationScripts.length} total configured
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automationScripts.reduce((acc, s) => acc + s.runCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all automation scripts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Trigger Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triggers.length}</div>
            <p className="text-xs text-muted-foreground">
              Different automation triggers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search automation scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <FolderOpen className="h-4 w-4 mr-2" />
          Open AC Folder
        </Button>
      </div>

      {/* Automation Scripts */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Scripts</CardTitle>
          <CardDescription>
            Configure and manage automation workflows in hyperMILL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {automationScripts.map((script, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    script.enabled ? 'bg-green-500/10' : 'bg-gray-500/10'
                  }`}>
                    <Workflow className={`h-5 w-5 ${
                      script.enabled ? 'text-green-500' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{script.name}</h3>
                      {script.status === "running" && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Running
                        </Badge>
                      )}
                      {script.status === "idle" && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Idle
                        </Badge>
                      )}
                      {script.status === "disabled" && (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{script.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Trigger: {script.trigger}</span>
                      <span>•</span>
                      <span>Last run: {script.lastRun}</span>
                      <span>•</span>
                      <span>Executions: {script.runCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={script.enabled}
                        onCheckedChange={() => {}}
                      />
                      <Label className="text-sm">{script.enabled ? 'Enabled' : 'Disabled'}</Label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trigger Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger Configuration</CardTitle>
          <CardDescription>
            Overview of automation triggers and their assigned scripts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {triggers.map((trigger, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{trigger.name}</h3>
                  <Badge variant="secondary">{trigger.count}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {trigger.count} script{trigger.count !== 1 ? 's' : ''} assigned
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
