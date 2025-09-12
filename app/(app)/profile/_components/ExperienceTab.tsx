import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'

const ExperienceTab = () => {
  const { user } = useAuth();
  return (
    <div>
        <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
              <CardDescription>Manage your work experience</CardDescription>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'experience' }))}>Add</Button>
              </div>
            </CardHeader>
            <CardContent>
              {Array.isArray((user as any).experience) && (user as any).experience.length > 0 ? (
                <div className="space-y-3">
                  {(user as any).experience.map((exp: any, idx: number) => (
                    <div key={idx} className="border rounded-md p-3">
                      <div className="font-semibold">{exp.company}</div>
                      <div className="text-sm text-muted-foreground">{exp.designation}</div>
                      <div className="text-sm text-muted-foreground">
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : '-'}
                        {` — `}
                        {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                      </div>
                      {exp.description && (
                        <div className="text-sm mt-2">{exp.description}</div>
                      )}
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