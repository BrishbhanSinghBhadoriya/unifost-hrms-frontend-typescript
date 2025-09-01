"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employee } from '@/lib/types';
import { mockDepartments, mockDesignations, mockEmployees } from '@/lib/mock';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  empCode: z.string().min(3, 'Employee code must be at least 3 characters'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  managerId: z.string().optional(),
  joinedOn: z.string().min(1, 'Joining date is required'),
  status: z.enum(['active', 'inactive', 'terminated']),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      empCode: employee.empCode,
      department: employee.department,
      designation: employee.designation,
      managerId: employee.managerId,
      joinedOn: employee.joinedOn,
      status: employee.status,
    } : {
      status: 'active',
    },
  });

  const selectedDepartment = watch('department');
  const availableDesignations = mockDesignations.filter(
    des => des.department === selectedDepartment
  );

  const potentialManagers = mockEmployees.filter(emp => 
    emp.department === selectedDepartment && emp.id !== employee?.id
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter full name"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="empCode">Employee Code</Label>
          <Input
            id="empCode"
            {...register('empCode')}
            placeholder="EMP001"
          />
          {errors.empCode && (
            <p className="text-sm text-red-600">{errors.empCode.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="employee@company.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+1-555-0123"
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={watch('department')}
            onValueChange={(value) => {
              setValue('department', value);
              setValue('designation', ''); // Reset designation when department changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {mockDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && (
            <p className="text-sm text-red-600">{errors.department.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Select
            value={watch('designation')}
            onValueChange={(value) => setValue('designation', value)}
            disabled={!selectedDepartment}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select designation" />
            </SelectTrigger>
            <SelectContent>
              {availableDesignations.map((des) => (
                <SelectItem key={des.id} value={des.title}>
                  {des.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.designation && (
            <p className="text-sm text-red-600">{errors.designation.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="managerId">Manager</Label>
          <Select
            value={watch('managerId') || 'none'}
            onValueChange={(value) => setValue('managerId', value === 'none' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Manager</SelectItem>
              {potentialManagers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.name} ({manager.empCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="joinedOn">Joining Date</Label>
          <Input
            id="joinedOn"
            type="date"
            {...register('joinedOn')}
          />
          {errors.joinedOn && (
            <p className="text-sm text-red-600">{errors.joinedOn.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch('status')}
            onValueChange={(value: 'active' | 'inactive' | 'terminated') => setValue('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}