import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import EditIcon from '@mui/icons-material/Edit'
import BadgeIcon from '@mui/icons-material/Badge'
import ApartmentIcon from '@mui/icons-material/Apartment'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import CategoryIcon from '@mui/icons-material/Category'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'


const JobTab = () => {
  const { user } = useAuth();
  const Tile = ({
    icon,
    label,
    value,
    color,
  }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
    <div className="rounded-xl border bg-background">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
            {icon}
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-base font-medium">{value || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Job Information</CardTitle>
                <CardDescription>Update job and payroll details</CardDescription>
              </div>
              <div className="mt-2 flex items-center gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'job' }))}><Pencil className="h-4 w-4"/></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Employee ID</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.employeeId || '-'}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.department || '-'}</p>
                </div>
                <div>
                  <Label>Designation</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.designation || '-'}</p>
                </div>
                <div>
                  <Label>Work Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">{(user)?.workMode || '-'}</p>
                </div>
                <div>
                  <Label>Job Type</Label>
                  <p className="text-sm text-muted-foreground mt-1">{(user as any)?.jobType || '-'}</p>
                </div>
                <div>
                  <Label>Reporting Manager</Label>
                  <p className="text-sm text-muted-foreground mt-1">{(user as any)?.reportingTo || '-'}</p>
                </div>
                
                <div>
                  <Label>Joining Date</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  )
}

export default JobTab