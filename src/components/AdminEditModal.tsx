import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Shield, Save, X } from 'lucide-react';
import { LegacyUser, Plate } from '../App';
import { toast } from "sonner";

interface AdminEditModalProps {
  plate: Plate;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (plate: Plate) => void;
  user: LegacyUser;
}

export default function AdminEditModal({ plate, isOpen, onClose, onUpdate, user }: AdminEditModalProps) {
  const [formData, setFormData] = useState({
    name: plate.name || '',
    shelf: plate.shelf,
    health: plate.health,
    notes: plate.notes || ''
  });
  const [newPreviewImage, setNewPreviewImage] = useState<File | null>(null);
  const [newXTFile, setNewXTFile] = useState<File | null>(null);

  const handleSave = () => {
    const updatedPlate: Plate = {
      ...plate,
      name: formData.name || undefined,
      shelf: formData.shelf,
      health: formData.health,
      notes: formData.notes || undefined,
      lastModifiedBy: user.name,
      lastModifiedDate: new Date(),
      history: [
        {
          id: Date.now().toString(),
          action: 'Admin edit',
          user: user.name,
          date: new Date(),
          details: `Updated by administrator: ${getChanges()}`
        },
        ...plate.history
      ]
    };

    onUpdate(updatedPlate);
    toast.success('Plate updated successfully');
    onClose();
  };

  const getChanges = () => {
    const changes: string[] = [];
    if (formData.name !== (plate.name || '')) changes.push('name');
    if (formData.shelf !== plate.shelf) changes.push('shelf');
    if (formData.health !== plate.health) changes.push('health');
    if (formData.notes !== (plate.notes || '')) changes.push('notes');
    if (newPreviewImage) changes.push('preview image');
    if (newXTFile) changes.push('X_T file');
    return changes.join(', ') || 'no changes';
  };

  const handleCancel = () => {
    setFormData({
      name: plate.name || '',
      shelf: plate.shelf,
      health: plate.health,
      notes: plate.notes || ''
    });
    setNewPreviewImage(null);
    setNewXTFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Admin Edit - {plate.id}</span>
          </DialogTitle>
          <DialogDescription>
            Administrator mode: Edit plate properties and upload new files.
            Note: Plate ID cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="plate-id">Plate ID (Read Only)</Label>
              <Input
                id="plate-id"
                value={plate.id}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate-name">Plate Name</Label>
              <Input
                id="plate-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter plate name (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shelf-location">Shelf Location</Label>
              <Input
                id="shelf-location"
                value={formData.shelf}
                onChange={(e) => setFormData(prev => ({ ...prev, shelf: e.target.value }))}
                placeholder="e.g., A-12, B-05"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="health">Health Status</Label>
              <Select
                value={formData.health}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  health: value as Plate['health']
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">🟢 New</SelectItem>
                  <SelectItem value="used">🔵 Used</SelectItem>
                  <SelectItem value="locked">� Locked</SelectItem>
                  <SelectItem value="locked">🔴 Locked</SelectItem>
                  {/* Note: 'in-use' status cannot be set directly by admin */}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: "In Use" status can only be set by users starting work
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this plate..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">File Management</h3>
            
            <div className="space-y-2">
              <Label htmlFor="preview-upload">Replace Preview Image</Label>
              <Input
                id="preview-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setNewPreviewImage(e.target.files?.[0] || null)}
              />
              {newPreviewImage && (
                <p className="text-xs text-green-600">
                  ✓ New preview image selected: {newPreviewImage.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="xt-upload">Replace X_T File</Label>
              <Input
                id="xt-upload"
                type="file"
                accept=".x_t,.xt"
                onChange={(e) => setNewXTFile(e.target.files?.[0] || null)}
              />
              {newXTFile && (
                <p className="text-xs text-green-600">
                  ✓ New X_T file selected: {newXTFile.name}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Current Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Current Information</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Last Work: {plate.lastWorkName || 'None'}</p>
              <p>Last Modified: {plate.lastModifiedDate.toLocaleString()} by {plate.lastModifiedBy}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}