export interface Theater {
  id: string;
  name: string;
  address: string;
  chain: TheaterChain;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Movie {
  id: string;
  title: string;
  genre: string[];
  rating: string;
  duration: number;
  description: string;
  posterUrl?: string;
  trailerUrl?: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  theaterId: string;
  startTime: Date;
  endTime: Date;
  ticketUrl?: string;
  availableSeats?: number;
  format?: string; // IMAX, 3D, etc.
}

export interface MovieSchedule {
  theater: Theater;
  movie: Movie;
  showtimes: Showtime[];
}

export enum TheaterChain {
  ROXIE = 'ROXIE',
  BALBOA = 'BALBOA',
  VOGUE = 'VOGUE',
  FOURSTAR = '4-STAR'
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface FilterOptions {
  theaters?: TheaterChain[];
  genres?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  timeRange?: {
    start: string; // HH:MM format
    end: string;
  };
}