"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import dayjs from "dayjs";
import { z } from "zod";
import api from "@/lib/api";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";

export type AnnouncementFormValues = {
  _id:string,
  subject: string;
  body: string;
  targetAudience: ("all" | "employee" | "manager" | "hr")[];
  role?: string;
  publishedDate?: Date;
  expiryDate?: Date;
  image?: string[];
  document?: string[];
};

const announcementSchema = z
  .object({
    subject: z.string().min(3, "Subject is required"),
    body: z.string().min(5, "Body is required"),
    targetAudience: z
      .array(z.enum(["all", "employee", "manager", "hr"]))
      .nonempty("Select at least one audience"),
    role: z.string().optional(),
    publishedDate: z
      .string()
      .refine(
        (date) => dayjs(date, "YYYY-MM-DD", true).isValid(),
        "Invalid published date"
      )
      .transform((val) => new Date(val))
      .optional(),
    expiryDate: z
      .string()
      .refine(
        (date) => dayjs(date, "YYYY-MM-DD", true).isValid(),
        "Invalid expiry date"
      )
      .transform((val) => new Date(val))
      .optional(),
    image: z.array(z.string()).optional(),
    document: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.publishedDate && data.expiryDate) {
        return (
          dayjs(data.expiryDate).isAfter(dayjs(data.publishedDate)) ||
          dayjs(data.expiryDate).isSame(dayjs(data.publishedDate))
        );
      }
      return true;
    },
    {
      message: "Expiry date must be same or after published date",
      path: ["expiryDate"],
    }
  );

export default function AnnouncementPage() {
  const router = useRouter();
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [imageFiles,setimageFiles]=useState<File[]>([])
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docURLs, setDocURLs] = useState<string[]>([]);

   const { user } = useAuth();




  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      targetAudience: [],
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (announcement: AnnouncementFormValues) => {
      const response = await api.post(
        "/announcement/createAnnouncement",
        announcement
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Announcement published successfully");
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Failed to publish announcement");
    },
  });

  const handleFormSubmit = async (values: AnnouncementFormValues) => {
    try {
      const payload = {
        ...values,
        image: imageURLs,
        images: imageURLs,
        document: docURLs,
        documents: docURLs,
      } as any;
      createAnnouncement.mutate(payload);
    } catch (error) {
      toast.error("Failed to add announcement!");
    }
  };

  const handleImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFiles = Array.from(files);
  
    // show preview
    setimageFiles((prev) => [...prev, ...selectedFiles]);
  
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });
  
    try {
      const res = await api.post("/upload/upload-one-multiple-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // robustly extract URLs regardless of response shape
      const body: any = res?.data?.data ?? res?.data ?? {};
      const fromImageUrls = Array.isArray(body?.imageUrls) ? body.imageUrls : [];
      const imagesArray = Array.isArray(body?.images) ? body.images : [];
      const urlsFromImages = imagesArray
        .map((it: any) => it?.url)
        .flat()
        .filter((u: any) => typeof u === "string");
      const urls: string[] = [...fromImageUrls, ...urlsFromImages];
      setImageURLs((prev) => [...prev, ...urls]);
      toast.success("Images uploaded successfully!");
    } catch (err) {
      console.error("Error uploading images:", err);
      toast.error("Image upload failed!");
    }
  };
  

  const handleDocs = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
  
    const acceptedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];
  
    const selectedFiles = Array.from(files).filter((f) =>
      acceptedTypes.includes(f.type)
    );
  
    setDocFiles((prev) => [...prev, ...selectedFiles]);
  
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));
  
    try {
      const res = await api.post("/upload/upload-one-multiple-documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // robustly extract URLs regardless of response shape
      const body: any = res?.data?.data ?? res?.data ?? {};
      const fromDocUrls = Array.isArray(body?.docUrls) ? body.docUrls : [];
      const documentsArray = Array.isArray(body?.documents) ? body.documents : [];
      const urlsFromDocuments = documentsArray
        .map((it: any) => it?.url)
        .flat()
        .filter((u: any) => typeof u === "string");
      const urls: string[] = [...fromDocUrls, ...urlsFromDocuments];
      setDocURLs((prev) => [...prev, ...urls]);
      toast.success("Documents uploaded successfully!");
    } catch (err) {
      console.error("Error uploading documents:", err);
      toast.error("Document upload failed!");
    }
  };
  
  const removeImage = (index: number) => {
    setimageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDoc = (index: number) => {
    setDocFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { data: announcements} = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await api.get("/announcement/getAnnouncement");
     
      return res.data.data

    },
  });
  console.log(announcements)
  const announcementColumns = [
    { key: "subject" as keyof AnnouncementFormValues, label: "Subject", sortable: true, sortType: "string" as const },
    {
      key: "targetAudience",
      label: "Audience",
      sortable: true,
      render: (v: any) => Array.isArray(v) ? v.join(", ") : String(v ?? "-"),
      sortAccessor: (row: any) => (Array.isArray(row.targetAudience) ? row.targetAudience.join(",") : String(row.targetAudience || "")),
      sortType: "string" as const,
    },
    {
      key: "publishedDate",
      label: "Published",
      sortable: true,
      render: (v: any) => v ? dayjs(v).format("DD MMM YYYY") : "-",
      sortType: "date" as const,
    },
    {
      key: "expiryDate",
      label: "Expiry",
      sortable: true,
      render: (v: any) => v ? dayjs(v).format("DD MMM YYYY") : "-",
      sortType: "date" as const,
    },
    {
      key:"body",
      label :"description",
      sortable:true,
      render: (body: string) => {
        const display = typeof body === 'string' && body.length > 30
          ? `${body.slice(0, 30)}...`
          : body;
        return (
          <div className="max-w-48" title={body}>
            {display}
          </div>
        );
      }
    },
    
  ];
  const actions = (announcement: AnnouncementFormValues) => (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => router.push(`/announcements/${announcement._id}`)}
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
            <AlertDialogAction >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
      
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">New Announcement</h1>
        <p className="text-muted-foreground">
          Create and publish a company-wide announcement
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
        </TabsList>

        {user?.role==='hr' && (
          <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
              <CardDescription>
                Fill in all required fields. Add images or documents if needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                  className="space-y-6"
                >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Holiday Schedule Update"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Audience */}
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(val) => field.onChange([val])}
                          value={field.value?.[0]}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Published Date */}
                <FormField
                  control={form.control}
                  name="publishedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" /> Publish Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? dayjs(field.value).format('YYYY-MM-DD') : ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Expiry Date */}
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" /> Expiry Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? dayjs(field.value).format('YYYY-MM-DD') : ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Hide announcement after this date.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Body */}
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Write the announcement body..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Insert Images</h3>
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

                {/* Document Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Attach Documents</h3>
                  </div>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => handleDocs(e.target.files)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  />
                  {docFiles.length > 0 && (
                    <ul className="space-y-2">
                      {docFiles.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between rounded-md border p-2 text-sm"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4" /> {file.name}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDoc(index)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={createAnnouncement.isPending}
                >
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          </Card>
        </TabsContent>
        )}
        

        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>All announcements from backend</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="w-full">
                <DataTable
                  data={(announcements as any[]) || []}
                  columns={announcementColumns as any}
                  searchPlaceholder="Search announcements..."
                  actions={actions}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
