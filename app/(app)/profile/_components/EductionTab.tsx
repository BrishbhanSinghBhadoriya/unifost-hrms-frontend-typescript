import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SchoolIcon from '@mui/icons-material/School'

const EductionTab = () => {
  const { user, updateUser } = useAuth();

  const handleDelete = async (idx: number) => {
    const list = Array.isArray((user as any)?.education) ? ([...(user as any).education]) : [];
    list.splice(idx, 1);
    const res = await authService.updateEmployeeProfile((user as any).id, { education: list });
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), education: returned?.education ?? list } as any);
      toast.success('Education removed');
    } else {
      toast.error(res.message || 'Failed to remove');
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Education</CardTitle>
            <CardDescription>Manage your education history</CardDescription>
          </div>
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'education' }))}>
              <AddIcon sx={{ fontSize: 16, marginRight: 1 }} />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {Array.isArray((user as any).education) && (user as any).education.length > 0 ? (
            <div className="space-y-3">
              {(user as any).education.map((ed: any, idx: number) => (
                <div key={idx} className="border rounded-md p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <SchoolIcon sx={{ fontSize: 24, color: '#2e7d32' }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold capitalize">{ed.degree}</div>
                      <div className="text-sm text-muted-foreground capitalize">{ed.institution}</div>
                      <div className="text-sm text-muted-foreground">
                        {ed.startDate ? new Date(ed.startDate).toLocaleDateString() : '-'} — {ed.endDate ? new Date(ed.endDate).toLocaleDateString() : 'Present'}
                      </div>
                      {ed.fieldOfStudy && (
                        <div className="text-sm mt-2">Field: {ed.fieldOfStudy}</div>
                      )}
                      {ed.grade && (
                        <div className="text-sm mt-1">Grade: {ed.grade}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: { key: 'education', index: idx } }))}>
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
            <div className="text-sm text-muted-foreground">No education added yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EductionTab