import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { PencilIcon } from 'lucide-react'


const Contact_Info = () => {
  const { user } = useAuth();
  const get = (v: any, fallback: string = '-') => (v ?? v === 0 ? String(v) : fallback);

  return (
    <div>
        <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Update your contact details
              </CardDescription>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'contact' }))}><PencilIcon className='h-4 w-4'/></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div >
                  <Label>Professional Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">{get((user as any)?.professionalEmailId)}</p>
                </div>
                <div>
                  <Label>Personal Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">{get(user?.email)}</p>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">{get(user?.phone)}</p>
                </div>
                <div>
                  <Label>Emergency Phone Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">{get((user as any)?.emergencyContactNo)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  )
}

export default Contact_Info