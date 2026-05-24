'use client';

import React from 'react';
import Image from 'next/image';

import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  Presentation, 
  FileText, 
  Book, 
  PieChart,
  Settings, 
  X,
  Sparkles
} from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';

// Custom Ape Avatar component using premium inline SVG
export const ApeAvatar = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} rounded-full bg-[#FFE4E6] border border-[#FECDD3] shrink-0 overflow-hidden`}>
    {/* Ape Face Base */}
    <circle cx="50" cy="53" r="32" fill="#8B4513" /> 
    <path d="M 30,50 C 30,35 42,32 50,32 C 58,32 70,35 70,50 C 70,68 62,78 50,78 C 38,78 30,68 30,50 Z" fill="#D2B48C" /> 
    {/* Ears */}
    <circle cx="20" cy="50" r="10" fill="#8B4513" />
    <circle cx="20" cy="50" r="6" fill="#D2B48C" />
    <circle cx="80" cy="50" r="10" fill="#8B4513" />
    <circle cx="80" cy="50" r="6" fill="#D2B48C" />
    {/* Eyes */}
    <circle cx="42" cy="48" r="5" fill="#FFFFFF" />
    <circle cx="42" cy="48" r="2.5" fill="#000000" />
    <circle cx="58" cy="48" r="5" fill="#FFFFFF" />
    <circle cx="58" cy="48" r="2.5" fill="#000000" />
    {/* Glasses */}
    <rect x="34" y="44" width="14" height="8" rx="2" fill="none" stroke="#E05058" strokeWidth="2.5" />
    <rect x="52" y="44" width="14" height="8" rx="2" fill="none" stroke="#E05058" strokeWidth="2.5" />
    <line x1="48" y1="48" x2="52" y2="48" stroke="#E05058" strokeWidth="2.5" />
    {/* Cap/Hat */}
    <path d="M 22,34 C 25,18 45,15 50,15 C 55,15 75,18 78,34 Z" fill="#1A1A1A" /> 
    <path d="M 20,34 C 35,32 65,32 80,34 C 85,34 90,38 78,38 C 65,38 35,38 22,38 C 10,38 15,34 20,34 Z" fill="#E05058" /> 
    {/* Mouth */}
    <path d="M 40,64 C 45,68 55,68 60,64" fill="none" stroke="#5C4033" strokeWidth="2" strokeLinecap="round" />
    {/* Nose */}
    <circle cx="48" cy="56" r="1.5" fill="#5C4033" />
    <circle cx="52" cy="56" r="1.5" fill="#5C4033" />
  </svg>
);

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { assignments, sidebarOpen, setSidebarOpen, viewState, setViewState, setToastMessage, schoolName, schoolLocation, schoolAvatar } = useAssignmentStore();

  const isHomeActive = pathname === '/home';
  const isViewingAssignment = pathname.startsWith('/assignment');
  const isAssignmentsActive = (pathname === '/' && viewState === 'list') || isViewingAssignment;
  const isCreateActive = pathname === '/' && viewState === 'create';
  const isLibraryActive = pathname === '/library';
  const isToolkitActive = pathname === '/toolkit';

  const CustomGroupsIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="12" height="10" rx="2" />
      <path d="M6 14l-2 3" />
      <path d="M12 14l2 3" />
      <circle cx="19" cy="14" r="2" />
      <path d="M16 22v-2a2 2 0 0 1 2-2h3" />
    </svg>
  );

  const CustomToolkitIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="5" y1="17" x2="19" y2="17" />
    </svg>
  );

  const navItems = [
    { name: 'Home', icon: LayoutGrid, path: '/home', active: pathname === '/home' },
    { name: 'My Groups', icon: CustomGroupsIcon, path: '/groups', active: pathname === '/groups' },
    { name: 'Assignments', icon: FileText, path: '/', active: pathname === '/' || pathname.startsWith('/assignment') },
    { name: 'AI Teacher\'s Toolkit', icon: CustomToolkitIcon, path: '/toolkit', active: pathname === '/toolkit' },
    { name: 'My Library', icon: PieChart, path: '/library', active: pathname === '/library' }
  ];

  const handleNewAssignment = () => {
    // Open the full-page create form directly by changing state or route
    setViewState('create');
    router.push('/');
    setSidebarOpen(false);
  };

  const handleNavigate = (name: string, path: string) => {
    if (path === '#') {
      setToastMessage(`${name} section is coming soon!`);
      setSidebarOpen(false);
      return;
    }
    if (path === '/') {
      setViewState('list');
    }
    router.push(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 no-print"
        />
      )}

      {/* Left Sidebar Panel (No-print) */}
      <aside
        className={`fixed top-3 bottom-3 left-3 md:top-4 md:bottom-4 md:left-4 w-64 bg-white dark:bg-[#111111] rounded-[24px] shadow-sm z-40 transform transition-transform duration-300 md:translate-x-0 flex flex-col no-print overflow-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'
        } transition-colors`}
      >
        {/* Logo Header */}
        <div className="px-6 py-6 pb-4 flex items-center gap-2.5">
          <Image
            src="/vedaai-logo.png"
            alt="VedaAI Logo"
            width={36}
            height={36}
            className="object-contain shrink-0 rounded-[8px]"
            style={{ width: 36, height: 'auto' }}
            priority
          />
          <span
            className="font-bricolage text-[1.35rem] font-bold leading-none select-none text-[#1A1A1A] dark:text-white transition-colors"
            style={{ letterSpacing: '-0.01em' }}
          >
            VedaAI
          </span>
        </div>

        {/* Top Call To Action Button */}
        <div className="px-5 pb-8 pt-6">
          {isViewingAssignment ? (
            <button
              onClick={() => { router.push('/toolkit'); if (window.innerWidth < 768) setSidebarOpen(false); }}
              className="w-full bg-[#303030] dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-black font-semibold text-[13px] py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-all ring-2 ring-[#F06A38] cursor-pointer shadow-[0_0_8px_rgba(240,106,56,0.25)]"
            >
              <Sparkles className="w-4 h-4 text-white dark:text-black transition-colors" />
              AI Teacher&apos;s Toolkit
            </button>
          ) : (
            <button
              onClick={() => { setViewState('create'); if (window.innerWidth < 768) setSidebarOpen(false); router.push('/'); }}
              className="w-full bg-[#303030] dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-black font-semibold text-[13px] py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-all ring-2 ring-[#F06A38] cursor-pointer shadow-[0_0_8px_rgba(240,106,56,0.25)]"
            >
              <Sparkles className="w-4 h-4 text-white dark:text-black transition-colors" />
              Create Assignment
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-5">
          <button 
            onClick={() => { router.push('/home'); if (window.innerWidth < 768) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-[13px] transition-colors cursor-pointer ${
              isHomeActive ? 'bg-[#F4F4F5] dark:bg-slate-800 text-brand-dark dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-dark dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-[18px] h-[18px] stroke-[1.5]" />
            Home
          </button>

          <button 
            onClick={() => { router.push('/groups'); if (window.innerWidth < 768) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-[13px] transition-colors cursor-pointer ${
              pathname === '/groups' ? 'bg-[#F4F4F5] dark:bg-slate-800 text-brand-dark dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-dark dark:hover:text-white'
            }`}
          >
            <Presentation className="w-[18px] h-[18px] stroke-[1.5]" />
            My Groups
          </button>

          <button 
            onClick={() => { setViewState('list'); router.push('/'); if (window.innerWidth < 768) setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-[13px] transition-colors cursor-pointer ${
              isAssignmentsActive || isCreateActive ? 'bg-[#F4F4F5] dark:bg-slate-800 text-brand-dark dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-dark dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-[18px] h-[18px] stroke-[1.5]" />
              Assignments
            </div>
            {assignments.length > 0 && (
              <span className="bg-[#E87A31] text-white text-[10px] font-bold px-2 py-0.5 rounded-[8px] min-w-[22px] text-center shadow-sm">
                {assignments.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { router.push('/toolkit'); if (window.innerWidth < 768) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-[13px] transition-colors cursor-pointer ${
              isToolkitActive ? 'bg-[#F4F4F5] dark:bg-slate-800 text-brand-dark dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-dark dark:hover:text-white'
            }`}
          >
            <PieChart className="w-[18px] h-[18px] stroke-[1.5]" />
            AI Teacher&apos;s Toolkit
          </button>

          <button 
            onClick={() => { router.push('/library'); if (window.innerWidth < 768) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-[13px] transition-colors cursor-pointer ${
              isLibraryActive ? 'bg-[#F4F4F5] dark:bg-slate-800 text-brand-dark dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-dark dark:hover:text-white'
            }`}
          >
            <Book className="w-[18px] h-[18px] stroke-[1.5]" />
            My Library
          </button>
        </nav>

        {/* User Profile Footer */}
        <div className="px-4 pb-6 mt-auto flex flex-col gap-6">
          {/* Settings gear link */}
          <button
            onClick={() => {
              router.push('/settings');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-2 text-xs font-black text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition rounded-2xl cursor-pointer text-left"
          >
            <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            Settings
          </button>

          {/* Delhi Public School profile card */}
          <div className="p-4 rounded-3xl bg-[#F1F5F9] dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {schoolAvatar ? (
                  <img src={schoolAvatar} alt="School Avatar" className="w-full h-full object-cover" />
                ) : (
                  <ApeAvatar className="w-full h-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-brand-dark dark:text-white truncate leading-tight transition-colors">
                  {schoolName}
                </p>
                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5 transition-colors">
                  {schoolLocation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
