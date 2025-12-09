const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3004; // Dashboard backend on 3004, vite on 3000

// Middleware
app.use(cors());
app.use(express.json());

// Path to unified config in BRK_CNC_CORE
const CONFIG_PATH = path.join(__dirname, "../../BRK_CNC_CORE/BRK_SETUP_WIZARD_CONFIG.json");
const COMPANY_CONFIG_PATH = path.join(__dirname, "../../BRK_CNC_CORE/test-data/source_data/company-config.json");

// Ensure BRK_CNC_CORE directory exists
async function ensureConfigDirectory() {
  const configDir = path.dirname(CONFIG_PATH);
  try {
    await fs.mkdir(configDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create config directory:", error);
  }
}

// GET /api/config - Load configuration
app.get("/api/config", async (req, res) => {
  try {
    const configData = await fs.readFile(CONFIG_PATH, "utf8");
    const config = JSON.parse(configData);
    console.log("✅ Config loaded from filesystem");
    res.json(config);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("⚠️ Config file not found - first time setup required");
      res.status(404).json({ 
        error: "Configuration not found",
        firstTimeSetup: true 
      });
    } else {
      console.error("❌ Failed to load config:", error);
      res.status(500).json({ error: "Failed to load configuration" });
    }
  }
});

// POST /api/config/save - Save configuration
app.post("/api/config/save", async (req, res) => {
  try {
    await ensureConfigDirectory();
    const config = req.body;
    
    // Add server-side metadata
    config.savedAt = new Date().toISOString();
    config.savedBy = "Dashboard";
    
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
    console.log("✅ Config saved to filesystem:", CONFIG_PATH);
    
    res.json({ 
      success: true, 
      message: "Configuration saved successfully",
      path: CONFIG_PATH
    });
  } catch (error) {
    console.error("❌ Failed to save config:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to save configuration" 
    });
  }
});

// DELETE /api/config/reset - Reset configuration
app.delete("/api/config/reset", async (req, res) => {
  try {
    // Archive config file if it exists
    const archiveDir = path.join(path.dirname(CONFIG_PATH), "config_archive");
    await fs.mkdir(archiveDir, { recursive: true });
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archivePath = path.join(archiveDir, `BRK_SETUP_WIZARD_CONFIG.backup_${timestamp}.json`);
      
      // Try to copy to archive before deleting
      await fs.copyFile(CONFIG_PATH, archivePath);
      console.log(`📦 Config archived to: ${archivePath}`);
    } catch (archiveError) {
      if (archiveError.code !== "ENOENT") {
        console.warn("⚠️ Failed to archive config:", archiveError.message);
      }
    }
    
    // Delete the config file
    await fs.unlink(CONFIG_PATH);
    console.log("✅ Config file deleted - reset to first-time setup");
    res.json({ 
      success: true, 
      message: "Configuration reset successfully" 
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("⚠️ Config file already deleted");
      res.json({ 
        success: true, 
        message: "Configuration already reset" 
      });
    } else {
      console.error("❌ Failed to reset config:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to reset configuration" 
      });
    }
  }
});

// GET /api/company-config - Load company configuration
app.get("/api/company-config", async (req, res) => {
  try {
    const configData = await fs.readFile(COMPANY_CONFIG_PATH, "utf8");
    const config = JSON.parse(configData);
    console.log("✅ Company config loaded from filesystem");
    res.json(config);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("⚠️ Company config file not found");
      res.status(404).json({ error: "Company configuration not found" });
    } else {
      console.error("❌ Failed to load company config:", error);
      res.status(500).json({ error: "Failed to load company configuration" });
    }
  }
});

