'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Award, 
  FileText, 
  Plus, 
  Sparkles, 
  Calendar, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  ArrowRight,
  Lightbulb,
  Trash2
} from 'lucide-react';
import { useAssignmentStore } from '../../store/useAssignmentStore';

export default function HomePage() {
  const router = useRouter();
  const { 
    dashboardStats, 
    dashboardTasks, 
    fetchDashboardStats, 
    fetchDashboardTasks, 
    addDashboardTask, 
    toggleDashboardTask, 
    deleteDashboardTask, 
    setToastMessage, 
    setViewState,
    userName,
    schoolName 
  } = useAssignmentStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskClass, setNewTaskClass] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    fetchDashboardTasks();
  }, [fetchDashboardStats, fetchDashboardTasks]);

  const handleToggleTask = async (id: string) => {
    try {
      await toggleDashboardTask(id);
      setToastMessage("Task status updated!");
    } catch (err: any) {
      setToastMessage("Failed to update task.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDashboardTask(id);
      setToastMessage("Task removed.");
    } catch (err: any) {
      setToastMessage("Failed to delete task.");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addDashboardTask({
        title: newTaskTitle,
        class: newTaskClass || 'General',
        time: 'Today'
      });
      setNewTaskTitle('');
      setNewTaskClass('');
      setToastMessage("Task added to schedule!");
    } catch (err: any) {
      setToastMessage("Failed to create task.");
    }
  };

  const handleLaunchCreate = () => {
    setViewState('create');
    router.push('/?new=true');
  };

  return (
    <div className="flex-1 pb-8 w-full flex flex-col font-sans animate-fadeIn transition-colors">
      {/* 1. Header Hero Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-outfit text-brand-dark dark:text-white tracking-tight leading-none transition-colors">
            Welcome Back, <span className="text-[#E05058]">{userName.split(' ')[0]}</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-semibold transition-colors">
            Here's what requires your attention at {schoolName} today.
          </p>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-sm text-xs font-black text-slate-700 dark:text-slate-200 self-start md:self-auto transition-colors">
          <Calendar className="w-4 h-4 text-[#E05058]" />
          <span>Thursday, 21 May 2026</span>
        </div>
      </div>

      {/* 2. Overview Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Active Evaluations */}
        <div className="bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Evaluation Attempts</p>
              <h3 className="text-2xl font-black font-outfit text-brand-dark dark:text-white mt-1 transition-colors">
                {(dashboardStats?.submissionAttempts ?? 1240).toLocaleString()} / {(dashboardStats?.submissionTarget ?? 1500).toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-[#FECDD3] dark:border-rose-900/50 text-[#E05058] rounded-2xl transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden transition-colors">
              <div 
                className="bg-[#E05058] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ((dashboardStats?.submissionAttempts ?? 1240) / (dashboardStats?.submissionTarget ?? 1500)) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-colors">
              <span>{Math.min(100, ((dashboardStats?.submissionAttempts ?? 1240) / (dashboardStats?.submissionTarget ?? 1500)) * 100).toFixed(1)}% completed</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">+12% this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Average Marks */}
        <div className="bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Avg. School Performance</p>
              <h3 className="text-2xl font-black font-outfit text-brand-dark dark:text-white mt-1 transition-colors">{dashboardStats?.classAverage ?? 78.4}%</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-full transition-colors">
              +2.4% vs Last Term
            </span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 transition-colors">Based on {dashboardStats?.totalSubmissions ?? 48} submissions</span>
          </div>
        </div>

        {/* Card 3: Assessments Generated */}
        <div className="bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Completed Exam Papers</p>
              <h3 className="text-2xl font-black font-outfit text-brand-dark dark:text-white mt-1 transition-colors">{dashboardStats?.totalAssignments ?? 48} Papers</h3>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-500 rounded-2xl transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 transition-colors">
            <span>{Math.max(0, (dashboardStats?.totalAssignments ?? 48) - 6)} Syllabus grounded</span>
            <span className="text-[#E05058] dark:text-[#E05058] font-black flex items-center gap-0.5 hover:underline cursor-pointer" onClick={() => router.push('/')}>
              View all <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Start Launchers - Glow effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Launcher A: Create Paper */}
        <div 
          onClick={handleLaunchCreate}
          className="bg-[#1A1A1A] dark:bg-[#1A1A1A] hover:bg-black dark:hover:bg-black text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[160px] cursor-pointer transition relative overflow-hidden group brand-btn-glow"
        >
          {/* Subtle design element */}
          <div className="absolute top-0 right-0 w-24 h-full bg-[#E05058] opacity-10 blur-[30px] rounded-full transform translate-x-10 scale-150 transition group-hover:scale-175 duration-300" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Sparkles className="w-6 h-6 text-[#E05058] fill-[#E05058]" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition transform group-hover:translate-x-1" />
          </div>
          
          <div className="relative z-10 mt-6">
            <h4 className="text-lg font-black font-outfit">Create New Assessment</h4>
            <p className="text-xs text-slate-400 mt-1 font-medium">Use AI to generate syllabus-grounded worksheets and papers in seconds.</p>
          </div>
        </div>

        {/* Launcher B: Toolkit */}
        <div 
          onClick={() => router.push('/toolkit')}
          className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer transition-colors group"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-[#FECDD3] dark:border-rose-900/50 text-[#E05058] rounded-2xl transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-[#E05058] dark:group-hover:text-[#E05058] transition transform group-hover:translate-x-1" />
          </div>
          
          <div className="mt-6">
            <h4 className="text-lg font-black font-outfit text-brand-dark dark:text-white transition-colors">Teacher's Toolkit</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold transition-colors">Generate lesson plans, question banks, and expand grading remarks.</p>
          </div>
        </div>
      </div>

      {/* 4. Dual Section Layout: Interactive Schedule vs Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Weekly Schedule/Checklist (3/5 width) */}
        <div className="bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-3 flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black font-outfit text-brand-dark dark:text-white flex items-center gap-2 transition-colors">
              <Calendar className="w-4 h-4 text-[#E05058]" /> Upcoming Schedule & Tasks
            </h3>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
              {dashboardTasks.filter(i => !i.completed).length} pending
            </span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[350px] pr-1">
            {dashboardTasks.map(item => (
              <div 
                key={item._id}
                className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                  item.completed 
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500' 
                    : 'bg-[#F1F5F9]/40 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700 hover:bg-[#F1F5F9]/80 dark:hover:bg-slate-700 text-brand-dark dark:text-slate-200'
                }`}
              >
                <div 
                  onClick={() => handleToggleTask(item._id)} 
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <button className="focus:outline-none shrink-0">
                    <CheckCircle2 className={`w-5 h-5 ${item.completed ? 'text-emerald-500 fill-emerald-50 dark:fill-emerald-950/30' : 'text-slate-300 dark:text-slate-600'}`} />
                  </button>
                  <div className="min-w-0">
                    <p className={`text-xs font-black truncate leading-tight ${item.completed ? 'line-through' : ''}`}>
                      {item.title}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 inline-block transition-colors">
                      {item.class}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full transition-colors ${
                    item.completed 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' 
                      : 'bg-rose-50 dark:bg-rose-950/30 text-[#E05058] border border-[#FECDD3] dark:border-rose-900/50'
                  }`}>
                    {item.time}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(item._id);
                    }}
                    className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-brand-primary dark:hover:text-[#E05058] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mt-4 flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 transition-colors">
            <input
              type="text"
              placeholder="Add new task..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-dark dark:text-white focus:outline-none focus:border-[#E05058] transition-colors"
              required
            />
            <input
              type="text"
              placeholder="e.g. Grade 10"
              value={newTaskClass}
              onChange={e => setNewTaskClass(e.target.value)}
              className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-semibold text-brand-dark dark:text-white focus:outline-none focus:border-[#E05058] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-slate-200 p-2 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Recent Activity Feed (2/5 width) */}
        <div className="bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col transition-colors">
          <h3 className="text-base font-black font-outfit text-brand-dark dark:text-white flex items-center gap-2 mb-5 transition-colors">
            <Clock className="w-4 h-4 text-[#E05058]" /> Recent AI Activities
          </h3>

          <div className="space-y-4 flex-1 relative pl-4 border-l border-slate-100 dark:border-slate-800 transition-colors">
            {/* Activity 1 */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#E05058] border-2 border-white dark:border-[#111111] ring-4 ring-rose-50 dark:ring-rose-950/30 transition-colors" />
              <p className="text-xs font-black text-brand-dark dark:text-white leading-tight transition-colors">AI Assessment Generated</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold transition-colors">Quiz on Electricity - Grade 10-A Physics</p>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 inline-block transition-colors">10 mins ago</span>
            </div>

            {/* Activity 2 */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-[#111111] transition-colors" />
              <p className="text-xs font-black text-slate-600 dark:text-slate-300 leading-tight transition-colors">Remarks Enhanced</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold transition-colors">Refined 12 student report feedback logs</p>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 inline-block transition-colors">2 hours ago</span>
            </div>

            {/* Activity 3 */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-[#111111] transition-colors" />
              <p className="text-xs font-black text-slate-600 dark:text-slate-300 leading-tight transition-colors">Classroom Group Created</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold transition-colors">Added Grade 9-B Physics roster (24 pupils)</p>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 inline-block font-sans transition-colors">Yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Suggestion Insight Bar */}
      <div className="mt-8 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500 rounded-2xl shrink-0 transition-colors">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h5 className="text-xs font-black text-amber-900 dark:text-amber-300 leading-tight transition-colors">VedaAI Academic Insight</h5>
            <p className="text-[10px] text-amber-700 dark:text-amber-500/80 mt-0.5 font-semibold transition-colors">
              Students in Grade 9-B showed 15% lower average scores in the "Magnetism" section. Need a corrective practice sheet?
            </p>
          </div>
        </div>
        <button 
          onClick={handleLaunchCreate}
          className="bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-slate-800 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-full transition shrink-0 cursor-pointer shadow-sm"
        >
          Create practice sheet
        </button>
      </div>
    </div>
  );
}
