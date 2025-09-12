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
import { EditModalSection } from './_components/EditModal';

import { User, Mail, Phone, MapPin, Users, Lock, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Personal_Info from './_components/Personal_Info';
import Contact_Info from './_components/Contact_Info';
import JobTab from './_components/JobTab';
import ExperienceTab from './_components/ExperienceTab';
import EductionTab from './_components/EductionTab';
import BankdetailsTab from './_components/BankdetailsTab';

const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  fatherName:z.string().min(4,'Name must be at least 4 characters'),
  dob: z.string().optional(),
  bloodGroup:z.string().optional(),
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

const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  designation: z.string().min(1, 'Designation is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  grade: z.string().optional(),
});

const bankSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  bankAccountNumber: z.string().min(1, 'Account number is required'),
  bankAccountType: z.enum(['savings', 'current']).default('savings'),
  bankIFSC: z.string().min(1, 'IFSC is required'),
  bankAccountHolderName: z.string().min(1, 'Account holder name is required'),
});

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState<null | 'contact' | 'emergency' | 'password'>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
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
      fatherName:(user as any)?.fatherName || '',

      dob: toYMD(user?.dob), 
      bloodGroup:(user as any)?.bloodGroup || '',
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

  const experienceForm = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: '',
      designation: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  });

  const educationForm = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: '',
      institution: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
    },
  });

  const bankForm = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bankName: '',
      bankAccountNumber: '',
      bankAccountType: 'savings',
      bankIFSC: '',
      bankAccountHolderName: '',
    },
  });

  // const handlePersonalInfoSubmit = (data: any) => {
  //   toast.success('Personal information updated successfully');
  // };

  // const handleContactSubmit = (data: any) => {
  //   toast.success('Contact information updated successfully');
  // };

  // const handleEmergencyContactSubmit = (data: any) => {
  //   toast.success('Emergency contact updated successfully');
  // };

  // const handlePasswordSubmit = (data: any) => {
  //   toast.success('Password changed successfully');
  //   passwordForm.reset();
  // };

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

  // const openEdit = (key: 'contact' | 'emergency' | 'password') => setModalOpen(key);
  const closeEdit = () => setModalOpen(null);


  if (!user) {
    return <div>User not found. Please log in.</div>;
  }

  return (
    <div className="space-y-8 w-full max-w-none">
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
      <Card className="shadow-sm">
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
          <Personal_Info/>  
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Contact_Info/>
        </TabsContent>


        <TabsContent value="job" className="space-y-4">
          <JobTab/>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <ExperienceTab/>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <EductionTab/>
        </TabsContent>
        <TabsContent value="bank" className="space-y-4">
          <BankdetailsTab/>
        </TabsContent>

      </Tabs>

      {/* Modals */}
      <EditModalSection />
      {/* end modals */}
    </div>
  );
}