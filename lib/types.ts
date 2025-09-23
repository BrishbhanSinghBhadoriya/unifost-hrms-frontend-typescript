export interface Employee {
  username:string,
  password:string,
  _id: string;
  employeeId: string;

  managerId?: string;
  managerName?: string;
  dateOfBirth?: string;
  empCode: string;
  name: string;
  fatherName:string,
  bloodGroup:string,
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  status: 'active' | 'inactive' | 'terminated';
  joinedOn: string;
  profilePicture?: string;
  dob?: string;
  avatarUrl?: string;
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
  _id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
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
  _id?: string;

  // Authentication & Basic Info
  username: string;
  password?: string; // usually not exposed in frontend but exists in backend
  role: "employee" | "manager" | "hr" | "admin";

  // Status Flags
  isAdmin: boolean;
  isManager: boolean;
  isHR: boolean;
  isEmployee: boolean;
  isActive: boolean;

  // Personal Information
  name: string;
  fatherName?: string;
  bloodGroup?: string;
  email: string;
  phone: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  dob?: string;
  gender?: "male" | "female" | "other";
  profilePicture?: string;
  avatarUrl?: string;
  professionalEmailId?: string;
  emergencyContactNo?: number;

  // Employment Information
  employeeId: string;
  joiningDate?: string | null;
  experience?: {
    company: string;
    designation: string;
    startDate?: string | null;
    endDate?: string | null;
    description?: string;
  }[];

  education?: {
    degree: string;
    institution?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }[];

  // Bank Information
  bankDetails?: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountType: "savings" | "current";
    bankIFSC: string;
    bankAccountHolderName: string;
  }[];

  // Work Details
  department: "IT" | "HR" | "Marketing" | "Sales" | "Other";
  designation: string;
  jobType?: "FULL TIME" | "INTERN" | "FREELANCE";
  workMode?: string;
  lastLogin?: string;

  reportingTo?: string;

  // Documents
  documents?: {
    adharImage?: string;
    adharNumber?: string;
    panImage?: string;
    panNumber?: string;
    experienceLetterImage?: string;
    MarksheetImage_10?: string;
    MarksheetImage_12?: string;
    MarksheetImage_Graduation?: string;
    MarksheetImage_PostGraduationImage?: string;
  };

  // Optional extra fields
  salary?: number;
  skills?: string[];

  createdAt?: string;
  updatedAt?: string;
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