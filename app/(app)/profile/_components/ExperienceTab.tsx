import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BusinessIcon from '@mui/icons-material/Business'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ExperienceTab = () => {
  const { user, updateUser } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingExperience, setDeletingExperience] = useState<any>(null);

  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (args: { id?: string; index?: number }) => {
      const currentExperience = Array.isArray((user as any)?.experience) ? [...(user as any).experience] : [];
      const updatedExperience = currentExperience.filter((item: any, index: number) => {
        if (args?.id) return String(item?._id) !== String(args.id);
        if (typeof args?.index === 'number') return index !== args.index;
        return true;
      });
      
      const result = await authService.updateEmployeeProfile(user?._id as string, {
        experience: updatedExperience
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }
      
      return { result, updatedExperience };
    },
    onSuccess: (data) => {
      // Update local user state immediately
      updateUser({
        experience: data.updatedExperience
      } as any);
      
      toast.success('Experience removed');
      qc.invalidateQueries({ queryKey: ['employee', (user as any)?._id || user?.id] });
    },
    onError: (error) => {
      console.error('Delete experience error:', error);
      toast.error('Failed to remove experience');
    },
  });



  const handleDeleteClick = (idx: number) => {
    const experience = (user as any).experience[idx];
    setDeletingExperience({ ...experience, index: idx, id: experience?._id });
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingExperience) {
      deleteMutation.mutate({ id: deletingExperience?.id, index: deletingExperience?.index });
      setDeleteOpen(false);
      setDeletingExperience(null);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Experience</CardTitle>
            <CardDescription>Manage your work experience</CardDescription>
          </div>
          <div className="mt-2 flex items-center gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'experience' }))}>
              <AddIcon sx={{ fontSize: 16, marginRight: 1 }} />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {Array.isArray((user as any).experience) && (user as any).experience.length > 0 ? (
            <div className="space-y-3">
              {(user as any).experience.map((exp: any, idx: number) => (
                <div key={exp?._id || idx} className="border rounded-md p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BusinessIcon sx={{ fontSize: 24, color: '#1976d2' }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold capitalize">{exp.company}</div>
                      <div className="text-sm text-muted-foreground capitalize">{exp.designation}</div>
                      <div className="text-sm text-muted-foreground">
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : '-'} — {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                      </div>
                      {exp.description && (
                        <div className="text-sm mt-2">{exp.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: { key: 'experience', index: idx } }))}>
                      <EditIcon sx={{ fontSize: 14, marginRight: 0.5 }} />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteClick(idx)}>
                      <DeleteIcon sx={{ fontSize: 14, marginRight: 0.5 }} />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No experience added yet.</div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the experience record for <strong>{deletingExperience?.company}</strong> as <strong>{deletingExperience?.designation}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ExperienceTab