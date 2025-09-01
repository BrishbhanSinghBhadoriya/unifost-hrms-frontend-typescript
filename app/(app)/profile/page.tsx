"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { mockEmployees } from '@/lib/mock';
import { User, Mail, Phone, MapPin, Users, Lock, Camera } from 'lucide-react';
import { toast } from 'sonner';

const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
});

const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
});

const emergencyContactSchema = z.object({
  emergencyName: z.string().min(2, 'Name is required'),
  emergencyPhone: z.string().min(10, 'Phone is required'),
  emergencyRelationship: z.string().min(1, 'Relationship is required'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { data: session } = useSession();
  const currentEmployeeId = (session?.user as any)?.employeeId;
  const employee = mockEmployees.find(emp => emp.id === currentEmployeeId);

  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: employee?.name || '',
      dateOfBirth: employee?.dateOfBirth || '',
      address: employee?.address || '',
    },
  });

  const contactForm = useForm({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: employee?.email || '',
      phone: employee?.phone || '',
    },
  });

  const emergencyForm = useForm({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      emergencyName: employee?.emergencyContact?.name || '',
      emergencyPhone: employee?.emergencyContact?.phone || '',
      emergencyRelationship: employee?.emergencyContact?.relationship || '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handlePersonalInfoSubmit = (data: any) => {
    toast.success('Personal information updated successfully');
  };

  const handleContactSubmit = (data: any) => {
    toast.success('Contact information updated successfully');
  };

  const handleEmergencyContactSubmit = (data: any) => {
    toast.success('Emergency contact updated successfully');
  };

  const handlePasswordSubmit = (data: any) => {
    toast.success('Password changed successfully');
    passwordForm.reset();
  };

  if (!employee) {
    return <div>Employee not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee.avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p className="text-lg text-muted-foreground">{employee.designation}</p>
              <p className="text-muted-foreground">{employee.department} • {employee.empCode}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {employee.phone}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...personalForm.register('name')}
                    />
                    {personalForm.formState.errors.name && (
                      <p className="text-sm text-red-600">{personalForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...personalForm.register('dateOfBirth')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...personalForm.register('address')}
                    placeholder="Enter your full address"
                  />
                </div>

                <Button type="submit">Update Personal Info</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Update your contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...contactForm.register('email')}
                    />
                    {contactForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{contactForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...contactForm.register('phone')}
                    />
                    {contactForm.formState.errors.phone && (
                      <p className="text-sm text-red-600">{contactForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit">Update Contact Info</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>
                Update your emergency contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={emergencyForm.handleSubmit(handleEmergencyContactSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Contact Name</Label>
                    <Input
                      id="emergencyName"
                      {...emergencyForm.register('emergencyName')}
                    />
                    {emergencyForm.formState.errors.emergencyName && (
                      <p className="text-sm text-red-600">{emergencyForm.formState.errors.emergencyName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      {...emergencyForm.register('emergencyPhone')}
                    />
                    {emergencyForm.formState.errors.emergencyPhone && (
                      <p className="text-sm text-red-600">{emergencyForm.formState.errors.emergencyPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    {...emergencyForm.register('emergencyRelationship')}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                  {emergencyForm.formState.errors.emergencyRelationship && (
                    <p className="text-sm text-red-600">{emergencyForm.formState.errors.emergencyRelationship.message}</p>
                  )}
                </div>

                <Button type="submit">Update Emergency Contact</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register('newPassword')}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register('confirmPassword')}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit">Change Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}