// POST /api/company-config - Save company configuration
app.post("/api/company-config", async (req, res) => {
  try {
    const config = req.body;
    
    // Backup existing config before overwriting
    try {
      const backupDir = path.join(path.dirname(COMPANY_CONFIG_PATH), "../backups");
      await fs.mkdir(backupDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `company-config.backup_${timestamp}.json`);
      await fs.copyFile(COMPANY_CONFIG_PATH, backupPath);
      console.log(`📦 Company config backed up to: ${backupPath}`);
    } catch (backupError) {
      console.warn("⚠️ Failed to backup company config:", backupError.message);
    }
    
    await fs.writeFile(COMPANY_CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
    console.log("✅ Company config saved to filesystem:", COMPANY_CONFIG_PATH);
    
    res.json({ 
      success: true, 
      message: "Company configuration saved successfully",
      path: COMPANY_CONFIG_PATH
    });
  } catch (error) {
    console.error("❌ Failed to save company config:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to save company configuration" 
    });
  }
});

// GET /api/company-config/backups - List all backup files
app.get("/api/company-config/backups", async (req, res) => {
  try {
    const backupDir = path.join(path.dirname(COMPANY_CONFIG_PATH), "../backups");
    
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter(f => f.startsWith('company-config.backup_') && f.endsWith('.json'));
      
      const backups = await Promise.all(backupFiles.map(async (filename) => {
        const filePath = path.join(backupDir, filename);
        const stats = await fs.stat(filePath);
        
        // Extract timestamp from filename: company-config.backup_2025-12-06T10-30-45-123Z.json
        const timestampMatch = filename.match(/backup_(.+)\.json$/);
        const timestamp = timestampMatch ? timestampMatch[1].replace(/-/g, ':').replace(/T(\d{2}):(\d{2}):(\d{2}):/, 'T$1:$2:$3.') : null;
        
        return {
          filename,
          timestamp: timestamp || stats.mtime.toISOString(),
          size: stats.size,
          path: filePath
        };
      }));
      
      // Sort by timestamp descending (newest first)
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      res.json({ success: true, backups });
    } catch (dirError) {
      if (dirError.code === 'ENOENT') {
        res.json({ success: true, backups: [] });
      } else {
        throw dirError;
      }
    }
  } catch (error) {
    console.error("❌ Failed to list backups:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to list backups" 
    });
  }
});

// GET /api/company-config/backups/:filename - Download a specific backup file
app.get("/api/company-config/backups/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent path traversal
    if (!filename.startsWith('company-config.backup_') || !filename.endsWith('.json')) {
      return res.status(400).json({ success: false, error: "Invalid filename" });
    }
    
    const backupDir = path.join(path.dirname(COMPANY_CONFIG_PATH), "../backups");
    const filePath = path.join(backupDir, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ success: false, error: "Backup file not found" });
    }
    
    // Send file
    res.download(filePath, filename);
  } catch (error) {
    console.error("❌ Failed to download backup:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to download backup" 
    });
  }
});

// DELETE /api/company-config/backups - Delete backup files (single or multiple)
app.delete("/api/company-config/backups", async (req, res) => {
  try {
    const { filenames } = req.body;
    
    if (!Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({ success: false, error: "No filenames provided" });
    }
    
    const backupDir = path.join(path.dirname(COMPANY_CONFIG_PATH), "../backups");
    const results = [];
    
    for (const filename of filenames) {
      // Validate filename to prevent path traversal
      if (!filename.startsWith('company-config.backup_') || !filename.endsWith('.json')) {
        results.push({ filename, success: false, error: "Invalid filename" });
        continue;
      }
      
      const filePath = path.join(backupDir, filename);
      
      try {
        await fs.unlink(filePath);
        results.push({ filename, success: true });
        console.log(`🗑️ Deleted backup: ${filename}`);
      } catch (error) {
        results.push({ filename, success: false, error: error.message });
        console.error(`❌ Failed to delete backup ${filename}:`, error);
      }
    }
    
    const allSuccess = results.every(r => r.success);
    const deletedCount = results.filter(r => r.success).length;
    
    res.json({ 
      success: allSuccess, 
      results,
      message: `Deleted ${deletedCount} of ${filenames.length} backup(s)`
    });
  } catch (error) {
    console.error("❌ Failed to delete backups:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete backups" 
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "BRK CNC Dashboard",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🎯 BRK CNC Dashboard Backend running on http://localhost:${PORT}`);
  console.log(`📁 Config path: ${CONFIG_PATH}`);
  console.log(`📁 Company config path: ${COMPANY_CONFIG_PATH}`);
});
