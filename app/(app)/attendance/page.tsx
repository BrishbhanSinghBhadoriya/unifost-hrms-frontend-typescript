"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
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
import { AttendanceRecord, Employee } from '@/lib/types';
import { useFiltersStore } from '@/store/filters';
import { Download, Clock, Pencil, Trash2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { formatDateTimeIST as sharedFormatDateTimeIST } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


dayjs.extend(utc);
dayjs.extend(timezone);
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EditModal } from '@/components/ui/edit-modal';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import type { AxiosError } from 'axios';
import { fetchAllEmployees } from '@/components/functions/Employee';
import { fetchEmployeesAttenedence } from '@/components/functions/getAttendence';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


export default function AttendancePage() {
  const { user } = useAuth();

  const { attendanceFilters, setAttendanceFilters } = useFiltersStore();
  const userRole = user?.role;  
  const isHR = userRole === 'hr' || userRole === 'admin' || userRole === 'manager';
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AttendanceRecord> | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<AttendanceRecord | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'view' | 'mark'>('view');



  const { data: employeesData } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => fetchAllEmployees(),
  });
  const employees = employeesData ?? [];


  const { data: AttendanceData, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => fetchEmployeesAttenedence()

  })
  
  const saveMutation = useMutation({
    mutationFn: async (record: Partial<AttendanceRecord>) => {
      
      const recordId = record.id || (record as any)._id;
      
      if (recordId) {
        const toIsoIST = (date?: string, hhmm?: string) => {
          if (!date || !hhmm) return undefined as unknown as string;
          const [hours, minutes] = hhmm.split(':').map(Number);
          if (isNaN(hours) || isNaN(minutes)) return undefined as unknown as string;
          const dt = dayjs.tz(`${date} ${hhmm}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
          if (!dt.isValid()) return undefined as unknown as string;
          return dt.utc().toISOString();
        };

        const payload = {
          employeeName: record.employeeName,
          status: record.status,
          date: record.date,
          checkIn: record.checkIn?.includes('T') ? record.checkIn : toIsoIST(record.date, record.checkIn),
          checkOut: record.checkOut?.includes('T') ? record.checkOut : toIsoIST(record.date, record.checkOut),
          hoursWorked: record.hoursWorked
        };
       
        const res = await api.put(`/hr/updateAttendance/${recordId}`, payload);
        return res.data;
      } else {
        const toIso = (date?: string, hhmm?: string) => {
          if (!date || !hhmm) return undefined as unknown as string;
          const [hours, minutes] = hhmm.split(':').map(Number);
          if (isNaN(hours) || isNaN(minutes)) return undefined as unknown as string;
          const dt = dayjs.tz(`${date} ${hhmm}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
          if (!dt.isValid()) return undefined as unknown as string;
          return dt.utc().toISOString();
        };
        const payload = {
          employeeName: record.employeeName,
          date: record.date,
          checkIn: record.checkIn?.includes('T') ? record.checkIn : toIso(record.date, record.checkIn),
          checkOut: record.checkOut?.includes('T') ? record.checkOut : toIso(record.date, record.checkOut),
          hoursWorked: record.hoursWorked,
          status: (record.status || 'present').toString().toLowerCase()
        };
       
        const response = await api.post(`/hr/markAttendance/${record.employeeId}`, payload);

        return response.data;
      }
    },
    onSuccess: () => {
      toast.success('Saved');
      qc.invalidateQueries({ queryKey: ['attendance'] });
      setEditOpen(false);
      setEditing(null);
    },
    onError: (error) => {
      console.error('Save error:', error);
      const axiosErr = error as AxiosError<{ message?: string }>;
      toast.error(axiosErr?.response?.data?.message || 'Save failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Delete mutation called with ID:', id);
      const res = await api.delete(`/hr/deleteAttendance/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      const axiosErr = error as AxiosError<{ message?: string }>;
      toast.error(axiosErr?.response?.data?.message || 'Delete failed');
    },
  });

  const exportToCsv = () => {
    const csvData = ((AttendanceData ?? []) as AttendanceRecord[]).map((record: AttendanceRecord) => ({
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
      ...csvData.map((row: any) => headers.map((header) => (row as any)[header]).join(','))
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

  const onCheckIn = (record: AttendanceRecord) => {
    const now = dayjs().format('HH:mm');
    saveMutation.mutate({ ...record, checkIn: now, status: 'present' });
  };

  
  const handleEdit = (record: AttendanceRecord) => {
 
    const formatTimeForInput = (time?: string) => {
      if (!time) return '';
      const iso = dayjs.utc(time).tz('Asia/Kolkata');
      if (iso.isValid()) return iso.format('HH:mm');
      const hm = dayjs(time, 'HH:mm', true);
      if (hm.isValid()) return hm.format('HH:mm');
      return time;
    };

    setEditing({
      ...record,
      checkIn: formatTimeForInput(record.checkIn),
      checkOut: formatTimeForInput(record.checkOut),
    });
    setEditOpen(true);
  };

  const handleDeleteClick = (record: AttendanceRecord) => {
    setDeletingRecord(record);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingRecord) {
      deleteMutation.mutate(deletingRecord.id || (deletingRecord as any)._id);
      setDeleteOpen(false);
      setDeletingRecord(null);
    }
  };

  
  const formatDate = (date?: string) => {
    if (!date) return '-';
    const d = dayjs(date);
    if (d.isValid()) return d.format('DD MMM YYYY');
    return date;
  };

  const formatDateTimeIST = (date?: string, time?: string) => sharedFormatDateTimeIST(date, time, true);

  // Build a map of employeeId -> employee for quick lookup
  const employeeIdToEmployee = new Map<string, Employee>(
    employees.map((e: Employee) => [String(((e as any)._id)), e])
  );
  const employeeIdToName = new Map<string, string>(
    employees.map((e: Employee) => [String(((e as any)._id)), e.name])
  );

  const columns = [
    {
      key: 'profilePicture' as any,
      label: 'Photo',
      sortable: false,
      render: (_: any, row: AttendanceRecord) => {
        const v: any = row.employeeId as any;
        const empId = typeof v === 'string' ? v : String(v?._id || v?.id || '');
        const emp = employeeIdToEmployee.get(empId);
        const name = (row as any).employeeName || emp?.name || '';
        const initials = String(name)
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        const src = (row as any).profilePicture || emp?.profilePicture || '';
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={src} alt={name} />
            <AvatarFallback>{initials || 'U'}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      key: 'employeeId' as keyof AttendanceRecord,
      label: 'Employee ID',
      sortable: true,
      sortType: 'string' as const,
      sortAccessor: (row: AttendanceRecord) => {
        const v: any = row.employeeId as any;
        if (typeof v === 'string' || typeof v === 'number') return String(v);
        if (v && typeof v === 'object') return String(v.employeeId || '');
        return '';
      },
      render: (_value: any, row: AttendanceRecord) => {
        const v: any = row.employeeId as any;
        const display = typeof v === 'string' || typeof v === 'number'
          ? String(v)
          : String(v?.employeeId || v?.empCode || v?._id || v?.id || '');
        return <div>{display || '-'}</div>;
      },
    },
    {
      key: 'employeeName' as keyof AttendanceRecord,
      label: 'Employee Name',
      sortable: true,
      sortType: 'string' as const,
      sortAccessor: (row: AttendanceRecord) => {
        const v: any = row.employeeId as any;
        const empId = typeof v === 'string' ? v : String(v?._id || v?.id || '');
        return row.employeeName || employeeIdToName.get(empId) || '';
      },
      render: (value: string) => (
        <div>
          <div className="font-medium">{value}</div>
        </div>
      ),
    },
    {
      key: 'date' as keyof AttendanceRecord,
      label: 'Date',
      sortable: true,
      sortType: 'date' as const,
      sortAccessor: (row: AttendanceRecord) => row.date,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'checkIn' as keyof AttendanceRecord,
      label: 'Check In',
      render: (value: string, record: AttendanceRecord) => {
        const start = dayjs(`${record.date} 10:10`, 'YYYY-MM-DD HH:mm');
        const v = value && (value.includes('T') ? dayjs(value) : dayjs(`${record.date} ${value}`, 'YYYY-MM-DD HH:mm'));
        console.log(start,v)
        const isLate = !!(v && v.isValid() && v.isAfter(start));
        console.log(isLate);
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateTimeIST(record.date, value)}</span>
            {isLate && <Badge variant="secondary">Late</Badge>}
            {isHR && !value && (
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onCheckIn(record); }}>Check In</Button>
            )}
          </div>
        );
      },
    },
    {
      key: 'checkOut' as keyof AttendanceRecord,
      label: 'Check Out',
      render: (value: string, record: AttendanceRecord) => {
        const cutoff = dayjs.utc(`${record.date}`, 'YYYY-MM-DD HH:mm'); // Office cutoff time IST
        const v = value && (value.includes('T')
          ? dayjs(value).tz("Asia/Kolkata")
          : dayjs(`${record.date} ${value}`).tz("Asia/Kolkata"));

        // const isEarly = !!(v && v.isValid() && v.isBefore(cutoff));

        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateTimeIST(record.date, value)}</span>
            {/* {isEarly && <Badge variant="secondary">Early</Badge>} */}
          </div>
        );
      },
    },
    {
      key: 'hoursWorked' as keyof AttendanceRecord,
      label: 'Hours',
      sortable: true,
      sortType: 'number' as const,
      sortAccessor: (row: AttendanceRecord) => {
        const parseTime = (date: string, t?: string) => {
          if (!t) return 0;
          if (t.includes('T')) {
            const d = dayjs.utc(t);
            return d.isValid() ? d.valueOf() : 0;
          }
          const d = dayjs.utc(`${date} ${t}`, 'YYYY-MM-DD HH:mm');
          return d.isValid() ? d.valueOf() : 0;
        };
        const start = parseTime(row.date, row.checkIn);
        const end = parseTime(row.date, row.checkOut);
        if (!start || !end) return 0;
        const diffMin = Math.max(0, Math.floor((end - start) / 60000));
        return diffMin;
      },
      render: (_: number, record: AttendanceRecord) => {
        const parseTime = (date: string, t?: string) => {
          if (!t) return null;
          if (t.includes('T')) {
            const d = dayjs.utc(t);
            return d.isValid() ? d : null;
          }
          const d = dayjs.utc(`${date} ${t}`, 'YYYY-MM-DD HH:mm');
          return d.isValid() ? d : null;
        };
        const start = parseTime(record.date, record.checkIn);
        const end = parseTime(record.date, record.checkOut);
        if (!start || !end) return '-';
        const diffMin = Math.max(0, end.diff(start, 'minute'));
        const hours = Math.floor(diffMin / 60);
        const minutes = diffMin % 60;
        return `${hours}h ${minutes}m`;
      },
    },
    {
      key: 'status' as keyof AttendanceRecord,
      label: 'Status',
      sortable: true,
      sortType: 'string' as const,
      className: 'w-[150px]',
      sortAccessor: (row: AttendanceRecord) => String(row.status || ''),
      render: (status: string) => (
        <Badge variant={
          status === 'present' ? 'default' :
          status === 'leave' ? 'secondary' :
          status === 'absent' ? 'destructive' :
          status === 'holiday' ? 'outline' : 'secondary'
        }>
          {status === 'present' ? 'Present' :
           status === 'leave' ? 'On Leave' :
           status === 'absent' ? 'Absent' :
           status=== 'late' ? 'Half Day' :null
           }
        </Badge>
      ),
    },
    ...(isHR ? [{
      key: 'actions' as any,
      label: 'Actions',
      render: (_: any, record: AttendanceRecord) => (
        <TooltipProvider>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEdit(record); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit attendance record</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDeleteClick(record); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    }] : []),
  ];

  const filters = (
    <div className="flex gap-2 flex-wrap items-center">
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
            {employees.map((emp: Employee) => (
              <SelectItem key={((emp as any)._id)} value={emp.name}>
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
          <SelectItem value="half-day">Half Day</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={rangeStart}
          onChange={(e) => setRangeStart(e.target.value)}
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          value={rangeEnd}
          onChange={(e) => setRangeEnd(e.target.value)}
        />
      </div>
    </div>
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Tracker</h1>
            <p className="text-muted-foreground">
              {userRole === 'employee' ? 'Your attendance records' : 'Employee attendance tracking'}
            </p>
          </div>
          
        </div>

        
      </div>

      <DataTable
        data={((AttendanceData ?? []) as AttendanceRecord[])
          .map((rec) => ({
            ...rec,
            employeeName: rec.employeeName ,
            status: rec.status,
          }))
          .filter((rec) => {
            // Date filter: range if provided, else exact if dateFilter
            if (rangeStart || rangeEnd) {
              const d = dayjs(rec.date);
              if (!d.isValid()) return false;
              if (rangeStart && d.isBefore(dayjs(rangeStart), 'day')) return false;
              if (rangeEnd && d.isAfter(dayjs(rangeEnd), 'day')) return false;
            } else if (dateFilter && rec.date !== dateFilter) {
              return false;
            }
            // Month filter: YYYY-MM
            if (attendanceFilters.month) {
              const recMonth = dayjs(rec.date).isValid() ? dayjs(rec.date).format('YYYY-MM') : String(rec.date).slice(0, 7);
              if (recMonth !== attendanceFilters.month) return false;
            }
            // Status filter
            if (attendanceFilters.status && attendanceFilters.status !== 'all') {
              const s = String(rec.status || '').toLowerCase();
              if (s !== attendanceFilters.status.toLowerCase()) return false;
            }
            // Employee filter by name (from dropdown or search)
            if (attendanceFilters.employee && attendanceFilters.employee !== 'all') {
              const q = attendanceFilters.employee.toLowerCase();
              if (!String(rec.employeeName || '').toLowerCase().includes(q)) return false;
            }
            return true;
          })}
        columns={columns}
        // searchPlaceholder="Search by name, status, date..."
        onSearch={(query) => setAttendanceFilters({ employee: query })}
        filters={filters}
        defaultSortColumn="date"
        defaultSortDirection="desc"
      />

      {isHR && (
        <EditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          title={editing?.id || (editing as any)?._id ? 'Edit Attendance' : 'Add Attendance'}
          onSave={() => {
            if (editing) {
              // Validation for new attendance records
              if (!editing.id && !(editing as any)._id) {
                if (!editing.employeeId) {
                  toast.error('Please select an employee');
                  return;
                }
                if (!editing.employeeName) {
                  toast.error('Please select an employee');
                  return;
                }
              }

              // Convert time format for API

              const toIso = (date?: string, hhmm?: string) => {
                if (!date || !hhmm) return undefined as unknown as string;
                const [hours, minutes] = hhmm.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) return undefined as unknown as string;
                const dt = dayjs.tz(`${date} ${hhmm}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
                if (!dt.isValid()) return undefined as unknown as string;
                return dt.utc().toISOString();
              };

              const statusValue = (editing.status || 'present').toString().toLowerCase();
              const validStatus = ['present', 'absent', 'leave', 'holiday', 'half-day'].includes(statusValue) 
                ? statusValue as 'present' | 'absent' | 'leave' | 'holiday' | 'half-day'
                : 'present';

              // Calculate hours worked if both check-in and check-out are provided
              let calculatedHoursWorked = editing.hoursWorked;
              if (editing.checkIn && editing.checkOut) {
                // Handle both ISO format and HH:mm format
                let checkInTime, checkOutTime;

                if (editing.checkIn.includes('T')) {
                  // Already in ISO format
                  checkInTime = editing.checkIn;
                } else {
                  // Convert HH:mm to ISO format
                  checkInTime = toIso(editing.date, editing.checkIn);
                }

                if (editing.checkOut.includes('T')) {
                  // Already in ISO format
                  checkOutTime = editing.checkOut;
                } else {
                  // Convert HH:mm to ISO format
                  checkOutTime = toIso(editing.date, editing.checkOut);
                }

                if (checkInTime && checkOutTime) {
                  const start = dayjs.utc(checkInTime);
                  const end = dayjs.utc(checkOutTime);

                  if (start.isValid() && end.isValid()) {
                    const diffMinutes = end.diff(start, 'minute');
                    calculatedHoursWorked = Math.max(0, Math.round((diffMinutes / 60) * 10) / 10);
                    console.log('Calculated hours worked:', calculatedHoursWorked, 'from', start.format(), 'to', end.format());
                  }
                }
              } else {
                // If only one time is provided, set hours to 0
                calculatedHoursWorked = 0;
              }

              const payload = {
                ...editing,
                checkIn: editing.checkIn?.includes('T') ? editing.checkIn : toIso(editing.date, editing.checkIn),
                checkOut: editing.checkOut?.includes('T') ? editing.checkOut : toIso(editing.date, editing.checkOut),
                hoursWorked: calculatedHoursWorked,
                status: validStatus
              };
              
              console.log('Final payload before API call:', payload);
              saveMutation.mutate(payload);
            }
          }}
          isSaving={saveMutation.isPending}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              {editing?.id || (editing as any)?._id ? (
                // For editing existing records, show input box
                <Input 
                  type="text" 
                  value={editing?.employeeName || ''} 
                  onChange={(e) => setEditing({ ...(editing || {}), employeeName: e.target.value })}
                  placeholder="Enter employee name"
                />
              ) : (
                // For adding new records, show dropdown
                <Select 
                  value={editing?.employeeId || ''} 
                  onValueChange={(v) => {
                    const emp = employees.find((e: Employee) => ((e as any)._id) === v);
                    setEditing({ ...(editing || {}), employeeId: v, employeeName: emp?.name || '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: Employee) => (
                      <SelectItem key={((emp as any)._id)} value={((emp as any)._id)}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={editing?.date || dayjs().format('YYYY-MM-DD')} onChange={e => setEditing({ ...(editing || {}), date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check In</label>
              <Input type="time" value={editing?.checkIn || ''} onChange={e => setEditing({ ...(editing || {}), checkIn: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check Out</label>
              <Input type="time" value={editing?.checkOut || ''} onChange={e => setEditing({ ...(editing || {}), checkOut: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hours Worked (Calculated)</label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {editing?.checkIn && editing?.checkOut ? (
                  (() => {
                    const toIso = (date?: string, hhmm?: string) => {
                      if (!date || !hhmm) return undefined;
                      const [hours, minutes] = hhmm.split(':').map(Number);
                      if (isNaN(hours) || isNaN(minutes)) return undefined;
                      const dayjsDate = dayjs.utc(date).hour(hours).minute(minutes).second(0).millisecond(0);
                      return dayjsDate.isValid() ? dayjsDate.toISOString() : undefined;
                    };

                    const checkInTime = editing.checkIn.includes('T') ? editing.checkIn : toIso(editing.date, editing.checkIn);
                    const checkOutTime = editing.checkOut.includes('T') ? editing.checkOut : toIso(editing.date, editing.checkOut);

                    if (checkInTime && checkOutTime) {
                      const start = dayjs.utc(checkInTime);
                      const end = dayjs.utc(checkOutTime);
                      if (start.isValid() && end.isValid()) {
                        const diffMinutes = end.diff(start, 'minute');
                        const hours = Math.max(0, Math.round((diffMinutes / 60) * 10) / 10);
                        return `${hours} hours`;
                      }
                    }
                    return 'Invalid times';
                  })()
                ) : (
                  'Enter both check-in and check-out times'
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={(editing?.status as any) || 'present'} onValueChange={(v) => setEditing({ ...(editing || {}), status: v as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </EditModal>
      )}

      {/* Bulk Mark moved to dedicated page */}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the attendance record for <strong>{deletingRecord?.employeeName}</strong> on <strong>{deletingRecord?.date ? formatDate(deletingRecord.date) : ''}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}