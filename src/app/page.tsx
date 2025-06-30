'use client';

import { useState, useEffect } from 'react';
import { MovieSchedule, FilterOptions, APIResponse } from '@/types/movie';
import Calendar from '@/components/ui/calendar';
import MovieCard from '@/components/ui/movie-card';
import FilterPanel from '@/components/ui/filter-panel';
import { format } from 'date-fns';

export default function Home() {
  const [schedules, setSchedules] = useState<MovieSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async (date: Date, currentFilters: FilterOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        date: format(date, 'yyyy-MM-dd')
      });
      
      if (currentFilters.theaters?.length) {
        params.append('theaters', currentFilters.theaters.join(','));
      }
      
      if (currentFilters.genres?.length) {
        params.append('genres', currentFilters.genres.join(','));
      }

      const response = await fetch(`/api/showtimes?${params}`);
      const result: APIResponse<MovieSchedule[]> = await response.json();
      
      if (result.success) {
        setSchedules(result.data);
      } else {
        setError(result.error || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch schedules when component mounts or filters change
    fetchSchedules(selectedDate, filters);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = () => {
    // No need to fetch new data when month changes since we fetch all months
    // Just update the calendar view
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const filteredSchedules = schedules;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <h1 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: 'normal' }}>
        San Francisco Movie Calendar
      </h1>
      <p style={{ marginBottom: '20px', fontSize: '14px' }}>
        Independent theaters: Roxie, Balboa, Vogue, 4-Star
      </p>

      {/* Theater Filter */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
        <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
      </div>

      {/* Calendar */}
      <div style={{ marginBottom: '20px' }}>
        <Calendar
          schedules={schedules}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
        />
      </div>

      {/* Selected Date */}
      <div style={{ borderTop: '1px solid #000', paddingTop: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: 'normal' }}>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        
        {loading && <p>Loading...</p>}
        
        {error && (
          <p style={{ border: '1px solid #000', padding: '10px', marginBottom: '10px' }}>
            Error: {error}
          </p>
        )}
        
        {!loading && !error && filteredSchedules.length === 0 && (
          <p>No movies scheduled for this date.</p>
        )}
        
        {!loading && !error && filteredSchedules.length > 0 && (
          <p style={{ fontSize: '14px', marginBottom: '15px' }}>
            {filteredSchedules.length} movie{filteredSchedules.length !== 1 ? 's' : ''} playing
          </p>
        )}

        {/* Movie List */}
        {filteredSchedules.map(schedule => (
          <MovieCard
            key={`${schedule.theater.id}-${schedule.movie.id}`}
            schedule={schedule}
            selectedDate={selectedDate}
          />
        ))}
      </div>
    </div>
  );
}