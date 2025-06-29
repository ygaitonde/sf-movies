'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { MovieSchedule } from '@/types/movie';

interface CalendarProps {
  schedules: MovieSchedule[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export default function Calendar({ schedules, selectedDate, onDateSelect, onMonthChange }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => 
      schedule.showtimes.some(showtime => 
        isSameDay(new Date(showtime.startTime), date)
      )
    );
  };

  const getDayClasses = (date: Date) => {
    const baseClasses = 'h-32 p-2 border border-gray-200 cursor-pointer transition-colors hover:bg-gray-50';
    const daySchedules = getSchedulesForDate(date);
    
    let classes = baseClasses;
    
    if (!isSameMonth(date, currentMonth)) {
      classes += ' text-gray-400 bg-gray-50';
    }
    
    if (isSameDay(date, selectedDate)) {
      classes += ' bg-blue-100 border-blue-300';
    }
    
    if (daySchedules.length > 0) {
      classes += ' ring-2 ring-green-200';
    }
    
    return classes;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-700 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map(day => {
          const daySchedules = getSchedulesForDate(day);
          
          return (
            <div
              key={day.toString()}
              className={getDayClasses(day)}
              onClick={() => onDateSelect(day)}
            >
              <div className="text-sm font-medium mb-1">
                {format(day, 'd')}
              </div>
              
              {daySchedules.length > 0 && (
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((schedule, index) => (
                    <div
                      key={`${schedule.movie.id}-${index}`}
                      className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                    >
                      {schedule.movie.title}
                    </div>
                  ))}
                  
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-gray-600">
                      +{daySchedules.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}