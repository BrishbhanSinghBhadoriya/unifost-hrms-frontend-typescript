"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
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
import { Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import getLeaves from '@/components/functions/getLeaves';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { approveLeave, rejectLeave } from '@/components/functions/updateLeaves';
import { useMutation } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';



export default function LeavesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const { leaveFilters, setLeaveFilters } = useFiltersStore();
  const [activeTab, setActiveTab] = useState<'view' | 'mark'>('view');

  const userRole = user?.role || 'employee';

  const qc = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: async (leaveId: string) => {
      return await approveLeave(leaveId);
    },
    onSuccess: () => {
      toast.success('Leave request approved successfully');
      qc.invalidateQueries({ queryKey: ['leaves', userRole] });
    },
    onError: (error) => {
      toast.error('Failed to approve leave request');
    },
  });
  const rejectMutation = useMutation({
    mutationFn: async (leaveId: string) => {
      return await rejectLeave(leaveId);
    },
    onSuccess: () => {
      toast.success('Leave request rejected successfully');
      qc.invalidateQueries({ queryKey: ['leaves', userRole] });
    },
    onError: (error) => {
      toast.error('Failed to reject leave request');
    },
  });

  
  const { data: leavesData, isLoading } = useQuery({
    queryKey: ['leaves', userRole],
    queryFn: () => getLeaves(userRole),
  });
  const result = leavesData || [];
  const employeeLeaves = (result as any[]).filter((l: any) => l?.employeeRole === 'employee');
  const hrLeaves = (result as any[]).filter((l: any) => l?.employeeRole === 'hr');
  const tableData = (activeTab === 'mark') ? hrLeaves : employeeLeaves;
  console.log('leaves', result);

  
  
  const handleApproveReject = async (leaveId: string, action: 'approve' | 'reject') => {
    console.log('handleApproveReject', leaveId, action);
    try {
      if (action === 'approve') {
        approveMutation.mutate(leaveId);
      } else {
        rejectMutation.mutate(leaveId);
      }
      
      setSelectedLeave(null);
      
    } catch (error) {
      toast.error(`Failed to ${action} leave request`);
    }
  };

  const columns = [
    {
      key: 'employeeName' as keyof LeaveRequest,
      label: 'Employee',
      sortable: true,
      render: (_value: any, leave: LeaveRequest) => (
        <div>
          <div className="font-medium">{leave.employeeName}</div>
          <div className="text-sm text-muted-foreground capitalize">{leave.leaveType} leave</div>
        </div>
      ),
    },
    {
      key: 'startDate' as keyof LeaveRequest,
      label: 'Duration',
      render: (_value: any, leave: LeaveRequest) => (
        <div>
          <div className="font-medium">
            {dayjs(leave.startDate).format('MMM DD')} - {dayjs(leave.endDate).format('MMM DD')}
          </div>
          <div className="text-sm text-muted-foreground">{leave.totalDays} days</div>
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
      render: (reason: string) => {
        const display = typeof reason === 'string' && reason.length > 30
          ? `${reason.slice(0, 30)}...`
          : reason;
        return (
          <div className="max-w-48" title={reason}>
            {display}
          </div>
        );
      },
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
          <SelectItem value="all">All Status</SelectItem>
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
          <SelectItem value="all">All Types</SelectItem>
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
            <SelectItem value="all">All Employees</SelectItem>
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
      {activeTab !== 'mark' && userRole !== 'employee' && leave.status === 'pending' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-green-600 hover:text-green-700"
            onClick={() => handleApproveReject(leave._id, 'approve')}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={() => handleApproveReject(leave._id, 'reject')}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className='mb-5'>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'view' | 'mark')}>
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="view" className="w-full">Employee Leave</TabsTrigger>
    <TabsTrigger value="mark" className="w-full">HR Leave</TabsTrigger>
  </TabsList>
</Tabs>
</div>


          <h1 className="text-3xl font-bold">Leave Requests</h1>
          <p className="text-muted-foreground">
            {userRole === 'employee' ? 'Your leave requests' : 'Manage employee leave requests'}
          </p>
        </div>
        {activeTab === 'mark' ? (
          <Button onClick={() => router.push('/leaves/apply')}>
            <Plus className="mr-2 h-4 w-4" />
            Apply Leave
          </Button>
        ) : null}
      </div>

      <DataTable
        data={tableData as any}
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
                  <p className="capitalize">{selectedLeave.leaveType}</p>
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
                  <p>{selectedLeave.totalDays}</p>
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
                    onClick={() => handleApproveReject(selectedLeave._id, 'approve')}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleApproveReject(selectedLeave._id, 'reject')}
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