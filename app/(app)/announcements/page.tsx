"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, FileText, Image as ImageIcon, Loader2, Paperclip, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

type AnnouncementFormValues = {
  subject: string;
  body: string;
  audience: 'all' | 'department' | 'role' | 'custom';
  department?: string;
  role?: string;
  publishDate?: string;
  expireDate?: string;
};

export default function AnnouncementPage() {
  const router = useRouter();
  const form = useForm<AnnouncementFormValues>({
    defaultValues: {
      subject: '',
      body: '',
      audience: 'all',
      department: '',
      role: '',
      publishDate: '',
      expireDate: '',
    },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const createAnnouncement = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post('http://localhost:5001/api/hr/createAnnouncement', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Announcement published');
      router.push('/dashboard');
    },
    onError: () => {
      toast.error('Failed to publish announcement');
    },
  });

  const onSubmit = async (values: AnnouncementFormValues) => {
    const formData = new FormData();
    formData.append('subject', values.subject);
    formData.append('body', values.body);
    formData.append('audience', values.audience);
    if (values.publishDate) formData.append('publishedDate', values.publishDate);
    if (values.expireDate) formData.append('expiryDate', values.expireDate);
    if (imageFiles[0]) formData.append('image', imageFiles[0]);
    if (docFiles[0]) formData.append('document', docFiles[0]);

    createAnnouncement.mutate(formData);
  };

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setImageFiles((prev) => [...prev, ...accepted]);
  };

  const handleDocs = (files: FileList | null) => {
    if (!files) return;
    const acceptedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.Presentationml.Presentation',
      'text/plain',
    ];
    const accepted = Array.from(files).filter((f) => acceptedTypes.includes(f.type));
    setDocFiles((prev) => [...prev, ...accepted]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDoc = (index: number) => {
    setDocFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">New Announcement</h1>
        <p className="text-muted-foreground">Create and publish a company-wide announcement</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcement details</CardTitle>
          <CardDescription>Fill in all required fields. Add images or documents if needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subject"
                  rules={{ required: 'Subject is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Holiday Schedule Update" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audience</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All employees</SelectItem>
                          <SelectItem value="department">Specific department</SelectItem>
                          <SelectItem value="role">Specific role</SelectItem>
                          <SelectItem value="custom">Custom list</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose who should receive this announcement.</FormDescription>
                    </FormItem>
                  )}
                />

                {form.watch('audience') === 'department' && (
                  <FormField
                    control={form.control}
                    name="department"
                    rules={{ required: 'Department is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('audience') === 'role' && (
                  <FormField
                    control={form.control}
                    name="role"
                    rules={{ required: 'Role is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Managers" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="publishDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Publish date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expireDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Expire date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Optional: hide announcement after this date.</FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="body"
                rules={{ required: 'Body is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea rows={8} placeholder="Write the announcement body..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Insert images</h3>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImages(e.target.files)}
                  />
                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-24 w-full object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                            onClick={() => removeImage(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Attach documents</h3>
                  </div>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => handleDocs(e.target.files)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.Presentationml.Presentation,text/plain"
                  />
                  {docFiles.length > 0 && (
                    <ul className="space-y-2">
                      {docFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                          <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4" /> {file.name}</span>
                          <Button type="button" variant="outline" size="sm" onClick={() => removeDoc(index)}>Remove</Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={createAnnouncement.isPending}>
                  {createAnnouncement.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Publish
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


