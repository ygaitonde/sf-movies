'use client';

import { useState } from 'react';
import { TheaterChain, FilterOptions } from '@/types/movie';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTheaterChange = (chain: TheaterChain, checked: boolean) => {
    const currentTheaters = filters.theaters || [];
    const updatedTheaters = checked
      ? [...currentTheaters, chain]
      : currentTheaters.filter(t => t !== chain);
    
    onFiltersChange({
      ...filters,
      theaters: updatedTheaters.length > 0 ? updatedTheaters : undefined
    });
  };

  const handleGenreChange = (genre: string, checked: boolean) => {
    const currentGenres = filters.genres || [];
    const updatedGenres = checked
      ? [...currentGenres, genre]
      : currentGenres.filter(g => g !== genre);
    
    onFiltersChange({
      ...filters,
      genres: updatedGenres.length > 0 ? updatedGenres : undefined
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = [
    filters.theaters?.length || 0,
    filters.genres?.length || 0,
    filters.timeRange ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Filter Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer border-b"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          )}
          <svg 
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Filter Content */}
      {isOpen && (
        <div className="p-4 space-y-6">
          {/* Theater Chains */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Theater Chains</h4>
            <div className="space-y-2">
              {Object.values(TheaterChain).map(chain => (
                <label key={chain} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.theaters?.includes(chain) || false}
                    onChange={(e) => handleTheaterChange(chain, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{chain}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Genres</h4>
            <div className="space-y-2">
              {['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance'].map(genre => (
                <label key={genre} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.genres?.includes(genre) || false}
                    onChange={(e) => handleGenreChange(genre, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Show Times</h4>
            <div className="space-y-2">
              {[
                { label: 'Matinee (Before 4 PM)', value: { start: '09:00', end: '16:00' } },
                { label: 'Evening (4 PM - 8 PM)', value: { start: '16:00', end: '20:00' } },
                { label: 'Late (After 8 PM)', value: { start: '20:00', end: '23:59' } }
              ].map(option => (
                <label key={option.label} className="flex items-center">
                  <input
                    type="radio"
                    name="timeRange"
                    checked={
                      filters.timeRange?.start === option.value.start &&
                      filters.timeRange?.end === option.value.end
                    }
                    onChange={() => onFiltersChange({
                      ...filters,
                      timeRange: option.value
                    })}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="timeRange"
                  checked={!filters.timeRange}
                  onChange={() => onFiltersChange({
                    ...filters,
                    timeRange: undefined
                  })}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">All Times</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}