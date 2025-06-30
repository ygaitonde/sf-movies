'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
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
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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

  const getDayStyle = (date: Date) => {
    const daySchedules = getSchedulesForDate(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isSelected = isSameDay(date, selectedDate);
    
    return {
      height: '60px',
      padding: '4px',
      border: '1px solid #000',
      cursor: 'pointer',
      backgroundColor: isSelected ? '#000' : (isCurrentMonth ? '#fff' : '#f5f5f5'),
      color: isSelected ? '#fff' : (isCurrentMonth ? '#000' : '#999'),
      fontSize: '12px',
      textDecoration: daySchedules.length > 0 && isCurrentMonth ? 'underline' : 'none',
      fontWeight: daySchedules.length > 0 && isCurrentMonth ? 'bold' : 'normal'
    };
  };

  return (
    <div style={{ border: '1px solid #000' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #000' }}>
        <button onClick={handlePrevMonth}>
          ← Previous
        </button>
        
        <h2 style={{ fontSize: '16px', fontWeight: 'normal' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button onClick={handleNextMonth}>
          Next →
        </button>
      </div>

      {/* Weekday Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #000', fontSize: '12px', fontWeight: 'bold' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map(day => {
          const daySchedules = getSchedulesForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <div
              key={day.toString()}
              style={getDayStyle(day)}
              onClick={() => onDateSelect(day)}
            >
              <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                {format(day, 'd')}
              </div>
              
              {daySchedules.length > 0 && isCurrentMonth && (
                <div style={{ fontSize: '9px' }}>
                  {daySchedules.length} movie{daySchedules.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}