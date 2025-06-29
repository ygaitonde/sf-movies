import { NextRequest, NextResponse } from 'next/server';
import { theaterService } from '@/services/theater-service';
import { TheaterChain } from '@/types/movie';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainParam = searchParams.get('chain');

    const chain = chainParam && Object.values(TheaterChain).includes(chainParam as TheaterChain) 
      ? chainParam as TheaterChain 
      : undefined;

    const result = await theaterService.getTheaters(chain);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Theaters API error:', error);
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