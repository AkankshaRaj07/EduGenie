import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export interface CustomDatePickerProps {
  value: string; // Expected format: YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  error?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select Date',
  className = '',
  buttonClassName = '',
  error = false
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize view date based on selected value, or current date
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [year, month] = value.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    return new Date();
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const formattedMonth = String(viewDate.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${viewDate.getFullYear()}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  // Generate calendar grid
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

  const daysGrid = [];
  for (let i = 0; i < firstDay; i++) {
    daysGrid.push(null); // Empty slots for offset
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(i);
  }

  // Format display string
  const displayValue = value ? (() => {
    const [y, m, d] = value.split('-');
    return `${d}-${m}-${y}`; // DD-MM-YYYY display format to match page.tsx expectations
  })() : '';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left focus:outline-none transition-all duration-200 ${buttonClassName} ${error ? 'border-brand-primary focus:ring-brand-primary/10' : 'border-slate-200 focus:ring-brand-primary/10'}`}
      >
        <span className={`truncate ${displayValue ? 'text-slate-800' : 'text-slate-400'}`}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-5 h-5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-[280px] p-4 mt-2 bg-white border border-slate-200/80 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-bold text-sm text-slate-800">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }

              const formattedMonth = String(viewDate.getMonth() + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const thisDateStr = `${viewDate.getFullYear()}-${formattedMonth}-${formattedDay}`;
              const isSelected = value === thisDateStr;
              
              const today = new Date();
              const isToday = 
                day === today.getDate() && 
                viewDate.getMonth() === today.getMonth() && 
                viewDate.getFullYear() === today.getFullYear();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs transition-colors ${
                    isSelected 
                      ? 'bg-[#E05058] text-white font-bold shadow-md shadow-rose-200' 
                      : isToday
                      ? 'bg-slate-100 text-[#E05058] font-bold border border-[#E05058]/20'
                      : 'text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
