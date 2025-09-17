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
                <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'job' }))}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Tile icon={<BadgeIcon sx={{ fontSize: 18, color: '#0ea5e9' }} />} label="Employee ID" value={user?.employeeId || '-'} color="#e0f2fe" />
                <Tile icon={<ApartmentIcon sx={{ fontSize: 18, color: '#7c3aed' }} />} label="Department" value={user?.department || '-'} color="#ede9fe" />
                <Tile icon={<WorkOutlineIcon sx={{ fontSize: 18, color: '#16a34a' }} />} label="Designation" value={user?.designation || '-'} color="#dcfce7" />
                <Tile icon={<HomeWorkIcon sx={{ fontSize: 18, color: '#fb923c' }} />} label="Work Mode" value={(user as any)?.workMode || '-'} color="#ffedd5" />
                <Tile icon={<CategoryIcon sx={{ fontSize: 18, color: '#4f46e5' }} />} label="Job Type" value={(user as any)?.jobType || '-'} color="#e0e7ff" />
                <Tile icon={<SupervisorAccountIcon sx={{ fontSize: 18, color: '#9333ea' }} />} label="Reporting Manager" value={(user as any)?.reportingTo || '-'} color="#f3e8ff" />
                <Tile icon={<CalendarMonthIcon sx={{ fontSize: 18, color: '#22c55e' }} />} label="Joining Date" value={user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : '-'} color="#dcfce7" />
              </div>
            </CardContent>
          </Card>
    </div>
  )
}

export default JobTab