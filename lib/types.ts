export interface Employee {
  _id: string;
  id: string;
  empCode: string;
  name: string;
  email: string;
  phone: string;
  
  department: string;
  designation: string;
  managerId?: string;
  managerName?: string;
  status: 'active' | 'inactive' | 'terminated';
  joinedOn: string;
  profilePicture?: string;
  dob?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
   
  };
  isActive: boolean;
  salary?: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  status: 'present' | 'absent' | 'leave' | 'holiday' | 'half-day';
  notes?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  region: string;
  type: 'national' | 'regional' | 'optional';
  description?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approverName?: string;
  appliedOn: string;
  approvedOn?: string;
  attachmentUrl?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'employee' | 'manager' | 'hr' | 'admin';
  employeeId?: string;
  name: string;
  avatarUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  employeeCount: number;
}

export interface Designation {
  id: string;
  title: string;
  department: string;
  level: number;
}

export interface LeaveBalance {
  employeeId: string;
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  earned: { total: number; used: number; remaining: number };
}