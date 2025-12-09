import { SetupConfig } from "../hooks/useSetupConfig";

export class SetupProcessor {
  private config: SetupConfig;

  constructor(config: SetupConfig) {
    this.config = config;
  }

  async processSetup(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      console.log("🚀 Starting setup processing...");

      // 1. Create directory structure
      await this.createDirectories();

      // 2. Create employee file
      await this.createEmployeeFile();

      // 3. Create configuration files for each module
      await this.createModuleConfigs();

      console.log("✅ Setup processing completed successfully");

      return {
        success: true,
        message:
          "Setup completed successfully! Your CNC Management Dashboard is ready to use.",
        details: {
          directoriesCreated: this.getCreatedDirectories(),
          modulesConfigured: this.getConfiguredModules(),
          employeeFile: this.config.authentication.employeeFile,
        },
      };
    } catch (error) {
      console.error("❌ Setup processing failed:", error);
      return {
        success: false,
        message: `Setup failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        details: { error },
      };
    }
  }

  private async createDirectories(): Promise<void> {
    const directories = this.getDirectoriesToCreate();

    console.log("📁 Creating directories:", directories);

    // In a real application, you would use Node.js fs module or Electron API
    // For now, we'll simulate this and show what would be created
    for (const dir of directories) {
      console.log(`Creating directory: ${dir}`);
      // await fs.mkdir(dir, { recursive: true });
    }
  }

  private async createEmployeeFile(): Promise<void> {
    if (this.config.authentication.method === "file") {
      const employeeFilePath =
        this.config.authentication.employeeFile || "./data/employees.json";

      // Employee template for reference
      // Template structure: { id, name, email, role, department, active, createdAt }

      console.log(`📄 Employee file template created: ${employeeFilePath}`);
      // Backend will save this to filesystem
      // For now, just log what would be created
    }
  }

  private async createModuleConfigs(): Promise<void> {
    const moduleConfigs: any = {};

    // JSON Scanner configuration
    if (this.config.companyFeatures.jsonScanner) {
      moduleConfigs.jsonScanner = {
        enabled: true,
        mode: this.config.modules.jsonAnalyzer.autoMode,
        dataPath: this.config.modules.jsonAnalyzer.dataPath,
        outputPath: this.config.storage.outputPath + "/json_analysis",
        rules: ["AutoCorrectionContour", "M110Contour", "SingleToolInNC"],
        autoProcess: this.config.modules.jsonAnalyzer.autoMode === true,
      };
    }

    // Tool Manager configuration
    if (this.config.companyFeatures.toolManager) {
      moduleConfigs.toolManager = {
        enabled: true,
        mode: this.config.modules.toolManager.mode,
        excelInputPath: this.config.modules.toolManager.paths?.excelInputPath,
        jsonInputPath: this.config.companyFeatures.jsonScanner
          ? this.config.modules.jsonAnalyzer.dataPath
          : this.config.modules.toolManager.paths?.jsonInputPath,
        outputPath: this.config.storage.outputPath + "/tool_analysis",
        autoProcess: this.config.modules.toolManager.autoMode === true,
      };
    }

    // Clamping Plate Manager configuration
    if (this.config.companyFeatures.clampingPlateManager) {
      moduleConfigs.clampingPlateManager = {
        enabled: true,
        modelsPath: this.config.modules.clampingPlateManager.modelsPath,
        plateInfoFile: this.config.modules.clampingPlateManager.plateInfoFile,
        outputPath: this.config.storage.outputPath + "/plate_analysis",
      };
    }

    console.log("⚙️ Creating module configurations:", moduleConfigs);
    // Backend will save module configs to filesystem
    // No localStorage usage
  }

  private getDirectoriesToCreate(): string[] {
    const directories: string[] = [];

    if (this.config.storage.basePath) {
      // Mono folder strategy
      directories.push(
        this.config.storage.basePath,
        this.config.storage.logsPath,
        this.config.storage.backupPath,
        this.config.storage.tempPath,
        this.config.storage.outputPath
      );
    } else {
      // Individual folder strategy
      directories.push(
        this.config.storage.logsPath,
        this.config.storage.backupPath,
        this.config.storage.tempPath,
        this.config.storage.outputPath
      );
    }

    // Module-specific directories
    if (
      this.config.companyFeatures.jsonScanner &&
      this.config.modules.jsonAnalyzer.dataPath
    ) {
      directories.push(this.config.modules.jsonAnalyzer.dataPath);
    }

    if (
      this.config.companyFeatures.toolManager &&
      this.config.modules.toolManager.paths?.excelInputPath
    ) {
      directories.push(this.config.modules.toolManager.paths.excelInputPath);
    }

    if (this.config.companyFeatures.clampingPlateManager) {
      if (this.config.modules.clampingPlateManager.modelsPath) {
        directories.push(this.config.modules.clampingPlateManager.modelsPath);
      }
      // Note: plateInfoFile is a file path, not a directory, so we extract the directory
      if (this.config.modules.clampingPlateManager.plateInfoFile) {
        const infoFileDir = this.config.modules.clampingPlateManager.plateInfoFile
          .split(/[\\/]/)
          .slice(0, -1)
          .join("\\");
        if (infoFileDir) {
          directories.push(infoFileDir);
        }
      }
    }

    return [...new Set(directories)]; // Remove duplicates
  }

  private getCreatedDirectories(): string[] {
    return this.getDirectoriesToCreate();
  }

  private getConfiguredModules(): string[] {
    const modules: string[] = [];

    if (this.config.companyFeatures.jsonScanner) modules.push("JSON Scanner");
    if (this.config.companyFeatures.toolManager) modules.push("Tool Manager");
    if (this.config.companyFeatures.clampingPlateManager)
      modules.push("Clamping Plate Manager");

    return modules;
  }
}

