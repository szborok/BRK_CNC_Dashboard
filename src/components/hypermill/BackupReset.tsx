import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Database, 
  Download, 
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive,
  Archive
} from "lucide-react";
import { toast } from "sonner";

export default function BackupReset() {
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Mock data - will be replaced with actual API calls
  const backupHistory = [
    {
      id: "backup_20251210_093000",
      date: "2025-12-10 09:30:00",
      type: "Automatic",
      size: "2.4 GB",
      includes: ["Configs", "Macros", "Automation", "Templates"],
      status: "completed",
    },
    {
      id: "backup_20251209_183000",
      date: "2025-12-09 18:30:00",
      type: "Scheduled",
      size: "2.3 GB",
      includes: ["Configs", "Macros", "Automation"],
      status: "completed",
    },
    {
      id: "backup_20251208_120000",
      date: "2025-12-08 12:00:00",
      type: "Manual",
      size: "2.4 GB",
      includes: ["Configs", "Macros", "Automation", "Templates", "Tool Libraries"],
      status: "completed",
    },
  ];

  const backupConfig = {
    autoBackup: true,
    frequency: "Daily",
    retentionDays: 30,
    location: "D:\\Backups\\hyperMILL",
    lastBackup: "2025-12-10 09:30:00",
    nextBackup: "2025-12-11 09:30:00",
  };

  const handleCreateBackup = () => {
    setIsBackingUp(true);
    // Simulate backup process
    setTimeout(() => {
      setIsBackingUp(false);
      toast.success("Backup created successfully");
    }, 2000);
  };

  const handleRestore = (backupId: string) => {
    if (confirm("Are you sure you want to restore this backup? Current configuration will be overwritten.")) {
      toast.success(`Restoring backup: ${backupId}`);
    }
  };

  const handleReset = () => {
    if (confirm("⚠️ WARNING: This will reset all hyperMILL configurations to factory defaults. This action cannot be undone. Continue?")) {
      if (confirm("Are you ABSOLUTELY sure? All custom settings, macros, and automation will be lost!")) {
        toast.success("Configuration reset initiated");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Reset</h1>
          <p className="text-muted-foreground">
            Manage configuration backups and system reset options
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCreateBackup}
            disabled={isBackingUp}
          >
            {isBackingUp ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Create Backup Now
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Backup
          </Button>
        </div>
      </div>

      {/* Backup Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Auto Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="text-lg font-bold">{backupConfig.autoBackup ? 'Enabled' : 'Disabled'}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {backupConfig.frequency} backups
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">{backupConfig.lastBackup}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Automatic backup
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">{backupConfig.nextBackup}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{backupConfig.retentionDays} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-cleanup enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup Configuration
          </CardTitle>
          <CardDescription>
            Current backup settings and storage location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Backup Location</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {backupConfig.location}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Backup Frequency</p>
                <p className="text-sm text-muted-foreground">
                  {backupConfig.frequency} at 09:30
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Configure Backup Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Backup History
          </CardTitle>
          <CardDescription>
            Available backup files and restore points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((backup, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{backup.id}</h3>
                      <Badge variant="outline">{backup.type}</Badge>
                      {backup.status === "completed" && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {backup.date} • Size: {backup.size}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Includes:</span>
                      {backup.includes.map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleRestore(backup.id)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Configuration */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Reset hyperMILL configuration to factory defaults
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-semibold text-destructive mb-1">
                    Reset to Factory Defaults
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    This will permanently delete all custom configurations, macros, automation scripts, 
                    and templates. Your hyperMILL installation will be restored to its original state. 
                    This action cannot be undone unless you have a backup.
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Configuration
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
