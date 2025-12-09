import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Settings,
  Play,
  Pause,
  RefreshCw,
  Save,
  FileJson,
  Archive,
  Grid3X3,
  FolderOpen,
  Building2,
  Database,
  Users,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Upload,
  Download,
  ShieldCheck,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { useSetupConfig } from "../hooks/useSetupConfig";
import { useCompanyConfig } from "../hooks/useCompanyConfig";
import { listBackups, deleteBackups } from "../services/companyConfigService";
import { toast } from "sonner";
import MachineEditor from "./admin/MachineEditor";
import CycleEditor from "./admin/CycleEditor";
import ToolCategoryEditor from "./admin/ToolCategoryEditor";
import RuleEditor from "./admin/RuleEditor";

interface AdminSettingsProps {
  theme: "auto" | "light" | "dark";
  fontSize: "small" | "normal" | "large";
  highContrast: boolean;
  onThemeChange: (theme: "auto" | "light" | "dark") => void;
  onFontSizeChange: (size: "small" | "normal" | "large") => void;
  onHighContrastChange: (enabled: boolean) => void;
}

interface ModuleProcessingState {
  jsonScanner: boolean;
  toolManager: boolean;
  clampingPlateManager: boolean;
}

export default function AdminSettings({
  theme: _theme,
  fontSize: _fontSize,
  highContrast: _highContrast,
  onThemeChange: _onThemeChange,
  onFontSizeChange: _onFontSizeChange,
  onHighContrastChange: _onHighContrastChange,
}: AdminSettingsProps) {
  console.log("🔧 AdminSettings: Component rendering started");
  
  let hookResult;
  try {
    hookResult = useSetupConfig();
    console.log("✅ AdminSettings: useSetupConfig hook executed", hookResult);
  } catch (error) {
    console.error("❌ AdminSettings: useSetupConfig hook failed", error);
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Configuration Error</CardTitle>
            <CardDescription className="text-red-600">
              Failed to load configuration: {String(error)}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  const { config: setupConfig, saveConfig, resetConfig, isLoading } = hookResult;
  
  // Load company config
  const companyConfig = useCompanyConfig();
  
  const [localConfig, setLocalConfig] = useState(setupConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [storageStrategy, setStorageStrategy] = useState<"mono" | "individual">(
    "mono"
  );
  const [processingStates, setProcessingStates] =
    useState<ModuleProcessingState>({
      jsonScanner: true,
      toolManager: true,
      clampingPlateManager: true,
    });
  const [backups, setBackups] = useState<Array<{
    filename: string;
    timestamp: string;
    size: number;
    path: string;
  }>>([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [selectedBackups, setSelectedBackups] = useState<Set<string>>(new Set());
  const [deletingBackups, setDeletingBackups] = useState(false);

  useEffect(() => {
    console.log("🔧 AdminSettings: setupConfig changed", { setupConfig, isLoading });
    if (setupConfig && !isLoading) {
      console.log("✅ AdminSettings: Setting localConfig", setupConfig);
      setLocalConfig(setupConfig);
    }
  }, [setupConfig, isLoading]);

  useEffect(() => {
    console.log("🔧 AdminSettings: Component mounted/updated", { 
      isLoading, 
      hasLocalConfig: !!localConfig,
      hasModules: !!localConfig?.modules,
      hasCompanyFeatures: !!localConfig?.companyFeatures
    });
  }, [isLoading, localConfig]);

  useEffect(() => {
    // Load processing states from localStorage
    const savedStates = localStorage.getItem("moduleProcessingStates");
    if (savedStates) {
      setProcessingStates(JSON.parse(savedStates));
    }
  }, []);

  const fetchBackups = async () => {
    try {
      setLoadingBackups(true);
      const backupList = await listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error("Failed to load backups:", error);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    // Fetch backups on mount
    fetchBackups();
  }, []);

  useEffect(() => {
    // Listen for backup refresh events
    const handleBackupRefresh = () => {
      fetchBackups();
    };
    window.addEventListener('backupCreated', handleBackupRefresh);
    return () => window.removeEventListener('backupCreated', handleBackupRefresh);
  }, []);

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingBackups(true);
      await deleteBackups([filename]);
      toast.success('Backup deleted successfully');
      await fetchBackups();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete backup');
    } finally {
      setDeletingBackups(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBackups.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedBackups.size} backup(s)? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setDeletingBackups(true);
      await deleteBackups(Array.from(selectedBackups));
      toast.success(`${selectedBackups.size} backup(s) deleted successfully`);
      setSelectedBackups(new Set());
      await fetchBackups();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete backups');
    } finally {
      setDeletingBackups(false);
    }
  };

  const handleDownloadSelected = () => {
    if (selectedBackups.size === 0) return;
    
    selectedBackups.forEach(filename => {
      window.open(`http://localhost:3004/api/company-config/backups/${filename}`, '_blank');
    });
  };

  const toggleBackupSelection = (filename: string) => {
    const newSelection = new Set(selectedBackups);
    if (newSelection.has(filename)) {
      newSelection.delete(filename);
    } else {
      newSelection.add(filename);
    }
    setSelectedBackups(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedBackups.size === backups.length) {
      setSelectedBackups(new Set());
    } else {
      setSelectedBackups(new Set(backups.map(b => b.filename)));
    }
  };

  const updateLocalConfig = (updates: any) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSaveConfiguration = async () => {
    try {
      setIsSaving(true);
      setSaveStatus("idle");

      const success = await saveConfig(localConfig);

      if (success) {
        setHasChanges(false);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Failed to save configuration:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModuleProcessing = (module: keyof ModuleProcessingState) => {
    const newStates = {
      ...processingStates,
      [module]: !processingStates[module],
    };
    setProcessingStates(newStates);
    localStorage.setItem("moduleProcessingStates", JSON.stringify(newStates));
  };

  const handleFileSelect = (type: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const folderPath = target.files[0].webkitRelativePath.split("/")[0];
        if (type === "jsonAnalyzerPath") {
          updateLocalConfig({
            modules: {
              ...localConfig.modules,
              jsonAnalyzer: {
                ...localConfig.modules.jsonAnalyzer,
                dataPath: folderPath,
              },
            },
          });
        } else if (type === "toolManagerExcelPath") {
          updateLocalConfig({
            modules: {
              ...localConfig.modules,
              toolManager: {
                ...localConfig.modules.toolManager,
                paths: {
                  ...(localConfig.modules.toolManager.paths || {}),
                  excelInputPath: folderPath,
                },
              },
            },
          });
        }
      }
    };
    input.click();
  };

  if (isLoading || !localConfig || !localConfig.modules || !localConfig.companyFeatures || 
      !localConfig.modules.jsonScanner || !localConfig.modules.jsonAnalyzer || 
      !localConfig.modules.toolManager || !localConfig.modules.clampingPlateManager) {
    console.log("⏳ AdminSettings: Showing loading screen", {
      isLoading,
      hasLocalConfig: !!localConfig,
      hasModules: !!localConfig?.modules,
      hasCompanyFeatures: !!localConfig?.companyFeatures,
      hasJsonScanner: !!localConfig?.modules?.jsonScanner,
      hasJsonAnalyzer: !!localConfig?.modules?.jsonAnalyzer,
      hasToolManager: !!localConfig?.modules?.toolManager,
      hasClampingPlateManager: !!localConfig?.modules?.clampingPlateManager
    });
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  console.log("✅ AdminSettings: Rendering main content");

  return (
    <div className="space-y-6">
      <Tabs defaultValue="system-control" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system-control">System Control</TabsTrigger>
          <TabsTrigger value="company-setup">Company Setup</TabsTrigger>
          <TabsTrigger value="rules">Rule Management</TabsTrigger>
          <TabsTrigger value="reset">Reset & Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="system-control" className="space-y-6 mt-6">
      {/* Auto-Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Auto-Processing Controls
          </CardTitle>
          <CardDescription>
            Control which modules are automatically processing data in the
            background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* JSON Scanner Control */}
          {localConfig.companyFeatures.jsonScanner && (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileJson className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">JSON Scanner</h4>
                  <p className="text-sm text-muted-foreground">
                    {localConfig.modules.jsonAnalyzer.autoMode
                      ? "Automatically processes JSON files from configured path"
                      : "Manual processing mode - no auto-processing"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    processingStates.jsonScanner ? "default" : "secondary"
                  }
                >
                  {processingStates.jsonScanner ? "Running" : "Stopped"}
                </Badge>
                {localConfig.modules.jsonAnalyzer.autoMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleModuleProcessing("jsonScanner")}
                    className="flex items-center gap-1"
                  >
                    {processingStates.jsonScanner ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Tool Manager Control */}
          {localConfig.companyFeatures.toolManager && (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Tool Manager</h4>
                  <p className="text-sm text-muted-foreground">
                    {localConfig.modules.toolManager.autoMode
                      ? "Automatically processes Excel files and tool inventory"
                      : "Manual processing mode - no auto-processing"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    processingStates.toolManager ? "default" : "secondary"
                  }
                >
                  {processingStates.toolManager ? "Running" : "Stopped"}
                </Badge>
                {localConfig.modules.toolManager.autoMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleModuleProcessing("toolManager")}
                    className="flex items-center gap-1"
                  >
                    {processingStates.toolManager ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Clamping Plate Manager */}
          {localConfig.companyFeatures.clampingPlateManager && (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Grid3X3 className="h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="font-medium">Clamping Plate Manager</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitors plate database and model files for changes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    processingStates.clampingPlateManager
                      ? "default"
                      : "secondary"
                  }
                >
                  {processingStates.clampingPlateManager
                    ? "Running"
                    : "Stopped"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleModuleProcessing("clampingPlateManager")}
                  className="flex items-center gap-1"
                >
                  {processingStates.clampingPlateManager ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* JSON Results Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            JSON Results Viewer
          </CardTitle>
          <CardDescription>
            View all processed JSON files and their analysis results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Processing Results</h4>
              <p className="text-sm text-muted-foreground">
                View detailed results from JSON Scanner processing
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Open JSON results modal/page
                alert(
                  "JSON Results Viewer will show:\n\n• All processed JSON files\n• Processing timestamps\n• Extracted data summaries\n• Validation results\n• Error logs\n\nThis feature will be implemented next."
                );
              }}
              className="flex items-center gap-2"
            >
              <FileJson className="h-4 w-4" />
              View JSON Results
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {(() => {
                  const jsonResults = JSON.parse(localStorage.getItem('jsonScannerResults') || '{"projects":[]}');
                  const toolResults = JSON.parse(localStorage.getItem('toolManagerResults') || '{"tools":[]}');
                  const plateResults = JSON.parse(localStorage.getItem('clampingPlateResults') || '{"plates":[]}');
                  return (jsonResults.projects?.length || 0) + (toolResults.tools?.length || 0) + (plateResults.plates?.length || 0);
                })()}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Files Processed
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {(() => {
                  const jsonResults = JSON.parse(localStorage.getItem('jsonScannerResults') || '{"projects":[]}');
                  const toolResults = JSON.parse(localStorage.getItem('toolManagerResults') || '{"tools":[]}');
                  const plateResults = JSON.parse(localStorage.getItem('clampingPlateResults') || '{"plates":[]}');
                  return (jsonResults.projects?.length || 0) + (toolResults.tools?.length || 0) + (plateResults.plates?.length || 0);
                })()}
              </div>
              <div className="text-sm font-medium text-muted-foreground">Successful</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-red-600 mb-1">0</div>
              <div className="text-sm font-medium text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1. Company Information (matches SetupWizard step 1) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>Basic company details and branding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={localConfig.companyName}
                onChange={(e) =>
                  updateLocalConfig({ companyName: e.target.value })
                }
                placeholder="Enter your company name"
              />
            </div>
            <div>
              <Label htmlFor="company-logo">Company Logo Path</Label>
              <Input
                id="company-logo"
                value={localConfig.companyLogo || ""}
                onChange={(e) =>
                  updateLocalConfig({ companyLogo: e.target.value })
                }
                placeholder="./assets/logo.png"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Module Configuration (matches SetupWizard step 2) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Module Configuration
          </CardTitle>
          <CardDescription>
            Configure application modules and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* JSON Scanner */}
            {localConfig.companyFeatures.jsonScanner && (
              <div className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON Scanner
                  </h5>
                  <Switch
                    checked={localConfig.modules.jsonAnalyzer.autoMode === true}
                    onCheckedChange={(checked) =>
                      updateLocalConfig({
                        modules: {
                          ...localConfig.modules,
                          jsonAnalyzer: {
                            ...localConfig.modules.jsonAnalyzer,
                            mode: checked ? "auto" : "manual",
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="json-path">Data Path</Label>
                  <div className="flex gap-2">
                    <Input
                      id="json-path"
                      value={localConfig.modules.jsonAnalyzer.dataPath}
                      onChange={(e) =>
                        updateLocalConfig({
                          modules: {
                            ...localConfig.modules,
                            jsonAnalyzer: {
                              ...localConfig.modules.jsonAnalyzer,
                              dataPath: e.target.value,
                            },
                          },
                        })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileSelect("jsonAnalyzerPath")}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tool Manager */}
            {localConfig.companyFeatures.toolManager && (
              <div className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Tool Manager
                  </h5>
                  <Switch
                    checked={localConfig.modules.toolManager.autoMode === true}
                    onCheckedChange={(checked) =>
                      updateLocalConfig({
                        modules: {
                          ...localConfig.modules,
                          toolManager: {
                            ...localConfig.modules.toolManager,
                            mode: checked ? "auto" : "manual",
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="excel-path">Excel Input Path</Label>
                  <div className="flex gap-2">
                    <Input
                      id="excel-path"
                      value={
                        localConfig.modules.toolManager.paths?.excelInputPath || ""
                      }
                      onChange={(e) =>
                        updateLocalConfig({
                          modules: {
                            ...localConfig.modules,
                            toolManager: {
                              ...localConfig.modules.toolManager,
                              paths: {
                                ...(localConfig.modules.toolManager.paths || {}),
                                excelInputPath: e.target.value,
                              },
                            },
                          },
                        })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileSelect("toolManagerExcelPath")}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Advanced Tool Manager Settings */}
                <div className="space-y-3 mt-4 pt-3 border-t">
                  <h6 className="text-sm font-medium text-gray-700">
                    Advanced Settings
                  </h6>

                  <div>
                    <Label htmlFor="json-input-path">JSON Input Path</Label>
                    <div className="flex gap-2">
                      <Input
                        id="json-input-path"
                        value={
                          localConfig.modules.toolManager.paths?.jsonInputPath || ""
                        }
                        onChange={(e) =>
                          updateLocalConfig({
                            modules: {
                              ...localConfig.modules,
                              toolManager: {
                                ...localConfig.modules.toolManager,
                                paths: {
                                  ...(localConfig.modules.toolManager.paths || {}),
                                  jsonInputPath: e.target.value,
                                },
                              },
                            },
                          })
                        }
                        placeholder="./data/json-output"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileSelect("toolManagerJsonPath")}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inventory-file">Inventory File Path</Label>
                    <div className="flex gap-2">
                      <Input
                        id="inventory-file"
                        value={localConfig.modules.toolManager.inventoryFile}
                        onChange={(e) =>
                          updateLocalConfig({
                            modules: {
                              ...localConfig.modules,
                              toolManager: {
                                ...localConfig.modules.toolManager,
                                inventoryFile: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="./inventory/tools.xlsx"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileSelect("toolManagerInventory")}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Features</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Excel Processing</span>
                      <Switch
                        checked={
                          localConfig.modules.toolManager.features?.excelProcessing || false
                        }
                        onCheckedChange={(checked) =>
                          updateLocalConfig({
                            modules: {
                              ...localConfig.modules,
                              toolManager: {
                                ...localConfig.modules.toolManager,
                                features: {
                                  ...(localConfig.modules.toolManager.features || {}),
                                  excelProcessing: checked,
                                },
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">JSON Scanning</span>
                      <Switch
                        checked={
                          localConfig.modules.toolManager.features?.jsonScanning || false
                        }
                        onCheckedChange={(checked) =>
                          updateLocalConfig({
                            modules: {
                              ...localConfig.modules,
                              toolManager: {
                                ...localConfig.modules.toolManager,
                                features: {
                                  ...(localConfig.modules.toolManager.features || {}),
                                  jsonScanning: checked,
                                },
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clamping Plates Manager */}
            {localConfig.companyFeatures.clampingPlateManager && (
              <div className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Clamping Plates Manager
                  </h5>
                  <Switch
                    checked={localConfig.modules.clampingPlateManager.autoMode === true}
                    onCheckedChange={(checked) =>
                      updateLocalConfig({
                        modules: {
                          ...localConfig.modules,
                          clampingPlateManager: {
                            ...localConfig.modules.clampingPlateManager,
                            mode: checked ? "auto" : "manual",
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="plates-models-path">Models Path</Label>
                  <div className="flex gap-2">
                    <Input
                      id="plates-models-path"
                      value={localConfig.modules.clampingPlateManager.modelsPath || ""}
                      onChange={(e) =>
                        updateLocalConfig({
                          modules: {
                            ...localConfig.modules,
                            clampingPlateManager: {
                              ...localConfig.modules.clampingPlateManager,
                              modelsPath: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="./data/models"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileSelect("clampingPlateManagerPath")}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="plates-info-file">Plate Info File</Label>
                  <div className="flex gap-2">
                    <Input
                      id="plates-info-file"
                      value={localConfig.modules.clampingPlateManager.plateInfoFile || ""}
                      onChange={(e) =>
                        updateLocalConfig({
                          modules: {
                            ...localConfig.modules,
                            clampingPlateManager: {
                              ...localConfig.modules.clampingPlateManager,
                              plateInfoFile: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="./database/plates.db"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileSelect("platesDatabase")}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Authentication Configuration (matches SetupWizard step 3) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Authentication Settings
          </CardTitle>
          <CardDescription>
            Configure user authentication and access management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="auth-method">Authentication Method</Label>
              <select
                id="auth-method"
                value={localConfig.authentication.method}
                onChange={(e) =>
                  updateLocalConfig({
                    authentication: {
                      ...localConfig.authentication,
                      method: e.target.value as "file" | "database" | "ldap",
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="file">File-based Authentication</option>
                <option value="database">Database Authentication</option>
                <option value="ldap">LDAP Authentication</option>
              </select>
            </div>

            {localConfig.authentication.method === "file" && (
              <div>
                <Label htmlFor="employee-file">Employee File Path</Label>
                <Input
                  id="employee-file"
                  value={localConfig.authentication.employeeFile || ""}
                  onChange={(e) =>
                    updateLocalConfig({
                      authentication: {
                        ...localConfig.authentication,
                        employeeFile: e.target.value,
                      },
                    })
                  }
                  placeholder="./data/employees.txt"
                />
              </div>
            )}

            {localConfig.authentication.method === "database" && (
              <div>
                <Label htmlFor="db-connection">
                  Database Connection String
                </Label>
                <Input
                  id="db-connection"
                  value={localConfig.authentication.databaseConnection || ""}
                  onChange={(e) =>
                    updateLocalConfig({
                      authentication: {
                        ...localConfig.authentication,
                        databaseConnection: e.target.value,
                      },
                    })
                  }
                  placeholder="Server=localhost;Database=CNCUsers;Trusted_Connection=true;"
                />
              </div>
            )}

            {localConfig.authentication.method === "ldap" && (
              <div>
                <Label htmlFor="ldap-server">LDAP Server</Label>
                <Input
                  id="ldap-server"
                  value={localConfig.authentication.ldapServer || ""}
                  onChange={(e) =>
                    updateLocalConfig({
                      authentication: {
                        ...localConfig.authentication,
                        ldapServer: e.target.value,
                      },
                    })
                  }
                  placeholder="ldap://company.com"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Storage Configuration (matches SetupWizard step 4) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Configuration
          </CardTitle>
          <CardDescription>
            Configure data storage strategy and file paths
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Storage Strategy */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Storage Organization Strategy
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    storageStrategy === "mono"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setStorageStrategy("mono")}
                >
                  <h5 className="font-medium mb-2">Mono Folder Strategy</h5>
                  <p className="text-sm text-gray-600">
                    All data stored in a single base folder structure
                  </p>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    storageStrategy === "individual"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setStorageStrategy("individual")}
                >
                  <h5 className="font-medium mb-2">
                    Individual Folders Strategy
                  </h5>
                  <p className="text-sm text-gray-600">
                    Separate folders for each module and data type
                  </p>
                </div>
              </div>
            </div>

            {/* Storage Paths - conditionally shown based on strategy */}
            <div className="space-y-4">
              {storageStrategy === "mono" ? (
                // Mono strategy paths
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="base-path">Base Path</Label>
                    <Input
                      id="base-path"
                      value={localConfig.storage.basePath || ""}
                      onChange={(e) =>
                        updateLocalConfig({
                          storage: {
                            ...localConfig.storage,
                            basePath: e.target.value,
                          },
                        })
                      }
                      placeholder="./data"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="logs-path">Logs Path</Label>
                      <Input
                        id="logs-path"
                        value={localConfig.storage.logsPath}
                        onChange={(e) =>
                          updateLocalConfig({
                            storage: {
                              ...localConfig.storage,
                              logsPath: e.target.value,
                            },
                          })
                        }
                        placeholder="./logs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="backup-path">Backup Path</Label>
                      <Input
                        id="backup-path"
                        value={localConfig.storage.backupPath}
                        onChange={(e) =>
                          updateLocalConfig({
                            storage: {
                              ...localConfig.storage,
                              backupPath: e.target.value,
                            },
                          })
                        }
                        placeholder="./backups"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Individual strategy paths
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temp-path">Temporary Files Path</Label>
                      <Input
                        id="temp-path"
                        value={localConfig.storage.tempPath || ""}
                        onChange={(e) =>
                          updateLocalConfig({
                            storage: {
                              ...localConfig.storage,
                              tempPath: e.target.value,
                            },
                          })
                        }
                        placeholder="./temp"
                      />
                    </div>
                    <div>
                      <Label htmlFor="output-path">Output Files Path</Label>
                      <Input
                        id="output-path"
                        value={localConfig.storage.outputPath || ""}
                        onChange={(e) =>
                          updateLocalConfig({
                            storage: {
                              ...localConfig.storage,
                              outputPath: e.target.value,
                            },
                          })
                        }
                        placeholder="./output"
                      />
                    </div>
                    <div>
                      <Label htmlFor="logs-path-ind">Logs Path</Label>
                      <Input
                        id="logs-path-ind"
                        value={localConfig.storage.logsPath}
                        onChange={(e) =>
                          updateLocalConfig({
                            storage: {
                              ...localConfig.storage,
                              logsPath: e.target.value,
                            },
                          })
                        }
                        placeholder="./logs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="backup-path-ind">Backup Path</Label>
                      <Input
                        id="backup-path-ind"
                        value={localConfig.storage.backupPath}
                        onChange={(e) =>
                          updateLocalConfig({
                            storage: {
                              ...localConfig.storage,
                              backupPath: e.target.value,
                            },
                          })
                        }
                        placeholder="./backups"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Additional Features (matches SetupWizard step 5) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Additional Features
          </CardTitle>
          <CardDescription>
            Configure additional system features and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Dark Mode Support</Label>
                <p className="text-xs text-gray-500">
                  Enable dark theme support
                </p>
              </div>
              <Switch
                checked={localConfig.features.themeMode === "dark"}
                onCheckedChange={(checked) =>
                  updateLocalConfig({
                    features: {
                      ...localConfig.features,
                      themeMode: checked ? "dark" : "light",
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Notifications</Label>
                <p className="text-xs text-gray-500">System notifications</p>
              </div>
              <Switch
                checked={localConfig.features.notifications.enabled}
                onCheckedChange={(checked) =>
                  updateLocalConfig({
                    features: {
                      ...localConfig.features,
                      notifications: {
                        ...localConfig.features.notifications,
                        enabled: checked,
                      },
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto Backup</Label>
                <p className="text-xs text-gray-500">Automatic data backups</p>
              </div>
              <Switch
                checked={localConfig.features.autoBackup}
                onCheckedChange={(checked) =>
                  updateLocalConfig({
                    features: { ...localConfig.features, autoBackup: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Export Reports</Label>
                <p className="text-xs text-gray-500">Enable report exports</p>
              </div>
              <Switch
                checked={localConfig.features.exportReports}
                onCheckedChange={(checked) =>
                  updateLocalConfig({
                    features: {
                      ...localConfig.features,
                      exportReports: checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="company-setup" className="space-y-6 mt-6">
          {companyConfig.isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-muted-foreground">Loading company configuration...</p>
              </div>
            </div>
          ) : companyConfig.error ? (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Configuration Error</CardTitle>
                <CardDescription className="text-red-600">
                  {companyConfig.error}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : companyConfig.config ? (
            <>
              <MachineEditor 
                machines={companyConfig.config.machines}
                onUpdate={companyConfig.updateMachine}
                onAdd={companyConfig.addMachine}
                onDelete={companyConfig.deleteMachine}
              />
              
              <CycleEditor 
                cycles={companyConfig.config.cycles}
                onUpdate={companyConfig.updateCycle}
              />
              
              <ToolCategoryEditor 
                toolCategories={companyConfig.config.toolCategories}
                onUpdate={companyConfig.updateToolCategory}
              />
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="rules" className="space-y-6 mt-6">
          {companyConfig.isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-muted-foreground">Loading rules...</p>
              </div>
            </div>
          ) : companyConfig.config ? (
            <RuleEditor 
              rules={companyConfig.config.validationRules}
              machines={companyConfig.config.machines}
              cycles={companyConfig.config.cycles}
              toolCategories={companyConfig.config.toolCategories}
              onUpdate={companyConfig.updateRule}
              onAdd={companyConfig.addRule}
              onDelete={companyConfig.deleteRule}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="reset" className="space-y-6 mt-6">
          {/* Backup Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Backup Management
              </CardTitle>
              <CardDescription>
                Automatic backups are created before each company config change. Manage and restore backups here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Backup History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Recent Backups</h4>
                  {backups.length > 0 && (
                    <div className="flex gap-2">
                      {selectedBackups.size > 0 && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleDownloadSelected}
                            disabled={deletingBackups}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download ({selectedBackups.size})
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                            onClick={handleDeleteSelected}
                            disabled={deletingBackups}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete ({selectedBackups.size})
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {loadingBackups ? (
                  <div className="border rounded-lg p-4 text-center text-muted-foreground">
                    Loading backups...
                  </div>
                ) : backups.length === 0 ? (
                  <div className="border rounded-lg p-4 text-center text-muted-foreground">
                    No backups found. Backups are created automatically when you make changes.
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y">
                    {/* Select All Row */}
                    <div className="flex items-center gap-3 p-3 bg-muted/30">
                      <input 
                        type="checkbox"
                        checked={selectedBackups.size === backups.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-muted-foreground">
                        Select All ({backups.length} backups)
                      </span>
                    </div>
                    
                    {backups.map((backup) => {
                      const date = new Date(backup.timestamp);
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMs / 3600000);
                      const diffDays = Math.floor(diffMs / 86400000);
                      
                      let timeAgo = '';
                      if (diffMins < 1) timeAgo = 'Just now';
                      else if (diffMins < 60) timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                      else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                      else timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                      
                      const sizeKB = (backup.size / 1024).toFixed(1);
                      const isSelected = selectedBackups.has(backup.filename);
                      
                      return (
                        <div key={backup.filename} className={`flex items-center justify-between p-3 hover:bg-muted/50 ${isSelected ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleBackupSelection(backup.filename)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <FileJson className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{backup.filename}</p>
                              <p className="text-xs text-muted-foreground">{timeAgo} • {sizeKB} KB</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-green-600 text-green-600 hover:bg-green-50"
                              onClick={() => {
                                if (confirm('Are you sure you want to restore this backup? This will replace your current configuration.')) {
                                  console.log('Restoring backup:', backup.filename);
                                }
                              }}
                              disabled={deletingBackups}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                window.open(`http://localhost:3004/api/company-config/backups/${backup.filename}`, '_blank');
                              }}
                              disabled={deletingBackups}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-600 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteBackup(backup.filename)}
                              disabled={deletingBackups}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Manual Backup */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                <div>
                  <h4 className="font-medium text-blue-900">Create Manual Backup</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Export company config and clamping plate data as a timestamped backup
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Setup Wizard Configuration Import/Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Setup Wizard Configuration
              </CardTitle>
              <CardDescription>
                Export or import your complete setup wizard configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Configuration */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">Export Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Download your current setup as a backup file
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const configBlob = new Blob(
                            [JSON.stringify(localConfig, null, 2)],
                            {
                              type: "application/json",
                            }
                          );
                          const url = URL.createObjectURL(configBlob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `cnc-dashboard-config-${
                            new Date().toISOString().split("T")[0]
                          }.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Config
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Import Configuration */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Upload className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">Import Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Load configuration from a backup file
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".json";
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              try {
                                const text = await file.text();
                                const importedConfig = JSON.parse(text);
                                updateLocalConfig(importedConfig);
                                setSaveStatus("success");
                                setTimeout(() => setSaveStatus("idle"), 3000);
                              } catch (error) {
                                console.error(
                                  "Failed to import configuration:",
                                  error
                                );
                                setSaveStatus("error");
                                setTimeout(() => setSaveStatus("idle"), 3000);
                              }
                            }
                          };
                          input.click();
                        }}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Config
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset and Reconfigure */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <RotateCcw className="h-6 w-6 text-yellow-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-yellow-900">
                    Reset & Reconfigure
                  </h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Clear all settings and restart the setup wizard from scratch
                  </p>
                </div>
              </div>
              <Button
                size="default"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 shadow-md"
                onClick={async () => {
                  if (
                    confirm(
                      "Are you sure you want to reset all configuration and restart the setup wizard? This action cannot be undone."
                    )
                  ) {
                    // Reset backend config file first
                    const success = await resetConfig();
                    
                    if (success) {
                      // Clear ALL localStorage including auth tokens
                      localStorage.clear();
                      
                      // Clear session storage too
                      sessionStorage.clear();
                      
                      // Force hard reload to clear all React state
                      window.location.href = '/';
                    }
                  }
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Setup
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
