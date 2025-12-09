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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Edit, Wrench } from 'lucide-react';
import type { ToolCategory } from '../../types/companyConfig';

interface ToolCategoryEditorProps {
  toolCategories: ToolCategory[];
  onUpdate: (category: ToolCategory) => Promise<void>;
}

export default function ToolCategoryEditor({ 
  toolCategories, 
  onUpdate 
}: ToolCategoryEditorProps) {
  const [editingCategory, setEditingCategory] = useState<ToolCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (category: ToolCategory) => {
    setEditingCategory({ ...category });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCategory) return;
    
    try {
      await onUpdate(editingCategory);
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save tool category:', error);
      alert(`Failed to save tool category: ${error}`);
    }
  };

  const updateField = (field: keyof ToolCategory, value: any) => {
    if (!editingCategory) return;
    setEditingCategory({ ...editingCategory, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Tool Categories</h3>
        <p className="text-sm text-muted-foreground">
          Manage tool categories and their naming patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {toolCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 font-mono">
                    {category.namePattern}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle>Edit Tool Category: {editingCategory?.name}</DialogTitle>
            <DialogDescription>
              Configure tool category and name pattern
            </DialogDescription>
          </DialogHeader>

          {editingCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={editingCategory.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="namePattern">Name Pattern (regex)</Label>
                <Input
                  id="namePattern"
                  value={editingCategory.namePattern}
                  onChange={(e) => updateField('namePattern', e.target.value)}
                  placeholder="^(drill|twist)"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Regular expression pattern to match tool names
                </p>
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
