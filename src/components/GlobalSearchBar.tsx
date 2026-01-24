import { useEffect, useState } from 'react';
import { Search, X, Users, User } from 'lucide-react';
import { Input } from './ui/input';
import { getAllStudents } from '../services/studentService';
import { getAllTeachers } from '../services/teacherService';
import { useNavigate } from 'react-router';

interface SearchResult {
  id: string;
  type: 'student' | 'teacher';
  name: string;
  subtitle: string;
  data: any;
}

interface GlobalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function GlobalSearchBar({ value, onChange }: GlobalSearchBarProps) {
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);

  // Load all students and teachers on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [students, teachers] = await Promise.all([
          getAllStudents(),
          getAllTeachers(),
        ]);
        setAllStudents(students);
        setAllTeachers(teachers);
      } catch (error) {
        console.error('Error loading search data:', error);
      }
    };
    loadData();
  }, []);

  // Filter results based on search query
  useEffect(() => {
    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const query = value.toLowerCase();
    const filtered: SearchResult[] = [];

    // Search students
    allStudents.forEach((student) => {
      const name = `${student.firstName} ${student.lastName}`;
      if (
        name.toLowerCase().includes(query) ||
        student.rollNo?.toLowerCase().includes(query) ||
        student.class?.toLowerCase().includes(query)
      ) {
        filtered.push({
          id: student.id,
          type: 'student',
          name: name,
          subtitle: `${student.rollNo} - ${student.class}`,
          data: student,
        });
      }
    });

    // Search teachers
    allTeachers.forEach((teacher) => {
      const name = `${teacher.firstName} ${teacher.lastName}`;
      if (
        name.toLowerCase().includes(query) ||
        teacher.teacherId?.toLowerCase().includes(query) ||
        teacher.subject?.toLowerCase().includes(query)
      ) {
        filtered.push({
          id: teacher.id,
          type: 'teacher',
          name: name,
          subtitle: `${teacher.teacherId} - ${teacher.subject}`,
          data: teacher,
        });
      }
    });

    setResults(filtered.slice(0, 8)); // Limit to 8 results
    setIsOpen(filtered.length > 0);
  }, [value, allStudents, allTeachers]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'student') {
      navigate(`/admin/students/${result.id}`);
    } else if (result.type === 'teacher') {
      navigate(`/admin/teachers/${result.id}`);
    }
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search students, teachers..."
          className="h-12 pl-12 pr-10 rounded-xl border-gray-300"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.trim() && results.length > 0 && setIsOpen(true)}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {/* Students Section */}
            {results.filter((r) => r.type === 'student').length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 sticky top-0">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Students
                  </p>
                </div>
                {results
                  .filter((r) => r.type === 'student')
                  .map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-[#A982D9]/5 transition-colors flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#E7D7F6] text-[#A982D9] font-semibold text-sm">
                        {result.data.photo ? (
                          <img
                            src={result.data.photo}
                            alt={result.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          result.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.name}</p>
                        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                      </div>
                    </button>
                  ))}
              </div>
            )}

            {/* Teachers Section */}
            {results.filter((r) => r.type === 'teacher').length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 sticky top-0">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Teachers
                  </p>
                </div>
                {results
                  .filter((r) => r.type === 'teacher')
                  .map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-[#A982D9]/5 transition-colors flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#E7D7F6] text-[#A982D9] font-semibold text-sm">
                        {result.data.photo ? (
                          <img
                            src={result.data.photo}
                            alt={result.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          result.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.name}</p>
                        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* View All Link */}
          {results.length >= 8 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <button className="text-sm text-[#A982D9] font-medium hover:text-[#9770C8]">
                View all results
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {isOpen && value.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-6 text-center">
          <p className="text-gray-500 text-sm">No students or teachers found for "{value}"</p>
        </div>
      )}
    </div>
  );
}
