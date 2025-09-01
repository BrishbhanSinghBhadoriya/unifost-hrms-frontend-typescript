import { NextRequest, NextResponse } from 'next/server';
import { mockHolidays } from '@/lib/mock';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const region = searchParams.get('region') || '';

  let filteredHolidays = mockHolidays.filter(holiday => 
    holiday.date.startsWith(year)
  );

  if (region) {
    filteredHolidays = filteredHolidays.filter(holiday => holiday.region === region);
  }

  return NextResponse.json(filteredHolidays);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newHoliday = {
    id: String(Date.now()),
    ...body,
  };

  mockHolidays.push(newHoliday);
  
  return NextResponse.json(newHoliday, { status: 201 });
}