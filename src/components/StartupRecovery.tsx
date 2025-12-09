import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Play, Settings, Activity } from "lucide-react";
import { StartupRecoveryService, StartupRecoveryResult } from "../services/StartupRecoveryService";
import { SetupConfig } from "../hooks/useSetupConfig";

interface StartupRecoveryProps {
  config: SetupConfig;
  onContinue: () => void;
  onOpenSetup: () => void;
}

export default function StartupRecovery({ config, onContinue, onOpenSetup }: StartupRecoveryProps) {
  const [recoveryResult, setRecoveryResult] = useState<StartupRecoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingServices, setIsStartingServices] = useState(false);

  useEffect(() => {
    performRecoveryCheck();
  }, []);

  const performRecoveryCheck = async () => {
    setIsLoading(true);
    try {
      const service = new StartupRecoveryService(config);
      const result = await service.performStartupCheck();
      setRecoveryResult(result);
    } catch (error) {
      console.error("Recovery check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case "start-all-services":
        setIsStartingServices(true);
        // In a real implementation, this would trigger the VS Code workspace task
        // or provide instructions to the user
        setTimeout(() => {
          setIsStartingServices(false);
          performRecoveryCheck(); // Recheck after starting services
        }, 3000);
        break;
      case "verify-paths":
        // Could trigger path validation or show path configuration
        break;
      case "open-setup":
        onOpenSetup();
        break;
      case "system-status":
        // Could open a detailed system status modal
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (!recoveryResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to check system status</p>
          <button
            onClick={performRecoveryCheck}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const allServicesRunning = Object.values(recoveryResult.servicesRunning).every(s => s);
  const canContinue = recoveryResult.configValid && allServicesRunning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">
            Your CNC Management System for <strong>{config.companyName}</strong> is configured.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Services Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Play className="h-5 w-5 mr-2 text-blue-600" />
              Backend Services
            </h3>
            
            <div className="space-y-3">
              {config.modules.jsonScanner && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">🔍 JSONScanner</span>
                  <div className="flex items-center">
                    {recoveryResult.servicesRunning.jsonScanner ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="ml-2 text-xs text-gray-500">
                      {recoveryResult.servicesRunning.jsonScanner ? "Running" : "Stopped"}
                    </span>
                  </div>
                </div>
              )}
              
              {config.modules.toolManager && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">🔧 ToolManager</span>
                  <div className="flex items-center">
                    {recoveryResult.servicesRunning.toolManager ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="ml-2 text-xs text-gray-500">
                      {recoveryResult.servicesRunning.toolManager ? "Running" : "Stopped"}
                    </span>
                  </div>
                </div>
              )}
              
              {config.modules.clampingPlateManager && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">📋 ClampingPlateManager</span>
                  <div className="flex items-center">
                    {recoveryResult.servicesRunning.clampingPlateManager ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="ml-2 text-xs text-gray-500">
                      {recoveryResult.servicesRunning.clampingPlateManager ? "Running" : "Stopped"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Configuration
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Setup Complete</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Base Path</span>
                <div className="flex items-center">
                  {recoveryResult.pathsValid.dataPath ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                📁 {config.storage.basePath || "Not configured"}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recoveryResult.recommendations.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Action Required</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {recoveryResult.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {recoveryResult.quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              disabled={isStartingServices && action.action === "start-all-services"}
              className="flex flex-col items-center p-4 bg-white rounded-lg border hover:border-blue-300 hover:shadow-md transition-all disabled:opacity-50"
            >
              <span className="text-2xl mb-2">{action.icon}</span>
              <span className="text-sm font-medium text-center">
                {isStartingServices && action.action === "start-all-services" ? "Starting..." : action.label}
              </span>
            </button>
          ))}
        </div>

        {/* VS Code Workspace Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Quick Start with VS Code</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Recommended:</strong> Use the VS Code workspace for the best experience:
            </p>
            <div className="bg-white p-3 rounded border font-mono text-xs">
              code BRK-CNC-Management-Dashboard.code-workspace
            </div>
            <p>Then use the task: <strong>"🚀 Start All Services"</strong></p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              canContinue
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {canContinue ? "Continue to Dashboard" : "Start Services First"}
          </button>
          
          {!canContinue && (
            <p className="text-sm text-gray-500 mt-2">
              Please start the required services before continuing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}