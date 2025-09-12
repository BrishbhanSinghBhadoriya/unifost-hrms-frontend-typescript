import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'


const JobTab = () => {
  const { user } = useAuth();
  return (
    <div>
        <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Update job and payroll details</CardDescription>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'job' }))}>Edit</Button>
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
                  <p className="text-sm text-muted-foreground mt-1">{user?.department}</p>
                </div>
                <div>
                  <Label>Designation</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.designation}</p>
                </div>
                <div>
                  <Label>Work Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.bankAccountType || '-'}</p>
                </div>
                <div>
                  <Label>Job Type</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.salary != null ? `₹ ${user?.salary}` : '-'}</p>
                </div>
                <div>
                  <Label>Reporting Manager</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.salary != null ? `₹ ${user?.salary}` : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  )
}

export default JobTab