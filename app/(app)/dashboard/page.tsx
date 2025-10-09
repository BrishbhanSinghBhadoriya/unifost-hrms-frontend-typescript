"use client";

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  FileText,
  Clock,
  Activity,
  
  
  Eye,
  
} from 'lucide-react';
import Link from 'next/link';
import {   useMemo } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { formatDateTimeIST } from '@/lib/utils';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
import { useQuery } from '@tanstack/react-query';
import getDashboardData,{getEmployeesDashboardata} from '@/components/functions/getDashboardData';
import { getUpcommingLeaves } from '@/components/functions/getUpcommingLeaves';
import { fetchAllEmployees } from '@/components/functions/Employee';
import getLeaves from '@/components/functions/getLeaves';
import { Calendar as MiniCalendar } from '@/components/ui/calendar';
import { generateIndianHolidays } from '@/lib/indian-holidays';
dayjs.extend(relativeTime);

export default function DashboardPage() {
  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();

  
  
  const {data: dashboardData, isLoading: isDashboardLoading} = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(),
    enabled: userRole === 'hr',
  });
  const {data: empdashboardData, isLoading: isEmpDashboardLoading} = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: () => getEmployeesDashboardata(),
    enabled: userRole !== 'hr',
  })
  console.log("foix",empdashboardData);
  const {data:upcomingLeave,isLoading:isupcomingLeave}=useQuery({
   queryKey:['upcommingLeaves'],
   queryFn:()=>getUpcommingLeaves()
  })
  const stats = dashboardData?.stats || {} as any;
  const attendance = dashboardData?.attendanceReport || {} as any;
  const birthday=dashboardData?.birthdays || [] as any;
  console.log(upcomingLeave);

  const { data: allEmployees, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => fetchAllEmployees(),
  });

  // Employee-specific leaves
  const { data: myLeavesData } = useQuery({
    queryKey: ['myLeaves'],
    queryFn: () => getLeaves('employee'),
    enabled: userRole === 'employee',
  });

  const employeeStats = useMemo(() => {
    const leaves = Array.isArray(myLeavesData) ? myLeavesData : [] as any[];
    const pendingLeaves = leaves.filter(l => String(l.status).toLowerCase() === 'pending').length;
    const approvedLeaves = leaves.filter(l => String(l.status).toLowerCase() === 'approved').length;
    const daysTaken = leaves
      .filter(l => String(l.status).toLowerCase() === 'approved')
      .reduce((sum, l) => sum + (Number(l.totalDays ?? l.days ?? 0) || 0), 0);
    return { pendingLeaves, approvedLeaves, daysTaken };
  }, [myLeavesData]);

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }, []);

  // Monthly attendance coloring (present/absent/halfday)
  const { presentDates, absentDates, halfDayDates } = useMemo(() => {
    const monthly = (empdashboardData?.data?.monthly?.attendance || empdashboardData?.data?.attendance || []) as any[];
    const present = monthly
      .filter((a) => String(a.status).toLowerCase() === 'present')
      .map((a) => new Date(a.date));
    const absent = monthly
      .filter((a) => String(a.status).toLowerCase() === 'absent')
      .map((a) => new Date(a.date));
    const halfday = monthly
      .filter((a) => {
        const s = String(a.status).toLowerCase();
        return s === 'late' || s === 'halfday' || s === 'half day' || s === 'half_day';
      })
      .map((a) => new Date(a.date));
    return { presentDates: present, absentDates: absent, halfDayDates: halfday };
  }, [empdashboardData]);

  return (
    <div className="space-y-8">
      {/* Hero / Profile Header with Image Slider */}
      <div className="relative overflow-hidden rounded-2xl border">
        <Carousel className="w-full">
          <CarouselContent>
            {[
              'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600',
              'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600',
              'https://images.pexels.com/photos/3184160/pexels-photo-3184160.jpeg?auto=compress&cs=tinysrgb&w=1600',
            ].map((src, idx) => (
              <CarouselItem key={idx}>
                <div className="relative h-40 sm:h-56 md:h-64 lg:h-72 w-full">
                  <img src={src} alt={`slide-${idx + 1}`} className="h-full w-full object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-3 bg-background/70 backdrop-blur" />
          <CarouselNext className="right-3 bg-background/70 backdrop-blur" />
        </Carousel>
        <div className="p-6 md:p-8 flex items-center gap-4 md:gap-6 bg-gradient-to-br from-blue-600/10 via-indigo-500/10 to-sky-400/10 border-t">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user?.profilePicture || ''} alt={user?.name} />
            <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{greeting}, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
            <p className="text-sm text-muted-foreground">
              {user?.designation || 'Employee'} • {user?.department}
            </p>
          </div>
          <div className=''>Last login: {user?.lastLogin ? dayjs(user.lastLogin).format('DD MMM YYYY, hh:mm A') : '—'}</div>
          <div className="hidden sm:flex gap-2">
            <Button variant="outline" onClick={() => router.push('/attendance')}>
              <Clock className="mr-2 h-4 w-4" /> Attendance
            </Button>
            <Button variant="outline" onClick={() => router.push('/leaves')}>
              <FileText className="mr-2 h-4 w-4" /> Leaves
            </Button>
            <Button variant="outline" onClick={() => router.push('/profile')}>
              <Users className="mr-2 h-4 w-4" /> Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {userRole === 'hr' ? (
          <>

           <Link href="/employees"> <StatCard title="Total Employees" value={stats.totalEmployees || 0} icon={Users} description="All active employees" accentClassName="bg-blue-100 text-blue-600" /> </Link>
            
            <StatCard title="New Joinees" value={stats.newJoiners || 0} icon={Users} description="This month" accentClassName="bg-green-100 text-green-600" />
           <Link href={"/leaves"}> <StatCard title="Pending Leaves" value={stats.pendingLeaves || 0} icon={FileText} description="Awaiting approval" accentClassName="bg-amber-100 text-amber-600" />
           </Link>
            <Card className="rounded-2xl md:col-span-4"> 
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Today's Attendance</CardTitle></CardHeader>
          <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Present</p><p className="text-lg font-semibold">{attendance.present ?? '—'}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Absent</p><p className="text-lg font-semibold">{attendance.absent ?? '—'}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Late</p><p className="text-lg font-semibold">{attendance.late ?? '—'}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">On Leave</p><p className="text-lg font-semibold">{(attendance.onLeave ?? 0) as any}</p></div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{dayjs(Date.now()).format('DD/MM/YYYY')}</p>
          </CardContent>
        </Card>

            {/* Upcoming Leaves Table */}
            <Card className="rounded-2xl md:col-span-4">
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
                <CardTitle>Upcoming Leaves</CardTitle>
                <CardDescription>Approved and scheduled leaves</CardDescription>
    </div>
    <Link href={'/leaves'}>
    <button
      className="px-4 py-2 text-sm font-medium rounded-xl 
                 bg-gradient-to-r from-blue-500 to-indigo-500 
                 text-white shadow-md hover:shadow-lg 
                 hover:scale-105 transition-all duration-300"
    >
      See all
    </button></Link>
          </CardHeader>

          <CardContent>
                <DataTable
                  data={(upcomingLeave?.upcomingLeaves || []) as any[]}
                  columns={[
                  
                    {
                      key: 'employeeId',
                      label: 'Employee ID',
                      sortable: true,
                      sortType: 'string' as const,
                      sortAccessor: (row: any) => {
                        const v: any = row.employeeId;
                        if (typeof v === 'string' || typeof v === 'number') return String(v);
                        if (v && typeof v === 'object') return String(v.employeeId || v.empCode || v._id || v.id || '');
                        return '';
                      },
                      render: (_: any, row: any) => {
                        const v: any = row.employeeId;
                        const display = typeof v === 'string' || typeof v === 'number'
                          ? String(v)
                          : String(v?.employeeId || v?.empCode || v?._id || v?.id || '');
                        return <span>{display || '—'}</span>;
                      }
                    },
        {
          key: 'profilePicture',
          label: 'Photo',
          sortable: false,
          render: (_: any, row: any) => (
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.profilePicture || row.employeeProfilePicture} />
              <AvatarFallback>
                {row.employeeName?.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ),
        },
                    { key: 'employeeName', label: 'Employee', sortable: true, render: (v: any) => <span>{String(v || '')}</span> },
                    { key: 'leaveType', label: 'Type', sortable: true },
                    { key: 'totalDays', label: 'Days', sortable: true, sortType: 'number' },
        {
          key: 'startDate',
          label: 'Start',
          sortable: true,
          sortType: 'date',
          render: (v) => dayjs(v).format('DD MMM YYYY'),
        },
        {
          key: 'endDate',
          label: 'End',
          sortable: true,
          sortType: 'date',
          render: (v) => dayjs(v).format('DD MMM YYYY'),
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          render: (v) => (
            <Badge
                      variant="secondary"
                      className={`capitalize ${
                        String(v).toLowerCase() === "approved"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {String(v || "").toLowerCase()}
                    </Badge>
          ),
                     },
                  ]}
                  searchPlaceholder="Search leaves..."
                  initialPageSize={5}
                />
          </CardContent>
        </Card>

            <Card className="rounded-2xl md:col-span-4">
              <CardHeader>
                <CardTitle>Birthdays</CardTitle>
                <CardDescription>Employees with birthdays</CardDescription>
          </CardHeader>
          <CardContent>
                <DataTable
                  data={birthday as any[]}
                  columns={[
                    { key: 'profilePicture', label: 'Photo', sortable: false, render: (_, row) => (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={row.profilePicture} />
                        <AvatarFallback>
                          {row.name?.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )},
                    { key: 'name', label: 'Name', sortable: true },
                    { key: 'employeeId', label: 'Emp ID', sortable: true },
                    { key: 'department', label: 'Department', sortable: true },
                    { key: 'designation', label: 'Designation', sortable: true },
                    { key: 'dob', label: 'DOB', sortable: true, sortType: 'date', render: (v) => v ? dayjs(v).format('DD MMM YYYY') : '—' },
                    { key: 'email', label: 'Email', sortable: true },
                  
                  ]}
                  actions={(row: any) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="View profile"
                      onClick={() => router.push(`/employees/${row._id || row.id || row.employeeId}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  searchPlaceholder="Search birthdays..."
                  initialPageSize={5}
                />
          </CardContent>
        </Card>
          </>
        ) : (
          <>
          <StatCard
            title="Working Days This Month"
            value={empdashboardData?.data?.monthly?.totalWorkingDays ?? 0}
            icon={Calendar}
            description={`Present: ${empdashboardData?.data?.monthly?.presentDays ?? 0} • Absent: ${empdashboardData?.data?.monthly?.absentDays ?? 0} • Late: ${empdashboardData?.data?.monthly?.lateDays ?? 0}`}
          />
            <StatCard title="My Pending Leaves" value={employeeStats.pendingLeaves} icon={FileText} description="Awaiting HR approval" />
            <StatCard title="My Approved Leaves" value={employeeStats.approvedLeaves} icon={Activity} description="This year" />
            <StatCard title="Days Taken" value={employeeStats.daysTaken} icon={Calendar} description="Approved leave days" />
            
            {/* Daily Attendance (employee) */}
            <Card className="rounded-2xl md:col-span-4">
          <CardHeader>
    <CardTitle>Daily Attendance</CardTitle>
    <CardDescription>
      {empdashboardData?.data?.today.status === "present" ? "Check-in / Check-out for today" : "Status for today"} • {dayjs().format("dddd, DD MMM YYYY")}
    </CardDescription>
          </CardHeader>
          <CardContent>
    <div className="text-sm">
    {empdashboardData?.data ? (
  empdashboardData?.data?.today.status === "present" ? (

<div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
        <span>Present</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          Check-in:{" "}
          {empdashboardData?.data?.today?.checkIn
            ? formatDateTimeIST(undefined, empdashboardData.data.today.checkIn, false)
            : "--"}
        </span>
        <span>
          Check-out:{" "}
          {empdashboardData?.data?.today?.checkOut
            ? formatDateTimeIST(undefined, empdashboardData.data.today.checkOut, false)
            : "--"}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        Hours Worked: {empdashboardData?.data?.today.hoursWorked ?? 0}
      </div>
    </div>
  ) : empdashboardData?.data?.today.status === "absent" ? (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
      <span>Absent</span>
    </div>
  ) : empdashboardData?.data?.today.status === "late" ? (
    // ⏳ Halfday Case
    <div className="flex items-center gap-2">
      <span className="inline-flex h-2 w-2 rounded-full bg-yellow-500" />
      <span>Half Day</span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-2 w-2 rounded-full bg-gray-400" />
      <span>No data available</span>
    </div>
  )
) : null}

      
    </div>
          </CardContent>
        </Card>

            {/* Announcements / Notices */}
            <Card className="rounded-2xl md:col-span-4">
          <CardHeader>
                <CardTitle>Announcements / Notices</CardTitle>
                <CardDescription>HR announcements, company events, holidays</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">HR Announcements</p>
                    <p className="text-muted-foreground">No announcements.</p>
                  </div>
                  <div>
                    <p className="font-medium">Upcoming Leaves</p>
                    <p className="text-muted-foreground">{(upcomingLeave?.upcomingLeaves?.length || 0)} scheduled leaves</p>
                </div>
                </div>
              </CardContent>
            </Card>
            {/* Monthly Attendance & Leave Balance */}
            <div className="md:col-span-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Monthly Attendance</CardTitle>
                  <CardDescription>{dayjs().format('MMMM YYYY')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MiniCalendar
                    mode="single"
                    modifiers={{ present: presentDates, absent: absentDates, halfday: halfDayDates }}
                    modifiersClassNames={{
                      present: 'bg-green-500 text-white hover:bg-green-600',
                      absent: 'bg-red-500 text-white hover:bg-red-600',
                      halfday: 'bg-yellow-500 text-black hover:bg-yellow-600',
                    }}
                    className="rounded-md border w-full"
                  />
            </CardContent>
          </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Leave Balance</CardTitle>
                  <CardDescription>Casual, Sick, Earned</CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between"><span>Casual</span><span className="font-medium">—</span></div>
                    <div className="flex items-center justify-between"><span>Sick</span><span className="font-medium">—</span></div>
                    <div className="flex items-center justify-between"><span>Earned</span><span className="font-medium">—</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

            
          </>
        )}
      </div>
    
      {userRole === 'hr' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Employee Management</h2>

          
          

          {/* Engagement & Announcements */}
                    
        </div>
      )}

      {/* Employee Portal Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile & Attendance */}
        

        
      </div>
    </div>
  );
}