'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Save, 
  RefreshCw, 
  X, 
  AlertTriangle, 
  Printer, 
  Layers,
  Calendar,
  Loader2,
  Sparkles,
  ClipboardList,
  FileText,
  PenTool,
  Check,
  ChevronRight,
  User,
  Award,
  AlertCircle,
  HelpCircle,
  MoreVertical
} from 'lucide-react';
import { useAssignmentStore, ISection } from '../../../store/useAssignmentStore';
import { useWebSocket } from '../../../hooks/useWebSocket';

export default function AssignmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    activeAssignment,
    jobProgress,
    jobStatus,
    errorMessage,
    fetchAssignmentDetails,
    regenerateAssignment,
    updateAssignmentDetails,
    setViewState,
    
    // Submissions
    submissions,
    activeSubmission,
    submittingQuiz,
    gradingQuiz,
    fetchSubmissions,
    fetchSubmissionDetails,
    submitQuiz,
    gradeSubmission,
    setActiveSubmission,
    schoolName,
    schoolLocation
  } = useAssignmentStore();

  const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  const handleBack = () => {
    setViewState('list');
    router.push('/');
  };

  // Track background generation process via WebSockets
  useWebSocket(id);

  const [activeTab, setActiveTab] = useState<'paper' | 'quiz' | 'submissions' | 'submission_detail'>('paper');
  const [editMode, setEditMode] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localSections, setLocalSections] = useState<ISection[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Student quiz state
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [gradingProgressText, setGradingProgressText] = useState('Submitting answers...');

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Fetch details on mount
  useEffect(() => {
    if (id) {
      fetchAssignmentDetails(id).then((data) => {
        setLocalTitle(data.title);
        setLocalSections(JSON.parse(JSON.stringify(data.sections))); // Deep clone
      }).catch(err => console.error("Error loading assignment details:", err));
    }
  }, [id, fetchAssignmentDetails]);

  // Sync state if active assignment updates (e.g. from WebSocket completes)
  useEffect(() => {
    if (activeAssignment && !editMode) {
      const title = activeAssignment.title;
      const sections = JSON.parse(JSON.stringify(activeAssignment.sections));
      setTimeout(() => {
        setLocalTitle(title);
        setLocalSections(sections);
      }, 0);
    }
  }, [activeAssignment, editMode]);

  // Fetch submissions when entering Submissions tab
  useEffect(() => {
    if (id && activeTab === 'submissions') {
      fetchSubmissions(id).catch(err => console.error("Error loading submissions:", err));
    }
  }, [id, activeTab, fetchSubmissions]);

  // Animate grading progress text
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (submittingQuiz || gradingQuiz) {
      const texts = [
        'Transmitting answers to VedaAI server...',
        'Running initial MCQ choice matching...',
        'Constructing prompts for Gemini AI...',
        'Evaluating written answer response semantics...',
        'Gemini grading answers against rubric criteria...',
        'Allocating marks & generating performance feedback...',
        'Compiling student grade sheet...'
      ];
      let i = 0;
      setGradingProgressText(texts[0]);
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setGradingProgressText(texts[i]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [submittingQuiz, gradingQuiz]);

  const handleRegenerate = async () => {
    setConfirmModal({
      title: 'Regenerate Assessment',
      message: 'Are you sure you want to regenerate this question paper? This will overwrite all current questions and compile a new exam sheet.',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await regenerateAssignment(id);
        } catch {
          setAlertModal({ title: 'Error', message: 'Failed to trigger regeneration.' });
        }
      }
    });
  };

  const handleDownload = () => {
    if (activeAssignment?.pdfUrl) {
      window.open(`${BACKEND_BASE}${activeAssignment.pdfUrl}`, '_blank');
    } else {
      setAlertModal({ title: 'Not Ready', message: 'PDF is not available yet. It may still be generating.' });
    }
  };

  const handleSaveEdits = async () => {
    setSaving(true);
    try {
      await updateAssignmentDetails(id, {
        title: localTitle,
        sections: localSections
      });
      setEditMode(false);
    } catch {
      setAlertModal({ title: 'Error', message: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdits = () => {
    if (activeAssignment) {
      setLocalTitle(activeAssignment.title);
      setLocalSections(JSON.parse(JSON.stringify(activeAssignment.sections)));
    }
    setEditMode(false);
  };

  // Inline editor helper handlers
  const handleQuestionTextChange = (sIdx: number, qIdx: number, value: string) => {
    const updated = [...localSections];
    updated[sIdx].questions[qIdx].text = value;
    setLocalSections(updated);
  };

  const handleQuestionMarkChange = (sIdx: number, qIdx: number, value: number) => {
    const updated = [...localSections];
    updated[sIdx].questions[qIdx].marks = value;
    setLocalSections(updated);
  };

  const handleQuestionDifficultyChange = (sIdx: number, qIdx: number, value: 'Easy' | 'Moderate' | 'Hard') => {
    const updated = [...localSections];
    updated[sIdx].questions[qIdx].difficulty = value;
    setLocalSections(updated);
  };

  const handleOptionChange = (sIdx: number, qIdx: number, oIdx: number, value: string) => {
    const updated = [...localSections];
    const q = updated[sIdx].questions[qIdx];
    if (q.options) {
      q.options[oIdx] = value;
      setLocalSections(updated);
    }
  };

  const handleSectionTitleChange = (sIdx: number, value: string) => {
    const updated = [...localSections];
    updated[sIdx].title = value;
    setLocalSections(updated);
  };

  const handleSectionInstructionChange = (sIdx: number, value: string) => {
    const updated = [...localSections];
    updated[sIdx].instruction = value;
    setLocalSections(updated);
  };

  const handleQuestionCorrectAnswerChange = (sIdx: number, qIdx: number, value: string) => {
    const updated = [...localSections];
    updated[sIdx].questions[qIdx].correctAnswer = value;
    setLocalSections(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const getCleanInstructions = (text?: string) => {
    if (!text) return '';
    let result = text;
    if (result.includes('[ADDITIONAL USER GUIDELINES]:')) {
      const parts = result.split('[ADDITIONAL USER GUIDELINES]:');
      result = parts[parts.length - 1].trim();
    }
    result = result.replace(/Generate for \d+(?:\.\d+)?\s*hours?(?: exam)?\.?/ig, '').trim();
    return result;
  };

  // Student assessment handlers
  const handleStartQuiz = () => {
    if (!studentName.trim() || !rollNumber.trim()) {
      setAlertModal({ title: 'Required Fields', message: 'Please fill in Student Name and Roll Number.' });
      return;
    }
    setQuizStarted(true);
    setStudentAnswers({});
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeAssignment) return;
    setConfirmModal({
      title: 'Submit Quiz',
      message: 'Are you sure you want to submit your answers for AI grading?',
      onConfirm: async () => {
        setConfirmModal(null);
        // Flatten sections to list of questions for submission payload
        const answersPayload: any[] = [];
        activeAssignment.sections.forEach((sect) => {
          sect.questions.forEach((q) => {
            const questionId = q._id || '';
            answersPayload.push({
              questionId,
              questionText: q.text,
              studentAnswer: studentAnswers[questionId] || '',
              correctAnswer: q.correctAnswer || '',
              maxMarks: q.marks
            });
          });
        });

        try {
          await submitQuiz({
            assignmentId: id,
            studentName,
            rollNumber,
            section,
            answers: answersPayload
          });

          // Clear quiz states
          setQuizStarted(false);
          setStudentName('');
          setRollNumber('');
          setSection('');
          setStudentAnswers({});

          // View graded sheet
          setActiveTab('submission_detail');
        } catch (err) {
          setAlertModal({ title: 'Error', message: 'Submission failed. Check your connection and try again.' });
        }
      }
    });
  };

  const handleViewSubmission = async (sub: any) => {
    try {
      await fetchSubmissionDetails(sub._id);
      setActiveTab('submission_detail');
    } catch {
      setAlertModal({ title: 'Error', message: 'Failed to load submission details.' });
    }
  };

  const handleRegrade = async (subId: string) => {
    try {
      await gradeSubmission(subId);
    } catch {
      setAlertModal({ title: 'Error', message: 'Failed to trigger AI grading.' });
    }
  };

  // 1. LOADING / PROGRESS STATE
  if (jobStatus === 'pending' || jobStatus === 'processing') {
    let statusText = 'Job Queued...';
    if (jobProgress >= 20 && jobProgress < 40) statusText = 'Reading grounding study material...';
    else if (jobProgress >= 40 && jobProgress < 60) statusText = 'AI generating tailored examination questions...';
    else if (jobProgress >= 60 && jobProgress < 80) statusText = 'Structuring sections & balancing marks distribution...';
    else if (jobProgress >= 80) statusText = 'Compiling print-ready PDF layout...';

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[75vh]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center relative overflow-hidden animate-float">
          {/* Decorative design highlight */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl"></div>
          
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-brand-primary/10 border-t-brand-primary animate-spin"></div>
            <span className="absolute text-xl font-black text-brand-primary">{jobProgress}%</span>
          </div>

          <h2 className="text-xl font-black font-outfit text-brand-dark">Generating Assessment</h2>
          <p className="text-sm font-semibold text-brand-primary animate-pulse mt-1.5">{statusText}</p>
          
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-brand-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${jobProgress}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-slate-400 mt-6 leading-relaxed font-medium">
            Please do not close this window. Your custom paper is being generated and formatted on the server.
          </p>
        </div>
      </div>
    );
  }

  // 2. FAILED STATE
  if (jobStatus === 'failed' || errorMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[75vh]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-2xl p-8 text-center">
          <div className="p-4 bg-rose-50 text-brand-primary rounded-full inline-flex mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black font-outfit text-brand-dark">Generation Failed</h2>
          <p className="text-xs text-slate-500 mb-6 font-semibold mt-1 leading-relaxed">
            {errorMessage || 'An error occurred during AI processing. Gemini was unable to structure the responses.'}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 rounded-full transition text-sm cursor-pointer"
            >
              Back to Home
            </button>
            <button
              onClick={handleRegenerate}
              className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold py-3.5 rounded-full transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/10 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for data load
  if (!activeAssignment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-3" />
        <p className="text-sm text-slate-400 font-bold">Fetching assessment details...</p>
      </div>
    );
  }

  // 3. EXAM SHEET OUTPUT
  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-80px)] px-1 md:px-2 pt-1 pb-2">
      {/* Tab Navigation Menu (No-print) - Hidden to match exact screenshot */}
      <div className="hidden border-b border-slate-200 mb-6 no-print">
        <button
          onClick={() => { setActiveTab('paper'); setActiveSubmission(null); }}
          className={`py-3 px-6 text-xs sm:text-sm font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'paper' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Exam Paper
        </button>
        <button
          onClick={() => { setActiveTab('quiz'); setActiveSubmission(null); }}
          className={`py-3 px-6 text-xs sm:text-sm font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'quiz' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <PenTool className="w-4 h-4" /> Take Quiz
        </button>
        <button
          onClick={() => { setActiveTab('submissions'); setActiveSubmission(null); }}
          className={`py-3 px-6 text-xs sm:text-sm font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'submissions' || activeTab === 'submission_detail'
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Submissions Log
        </button>
      </div>

      {/* Top Action Toolbar (No-print) - Hidden to match exact screenshot */}
      <div className="hidden"></div>

      {/* NCERT warning alert banner (No-print) - Hidden to match exact screenshot */}
      <div className="hidden"></div>

      {/* -------------------- TAB 1: PRINTABLE EXAM SHEET (Pixel Perfect Match) -------------------- */}
      {activeTab === 'paper' && (
        <div className="bg-[#4A4A4A] rounded-[32px] flex-1 overflow-y-auto w-full p-3 sm:p-4 flex flex-col items-center shadow-xl">
          <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
          {/* Dark Gray Chat Bubble */}
          <div className="bg-[#2A2A2A] text-white rounded-3xl p-6 sm:p-8 mb-6 mt-2 w-full">
            <p className="font-semibold text-[15px] sm:text-[16px] leading-relaxed mb-6 font-outfit">
              Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={handleDownload} className="bg-white hover:bg-slate-50 text-[#1A1A1A] font-bold text-xs sm:text-[13px] py-2.5 px-5 rounded-full flex items-center gap-2 transition cursor-pointer w-max">
                <Download className="w-4 h-4 stroke-[2.5]" />
                Download as PDF
              </button>
              
              {/* Desktop Buttons */}
              <div className="hidden sm:flex flex-wrap items-center gap-3">
                {editMode ? (
                  <>
                    <button onClick={handleSaveEdits} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[13px] py-2.5 px-5 rounded-full flex items-center gap-2 transition cursor-pointer w-max">
                      <Save className="w-4 h-4 stroke-[2.5]" />
                      {saving ? 'Saving...' : 'Save Edits'}
                    </button>
                    <button onClick={handleCancelEdits} className="bg-transparent border border-slate-600 hover:bg-slate-800 text-white font-bold text-[13px] py-2.5 px-5 rounded-full flex items-center gap-2 transition cursor-pointer w-max">
                      <X className="w-4 h-4 stroke-[2.5]" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)} className="bg-transparent border border-slate-600 hover:bg-slate-800 text-white font-bold text-[13px] py-2.5 px-5 rounded-full flex items-center gap-2 transition cursor-pointer w-max">
                    <Edit className="w-4 h-4 stroke-[2.5]" />
                    Edit Mode
                  </button>
                )}
                <button onClick={handleRegenerate} className="bg-transparent border border-slate-600 hover:bg-slate-800 text-brand-primary font-bold text-[13px] py-2.5 px-5 rounded-full flex items-center gap-2 transition cursor-pointer w-max">
                  <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                  Regenerate AI
                </button>
                <button onClick={() => { setActiveTab('quiz'); setActiveSubmission(null); }} className="bg-transparent border border-slate-600 hover:bg-slate-800 text-[#a855f7] font-bold text-[13px] py-2.5 px-5 rounded-full flex items-center gap-2 transition cursor-pointer w-max">
                  <PenTool className="w-4 h-4 stroke-[2.5]" />
                  Take Quiz
                </button>
                <button onClick={() => { setActiveTab('submissions'); setActiveSubmission(null); }} className="bg-transparent border border-slate-600 hover:bg-slate-800 text-[#3b82f6] font-bold text-[13px] py-2.5 px-5 rounded-full flex items-center gap-2 transition cursor-pointer w-max">
                  <ClipboardList className="w-4 h-4 stroke-[2.5]" />
                  Responses
                </button>
              </div>

              {/* Mobile Menu */}
              <div className="relative sm:hidden ml-auto">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                  className="bg-transparent border border-slate-600 hover:bg-slate-800 text-white p-2.5 rounded-full flex items-center justify-center transition cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4 stroke-[2.5]" />
                </button>
                
                {mobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#2A2A2A] border border-slate-600 rounded-xl shadow-lg overflow-hidden z-50 flex flex-col p-2 gap-2">
                    {editMode ? (
                      <>
                        <button onClick={() => { handleSaveEdits(); setMobileMenuOpen(false); }} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 transition cursor-pointer w-full text-left">
                          <Save className="w-4 h-4 stroke-[2.5]" />
                          {saving ? 'Saving...' : 'Save Edits'}
                        </button>
                        <button onClick={() => { handleCancelEdits(); setMobileMenuOpen(false); }} className="bg-transparent hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 transition cursor-pointer w-full text-left">
                          <X className="w-4 h-4 stroke-[2.5]" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setEditMode(true); setMobileMenuOpen(false); }} className="bg-transparent hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 transition cursor-pointer w-full text-left">
                        <Edit className="w-4 h-4 stroke-[2.5]" />
                        Edit Mode
                      </button>
                    )}
                    <button onClick={() => { handleRegenerate(); setMobileMenuOpen(false); }} className="bg-transparent hover:bg-slate-700 text-brand-primary font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 transition cursor-pointer w-full text-left">
                      <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                      Regenerate AI
                    </button>
                    <button onClick={() => { setActiveTab('quiz'); setActiveSubmission(null); setMobileMenuOpen(false); }} className="bg-transparent hover:bg-slate-700 text-[#a855f7] font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 transition cursor-pointer w-full text-left">
                      <PenTool className="w-4 h-4 stroke-[2.5]" />
                      Take Quiz
                    </button>
                    <button onClick={() => { setActiveTab('submissions'); setActiveSubmission(null); setMobileMenuOpen(false); }} className="bg-transparent hover:bg-slate-700 text-[#3b82f6] font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 transition cursor-pointer w-full text-left">
                      <ClipboardList className="w-4 h-4 stroke-[2.5]" />
                      Responses
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* White Question Paper */}
          <div className="bg-white rounded-[32px] p-8 sm:p-12 sm:px-16 shadow-lg mb-10 text-[#1A1A1A] w-full border border-slate-100">
            <div className="text-center mb-10">
              <h1 className="text-2xl sm:text-[26px] font-bold mb-1 tracking-tight">
                {schoolName || 'Your School Name'}, {schoolLocation || 'City'}
              </h1>
              <h2 className="text-[17px] font-semibold mb-1">Subject: {activeAssignment.subject || 'N/A'}</h2>
              <h3 className="text-[15px] font-semibold">Class: {activeAssignment.classLevel || 'N/A'}</h3>
            </div>

            <div className="flex justify-between items-center text-[13px] font-semibold mb-8">
              <span>Time Allowed: 45 minutes</span>
              <span>Maximum Marks: {activeAssignment.totalMarks || 20}</span>
            </div>

            <p className="text-[13px] font-bold mb-8">
              All questions are compulsory unless stated otherwise.
            </p>

            <div className="flex flex-col gap-1.5 text-[13px] font-semibold mb-12">
              <div>Name: ______________________</div>
              <div>Roll Number: ________________</div>
              <div>Class: {activeAssignment.classLevel || '________'} Section: __________</div>
            </div>

            {/* Dynamic Mapping for Sections */}
            {localSections.length > 0 ? (
              localSections.map((section, sIdx) => (
                <div key={sIdx} className="mb-10">
                  <div className="text-center font-bold text-[15px] mb-8">{section.title}</div>
                  
                  <div className="mb-6">
                    <h4 className="font-bold text-[14px]">
                      {section.title}
                    </h4>
                    <p className="text-[11px] text-[#666666] italic mt-0.5">{section.instruction}</p>
                  </div>

                  <div className="space-y-5 text-[13px] leading-relaxed font-medium">
                    {section.questions.map((q, qIdx) => {
                      // Calculate continuous question numbering across sections
                      let globalIndex = 0;
                      for (let i = 0; i < sIdx; i++) {
                        globalIndex += localSections[i].questions.length;
                      }
                      globalIndex += (qIdx + 1);

                      return (
                        <div key={qIdx} className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-4 w-full">
                          <div className="flex-1 w-full">
                            {editMode ? (
                              <textarea 
                                value={q.text} 
                                onChange={(e) => handleQuestionTextChange(sIdx, qIdx, e.target.value)} 
                                className="w-full text-[13px] p-2 border border-slate-300 rounded mb-2 font-medium"
                                rows={2}
                              />
                            ) : (
                              <p className="leading-relaxed">
                                {globalIndex}. {q.text}
                              </p>
                            )}
                            {q.options && q.options.length > 0 && (
                              <ol className="list-[lower-alpha] ml-8 mt-2.5 space-y-1.5 text-slate-600 font-normal">
                                {q.options.map((opt, oIdx) => (
                                  <li key={oIdx} className="pl-1">
                                    {editMode ? (
                                      <input 
                                        type="text" 
                                        value={opt} 
                                        onChange={(e) => handleOptionChange(sIdx, qIdx, oIdx, e.target.value)} 
                                        className="w-full text-[13px] p-1 border border-slate-300 rounded"
                                      />
                                    ) : (
                                      opt.replace(/^[A-Da-d]\)\s*/, '')
                                    )}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                          <div className="flex flex-row items-center shrink-0 text-[12.5px] font-semibold gap-2 mt-2 sm:mt-0.5 whitespace-nowrap">
                            {editMode ? (
                              <>
                                <select 
                                  value={q.difficulty} 
                                  onChange={(e) => handleQuestionDifficultyChange(sIdx, qIdx, e.target.value as any)}
                                  className="border border-slate-300 rounded px-1 text-xs text-slate-700 bg-white"
                                >
                                  <option value="Easy">Easy</option>
                                  <option value="Moderate">Moderate</option>
                                  <option value="Hard">Hard</option>
                                </select>
                                <span className="text-slate-300">•</span>
                                <input 
                                  type="number" 
                                  value={q.marks} 
                                  onChange={(e) => handleQuestionMarkChange(sIdx, qIdx, parseInt(e.target.value))}
                                  className="border border-slate-300 rounded px-1 w-12 text-xs text-right text-slate-700 bg-white"
                                />
                                <span className="text-slate-500 font-bold">Marks</span>
                              </>
                            ) : (
                              <>
                                <span className={
                                  q.difficulty === 'Easy' ? 'text-emerald-600' : 
                                  q.difficulty === 'Moderate' ? 'text-amber-600' : 
                                  'text-red-600'
                                }>
                                  {q.difficulty}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 font-bold">
                                  [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="mb-10">
                <div className="text-center font-bold text-[15px] mb-8">Section A</div>
                <div className="mb-6">
                  <h4 className="font-bold text-[14px]">Short Answer Questions</h4>
                  <p className="text-[11px] text-[#666666] italic mt-0.5">Attempt all questions. Each question carries 2 marks</p>
                </div>
                <div className="space-y-5 text-[13px] leading-relaxed font-medium">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-2 w-full">
                    <p className="flex-1 w-full leading-relaxed">1. Define electroplating. Explain its purpose.</p>
                    <div className="flex flex-row items-center shrink-0 text-[12.5px] font-semibold gap-2 mt-2 sm:mt-0.5 whitespace-nowrap">
                      <span className="text-emerald-600">Easy</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-bold">[2 Marks]</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="font-bold text-[12px] mb-10 pt-4">End of Question Paper</div>

            <div className="mt-8">
              <h4 className="font-bold text-[14px] mb-5">Answer Key:</h4>
              <div className="space-y-4 text-[12px] leading-relaxed">
                {localSections.length > 0 ? (
                  localSections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-4">
                      {section.questions.map((q, qIdx) => {
                        let globalIndex = 0;
                        for (let i = 0; i < sIdx; i++) {
                          globalIndex += localSections[i].questions.length;
                        }
                        globalIndex += (qIdx + 1);

                        return (
                          <div key={qIdx} className="flex gap-2">
                            <span className="shrink-0">{globalIndex}.</span>
                            <span>{q.correctAnswer || "Answer not provided."}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="flex gap-2">
                    <span className="shrink-0">1.</span>
                    <span>Electroplating is the process of depositing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* -------------------- TAB 2: TAKE STUDENT ASSESSMENT -------------------- */}
      {activeTab === 'quiz' && (
        <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 sm:p-12 relative overflow-hidden flex-1 flex flex-col">
          {submittingQuiz || gradingQuiz ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[50vh]">
              <div className="max-w-md w-full text-center relative">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-brand-primary/10 border-t-brand-primary animate-spin"></div>
                  <Sparkles className="absolute text-brand-primary w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-xl font-black font-outfit text-brand-dark">Evaluating Answers</h2>
                <p className="text-sm font-semibold text-brand-primary animate-pulse mt-2">{gradingProgressText}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden">
                  <div className="bg-brand-primary h-full rounded-full w-2/3 animate-pulse"></div>
                </div>
                <p className="text-xs text-slate-400 mt-6 leading-relaxed font-medium">
                  Gemini is grading your responses based on assignment correct keys and criteria rubrics.
                </p>
              </div>
            </div>
          ) : !quizStarted ? (
            <div className="max-w-xl mx-auto w-full py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-brand-primary/5 flex items-center justify-center mb-6 text-brand-primary">
                <PenTool className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-outfit text-brand-dark mb-2">Student Assessment Portal</h2>
              <p className="text-sm text-slate-500 font-medium max-w-md mb-8">
                Welcome to the interactive assessment environment for <span className="font-bold text-slate-800">{activeAssignment.title}</span>. Enter your student details below to begin.
              </p>
              
              <div className="w-full space-y-4 bg-slate-50 border border-slate-200/85 rounded-2xl p-6 text-left mb-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-white text-slate-800 text-sm font-semibold border border-slate-200 rounded-xl p-3 focus:border-brand-primary focus:outline-none placeholder-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Roll Number / ID *
                    </label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full bg-white text-slate-800 text-sm font-semibold border border-slate-200 rounded-xl p-3 focus:border-brand-primary focus:outline-none placeholder-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Class / Section
                    </label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. Grade 10-A"
                      className="w-full bg-white text-slate-800 text-sm font-semibold border border-slate-200 rounded-xl p-3 focus:border-brand-primary focus:outline-none placeholder-slate-300"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full text-sm font-black transition shadow-lg shadow-brand-primary/10 cursor-pointer w-full max-w-sm"
              >
                Start Assessment
              </button>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col">
              {/* Quiz Header */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-5 mb-8">
                <div>
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-2.5 py-1 rounded-full">Assessment Mode</span>
                  <h2 className="text-xl font-black font-outfit text-brand-dark mt-1.5">{activeAssignment.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-400 mt-1">
                    <span>Student: <strong className="text-slate-600">{studentName}</strong></span>
                    <span>Roll No: <strong className="text-slate-600">{rollNumber}</strong></span>
                    {section && <span>Section: <strong className="text-slate-600">{section}</strong></span>}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setConfirmModal({
                      title: 'Cancel Assessment',
                      message: 'Are you sure you want to exit the assessment? Your typed answers will be lost.',
                      onConfirm: () => {
                        setQuizStarted(false);
                        setConfirmModal(null);
                      }
                    });
                  }}
                  className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-full transition cursor-pointer"
                >
                  Cancel Assessment
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-10 flex-1">
                {activeAssignment.sections.map((sect, sIdx) => (
                  <div key={sIdx} className="space-y-6">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">{sect.title}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold italic mt-0.5">{sect.instruction}</p>
                    </div>
                    <div className="space-y-8">
                      {sect.questions.map((q, qIdx) => {
                        const questionId = q._id || `${sIdx}-${qIdx}`;
                        const hasOptions = q.options && q.options.length > 0;
                        const currentAnswer = studentAnswers[questionId] || '';

                        return (
                          <div key={questionId} className="flex flex-col gap-3">
                            <div className="flex justify-between items-start gap-4">
                              <p className="text-brand-dark font-bold text-sm leading-relaxed">
                                <span className="font-extrabold mr-1.5">{qIdx + 1}.</span>
                                {q.text}
                              </p>
                              <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                                {q.marks} Marks
                              </span>
                            </div>

                            {hasOptions && q.options ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                                {q.options.map((opt, oIdx) => {
                                  const optionLabel = String.fromCharCode(97 + oIdx); // a, b, c, d
                                  const isSelected = currentAnswer === opt;
                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => handleSelectOption(questionId, opt)}
                                      className={`text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                                        isSelected
                                          ? 'border-brand-primary bg-brand-primary/5 text-brand-dark font-bold'
                                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                                      }`}
                                    >
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black border text-[10px] uppercase ${
                                        isSelected
                                          ? 'bg-brand-primary border-brand-primary text-white'
                                          : 'border-slate-300 bg-slate-50 text-slate-400'
                                      }`}>
                                        {optionLabel}
                                      </span>
                                      <span className="flex-1">{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="pl-4">
                                <textarea
                                  value={currentAnswer}
                                  onChange={(e) => handleTextAnswerChange(questionId, e.target.value)}
                                  placeholder="Type your explanation answer details here..."
                                  rows={3}
                                  className="w-full px-4 py-3 text-xs text-slate-700 border border-slate-200 rounded-xl focus:border-brand-primary focus:outline-none font-semibold leading-relaxed placeholder-slate-300 bg-slate-50/50"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="border-t border-slate-100 pt-6 mt-10 flex justify-end">
                <button
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full text-sm font-black transition flex items-center gap-2 shadow-lg shadow-brand-primary/10 cursor-pointer"
                >
                  Submit Assessment <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- TAB 3: SUBMISSIONS LOG -------------------- */}
      {activeTab === 'submissions' && (
        <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 sm:p-12 relative overflow-hidden flex-1 flex flex-col">
          {/* Performance Analytics metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Attempts</span>
                <strong className="text-xl font-black font-outfit text-brand-dark">{submissions.length}</strong>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Class Average</span>
                <strong className="text-xl font-black font-outfit text-brand-dark">
                  {submissions.filter(s => s.status === 'graded').length > 0
                    ? `${Math.round((submissions.filter(s => s.status === 'graded').reduce((sum, s) => sum + s.totalScore, 0) / submissions.filter(s => s.status === 'graded').length) * 10) / 10} / ${activeAssignment.totalMarks}`
                    : `N/A`}
                </strong>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Highest Score</span>
                <strong className="text-xl font-black font-outfit text-brand-dark">
                  {submissions.filter(s => s.status === 'graded').length > 0
                    ? `${Math.max(...submissions.filter(s => s.status === 'graded').map(s => s.totalScore))} / ${activeAssignment.totalMarks}`
                    : `N/A`}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">Submissions Log</h3>
            <span className="text-xs font-bold text-slate-400">{submissions.length} attempts recorded</span>
          </div>

          {submissions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
              <ClipboardList className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-brand-dark">No Submissions Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Share this assessment with students or switch to the "Take Quiz" tab to submit your first response paper.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-8 sm:-mx-12">
              <div className="inline-block min-w-full align-middle px-8 sm:px-12">
                <div className="overflow-hidden border border-slate-200/80 rounded-2xl">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Student Info</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Roll No</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Section</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">AI Status</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {submissions.map((sub) => (
                        <tr key={sub._id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-dark">{sub.studentName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-slate-500 uppercase tracking-widest">{sub.rollNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-500">{sub.section || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-400">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sub.status === 'graded' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full uppercase tracking-wider">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Graded
                              </span>
                            ) : sub.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-100 rounded-full uppercase tracking-wider animate-pulse">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Grading...
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-100 rounded-full uppercase tracking-wider">
                                <AlertCircle className="w-2.5 h-2.5" /> Failed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-brand-dark">
                            {sub.status === 'graded' ? `${sub.totalScore} / ${sub.totalMaxMarks}` : '--'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
                            <button
                              onClick={() => handleViewSubmission(sub)}
                              className="text-brand-primary hover:text-brand-primary-hover font-black flex items-center justify-end gap-1.5 ml-auto cursor-pointer"
                            >
                              Grade Sheet <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- TAB 4: SUBMISSION DETAIL / GRADE SHEET -------------------- */}
      {activeTab === 'submission_detail' && activeSubmission && (
        <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 sm:p-12 relative overflow-hidden flex-1 flex flex-col">
          {/* Grade sheet details header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8 no-print">
            <button
              onClick={() => { setActiveTab('submissions'); setActiveSubmission(null); }}
              className="px-4 py-2 border border-slate-200 rounded-full text-xs font-black text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Log
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 rounded-full text-xs font-black text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Grade Sheet
              </button>
              {activeSubmission.status !== 'graded' && (
                <button
                  onClick={() => handleRegrade(activeSubmission._id)}
                  disabled={gradingQuiz}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/10 disabled:opacity-50"
                >
                  {gradingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Grade now
                </button>
              )}
              {activeSubmission.status === 'graded' && (
                <button
                  onClick={() => handleRegrade(activeSubmission._id)}
                  disabled={gradingQuiz}
                  className="px-4 py-2 border border-slate-200 rounded-full text-xs font-black text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {gradingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Regrade with AI
                </button>
              )}
            </div>
          </div>

          {/* Immersive grading loading state */}
          {gradingQuiz ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[40vh]">
              <div className="max-w-md w-full text-center">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-black font-outfit text-brand-dark">AI Grading in progress...</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium">Gemini is analyzing student written answers against the correct rubrics.</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col">
              {/* Student Info Card & radial progress meter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-2 border-slate-100 rounded-3xl p-6 mb-8 bg-slate-50/20">
                <div className="md:col-span-2 flex flex-col justify-center">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5 w-max uppercase tracking-wider mb-3">
                    Assessment Report Card
                  </span>
                  <h1 className="text-2xl font-black font-outfit text-brand-dark uppercase tracking-tight">
                    {activeSubmission.studentName}
                  </h1>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div>Roll Number: <strong className="text-brand-dark font-black">{activeSubmission.rollNumber}</strong></div>
                    <div>Section: <strong className="text-brand-dark font-black">{activeSubmission.section || 'N/A'}</strong></div>
                    <div>Graded Date: <strong className="text-brand-dark font-black">
                      {activeSubmission.gradedAt ? new Date(activeSubmission.gradedAt).toLocaleDateString() : 'Pending'}
                    </strong></div>
                  </div>
                </div>
                
                <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col items-center justify-center text-center">
                  <div className="relative w-28 h-28 flex items-center justify-center mb-1">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="48" 
                        stroke="#E05058" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - (activeSubmission.status === 'graded' ? activeSubmission.totalScore / activeSubmission.totalMaxMarks : 0))}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-brand-dark font-outfit">
                      <strong className="text-2xl font-black">{activeSubmission.status === 'graded' ? activeSubmission.totalScore : '--'}</strong>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-200 mt-0.5 pt-0.5">OUT OF {activeSubmission.totalMaxMarks}</span>
                    </div>
                  </div>
                  {activeSubmission.status === 'graded' && (
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                      Score Percentage: {Math.round((activeSubmission.totalScore / activeSubmission.totalMaxMarks) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Individual Question Graded Breakdown */}
              <div className="space-y-8 mt-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Question Breakdown & AI Feedback</h3>
                <div className="space-y-8 divide-y divide-slate-100">
                  {activeSubmission.answers.map((ans, aIdx) => {
                    const isPerfect = ans.marksObtained === ans.maxMarks;
                    const isZero = ans.marksObtained === 0;
                    const borderClass = isPerfect 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : isZero 
                        ? 'border-rose-200 bg-rose-50/20' 
                        : 'border-amber-200 bg-amber-50/20';
                    const textBadgeColor = isPerfect 
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                      : isZero 
                        ? 'text-rose-700 bg-rose-50 border-rose-100' 
                        : 'text-amber-700 bg-amber-50 border-amber-100';

                    return (
                      <div key={ans._id || aIdx} className={`pt-8 ${aIdx === 0 ? 'pt-0' : ''} flex flex-col gap-3.5`}>
                        {/* Question and Marks */}
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-slate-800 font-bold text-sm leading-relaxed">
                            <span className="font-extrabold mr-1.5">{aIdx + 1}.</span>
                            {ans.questionText}
                          </p>
                          <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                            Weightage: {ans.maxMarks} M
                          </span>
                        </div>

                        {/* Student Answer */}
                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 pl-5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Student response</span>
                          <p className="text-slate-800 text-xs font-medium leading-relaxed italic">
                            "{ans.studentAnswer || '(No answer provided)'}"
                          </p>
                        </div>

                        {/* Answer Key Guideline */}
                        {ans.correctAnswer && (
                          <div className="pl-5 text-xs text-slate-500 font-medium">
                            <strong className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Correct Answer Guideline</strong>
                            <p className="text-slate-600 bg-slate-100/50 border border-slate-200/40 rounded-xl p-3">{ans.correctAnswer}</p>
                          </div>
                        )}

                        {/* AI Evaluation */}
                        <div className={`border rounded-2xl p-4 pl-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${borderClass}`}>
                          <div className="flex-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Gemini Examiner Feedback</span>
                            <p className="text-slate-700 text-xs font-semibold leading-relaxed">
                              {ans.feedback || 'Evaluation details pending AI review.'}
                            </p>
                          </div>
                          <div className={`shrink-0 flex items-center justify-center px-4 py-2 border rounded-full text-xs font-black uppercase tracking-wider ${textBadgeColor}`}>
                            Score: {ans.marksObtained} / {ans.maxMarks} Marks
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-4 md:p-5 max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit text-brand-dark mb-0.5">{alertModal.title}</h3>
                <p className="text-[13px] font-semibold text-slate-500 leading-snug">
                  {alertModal.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAlertModal(null)}
                className="px-4 py-2 rounded-full text-xs font-extrabold text-white bg-brand-dark hover:bg-black transition shadow-sm cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-4 md:p-5 max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit text-brand-dark mb-0.5">{confirmModal.title}</h3>
                <p className="text-[13px] font-semibold text-slate-500 leading-snug">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-full text-xs font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 rounded-full text-xs font-extrabold text-white bg-brand-primary hover:bg-brand-primary-hover transition shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
