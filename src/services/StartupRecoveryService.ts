import { SetupConfig } from "../hooks/useSetupConfig";

export interface StartupRecoveryResult {
  needsSetup: boolean;
  needsServiceStart: boolean;
  configValid: boolean;
  servicesRunning: {
    jsonScanner: boolean;
    toolManager: boolean;
    clampingPlateManager: boolean;
  };
  pathsValid: {
    dataPath: boolean;
    logsPath: boolean;
    backupPath: boolean;
    tempPath: boolean;
  };
  recommendations: string[];
  quickActions: Array<{
    label: string;
    action: string;
    icon: string;
  }>;
}

export class StartupRecoveryService {
  private config: SetupConfig;

  constructor(config: SetupConfig) {
    this.config = config;
  }

  async performStartupCheck(): Promise<StartupRecoveryResult> {
    console.log("🔍 Performing startup recovery check...");

    const result: StartupRecoveryResult = {
      needsSetup: false,
      needsServiceStart: false,
      configValid: true,
      servicesRunning: {
        jsonScanner: false,
        toolManager: false,
        clampingPlateManager: false,
      },
      pathsValid: {
        dataPath: false,
        logsPath: false,
        backupPath: false,
        tempPath: false,
      },
      recommendations: [],
      quickActions: [],
    };

    // 1. Check if configuration exists and is valid
    if (!this.config.isConfigured) {
      result.needsSetup = true;
      result.configValid = false;
      result.recommendations.push("Complete initial setup wizard");
      return result;
    }

    // 2. Validate configured paths exist
    result.pathsValid = await this.validatePaths();

    // 3. Check if backend services are running
    result.servicesRunning = await this.checkServices();

    // 4. Determine what needs to be done
    const servicesDown = Object.values(result.servicesRunning).some(s => !s);
    const pathsInvalid = Object.values(result.pathsValid).some(p => !p);

    if (servicesDown) {
      result.needsServiceStart = true;
      result.recommendations.push("Start required backend services");
      
      result.quickActions.push({
        label: "🚀 Start All Services",
        action: "start-all-services",
        icon: "🚀"
      });
    }

    if (pathsInvalid) {
      result.recommendations.push("Verify or recreate configured directories");
      
      result.quickActions.push({
        label: "📁 Verify Paths",
        action: "verify-paths", 
        icon: "📁"
      });
    }

    // 5. Add recovery-specific quick actions
    result.quickActions.push(
      {
        label: "🔧 Open Setup Wizard",
        action: "open-setup",
        icon: "🔧"
      },
      {
        label: "📊 View System Status", 
        action: "system-status",
        icon: "📊"
      }
    );

    console.log("✅ Startup recovery check completed:", result);
    return result;
  }

  private async validatePaths(): Promise<StartupRecoveryResult["pathsValid"]> {
    // Since we're in browser environment, we can't directly check file system
    // But we can validate that paths are configured
    return {
      dataPath: !!this.config.storage.basePath,
      logsPath: !!this.config.storage.logsPath,
      backupPath: !!this.config.storage.backupPath,
      tempPath: !!this.config.storage.tempPath,
    };
  }

  private async checkServices(): Promise<StartupRecoveryResult["servicesRunning"]> {
    const services = {
      jsonScanner: false,
      toolManager: false,
      clampingPlateManager: false,
    };

    // Check each service by attempting HTTP requests to their endpoints
    if (this.config.modules.jsonScanner) {
      services.jsonScanner = await this.pingService("http://localhost:3001/health");
    }

    if (this.config.modules.toolManager) {
      services.toolManager = await this.pingService("http://localhost:3003/health");
    }

    if (this.config.modules.clampingPlateManager) {
      services.clampingPlateManager = await this.pingService("http://localhost:3002/health");
    }

    return services;
  }

  private async pingService(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  generateStartupInstructions(): string[] {
    const instructions = [
      "🔸 **Welcome Back!** Your CNC Management System is configured.",
      "",
    ];

    if (this.config.modules.jsonScanner) {
      instructions.push(
        "🔍 **JSONScanner** - Start: `cd JSONScanner && npm run auto`",
      );
    }

    if (this.config.modules.toolManager) {
      instructions.push(
        "🔧 **ToolManager** - Start: `cd ToolManager && npm run auto`",
      );
    }

    if (this.config.modules.clampingPlateManager) {
      instructions.push(
        "📋 **ClampingPlateManager** - Start: `cd ClampingPlateManager && npm start`",
      );
    }

    instructions.push(
      "",
      "💡 **Quick Start:** Use VS Code workspace task `🚀 Start All Services`",
      "",
      "📁 **Your Configuration:**",
      `   • Base Path: ${this.config.storage.basePath}`,
      `   • Company: ${this.config.companyName}`,
      `   • Modules: ${Object.entries(this.config.modules).filter(([_, module]) => module.autoMode).map(([name]) => name).join(", ")}`,
    );

    return instructions;
  }
}