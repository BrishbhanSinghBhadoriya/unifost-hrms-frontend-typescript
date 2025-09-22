import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import React from 'react'
import { useAuth } from '@/lib/auth-context'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import EventIcon from '@mui/icons-material/Event'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PublicIcon from '@mui/icons-material/Public'
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import ManIcon from '@mui/icons-material/Man';
import dayjs from "dayjs";




const Personal_Info = () => {
  const { user } = useAuth();

  const get = (v: any, fallback: string = '-') => (v ?? v === 0 ? String(v) : fallback);
console.log(user)

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

  const addressText = typeof user?.address === 'object'
    ? [
        (user as any)?.address?.street,
        (user as any)?.address?.city,
        (user as any)?.address?.state,
      ].filter(Boolean).join(' ')
    : get(user?.address);

  return (
    <div>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </div>
          <Button size="icon" variant="ghost" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'personal' }))}>
            <EditIcon sx={{ fontSize: 16 }} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Tile
              icon={<PersonIcon sx={{ fontSize: 18, color: '#7c3aed' }} />}
              label="Name"
              value={get(user?.name)}
              color="#ede9fe"
            />
            <Tile
  icon={<EventIcon sx={{ fontSize: 18, color: '#2563eb' }} />}
  label="Date of Birth"
  value={
    (user as any)?.dob || (user as any)?.dateOfBirth
      ? dayjs((user as any)?.dob || (user as any)?.dateOfBirth).format("DD-MM-YYYY")
      : "-"
  }
  color="#dbeafe"
/>

            <Tile
              icon={<ManIcon sx={{ fontSize: 18, color: '#16a34a' }} />}
              label="Father Name"
              value={get(user?.fatherName)}
              color="#dcfce7"
            />
            <Tile
              icon={<BloodtypeIcon sx={{ fontSize: 18, color: '#fb923c' }} />}
              label="Blood Group"
              value={get(user?.bloodGroup)}
              color="#ffedd5"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Address</Label>
                <Button size="sm" variant="ghost" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'address' }))}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </Button>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fee2e2' }}>
                    <LocationOnIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div className="text-base font-medium">{addressText || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
            <Tile
              icon={<PublicIcon sx={{ fontSize: 18, color: '#4f46e5' }} />}
              label="State - Country"
              value={[
                (user as any)?.address?.state,
                (user as any)?.address?.country || 'India',
              ].filter(Boolean).join(' - ')}
              color="#e0e7ff"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Personal_Info