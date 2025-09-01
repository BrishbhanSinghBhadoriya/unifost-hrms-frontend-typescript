"use client";

import { useSession } from 'next-auth/react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CalendarDays,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { mockEmployees, mockAttendance, mockLeaveRequests, mockHolidays } from '@/lib/mock';

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'employee';
  const employeeId = (session?.user as any)?.employeeId;

  // Calculate statistics
  const totalEmployees = mockEmployees.length;
  const activeEmployees = mockEmployees.filter(emp => emp.status === 'active').length;
  const todayAttendance = mockAttendance.filter(record => 
    record.date === new Date().toISOString().split('T')[0] && record.status === 'present'
  ).length;
  const pendingLeaves = mockLeaveRequests.filter(req => req.status === 'pending').length;
  const upcomingHolidays = mockHolidays.filter(holiday => 
    new Date(holiday.date) > new Date()
  ).slice(0, 3);

  const recentLeaveRequests = mockLeaveRequests
    .filter(req => userRole === 'employee' ? req.employeeId === employeeId : true)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening in your organization today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(userRole === 'hr' || userRole === 'admin') && (
          <>
            <StatCard
              title="Total Employees"
              value={totalEmployees}
              icon={Users}
              description="Active workforce"
            />
            <StatCard
              title="Present Today"
              value={todayAttendance}
              icon={UserCheck}
              description={`${Math.round((todayAttendance / activeEmployees) * 100)}% attendance`}
            />
          </>
        )}
        
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves}
          icon={FileText}
          description="Awaiting approval"
        />
        
        <StatCard
          title="Upcoming Holidays"
          value={upcomingHolidays.length}
          icon={CalendarDays}
          description="This month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions for your convenience
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userRole === 'employee' && (
              <>
                <Button asChild className="h-auto p-4 flex flex-col gap-2">
                  <Link href="/leaves/apply">
                    <FileText className="h-6 w-6" />
                    Apply Leave
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Link href="/attendance">
                    <Clock className="h-6 w-6" />
                    View Attendance
                  </Link>
                </Button>
              </>
            )}
            
            {(userRole === 'hr' || userRole === 'admin') && (
              <>
                <Button asChild className="h-auto p-4 flex flex-col gap-2">
                  <Link href="/employees">
                    <UserPlus className="h-6 w-6" />
                    Add Employee
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Link href="/leaves">
                    <FileText className="h-6 w-6" />
                    Approve Leaves
                  </Link>
                </Button>
              </>
            )}
            
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Link href="/holidays">
                <CalendarDays className="h-6 w-6" />
                View Holidays
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Link href="/profile">
                <Users className="h-6 w-6" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>
              {userRole === 'employee' ? 'Your recent leave requests' : 'Latest leave requests from team'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentLeaveRequests.length > 0 ? (
              <div className="space-y-4">
                {recentLeaveRequests.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {userRole === 'employee' ? leave.type : leave.employeeName}
                        </span>
                        <Badge variant={
                          leave.status === 'approved' ? 'default' :
                          leave.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {leave.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {leave.startDate} to {leave.endDate} ({leave.days} days)
                      </p>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/leaves">View All Requests</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent leave requests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
            <CardDescription>
              Plan your time off around these upcoming holidays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{holiday.name}</h4>
                    <p className="text-sm text-muted-foreground">{holiday.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}