import { MovieSchedule, Movie, Theater, Showtime, TheaterChain } from '@/types/movie';
import { createAPIClient } from '@/lib/api-client';
import { fromZonedTime } from 'date-fns-tz';

interface BalboaAPIResponse {
  id: string;
  title: string;
  startDate: number; // Unix timestamp in milliseconds
  endDate: number;
  assetUrl?: string;
  fullUrl: string;
  location?: {
    addressTitle?: string;
    addressLine1?: string;
    addressLine2?: string;
  };
}

export class BalboaParser {
  private static readonly BALBOA_THEATER: Theater = {
    id: 'balboa-sf',
    name: 'Balboa Theater',
    address: '3630 Balboa Street, San Francisco, CA 94121',
    chain: TheaterChain.BALBOA,
    location: {
      latitude: 37.7759,
      longitude: -122.4980
    }
  };

  private static readonly API_BASE = 'https://www.balboamovies.com/api/open/GetItemsByMonth';
  private static readonly COLLECTION_ID = '616e03c4b792dc0e9cf140e7';
  // Note: The crumb parameter might need to be refreshed periodically
  private static readonly CRUMB = 'BQdoFSYA5QRmOTI1ODQ2ZjA0ODlhZmRkYmVjMjg3NjY0MjQ4M2Iz';

  private static apiClient = createAPIClient();

  static async fetchAndParseBalboaData(): Promise<MovieSchedule[]> {
    try {
      // Get current month and next few months
      const currentDate = new Date();
      const months = [];
      
      // Get current month + next 2 months
      for (let i = 0; i < 3; i++) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        months.push(this.formatMonthParam(month));
      }

      const allEvents: BalboaAPIResponse[] = [];
      
      // Fetch data for each month
      for (const monthParam of months) {
        try {
          const events = await this.fetchMonthData(monthParam);
          allEvents.push(...events);
        } catch (error) {
          console.error(`Error fetching Balboa data for ${monthParam}:`, error);
          // Continue with other months if one fails
        }
      }

      return this.parseBalboaEvents(allEvents);
    } catch (error) {
      console.error('Error fetching Balboa data:', error);
      return [];
    }
  }

  private static async fetchMonthData(monthParam: string): Promise<BalboaAPIResponse[]> {
    const url = `${this.API_BASE}?month=${monthParam}&collectionId=${this.COLLECTION_ID}&crumb=${this.CRUMB}`;
    
    const headers = {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'referer': 'https://www.balboamovies.com/calendar',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest'
    };

    // Use fetch directly since it's a simple API call
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Balboa API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  private static formatMonthParam(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  }

  private static parseBalboaEvents(events: BalboaAPIResponse[]): MovieSchedule[] {
    const movieMap = new Map<string, {
      movie: Movie;
      showtimes: Showtime[];
    }>();

    events.forEach(event => {
      // Parse movie title and showtime from the title field
      const { movieTitle, showtimes: eventShowtimes } = this.parseMovieTitle(event.title);
      
      if (!movieTitle) return;

      const movieKey = this.generateMovieKey(movieTitle);
      
      // Create movie if it doesn't exist
      if (!movieMap.has(movieKey)) {
        const movie: Movie = {
          id: movieKey,
          title: movieTitle,
          genre: ['Independent'], // Default for Balboa
          rating: 'NR',
          duration: 120, // Default duration
          description: `Playing at ${this.BALBOA_THEATER.name}`,
          posterUrl: event.assetUrl
        };
        
        movieMap.set(movieKey, {
          movie,
          showtimes: []
        });
      }

      const movieData = movieMap.get(movieKey)!;

      // If the title contains specific showtimes, use those
      if (eventShowtimes.length > 0) {
        eventShowtimes.forEach(timeStr => {
          const startTime = this.parseShowtimeFromString(event.startDate, timeStr);
          if (startTime) {
            movieData.showtimes.push(this.createShowtime(movieKey, startTime, event));
          }
        });
      } else {
        // Otherwise use the startDate from the API
        const startTime = new Date(event.startDate);
        movieData.showtimes.push(this.createShowtime(movieKey, startTime, event));
      }
    });

    // Convert to MovieSchedule array
    return Array.from(movieMap.values()).map(({ movie, showtimes }) => ({
      theater: this.BALBOA_THEATER,
      movie,
      showtimes
    }));
  }

  private static parseMovieTitle(title: string): { movieTitle: string; showtimes: string[] } {
    // Handle titles like "Movie Title @ 7:30PM" or "Movie Title @ 2PM & 4:30PM & 7PM"
    const parts = title.split('@');
    
    if (parts.length < 2) {
      return { movieTitle: title.trim(), showtimes: [] };
    }

    const movieTitle = parts[0].trim();
    const timesPart = parts[1].trim();
    
    // Extract individual times from formats like "2PM & 4:30PM & 7PM"
    const showtimes = timesPart
      .split('&')
      .map(time => time.trim())
      .filter(time => time.match(/\d+:\d+\s*(AM|PM)|^_?\d+\s*(AM|PM)/i));

    return { movieTitle, showtimes };
  }

  private static parseShowtimeFromString(baseTimestamp: number, timeStr: string): Date | null {
    // Parse time strings like "7:30PM", "2PM", etc.
    const timeMatch = timeStr.match(/(\d{1,2}):?(\d{0,2})\s*(AM|PM)/i);
    
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }

    // Use the date from the base timestamp but with the parsed time
    const baseDate = new Date(baseTimestamp);
    const pstDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes);
    
    // Convert PST date to UTC for storage
    return fromZonedTime(pstDate, 'America/Los_Angeles');
  }

  private static createShowtime(movieId: string, startTime: Date, event: BalboaAPIResponse): Showtime {
    return {
      id: `${movieId}-${event.id}-${startTime.getTime()}`,
      movieId,
      theaterId: this.BALBOA_THEATER.id,
      startTime,
      endTime: new Date(startTime.getTime() + 120 * 60 * 1000), // Default 2 hour duration
      ticketUrl: `https://www.balboamovies.com${event.fullUrl}`,
      format: 'Standard'
    };
  }

  private static generateMovieKey(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
}