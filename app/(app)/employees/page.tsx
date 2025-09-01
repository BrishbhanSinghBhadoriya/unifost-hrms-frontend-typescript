"use client";

import { useState, useEffect } from 'react';
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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const router = useRouter();
  const { employeeFilters, setEmployeeFilters } = useFiltersStore();

  useEffect(() => {
    fetchEmployees();
  }, [employeeFilters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (employeeFilters.search) params.append('search', employeeFilters.search);
      if (employeeFilters.department && employeeFilters.department !== 'all') params.append('department', employeeFilters.department);
      if (employeeFilters.status && employeeFilters.status !== 'all') params.append('status', employeeFilters.status);

      const response = await api.get(`/employees?${params.toString()}`);
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (data: any) => {
    try {
      await api.post('/employees', data);
      toast.success('Employee added successfully');
      setShowAddDialog(false);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to add employee');
    }
  };

  const columns = [
    {
      key: 'name' as keyof Employee,
      label: 'Employee',
      render: (_, employee: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={employee.avatarUrl} />
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
        value={employeeFilters.department}
        onValueChange={(value) => setEmployeeFilters({ department: value })}
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
        value={employeeFilters.status}
        onValueChange={(value) => setEmployeeFilters({ status: value })}
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
        onClick={() => router.push(`/employees/${employee.id}`)}
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

  if (loading) {
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
          <DialogContent className="max-w-2xl">
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
        data={employees}
        columns={columns}
        searchPlaceholder="Search by name or employee code..."
        onSearch={(query) => setEmployeeFilters({ search: query })}
        onRowClick={(employee) => router.push(`/employees/${employee.id}`)}
        actions={actions}
        filters={filters}
      />
    </div>
  );
}