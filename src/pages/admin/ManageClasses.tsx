import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { getAllClasses, addClass, updateClass, deleteClass } from '../../services/classService';
import type { Class } from '../../services/classService';

interface ClassSection extends Class {}

export default function ManageClasses() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', section: '' });
  const [loading, setLoading] = useState(true);

  // Load classes from Firebase
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.section.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addClass({
        name: formData.name.trim(),
        section: formData.section.trim(),
      });
      toast.success('Class added successfully');
      setFormData({ name: '', section: '' });
      setIsAdding(false);
      await loadClasses();
    } catch (error) {
      console.error('Error adding class:', error);
      toast.error('Failed to add class');
    }
  };

  const handleEdit = (classItem: ClassSection) => {
    if (classItem.id) {
      setEditingId(classItem.id);
      setFormData({ name: classItem.name, section: classItem.section });
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim() || !formData.section.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!editingId) return;

    try {
      await updateClass(editingId, {
        name: formData.name.trim(),
        section: formData.section.trim(),
      });
      toast.success('Class updated successfully');
      setEditingId(null);
      setFormData({ name: '', section: '' });
      await loadClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Failed to update class');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteClass(deleteId);
      toast.success('Class deleted successfully');
      setDeleteId(null);
      await loadClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', section: '' });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          onClick={() => navigate('/admin/students')}
          variant="ghost"
          className="gap-2 mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1>Manage Classes & Sections</h1>
            <p className="text-gray-600 mt-1">
              Add, edit, or remove class sections for your institution
            </p>
          </div>
          {!isAdding && !editingId && (
            <Button
              onClick={() => setIsAdding(true)}
              style={{ backgroundColor: theme.primaryColor }}
              className="gap-2 hover:opacity-90 rounded-xl h-12"
            >
              <Plus className="w-4 h-4" />
              Add New Class
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card 
          className="p-6 mb-6 border-2"
          style={{ borderColor: theme.primaryColor }}
        >
          <h3 className="mb-4">{isAdding ? 'Add New Class' : 'Edit Class'}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="className">Class Name *</Label>
              <Input
                id="className"
                placeholder="e.g., 9, 10, 11, 12"
                className="h-12 rounded-xl mt-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="section">Section *</Label>
              <Input
                id="section"
                placeholder="e.g., A, B, C"
                className="h-12 rounded-xl mt-2"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={isAdding ? handleAdd : handleUpdate}
              style={{ backgroundColor: theme.primaryColor }}
              className="gap-2 hover:opacity-90 rounded-xl"
            >
              <Save className="w-4 h-4" />
              {isAdding ? 'Add Class' : 'Update Class'}
            </Button>
            <Button onClick={handleCancel} variant="outline" className="gap-2 rounded-xl">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Classes Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Class Name</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Loading classes...
                </TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No classes added yet. Click "Add New Class" to get started.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((classItem, index) => (
                <TableRow key={classItem.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{classItem.name}</TableCell>
                  <TableCell>{classItem.section}</TableCell>
                  <TableCell>
                    <span 
                      className="inline-flex items-center px-3 py-1 rounded-full"
                      style={{ 
                        backgroundColor: theme.sidebarBg,
                        color: theme.primaryColor 
                      }}
                    >
                      {classItem.name}-{classItem.section}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => handleEdit(classItem)}
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-lg"
                        disabled={editingId !== null || isAdding}
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => classItem.id && setDeleteId(classItem.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={editingId !== null || isAdding}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this class. Students assigned to this class may
              need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
