export interface WorkEnvelope {
  x: number;
  y: number;
  z: number;
  unit: string;
}

export interface Precision {
  positioningAccuracy: number;
  repeatability: number;
  unit: string;
}

export interface NetworkInfo {
  ipAddress: string;
  hostname: string;
}

export interface MaintenanceHistory {
  date: string;
  type: string;
  description: string;
  technician: string;
}

export interface Maintenance {
  lastService: string;
  nextScheduled: string;
  intervalHours: number;
  history: MaintenanceHistory[];
}

export interface Documentation {
  manual: string;
  setupSheets: string;
  maintenanceLog: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  control: string;
  controlVersion: string;
  axes: number;
  maxSpindleSpeed: number;
  toolMagazineCapacity?: number;
  maxLoadWeight?: number;
  internalCoolant: boolean;
  internalAir: boolean;
  coolantType?: string;
  fineCoolantFilter?: boolean;
  fixtureSystem?: string;
  workEnvelope: WorkEnvelope;
  precision?: Precision;
  network?: NetworkInfo;
  maintenance?: Maintenance;
  documentation?: Documentation;
  hasRobot?: boolean;
}

export interface Cycle {
  id: string;
  name: string;
  type: string;
  description: string;
  machineTypes: string[];
  parameters: string[];
  icon: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  types: string[];
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  appliesTo?: {
    machines?: boolean;
    cycles?: boolean;
    tools?: boolean;
  };
  machineIds?: string[];
  cycleIds?: string[];
  toolPatterns?: string[];
  conditions?: Record<string, any>;
}

export interface CompanyConfig {
  companyName: string;
  machines: Machine[];
  cycles: Cycle[];
  toolCategories: ToolCategory[];
  validationRules: ValidationRule[];
}
