# hyperMILL Configuration Management - Frontend Implementation

## Overview
This frontend implementation manages hyperMILL CAM software AUTOMATION Center configurations, including automation scripts, macros, and workflow management.

## hyperMILL AUTOMATION Center File Structure

Based on hyperMILL v34.0 official documentation, the AUTOMATION Center uses a structured folder hierarchy for organizing scripts and related data.

### Default AUTOMATION Center Folder Paths

**Company-wide Default Path** (typically on server):
Set under: `hyperMILL → Setup → Settings → Application → Default paths → AUTOMATION Center`

Main folders structure:
```
[AUTOMATION Center Default Path]\
├── Apps\                  - Scripts provided by OPEN MIND or custom scripts
├── CLAMPS\                - Fixtures organized by fixture system (subfolders per machine)
├── COMPONENTS\            - Component files for exported components/subcomponents
├── DATABASE\              - Databases (Color_table.xml, MacroDB.db, ToolDB.db, Virtual_tool.vtx)
├── EXPORTED\              - Compressed scripts for data exchange/backup
├── FEATURE\               - Exported feature files
├── LIBRARY\               - CAD data categories with CAD model data
├── MULTIOFFSET\           - .cfg files for milling area multiple allowances
├── REPORTS\               - *.xsl report layouts
├── STOCKS\                - *.cfg stock definition files (subfolders per category)
├── variants\              - Global script data (subfolders per script)
├── VB SCRIPTS\            - VBScript files (categorized in subfolders)
└── PYTHON SCRIPTS\        - Python script files (categorized in subfolders)
```

