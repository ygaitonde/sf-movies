'use client';

import { useState, useEffect } from 'react';
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

  // Auto-select today when component mounts
  useEffect(() => {
    const today = new Date();
    onDateSelect(today);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    const firstDay = startOfMonth(newMonth);
    onDateSelect(firstDay);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    const firstDay = startOfMonth(newMonth);
    onDateSelect(firstDay);
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
      minHeight: '90px',
      height: '100%',
      padding: '6px',
      border: '1px solid #000',
      cursor: 'pointer',
      backgroundColor: isSelected ? '#000' : (isCurrentMonth ? '#fff' : '#f5f5f5'),
      color: isSelected ? '#fff' : (isCurrentMonth ? '#000' : '#999'),
      fontSize: '12px',
      textDecoration: 'none',
      fontWeight: daySchedules.length > 0 && isCurrentMonth ? 'bold' : 'normal',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'flex-start',
      gap: '4px'
    };
  };

  const getEarliestShowtimeForDate = (schedule: MovieSchedule, date: Date) => {
    const dayShowtimes = schedule.showtimes
      .map((showtime) => new Date(showtime.startTime))
      .filter((startTime) => isSameDay(startTime, date))
      .sort((first, second) => first.getTime() - second.getTime());

    return dayShowtimes[0];
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
          <div key={day} style={{ padding: '4px 2px', textAlign: 'center', borderBottom: '1px solid #000', fontSize: '10px', fontWeight: 'bold' }}>
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
              <div style={{ fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                {format(day, 'd')}
              </div>
              
              {daySchedules.length > 0 && isCurrentMonth && (
                <div style={{ fontSize: '11px', lineHeight: '1.2', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {daySchedules.slice(0, 3).map((schedule, index) => {
                    const startTime = getEarliestShowtimeForDate(schedule, day);
                    const timeLabel = startTime ? format(startTime, 'h:mm a') : '';

                    return (
                      <div
                        key={index}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block'
                        }}
                      >
                        {timeLabel && (
                          <span style={{ fontWeight: 'normal', marginRight: '4px' }}>{timeLabel}:</span>
                        )}
                        <span style={{ fontWeight: 'normal', whiteSpace: 'normal' }}>{schedule.movie.title}</span>
                      </div>
                    );
                  })}
                  {daySchedules.length > 3 && (
                    <div style={{ fontStyle: 'italic' }}>+{daySchedules.length - 3} more</div>
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
