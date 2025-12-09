import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface FinishWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (xtFile: File, previewImage: File, notes?: string) => void;
  plateId: string;
}

export default function FinishWorkModal({ isOpen, onClose, onConfirm, plateId }: FinishWorkModalProps) {
  const [xtFile, setXtFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (!xtFile) {
      toast.error('Please upload an X_T file');
      return;
    }
    if (!previewImage) {
      toast.error('Please upload a preview image');
      return;
    }

    onConfirm(xtFile, previewImage, notes.trim() || undefined);
    handleCancel(); // Reset form after confirm
  };

  const handleCancel = () => {
    setXtFile(null);
    setPreviewImage(null);
    setNotes('');
    onClose();
  };

  const canFinish = xtFile && previewImage;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Finish Work - {plateId}</span>
          </DialogTitle>
          <DialogDescription>
            Upload the required files to complete your work on this plate.
            Both X_T file and preview image are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* X_T File Upload */}
          <div className="space-y-2">
            <Label htmlFor="xt-file">Upload X_T File *</Label>
            <Input
              id="xt-file"
              type="file"
              accept=".x_t,.xt"
              onChange={(e) => setXtFile(e.target.files?.[0] || null)}
              required
            />
            {xtFile && (
              <p className="text-xs text-green-600">
                ✓ Selected: {xtFile.name}
              </p>
            )}
          </div>

          {/* Preview Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="preview-image">Upload Preview Image *</Label>
            <Input
              id="preview-image"
              type="file"
              accept="image/*"
              onChange={(e) => setPreviewImage(e.target.files?.[0] || null)}
              required
            />
            {previewImage && (
              <p className="text-xs text-green-600">
                ✓ Selected: {previewImage.name}
              </p>
            )}
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="finish-notes">Notes (Optional)</Label>
            <Textarea
              id="finish-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the completed work..."
              rows={3}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>* Required fields. The uploaded files will replace the current ones.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canFinish}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finish Work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}