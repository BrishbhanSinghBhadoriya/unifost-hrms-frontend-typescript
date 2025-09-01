"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { LeaveRequest } from '@/lib/types';
import { mockEmployees } from '@/lib/mock';
import { useFiltersStore } from '@/store/filters';
import { FileText, Plus, Check, X } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export default function LeavesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const { leaveFilters, setLeaveFilters } = useFiltersStore();
  const userRole = (session?.user as any)?.role || 'employee';
  const currentEmployeeId = (session?.user as any)?.employeeId;

  useEffect(() => {
    fetchLeaves();
  }, [leaveFilters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // For employees, only show their own leaves
      if (userRole === 'employee') {
        params.append('employee', currentEmployeeId);
      } else if (leaveFilters.employee) {
        params.append('employee', leaveFilters.employee);
      }
      
      if (leaveFilters.status) params.append('status', leaveFilters.status);
      if (leaveFilters.type) params.append('type', leaveFilters.type);

      const response = await api.get(`/leaves?${params.toString()}`);
      setLeaves(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (leaveId: string, action: 'approve' | 'reject') => {
    try {
      // In a real app, this would be a PUT request to update the leave status
      toast.success(`Leave request ${action}d successfully`);
      setSelectedLeave(null);
      fetchLeaves();
    } catch (error) {
      toast.error(`Failed to ${action} leave request`);
    }
  };

  const columns = [
    {
      key: 'employeeName' as keyof LeaveRequest,
      label: 'Employee',
      sortable: true,
      render: (_, leave: LeaveRequest) => (
        <div>
          <div className="font-medium">{leave.employeeName}</div>
          <div className="text-sm text-muted-foreground capitalize">{leave.type} leave</div>
        </div>
      ),
    },
    {
      key: 'startDate' as keyof LeaveRequest,
      label: 'Duration',
      render: (_, leave: LeaveRequest) => (
        <div>
          <div className="font-medium">
            {dayjs(leave.startDate).format('MMM DD')} - {dayjs(leave.endDate).format('MMM DD')}
          </div>
          <div className="text-sm text-muted-foreground">{leave.days} days</div>
        </div>
      ),
    },
    {
      key: 'appliedOn' as keyof LeaveRequest,
      label: 'Applied On',
      sortable: true,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      key: 'status' as keyof LeaveRequest,
      label: 'Status',
      render: (status: string) => (
        <Badge variant={
          status === 'approved' ? 'default' :
          status === 'rejected' ? 'destructive' : 'secondary'
        }>
          {status}
        </Badge>
      ),
    },
    {
      key: 'reason' as keyof LeaveRequest,
      label: 'Reason',
      render: (reason: string) => (
        <div className="max-w-48 truncate" title={reason}>
          {reason}
        </div>
      ),
    },
  ];

  const filters = (
    <div className="flex gap-2">
      <Select
        value={leaveFilters.status}
        onValueChange={(value) => setLeaveFilters({ status: value })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={leaveFilters.type}
        onValueChange={(value) => setLeaveFilters({ type: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Leave Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          <SelectItem value="casual">Casual</SelectItem>
          <SelectItem value="sick">Sick</SelectItem>
          <SelectItem value="earned">Earned</SelectItem>
          <SelectItem value="maternity">Maternity</SelectItem>
          <SelectItem value="paternity">Paternity</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
        </SelectContent>
      </Select>

      {userRole !== 'employee' && (
        <Select
          value={leaveFilters.employee}
          onValueChange={(value) => setLeaveFilters({ employee: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Employees</SelectItem>
            {mockEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  const actions = (leave: LeaveRequest) => (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setSelectedLeave(leave)}
      >
        View
      </Button>
      {userRole !== 'employee' && leave.status === 'pending' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-green-600 hover:text-green-700"
            onClick={() => handleApproveReject(leave.id, 'approve')}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={() => handleApproveReject(leave.id, 'reject')}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Requests</h1>
          <p className="text-muted-foreground">
            {userRole === 'employee' ? 'Your leave requests' : 'Manage employee leave requests'}
          </p>
        </div>
        <Button onClick={() => router.push('/leaves/apply')}>
          <Plus className="mr-2 h-4 w-4" />
          Apply Leave
        </Button>
      </div>

      <DataTable
        data={leaves}
        columns={columns}
        searchPlaceholder="Search by employee name..."
        onSearch={(query) => setLeaveFilters({ employee: query })}
        actions={actions}
        filters={filters}
      />

      {/* Leave Details Dialog */}
      <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Review the complete leave request information
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Employee</label>
                  <p>{selectedLeave.employeeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Leave Type</label>
                  <p className="capitalize">{selectedLeave.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <p>{dayjs(selectedLeave.startDate).format('MMM DD, YYYY')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <p>{dayjs(selectedLeave.endDate).format('MMM DD, YYYY')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Days</label>
                  <p>{selectedLeave.days}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={
                    selectedLeave.status === 'approved' ? 'default' :
                    selectedLeave.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {selectedLeave.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Reason</label>
                <p className="mt-1 p-3 bg-muted rounded-md">{selectedLeave.reason}</p>
              </div>
              
              {userRole !== 'employee' && selectedLeave.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => handleApproveReject(selectedLeave.id, 'approve')}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleApproveReject(selectedLeave.id, 'reject')}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}