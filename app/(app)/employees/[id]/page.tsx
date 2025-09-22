"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dayjs from 'dayjs';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { EditModalSection } from '@/app/(app)/profile/_components/EditModal';
import Personal_Info from '@/app/(app)/profile/_components/Personal_Info';
import Contact_Info from '@/app/(app)/profile/_components/Contact_Info';
import JobTab from '@/app/(app)/profile/_components/JobTab';
import ExperienceTab from '@/app/(app)/profile/_components/ExperienceTab';
import EductionTab from '@/app/(app)/profile/_components/EductionTab';
import BankdetailsTab from '@/app/(app)/profile/_components/BankdetailsTab';
import DocumentTab from '@/app/(app)/profile/_components/DocumentTab';
import { AuthContext } from '@/lib/auth-context';

export default function EmployeeProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [scopedUser, setScopedUser] = useState<any>(null);

  const getEmployeeById = async (id: string): Promise<any | null> => {
    const response = await api.get(`/hr/getEmployee/${id}`);
    const list = response.data?.data;
    if (Array.isArray(list)) {
      const match = list.find((e: any) => String(e?._id ?? e?.id) === String(id));
      return match || list[0] || null;
    }
    return null;
  };

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeById(id),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });

  // Scope the employee into a local auth context that does NOT persist or touch global auth
  useEffect(() => {
    if (employee) setScopedUser(employee);
  }, [employee]);

  if (isLoading || !employee) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded" />
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-6 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  const providerValue = {
    user: scopedUser,
    loading: false,
    login: async () => false,
    logout: () => {},
    isAuthenticated: !!scopedUser,
    updateUser: (partial: any) => {
      setScopedUser((prev: any) => ({ ...(prev || {}), ...(partial || {}) }));
    },
  } as any;

  return (
    <AuthContext.Provider value={providerValue}>
    <div className="space-y-8 w-full max-w-none">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={(employee.profilePicture ? `${employee.profilePicture}?cb=${Date.now()}` : '')} alt={employee.name} />
                <AvatarFallback className="text-2xl">
                  {String(employee.name).split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p className="text-lg text-muted-foreground">{employee.designation || 'Employee'}</p>
              <p className="text-muted-foreground">{employee.department} • {employee.employeeId || employee._id}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant={employee.isActive ? 'default' : 'secondary'}>{employee.isActive ? 'active' : 'inactive'}</Badge>
                {employee.joiningDate && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">Joined {dayjs(employee.joiningDate).format('YYYY-MM-DD')}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reuse profile tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 rounded-lg bg-muted/40 p-1">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="job">Job</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="bank">Bank</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Personal_Info />
        </TabsContent>
        <TabsContent value="contact" className="space-y-4">
          <Contact_Info />
        </TabsContent>
        <TabsContent value="job" className="space-y-4">
          <JobTab />
        </TabsContent>
        <TabsContent value="experience" className="space-y-4">
          <ExperienceTab />
        </TabsContent>
        <TabsContent value="education" className="space-y-4">
          <EductionTab />
        </TabsContent>
        <TabsContent value="bank" className="space-y-4">
          <BankdetailsTab />
        </TabsContent>
        <TabsContent value="document" className="space-y-4">
          <DocumentTab />
        </TabsContent>
      </Tabs>

      {/* Modals: ensure they update target employee */}
      <EditModalSection targetUserId={employee._id || employee.id} initialUser={employee} />
    </div>
    </AuthContext.Provider>
  );
}