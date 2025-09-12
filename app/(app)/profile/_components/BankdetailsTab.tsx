import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'



const BankdetailsTab = () => {
  const { user } = useAuth();
  return (
    <div><Card>
    <CardHeader>
      <CardTitle>Bank Details</CardTitle>
      <CardDescription>Manage your bank accounts</CardDescription>
      <div className="mt-2">
        <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'bank' }))}>Add</Button>
      </div>
    </CardHeader>
    <CardContent>
      {Array.isArray((user as any).bankDetails) && (user as any).bankDetails.length > 0 ? (
        <div className="space-y-3">
          {(user as any).bankDetails.map((bd: any, idx: number) => (
            <div key={idx} className="border rounded-md p-3">
              <div className="font-semibold">{bd.bankName}</div>
              <div className="text-sm text-muted-foreground">{bd.bankAccountHolderName}</div>
              <div className="text-sm">{bd.bankAccountType?.toUpperCase()} • {bd.bankAccountNumber}</div>
              <div className="text-sm">IFSC: {bd.bankIFSC}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No bank details added yet.</div>
      )}
    </CardContent>
  </Card></div>
  )
}

export default BankdetailsTab