import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

import { Input } from './ui/input';
import { AlertTriangle, Lock } from 'lucide-react';

interface StopWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
  plateId: string;
}

export default function StopWorkModal({ isOpen, onClose, onConfirm, plateId }: StopWorkModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  
  const isConfirmed = confirmationText === plateId;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm(`Work stopped - ${new Date().toLocaleString()}`);
      handleCancel(); // Reset form after confirm
    }
  };

  const handleCancel = () => {
    setConfirmationText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Stop Work - {plateId}</span>
          </DialogTitle>
          <DialogDescription>
            This action will stop your current work and release the plate for others to use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Icon and Plate Info */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-medium">{plateId}</h3>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>In Use</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>•</span>
                  <span>Active Work</span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              To confirm, type <span className="font-mono font-medium text-foreground">"{plateId}"</span> in the box below
            </div>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={plateId}
              className={`${
                confirmationText && !isConfirmed 
                  ? 'border-destructive focus:border-destructive focus:ring-destructive' 
                  : isConfirmed 
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : ''
              }`}
            />
            {confirmationText && !isConfirmed && (
              <p className="text-xs text-destructive">
                Plate ID doesn't match. Please type "{plateId}" exactly.
              </p>
            )}
          </div>


        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            Stop Work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}