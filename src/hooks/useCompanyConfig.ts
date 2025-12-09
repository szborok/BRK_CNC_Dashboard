import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { CompanyConfigData } from '../services/companyConfigService';
import {
  loadCompanyConfig,
  saveCompanyConfig,
  updateMachine,
  updateCycle,
  updateValidationRule,
  addMachine,
  addValidationRule,
  deleteMachine,
  deleteValidationRule,
} from '../services/companyConfigService';
import type { Machine, Cycle, ToolCategory, ValidationRule } from '../types/companyConfig';

export function useCompanyConfig() {
  const [config, setConfig] = useState<CompanyConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const data = await loadCompanyConfig();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company config');
      console.error('Failed to load company config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMachine = async (machine: Machine) => {
    try {
      await updateMachine(machine);
      await loadConfig(); // Reload to get fresh data
      toast.success('Machine updated and backup created successfully');
      window.dispatchEvent(new CustomEvent('backupCreated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update machine');
      throw new Error(err instanceof Error ? err.message : 'Failed to update machine');
    }
  };

  const handleAddMachine = async (machine: Machine) => {
    try {
      await addMachine(machine);
      await loadConfig();
      toast.success('Machine added and backup created successfully');
      window.dispatchEvent(new CustomEvent('backupCreated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add machine');
      throw new Error(err instanceof Error ? err.message : 'Failed to add machine');
    }
  };

  const handleDeleteMachine = async (machineId: string) => {
    try {
      await deleteMachine(machineId);
      await loadConfig();
      toast.success('Machine deleted and backup created successfully');
      window.dispatchEvent(new CustomEvent('backupCreated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete machine');
      throw new Error(err instanceof Error ? err.message : 'Failed to delete machine');
    }
  };

  const handleUpdateCycle = async (cycle: Cycle) => {
    try {
      await updateCycle(cycle);
      await loadConfig();
      toast.success('Cycle updated and backup created successfully');
      window.dispatchEvent(new CustomEvent('backupCreated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update cycle');
      throw new Error(err instanceof Error ? err.message : 'Failed to update cycle');
    }
  };

  const handleUpdateToolCategory = async (category: ToolCategory) => {
    try {
      if (!config) return;
      const updatedCategories = config.toolCategories.map(c =>
        c.id === category.id ? category : c
      );
      await saveCompanyConfig({
        ...config,
        toolCategories: updatedCategories,
      });
      await loadConfig();
      toast.success('Tool category updated and backup created successfully');
      window.dispatchEvent(new CustomEvent('backupCreated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update tool category');
      throw new Error(err instanceof Error ? err.message : 'Failed to update tool category');
    }
  };

  const handleUpdateRule = async (rule: ValidationRule) => {
    try {
      await updateValidationRule(rule);
      await loadConfig();
      toast.success('Rule updated and backup created successfully');
      window.dispatchEvent(new CustomEvent('backupCreated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update rule');
      throw new Error(err instanceof Error ? err.message : 'Failed to update rule');
    }
  };

  const handleAddRule = async (rule: ValidationRule) => {
    try {
      await addValidationRule(rule);
      await loadConfig();
      toast.success('Rule added and backup created successfully');
      window.dispatchEvent(new CustomEvent('backupCreated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add rule');
      throw new Error(err instanceof Error ? err.message : 'Failed to add rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteValidationRule(ruleId);
      await loadConfig();
      toast.success('Rule deleted and backup created successfully');
      window.dispatchEvent(new CustomEvent('backupCreated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete rule');
      throw new Error(err instanceof Error ? err.message : 'Failed to delete rule');
    }
  };

  return {
    config,
    isLoading,
    error,
    reload: loadConfig,
    updateMachine: handleUpdateMachine,
    addMachine: handleAddMachine,
    deleteMachine: handleDeleteMachine,
    updateCycle: handleUpdateCycle,
    updateToolCategory: handleUpdateToolCategory,
    updateRule: handleUpdateRule,
    addRule: handleAddRule,
    deleteRule: handleDeleteRule,
  };
}
