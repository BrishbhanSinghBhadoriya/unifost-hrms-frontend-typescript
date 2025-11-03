"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import api from "@/lib/api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type AnnouncementDetail = {
  _id: string;
  subject: string;
  body: string;
  targetAudience: ("all" | "employee" | "manager" | "hr")[] | string[];
  role?: string;
  publishedDate?: string | Date;
  expiryDate?: string | Date;
  images?: string[] | string;
  documents?: string[] | string;
  image?: string; // backend may return single key
  document?: string; // backend may return single key
  createdAt?: string;
  updatedAt?: string;
};

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<{ data: AnnouncementDetail } | AnnouncementDetail>({
    queryKey: ["announcement", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get(`/announcement/getannouncement/${id}`);
      return res.data?.data ?? res.data;
    },
  });

  const announcement: AnnouncementDetail | undefined = useMemo(() => {
    if (!data) return undefined;
    // Support either { data: {...} } or direct object
    return (data as any)?.data ?? (data as any);
  }, [data]);

  const images = useMemo(() => {
    const img = announcement?.images ?? announcement?.image;
    if (!img) return [] as string[];
    const arr = Array.isArray(img) ? img : [img];
    return arr.map((u) => normalizeUrl(u));
  }, [announcement]);

  const documents = useMemo(() => {
    const docs = announcement?.documents ?? announcement?.document;
    if (!docs) return [] as string[];
    const arr = Array.isArray(docs) ? docs : [docs];
    return arr.map((u) => normalizeUrl(u));
  }, [announcement]);

  function normalizeUrl(u?: string): string {
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "";
    const path = ("/" + String(u)).replace(/\/+/g, "/");
    return `${base}${path}`;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading announcement...
      </div>
    );
  }

  if (isError || !announcement) {
    return (
      <div className="space-y-3">
        <p className="text-red-600">Failed to load announcement.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcement Details</h1>
          <p className="text-muted-foreground">View the full announcement content</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{announcement.subject}</CardTitle>
          <CardDescription>
            {announcement.publishedDate ? (
              <span>
                Published {dayjs(announcement.publishedDate).format("DD MMM YYYY")} {announcement.expiryDate ? `• Expires ${dayjs(announcement.expiryDate).format("DD MMM YYYY")}` : ""}
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Target Audience</h3>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(announcement.targetAudience) ? announcement.targetAudience : String(announcement.targetAudience || "").split(",")).filter(Boolean).map((aud) => (
                <Badge key={aud}>{aud}</Badge>
              ))}
              {announcement.role ? <Badge variant="secondary">Role: {announcement.role}</Badge> : null}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Body</h3>
            <p className="whitespace-pre-wrap leading-7">{announcement.body}</p>
          </div>

          {images.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="relative group cursor-zoom-in"
                    onClick={() => setPreviewUrl(src)}
                  >
                    <img
                      src={src}
                      alt={`image-${idx}`}
                      className="h-36 w-full rounded-md object-cover border"
                    />
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/30 text-white text-sm rounded-md group-hover:flex">
                      View
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {documents.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Documents</h3>
              <ul className="list-disc pl-5 space-y-1">
                {documents.map((href, idx) => {
                  const isPdf = /\.pdf(\?|#|$)/i.test(href);
                  return (
                    <li key={idx}>
                      <a
                        className="text-primary underline break-all"
                        href={href}
                        {...(isPdf
                          ? { download: `document-${idx + 1}.pdf` }
                          : { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        Document {idx + 1}{isPdf ? " (PDF)" : ""}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewUrl ? (
            <div className="w-full">
              <img src={previewUrl} alt="preview" className="max-h-[80vh] w-full object-contain" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}


