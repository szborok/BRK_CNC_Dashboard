/**
 * Backend Configuration Service
 * Sends configuration to backend services after setup wizard completion
 */

export interface BackendConfigPayload {
  testMode: boolean;
  autoRun?: boolean;
  scanPaths?: {
    jsonFiles?: string | null;
    excelFiles?: string | null;
  };
  platesPath?: string | null;
  workingFolder?: string | null;
}

export interface BackendConfigResponse {
  success: boolean;
  message: string;
  config?: {
    testMode: boolean;
    autorun?: boolean;
    autoMode?: boolean;
  };
  timestamp: string;
}

/**
 * Send configuration to JSONScanner backend
 */
export async function configureJSONScanner(
  config: BackendConfigPayload
): Promise<BackendConfigResponse> {
  const response = await fetch("http://localhost:3001/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`JSONScanner config failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send configuration to ToolManager backend
 */
export async function configureToolManager(
  config: BackendConfigPayload
): Promise<BackendConfigResponse> {
  const response = await fetch("http://localhost:3002/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`ToolManager config failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send configuration to ClampingPlateManager backend
 */
export async function configureClampingPlateManager(
  config: BackendConfigPayload
): Promise<BackendConfigResponse> {
  const response = await fetch("http://localhost:3003/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(
      `ClampingPlateManager config failed: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Configure all backends based on setup wizard config
 */
export async function configureAllBackends(wizardConfig: {
  demoMode: boolean;
  companyFeatures: {
    jsonScanner: boolean;
    toolManager: boolean;
    clampingPlateManager: boolean;
  };
  modules: {
    jsonScanner: { autoMode: boolean; scanPath: string };
    jsonAnalyzer: { autoMode: boolean; dataPath: string };
    toolManager: {
      autoMode: boolean;
      excelPath: string;
      inventoryFile: string;
    };
    clampingPlateManager: {
      autoMode: boolean;
      modelsPath?: string;
      plateInfoFile?: string;
    };
  };
  storage: {
    basePath?: string;
    tempPath?: string;
  };
  features?: {
    autoScan?: {
      services: {
        jsonScanner: boolean;
        toolManager: boolean;
        analyzer: boolean;
      };
    };
  };
}): Promise<{
  jsonScanner?: BackendConfigResponse;
  toolManager?: BackendConfigResponse;
  clampingPlateManager?: BackendConfigResponse;
}> {
  const results: {
    jsonScanner?: BackendConfigResponse;
    toolManager?: BackendConfigResponse;
    clampingPlateManager?: BackendConfigResponse;
  } = {};

  // Configure JSONScanner
  if (wizardConfig.companyFeatures.jsonScanner) {
    try {
      results.jsonScanner = await configureJSONScanner({
        testMode: wizardConfig.demoMode,
        autoRun: false, // AutoRunProcessor handles automation, not individual backends
        scanPaths: {
          jsonFiles: wizardConfig.modules.jsonAnalyzer.dataPath || null,
        },
        workingFolder: wizardConfig.storage.tempPath || wizardConfig.storage.basePath || null,
      });
    } catch (error) {
      console.error("Failed to configure JSONScanner:", error);
      throw error;
    }
  }

  // Configure ToolManager
  if (wizardConfig.companyFeatures.toolManager) {
    try {
      results.toolManager = await configureToolManager({
        testMode: wizardConfig.demoMode,
        autoRun: false, // AutoRunProcessor handles automation, not individual backends
        scanPaths: {
          jsonFiles: wizardConfig.modules.jsonAnalyzer.dataPath || null,
          excelFiles: wizardConfig.modules.toolManager.excelPath || null,
        },
        workingFolder: wizardConfig.storage.tempPath || wizardConfig.storage.basePath || null,
      });
    } catch (error) {
      console.error("Failed to configure ToolManager:", error);
      throw error;
    }
  }

  // Configure ClampingPlateManager
  if (wizardConfig.companyFeatures.clampingPlateManager) {
    try {
      results.clampingPlateManager = await configureClampingPlateManager({
        testMode: wizardConfig.demoMode,
        platesPath: wizardConfig.modules.clampingPlateManager.modelsPath || null,
        workingFolder: wizardConfig.storage.tempPath || wizardConfig.storage.basePath || null,
      });
    } catch (error) {
      console.error("Failed to configure ClampingPlateManager:", error);
      throw error;
    }
  }

  return results;
}