**Local User Path**:
`C:\Users\Public\Documents\OPEN MIND\USERS\[Username]\AutomationCenter\`
- `variants\` - Local storage for scripts (synced from global path on startup)

**User-specific Preferences**:
`%APPDATA%\OPEN MIND\hyperMILL\` - User-specific settings and preferences

### Script File Formats

**Script Files**: Stored in `variants\` folders
- `.hma` - Automation Center script definition files (XML-based)
- `.xml` - Additional script configuration files
- Each script has its own subfolder under `variants\`
- Scripts are synchronized from global to local path on startup

**Macro Files**: Stored in database or file system
- Macros are part of hyperMILL core (not AUTOMATION Center specific)
- Referenced by AUTOMATION Center scripts for execution

**VBScript/Python Files**: For external automation
- `.vbs` - VBScript files in categorized subfolders under `VB SCRIPTS\`
- `.py` - Python script files in categorized subfolders under `PYTHON SCRIPTS\`
- Called from AUTOMATION Center workflows using "Execute VBS script" or "Execute Python script" functions

### Configuration and Data Files

1. **Fixture Definitions**: `CLAMPS\[FixtureSystem]\` - Fixture components organized by system
2. **Stock Definitions**: `STOCKS\[Category]\*.cfg` - Stock definition files by category
3. **Database Files**: `DATABASE\`
   - `Color_table.xml` - Color definitions
   - `MacroDB.db` - Macro database
   - `ToolDB.db` - Tool database
   - `Virtual_tool.vtx` - Virtual tool definitions

## Frontend Features

### 1. Current Config View
- **Purpose**: Display active configuration status
- **Features**:
  - Machine definitions overview
  - Tool libraries count
  - Material databases
  - Post processors
  - Templates availability
  - Sync status indicators
  - Configuration export/import

### 2. Global Macro View
- **Purpose**: Manage VBScript and Python automation scripts
- **Features**:
  - Browse script library in categorized folders
  - Category-based organization (VB SCRIPTS and PYTHON SCRIPTS with subfolders)
  - Search and filter scripts by name/path
  - View script details and execution count
  - Copy script path for reference
  - Download/upload scripts
  - Edit button (opens external editor)
  - Delete scripts with confirmation

### 3. Global Automation View
- **Purpose**: Manage AUTOMATION Center scripts (`.hma` files)
- **Features**:
  - List automation scripts from `variants\` folders
  - Enable/disable scripts for automatic execution
  - View execution statistics and last run
  - Script management:
    - Create new script
    - Duplicate existing script
    - Rename script (creates new script)
    - Delete script with confirmation
  - Import/export scripts (.hma compressed format)
  - Search and filter script list
  - Add scripts to toolbar/menu
  - Configure company-wide vs user-specific toolbars
  - Runtime vs Advanced license features
  - Execute scripts manually or via server controller

### 4. Backup/Reset View
- **Purpose**: AUTOMATION Center data backup and restoration
- **Features**:
  - Backup entire AUTOMATION Center folder structure
  - Manual backup creation with compression
  - Backup includes:
    - All script files from `variants\`
    - Database files (Color_table.xml, MacroDB.db, ToolDB.db, Virtual_tool.vtx)
    - Component files from `COMPONENTS\`
    - Fixture definitions from `CLAMPS\`
    - Stock definitions from `STOCKS\`
    - VB Scripts and Python Scripts
    - Report layouts from `REPORTS\`
  - Backup history with restore points
  - Download backup archives (.zip)
  - Import/restore from backup files
  - Selective restore (choose specific folders)
  - Factory reset (restore to installation defaults)
  - Backup retention policy settings
  - Automated backup scheduling

## User vs Admin Differences

### User Access:
- **Current Config**: View only
- **Global Macro**: Execute existing macros, view properties
- **Global Automation**: View automation status, cannot modify
- **Backup/Reset**: Cannot access (admin only)

### Admin Access:
- **Current Config**: Full access, can modify settings, import/export
- **Global Macro**: Full CRUD operations, can create/edit/delete
- **Global Automation**: Full control, create/modify/delete scripts
- **Backup/Reset**: Full access to backup/restore/reset operations

## Backend Integration Requirements

The backend service (`BRK_CNC_hyperMillConfig`) should provide APIs for:

1. **Configuration Management**:
   - `GET /api/config/status` - Get current configuration status
   - `GET /api/config/items` - List all configuration components
   - `POST /api/config/sync` - Sync configuration from hyperMILL
   - `POST /api/config/export` - Export configuration
   - `POST /api/config/import` - Import configuration

2. **Macro Management**:
   - `GET /api/macros` - List all macros
   - `GET /api/macros/:id` - Get macro details
   - `POST /api/macros/execute` - Execute a macro
   - `POST /api/macros/upload` - Upload new macro
   - `PUT /api/macros/:id` - Update macro
   - `DELETE /api/macros/:id` - Delete macro

3. **Automation Management**:
   - `GET /api/automation/scripts` - List automation scripts
   - `GET /api/automation/scripts/:id` - Get script details
   - `PUT /api/automation/scripts/:id/toggle` - Enable/disable script
   - `POST /api/automation/scripts/execute` - Execute script
   - `GET /api/automation/triggers` - List available triggers

4. **Backup Operations**:
   - `GET /api/backup/list` - List available backups
   - `POST /api/backup/create` - Create new backup
   - `POST /api/backup/restore/:id` - Restore from backup
   - `GET /api/backup/download/:id` - Download backup file
   - `POST /api/backup/upload` - Upload backup file
   - `POST /api/backup/reset` - Factory reset

## Technology Stack

- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS matching existing dashboard style
- **Icons**: Lucide React
- **State Management**: React hooks
- **API Communication**: Fetch API (to be implemented)
- **Notifications**: Sonner toast notifications

## Next Steps

1. **Backend Development**: Create the hyperMillConfig microservice
2. **API Integration**: Connect frontend to backend APIs
3. **Authentication**: Implement role-based access control
4. **File System Integration**: Read/write hyperMILL configuration files
5. **Error Handling**: Add comprehensive error handling and validation
6. **Testing**: Unit and integration tests for all components

## Notes

- All components currently use mock data
- Real file paths will need to be configured per installation
- hyperMILL version compatibility should be checked
- Backup operations should include progress indicators
- Macro execution should be logged for audit purposes
