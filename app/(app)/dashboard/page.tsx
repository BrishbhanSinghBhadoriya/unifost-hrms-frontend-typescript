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
  Wallet,
  Megaphone,
  PieChart,
  Search,
  BarChart3,
  Gift,
  Award,
  Bell,
  Eye,
} from 'lucide-react';
import { useState,  useMemo } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useQuery } from '@tanstack/react-query';
import getDashboardData from '@/components/functions/getDashboardData';
import { getUpcommingLeaves } from '@/components/functions/getUpcommingLeaves';
dayjs.extend(relativeTime);

export default function DashboardPage() {
  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);

  // const stats = useMemo(() => {
  //   const totalEmployees = myLeaves.length;
  //   const pendingLeaves = myLeaves.filter(l => l.status === 'pending').length;
  //   const approvedLeaves = myLeaves.filter(l => l.status === 'approved').length;
  //   const daysTaken = myLeaves
  //     .filter(l => l.status === 'approved')
  //     .reduce((sum, l) => sum + (l.totalDays || l.days || 0), 0);
  //   return { totalEmployees, pendingLeaves, approvedLeaves, daysTaken };
  // }, [myLeaves]);

  
  const {data: dashboardData, isLoading: isDashboardLoading} = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(),
  });
  const {data:upcomingLeave,isLoading:isupcomingLeave}=useQuery({
   queryKey:['upcommingLeaves'],
   queryFn:()=>getUpcommingLeaves()
  })
  const stats = dashboardData?.stats || {} as any;
  const attendance = dashboardData?.attendanceReport || {} as any;
  const birthday=dashboardData?.birthdays || [] as any;
  console.log(upcomingLeave);

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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hi, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
            <p className="text-sm text-muted-foreground">
              {user?.designation || 'Employee'} • {user?.department}
            </p>
          </div>
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
            <StatCard title="Total Employees" value={stats.totalEmployees || 0} icon={Users} description="All active employees" accentClassName="bg-blue-100 text-blue-600" />
            <StatCard title="New Joinees" value={stats.newJoiners || 0} icon={Users} description="This month / quarter" accentClassName="bg-green-100 text-green-600" />
            <StatCard title="Pending Leaves" value={stats.pendingLeaves || 0} icon={FileText} description="Awaiting approval" accentClassName="bg-amber-100 text-amber-600" />
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
              <CardHeader>
                <CardTitle>Upcoming Leaves</CardTitle>
                <CardDescription>Approved and scheduled leaves</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={(upcomingLeave?.upcomingLeaves || []) as any[]}
                  columns={[
                    { key: 'employeeName', label: 'Employee', sortable: true },
                    { key: 'leaveType', label: 'Type', sortable: true },
                    { key: 'totalDays', label: 'Days', sortable: true, sortType: 'number' },
                    { key: 'startDate', label: 'Start', sortable: true, sortType: 'date', render: (v) => dayjs(v).format('DD MMM YYYY') },
                    { key: 'endDate', label: 'End', sortable: true, sortType: 'date', render: (v) => dayjs(v).format('DD MMM YYYY') },
                    { key: 'status', label: 'Status', sortable: true, render: (v) => <Badge
                      variant="secondary"
                      className={`capitalize ${
                        String(v).toLowerCase() === "approved"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {String(v || "").toLowerCase()}
                    </Badge>
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
            <StatCard title="My Pending Leaves" value={stats.pendingLeaves} icon={FileText} description="Awaiting HR approval" />
            <StatCard title="My Approved Leaves" value={stats.approvedLeaves} icon={Activity} description="This year" />
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
        

        {/* Payroll & Announcements */}
        <div className="grid grid-cols-1 gap-6 w-full xl:col-span-3">
          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70 w-full lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div >
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" /> Payroll
                </CardTitle>
                <CardDescription>Latest salary and payslips</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
                Manage Bank Details
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Paid</span>
                  <span className="font-medium">—</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">—</span>
                </div>
                <Button variant="outline" className="w-full mt-2">
                  Download Latest Payslip
                </Button>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}