import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import React from 'react'
import { useAuth } from '@/lib/auth-context'
import { Pencil } from 'lucide-react'

const Personal_Info = () => {
  const { user } = useAuth();

  const get = (v: any, fallback: string = '-') => (v ?? v === 0 ? String(v) : fallback);
console.log(user)

  return (
    <div>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </div>
          <Button size="icon" variant="ghost" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'personal' }))}>
            <Pencil className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Name</Label>
              <p className="text-sm text-muted-foreground">{get(user?.name)}</p>
            </div>
            <div className="space-y-1">
              <Label>Father's Name</Label>
              <p className="text-sm text-muted-foreground">{get(user?.fatherName)}</p>
            </div>
            <div className="space-y-1">
              <Label>Date of Birth</Label>
              <p className="text-sm text-muted-foreground">{get((user as any)?.dob || (user as any)?.dateOfBirth)}</p>
            </div>
            <div className="space-y-1">
              <Label>Blood Group</Label>
              <p className="text-sm text-muted-foreground">{get((user as any)?.bloodGroup || (user as any)?.bloodGroup)}</p>
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{get(user?.email)}</p>
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <p className="text-sm text-muted-foreground">{get(user?.phone)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label>Address</Label>
                <Button size="sm" variant="ghost" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'address' }))}>            <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {typeof user?.address === 'object'
                  ? [
                      (user as any)?.address?.street,
                      (user as any)?.address?.city,
                      (user as any)?.address?.state
                    ].filter(Boolean).join(' ')
                  : get(user?.address)}
              </p>
            </div>
            <div className="space-y-1">
              <Label>State - Country</Label>
              <p className="text-sm text-muted-foreground">
                {[
                  (user as any)?.address?.state || user?.country,
                  (user as any)?.address?.country || user?.country || 'India'
                ].filter(Boolean).join(' - ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Personal_Info