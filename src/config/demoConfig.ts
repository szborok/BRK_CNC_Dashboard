/**
 * Demo Mode Configuration
 *
 * When running in demo mode (npm run demo), the setup wizard will auto-populate
 * with test data paths from the backend modules.
 */

import { SetupConfig } from "../hooks/useSetupConfig";

// @ts-ignore - Vite env variables
export const isDemoMode = import.meta.env?.VITE_DEMO_MODE === "true";

export const demoConfig: Partial<SetupConfig> = {
  demoMode: true,
  companyName: "BRK Manufacturing (Demo)",
  companyLogo: "",
  companyFeatures: {
    jsonScanner: true,
    toolManager: true,
    clampingPlateManager: true,
  },
  modules: {
    jsonScanner: {
      autoMode: true,
      scanPath: "../BRK_CNC_CORE/test-data/source_data/json_files",
    },
    jsonAnalyzer: {
      autoMode: true,
      dataPath: "../BRK_CNC_CORE/test-data/source_data/json_files",
    },
    toolManager: {
      autoMode: true,
      excelPath: "../BRK_CNC_CORE/train-data/matrix_tools",
      inventoryFile:
        "../BRK_CNC_CORE/train-data/matrix_tools/E-Cut készlet.xlsx",
    },
    clampingPlateManager: {
      autoMode: true,
      modelsPath: "../ClampingPlateManager/data/test_source_data",
      plateInfoFile:
        "../ClampingPlateManager/data/test_source_data/Készülékek.xlsx",
    },
  },
  authentication: {
    method: "file",
    employeeFile: "./test_data/employees.json",
  },
  storage: {
    mode: "simple",
    basePath: "../BRK_CNC_CORE/test-data/working_data/BRK CNC Management Dashboard/dashboard",
    logsPath: "../BRK_CNC_CORE/test-data/working_data/BRK CNC Management Dashboard/logs",
    backupPath: "../BRK_CNC_CORE/test-data/working_data/BRK CNC Management Dashboard/backups",
    tempPath: "../BRK_CNC_CORE/test-data/working_data/BRK CNC Management Dashboard/temp",
    outputPath: "../BRK_CNC_CORE/test-data/working_data/BRK CNC Management Dashboard/output",
  },
  features: {
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
      interval: 60, // 1 hour
      runOnStartup: false,
      services: {
        jsonScanner: true,
        toolManager: true,
        analyzer: true,
      },
    },
  },
};

export function getDemoMessage(): string {
  return `🎭 Demo Mode Active - Setup wizard is pre-populated with test data paths. You can explore the system without configuring real data sources.`;
}
