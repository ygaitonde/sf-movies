import { JSDOM } from 'jsdom';
import { MovieSchedule, Movie, Theater, Showtime, TheaterChain } from '@/types/movie';

interface RoxieMovieData {
  title: string;
  showtime: string;
  date: Date;
  url: string;
  showtimeId?: string;
}

export class RoxieParser {
  private static readonly ROXIE_THEATER: Theater = {
    id: 'roxie-sf',
    name: 'Roxie Theater',
    address: '3117 16th St, San Francisco, CA 94103',
    chain: TheaterChain.ROXIE,
    location: {
      latitude: 37.7649,
      longitude: -122.4200
    }
  };

  static async fetchAndParseRoxieData(): Promise<MovieSchedule[]> {
    try {
      const response = await fetch('https://roxie.com/calendar/');
      const html = await response.text();
      
      return this.parseRoxieHTML(html);
    } catch (error) {
      console.error('Error fetching Roxie data:', error);
      return [];
    }
  }

  static parseRoxieHTML(html: string): MovieSchedule[] {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const movieDataMap = new Map<string, RoxieMovieData[]>();
    
    // Find all month containers
    const monthContainers = document.querySelectorAll('[id*="full-month-"]');
    
    monthContainers.forEach(monthContainer => {
      const monthId = monthContainer.id;
      const yearMonth = this.extractYearMonthFromId(monthId);
      
      if (!yearMonth) return;
      
      // Find all calendar day items within this month
      const dayItems = monthContainer.querySelectorAll('.calendar-day-item');
      
      dayItems.forEach(dayItem => {
        const dayElement = dayItem.querySelector('.calendar-day');
        if (!dayElement) return;
        
        const dayNumber = parseInt(dayElement.textContent?.trim() || '0');
        if (dayNumber === 0) return;
        
        const date = new Date(yearMonth.year, yearMonth.month - 1, dayNumber);
        
        // Find all films on this day
        const films = dayItem.querySelectorAll('.film');
        
        films.forEach(film => {
          const titleElement = film.querySelector('.film-title');
          const showtimeElement = film.querySelector('.film-showtime');
          const linkElement = film.querySelector('a[href*="/film/"]');
          
          if (!titleElement || !showtimeElement) return;
          
          const title = titleElement.textContent?.trim() || '';
          const showtime = showtimeElement.textContent?.trim() || '';
          const url = linkElement?.getAttribute('href') || '';
          const showtimeId = showtimeElement.getAttribute('id') || undefined;
          
          if (title && showtime) {
            const movieKey = this.generateMovieKey(title);
            
            if (!movieDataMap.has(movieKey)) {
              movieDataMap.set(movieKey, []);
            }
            
            movieDataMap.get(movieKey)?.push({
              title,
              showtime,
              date,
              url,
              showtimeId
            });
          }
        });
      });
    });
    
    // Convert map to MovieSchedule array
    return Array.from(movieDataMap.entries()).map(([movieKey, showtimeData]) => {
      const firstShowtime = showtimeData[0];
      
      const movie: Movie = {
        id: movieKey,
        title: firstShowtime.title,
        genre: ['Independent'], // Default for Roxie
        rating: 'NR', // Not Rated - common for independent films
        duration: 120, // Default duration
        description: `Playing at ${this.ROXIE_THEATER.name}`,
        posterUrl: undefined
      };
      
      // Convert each individual showtime to a Showtime object
      const parsedShowtimes: Showtime[] = showtimeData.map((data, index) => {
        const startTime = this.parseShowtime(data.date, data.showtime);
        
        return {
          id: data.showtimeId || `${movieKey}-${index}`,
          movieId: movieKey,
          theaterId: this.ROXIE_THEATER.id,
          startTime,
          endTime: new Date(startTime.getTime() + movie.duration * 60 * 1000),
          ticketUrl: data.url.startsWith('http') ? data.url : `https://roxie.com${data.url}`,
          format: 'Standard'
        };
      });
      
      return {
        theater: this.ROXIE_THEATER,
        movie,
        showtimes: parsedShowtimes
      };
    });
  }
  
  private static extractYearMonthFromId(monthId: string): { year: number; month: number } | null {
    const match = monthId.match(/full-month-(\d{4})-(\d{2})/);
    if (!match) return null;
    
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2])
    };
  }
  
  private static generateMovieKey(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  
  private static parseShowtime(date: Date, showtimeStr: string): Date {
    // Parse time strings like "7:00 PM", "2:30 PM", etc.
    const timeMatch = showtimeStr.match(/(\d{1,2}):?(\d{0,2})\s*(AM|PM)/i);
    
    if (!timeMatch) {
      // Default to 7:00 PM if we can't parse
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 19, 0);
    }
    
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  }
}