import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { 
  Workflow, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  FolderOpen
} from "lucide-react";

interface GlobalAutomationProps {
  scope?: "my" | "all";
}

export default function GlobalAutomation({ scope = "all" }: GlobalAutomationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMyAutomations = scope === "my";

  // Mock data - will be replaced with actual API calls
  const automationScripts = [
    {
      name: "Auto_NC_Generation.hma",
      description: "AUTOMATION Center script for NC code generation workflow",
      lastModified: "2025-12-09",
      author: "Admin",
      size: "45 KB",
      path: "[DefaultPath]\\variants\\NC_Generation\\",
    },
    {
      name: "Tool_List_Export.hma",
      description: "Export tool lists with custom formatting after calculation",
      lastModified: "2025-12-10",
      author: "John Doe",
      size: "32 KB",
      path: "[DefaultPath]\\variants\\Export\\",
    },
    {
      name: "Daily_Backup.hma",
      description: "Automated project backup to network location",
      lastModified: "2025-12-08",
      author: "Admin",
      size: "28 KB",
      path: "[DefaultPath]\\variants\\Maintenance\\",
    },
    {
      name: "Stock_Validation.hma",
      description: "Validates stock parameters before toolpath calculation",
      lastModified: "2025-12-07",
      author: "Jane Smith",
      size: "38 KB",
      path: "[DefaultPath]\\variants\\Validation\\",
    },
  ];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isMyAutomations ? "My Automations" : "All Automations"}
          </h1>
          <p className="text-muted-foreground">
            {isMyAutomations 
              ? "Manage your personal AUTOMATION Center scripts (.hma files)"
              : "View company-wide AUTOMATION Center scripts and workflows"
            }
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
            <CardTitle className="text-sm font-medium">Total Scripts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automationScripts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              .hma automation files
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(automationScripts.length * 35).toFixed(0)} KB
            </div>
            <p className="text-xs text-muted-foreground">
              Combined script file size
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Modified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-xs text-muted-foreground">
              Most recent update
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
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Workflow className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{script.name}</h3>
                      <Badge variant="outline">.hma</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{script.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Modified: {script.lastModified}</span>
                      <span>•</span>
                      <span>By: {script.author}</span>
                      <span>•</span>
                      <span>Size: {script.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
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
