import { NextRequest, NextResponse } from 'next/server';
import { mockAttendance } from '@/lib/mock';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employee = searchParams.get('employee') || '';
  const month = searchParams.get('month') || '';
  const status = searchParams.get('status') || '';

  let filteredAttendance = [...mockAttendance];

  if (employee) {
    filteredAttendance = filteredAttendance.filter(record => record.employeeId === employee);
  }

  if (month) {
    filteredAttendance = filteredAttendance.filter(record => 
      record.date.startsWith(month)
    );
  }

  if (status) {
    filteredAttendance = filteredAttendance.filter(record => record.status === status);
  }

  return NextResponse.json(filteredAttendance);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newRecord = {
    id: String(Date.now()),
    ...body,
  };

  mockAttendance.push(newRecord);
  
  return NextResponse.json(newRecord, { status: 201 });
}