import { useState, useEffect } from "react";
// SetupProcessor import removed - demo mode handled by SetupWizard paths

export interface SetupConfig {
  isConfigured: boolean;
  demoMode: boolean;
  companyName: string;
  companyLogo?: string;
  companyFeatures: {
    jsonScanner: boolean;
    toolManager: boolean;
    clampingPlateManager: boolean;
  };
  modules: {
    jsonScanner: {
      autoMode: boolean;
      scanPath: string;
    };
    jsonAnalyzer: {
      autoMode: boolean;
      dataPath: string;
    };
    toolManager: {
      autoMode: boolean;
      excelPath: string;
      inventoryFile: string;
      // Legacy properties for backward compatibility - remove after Dashboard refactor
      mode?: "auto" | "manual";
      dataPath?: string;
      paths?: {
        excelInputPath?: string;
        jsonInputPath?: string;
      };
      features?: {
        excelProcessing?: boolean;
        jsonScanning?: boolean;
      };
    };
    clampingPlateManager: {
      autoMode: boolean;
      modelsPath?: string;
      plateInfoFile?: string;
      // Legacy property for backward compatibility - remove after Dashboard refactor
      mode?: "auto" | "manual";
    };
  };
  authentication: {
    method: "file" | "database" | "ldap";
    employeeFile?: string;
    databaseConnection?: string;
    ldapServer?: string;
  };
  storage: {
    mode: "simple" | "advanced";
    basePath?: string;
    logsPath: string;
    backupPath: string;
    tempPath: string;
    outputPath: string;
    jsonFoundPath?: string;
    jsonFixedPath?: string;
    resultFilesPath?: string;
  };
  features: {
    themeMode: "light" | "dark" | "system";
    notifications: {
      enabled: boolean;
      showTaskCompletion: boolean;
      showErrors: boolean;
      showWarnings: boolean;
      showSystemUpdates: boolean;
    };
    autoBackup: boolean;
    exportReports: boolean;
    autoScan: {
      interval: number; // in minutes: 15, 30, 60, 120, 240 (4 hours), 480 (8 hours), 720 (12 hours), 1440 (daily)
      runOnStartup: boolean;
      services: {
        jsonScanner: boolean;
        toolManager: boolean;
        analyzer: boolean;
      };
    };
  };
}

const defaultConfig: SetupConfig = {
  isConfigured: false,
  demoMode: true, // Enable demo mode by default for easier testing
  companyName: "BRK Manufacturing",
  companyFeatures: {
    jsonScanner: true,
    toolManager: true,
    clampingPlateManager: true,
  },
  modules: {
    jsonScanner: {
      autoMode: false,
      scanPath: "",
    },
    jsonAnalyzer: {
      autoMode: false,
      dataPath: "",
    },
    toolManager: {
      autoMode: false,
      excelPath: "",
      inventoryFile: "",
    },
    clampingPlateManager: {
      autoMode: false,
      modelsPath: "",
      plateInfoFile: "",
    },
  },
  authentication: {
    method: "file",
    employeeFile: "",
  },
  storage: {
    mode: "simple",
    basePath: "",
    logsPath: "",
    backupPath: "",
    tempPath: "",
    outputPath: "",
    jsonFoundPath: "",
    jsonFixedPath: "",
    resultFilesPath: "",
  },
  features: {
    themeMode: "system",
    notifications: {
      enabled: true,
      showTaskCompletion: true,
      showErrors: true,
      showWarnings: true,
      showSystemUpdates: false,
    },
    autoBackup: true,
    exportReports: true,
    autoScan: {
      interval: 60, // 1 hour default
      runOnStartup: false,
      services: {
        jsonScanner: true,
        toolManager: true,
        analyzer: true,
      },
    },
  },
};

export function useSetupConfig() {
  const [config, setConfig] = useState<SetupConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // First check if setup wizard was ever completed
      const setupCompleted = localStorage.getItem('setupWizardCompleted');
      
      if (!setupCompleted) {
        console.log("🎯 Setup wizard never completed - showing wizard");
        setConfig(defaultConfig);
        setIsLoading(false);
        return;
      }

      // Setup was completed, load config from backend
      const response = await fetch('/api/config');
      
      if (response.ok) {
        const systemConfig = await response.json();
        console.log("✅ Config loaded from backend filesystem");
        setConfig({ ...defaultConfig, ...systemConfig });
      } else if (response.status === 404) {
        console.log("⚠️ Config file missing but setup was completed - showing wizard to reconfigure");
        setConfig(defaultConfig);
      } else {
        console.error("❌ Failed to load config:", response.status);
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error("❌ Backend unavailable:", error);
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: SetupConfig) => {
    try {
      console.log("💾 Saving configuration and processing setup...");

      const configWithStatus = {
        ...newConfig,
        isConfigured: true,
        configVersion: "1.0.0"
      };

      // Setup processing removed - demo mode handled by SetupWizard paths
      console.log("✅ Setup configuration saved");

      // Save to backend filesystem
      const saveResponse = await fetch('/api/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configWithStatus)
      });

      if (saveResponse.ok) {
        console.log("✅ Config saved to backend filesystem");
        
        // Mark setup wizard as completed
        localStorage.setItem('setupWizardCompleted', 'true');
        console.log("✅ Setup wizard completion flag set");
        
        setConfig(configWithStatus);
        return true;
      } else {
        console.error("❌ Failed to save config to backend");
        return false;
      }
    } catch (error) {
      console.error("Failed to save configuration:", error);
      return false;
    }
  };

  const resetConfig = async () => {
    try {
      const response = await fetch('/api/config/reset', { method: 'DELETE' });
      
      if (response.ok) {
        console.log("✅ Config reset on backend");
        
        // Remove setup wizard completion flag
        localStorage.removeItem('setupWizardCompleted');
        console.log("✅ Setup wizard completion flag removed");
        
        setConfig(defaultConfig);
        return true;
      } else {
        console.error("❌ Failed to reset config");
        return false;
      }
    } catch (error) {
      console.error("Failed to reset configuration:", error);
      return false;
    }
  };

  return {
    config,
    isLoading,
    saveConfig,
    resetConfig,
    isFirstTimeSetup: !config.isConfigured,
  };
}
