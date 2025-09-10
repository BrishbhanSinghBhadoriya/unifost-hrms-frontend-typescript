"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/lib/auth';
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
import { EditModal } from '@/components/ui/edit-modal';

import { User, Mail, Phone, MapPin, Users, Lock, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
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

const jobInfoSchema = z.object({
  employeeId: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  bankAccountType: z.string().optional(),
  salary: z.coerce.number().min(0, 'Salary must be positive').optional(),
});

const skillsSchema = z.object({
  skills: z.string().optional(), // comma-separated
});

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState<null | 'personal' | 'contact' | 'emergency' | 'password'>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [isSavingModal, setIsSavingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toYMD = (d?: string) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${m}-${day}`;
  };

  console.log(user)
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: user?.name || '',
      dateOfBirth: toYMD(user?.dateOfBirth), 
     address: user?.address || '',
     gender: user?.gender || '',
     country: user?.country || 'India',
    },
  });

  const contactForm = useForm({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const emergencyForm = useForm({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      emergencyName: '', // Not available in current user data
      emergencyPhone: '', // Not available in current user data
      emergencyRelationship: '', // Not available in current user data
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

  const jobForm = useForm({
    resolver: zodResolver(jobInfoSchema),
    defaultValues: {
      employeeId: user?.employeeId || '',
      department: user?.department || '',
      designation: user?.designation || '',
      bankAccountType: user?.bankAccountType || '',
      salary: user?.salary ?? undefined,
    },
  });

  const skillsForm = useForm({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: Array.isArray(user?.skills) ? user?.skills?.join(', ') : '',
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

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await authService.uploadProfilePicture(file);
      if (result.success && result.profilePicture) {
        updateUser({ profilePicture: result.profilePicture });
        toast.success('Profile picture updated successfully');
      } else {
        toast.error(result.message || 'Failed to update profile picture');
      }
    } catch (error) {
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const openEdit = (key: 'personal' | 'contact' | 'emergency' | 'password') => setModalOpen(key);
  const closeEdit = () => setModalOpen(null);

  const savePersonal = async () => {
    setIsSavingModal(true);
    try {
      const valid = await personalForm.trigger();
      if (!valid) return;
      const payload = {
        name: personalForm.getValues('name'),
        dateOfBirth: personalForm.getValues('dateOfBirth') || undefined,
        address: personalForm.getValues('address') || undefined,
        gender: personalForm.getValues('gender') || undefined,
        country: personalForm.getValues('country') || undefined,
      };
      const res = await authService.updateEmployeeProfile(user!.id, payload);
      if (res.success) {
        const returned = res.data?.user || res.data;
        console.log(returned);
        updateUser({
          name: returned?.name ?? payload.name,
          dateOfBirth:returned?.dob,
          address: returned?.address ?? payload.address,
          gender: returned?.gender ?? payload.gender,
          country: returned?.country ?? payload.country,
        });
        toast.success('Personal information saved');
        closeEdit();
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } finally {
      setIsSavingModal(false);
    }
  };

  const saveContact = async () => {
    setIsSavingModal(true);
    try {
      const valid = await contactForm.trigger();
      if (!valid) return;
      const payload = {
        email: contactForm.getValues('email'),
        phone: contactForm.getValues('phone'),
      };
      const res = await authService.updateEmployeeProfile(user!.id, payload);
      if (res.success) {
        const returned = res.data?.user || res.data;
        updateUser({ email: returned?.email ?? payload.email, phone: returned?.phone ?? payload.phone });
        toast.success('Contact information saved');
        closeEdit();
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } finally {
      setIsSavingModal(false);
    }
  };

  const saveEmergency = async () => {
    setIsSavingModal(true);
    try {
      const valid = await emergencyForm.trigger();
      if (!valid) return;
      const payload = {
        emergencyContact: {
          name: emergencyForm.getValues('emergencyName'),
          phone: emergencyForm.getValues('emergencyPhone'),
          relationship: emergencyForm.getValues('emergencyRelationship'),
        }
      };
      const res = await authService.updateEmployeeProfile(user!.id, payload);
      if (res.success) {
        toast.success('Emergency contact saved');
        closeEdit();
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } finally {
      setIsSavingModal(false);
    }
  };

  const saveJob = async () => {
    setIsSavingModal(true);
    try {
      const valid = await jobForm.trigger();
      if (!valid) return;
      const payload = jobForm.getValues();
      const res = await authService.updateEmployeeProfile(user!.id, payload);
      if (res.success) {
        const returned = res.data?.user || res.data;
        updateUser({
          employeeId: returned?.employeeId ?? payload.employeeId,
          department: returned?.department ?? payload.department,
          designation: returned?.designation ?? payload.designation,
          bankAccountType: returned?.bankAccountType ?? payload.bankAccountType,
          salary: returned?.salary ?? payload.salary,
        });
        toast.success('Job information saved');
        setJobModalOpen(false);
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } finally {
      setIsSavingModal(false);
    }
  };

  const saveSkills = async () => {
    setIsSavingModal(true);
    try {
      const valid = await skillsForm.trigger();
      if (!valid) return;
      const csv = (skillsForm.getValues('skills') || '').trim();
      const skills = csv ? csv.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const payload = { skills };
      const res = await authService.updateEmployeeProfile(user!.id, payload);
      if (res.success) {
        const returned = res.data?.user || res.data;
        updateUser({ skills: returned?.skills ?? skills });
        toast.success('Skills updated');
        setSkillsModalOpen(false);
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } finally {
      setIsSavingModal(false);
    }
  };

  if (!user) {
    return <div>User not found. Please log in.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsEditing((v) => !v)}>
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={(user.profilePicture ? `${user.profilePicture}?cb=${Date.now()}` : '')} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8"
                onClick={triggerFileInput}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-lg text-muted-foreground">{user.designation || 'Employee'}</p>
              <p className="text-muted-foreground">{user.department} • {user.id}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </div>
                )}
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
          <TabsTrigger value="job">Job</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => openEdit('personal')}>Edit</Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-4">
                <fieldset disabled={!isEditing} className={!isEditing ? 'opacity-90' : ''}>
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
                    <Input id="dateOfBirth" type="date" {...personalForm.register('dateOfBirth')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input id="gender" {...personalForm.register('gender')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...personalForm.register('country')} />
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
                </fieldset>
                {isEditing && <Button type="submit">Update Personal Info</Button>}
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
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => openEdit('contact')}>Edit</Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4">
                <fieldset disabled={!isEditing} className={!isEditing ? 'opacity-90' : ''}>
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
                </fieldset>
                {isEditing && <Button type="submit">Update Contact Info</Button>}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency and Password tabs removed as requested */}

        {/* Job Tab */}
        <TabsContent value="job" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Update job and payroll details</CardDescription>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => setJobModalOpen(true)}>Edit</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Employee ID</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user.employeeId || '-'}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user.department}</p>
                </div>
                <div>
                  <Label>Designation</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user.designation}</p>
                </div>
                <div>
                  <Label>Bank Account Type</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user.bankAccountType || '-'}</p>
                </div>
                <div>
                  <Label>Salary</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user.salary != null ? `₹ ${user.salary}` : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Manage your skills list</CardDescription>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => setSkillsModalOpen(true)}>Edit</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Current skills</Label>
                <p className="text-sm text-muted-foreground mt-1">{Array.isArray(user.skills) ? user.skills.join(', ') : '-'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EditModal
        open={modalOpen === 'personal'}
        onOpenChange={(o) => (o ? openEdit('personal') : closeEdit())}
        title="Edit Personal Information"
        description="Update your personal details"
        onSave={savePersonal}
        isSaving={isSavingModal}
      >
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="modal_name">Full Name</Label>
            <Input id="modal_name" {...personalForm.register('name')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_dob">Date of Birth</Label>
            <Input id="modal_dob" type="date" {...personalForm.register('dateOfBirth')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_address">Address</Label>
            <Input id="modal_address" {...personalForm.register('address')} />
          </div>
        </form>
      </EditModal>

      <EditModal
        open={modalOpen === 'contact'}
        onOpenChange={(o) => (o ? openEdit('contact') : closeEdit())}
        title="Edit Contact Information"
        description="Update your contact details"
        onSave={saveContact}
        isSaving={isSavingModal}
      >
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="modal_email">Email</Label>
            <Input id="modal_email" type="email" {...contactForm.register('email')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_phone">Phone</Label>
            <Input id="modal_phone" {...contactForm.register('phone')} />
          </div>
        </form>
      </EditModal>

      <EditModal
        open={modalOpen === 'emergency'}
        onOpenChange={(o) => (o ? openEdit('emergency') : closeEdit())}
        title="Edit Emergency Contact"
        description="Update your emergency contact information"
        onSave={saveEmergency}
        isSaving={isSavingModal}
      >
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="modal_em_name">Contact Name</Label>
            <Input id="modal_em_name" {...emergencyForm.register('emergencyName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_em_phone">Contact Phone</Label>
            <Input id="modal_em_phone" {...emergencyForm.register('emergencyPhone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_em_rel">Relationship</Label>
            <Input id="modal_em_rel" {...emergencyForm.register('emergencyRelationship')} />
          </div>
        </form>
      </EditModal>

      {/* Job Modal */}
      <EditModal
        open={jobModalOpen}
        onOpenChange={setJobModalOpen}
        title="Edit Job Information"
        description="Update job and payroll details"
        onSave={saveJob}
        isSaving={isSavingModal}
      >
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="modal_empid">Employee ID</Label>
            <Input id="modal_empid" {...jobForm.register('employeeId')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_dept">Department</Label>
            <Input id="modal_dept" {...jobForm.register('department')} />
            {jobForm.formState.errors.department && (
              <p className="text-sm text-red-600">{jobForm.formState.errors.department.message as string}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_desig">Designation</Label>
            <Input id="modal_desig" {...jobForm.register('designation')} />
            {jobForm.formState.errors.designation && (
              <p className="text-sm text-red-600">{jobForm.formState.errors.designation.message as string}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_bank">Bank Account Type</Label>
            <Input id="modal_bank" {...jobForm.register('bankAccountType')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal_salary">Salary</Label>
            <Input id="modal_salary" type="number" step="1" {...jobForm.register('salary', { valueAsNumber: true })} />
            {jobForm.formState.errors.salary && (
              <p className="text-sm text-red-600">{jobForm.formState.errors.salary.message as string}</p>
            )}
          </div>
        </form>
      </EditModal>

      {/* Skills Modal */}
      <EditModal
        open={skillsModalOpen}
        onOpenChange={setSkillsModalOpen}
        title="Edit Skills"
        description="Enter comma-separated skills"
        onSave={saveSkills}
        isSaving={isSavingModal}
      >
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="modal_skills">Skills (comma separated)</Label>
            <Input id="modal_skills" placeholder="Node, React" {...skillsForm.register('skills')} />
          </div>
        </form>
      </EditModal>
      {/* end modals */}
    </div>
  );
}