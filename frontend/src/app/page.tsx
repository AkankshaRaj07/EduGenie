'use client';

// Force Next.js recompile
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Calendar, 
  UploadCloud, 
  AlertCircle, 
  Loader2, 
  MoreVertical,
  Trash2,
  X,
  Search,
  Plus,
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  Filter,
  Mic,
  GripVertical,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
interface QuestionRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

const QUESTION_TYPES_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Answer Questions',
  'Case-Based Questions'
];

export default function Dashboard() {
  const router = useRouter();
  const { 
    assignments, 
    fetchAssignments, 
    submitAssignmentForm, 
    deleteAssignment,
    loading: storeLoading,
    viewState,
    setViewState,
    setToastMessage
  } = useAssignmentStore();
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAdditionalInstructions((prev) => prev ? prev + ' ' + transcript : transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Dynamic Question Config table state
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { id: '1', type: 'Multiple Choice Questions', count: 5, marks: 2 },
    { id: '2', type: 'Short Questions', count: 2, marks: 5 },
    { id: '3', type: 'Diagram/Graph-Based Questions', count: 2, marks: 5 },
    { id: '4', type: 'Numerical Problems', count: 2, marks: 5 },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check URL query parameters on mount to see if user requested to open create wizard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === 'true') {
        setTimeout(() => setViewState('create'), 0);
        // Clear param from URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('new');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, [setViewState]);

  // Fetch assignments history on mount
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync back to top on state transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewState]);

  // Computed sums
  const totalQuestions = questionRows.reduce((sum, row) => sum + row.count, 0);
  const totalMarks = questionRows.reduce((sum, row) => sum + (row.count * row.marks), 0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const validateFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'txt', 'jpg', 'jpeg', 'png'];
    if (!allowed.includes(ext || '')) {
      alert('Supported files: .pdf, .txt, .jpg, .jpeg, .png');
      return;
    }
    setFile(selectedFile);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    setDeleteModalId(id);
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    try {
      await deleteAssignment(deleteModalId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete assessment.');
    } finally {
      setDeleteModalId(null);
    }
  };

  // Dynamic Row Actions
  const handleAddRow = () => {
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setQuestionRows([
      ...questionRows,
      { id: newId, type: 'Multiple Choice Questions', count: 1, marks: 1 }
    ]);
  };

  const handleDeleteRow = (id: string) => {
    if (questionRows.length <= 1) {
      alert('You must have at least one question type row.');
      return;
    }
    setQuestionRows(questionRows.filter(row => row.id !== id));
  };

  const handleUpdateRow = (id: string, field: 'type' | 'count' | 'marks', value: string | number) => {
    setQuestionRows(questionRows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      const selected = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (questionRows.length === 0) {
      errors.rows = 'Add at least one question type row';
    }

    const invalidRow = questionRows.some(row => row.count <= 0 || row.marks <= 0);
    if (invalidRow) {
      errors.rows = 'All question counts and marks must be positive values';
    }

    setFormErrors(errors);
    
    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      setGeneralError(`Please fix the following: ${Object.values(errors).join(' | ')}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    return isValid;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setGeneralError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('dueDate', dueDate);
      
      const uniqueTypes = Array.from(new Set(questionRows.map(row => {
        // Map UI names to simple backend friendly names if preferred, or use row.type directly
        if (row.type === 'Multiple Choice Questions') return 'MCQ';
        if (row.type === 'Short Questions') return 'Short Answer';
        if (row.type === 'Long Answer Questions') return 'Long Answer';
        return row.type;
      })));
      formData.append('questionTypes', uniqueTypes.join(','));

      formData.append('numQuestions', totalQuestions.toString());
      formData.append('totalMarks', totalMarks.toString());

      // Prepend structural AI formatting instruction context
      let aiInstructions = ``;
      questionRows.forEach((row, index) => {
        const sectionLetter = String.fromCharCode(65 + index);
        aiInstructions += `- Section ${sectionLetter} (${row.type}): Generate exactly ${row.count} questions, each worth ${row.marks} marks.\n`;
      });
      
      const structuredPrompt = `[EXAM STRUCTURE REQUEST]:
Please arrange questions into distinct sections as follows:
${aiInstructions}
The total exam questions MUST equal exactly ${totalQuestions} and overall marks MUST sum to exactly ${totalMarks}.

[ADDITIONAL USER GUIDELINES]:
${additionalInstructions || 'None.'}`;

      formData.append('additionalInstructions', structuredPrompt);
      
      if (inputMethod === 'text' && pastedText.trim()) {
        const textFile = new File([pastedText], "pasted.txt", { type: "text/plain" });
        formData.append('file', textFile);
      } else if (inputMethod === 'file' && file) {
        formData.append('file', file);
      }

      const createdAssignment = await submitAssignmentForm(formData);
      
      resetForm();
      setViewState('list');
      router.push(`/assignment/${createdAssignment._id}`);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setQuestionRows([
      { id: '1', type: 'Multiple Choice Questions', count: 5, marks: 2 },
      { id: '2', type: 'Short Questions', count: 2, marks: 5 },
      { id: '3', type: 'Diagram/Graph-Based Questions', count: 2, marks: 5 },
      { id: '4', type: 'Numerical Problems', count: 2, marks: 5 },
    ]);
    setAdditionalInstructions('');
    setFile(null);
    setInputMethod('file');
    setPastedText('');
    setFormErrors({});
    setGeneralError(null);
  };

  // Format date helper: returns DD-MM-YYYY
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Client-side search and status filters
  const filteredAssignments = assignments.filter(asg => {
    const matchesSearch = asg.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || asg.status.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 py-2 w-full flex flex-col font-sans">
      
      {/* Removed duplicate header bar (now persistent in LayoutWrapper) */}

      {/* 2. Page Body Controller */}
      {viewState === 'list' ? (
        /* ==================== ASSIGNMENTS DASHBOARD LIST ==================== */
        <div className="flex-1 flex flex-col pt-2">
          


          {assignments.length > 0 && (
            <>
              {/* Header Row */}
              <div className="hidden md:flex flex-row items-start gap-3 mb-3 pl-0">
                <span className="w-5 h-5 mt-[1px] rounded-full bg-[#A7F3D0]/70 flex items-center justify-center shrink-0">
                  <span className="w-3 h-3 rounded-full bg-[#34D399]"></span>
                </span>
                <div>
                  <h1 className="text-[20px] font-black font-outfit text-[#1A1A1A] tracking-tight leading-none">
                    Assignments
                  </h1>
                  <p className="mt-1 text-[#9CA3AF] text-[13px] font-medium tracking-normal">
                    Manage and create assignments for your classes.
                  </p>
                </div>
              </div>

              {/* Filtering & Search Toolbar */}
              <div className="flex items-center bg-white rounded-[24px] shadow-sm p-2 mb-6 w-full border border-slate-100 gap-2">
                <div className="flex items-center gap-2 pl-4 pr-2 border-r border-slate-200 shrink-0">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] font-semibold text-slate-400 hidden sm:inline">Filter</span>
                  <span className="text-[13px] font-semibold text-slate-400 sm:hidden">Filter</span>
                </div>
                
                <div className="relative flex-1">
                  <div className="relative flex items-center bg-white">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Name"
                      className="w-full bg-transparent pl-8 pr-2 text-[13px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main List Rendering */}
          {storeLoading && assignments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 bg-white border border-slate-200/80 rounded-3xl">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-3" />
              <p className="text-sm text-slate-400 font-bold tracking-tight">Retrieving assessments database...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 w-full text-center">
              <div className="relative mb-0">
                <img 
                  src="/empty-state.svg" 
                  alt="No assignments illustration" 
                  className="w-[280px] h-[280px] mx-auto scale-105" 
                />
              </div>

              <h2 className="text-[20px] font-bold font-outfit text-[#1A1A1A]">
                No assignments yet
              </h2>
              <p className="text-[#7A7A7A] text-[13px] max-w-[340px] mx-auto mt-2.5 font-medium leading-[1.4] tracking-[-0.01em]">
                Create your first assignment to start collecting and
                grading student submissions. You can set up rubrics,
                define marking criteria, and let AI assist with grading.
              </p>

              <button
                onClick={() => setViewState('create')}
                className="mt-6 bg-[#1A1A1A] hover:bg-black text-white font-semibold text-[13px] py-3.5 px-6 rounded-full flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-[18px] h-[18px] stroke-[1.5]" /> Create Your First Assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24 relative">
              {filteredAssignments.map((asg) => (
                <div
                  key={asg._id}
                  onClick={() => router.push(`/assignment/${asg._id}`)}
                  className="bg-white rounded-[24px] md:rounded-[28px] p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[100px] md:min-h-[220px] cursor-pointer"
                >
                  {/* Card Header & Title */}
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-[16px] md:text-[22px] font-bold font-outfit text-[#1A1A1A] leading-snug">
                      {asg.title}
                    </h3>
                    
                    {/* Ellipsis Actions Menu Button */}
                    <div className="relative" ref={asg._id === activeDropdownId ? dropdownRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === asg._id ? null : asg._id);
                        }}
                        className="text-slate-400 hover:text-slate-600 transition"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Options */}
                      {activeDropdownId === asg._id && (
                        <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-1 w-40 z-30">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              router.push(`/assignment/${asg._id}`);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition text-left rounded-xl"
                          >
                            <span className="text-[13px] font-semibold text-[#1A1A1A]">View Assignment</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, asg._id)}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition text-left rounded-xl"
                          >
                            <span className="text-[13px] font-semibold text-[#E05058]">Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card bottom details */}
                  <div className="mt-4 md:mt-8 flex flex-row items-center gap-3 md:gap-0 justify-start md:justify-between text-[11px] md:text-[13px]">
                    <div className="text-slate-500">
                      <span className="font-bold text-[#1A1A1A]">Assigned on :</span> {formatDate(asg.createdAt)}
                    </div>
                    <div className="text-slate-500">
                      <span className="font-bold text-[#1A1A1A]">Due :</span> {formatDate(asg.dueDate)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* True CSS Bottom Blur Fade Overlay */}
              <div 
                className="fixed bottom-0 left-0 md:left-[272px] right-0 h-40 pointer-events-none z-30" 
                style={{ 
                  backdropFilter: 'blur(8px)', 
                  WebkitBackdropFilter: 'blur(8px)',
                  maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' 
                }} 
              />

              {/* Floating Action Button (Desktop Only) */}
              <div className="hidden md:flex fixed bottom-8 left-[50%] md:left-[calc(50%+144px)] transform -translate-x-1/2 z-40 flex-col items-center">
                <button
                  onClick={() => setViewState('create')}
                  className="bg-[#1A1A1A] hover:bg-black text-white font-medium text-[14px] py-2.5 px-6 rounded-full flex items-center gap-2.5 shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-[#333]"
                >
                  <Plus className="w-4 h-4 stroke-[2]" />
                  Create Assignment
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        
        /* ==================== CREATE ASSIGNMENT FORM WIZARD ==================== */
        <div className="flex-1 flex flex-col w-full pt-2">
          
          {/* Mobile Back Header */}
          <div className="md:hidden w-full flex flex-col mb-4 mt-2 px-2">
            <div className="flex items-center justify-center relative w-full mb-4">
              <button 
                onClick={() => setViewState('list')}
                className="absolute left-0 w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
              </button>
              <span className="font-bold text-[15px] font-outfit text-[#1A1A1A]">Create Assignment</span>
            </div>
            <div className="w-full flex gap-1.5">
              <div className="w-1/2 bg-[#4A4A4A] h-[3px] rounded-full"></div>
              <div className="w-1/2 bg-[#E5E5E5] h-[3px] rounded-full"></div>
            </div>
          </div>

          {/* Page Header (Desktop) */}
          <div className="hidden md:flex flex-row items-start gap-3 mb-3 pl-0">
            <span className="w-5 h-5 mt-[1px] rounded-full bg-[#A7F3D0]/70 flex items-center justify-center shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#34D399]"></span>
            </span>
            <div>
              <h1 className="text-[20px] font-black font-outfit text-brand-dark tracking-tight leading-none">
                Create Assignment
              </h1>
              <p className="mt-1 text-slate-400 text-[13px] font-medium tracking-normal">
                Set up a new assignment for your students
              </p>
            </div>
          </div>

          {/* Progress Indicator line (Desktop) */}
          <div className="hidden md:flex w-full max-w-4xl mx-auto gap-3 mb-6 items-center">
            <div className="h-1.5 w-[55%] bg-[#4A4A4A] rounded-full"></div>
            <div className="h-1.5 flex-1 bg-slate-200 rounded-full"></div>
          </div>

          {/* Error Message Box */}
          {generalError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-black">Creation Failed</p>
                <p className="opacity-90">{generalError}</p>
              </div>
            </div>
          )}

          {/* Assignment Details Card container */}
          <form onSubmit={onSubmit} className="bg-[#EAEAEA] md:bg-[#F2F2F2] border-none shadow-none md:shadow-sm rounded-[32px] md:rounded-[36px] p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto pb-[120px] md:pb-10">
            
            {/* Header info & Upload Card */}
            <div className="bg-transparent md:bg-transparent rounded-none p-1 shadow-none">
              <div className="mb-4 px-1">
                <h2 className="text-[18px] md:text-[20px] font-bold font-outfit text-[#1A1A1A] tracking-tight">Assignment Details</h2>
                <p className="text-[12px] text-[#7A7A7A] font-medium mt-0.5">Basic information about your assignment</p>
              </div>

              <div className="mb-6 px-1">
                <label className="block text-[13px] font-bold text-[#1A1A1A] mb-2 tracking-tight">
                  Assignment Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics Midterm Worksheet"
                  className={`w-full px-5 py-3.5 rounded-full bg-white md:bg-transparent border ${formErrors.title ? 'border-brand-primary' : 'border-[#D4D4D4]'} text-[13px] text-[#1A1A1A] font-medium placeholder-[#A3A3A3] focus:outline-none focus:border-[#1A1A1A] transition`}
                />
                {formErrors.title && (
                  <p className="mt-1.5 text-xs text-brand-primary font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.title}
                  </p>
                )}
              </div>

              {/* Grounding textbook upload box */}
              <div className="mt-2">
                <div className="flex justify-end mb-2">
                  <button 
                    type="button" 
                    onClick={() => setInputMethod(inputMethod === 'file' ? 'text' : 'file')}
                    className="text-[13px] font-bold text-brand-primary hover:text-brand-primary/80 transition underline"
                  >
                    {inputMethod === 'file' ? 'Or paste text instead' : 'Upload a document instead'}
                  </button>
                </div>
                
                {inputMethod === 'text' ? (
                  <div className="relative border-[2px] border-dashed border-[#D4D4D4] rounded-[24px] p-2 transition bg-[#FAFAFA] focus-within:border-brand-primary/50">
                    <textarea 
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your syllabus, topic list, or document content here..."
                      className="w-full h-[220px] resize-none bg-transparent p-4 text-[14px] text-[#1A1A1A] placeholder-[#A3A3A3] focus:outline-none rounded-[20px]"
                    />
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-[2px] border-dashed rounded-[24px] p-8 transition text-center flex flex-col items-center justify-center ${
                      dragActive 
                        ? 'border-[#E05058] bg-[#E05058]/5' 
                        : file 
                        ? 'border-emerald-300 bg-emerald-50/20' 
                        : 'border-[#D4D4D4] bg-[#FAFAFA] hover:border-[#A3A3A3]'
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    
                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-full mb-2">
                          <FileText className="w-5 h-5" />
                        </div>
                        <p className="text-[15px] font-bold text-slate-800 max-w-sm truncate">{file.name}</p>
                        <p className="text-[12px] text-slate-400 mt-1.5 mb-6">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="px-6 py-2 bg-rose-50 border border-rose-100 text-[#E05058] font-bold text-[13px] rounded-full hover:bg-rose-100 transition inline-block cursor-pointer"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full py-1">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm border border-slate-100">
                          <UploadCloud className="w-5 h-5 text-[#1A1A1A]" />
                        </div>
                        <p className="text-[13px] font-medium text-[#1A1A1A]">Choose a file or drag & drop it here</p>
                        <p className="text-[11px] text-[#A3A3A3] font-medium mt-1.5 mb-5 tracking-wide uppercase">JPEG, PNG, upto 10MB</p>
                        <span className="px-5 py-2 bg-white shadow-sm border border-slate-100 text-[#1A1A1A] font-bold text-[12px] rounded-full transition inline-block">
                          Browse Files
                        </span>
                      </label>
                    )}
                  </div>
                )}
                
                {inputMethod === 'file' && (
                  <p className="text-center text-[12px] md:text-[13px] text-[#7A7A7A] font-medium mt-4">Upload images of your preferred document/<br className="md:hidden"/>image</p>
                )}
              </div>
            </div>

            {/* Due Date row */}
            <div className="px-2 md:px-0">
              <label className="block text-[13px] font-bold text-[#1A1A1A] mb-2 tracking-tight">
                Due Date
              </label>
              <CustomDatePicker
                value={dueDate}
                onChange={setDueDate}
                error={!!formErrors.dueDate}
                buttonClassName="w-full px-5 py-3.5 rounded-full bg-transparent border border-[#D4D4D4] text-[13px] text-[#1A1A1A] font-medium placeholder-[#A3A3A3]"
              />
              {formErrors.dueDate && (
                <p className="mt-1 text-xs text-brand-primary font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.dueDate}
                </p>
              )}
            </div>

            {/* Dynamic Question Type Configuration */}
            <div className="px-2 md:px-0">
              <label className="block md:hidden text-[13px] font-bold text-[#1A1A1A] mb-3 tracking-tight">
                Question Type
              </label>
              {/* Table Headers (Desktop) */}
              <div className="hidden md:flex items-center text-[13px] font-bold text-[#1A1A1A] mb-3">
                <div className="flex-[2]">Question Type</div>
                <div className="w-36 text-center">No. of Questions</div>
                <div className="w-28 text-center">Marks</div>
              </div>

              {formErrors.rows && (
                <p className="text-xs text-brand-primary font-bold flex items-center gap-1 mb-3">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.rows}
                </p>
              )}

              {/* Desktop Rows List */}
              <div className="hidden md:block space-y-4">
                {questionRows.map((row) => (
                  <div key={row.id} className="flex items-center gap-3">
                    {/* Select Dropdown */}
                    <div className="flex-[2]">
                      <CustomSelect
                        value={row.type}
                        onChange={(val) => handleUpdateRow(row.id, 'type', val)}
                        options={QUESTION_TYPES_OPTIONS}
                        buttonClassName="bg-white border border-slate-200 rounded-full px-5 py-3 text-[13px] font-medium text-[#1A1A1A] shadow-sm w-full"
                      />
                    </div>
                    
                    {/* Delete Icon */}
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* No. of Questions */}
                    <div className="w-36 flex justify-center">
                      <div className="flex items-center bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm w-fit gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateRow(row.id, 'count', Math.max(1, row.count - 1))}
                          className="text-[#A3A3A3] hover:text-slate-600 transition font-black text-[13px]"
                        >
                          -
                        </button>
                        <span className="text-[13px] font-bold text-[#1A1A1A] min-w-[12px] text-center">{row.count}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRow(row.id, 'count', row.count + 1)}
                          className="text-[#A3A3A3] hover:text-slate-600 transition font-black text-[13px]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Marks */}
                    <div className="w-28 flex justify-center">
                      <div className="flex items-center bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm w-fit gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateRow(row.id, 'marks', Math.max(1, row.marks - 1))}
                          className="text-[#A3A3A3] hover:text-slate-600 transition font-black text-[13px]"
                        >
                          -
                        </button>
                        <span className="text-[13px] font-bold text-[#1A1A1A] min-w-[12px] text-center">{row.marks}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRow(row.id, 'marks', row.marks + 1)}
                          className="text-[#A3A3A3] hover:text-slate-600 transition font-black text-[13px]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Rows List */}
              <div className="md:hidden space-y-4">
                {questionRows.map((row) => (
                  <div key={row.id} className="bg-white rounded-[24px] p-4 shadow-sm relative">
                    {/* Top Row: Dropdown and X */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 pr-2">
                        <CustomSelect
                          value={row.type}
                          onChange={(val) => handleUpdateRow(row.id, 'type', val)}
                          options={QUESTION_TYPES_OPTIONS}
                          buttonClassName="bg-transparent text-[13px] font-medium text-[#1A1A1A] w-full border-none shadow-none p-0 flex justify-between items-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Row: Counters container */}
                    <div className="bg-[#F4F5F7] rounded-[16px] p-3 flex justify-between items-center">
                      
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-[12px] text-[#1A1A1A] font-medium mb-2">No. of Questions</span>
                        <div className="flex items-center bg-white rounded-full px-4 py-1.5 shadow-sm gap-4">
                          <button type="button" onClick={() => handleUpdateRow(row.id, 'count', Math.max(1, row.count - 1))} className="text-slate-400 hover:text-[#1A1A1A] font-medium text-[16px]">-</button>
                          <span className="text-[13px] font-bold text-[#1A1A1A] min-w-[16px] text-center">{row.count}</span>
                          <button type="button" onClick={() => handleUpdateRow(row.id, 'count', row.count + 1)} className="text-slate-400 hover:text-[#1A1A1A] font-medium text-[16px]">+</button>
                        </div>
                      </div>

                      <div className="flex flex-col items-center flex-1">
                        <span className="text-[12px] text-[#1A1A1A] font-medium mb-2">Marks</span>
                        <div className="flex items-center bg-white rounded-full px-4 py-1.5 shadow-sm gap-4">
                          <button type="button" onClick={() => handleUpdateRow(row.id, 'marks', Math.max(1, row.marks - 1))} className="text-slate-400 hover:text-[#1A1A1A] font-medium text-[16px]">-</button>
                          <span className="text-[13px] font-bold text-[#1A1A1A] min-w-[16px] text-center">{row.marks}</span>
                          <button type="button" onClick={() => handleUpdateRow(row.id, 'marks', row.marks + 1)} className="text-slate-400 hover:text-[#1A1A1A] font-medium text-[16px]">+</button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* Add Row Button & Running Totals banner */}
              <div className="flex flex-row items-center justify-between mt-6">
                
                {/* Unified Add Button */}
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center gap-3 px-1 cursor-pointer w-fit"
                >
                  <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-[13px] text-[#1A1A1A]">Add Question Type</span>
                </button>

                {/* Unified Totals */}
                <div className="flex flex-col items-end gap-1.5 px-2">
                  <p className="text-[13px] text-[#1A1A1A] font-medium tracking-tight">Total Questions : <span className="font-bold ml-1">{totalQuestions}</span></p>
                  <p className="text-[13px] text-[#1A1A1A] font-medium tracking-tight">Total Marks : <span className="font-bold ml-1">{totalMarks}</span></p>
                </div>

              </div>
            </div>

            {/* Additional Syllabus Guidelines */}
            <div className="px-2 md:px-0">
              <label className="block text-[13px] font-bold text-[#1A1A1A] tracking-tight mb-2">
                Additional Information (For better output)
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  className="w-full pl-5 pr-14 py-4 rounded-[24px] border-[2px] border-dashed border-[#D4D4D4] bg-transparent focus:ring-4 focus:ring-[#E05058]/10 focus:border-[#E05058] focus:outline-none transition text-[#1A1A1A] text-[13px] font-medium placeholder-[#A3A3A3]"
                />
                {/* Voice icon at bottom right of guidelines */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  title="Voice input"
                  className={`absolute right-4 bottom-4 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shadow-sm ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-white text-[#1A1A1A] hover:bg-slate-50'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Footer Navigation Buttons (Desktop) */}
            <div className="hidden md:flex flex-row items-center justify-between mt-12 border-t border-slate-200/60 pt-8">
              <button
                type="button"
                onClick={() => setViewState('list')}
                className="bg-white text-[#1A1A1A] font-medium text-[14px] px-6 py-3.5 rounded-full flex items-center justify-center gap-2 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#1A1A1A] hover:bg-black text-white font-medium text-[14px] px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Footer Navigation Buttons (Mobile Floating) */}
            <div className="md:hidden fixed bottom-[115px] left-0 right-0 flex items-center justify-center gap-4 z-40 px-4 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewState('list')}
                  className="bg-white text-[#1A1A1A] font-medium text-[14px] px-6 py-3.5 rounded-[24px] flex items-center justify-center gap-2 shadow-xl border border-slate-100 cursor-pointer w-[130px]"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#1A1A1A] text-white font-medium text-[14px] px-6 py-3.5 rounded-[24px] flex items-center justify-center gap-2 shadow-xl cursor-pointer w-[130px] disabled:opacity-70"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Next <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-4 md:p-5 max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5 text-[#E05058]" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit text-brand-dark mb-0.5">Delete Assessment</h3>
                <p className="text-[13px] font-semibold text-slate-500 leading-snug">
                  Are you sure you want to delete this assessment? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 rounded-full text-xs font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-full text-xs font-extrabold text-white bg-[#E05058] hover:bg-[#c83c44] transition shadow-sm shadow-[#E05058]/20 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
