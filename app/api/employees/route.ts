import { NextRequest, NextResponse } from 'next/server';
import { mockEmployees } from '@/lib/mock';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || '';
  const status = searchParams.get('status') || '';

  let filteredEmployees = [...mockEmployees];

  if (search) {
    filteredEmployees = filteredEmployees.filter(emp =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (department) {
    filteredEmployees = filteredEmployees.filter(emp => emp.department === department);
  }

  if (status) {
    filteredEmployees = filteredEmployees.filter(emp => emp.status === status);
  }

  return NextResponse.json(filteredEmployees);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newEmployee = {
    id: String(Date.now()),
    ...body,
    avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
  };

  mockEmployees.push(newEmployee);
  
  return NextResponse.json(newEmployee, { status: 201 });
}