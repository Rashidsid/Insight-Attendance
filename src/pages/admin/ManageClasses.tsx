import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
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

interface ClassSection {
  id: string;
  name: string;
  section: string;
}

export default function ManageClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', section: '' });

  // Load classes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('classes');
    if (stored) {
      setClasses(JSON.parse(stored));
    } else {
      // Default classes
      const defaultClasses = [
        { id: '1', name: '9', section: 'A' },
        { id: '2', name: '9', section: 'B' },
        { id: '3', name: '10', section: 'A' },
        { id: '4', name: '10', section: 'B' },
        { id: '5', name: '11', section: 'A' },
        { id: '6', name: '11', section: 'B' },
        { id: '7', name: '12', section: 'A' },
        { id: '8', name: '12', section: 'B' },
      ];
      setClasses(defaultClasses);
      localStorage.setItem('classes', JSON.stringify(defaultClasses));
    }
  }, []);

  // Save to localStorage whenever classes change
  const saveClasses = (updatedClasses: ClassSection[]) => {
    setClasses(updatedClasses);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.section.trim()) return;

    const newClass: ClassSection = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      section: formData.section.trim(),
    };

    saveClasses([...classes, newClass]);
    setFormData({ name: '', section: '' });
    setIsAdding(false);
  };

  const handleEdit = (classItem: ClassSection) => {
    setEditingId(classItem.id);
    setFormData({ name: classItem.name, section: classItem.section });
  };

  const handleUpdate = () => {
    if (!formData.name.trim() || !formData.section.trim()) return;

    const updatedClasses = classes.map((c) =>
      c.id === editingId
        ? { ...c, name: formData.name.trim(), section: formData.section.trim() }
        : c
    );

    saveClasses(updatedClasses);
    setEditingId(null);
    setFormData({ name: '', section: '' });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const updatedClasses = classes.filter((c) => c.id !== deleteId);
    saveClasses(updatedClasses);
    setDeleteId(null);
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
              className="gap-2 bg-[#A982D9] hover:bg-[#9770C8] rounded-xl h-12"
            >
              <Plus className="w-4 h-4" />
              Add New Class
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="p-6 mb-6 border-[#A982D9] border-2">
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
              className="gap-2 bg-[#A982D9] hover:bg-[#9770C8] rounded-xl"
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
            {classes.length === 0 ? (
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
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E7D7F6] text-[#A982D9]">
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
                        onClick={() => setDeleteId(classItem.id)}
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
