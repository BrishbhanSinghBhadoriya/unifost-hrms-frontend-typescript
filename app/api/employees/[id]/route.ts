import { NextRequest, NextResponse } from 'next/server';
import { mockEmployees } from '@/lib/mock';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const employee = mockEmployees.find(emp => emp.id === params.id);
  
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  return NextResponse.json(employee);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const employeeIndex = mockEmployees.findIndex(emp => emp.id === params.id);
  
  if (employeeIndex === -1) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  mockEmployees[employeeIndex] = { ...mockEmployees[employeeIndex], ...body };
  
  return NextResponse.json(mockEmployees[employeeIndex]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const employeeIndex = mockEmployees.findIndex(emp => emp.id === params.id);
  
  if (employeeIndex === -1) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  mockEmployees.splice(employeeIndex, 1);
  
  return NextResponse.json({ message: 'Employee deleted successfully' });
}