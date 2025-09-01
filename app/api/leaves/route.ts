import { NextRequest, NextResponse } from 'next/server';
import { mockLeaveRequests } from '@/lib/mock';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employee = searchParams.get('employee') || '';
  const status = searchParams.get('status') || '';
  const type = searchParams.get('type') || '';

  let filteredLeaves = [...mockLeaveRequests];

  if (employee) {
    filteredLeaves = filteredLeaves.filter(leave => leave.employeeId === employee);
  }

  if (status) {
    filteredLeaves = filteredLeaves.filter(leave => leave.status === status);
  }

  if (type) {
    filteredLeaves = filteredLeaves.filter(leave => leave.type === type);
  }

  return NextResponse.json(filteredLeaves);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newLeaveRequest = {
    id: String(Date.now()),
    ...body,
    status: 'pending',
    appliedOn: new Date().toISOString().split('T')[0],
  };

  mockLeaveRequests.push(newLeaveRequest);
  
  return NextResponse.json(newLeaveRequest, { status: 201 });
}