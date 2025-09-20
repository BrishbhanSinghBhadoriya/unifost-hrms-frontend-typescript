"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditModalSection } from './_components/EditModal';

import { Mail, Phone, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Personal_Info from './_components/Personal_Info';
import Contact_Info from './_components/Contact_Info';
import JobTab from './_components/JobTab';
import ExperienceTab from './_components/ExperienceTab';
import EductionTab from './_components/EductionTab';
import BankdetailsTab from './_components/BankdetailsTab';
import DocumentTab from './_components/DocumentTab';


export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  console.log(user)

  
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
        
      </div>

      {/* Profile Header */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={(user.profilePicture ? `${user.profilePicture}?cb=${Date.now()}` : '')} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
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

        <TabsContent value="document" className="space-y-4">
          <DocumentTab/>
        </TabsContent>

      </Tabs>

      {/* Modals */}
      <EditModalSection />
      {/* end modals */}
    </div>
  );
}