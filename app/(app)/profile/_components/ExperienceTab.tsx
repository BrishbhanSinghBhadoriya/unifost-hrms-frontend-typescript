import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BusinessIcon from '@mui/icons-material/Business'

const ExperienceTab = () => {
  const { user, updateUser } = useAuth();

  const handleDelete = async (idx: number) => {
    const list = Array.isArray((user as any)?.experience) ? ([...(user as any).experience]) : [];
    list.splice(idx, 1);
    const res = await authService.updateEmployeeProfile((user as any).id, { experience: list });
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), experience: returned?.experience ?? list } as any);
      toast.success('Experience removed');
    } else {
      toast.error(res.message || 'Failed to remove');
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
                <div key={idx} className="border rounded-md p-3">
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
                    <Button size="sm" variant="outline" onClick={() => handleDelete(idx)}>
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
    </div>
  )
}

export default ExperienceTab