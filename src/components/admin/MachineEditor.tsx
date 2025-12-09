import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Server, 
  Cpu, 
  Gauge,
  Package,
  Weight,
  Droplet,
  Filter,
  Wrench
} from 'lucide-react';
import type { Machine } from '../../types/companyConfig';

interface MachineEditorProps {
  machines: Machine[];
  onUpdate: (machine: Machine) => Promise<void>;
  onAdd: (machine: Machine) => Promise<void>;
  onDelete: (machineId: string) => Promise<void>;
}

export default function MachineEditor({ 
  machines, 
  onUpdate, 
  onAdd, 
  onDelete 
}: MachineEditorProps) {
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const emptyMachine: Machine = {
    id: '',
    name: '',
    type: 'CNC Mill',
    manufacturer: 'DMG MORI',
    model: '',
    control: 'Heidenhain',
    controlVersion: '',
    axes: 5,
    maxSpindleSpeed: 18000,
    toolMagazineCapacity: 40,
    maxLoadWeight: 500,
    internalCoolant: true,
    internalAir: true,
    coolantType: 'Blaser Swisslube',
    fineCoolantFilter: false,
    fixtureSystem: 'Schunk',
    workEnvelope: {
      x: 650,
      y: 520,
      z: 475,
      unit: 'mm'
    },
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine({ ...machine });
    setIsAdding(false);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingMachine({ ...emptyMachine });
    setIsAdding(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingMachine) return;
    
    try {
      if (isAdding) {
        await onAdd(editingMachine);
      } else {
        await onUpdate(editingMachine);
      }
      setIsDialogOpen(false);
      setEditingMachine(null);
    } catch (error) {
      console.error('Failed to save machine:', error);
      alert(`Failed to save machine: ${error}`);
    }
  };

  const handleDelete = async (machineId: string) => {
    if (!confirm('Are you sure you want to delete this machine?')) return;
    
    try {
      await onDelete(machineId);
    } catch (error) {
      console.error('Failed to delete machine:', error);
      alert(`Failed to delete machine: ${error}`);
    }
  };

  const updateField = (field: keyof Machine, value: any) => {
    if (!editingMachine) return;
    setEditingMachine({ ...editingMachine, [field]: value });
  };

  const updateWorkEnvelope = (axis: 'x' | 'y' | 'z', value: number) => {
    if (!editingMachine) return;
    setEditingMachine({
      ...editingMachine,
      workEnvelope: {
        ...editingMachine.workEnvelope,
        [axis]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Machines</h3>
          <p className="text-sm text-muted-foreground">
            Manage your company's CNC machines and their specifications
          </p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Machine
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.map((machine) => (
          <Card key={machine.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    {machine.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {machine.manufacturer} {machine.model}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(machine)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(machine.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Cpu className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Control:</span>
                <span>{machine.control} {machine.controlVersion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Axes:</span>
                <span>{machine.axes}-axis</span>
                <span className="text-muted-foreground ml-2">Speed:</span>
                <span>{machine.maxSpindleSpeed} RPM</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Tools:</span>
                <span>{machine.toolMagazineCapacity || 'N/A'}</span>
                <Weight className="h-3 w-3 text-muted-foreground ml-2" />
                <span className="text-muted-foreground">Max Load:</span>
                <span>{machine.maxLoadWeight || 'N/A'} kg</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {machine.internalCoolant && (
                  <Badge variant="secondary" className="text-xs">
                    <Droplet className="h-3 w-3 mr-1" />
                    Coolant
                  </Badge>
                )}
                {machine.fineCoolantFilter && (
                  <Badge variant="secondary" className="text-xs">
                    <Filter className="h-3 w-3 mr-1" />
                    Fine Filter
                  </Badge>
                )}
                {machine.fixtureSystem && (
                  <Badge variant="secondary" className="text-xs">
                    <Wrench className="h-3 w-3 mr-1" />
                    {machine.fixtureSystem}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-white dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle>
              {isAdding ? 'Add New Machine' : `Edit ${editingMachine?.name}`}
            </DialogTitle>
            <DialogDescription>
              Configure machine specifications and capabilities
            </DialogDescription>
          </DialogHeader>

          {editingMachine && (
            <div className="space-y-4 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Machine ID</Label>
                  <Input
                    id="id"
                    value={editingMachine.id}
                    onChange={(e) => updateField('id', e.target.value)}
                    placeholder="dmu-65-monoblock"
                    disabled={!isAdding}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Machine Name</Label>
                  <Input
                    id="name"
                    value={editingMachine.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="DMU 65 Monoblock"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={editingMachine.manufacturer}
                    onChange={(e) => updateField('manufacturer', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={editingMachine.model}
                    onChange={(e) => updateField('model', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="control">Control</Label>
                  <Input
                    id="control"
                    value={editingMachine.control}
                    onChange={(e) => updateField('control', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="controlVersion">Control Version</Label>
                  <Input
                    id="controlVersion"
                    value={editingMachine.controlVersion}
                    onChange={(e) => updateField('controlVersion', e.target.value)}
                    placeholder="iTNC 530"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={editingMachine.type}
                    onChange={(e) => updateField('type', e.target.value)}
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Specifications</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="axes">Axes</Label>
                    <Input
                      id="axes"
                      type="number"
                      value={editingMachine.axes}
                      onChange={(e) => updateField('axes', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSpindleSpeed">Max Spindle Speed (RPM)</Label>
                    <Input
                      id="maxSpindleSpeed"
                      type="number"
                      value={editingMachine.maxSpindleSpeed}
                      onChange={(e) => updateField('maxSpindleSpeed', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toolMagazineCapacity">Tool Capacity</Label>
                    <Input
                      id="toolMagazineCapacity"
                      type="number"
                      value={editingMachine.toolMagazineCapacity || ''}
                      onChange={(e) => updateField('toolMagazineCapacity', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoadWeight">Max Load Weight (kg)</Label>
                    <Input
                      id="maxLoadWeight"
                      type="number"
                      value={editingMachine.maxLoadWeight || ''}
                      onChange={(e) => updateField('maxLoadWeight', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coolantType">Coolant Type</Label>
                    <Input
                      id="coolantType"
                      value={editingMachine.coolantType || ''}
                      onChange={(e) => updateField('coolantType', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fixtureSystem">Fixture System</Label>
                    <Input
                      id="fixtureSystem"
                      value={editingMachine.fixtureSystem || ''}
                      onChange={(e) => updateField('fixtureSystem', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Work Envelope */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Work Envelope (mm)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workX">X-Axis</Label>
                    <Input
                      id="workX"
                      type="number"
                      value={editingMachine.workEnvelope.x}
                      onChange={(e) => updateWorkEnvelope('x', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workY">Y-Axis</Label>
                    <Input
                      id="workY"
                      type="number"
                      value={editingMachine.workEnvelope.y}
                      onChange={(e) => updateWorkEnvelope('y', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workZ">Z-Axis</Label>
                    <Input
                      id="workZ"
                      type="number"
                      value={editingMachine.workEnvelope.z}
                      onChange={(e) => updateWorkEnvelope('z', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Capabilities</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="internalCoolant">Internal Coolant</Label>
                    <Switch
                      id="internalCoolant"
                      checked={editingMachine.internalCoolant}
                      onCheckedChange={(checked) => updateField('internalCoolant', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="internalAir">Internal Air</Label>
                    <Switch
                      id="internalAir"
                      checked={editingMachine.internalAir}
                      onCheckedChange={(checked) => updateField('internalAir', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fineCoolantFilter">Fine Coolant Filter</Label>
                    <Switch
                      id="fineCoolantFilter"
                      checked={editingMachine.fineCoolantFilter || false}
                      onCheckedChange={(checked) => updateField('fineCoolantFilter', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isAdding ? 'Add Machine' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
