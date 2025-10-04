"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeForm } from '@/components/forms/employee-form';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Employee } from '@/lib/types';
import { mockDepartments } from '@/lib/mock';
import { UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import Cookies from "js-cookie";
import { useQuery } from '@tanstack/react-query';
import { deleteEmployee, fetchEmployees, PaginationParams } from '@/components/functions/Employee';
import { PaginationControls } from '@/components/ui/pagination-controls';
import {useMutation} from '@tanstack/react-query';
import { AxiosError } from 'axios';


export default function EmployeesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const router = useRouter();
  
  // Pagination state
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const addEmployeeMutation = useMutation({
    mutationFn: async (employee: Employee) => {
      const response = await api.post('/users/register', employee);
      console.log('Employee added successfully', response.data);
      return response.data;
      
    },
    onSuccess: () => {
      toast.success('Employee added successfully');
      setShowAddDialog(false);
    },
    onError: (error) => {
      const axiosErr = error as AxiosError<{ message?: string }>;
      console.log(axiosErr);
      toast.error(axiosErr?.response?.data?.message || 'Failed to add employee');
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employees', paginationParams],
    queryFn: () => fetchEmployees(paginationParams),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });

  // Debug logging
  console.log('Employees data:', data);
  console.log('Pagination params:', paginationParams);

  

  const handleAddEmployee = async (data: any) => {
   
      addEmployeeMutation.mutate(data);
    
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const res = await deleteEmployee(employeeId);
      if (res?.success) {
        toast.success('Employee deleted successfully');
        await refetch();
      } else {
        toast.error(res?.message || 'Failed to delete employee');
      }
    } catch (err: any) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr?.response?.data?.message || 'Failed to delete employee');
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPaginationParams(prev => ({ ...prev, limit, page: 1 }));
  };

  // Client-side search is handled by DataTable internally (like attendance page)

  const handleDepartmentFilter = (department: string) => {
    setPaginationParams(prev => ({ 
      ...prev, 
      department: department === 'all' ? undefined : department, 
      page: 1 
    }));
  };

  const handleStatusFilter = (status: string) => {
    setPaginationParams(prev => ({ 
      ...prev, 
      status: status === 'all' ? undefined : status, 
      page: 1 
    }));
  };

  const columns = [
    {
      key: 'employeeId' as keyof Employee,
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
      key: 'name' as keyof Employee,
      label: 'Employee',
      render: (_value: unknown, employee: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={employee.profilePicture} />
            <AvatarFallback>
              {employee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{employee.name}</div>
            <div className="text-sm text-muted-foreground">{employee.empCode}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department' as keyof Employee,
      label: 'Department',
      sortable: true,
    },
    {
      key: 'designation' as keyof Employee,
      label: 'Designation',
      sortable: true,
    },
    {
      key: 'reportingTo' as keyof Employee,
      label: 'Manager',
      render: (value: string) => value || 'N/A',
    },
    

    {
  key: 'joiningDate' as keyof Employee,
  label: 'Joined',
  sortable: true,
  render: (date: string) => {
    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short", // "Aug"
      year: "numeric",
    });

    return <span>{formattedDate}</span>;
  },
},

  ];

  const filters = (
    <div className="flex gap-2">
      <Select
        value={paginationParams.department || 'all'}
        onValueChange={handleDepartmentFilter}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {mockDepartments.map((dept) => (
            <SelectItem key={dept.id} value={dept.name}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={paginationParams.status || 'all'}
        onValueChange={handleStatusFilter}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="terminated">Terminated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const actions = (employee: Employee) => (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => router.push(`/employees/${(employee as any)?._id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteEmployee((employee as any)?._id)}>
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
      
    </div>
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Manage your organization's workforce
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Fill in the employee details below.
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm
              onSubmit={handleAddEmployee}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={data?.data ?? (Array.isArray(data) ? data : [])}
        columns={columns}
        searchPlaceholder="Search by name or employee code..."
        onRowClick={(employee) => router.push(`/employees/${(employee as any)?._id}`)}
        actions={actions}
        filters={filters}
      />

      {data?.pagination ? (
        <PaginationControls
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalEmployees}
          limit={data.pagination.limit}
          hasNextPage={data.pagination.hasNextPage}
          hasPrevPage={data.pagination.hasPrevPage}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      ) : data?.data && data.data.length > 0 ? (
        // Fallback pagination if API doesn't return pagination object
        <PaginationControls
          currentPage={paginationParams.page || 1}
          totalPages={Math.ceil(data.data.length / (paginationParams.limit || 10))}
          totalItems={data.data.length}
          limit={paginationParams.limit || 10}
          hasNextPage={false}
          hasPrevPage={false}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      ) : data && Array.isArray(data) && data.length > 0 ? (
        // Another fallback for direct array response
        <PaginationControls
          currentPage={paginationParams.page || 1}
          totalPages={Math.ceil(data.length / (paginationParams.limit || 10))}
          totalItems={data.length}
          limit={paginationParams.limit || 10}
          hasNextPage={false}
          hasPrevPage={false}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      ) : null}
    </div>
  );
}