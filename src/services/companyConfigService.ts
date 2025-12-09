import type { 
  Machine, 
  Cycle, 
  ToolCategory, 
  ValidationRule
} from '../types/companyConfig';

const API_BASE = 'http://localhost:3004';

export interface CompanyConfigData {
  companyName: string;
  machines: Machine[];
  cycles: Cycle[];
  toolCategories: ToolCategory[];
  validationRules: ValidationRule[];
}

/**
 * Load company configuration from server
 */
export async function loadCompanyConfig(): Promise<CompanyConfigData> {
  const response = await fetch(`${API_BASE}/api/company-config`);
  if (!response.ok) {
    throw new Error(`Failed to load company config: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Save company configuration to server
 */
export async function saveCompanyConfig(config: CompanyConfigData): Promise<void> {
  const response = await fetch(`${API_BASE}/api/company-config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to save company config: ${response.statusText}`);
  }
}

/**
 * Update a specific machine
 */
export async function updateMachine(machine: Machine): Promise<void> {
  const config = await loadCompanyConfig();
  const index = config.machines.findIndex(m => m.id === machine.id);
  
  if (index === -1) {
    throw new Error(`Machine not found: ${machine.id}`);
  }
  
  config.machines[index] = machine;
  await saveCompanyConfig(config);
}

/**
 * Add a new machine
 */
export async function addMachine(machine: Machine): Promise<void> {
  const config = await loadCompanyConfig();
  
  if (config.machines.find(m => m.id === machine.id)) {
    throw new Error(`Machine already exists: ${machine.id}`);
  }
  
  config.machines.push(machine);
  await saveCompanyConfig(config);
}

/**
 * Delete a machine
 */
export async function deleteMachine(machineId: string): Promise<void> {
  const config = await loadCompanyConfig();
  config.machines = config.machines.filter(m => m.id !== machineId);
  await saveCompanyConfig(config);
}

/**
 * Update a specific cycle
 */
export async function updateCycle(cycle: Cycle): Promise<void> {
  const config = await loadCompanyConfig();
  const index = config.cycles.findIndex(c => c.id === cycle.id);
  
  if (index === -1) {
    throw new Error(`Cycle not found: ${cycle.id}`);
  }
  
  config.cycles[index] = cycle;
  await saveCompanyConfig(config);
}

/**
 * Update a validation rule
 */
export async function updateValidationRule(rule: ValidationRule): Promise<void> {
  const config = await loadCompanyConfig();
  const index = config.validationRules.findIndex(r => r.id === rule.id);
  
  if (index === -1) {
    throw new Error(`Validation rule not found: ${rule.id}`);
  }
  
  config.validationRules[index] = rule;
  await saveCompanyConfig(config);
}

/**
 * Add a new validation rule
 */
export async function addValidationRule(rule: ValidationRule): Promise<void> {
  const config = await loadCompanyConfig();
  
  if (config.validationRules.find(r => r.id === rule.id)) {
    throw new Error(`Validation rule already exists: ${rule.id}`);
  }
  
  config.validationRules.push(rule);
  await saveCompanyConfig(config);
}

/**
 * Delete a validation rule
 */
export async function deleteValidationRule(ruleId: string): Promise<void> {
  const config = await loadCompanyConfig();
  config.validationRules = config.validationRules.filter(r => r.id !== ruleId);
  await saveCompanyConfig(config);
}

export interface BackupFile {
  filename: string;
  timestamp: string;
  size: number;
  path: string;
}

/**
 * List all backup files
 */
export async function listBackups(): Promise<BackupFile[]> {
  const response = await fetch(`${API_BASE}/api/company-config/backups`);
  if (!response.ok) {
    throw new Error(`Failed to list backups: ${response.statusText}`);
  }
  const data = await response.json();
  return data.backups || [];
}

/**
 * Delete backup files
 */
export async function deleteBackups(filenames: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/api/company-config/backups`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filenames }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete backups: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete backups');
  }
}
