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
import { useFiltersStore } from '@/store/filters';
import { UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import Cookies from "js-cookie";
import { useQuery } from '@tanstack/react-query';
import { fetchEmployees, PaginationParams } from '@/components/functions/Employee';
import { PaginationControls } from '@/components/ui/pagination-controls';
import {useMutation} from '@tanstack/react-query';


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
      return response.data;
      
    },
    onSuccess: () => {
      toast.success('Employee added successfully');
      setShowAddDialog(false);
    },
    onError: (error) => {
      toast.error('Failed to add employee');
    },
  });

  const { data, isLoading, error } = useQuery({
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
    try {
      addEmployeeMutation.mutate(data);
    } catch (error) {
      toast.error('Failed to add employee');
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPaginationParams(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleSearch = (search: string) => {
    setPaginationParams(prev => ({ ...prev, search, page: 1 }));
  };

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
      key: 'managerName' as keyof Employee,
      label: 'Manager',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'status' as keyof Employee,
      label: 'Status',
      render: (status: string) => (
        <Badge variant={
          status === 'active' ? 'default' :
          status === 'inactive' ? 'secondary' : 'destructive'
        }>
          {status}
        </Badge>
      ),
    },
    {
      key: 'joinedOn' as keyof Employee,
      label: 'Joined',
      sortable: true,
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
      <Button size="sm" variant="ghost">
        <Edit className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
      </Button>
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
        onSearch={handleSearch}
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