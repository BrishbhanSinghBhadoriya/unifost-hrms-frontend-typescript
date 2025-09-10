"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProfileSkeleton } from '@/components/ui/loading-skeleton';
import { Employee, AttendanceRecord, LeaveRequest, LeaveBalance } from '@/lib/types';
import { getAttendanceByEmployee, getLeaveRequestsByEmployee, getLeaveBalance } from '@/lib/mock';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  MapPin,
  Users,
  Edit,
  FileText,
  Clock,
} from 'lucide-react';
import dayjs from 'dayjs';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function EmployeeProfilePage() {
  const params = useParams();
const id = params.id as string;
  const getEmployeeById = async (id: string): Promise<Employee> => {
    const response = await api.get(`/hr/getEmployee/${id}`);
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['employee', params.id],
    queryFn: () => getEmployeeById(params.id as string),
  });
  const employee = data?.employee[0] as Employee | undefined;
  const currentMonth = useMemo(() => dayjs().format('YYYY-MM'), []);
  const attendance = useMemo<AttendanceRecord[]>(
    () => (employee ? getAttendanceByEmployee(employee.id, currentMonth) : []),
    [employee, currentMonth]
  );
  const leaveRequests = useMemo<LeaveRequest[]>(
    () => (employee ? getLeaveRequestsByEmployee(employee.id) : []),
    [employee]
  );
  const leaveBalance = useMemo<LeaveBalance | null>(
    () => (employee ? getLeaveBalance(employee.id) || null : null),
    [employee]
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Employee Not Found</h1>
        <p className="text-muted-foreground mt-2">The requested employee could not be found.</p>
      </div>
    );
  }

  const presentDays = attendance.filter((record) => record.status === 'present').length;
  const totalWorkingDays = attendance.length;
  const attendancePercentage = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-background">
                  <AvatarImage src={employee.profilePicture} />
                  <AvatarFallback className="text-xl font-semibold">
                    {employee.name}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{employee.name}</h1>
                    <Badge className="capitalize" variant={
                      employee.status === 'active' ? 'default' :
                      employee.status === 'inactive' ? 'secondary' : 'destructive'
                    }>
                      {employee.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{employee.designation}</p>
                  <p className="text-sm text-muted-foreground">{employee.department} • {employee.empCode}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground bg-background/60 backdrop-blur">
                      <Mail className="h-3.5 w-3.5" /> {employee.email}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground bg-background/60 backdrop-blur">
                      <Phone className="h-3.5 w-3.5" /> {employee.phone}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground bg-background/60 backdrop-blur">
                      <Calendar className="h-3.5 w-3.5" /> Joined {dayjs(employee.joinedOn).format('MMM DD, YYYY')}
                    </span>
                  </div>
                </div>

                <Button className="shrink-0">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-600 rounded-lg p-2">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-xl font-bold">{attendancePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {leaveBalance && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Casual Leaves</p>
                    <p className="text-xl font-bold">{leaveBalance.casual.remaining}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 text-orange-600 rounded-lg p-2">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sick Leaves</p>
                    <p className="text-xl font-bold">{leaveBalance.sick.remaining}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Earned Leaves</p>
                    <p className="text-xl font-bold">{leaveBalance.earned.remaining}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="job">Job Details</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth :</span>
                  <span>{employee.dob }</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="text-right max-w-48">{employee.address || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            
          </div>
        </TabsContent>

        <TabsContent value="job" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee Code</span>
                  <span className="font-medium">{employee.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span>{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Designation</span>
                  <span>{employee.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manager</span>
                  <span>{employee.managerName || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joining Date</span>
                  <span>{dayjs(employee.joinedOn).format('MMM DD, YYYY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employment Type</span>
                  <span>Full-time</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work Location</span>
                  <span>Office</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary</span>
                  <span>{employee.salary}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Attendance for {dayjs().format('MMMM YYYY')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{dayjs(record.date).format('MMM DD, YYYY')}</TableCell>
                      <TableCell>{record.checkIn || '-'}</TableCell>
                      <TableCell>{record.checkOut || '-'}</TableCell>
                      <TableCell>{record.hoursWorked || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          record.status === 'present' ? 'default' :
                          record.status === 'leave' ? 'secondary' :
                          record.status === 'absent' ? 'destructive' : 'outline'
                        }>
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                All leave requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="capitalize">{leave.type}</TableCell>
                      <TableCell>
                        {dayjs(leave.startDate).format('MMM DD')} - {dayjs(leave.endDate).format('MMM DD, YYYY')}
                      </TableCell>
                      <TableCell>{leave.days}</TableCell>
                      <TableCell>
                        <Badge variant={
                          leave.status === 'approved' ? 'default' :
                          leave.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">{leave.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Employee documents and files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
                <Button className="mt-4">Upload Document</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}