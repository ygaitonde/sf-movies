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


  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = filters.theaters?.length || 0;

  return (
    <div>
      <div 
        style={{ cursor: 'pointer', marginBottom: '10px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <strong>Theaters</strong>
        {activeFilterCount > 0 && ` (${activeFilterCount} selected)`}
        {activeFilterCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAllFilters();
            }}
            style={{ marginLeft: '10px', textDecoration: 'underline' }}
          >
            clear
          </button>
        )}
        <span style={{ float: 'right' }}>{isOpen ? '−' : '+'}</span>
      </div>

      {isOpen && (
        <div style={{ marginLeft: '10px' }}>
          {Object.values(TheaterChain).map(chain => {
            const displayName = chain === TheaterChain.FOURSTAR ? '4-Star' : 
                               chain.charAt(0) + chain.slice(1).toLowerCase();
            
            return (
              <div key={chain} style={{ marginBottom: '4px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={filters.theaters?.includes(chain) || false}
                    onChange={(e) => handleTheaterChange(chain, e.target.checked)}
                  />
                  {displayName}
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}