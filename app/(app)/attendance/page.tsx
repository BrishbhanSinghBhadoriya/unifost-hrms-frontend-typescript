"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { AttendanceRecord } from '@/lib/types';
import { mockEmployees } from '@/lib/mock';
import { useFiltersStore } from '@/store/filters';
import { Clock, Calendar, Download } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { attendanceFilters, setAttendanceFilters } = useFiltersStore();
  const userRole = user?.role || 'employee';
  const currentEmployeeId = user?.id;

  useEffect(() => {
    fetchAttendance();
  }, [attendanceFilters]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // For employees, only show their own attendance
      if (userRole === 'employee') {
        if (currentEmployeeId) {
          params.append('employee', currentEmployeeId);
        }
      } else if (attendanceFilters.employee && attendanceFilters.employee !== 'all') {
        params.append('employee', attendanceFilters.employee);
      }
      
      if (attendanceFilters.month) params.append('month', attendanceFilters.month);
      if (attendanceFilters.status && attendanceFilters.status !== 'all') params.append('status', attendanceFilters.status);

      const response = await api.get(`/attendance?${params.toString()}`);
      setAttendance(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = () => {
    const csvData = attendance.map(record => ({
      Employee: record.employeeName,
      Date: record.date,
      'Check In': record.checkIn || '',
      'Check Out': record.checkOut || '',
      'Hours Worked': record.hoursWorked || '',
      Status: record.status,
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => (row as any)[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${attendanceFilters.month || 'all'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance data exported successfully');
  };

  const columns = [
    {
      key: 'employeeName' as keyof AttendanceRecord,
      label: 'Employee',
      sortable: true,
      render: (_: any, record: AttendanceRecord) => (
        <div>
          <div className="font-medium">{record.employeeName}</div>
          <div className="text-sm text-muted-foreground">
            {dayjs(record.date).format('dddd, MMM DD')}
          </div>
        </div>
      ),
    },
    {
      key: 'checkIn' as keyof AttendanceRecord,
      label: 'Check In',
      render: (value: string) => value || '-',
    },
    {
      key: 'checkOut' as keyof AttendanceRecord,
      label: 'Check Out',
      render: (value: string) => value || '-',
    },
    {
      key: 'hoursWorked' as keyof AttendanceRecord,
      label: 'Hours',
      render: (value: number) => value ? `${value}h` : '-',
    },
    {
      key: 'status' as keyof AttendanceRecord,
      label: 'Status',
      render: (status: string) => (
        <Badge variant={
          status === 'present' ? 'default' :
          status === 'leave' ? 'secondary' :
          status === 'absent' ? 'destructive' :
          status === 'holiday' ? 'outline' : 'secondary'
        }>
          {status}
        </Badge>
      ),
    },
  ];

  const filters = (
    <div className="flex gap-2">
      <Select
        value={attendanceFilters.month}
        onValueChange={(value: string) => setAttendanceFilters({ month: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => {
            const date = dayjs().subtract(i, 'month');
            return (
              <SelectItem key={i} value={date.format('YYYY-MM')}>
                {date.format('MMMM YYYY')}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {userRole !== 'employee' && (
        <Select
          value={attendanceFilters.employee}
          onValueChange={(value: string) => setAttendanceFilters({ employee: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {mockEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={attendanceFilters.status}
        onValueChange={(value: string) => setAttendanceFilters({ status: value })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="present">Present</SelectItem>
          <SelectItem value="absent">Absent</SelectItem>
          <SelectItem value="leave">Leave</SelectItem>
          <SelectItem value="holiday">Holiday</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            {userRole === 'employee' ? 'Your attendance records' : 'Employee attendance tracking'}
          </p>
        </div>
        <Button onClick={exportToCsv} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <DataTable
        data={attendance}
        columns={columns}
        searchPlaceholder="Search by employee name..."
        onSearch={(query) => setAttendanceFilters({ employee: query })}
        filters={filters}
      />
    </div>
  );
}