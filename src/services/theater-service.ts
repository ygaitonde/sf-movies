import { MovieSchedule, Theater, TheaterChain, FilterOptions, APIResponse } from '@/types/movie';
import { cacheService, CACHE_KEYS } from '@/lib/cache';
import { createAPIClient } from '@/lib/api-client';
import { RoxieParser } from './roxie-parser';
import { BalboaParser } from './balboa-parser';
import { VogueParser } from './vogue-parser';
import { FourStarParser } from './fourstar-parser';

export class TheaterService {
  private apiClient = createAPIClient();

  async getMovieSchedules(
    date: Date,
    filters?: FilterOptions
  ): Promise<APIResponse<MovieSchedule[]>> {
    const cacheKey = CACHE_KEYS.SHOWTIMES('all', filters?.theaters?.join(','));
    
    // Check cache first
    const cached = cacheService.get<MovieSchedule[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        success: true,
        timestamp: new Date()
      };
    }

    try {
      // Fetch data from all theaters in parallel
      const [roxieData, balboaData, vogueData, fourstarData] = await Promise.all([
        RoxieParser.fetchAndParseRoxieData(),
        BalboaParser.fetchAndParseBalboaData(),
        VogueParser.fetchAndParseVogueData(),
        FourStarParser.fetchAndParseFourStarData()
      ]);
      
      // Combine all theater data
      const allData = [...roxieData, ...balboaData, ...vogueData, ...fourstarData];
      
      // Apply filters (but not date filtering since we want all dates for the calendar)
      const filteredData = allData.filter(schedule => {
        // Apply theater filters
        if (filters?.theaters?.length && !filters.theaters.includes(schedule.theater.chain)) {
          return false;
        }
        
        return true;
      });
      
      // Cache for 30 minutes
      cacheService.set(cacheKey, filteredData, 1800);
      
      return {
        data: filteredData,
        success: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching movie schedules:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch movie schedules',
        timestamp: new Date()
      };
    }
  }

  async getTheaters(chain?: TheaterChain): Promise<APIResponse<Theater[]>> {
    const cacheKey = CACHE_KEYS.THEATERS(chain);
    
    const cached = cacheService.get<Theater[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        success: true,
        timestamp: new Date()
      };
    }

    try {
      // Get all theaters
      const theaters = [
        RoxieParser['ROXIE_THEATER'], // Access static property
        BalboaParser['BALBOA_THEATER'], // Access static property
        VogueParser['VOGUE_THEATER'], // Access static property
        FourStarParser['FOURSTAR_THEATER'] // Access static property
      ];
      
      const filteredTheaters = chain ? 
        theaters.filter(t => t.chain === chain) : 
        theaters;
      
      // Cache for 1 hour (theaters don't change often)
      cacheService.set(cacheKey, filteredTheaters, 3600);
      
      return {
        data: filteredTheaters,
        success: true,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

}

export const theaterService = new TheaterService();