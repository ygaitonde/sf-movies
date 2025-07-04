'use client';

import { MovieSchedule } from '@/types/movie';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface MovieCardProps {
  schedule: MovieSchedule;
  selectedDate: Date;
}

export default function MovieCard({ schedule, selectedDate }: MovieCardProps) {
  const { movie, theater, showtimes } = schedule;
  
  const dayShowtimes = showtimes.filter(showtime => 
    formatInTimeZone(new Date(showtime.startTime), 'America/Los_Angeles', 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  if (dayShowtimes.length === 0) return null;


  return (
    <div style={{ borderBottom: '1px solid #000', paddingBottom: '15px', marginBottom: '15px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
        {movie.title}
      </h3>
      
      <p style={{ fontSize: '14px', marginBottom: '8px' }}>
        {theater.name} • {movie.duration} min
      </p>

      <div style={{ marginBottom: '8px' }}>
        <strong>Showtimes:</strong>{' '}
        {dayShowtimes.map((showtime, index) => (
          <span key={showtime.id}>
            <a
              href={showtime.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              {formatInTimeZone(new Date(showtime.startTime), 'America/Los_Angeles', 'h:mm a')}
            </a>
            {index < dayShowtimes.length - 1 && ', '}
          </span>
        ))}
      </div>
    </div>
  );
}