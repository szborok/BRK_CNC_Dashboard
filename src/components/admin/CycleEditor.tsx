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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Edit, Repeat } from 'lucide-react';
import type { Cycle } from '../../types/companyConfig';

interface CycleEditorProps {
  cycles: Cycle[];
  onUpdate: (cycle: Cycle) => Promise<void>;
}

export default function CycleEditor({ cycles, onUpdate }: CycleEditorProps) {
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (cycle: Cycle) => {
    setEditingCycle({ ...cycle });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCycle) return;
    
    try {
      await onUpdate(editingCycle);
      setIsDialogOpen(false);
      setEditingCycle(null);
    } catch (error) {
      console.error('Failed to save cycle:', error);
      alert(`Failed to save cycle: ${error}`);
    }
  };

  const updateField = (field: keyof Cycle, value: any) => {
    if (!editingCycle) return;
    setEditingCycle({ ...editingCycle, [field]: value });
  };

  const updateParameters = (value: string) => {
    if (!editingCycle) return;
    const params = value.split(',').map(p => p.trim()).filter(Boolean);
    setEditingCycle({ ...editingCycle, parameters: params });
  };

  const updateMachineTypes = (value: string) => {
    if (!editingCycle) return;
    const types = value.split(',').map(t => t.trim()).filter(Boolean);
    setEditingCycle({ ...editingCycle, machineTypes: types });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Cycles</h3>
        <p className="text-sm text-muted-foreground">
          Manage CNC machining cycles and their parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cycles.map((cycle) => (
          <Card key={cycle.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    {cycle.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {cycle.description}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEdit(cycle)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cycle.type}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Parameters:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {cycle.parameters.slice(0, 3).map((param, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {param}
                    </Badge>
                  ))}
                  {cycle.parameters.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{cycle.parameters.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle>Edit Cycle: {editingCycle?.name}</DialogTitle>
            <DialogDescription>
              Configure cycle parameters and settings
            </DialogDescription>
          </DialogHeader>

          {editingCycle && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cycleName">Cycle Name</Label>
                <Input
                  id="cycleName"
                  value={editingCycle.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycleType">Type</Label>
                <Input
                  id="cycleType"
                  value={editingCycle.type}
                  onChange={(e) => updateField('type', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycleDescription">Description</Label>
                <Input
                  id="cycleDescription"
                  value={editingCycle.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="machineTypes">Machine Types (comma separated)</Label>
                <Input
                  id="machineTypes"
                  value={editingCycle.machineTypes.join(', ')}
                  onChange={(e) => updateMachineTypes(e.target.value)}
                  placeholder="CNC Mill, CNC Lathe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parameters">Parameters (comma separated)</Label>
                <Input
                  id="parameters"
                  value={editingCycle.parameters.join(', ')}
                  onChange={(e) => updateParameters(e.target.value)}
                  placeholder="depth, feedRate, spindleSpeed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={editingCycle.icon}
                  onChange={(e) => updateField('icon', e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
