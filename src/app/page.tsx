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
    // Only fetch when filters change, not when selectedDate changes
    fetchSchedules(selectedDate, filters);
  }, [filters]);

  useEffect(() => {
    // Fetch schedules when component mounts
    fetchSchedules(selectedDate, filters);
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (date: Date) => {
    // No need to fetch new data when month changes since Roxie gives us all months
    // Just update the calendar view
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const filteredSchedules = schedules.filter(schedule => {
    // Filter by time range if specified
    if (filters.timeRange) {
      const hasMatchingShowtime = schedule.showtimes.some(showtime => {
        const showtimeDate = new Date(showtime.startTime);
        const showtimeHour = format(showtimeDate, 'HH:mm');
        return showtimeHour >= filters.timeRange!.start && showtimeHour <= filters.timeRange!.end;
      });
      if (!hasMatchingShowtime) return false;
    }

    // Filter by genre if specified
    if (filters.genres?.length) {
      const hasMatchingGenre = schedule.movie.genre.some(genre => 
        filters.genres!.includes(genre)
      );
      if (!hasMatchingGenre) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Movie Calendar</h1>
          <p className="text-gray-600">Find movie showtimes across multiple theater chains</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Calendar */}
            <Calendar
              schedules={schedules}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
            />

            {/* Selected Date Info */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading schedules...</span>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {!loading && !error && filteredSchedules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No movie schedules found for the selected date and filters.
                </div>
              )}
              
              {!loading && !error && filteredSchedules.length > 0 && (
                <div className="text-sm text-gray-600 mb-4">
                  Found {filteredSchedules.length} movie{filteredSchedules.length !== 1 ? 's' : ''} playing
                </div>
              )}
            </div>

            {/* Movie Cards */}
            <div className="space-y-4">
              {filteredSchedules.map(schedule => (
                <MovieCard
                  key={`${schedule.theater.id}-${schedule.movie.id}`}
                  schedule={schedule}
                  selectedDate={selectedDate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}