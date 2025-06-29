'use client';

import { MovieSchedule, Showtime } from '@/types/movie';
import { format } from 'date-fns';
import Image from 'next/image';

interface MovieCardProps {
  schedule: MovieSchedule;
  selectedDate: Date;
}

export default function MovieCard({ schedule, selectedDate }: MovieCardProps) {
  const { movie, theater, showtimes } = schedule;
  
  const dayShowtimes = showtimes.filter(showtime => 
    format(new Date(showtime.startTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  if (dayShowtimes.length === 0) return null;

  const handleShowtimeClick = (showtime: Showtime) => {
    if (showtime.ticketUrl) {
      window.open(showtime.ticketUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex gap-4">
        {/* Movie Poster */}
        <div className="flex-shrink-0">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={96}
              height={144}
              className="w-24 h-36 object-cover rounded-lg"
            />
          ) : (
            <div className="w-24 h-36 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center">{movie.title}</span>
            </div>
          )}
        </div>

        {/* Movie Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900">{movie.title}</h3>
            <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
              {movie.rating}
            </span>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            <span>{movie.genre.join(', ')}</span>
            <span className="mx-2">•</span>
            <span>{movie.duration} min</span>
          </div>

          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {movie.description}
          </p>

          {/* Theater Info */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-1">{theater.name}</h4>
            <p className="text-sm text-gray-600">{theater.address}</p>
          </div>

          {/* Showtimes */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Showtimes</h5>
            <div className="flex flex-wrap gap-2">
              {dayShowtimes.map(showtime => (
                <button
                  key={showtime.id}
                  onClick={() => handleShowtimeClick(showtime)}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <span>{format(new Date(showtime.startTime), 'h:mm a')}</span>
                    {showtime.format && showtime.format !== 'Standard' && (
                      <span className="text-xs opacity-90">{showtime.format}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {dayShowtimes.some(st => st.availableSeats !== undefined) && (
              <div className="mt-2 text-xs text-gray-500">
                Available seats: {dayShowtimes[0].availableSeats}+
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}