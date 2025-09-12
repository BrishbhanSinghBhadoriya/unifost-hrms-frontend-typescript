import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'



const EductionTab = () => {
  const { user } = useAuth();
  return (
    <div>
        <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Manage your education history</CardDescription>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'education' }))}>Add</Button>
              </div>
            </CardHeader>
            <CardContent>
              {Array.isArray((user as any).education) && (user as any).education.length > 0 ? (
                <div className="space-y-3">
                  {(user as any).education.map((ed: any, idx: number) => (
                    <div key={idx} className="border rounded-md p-3">
                      <div className="font-semibold">{ed.degree}</div>
                      <div className="text-sm text-muted-foreground">{ed.institution}</div>
                      <div className="text-sm text-muted-foreground">
                        {ed.startDate ? new Date(ed.startDate).toLocaleDateString() : '-'}
                        {` — `}
                        {ed.endDate ? new Date(ed.endDate).toLocaleDateString() : 'Present'}
                      </div>
                      {ed.fieldOfStudy && (
                        <div className="text-sm mt-2">Field: {ed.fieldOfStudy}</div>
                      )}
                      {ed.grade && (
                        <div className="text-sm mt-1">Grade: {ed.grade}</div>
                      )}
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