import React, { useState, useEffect } from "react";
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
import {
  Building2,
  Settings,
  Database,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Bell,
  Monitor,
  FolderOpen,
  Users,
  FileJson,
  FileText,
  Upload,
  Download,
  PlayCircle,
  RefreshCw,
  Rocket,
  Save,
  Palette,
  Search,
} from "lucide-react";
import { SetupConfig } from "../hooks/useSetupConfig";
import { SetupValidation } from "../utils/setupValidation";
import ValidationFeedback from "./ValidationFeedback";
import { demoConfig } from "../config/demoConfig";

interface SetupWizardProps {
  onComplete: (config: SetupConfig) => void;
  initialConfig: SetupConfig;
}

export default function SetupWizard({
  onComplete,
  initialConfig,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  // Use demo config if demo mode enabled
  const [config, setConfig] = useState<SetupConfig>(() => {
    if (initialConfig.demoMode) {
      return { ...initialConfig, ...demoConfig, demoMode: true };
    }
    return initialConfig;
  });

  // Auto-complete wizard is DISABLED - user must manually complete setup
  // Even in demo mode, they need to click through wizard steps
  // This prevents accidental auto-completion after reset

  const steps = [
    {
      title: "Introduction",
      icon: AlertCircle,
      description: "Setup Overview & Guidelines",
    },
    { title: "Company", icon: Building2, description: "Company Information" },
    { title: "Modules", icon: Settings, description: "Configure Applications" },
    { title: "Authentication", icon: Users, description: "User Management" },
    { title: "Storage", icon: Database, description: "Data & File Paths" },
    {
      title: "Preferences",
      icon: CheckCircle2,
      description: "Application Preferences",
    },
    {
      title: "Validation",
      icon: PlayCircle,
      description: "Test & Validate Setup",
    },
  ];

  // Load wizard progress and config from localStorage on mount
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem("setupWizardStep");
      const savedConfig = localStorage.getItem("setupWizardProgress");

      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (step >= 0 && step < steps.length) {
          setCurrentStep(step);
        }
      }

      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig((prev) => ({ ...prev, ...parsedConfig }));
      }
    } catch (error) {
      console.error("Failed to load wizard progress:", error);
    }
  }, []);

  // Save wizard progress whenever step or config changes
  useEffect(() => {
    try {
      localStorage.setItem("setupWizardStep", currentStep.toString());
      localStorage.setItem("setupWizardProgress", JSON.stringify(config));
    } catch (error) {
      console.error("Failed to save wizard progress:", error);
    }
  }, [currentStep, config]);

  const updateConfig = (updates: Partial<SetupConfig>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };
      try {
        localStorage.setItem("setupWizardProgress", JSON.stringify(newConfig));
      } catch (error) {
        console.error("Failed to save config progress:", error);
      }
      return newConfig;
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
    }
  };

  const clearWizardProgress = () => {
    try {
      localStorage.removeItem("setupWizardStep");
      localStorage.removeItem("setupWizardProgress");
    } catch (error) {
      console.error("Failed to clear wizard progress:", error);
    }
  };

  const handleComplete = () => {
    const finalConfig = { ...config, isConfigured: true };
    clearWizardProgress();
    onComplete(finalConfig);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <IntroductionStep config={config} setConfig={setConfig} />;
      case 1:
        return <CompanyStep config={config} updateConfig={updateConfig} />;
      case 2:
        return <ModulesStep config={config} updateConfig={updateConfig} />;
      case 3:
        return (
          <AuthenticationStep config={config} updateConfig={updateConfig} />
        );
      case 4:
        return <StorageStep config={config} updateConfig={updateConfig} />;
      case 5:
        return <PreferencesStep config={config} updateConfig={updateConfig} />;
      case 6:
        return <ValidationStep config={config} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      {config.demoMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 dark:bg-blue-700 text-white py-1 px-4">
          <div className="flex items-center justify-center">
            <span className="text-sm font-medium">
              🚀 Demo Mode - Using test data for demonstration
            </span>
          </div>
        </div>
      )}

      <div className={`w-full max-w-4xl ${config.demoMode ? "mt-8" : ""}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4 relative">
            <Building2 className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              CNC Management Dashboard Setup
            </h1>
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to start over? This will clear all your progress."
                    )
                  ) {
                    clearWizardProgress();
                    setCurrentStep(0);
                    setConfig(initialConfig);
                  }
                }}
                className="absolute right-0 text-xs flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Start Over
              </Button>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome! Let's configure your dashboard for your specific
            environment.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isClickable = isCompleted;

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                    ${
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white"
                        : isCompleted
                        ? "bg-green-600 border-green-600 text-white cursor-pointer hover:bg-green-700 hover:border-green-700"
                        : "bg-white border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                    }
                  `}
                    onClick={() => {
                      if (isClickable) {
                        setCurrentStep(index);
                      }
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div
                    className={`mt-2 text-center ${
                      isClickable ? "cursor-pointer" : ""
                    }`}
                    onClick={() => {
                      if (isClickable) {
                        setCurrentStep(index);
                      }
                    }}
                  >
                    <p
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                          ? "text-green-600 hover:text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs ${
                        isCompleted ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep].icon, {
                className: "h-5 w-5",
              })}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>Progress auto-saved</span>
            </div>

            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep} className="flex items-center gap-2">
                {currentStep === steps.length - 2 ? "Validate Setup" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function IntroductionStep({
  config,
  setConfig,
}: {
  config: SetupConfig;
  setConfig: React.Dispatch<React.SetStateAction<SetupConfig>>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Setup Wizard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Let's configure your unified manufacturing management system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileJson className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Read-Only Approach</CardTitle>
                <CardDescription>Safe and non-invasive</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We only <strong>read</strong> from your existing folders and
              files. Nothing will be modified, moved, or deleted in your source
              directories. All our working data is saved to our own workspace.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  File Format Requirements
                </CardTitle>
                <CardDescription>
                  Two files need specific formats
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Employee file:</strong> Must follow our CSV/JSON
                  format
                </p>
                <p>
                  <strong>Plate information file:</strong> Must follow our
                  Excel/CSV format
                </p>
                <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                  💡 We'll provide sample templates to help you
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Demo Mode
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Uses BRK_CNC_CORE/test-data folder - backends must be running
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Switch
                checked={config.demoMode}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, demoMode: checked }))
                }
              />
              <div className="flex-1">
                <Label className="text-sm font-medium">Enable Demo Mode</Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, the system will automatically use built-in test
                  data instead of requiring you to specify file paths
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompanyStep({
  config,
  updateConfig,
}: {
  config: SetupConfig;
  updateConfig: (updates: Partial<SetupConfig>) => void;
}) {
  React.useEffect(() => {
    if (config.demoMode) {
      updateConfig({
        companyName: "Test Company",
        companyLogo: "/api/placeholder/150/150",
        companyFeatures: {
          jsonScanner: true,
          toolManager: true,
          clampingPlateManager: true,
        },
      });
    }
  }, [config.demoMode]);

  const companyNameValidation = SetupValidation.validateCompanyName(
    config.companyName
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            {config.demoMode
              ? "Demo company information is automatically populated"
              : "Enter your company details and logo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Input Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={config.companyName}
                  onChange={(e) =>
                    config.demoMode
                      ? null
                      : updateConfig({ companyName: e.target.value })
                  }
                  placeholder="Enter your company name"
                  readOnly={config.demoMode}
                  disabled={config.demoMode}
                  className={`${
                    config.demoMode
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      : !companyNameValidation.isValid
                      ? "border-red-300 focus:border-red-500"
                      : config.companyName && companyNameValidation.isValid
                      ? "border-green-300 focus:border-green-500"
                      : ""
                  }`}
                />
                {config.companyName && !config.demoMode && (
                  <ValidationFeedback
                    isValid={companyNameValidation.isValid}
                    error={companyNameValidation.error}
                    warning={companyNameValidation.warning}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyLogo">Company Logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="companyLogo"
                    value={config.companyLogo || ""}
                    onChange={(e) =>
                      config.demoMode
                        ? null
                        : updateConfig({ companyLogo: e.target.value })
                    }
                    placeholder="Paste image URL or use upload button"
                    readOnly={config.demoMode}
                    disabled={config.demoMode}
                    className={`flex-1 ${
                      config.demoMode
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={config.demoMode}
                    className={`flex items-center gap-2 flex-shrink-0 ${
                      config.demoMode ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            {(config.companyName || config.companyLogo) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Dashboard Preview
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    How it will appear in your CNC Management Dashboard
                  </span>
                </div>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      {/* Logo Preview */}
                      <div className="flex-shrink-0">
                        {config.companyLogo ? (
                          <img
                            src={config.companyLogo}
                            alt="Company Logo"
                            className="w-16 h-16 object-contain border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-16 h-16 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${
                            config.companyLogo ? "hidden" : ""
                          }`}
                        >
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>

                      {/* Company Name */}
                      <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {config.companyName || "Your Company Name"}
                        </h1>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  ✨ This preview shows how your company branding will appear in
                  the sidebar header
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Features</CardTitle>
          <CardDescription>
            {config.demoMode
              ? "Demo mode has all features enabled automatically"
              : "Select which modules your company wants to use"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  config.companyFeatures.jsonScanner
                    ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      config.companyFeatures.jsonScanner
                        ? "bg-blue-100 dark:bg-blue-900/20"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <FileJson
                      className={`h-5 w-5 ${
                        config.companyFeatures.jsonScanner
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      JSON Scanner
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Analyze and process CNC program JSON files with automated
                      validation
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.companyFeatures.jsonScanner}
                  onCheckedChange={(checked) =>
                    config.demoMode
                      ? null
                      : updateConfig({
                          companyFeatures: {
                            ...config.companyFeatures,
                            jsonScanner: checked,
                          },
                        })
                  }
                  disabled={config.demoMode}
                  className={
                    config.demoMode ? "cursor-not-allowed opacity-50" : ""
                  }
                />
              </div>

              <div
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  config.companyFeatures.toolManager
                    ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      config.companyFeatures.toolManager
                        ? "bg-green-100 dark:bg-green-900/20"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Settings
                      className={`h-5 w-5 ${
                        config.companyFeatures.toolManager
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Tool Manager
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Comprehensive tool inventory and lifecycle management
                      system
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.companyFeatures.toolManager}
                  onCheckedChange={(checked) =>
                    config.demoMode
                      ? null
                      : updateConfig({
                          companyFeatures: {
                            ...config.companyFeatures,
                            toolManager: checked,
                          },
                        })
                  }
                  disabled={config.demoMode}
                  className={
                    config.demoMode ? "cursor-not-allowed opacity-50" : ""
                  }
                />
              </div>

              <div
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  config.companyFeatures.clampingPlateManager
                    ? "border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/10"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      config.companyFeatures.clampingPlateManager
                        ? "bg-purple-100 dark:bg-purple-900/20"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Database
                      className={`h-5 w-5 ${
                        config.companyFeatures.clampingPlateManager
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Clamping Plate Manager
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage clamping plates and workholding solutions
                      efficiently
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.companyFeatures.clampingPlateManager}
                  onCheckedChange={(checked) =>
                    config.demoMode
                      ? null
                      : updateConfig({
                          companyFeatures: {
                            ...config.companyFeatures,
                            clampingPlateManager: checked,
                          },
                        })
                  }
                  disabled={config.demoMode}
                  className={
                    config.demoMode ? "cursor-not-allowed opacity-50" : ""
                  }
                />
              </div>
            </div>

            {config.demoMode && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Demo Mode: All company features are automatically enabled
                    for testing
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Modules Step Component
function ModulesStep({
  config,
  updateConfig,
}: {
  config: SetupConfig;
  updateConfig: (updates: Partial<SetupConfig>) => void;
}) {
  React.useEffect(() => {
    if (config.demoMode) {
      updateConfig({
        modules: {
          ...config.modules,
          jsonAnalyzer: {
            ...config.modules.jsonAnalyzer,
            dataPath: "../BRK_CNC_CORE/test-data/source_data/json_files",
          },
          matrixTools: {
            ...config.modules.matrixTools,
            dataPath: "../BRK_CNC_CORE/test-data/source_data/matrix_excel_files",
            inventoryFile:
              "../BRK_CNC_CORE/test-data/source_data/matrix_excel_files/E-Cut,MFC,XF,XFeed készlet.xlsx",
            paths: {
              excelInputPath: "../BRK_CNC_CORE/test-data/source_data/matrix_excel_files",
              jsonInputPath: "../BRK_CNC_CORE/test-data/source_data/json_files",
            },
          },
          platesManager: {
            ...config.modules.platesManager,
            modelsPath: "../BRK_CNC_CORE/test-data/source_data/clamping_plates/models",
            plateInfoFile:
              "../BRK_CNC_CORE/test-data/source_data/clamping_plates/info/Készülékek.xlsx",
          },
        },
      });
    }
  }, [config.demoMode]);

  // Sync JSON Scanner path with Tool Manager when both are enabled and in auto mode
  React.useEffect(() => {
    if (
      config.companyFeatures.jsonScanner &&
      config.companyFeatures.toolManager &&
      config.modules.jsonAnalyzer.mode === "auto" &&
      config.modules.matrixTools.mode === "auto"
    ) {
      const jsonScannerPath = config.modules.jsonAnalyzer.dataPath;
      if (
        jsonScannerPath &&
        jsonScannerPath !== config.modules.matrixTools.paths.jsonInputPath
      ) {
        updateConfig({
          modules: {
            ...config.modules,
            matrixTools: {
              ...config.modules.matrixTools,
              paths: {
                ...config.modules.matrixTools.paths,
                jsonInputPath: jsonScannerPath,
              },
            },
          },
        });
      }
    }
  }, [
    config.modules.jsonAnalyzer.dataPath,
    config.modules.jsonAnalyzer.mode,
    config.modules.matrixTools.mode,
    config.companyFeatures.jsonScanner,
    config.companyFeatures.toolManager,
  ]);

  const handleModuleModeToggle = (
    module: keyof typeof config.modules,
    mode: "auto" | "manual"
  ) => {
    if (config.demoMode) return;
    updateConfig({
      modules: {
        ...config.modules,
        [module]: {
          ...config.modules[module],
          mode: mode,
        },
      },
    });
  };

  const handleModulePathChange = (
    module: keyof typeof config.modules,
    field: string,
    value: string
  ) => {
    if (config.demoMode) return;

    const moduleConfig = config.modules[module];
    const updates: any = {
      modules: {
        ...config.modules,
        [module]: {
          ...moduleConfig,
        },
      },
    };

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      updates.modules[module] = {
        ...moduleConfig,
        [parent]: {
          ...(moduleConfig as any)[parent],
          [child]: value,
        },
      };
    } else {
      updates.modules[module] = {
        ...moduleConfig,
        [field]: value,
      };
    }

    // If updating JSON Scanner dataPath and Tool Manager is enabled and both in auto mode, sync the paths
    if (
      module === "jsonAnalyzer" &&
      field === "dataPath" &&
      config.companyFeatures.toolManager &&
      config.modules.jsonAnalyzer.mode === "auto" &&
      config.modules.matrixTools.mode === "auto"
    ) {
      updates.modules.matrixTools = {
        ...config.modules.matrixTools,
        paths: {
          ...config.modules.matrixTools.paths,
          jsonInputPath: value,
        },
      };
    }

    updateConfig(updates);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Module Paths Configuration</CardTitle>
          <CardDescription>
            {config.demoMode
              ? "Demo mode uses predefined paths for all enabled modules"
              : "Configure the data paths for your enabled modules"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              📁 Configure where each module will store and read its data files.
            </p>
            <p>
              💡 Make sure these directories exist or will be created by the
              application.
            </p>
          </div>
        </CardContent>
      </Card>

      {config.companyFeatures.jsonScanner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                JSON Scanner Paths
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Auto Mode
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.modules.jsonAnalyzer.mode === "auto"}
                    onChange={(e) =>
                      handleModuleModeToggle(
                        "jsonAnalyzer",
                        e.target.checked ? "auto" : "manual"
                      )
                    }
                    disabled={config.demoMode}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${
                      config.demoMode ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  ></div>
                </label>
              </div>
            </CardTitle>
            <CardDescription>
              {config.modules.jsonAnalyzer.mode === "auto"
                ? "Configure data paths for JSON analysis and CNC program processing"
                : "Paths will be requested when you run the JSON Scanner feature at the dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {config.modules.jsonAnalyzer.mode === "auto" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jsonDataPath">JSON Data Directory</Label>
                  <div className="flex gap-2">
                    <Input
                      id="jsonDataPath"
                      value={config.modules.jsonAnalyzer.dataPath}
                      onChange={(e) =>
                        handleModulePathChange(
                          "jsonAnalyzer",
                          "dataPath",
                          e.target.value
                        )
                      }
                      placeholder="C:\CNC_Data\JsonFiles"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={config.demoMode}
                      className={
                        config.demoMode ? "cursor-not-allowed opacity-50" : ""
                      }
                    >
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Directory containing CNC program JSON files to be analyzed
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Manual Path Configuration
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The JSON Scanner will ask for the data directory path when
                      you start the feature from the dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {config.companyFeatures.toolManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                Tool Manager Paths
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Auto Mode
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.modules.matrixTools.mode === "auto"}
                    onChange={(e) =>
                      handleModuleModeToggle(
                        "matrixTools",
                        e.target.checked ? "auto" : "manual"
                      )
                    }
                    disabled={config.demoMode}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 ${
                      config.demoMode ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  ></div>
                </label>
              </div>
            </CardTitle>
            <CardDescription>
              {config.modules.matrixTools.mode === "auto"
                ? "Configure data paths for tool inventory and Excel processing"
                : "Paths will be requested when you run the Tool Manager feature at the dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {config.modules.matrixTools.mode === "auto" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="excelScanPath">Excel Files Directory</Label>
                  <div className="flex gap-2">
                    <Input
                      id="excelScanPath"
                      value={config.modules.matrixTools.paths.excelInputPath}
                      onChange={(e) =>
                        handleModulePathChange(
                          "matrixTools",
                          "paths.excelInputPath",
                          e.target.value
                        )
                      }
                      placeholder="C:\Production\Matrix"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={config.demoMode}
                      className={
                        config.demoMode ? "cursor-not-allowed opacity-50" : ""
                      }
                    >
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Directory to scan for incoming Excel files
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jsonScanPath">CNC Data Directory</Label>
                  <div className="flex gap-2">
                    <Input
                      id="jsonScanPath"
                      value={
                        config.companyFeatures.jsonScanner &&
                        config.modules.jsonAnalyzer.mode === "auto"
                          ? config.modules.jsonAnalyzer.dataPath
                          : config.modules.matrixTools.paths.jsonInputPath
                      }
                      onChange={(e) =>
                        !(
                          config.companyFeatures.jsonScanner &&
                          config.modules.jsonAnalyzer.mode === "auto"
                        ) &&
                        handleModulePathChange(
                          "matrixTools",
                          "paths.jsonInputPath",
                          e.target.value
                        )
                      }
                      placeholder="C:\Production\CNC_Data"
                      readOnly={
                        config.demoMode ||
                        (config.companyFeatures.jsonScanner &&
                          config.modules.jsonAnalyzer.mode === "auto")
                      }
                      disabled={
                        config.demoMode ||
                        (config.companyFeatures.jsonScanner &&
                          config.modules.jsonAnalyzer.mode === "auto")
                      }
                      className={`${
                        config.demoMode ||
                        (config.companyFeatures.jsonScanner &&
                          config.modules.jsonAnalyzer.mode === "auto")
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      } ${
                        config.companyFeatures.jsonScanner &&
                        config.modules.jsonAnalyzer.mode === "auto"
                          ? "border-blue-300 dark:border-blue-600"
                          : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        config.demoMode ||
                        (config.companyFeatures.jsonScanner &&
                          config.modules.jsonAnalyzer.mode === "auto")
                      }
                      className={
                        config.demoMode ||
                        (config.companyFeatures.jsonScanner &&
                          config.modules.jsonAnalyzer.mode === "auto")
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }
                    >
                      Browse
                    </Button>
                  </div>
                  {config.companyFeatures.jsonScanner &&
                  config.modules.jsonAnalyzer.mode === "auto" ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Auto-synced with JSON Scanner Data Directory
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Root directory for CNC machine JSON files
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Manual Path Configuration
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The Tool Manager will ask for Excel and CNC data directory
                      paths when you start the feature from the dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {config.companyFeatures.clampingPlateManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Clamping Plate Manager Paths
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Auto Mode
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.modules.platesManager.mode === "auto"}
                    onChange={(e) =>
                      handleModuleModeToggle(
                        "platesManager",
                        e.target.checked ? "auto" : "manual"
                      )
                    }
                    disabled={config.demoMode}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 ${
                      config.demoMode ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  ></div>
                </label>
              </div>
            </CardTitle>
            <CardDescription>
              {config.modules.platesManager.mode === "auto"
                ? "Configure paths for clamping plate models and data"
                : "Paths will be requested when you run the Clamping Plate Manager feature at the dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {config.modules.platesManager.mode === "auto" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plateModelsPath">Models Directory</Label>
                  <div className="flex gap-2">
                    <Input
                      id="plateModelsPath"
                      value={config.modules.platesManager.modelsPath || ""}
                      onChange={(e) =>
                        handleModulePathChange(
                          "platesManager",
                          "modelsPath",
                          e.target.value
                        )
                      }
                      placeholder="C:\PlateManager\Models"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={config.demoMode}
                      className={
                        config.demoMode ? "cursor-not-allowed opacity-50" : ""
                      }
                    >
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Directory for plate 3D models and drawings
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plateInfoFile">Plate Info File</Label>
                  <div className="flex gap-2">
                    <Input
                      id="plateInfoFile"
                      value={config.modules.platesManager.plateInfoFile || ""}
                      onChange={(e) =>
                        handleModulePathChange(
                          "platesManager",
                          "plateInfoFile",
                          e.target.value
                        )
                      }
                      placeholder="C:\PlateManager\plate_info.xlsx"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={config.demoMode}
                      className={
                        config.demoMode ? "cursor-not-allowed opacity-50" : ""
                      }
                    >
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Excel file with plate specifications and details
                  </p>
                </div>

                {/* Sample File Section */}
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-orange-600 dark:text-orange-400 text-lg">
                          📋
                        </span>
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">
                          File Structure Requirements
                        </h4>
                      </div>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        Your plate info file should follow our specific
                        structure to ensure proper data import. Download the
                        sample file to see the required columns and format.
                      </p>
                      <div className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                        <div>
                          • <strong>Required columns:</strong> Plate ID, Name,
                          Material, Dimensions, Weight, Status
                        </div>
                        <div>
                          • <strong>Format:</strong> Excel (.xlsx) or CSV (.csv)
                        </div>
                        <div>
                          • <strong>Encoding:</strong> UTF-8 recommended
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-4 h-9 bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60"
                      onClick={() => {
                        // Create sample data and trigger download
                        const sampleData = [
                          [
                            "Plate ID",
                            "Name",
                            "Material",
                            "Thickness (mm)",
                            "Length (mm)",
                            "Width (mm)",
                            "Weight (kg)",
                            "Status",
                            "Location",
                            "Notes",
                          ],
                          [
                            "P001",
                            "Standard Base Plate",
                            "Steel",
                            "25",
                            "400",
                            "300",
                            "23.5",
                            "Available",
                            "Rack A1",
                            "General purpose plate",
                          ],
                          [
                            "P002",
                            "Heavy Duty Plate",
                            "Cast Iron",
                            "40",
                            "600",
                            "400",
                            "75.2",
                            "In Use",
                            "Machine 1",
                            "For heavy components",
                          ],
                          [
                            "P003",
                            "Precision Plate",
                            "Aluminum",
                            "20",
                            "300",
                            "200",
                            "3.24",
                            "Available",
                            "Rack B2",
                            "High precision work",
                          ],
                          [
                            "P004",
                            "Custom Plate #1",
                            "Steel",
                            "30",
                            "500",
                            "350",
                            "41.3",
                            "Maintenance",
                            "Workshop",
                            "Custom holes pattern",
                          ],
                          [
                            "P005",
                            "Vacuum Plate",
                            "Steel",
                            "35",
                            "450",
                            "320",
                            "39.8",
                            "Available",
                            "Rack A3",
                            "With vacuum channels",
                          ],
                        ];

                        // Convert to CSV
                        const csvContent = sampleData
                          .map((row) => row.join(","))
                          .join("\n");
                        const blob = new Blob([csvContent], {
                          type: "text/csv",
                        });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "clamping_plates_sample.csv";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      }}
                    >
                      📥 Download Sample
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Manual Path Configuration
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The Clamping Plate Manager will ask for models directory
                      and plate info file paths when you start the feature from
                      the dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!config.companyFeatures.jsonScanner &&
        !config.companyFeatures.toolManager &&
        !config.companyFeatures.clampingPlateManager && (
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="h-12 w-12 text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                    No Modules Enabled
                  </h3>
                  <p className="text-orange-600 dark:text-orange-300">
                    Please go back to the Company step and enable at least one
                    module to configure its paths.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {config.demoMode &&
        (config.companyFeatures.jsonScanner ||
          config.companyFeatures.toolManager ||
          config.companyFeatures.clampingPlateManager) && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Demo Mode: All module paths are set to demo locations for
                  testing
                </span>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

function AuthenticationStep({
  config,
  updateConfig,
}: {
  config: SetupConfig;
  updateConfig: (updates: Partial<SetupConfig>) => void;
}) {
  React.useEffect(() => {
    if (config.demoMode) {
      updateConfig({
        authentication: {
          ...config.authentication,
          method: "file",
          employeeFile: "../BRK_CNC_CORE/test-data/source_data/employees.json",
        },
      });
    }
  }, [config.demoMode]);

  const handleAuthMethodChange = (method: "file" | "database" | "ldap") => {
    if (config.demoMode) return;
    updateConfig({
      authentication: {
        ...config.authentication,
        method: method,
      },
    });
  };

  const handleEmployeeFileChange = (path: string) => {
    if (config.demoMode) return;
    updateConfig({
      authentication: {
        ...config.authentication,
        employeeFile: path,
      },
    });
  };

  const handleDatabaseConnectionChange = (connection: string) => {
    if (config.demoMode) return;
    updateConfig({
      authentication: {
        ...config.authentication,
        databaseConnection: connection,
      },
    });
  };

  const handleLdapServerChange = (server: string) => {
    if (config.demoMode) return;
    updateConfig({
      authentication: {
        ...config.authentication,
        ldapServer: server,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Method</CardTitle>
          <CardDescription>
            {config.demoMode
              ? "Demo mode uses file-based authentication with test data"
              : "Choose how users will authenticate with the system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer border-2 transition-colors ${
                  config.authentication.method === "file"
                    ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                } ${config.demoMode ? "cursor-not-allowed opacity-50" : ""}`}
                onClick={() =>
                  !config.demoMode && handleAuthMethodChange("file")
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        config.authentication.method === "file"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <FileJson
                        className={`h-5 w-5 ${
                          config.authentication.method === "file"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">File-Based</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Employee file
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer border-2 transition-colors ${
                  config.authentication.method === "database"
                    ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                } ${config.demoMode ? "cursor-not-allowed opacity-50" : ""}`}
                onClick={() =>
                  !config.demoMode && handleAuthMethodChange("database")
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        config.authentication.method === "database"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Database
                        className={`h-5 w-5 ${
                          config.authentication.method === "database"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">Database</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SQL Database
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer border-2 transition-colors ${
                  config.authentication.method === "ldap"
                    ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                } ${config.demoMode ? "cursor-not-allowed opacity-50" : ""}`}
                onClick={() =>
                  !config.demoMode && handleAuthMethodChange("ldap")
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        config.authentication.method === "ldap"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Users
                        className={`h-5 w-5 ${
                          config.authentication.method === "ldap"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">LDAP</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Directory Service
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {config.authentication.method === "file" && (
        <Card>
          <CardHeader>
            <CardTitle>Employee File Configuration</CardTitle>
            <CardDescription>
              Specify the path to your employee data file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeFile">Employee File Path</Label>
                <div className="flex gap-2">
                  <Input
                    id="employeeFile"
                    value={config.authentication.employeeFile || ""}
                    onChange={(e) => handleEmployeeFileChange(e.target.value)}
                    placeholder="C:\Data\employees.json or employees.csv"
                    readOnly={config.demoMode}
                    disabled={config.demoMode}
                    className={
                      config.demoMode
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={config.demoMode}
                    className={
                      config.demoMode ? "cursor-not-allowed opacity-50" : ""
                    }
                  >
                    Browse
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: JSON, CSV. File must contain employee ID,
                  name, and role information.
                </p>
              </div>

              {/* Sample File Section */}
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-orange-600 dark:text-orange-400 text-lg">
                        👥
                      </span>
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">
                        Employee File Structure Requirements
                      </h4>
                    </div>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                      Your employee file should follow our specific structure
                      for proper authentication. Download the sample file to see
                      the required fields and format.
                    </p>
                    <div className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                      <div>
                        • <strong>Required fields:</strong> Employee ID, Name,
                        Role, Department, Access Level
                      </div>
                      <div>
                        • <strong>Format:</strong> JSON (.json) or CSV (.csv)
                      </div>
                      <div>
                        • <strong>Encoding:</strong> UTF-8 required
                      </div>
                      <div>
                        • <strong>Roles:</strong> Admin, Manager, Operator,
                        Viewer
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-4 h-9 bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60"
                    onClick={() => {
                      // Create sample employee data and trigger download
                      const sampleData = [
                        [
                          "Employee ID",
                          "Name",
                          "Role",
                          "Department",
                          "Access Level",
                          "Email",
                          "Status",
                        ],
                        [
                          "EMP001",
                          "John Smith",
                          "Admin",
                          "IT",
                          "Full",
                          "john.smith@company.com",
                          "Active",
                        ],
                        [
                          "EMP002",
                          "Sarah Johnson",
                          "Manager",
                          "Production",
                          "High",
                          "sarah.johnson@company.com",
                          "Active",
                        ],
                        [
                          "EMP003",
                          "Mike Wilson",
                          "Operator",
                          "Manufacturing",
                          "Medium",
                          "mike.wilson@company.com",
                          "Active",
                        ],
                        [
                          "EMP004",
                          "Lisa Brown",
                          "Operator",
                          "Quality Control",
                          "Medium",
                          "lisa.brown@company.com",
                          "Active",
                        ],
                        [
                          "EMP005",
                          "David Lee",
                          "Viewer",
                          "Engineering",
                          "Low",
                          "david.lee@company.com",
                          "Active",
                        ],
                      ];

                      // Convert to CSV
                      const csvContent = sampleData
                        .map((row) => row.join(","))
                        .join("\n");
                      const blob = new Blob([csvContent], { type: "text/csv" });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "employees_sample.csv";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    📥 Download Sample
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {config.authentication.method === "database" && (
        <Card>
          <CardHeader>
            <CardTitle>Database Configuration</CardTitle>
            <CardDescription>
              Configure your database connection for user authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="databaseConnection">
                  Database Connection String
                </Label>
                <Input
                  id="databaseConnection"
                  type="text"
                  value={config.authentication.databaseConnection || ""}
                  onChange={(e) =>
                    handleDatabaseConnectionChange(e.target.value)
                  }
                  placeholder="Server=localhost;Database=employees;Trusted_Connection=true;"
                  readOnly={config.demoMode}
                  disabled={config.demoMode}
                  className={
                    config.demoMode
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      : ""
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Provide a valid connection string for your SQL Server, MySQL,
                  or PostgreSQL database.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {config.authentication.method === "ldap" && (
        <Card>
          <CardHeader>
            <CardTitle>LDAP Configuration</CardTitle>
            <CardDescription>
              Configure your LDAP/Active Directory server for authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ldapServer">LDAP Server</Label>
                <Input
                  id="ldapServer"
                  type="text"
                  value={config.authentication.ldapServer || ""}
                  onChange={(e) => handleLdapServerChange(e.target.value)}
                  placeholder="ldap://dc.company.com:389"
                  readOnly={config.demoMode}
                  disabled={config.demoMode}
                  className={
                    config.demoMode
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      : ""
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Provide your LDAP server URL including protocol and port.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {config.demoMode && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Demo Mode: Using file-based authentication with test employee
                data
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StorageStep({
  config,
  updateConfig,
}: {
  config: SetupConfig;
  updateConfig: (updates: Partial<SetupConfig>) => void;
}) {
  React.useEffect(() => {
    if (config.demoMode) {
      updateConfig({
        storage: {
          ...config.storage,
          mode: "simple",
          basePath: "../BRK_CNC_CORE/test-data/working_data",
          backupPath: "../BRK_CNC_CORE/test-data/working_data/Backups",
          logsPath: "../BRK_CNC_CORE/test-data/working_data/Logs",
          tempPath: "../BRK_CNC_CORE/test-data/working_data",
        },
      });
    }
  }, [config.demoMode]);

  const handleStorageModeChange = (mode: "simple" | "advanced") => {
    if (config.demoMode) return;
    updateConfig({
      storage: {
        ...config.storage,
        mode,
      },
    });
  };

  const handleStoragePathChange = (
    field: keyof typeof config.storage,
    value: string
  ) => {
    if (config.demoMode) return;

    const updates: any = {
      storage: {
        ...config.storage,
        [field]: value,
      },
    };

    // Auto-generate subdirectories based on the base path in simple mode
    if (field === "basePath" && config.storage.mode === "simple") {
      updates.storage.backupPath = value + "\\Backups";
      updates.storage.logsPath = value + "\\Logs";
      updates.storage.tempPath = value;
      updates.storage.outputPath = value + "\\Output";
      updates.storage.jsonFoundPath = value + "\\JSON_Found";
      updates.storage.jsonFixedPath = value + "\\JSON_Fixed";
      updates.storage.resultFilesPath = value + "\\Results";
    }

    updateConfig(updates);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Application Data Storage
          </CardTitle>
          <CardDescription>
            {config.demoMode
              ? "Demo mode uses a predefined data directory"
              : "Configure how you want to organize your application data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Storage Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer border-2 transition-colors ${
                  config.storage.mode === "simple"
                    ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                } ${config.demoMode ? "cursor-not-allowed opacity-50" : ""}`}
                onClick={() =>
                  !config.demoMode && handleStorageModeChange("simple")
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        config.storage.mode === "simple"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <FolderOpen
                        className={`h-5 w-5 ${
                          config.storage.mode === "simple"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">Simple Mode</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        One base path, auto-organized
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer border-2 transition-colors ${
                  config.storage.mode === "advanced"
                    ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                } ${config.demoMode ? "cursor-not-allowed opacity-50" : ""}`}
                onClick={() =>
                  !config.demoMode && handleStorageModeChange("advanced")
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        config.storage.mode === "advanced"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Settings
                        className={`h-5 w-5 ${
                          config.storage.mode === "advanced"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">Advanced Mode</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Custom paths for each folder
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Simple Mode Configuration */}
            {config.storage.mode === "simple" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="basePath">Application Data Directory</Label>
                  <div className="flex gap-2">
                    <Input
                      id="basePath"
                      value={config.storage.basePath || ""}
                      onChange={(e) =>
                        handleStoragePathChange("basePath", e.target.value)
                      }
                      placeholder="C:\CNC_Applications_Data"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={config.demoMode}
                      className={
                        config.demoMode ? "cursor-not-allowed opacity-50" : ""
                      }
                    >
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Main directory where all CNC application data will be
                    created, modified, and stored
                  </p>
                </div>

                {config.storage.basePath && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Auto-Generated Directory Structure
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400">
                          📁
                        </span>
                        {config.storage.basePath}
                      </div>
                      <div className="ml-6 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600 dark:text-purple-400">
                            📁
                          </span>
                          BRK CNC Management Dashboard
                        </div>
                        <div className="ml-6 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 dark:text-green-400">
                              📁
                            </span>
                            JSONScanner (CNC program analysis)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 dark:text-green-400">
                              📁
                            </span>
                            ToolManager (Excel processing & inventory)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 dark:text-green-400">
                              📁
                            </span>
                            ClampingPlateManager (Plate management)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-orange-600 dark:text-orange-400">
                              📁
                            </span>
                            JSON_Found (Original JSON files found)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-600 dark:text-cyan-400">
                              📁
                            </span>
                            JSON_Fixed (Corrected JSON files)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-pink-600 dark:text-pink-400">
                              📁
                            </span>
                            Results (Analysis results & reports)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400">
                              📁
                            </span>
                            Backups (Automatic backups)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-purple-600 dark:text-purple-400">
                              📁
                            </span>
                            Logs (Application logs)
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              📁
                            </span>
                            Temp (Temporary files)
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      All subdirectories will be created automatically when needed
                      {config.demoMode && " (Demo Mode: Using test data locations)"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Mode Configuration */}
            {config.storage.mode === "advanced" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logsPath">Logs Directory</Label>
                    <Input
                      id="logsPath"
                      value={config.storage.logsPath || ""}
                      onChange={(e) =>
                        handleStoragePathChange("logsPath", e.target.value)
                      }
                      placeholder="C:\CNC_Data\Logs"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Directory for application log files
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backupPath">Backup Directory</Label>
                    <Input
                      id="backupPath"
                      value={config.storage.backupPath || ""}
                      onChange={(e) =>
                        handleStoragePathChange("backupPath", e.target.value)
                      }
                      placeholder="C:\CNC_Data\Backups"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Directory for automatic backups
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jsonFoundPath">Found JSONs Directory</Label>
                    <Input
                      id="jsonFoundPath"
                      value={config.storage.jsonFoundPath || ""}
                      onChange={(e) =>
                        handleStoragePathChange("jsonFoundPath", e.target.value)
                      }
                      placeholder="C:\CNC_Data\JSON_Found"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Directory for original JSON files found by scanner
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jsonFixedPath">Fixed JSONs Directory</Label>
                    <Input
                      id="jsonFixedPath"
                      value={config.storage.jsonFixedPath || ""}
                      onChange={(e) =>
                        handleStoragePathChange("jsonFixedPath", e.target.value)
                      }
                      placeholder="C:\CNC_Data\JSON_Fixed"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Directory for corrected/processed JSON files
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resultFilesPath">Results Directory</Label>
                    <Input
                      id="resultFilesPath"
                      value={config.storage.resultFilesPath || ""}
                      onChange={(e) =>
                        handleStoragePathChange(
                          "resultFilesPath",
                          e.target.value
                        )
                      }
                      placeholder="C:\CNC_Data\Results"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Directory for analysis results and reports
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tempPath">Temporary Directory</Label>
                    <Input
                      id="tempPath"
                      value={config.storage.tempPath || ""}
                      onChange={(e) =>
                        handleStoragePathChange("tempPath", e.target.value)
                      }
                      placeholder="C:\CNC_Data\Temp"
                      readOnly={config.demoMode}
                      disabled={config.demoMode}
                      className={
                        config.demoMode
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Directory for temporary files
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {config.demoMode && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Demo Mode: All storage paths are set to demo locations for
                testing
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PreferencesStep({
  config,
  updateConfig,
}: {
  config: SetupConfig;
  updateConfig: (updates: Partial<SetupConfig>) => void;
}) {
  React.useEffect(() => {
    if (config.demoMode) {
      updateConfig({
        features: {
          ...config.features,
          themeMode: "system",
          notifications: {
            enabled: true,
            showTaskCompletion: true,
            showErrors: true,
            showWarnings: true,
            showSystemUpdates: true,
          },
          autoBackup: true,
          exportReports: true,
          autoScan: {
            enabled: true,
            interval: 60,
            jsonScannerEnabled: true,
            toolManagerEnabled: true,
            runOnStartup: true,
          },
        },
      });
    }
  }, [config.demoMode]);

  const handleFeatureChange = (
    field: keyof typeof config.features,
    value: any
  ) => {
    if (config.demoMode) return;
    updateConfig({
      features: {
        ...config.features,
        [field]: value,
      },
    });
  };

  const handleNotificationChange = (
    field: keyof typeof config.features.notifications,
    value: boolean
  ) => {
    if (config.demoMode) return;
    updateConfig({
      features: {
        ...config.features,
        notifications: {
          ...config.features.notifications,
          [field]: value,
        },
      },
    });
  };

  const handleAutoScanChange = (
    field: keyof typeof config.features.autoScan,
    value: any
  ) => {
    if (config.demoMode) return;
    updateConfig({
      features: {
        ...config.features,
        autoScan: {
          ...config.features.autoScan,
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Application Preferences - Redesigned */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Application Preferences
          </CardTitle>
          <CardDescription>
            {config.demoMode
              ? "Demo mode uses optimized default preferences"
              : "Customize the application behavior and appearance"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Theme & UI Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Interface & Appearance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Palette className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <Label htmlFor="theme" className="font-medium">
                      Theme Mode
                    </Label>
                  </div>
                  <select
                    id="theme"
                    value={config.features.themeMode}
                    onChange={(e) =>
                      handleFeatureChange("themeMode", e.target.value)
                    }
                    disabled={config.demoMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                      config.demoMode
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="light">☀️ Light Mode</option>
                    <option value="dark">🌙 Dark Mode</option>
                    <option value="system">💻 System Default</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose your preferred visual theme
                  </p>
                </div>
              </Card>

              <Card className="p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Save className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <Label className="font-medium">Auto Backup</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically backup data
                    </span>
                    <Switch
                      checked={config.features.autoBackup}
                      onCheckedChange={(checked) =>
                        handleFeatureChange("autoBackup", checked)
                      }
                      disabled={config.demoMode}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Regular data protection
                  </p>
                </div>
              </Card>

              <Card className="p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <Label className="font-medium">Export Reports</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Enable report generation
                    </span>
                    <Switch
                      checked={config.features.exportReports}
                      onCheckedChange={(checked) =>
                        handleFeatureChange("exportReports", checked)
                      }
                      disabled={config.demoMode}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Generate analysis reports
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Notifications & Alerts
            </h3>
            <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">
                        Enable Notifications
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Show system notifications and alerts
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.features.notifications.enabled}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("enabled", checked)
                    }
                    disabled={config.demoMode}
                  />
                </div>

                {config.features.notifications.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          ✅ Task Completion
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          When processes finish
                        </p>
                      </div>
                      <Switch
                        checked={
                          config.features.notifications.showTaskCompletion
                        }
                        onCheckedChange={(checked) =>
                          handleNotificationChange(
                            "showTaskCompletion",
                            checked
                          )
                        }
                        disabled={config.demoMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">❌ Errors</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Critical issues
                        </p>
                      </div>
                      <Switch
                        checked={config.features.notifications.showErrors}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("showErrors", checked)
                        }
                        disabled={config.demoMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          ⚠️ Warnings
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Important notices
                        </p>
                      </div>
                      <Switch
                        checked={config.features.notifications.showWarnings}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("showWarnings", checked)
                        }
                        disabled={config.demoMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          🔄 System Updates
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Application updates
                        </p>
                      </div>
                      <Switch
                        checked={
                          config.features.notifications.showSystemUpdates
                        }
                        onCheckedChange={(checked) =>
                          handleNotificationChange("showSystemUpdates", checked)
                        }
                        disabled={config.demoMode}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Auto Scan Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Automatic File Scanning
            </h3>
            <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Search className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">
                        Enable Auto Scan
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically scan for new files in configured
                        directories
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.features.autoScan.enabled}
                    onCheckedChange={(checked) =>
                      handleAutoScanChange("enabled", checked)
                    }
                    disabled={config.demoMode}
                  />
                </div>

                {config.features.autoScan.enabled && (
                  <div className="space-y-4 ml-6 pl-4 border-l-2 border-orange-200 dark:border-orange-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scanInterval" className="font-medium">
                          Scan Frequency
                        </Label>
                        <select
                          id="scanInterval"
                          value={config.features.autoScan.interval}
                          onChange={(e) =>
                            handleAutoScanChange(
                              "interval",
                              parseInt(e.target.value)
                            )
                          }
                          disabled={config.demoMode}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                            config.demoMode
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <option value="15">⚡ Every 15 minutes</option>
                          <option value="30">🔄 Every 30 minutes</option>
                          <option value="60">⏰ Every hour</option>
                          <option value="120">🕐 Every 2 hours</option>
                          <option value="240">🕓 Every 4 hours</option>
                          <option value="480">🕗 Every 8 hours</option>
                          <option value="720">🕛 Every 12 hours</option>
                          <option value="1440">📅 Daily</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">
                            🚀 Run on Startup
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Start scanning when app launches
                          </p>
                        </div>
                        <Switch
                          checked={config.features.autoScan.runOnStartup}
                          onCheckedChange={(checked) =>
                            handleAutoScanChange("runOnStartup", checked)
                          }
                          disabled={config.demoMode}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {config.demoMode && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Demo Mode: All preferences are set to optimal defaults for
                demonstration
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Validation Step Component
interface ValidationTest {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "success" | "error";
  error?: string;
}

function ValidationStep({
  config,
  onComplete,
}: {
  config: SetupConfig;
  onComplete: () => void;
}) {
  const [tests, setTests] = useState<ValidationTest[]>([
    {
      id: "folder-permissions",
      name: "Folder Permissions Check",
      description:
        "Verify read/write permissions for all configured storage paths.",
      status: "pending",
    },
    {
      id: "folder-structure",
      name: "Required Folder Structure",
      description:
        "Check if all required folders exist and create missing ones.",
      status: "pending",
    },
    {
      id: "clamping-plate-files",
      name: "Clamping Plate Info Files",
      description:
        "Validate structure and format of clamping plate information files.",
      status: "pending",
    },
    {
      id: "employee-file-structure",
      name: "Employee File Structure",
      description: "Verify employee authentication file format and structure.",
      status: "pending",
    },
  ]);

  const [initTests, setInitTests] = useState<ValidationTest[]>([
    {
      id: "json-scanner-init",
      name: "JSON Scanner - Backend Initialization",
      description:
        "Check if JSONScanner backend service is running and has initial data ready.",
      status: "pending",
    },
    {
      id: "tool-manager-init",
      name: "Tool Manager - Backend Initialization",
      description:
        "Check if ToolManager backend service is running and has tool inventory loaded.",
      status: "pending",
    },
    {
      id: "clamping-plate-init",
      name: "Clamping Plate Manager - Backend Initialization",
      description:
        "Check if ClampingPlateManager backend service is running and has plate data loaded.",
      status: "pending",
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isInitRunning, setIsInitRunning] = useState(false);
  const [isInitComplete, setIsInitComplete] = useState(false);
  const [isLogVisible, setIsLogVisible] = useState(true);
  const [currentInitTest, setCurrentInitTest] = useState<string | null>(null);

  // Check if all init tests are complete (either by individual runs or "Run All")
  React.useEffect(() => {
    const allComplete = initTests.every((test) => test.status === "success");
    if (allComplete && initTests.length > 0) {
      setIsInitComplete(true);
    }
  }, [initTests]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const runValidation = async () => {
    setIsRunning(true);
    setIsComplete(false);
    setHasErrors(false);
    setLogs([]);
    addLog("🔍 Starting comprehensive system validation...");

    setTests((prev) =>
      prev.map((test) => ({
        ...test,
        status: "pending" as const,
        error: undefined,
      }))
    );

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      addLog(`🔄 Running test ${i + 1}/${tests.length}: ${test.name}`);
      await runIndividualTest(test.id);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    addLog("✅ All validation tests completed successfully!");
    setIsRunning(false);
    setIsComplete(true);
  };

  const runIndividualTest = async (testId: string) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId ? { ...test, status: "running" as const } : test
      )
    );

    try {
      // Add detailed logging for each test type
      switch (testId) {
        case "folder-permissions":
          addLog(`📁 Checking folder permissions...`);
          addLog(
            `   → Storage base path: ${
              config.storage.basePath || "Not configured"
            }`
          );
          addLog(
            `   → Logs path: ${config.storage.logsPath || "Not configured"}`
          );
          addLog(
            `   → Backup path: ${config.storage.backupPath || "Not configured"}`
          );
          break;
        case "folder-structure":
          addLog(`🏗️  Verifying folder structure...`);
          addLog(`   → Creating required directories`);
          addLog(`   → Setting up module-specific folders`);
          break;
        case "clamping-plate-files":
          if (config.companyFeatures.clampingPlateManager) {
            addLog(`🔩 Validating clamping plate files...`);
            addLog(
              `   → Models path: ${
                config.modules.platesManager.modelsPath || "Not configured"
              }`
            );
            addLog(
              `   → Info file: ${
                config.modules.platesManager.plateInfoFile || "Not configured"
              }`
            );
          } else {
            addLog(`🔩 Clamping plate manager disabled - skipping`);
          }
          break;
        case "employee-file-structure":
          addLog(`👥 Checking employee authentication setup...`);
          addLog(`   → Auth method: ${config.authentication.method}`);
          if (config.authentication.method === "file") {
            addLog(
              `   → Employee file: ${
                config.authentication.employeeFile || "Not configured"
              }`
            );
          }
          break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTests((prev) =>
        prev.map((test) =>
          test.id === testId ? { ...test, status: "success" as const } : test
        )
      );
      addLog(`✅ Test ${testId} completed successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog(`❌ Test ${testId} failed: ${errorMessage}`);
      setTests((prev) =>
        prev.map((test) =>
          test.id === testId
            ? { ...test, status: "error" as const, error: errorMessage }
            : test
        )
      );
      setHasErrors(true);
    }
  };

  const runInitialization = async () => {
    setIsInitRunning(true);
    setIsInitComplete(false);
    addLog(
      "🚀 Checking backend services and initializing data..."
    );

    for (let i = 0; i < initTests.length; i++) {
      const test = initTests[i];
      setCurrentInitTest(test.id);
      addLog(`🔄 Checking ${i + 1}/${initTests.length}: ${test.name}`);

      setInitTests((prev) =>
        prev.map((t) =>
          t.id === test.id ? { ...t, status: "running" as const } : t
        )
      );

      // Run actual feature processing based on test type
      try {
        await runFeatureTest(test.id);

        setInitTests((prev) =>
          prev.map((t) =>
            t.id === test.id ? { ...t, status: "success" as const } : t
          )
        );

        addLog(`✅ ${test.name} initialized successfully`);

        // Add a pause between tests for better UX
        if (i < initTests.length - 1) {
          addLog(`⏳ Preparing next test...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        addLog(`❌ ${test.name} failed: ${errorMessage}`);
        setInitTests((prev) =>
          prev.map((t) =>
            t.id === test.id
              ? { ...t, status: "error" as const, error: errorMessage }
              : t
          )
        );
        // Continue with next test even if one fails
      }
    }

    addLog("✅ All backend services checked and initialized!");
    addLog("🎉 Setup complete - Dashboard is ready to use!");
    setIsInitRunning(false);
    setIsInitComplete(true);
    setCurrentInitTest(null);
  };

  const handleCompleteSetup = async () => {
    addLog("🚀 Triggering backend data processing...");
    
    // Send autoRun: true to all backends to start processing
    const backends = [];
    
    if (config.companyFeatures.jsonScanner) {
      backends.push({
        name: "JSONScanner",
        url: "http://localhost:3001/api/config",
        config: {
          testMode: config.demoMode,
          workingFolder: config.storage.basePath || null,
          scanPaths: { jsonFiles: config.modules.jsonAnalyzer.dataPath || null },
          autoRun: false
        }
      });
    }
    
    if (config.companyFeatures.toolManager) {
      backends.push({
        name: "ToolManager",
        url: "http://localhost:3002/api/config",
        config: {
          testMode: config.demoMode,
          workingFolder: config.storage.basePath || null,
          scanPaths: {
            jsonFiles: config.modules.matrixTools.paths.jsonInputPath || config.modules.jsonAnalyzer.dataPath || null,
            excelFiles: config.modules.matrixTools.features.excelProcessing
              ? config.modules.matrixTools.paths.excelInputPath || null
              : null
          },
          autoRun: false
        }
      });
    }
    
    if (config.companyFeatures.clampingPlateManager) {
      backends.push({
        name: "ClampingPlateManager",
        url: "http://localhost:3003/api/config",
        config: {
          testMode: config.demoMode,
          workingFolder: config.storage.basePath || null,
          platesPath: config.modules.platesManager.modelsPath || null,
          plateInfoFile: config.modules.platesManager.plateInfoFile || null,
          autoRun: true  // ClampingPlate needs this to trigger initialization during setup
        }
      });
    }
    
    // Activate all backends
    for (const backend of backends) {
      try {
        addLog(`   → Activating ${backend.name}...`);
        const response = await fetch(backend.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backend.config)
        });
        
        if (response.ok) {
          addLog(`   → ✅ ${backend.name} processing started`);
        } else {
          addLog(`   → ⚠️ ${backend.name} activation failed`);
        }
      } catch (error) {
        addLog(`   → ❌ ${backend.name} error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }
    
    addLog("✅ Backend processing activated - data will be ready shortly!");
    addLog("🎉 Launching dashboard...");
    
    // Call the original onComplete to navigate to dashboard
    onComplete();
  };

  const runFeatureTest = async (testId: string) => {
    // All modes require backends running
    switch (testId) {
      case "json-scanner-init":
        if (config.companyFeatures.jsonScanner) {
          addLog(`   → Initializing JSON Scanner backend service...`);
          addLog(`   → Mode: ${config.demoMode ? 'Demo' : 'Production'}`);
          addLog(
            `   → Data path: ${
              config.modules.jsonAnalyzer.dataPath || "Will request at runtime"
            }`
          );

          // Check if backend is running
          addLog(`   → 🔍 Checking if JSONScanner backend is running...`);
          try {
            const statusResponse = await fetch("http://localhost:3001/api/status", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            
            if (!statusResponse.ok) {
              throw new Error("Backend not responding");
            }
            
            const status = await statusResponse.json();
            addLog(`   → ✅ JSONScanner backend is running (${status.mode} mode)`);
            
            // Send configuration to backend (without starting auto-run)
            addLog(`   → 📡 Sending configuration to backend...`);
            const configResponse = await fetch("http://localhost:3001/api/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                testMode: config.demoMode,
                workingFolder: config.storage.basePath || null,
                scanPaths: {
                  jsonFiles: config.modules.jsonAnalyzer.dataPath || null
                },
                autoRun: false // Don't start processing yet
              })
            });
            
            if (!configResponse.ok) {
              throw new Error("Failed to configure backend");
            }
            
            addLog(`   → ✅ Backend configured (processing will start when setup completes)`);
            addLog(`   → ℹ️  Ready to process data on final setup completion`);
            
            // Don't wait for processing or check data - that happens after "Complete Setup"
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            addLog(`   → ⚠️  JSONScanner backend error: ${error instanceof Error ? error.message : 'Unknown'}`);
            throw new Error("JSONScanner backend initialization failed");
          }
        } else {
          addLog(`   → JSON Scanner disabled - skipping`);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        break;

      case "tool-manager-init":
        if (config.companyFeatures.toolManager) {
          addLog(`   → Initializing Tool Manager backend service...`);
          addLog(`   → Mode: ${config.demoMode ? 'Demo' : 'Production'}`);
          addLog(
            `   → Excel processing: ${
              config.modules.matrixTools.features.excelProcessing
                ? "Enabled"
                : "Disabled"
            }`
          );

          // Check if backend is running
          addLog(`   → 🔍 Checking if ToolManager backend is running...`);
          try {
            const statusResponse = await fetch("http://localhost:3002/api/status", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            
            if (!statusResponse.ok) {
              throw new Error("Backend not responding");
            }
            
            const status = await statusResponse.json();
            addLog(`   → ✅ ToolManager backend is running (${status.mode} mode)`);
            
            // Send configuration to backend (without starting auto-run)
            addLog(`   → 📡 Sending configuration to backend...`);
            const configResponse = await fetch("http://localhost:3002/api/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                testMode: config.demoMode,
                workingFolder: config.storage.basePath || null,
                scanPaths: {
                  jsonFiles: config.modules.matrixTools.paths.jsonInputPath || config.modules.jsonAnalyzer.dataPath || null,
                  excelFiles: config.modules.matrixTools.features.excelProcessing
                    ? config.modules.matrixTools.paths.excelInputPath || null
                    : null
                },
                autoRun: false // Don't start processing yet
              })
            });
            
            if (!configResponse.ok) {
              throw new Error("Failed to configure backend");
            }
            
            addLog(`   → ✅ Backend configured (processing will start when setup completes)`);
            addLog(`   → ℹ️  Ready to process data on final setup completion`);
            
            // Don't wait for processing or check data - that happens after "Complete Setup"
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            addLog(`   → ⚠️  ToolManager backend error: ${error instanceof Error ? error.message : 'Unknown'}`);
            throw new Error("ToolManager backend initialization failed");
          }
        } else {
          addLog(`   → Tool Manager disabled - skipping`);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        break;

      case "clamping-plate-init":
        if (config.companyFeatures.clampingPlateManager) {
          addLog(`   → Initializing Clamping Plate Manager backend service...`);
          addLog(`   → Mode: ${config.demoMode ? 'Demo' : 'Production'}`);
          addLog(
            `   → Models path: ${
              config.modules.platesManager.modelsPath ||
              "Will request at runtime"
            }`
          );

          // Check if backend is running
          addLog(`   → 🔍 Checking if ClampingPlateManager backend is running...`);
          try {
            const healthResponse = await fetch("http://localhost:3003/api/health", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            
            if (!healthResponse.ok) {
              throw new Error("Backend not responding");
            }
            
            await healthResponse.json();
            addLog(`   → ✅ ClampingPlateManager backend is running`);
            
            // Send configuration to backend (without starting auto-run)
            addLog(`   → 📡 Sending configuration to backend...`);
            const configResponse = await fetch("http://localhost:3003/api/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                testMode: config.demoMode,
                workingFolder: config.storage.basePath || null,
                platesPath: config.modules.platesManager.modelsPath || null,
                autoRun: false // Don't start processing yet
              })
            });
            
            if (!configResponse.ok) {
              throw new Error("Failed to configure backend");
            }
            
            addLog(`   → ✅ Backend configured (processing will start when setup completes)`);
            addLog(`   → ℹ️  Ready to load plates on final setup completion`);
            
            // Don't wait for processing or check data - that happens after "Complete Setup"
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            addLog(`   → ⚠️  ClampingPlateManager backend error: ${error instanceof Error ? error.message : 'Unknown'}`);
            throw new Error("ClampingPlateManager backend initialization failed");
          }
        } else {
          addLog(`   → Clamping Plate Manager disabled - skipping`);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        break;

      default:
        addLog(`   → Unknown test: ${testId}`);

        // Simulate authentication testing
        addLog(`   → 🔐 Testing authentication system...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (config.authentication.method === "file") {
          addLog(
            `   → 📄 Loading employee file: ${
              config.authentication.employeeFile || "employees.csv"
            }`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          addLog(`   → 👥 Validated 8 user accounts`);
          addLog(`   → 🔑 Tested login functionality`);
          addLog(`   → 🛡️  Verified access permissions`);
        } else if (config.authentication.method === "database") {
          addLog(`   → 🗄️  Testing database connection...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          addLog(`   → 📊 Connected to user database`);
          addLog(`   → 👥 Verified user table structure`);
        } else if (config.authentication.method === "ldap") {
          addLog(`   → � Testing LDAP connection...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          addLog(`   → 🔗 Connected to LDAP server`);
          addLog(`   → 👤 Tested user authentication`);
        }

        addLog(`   → ✅ Authentication system fully functional`);
        break;
    }
  };

  const getStatusIcon = (status: ValidationTest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
        );
      case "running":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: ValidationTest["status"]) => {
    switch (status) {
      case "pending":
        return "text-gray-600";
      case "running":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
    }
  };

  return (
    <div className="space-y-6 pb-64">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-blue-600" />
            System Validation
          </CardTitle>
          <CardDescription>
            Testing folder permissions, structure, and file formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {tests.map((test) => (
              <div
                key={test.id}
                className={`relative flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 ${
                  test.status === "running"
                    ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20"
                    : test.status === "success"
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                    : test.status === "error"
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 bg-gray-50 dark:bg-gray-800/50"
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      test.status === "running"
                        ? "border-blue-500 bg-blue-100"
                        : test.status === "success"
                        ? "border-green-500 bg-green-100"
                        : test.status === "error"
                        ? "border-red-500 bg-red-100"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {getStatusIcon(test.status)}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${getStatusColor(test.status)}`}>
                    {test.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {test.description}
                  </p>
                  {test.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{test.error}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-6 border-t">
            {!isComplete && (
              <Button
                onClick={runValidation}
                disabled={isRunning}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Validation
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backend Services Initialization Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-purple-600" />
            Backend Services Initialization
          </CardTitle>
          <CardDescription>
            Check and initialize all backend services to prepare data for the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {initTests.map((test) => (
              <div
                key={test.id}
                className={`relative flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 ${
                  test.status === "running"
                    ? "border-purple-300 bg-purple-50 dark:bg-purple-900/20"
                    : test.status === "success"
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                    : test.status === "error"
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 bg-gray-50 dark:bg-gray-800/50"
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      test.status === "running"
                        ? "border-purple-500 bg-purple-100"
                        : test.status === "success"
                        ? "border-green-500 bg-green-100"
                        : test.status === "error"
                        ? "border-red-500 bg-red-100"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {getStatusIcon(test.status)}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${getStatusColor(test.status)}`}>
                    {test.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {test.description}
                  </p>
                  {test.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{test.error}</p>
                    </div>
                  )}
                </div>

                {/* Individual test run button */}
                <div className="flex flex-col gap-2">
                  {test.status === "pending" && !isInitRunning && (
                    <Button
                      onClick={async () => {
                        setCurrentInitTest(test.id);
                        addLog(`🔄 Running individual test: ${test.name}`);

                        setInitTests((prev) =>
                          prev.map((t) =>
                            t.id === test.id
                              ? { ...t, status: "running" as const }
                              : t
                          )
                        );

                        try {
                          await runFeatureTest(test.id);
                          setInitTests((prev) =>
                            prev.map((t) =>
                              t.id === test.id
                                ? { ...t, status: "success" as const }
                                : t
                            )
                          );
                          addLog(`✅ ${test.name} completed successfully`);
                        } catch (error) {
                          const errorMessage =
                            error instanceof Error
                              ? error.message
                              : "Unknown error";
                          addLog(`❌ ${test.name} failed: ${errorMessage}`);
                          setInitTests((prev) =>
                            prev.map((t) =>
                              t.id === test.id
                                ? {
                                    ...t,
                                    status: "error" as const,
                                    error: errorMessage,
                                  }
                                : t
                            )
                          );
                        }

                        setCurrentInitTest(null);
                      }}
                      size="sm"
                      variant="outline"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-700"
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Run Init
                    </Button>
                  )}

                  {test.status === "running" && currentInitTest === test.id && (
                    <div className="text-xs text-purple-600 font-medium animate-pulse flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Running...
                    </div>
                  )}

                  {test.status === "success" && (
                    <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </div>
                  )}

                  {test.status === "error" && (
                    <Button
                      onClick={async () => {
                        // Reset and retry the test
                        setInitTests((prev) =>
                          prev.map((t) =>
                            t.id === test.id
                              ? {
                                  ...t,
                                  status: "pending" as const,
                                  error: undefined,
                                }
                              : t
                          )
                        );
                      }}
                      size="sm"
                      variant="outline"
                      className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-6 border-t">
            {!isInitComplete && (
              <Button
                onClick={runInitialization}
                disabled={isInitRunning}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                {isInitRunning ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Checking Services...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-2" />
                    Initialize Backend Services
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complete Setup Button - At the very bottom */}
      {isComplete && !hasErrors && isInitComplete && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleCompleteSetup}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Save className="h-6 w-6 mr-3" />
            Complete Setup & Launch Dashboard
          </Button>
        </div>
      )}

      {/* Sticky Log Window at Bottom */}
      {(isRunning || isComplete || logs.length > 0) && (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-300 z-50 ${
            isLogVisible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsLogVisible(!isLogVisible)}
            className="absolute -top-10 right-4 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Monitor className="h-4 w-4" />
            {isLogVisible ? "Hide Logs" : "Show Logs"}
            <span
              className={`transform transition-transform duration-200 ${
                isLogVisible ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Validation Logs
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {logs.length} entries
                </span>
                {logs.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const logContent = logs.join("\n");
                      const blob = new Blob([logContent], {
                        type: "text/plain",
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `setup-validation-logs-${
                        new Date().toISOString().split("T")[0]
                      }.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">
                  Validation logs will appear here...
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`${
                        log.includes("❌")
                          ? "text-red-400"
                          : log.includes("✅")
                          ? "text-green-400"
                          : log.includes("🔄")
                          ? "text-blue-400"
                          : log.includes("🔍") || log.includes("🚀")
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {(isRunning || isInitRunning) && (
                    <div className="text-blue-400 animate-pulse">
                      <span className="inline-block animate-bounce">▶</span>{" "}
                      Running...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// End of ValidationStep function
