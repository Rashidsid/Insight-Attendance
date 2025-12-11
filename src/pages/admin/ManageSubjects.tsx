import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, BookOpen } from 'lucide-react';
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

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function ManageSubjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  // Load subjects from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('subjects');
    if (stored) {
      setSubjects(JSON.parse(stored));
    } else {
      // Default subjects
      const defaultSubjects = [
        { id: '1', name: 'Mathematics', code: 'MATH' },
        { id: '2', name: 'Physics', code: 'PHY' },
        { id: '3', name: 'Chemistry', code: 'CHEM' },
        { id: '4', name: 'Biology', code: 'BIO' },
        { id: '5', name: 'English', code: 'ENG' },
        { id: '6', name: 'History', code: 'HIST' },
        { id: '7', name: 'Geography', code: 'GEO' },
        { id: '8', name: 'Computer Science', code: 'CS' },
      ];
      setSubjects(defaultSubjects);
      localStorage.setItem('subjects', JSON.stringify(defaultSubjects));
    }
  }, []);

  // Save to localStorage whenever subjects change
  const saveSubjects = (updatedSubjects: Subject[]) => {
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.code.trim()) return;

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
    };

    saveSubjects([...subjects, newSubject]);
    setFormData({ name: '', code: '' });
    setIsAdding(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({ name: subject.name, code: subject.code });
  };

  const handleUpdate = () => {
    if (!formData.name.trim() || !formData.code.trim()) return;

    const updatedSubjects = subjects.map((s) =>
      s.id === editingId
        ? { ...s, name: formData.name.trim(), code: formData.code.trim().toUpperCase() }
        : s
    );

    saveSubjects(updatedSubjects);
    setEditingId(null);
    setFormData({ name: '', code: '' });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const updatedSubjects = subjects.filter((s) => s.id !== deleteId);
    saveSubjects(updatedSubjects);
    setDeleteId(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', code: '' });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          onClick={() => navigate('/admin/teachers')}
          variant="ghost"
          className="gap-2 mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1>Manage Subjects</h1>
            <p className="text-gray-600 mt-1">
              Add, edit, or remove subjects taught in your institution
            </p>
          </div>
          {!isAdding && !editingId && (
            <Button
              onClick={() => setIsAdding(true)}
              className="gap-2 bg-[#A982D9] hover:bg-[#9770C8] rounded-xl h-12"
            >
              <Plus className="w-4 h-4" />
              Add New Subject
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="p-6 mb-6 border-[#A982D9] border-2">
          <h3 className="mb-4">{isAdding ? 'Add New Subject' : 'Edit Subject'}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="subjectName">Subject Name *</Label>
              <Input
                id="subjectName"
                placeholder="e.g., Mathematics, Physics"
                className="h-12 rounded-xl mt-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subjectCode">Subject Code *</Label>
              <Input
                id="subjectCode"
                placeholder="e.g., MATH, PHY"
                className="h-12 rounded-xl mt-2"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={isAdding ? handleAdd : handleUpdate}
              className="gap-2 bg-[#A982D9] hover:bg-[#9770C8] rounded-xl"
            >
              <Save className="w-4 h-4" />
              {isAdding ? 'Add Subject' : 'Update Subject'}
            </Button>
            <Button onClick={handleCancel} variant="outline" className="gap-2 rounded-xl">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Subjects Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Subject Name</TableHead>
              <TableHead>Subject Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No subjects added yet. Click "Add New Subject" to get started.
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject, index) => (
                <TableRow key={subject.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E7D7F6] rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[#A982D9]" />
                      </div>
                      <span>{subject.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E7D7F6] text-[#A982D9]">
                      {subject.code}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => handleEdit(subject)}
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-lg"
                        disabled={editingId !== null || isAdding}
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => setDeleteId(subject.id)}
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
              This will permanently delete this subject. Teachers assigned to this subject
              may need to be reassigned.
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
