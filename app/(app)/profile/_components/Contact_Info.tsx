import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import EditIcon from '@mui/icons-material/Edit'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency'


const Contact_Info = () => {
  const { user } = useAuth();
  const get = (v: any, fallback: string = '-') => (v ?? v === 0 ? String(v) : fallback);

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
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Update your contact details
                </CardDescription>
              </div>
              <div className="mt-2 flex items-center gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'contact' }))}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Tile
                  icon={<AlternateEmailIcon sx={{ fontSize: 18, color: '#2563eb' }} />}
                  label="Professional Email"
                  value={get((user as any)?.professionalEmailId)}
                  color="#dbeafe"
                />
                <Tile
                  icon={<EmailIcon sx={{ fontSize: 18, color: '#16a34a' }} />}
                  label="Personal Email"
                  value={get(user?.email)}
                  color="#dcfce7"
                />
                <Tile
                  icon={<PhoneIcon sx={{ fontSize: 18, color: '#fb923c' }} />}
                  label="Phone Number"
                  value={get(user?.phone)}
                  color="#ffedd5"
                />
                <Tile
                  icon={<ContactEmergencyIcon sx={{ fontSize: 18, color: '#7c3aed' }} />}
                  label="Emergency Phone Number"
                  value={get((user as any)?.emergencyContactNo)}
                  color="#ede9fe"
                />
              </div>
            </CardContent>
          </Card>
    </div>
  )
}

export default Contact_Info