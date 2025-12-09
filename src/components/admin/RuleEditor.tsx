import { useState } from 'react';
import { 
  Card, 
  CardContent
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Plus, Edit, Trash2, ShieldCheck } from 'lucide-react';
import type { ValidationRule, Machine, Cycle, ToolCategory } from '../../types/companyConfig';

interface RuleEditorProps {
  rules: ValidationRule[];
  machines: Machine[];
  cycles: Cycle[];
  toolCategories: ToolCategory[];
  onUpdate: (rule: ValidationRule) => Promise<void>;
  onAdd: (rule: ValidationRule) => Promise<void>;
  onDelete: (ruleId: string) => Promise<void>;
}

export default function RuleEditor({ 
  rules, 
  machines, 
  cycles, 
  toolCategories,
  onUpdate, 
  onAdd, 
  onDelete 
}: RuleEditorProps) {
  const [editingRule, setEditingRule] = useState<ValidationRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const emptyRule: ValidationRule = {
    id: '',
    name: '',
    description: '',
    active: true,
    appliesTo: {
      machines: true,
      cycles: true,
      tools: true,
    },
    machineIds: [],
    cycleIds: [],
    toolPatterns: [],
    conditions: {},
  };

  const handleEdit = (rule: ValidationRule) => {
    setEditingRule({ ...rule });
    setIsAdding(false);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRule({ ...emptyRule });
    setIsAdding(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingRule) return;
    
    try {
      if (isAdding) {
        await onAdd(editingRule);
      } else {
        await onUpdate(editingRule);
      }
      setIsDialogOpen(false);
      setEditingRule(null);
    } catch (error) {
      console.error('Failed to save rule:', error);
      alert(`Failed to save rule: ${error}`);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      await onDelete(ruleId);
    } catch (error) {
      console.error('Failed to delete rule:', error);
      alert(`Failed to delete rule: ${error}`);
    }
  };

  const updateField = (field: keyof ValidationRule, value: any) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, [field]: value });
  };

  const toggleMachine = (machineId: string) => {
    if (!editingRule) return;
    const machineIds = editingRule.machineIds || [];
    const newMachineIds = machineIds.includes(machineId)
      ? machineIds.filter(id => id !== machineId)
      : [...machineIds, machineId];
    setEditingRule({ ...editingRule, machineIds: newMachineIds });
  };

  const toggleCycle = (cycleId: string) => {
    if (!editingRule) return;
    const cycleIds = editingRule.cycleIds || [];
    const newCycleIds = cycleIds.includes(cycleId)
      ? cycleIds.filter(id => id !== cycleId)
      : [...cycleIds, cycleId];
    setEditingRule({ ...editingRule, cycleIds: newCycleIds });
  };

  const toggleToolCategory = (category: ToolCategory) => {
    if (!editingRule) return;
    const toolPatterns = editingRule.toolPatterns || [];
    
    // Check if ANY of this category's patterns are in toolPatterns
    const hasAnyPattern = category.patterns.some(p => toolPatterns.includes(p));
    
    let newPatterns: string[];
    if (hasAnyPattern) {
      // Remove all patterns from this category
      newPatterns = toolPatterns.filter(p => !category.patterns.includes(p));
    } else {
      // Add all patterns from this category
      newPatterns = [...toolPatterns, ...category.patterns];
    }
    
    setEditingRule({ ...editingRule, toolPatterns: newPatterns });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Validation Rules
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure validation rules and their conditions
          </p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id} className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{rule.name}</h4>
                    <Badge 
                      variant={rule.active ? "outline" : "secondary"} 
                      className={rule.active ? "text-green-600" : "text-gray-600"}
                    >
                      {rule.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    {/* Only show categories that are applicable for this rule */}
                    {rule.appliesTo?.machines !== false && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-24">Machines:</span>
                        <div className="flex flex-wrap gap-1">
                          {rule.machineIds && rule.machineIds.length > 0 ? (
                            rule.machineIds.map(id => {
                              const machine = machines.find(m => m.id === id);
                              return (
                                <Badge key={id} variant="secondary" className="text-xs">
                                  {machine?.name || id}
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground">Not configured</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {rule.appliesTo?.cycles !== false && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-24">Cycles:</span>
                        <div className="flex flex-wrap gap-1">
                          {rule.cycleIds && rule.cycleIds.length > 0 ? (
                            rule.cycleIds.map(id => {
                              const cycle = cycles.find(c => c.id === id);
                              return (
                                <Badge key={id} variant="secondary" className="text-xs">
                                  {cycle?.name || id}
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground">Not configured</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {rule.appliesTo?.tools !== false && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-24">Tools:</span>
                        <div className="flex flex-wrap gap-1">
                          {rule.toolPatterns && rule.toolPatterns.length > 0 ? (
                            toolCategories
                              .filter(category => category.patterns.some(p => rule.toolPatterns?.includes(p)))
                              .map(category => (
                                <Badge key={category.id} variant="secondary" className="text-xs">
                                  {category.name}
                                </Badge>
                              ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Not configured</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(rule)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(rule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle>
              {isAdding ? 'Add New Rule' : `Edit ${editingRule?.name}`}
            </DialogTitle>
            <DialogDescription>
              Configure validation rule conditions and scope
            </DialogDescription>
          </DialogHeader>

          {editingRule && (
            <div className="space-y-4 py-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="ruleId">Rule ID</Label>
                <Input
                  id="ruleId"
                  value={editingRule.id}
                  onChange={(e) => updateField('id', e.target.value)}
                  placeholder="gundrill-60min-limit"
                  disabled={!isAdding}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input
                  id="ruleName"
                  value={editingRule.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="GunDrill 60 Min Limit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruleDescription">Description</Label>
                <Input
                  id="ruleDescription"
                  value={editingRule.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Flag gun drill operations exceeding 60 minutes"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ruleActive">Active</Label>
                <Switch
                  id="ruleActive"
                  checked={editingRule.active}
                  onCheckedChange={(checked) => updateField('active', checked)}
                />
              </div>

              {/* Machines */}
              {editingRule.appliesTo?.machines !== false && (
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Machines</Label>
                  <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                    {machines.map((machine) => (
                      <div 
                        key={machine.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`machine-${machine.id}`}
                          checked={(editingRule.machineIds || []).includes(machine.id)}
                        onChange={() => toggleMachine(machine.id)}
                        className="rounded"
                      />
                      <label 
                        htmlFor={`machine-${machine.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {machine.name}
                      </label>
                    </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cycles */}
              {editingRule.appliesTo?.cycles !== false && (
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Cycles</Label>
                  <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                    {cycles.map((cycle) => (
                    <div 
                      key={cycle.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`cycle-${cycle.id}`}
                        checked={(editingRule.cycleIds || []).includes(cycle.id)}
                        onChange={() => toggleCycle(cycle.id)}
                        className="rounded"
                      />
                      <label 
                        htmlFor={`cycle-${cycle.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {cycle.name}
                      </label>
                    </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tool Patterns */}
              {editingRule.appliesTo?.tools !== false && (
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Tool Categories</Label>
                  <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                    {toolCategories.map((category) => (
                    <div 
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`tool-${category.id}`}
                        checked={category.patterns.some(p => (editingRule.toolPatterns || []).includes(p))}
                        onChange={() => toggleToolCategory(category)}
                        className="rounded"
                      />
                      <label 
                        htmlFor={`tool-${category.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isAdding ? 'Add Rule' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
