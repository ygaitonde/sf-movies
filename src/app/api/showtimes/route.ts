import { NextRequest, NextResponse } from 'next/server';
import { theaterService } from '@/services/theater-service';
import { TheaterChain } from '@/types/movie';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const theatersParam = searchParams.get('theaters');
    const genresParam = searchParams.get('genres');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const filters = {
      theaters: theatersParam ? 
        theatersParam.split(',').filter(t => Object.values(TheaterChain).includes(t as TheaterChain)) as TheaterChain[] : 
        undefined,
      genres: genresParam ? genresParam.split(',') : undefined,
    };

    const result = await theaterService.getMovieSchedules(date, filters);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Showtimes API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        success: false,
        data: [],
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}