"use client";

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardSkeleton } from '@/components/ui/loading-skeleton';
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
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);

  const stats = useMemo(() => {
    const pendingLeaves = myLeaves.filter(l => l.status === 'pending').length;
    const approvedLeaves = myLeaves.filter(l => l.status === 'approved').length;
    const daysTaken = myLeaves
      .filter(l => l.status === 'approved')
      .reduce((sum, l) => sum + (l.totalDays || l.days || 0), 0);
    return { pendingLeaves, approvedLeaves, daysTaken };
  }, [myLeaves]);

  const upcomingLeave = useMemo(() => {
    const future = myLeaves
      .filter(l => dayjs(l.startDate).isAfter(dayjs(), 'day'))
      .sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());
    return future[0];
  }, [myLeaves]);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const res = await api.get('leaves/me');
      const body: any = res.data;
      const leaves = Array.isArray(body?.leaves) ? body.leaves : (Array.isArray(body) ? body : []);
      setMyLeaves(leaves);
    } catch (error) {
      toast.error('Failed to load your dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || 'User'}!
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero / Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-600/10 via-indigo-500/10 to-sky-400/10">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="p-6 md:p-8 flex items-center gap-4 md:gap-6">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedLeaves}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Taken</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.daysTaken}</div>
            <p className="text-xs text-muted-foreground">Total approved days</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming leave + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70">
          <CardHeader>
            <CardTitle>Upcoming Leave</CardTitle>
            <CardDescription>Your next scheduled leave</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLeave ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground capitalize">{upcomingLeave.leaveType}</div>
                  <div className="text-xl font-semibold">
                    {dayjs(upcomingLeave.startDate).format('MMM DD, YYYY')} → {dayjs(upcomingLeave.endDate).format('MMM DD, YYYY')}
                  </div>
                  <div className="text-sm text-muted-foreground">{upcomingLeave.totalDays} days • {upcomingLeave.status}</div>
                </div>
                <Badge variant="secondary">{dayjs(upcomingLeave.startDate).fromNow()}</Badge>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No upcoming leave scheduled.</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/attendance')}>
              <Clock className="mr-2 h-4 w-4" /> View Attendance
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/leaves/apply')}>
              <FileText className="mr-2 h-4 w-4" /> Apply Leave
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/leaves')}>
              <FileText className="mr-2 h-4 w-4" /> View My Leaves
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Employee Portal Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile & Attendance */}
        <div className="space-y-6 xl:col-span-2">
          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" /> Employee Profile
                </CardTitle>
                <CardDescription>Quick view of your information</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>View Profile</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium">{user?.designation || '—'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{user?.department || '—'}</p>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{user?.employeeId || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-muted-foreground" /> Attendance
                </CardTitle>
                <CardDescription>Your current attendance summary</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/attendance')}>View Attendance</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-gradient-to-br from-secondary to-card p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-xl font-semibold">—</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-secondary to-card p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">Present</p>
                  <p className="text-xl font-semibold">—</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-secondary to-card p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">Absent</p>
                  <p className="text-xl font-semibold">—</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-secondary to-card p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">Late</p>
                  <p className="text-xl font-semibold">—</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll & Announcements */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
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

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-card to-secondary/40 border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-muted-foreground" /> Announcements
              </CardTitle>
              <CardDescription>Stay up to date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-xl border p-3 bg-gradient-to-br from-secondary to-card">
                  <p className="text-sm font-medium">No announcements</p>
                  <p className="text-xs text-muted-foreground">Company updates will appear here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}