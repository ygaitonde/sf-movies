'use client';

import { MovieSchedule, Showtime } from '@/types/movie';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface MovieCardProps {
  schedule: MovieSchedule;
  selectedDate: Date;
}

export default function MovieCard({ schedule, selectedDate }: MovieCardProps) {
  const { movie, theater, showtimes } = schedule;
  const timezone = 'America/Los_Angeles';

  const dayShowtimes = showtimes
    .filter(
      (showtime) =>
        formatInTimeZone(
          new Date(showtime.startTime),
          timezone,
          'yyyy-MM-dd'
        ) === format(selectedDate, 'yyyy-MM-dd')
    )
    .sort(
      (first, second) =>
        new Date(first.startTime).getTime() - new Date(second.startTime).getTime()
    );

  if (dayShowtimes.length === 0) return null;

  function getGoogleCalendarUrl(showtime: Showtime, startDate?: Date) {
    const start = startDate ?? new Date(showtime.startTime);
    const durationMinutes = movie.duration > 0 ? movie.duration : 120;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const formatForCalendar = (date: Date) =>
      formatInTimeZone(date, timezone, "yyyyMMdd'T'HHmmss");

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: movie.title,
      dates: `${formatForCalendar(start)}/${formatForCalendar(end)}`,
      details: showtime.ticketUrl
        ? `Get tickets: ${showtime.ticketUrl}`
        : `Showtime for ${movie.title}`,
      ctz: timezone,
    });

    if (theater.name || theater.address) {
      const location = theater.address
        ? `${theater.name}, ${theater.address}`
        : theater.name;
      params.set('location', location);
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  return (
    <div style={{ borderBottom: '1px solid #000', paddingBottom: '15px', marginBottom: '15px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
        {movie.title}
      </h3>
      
      <p style={{ fontSize: '14px', marginBottom: '8px' }}>
        {theater.name} • {movie.duration} min
      </p>

      <div style={{ marginBottom: '8px' }}>
        <strong>Showtimes:</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
          {dayShowtimes.map((showtime) => {
            const startDate = new Date(showtime.startTime);
            const calendarUrl = getGoogleCalendarUrl(showtime, startDate);

            return (
              <div
                key={showtime.id}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
              >
                <a
                  href={showtime.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  {formatInTimeZone(startDate, timezone, 'h:mm a')}
                </a>
                <span style={{ color: '#555' }}>·</span>
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  Add to Google Calendar
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
