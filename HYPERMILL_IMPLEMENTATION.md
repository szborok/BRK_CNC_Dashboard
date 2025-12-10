# hyperMILL Configuration Management - Frontend Implementation

## Overview
This frontend implementation manages hyperMILL CAM software configurations, including macros, automation scripts, and system settings.

## hyperMILL File Structure

### Configuration Files
hyperMILL typically stores configuration data in several locations:

**Main Configuration Directory**: `C:\hyperMILL\Config\`
- Machine definitions (.cfg)
- Tool libraries (.tdb, .xml)
- Material databases (.mdb)
- Post processors (.ppr)
- Templates (.hmt)
- User preferences (.ini)

**Macro Directory**: `C:\hyperMILL\Macros\`
- Setup macros (.hmm)
- Toolpath macros (.hmm)
- Post-process macros (.hmm)
- Utility scripts (.hmm, .vbs)
- Organized by category folders

**Automation Center**: `C:\hyperMILL\AutomationCenter\`
- Automation scripts (.hma, .xml)
- Workflow definitions (.hma)
- Event triggers configuration
- Scheduled tasks
- Job templates

### Typical File Locations
1. **Global Settings**: 
   - `%APPDATA%\OPEN MIND\hyperMILL\`
   - User-specific preferences and UI settings

2. **Shared Resources**:
   - `%PUBLIC%\Documents\OPEN MIND\hyperMILL\`
   - Shared macros and templates across users

3. **Installation Directory**:
   - `C:\Program Files\OPEN MIND\hyperMILL\`
   - System defaults and base configurations

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
- **Purpose**: Manage macro scripts
- **Features**:
  - Browse macro library
  - Category-based organization (Setup, Toolpath, Post-Process, Utility)
  - Search and filter macros
  - View macro details and usage statistics
  - Import/export macros
  - Execute macros directly
  - Edit macro properties

### 3. Global Automation View
- **Purpose**: Manage Automation Center workflows
- **Features**:
  - List automation scripts
  - Enable/disable automation
  - View execution statistics
  - Trigger configuration
  - Schedule automation tasks
  - Script execution history
  - Event-based triggers:
    - Job Approval
    - Toolpath Complete
    - Before Calculation
    - After Simulation
    - Scheduled (Time-based)

### 4. Backup/Reset View
- **Purpose**: Configuration backup and restoration
- **Features**:
  - Create manual backups
  - Automated backup configuration
  - Backup history with restore points
  - Download backup files
  - Import external backups
  - Factory reset option
  - Backup retention settings

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
