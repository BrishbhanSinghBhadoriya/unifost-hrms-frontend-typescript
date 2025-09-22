import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function capitalizeFirst(s?: string) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const BankdetailsTab = () => {
  const { user, updateUser } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingBank, setDeletingBank] = useState<{ index: number; item: any } | null>(null);

  const handleDeleteClick = (idx: number) => {
    const list = Array.isArray((user as any)?.bankDetails) ? ([...(user as any).bankDetails]) : [];
    const item = list[idx];
    setDeletingBank({ index: idx, item });
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBank) return;
    const current = Array.isArray((user as any)?.bankDetails) ? ([...(user as any).bankDetails]) : [];
    const next = current.filter((_: any, i: number) => i !== deletingBank.index);
    const res = await authService.updateEmployeeProfile(((user as any)?._id || (user as any)?.id) as string, { bankDetails: next });
    if (res.success) {
      const returned = res.data?.user || res.data;
      updateUser({ ...(returned || {}), bankDetails: returned?.bankDetails ?? next } as any);
      toast.success('Bank detail removed');
      setDeleteOpen(false);
      setDeletingBank(null);
    } else {
      toast.error(res.message || 'Failed to remove');
    }
  };

  return (
    <div><Card>
    <CardHeader className="flex flex-row items-start justify-between">
      <div>
        <CardTitle>Bank Details</CardTitle>
        <CardDescription>Manage your bank accounts</CardDescription>
      </div>
      <div className="mt-2">
        <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: 'bank' }))}>
          <AddIcon sx={{ fontSize: 16, marginRight: 1 }} />
          Add
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {Array.isArray((user as any).bankDetails) && (user as any).bankDetails.length > 0 ? (
        <div className="space-y-3">
          {(user as any).bankDetails.map((bd: any, idx: number) => (
            <div key={idx} className="border rounded-md p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <AccountBalanceIcon sx={{ fontSize: 24, color: '#7b1fa2' }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm">Bank Name: {bd.bankName}</div>
                  <div className="text-sm">Account Holder Name: {bd.bankAccountHolderName}</div>
                  <div className="text-sm">Account Number: {bd.bankAccountNumber}</div>
                  <div className="text-sm">Account Type: {capitalizeFirst(bd.bankAccountType)}</div>
                  <div className="text-sm">IFSC: {bd.bankIFSC}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-edit-modal', { detail: { key: 'bank', index: idx } }))}>
                  <EditIcon sx={{ fontSize: 14, marginRight: 0.5 }} />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteClick(idx)}>
                  <DeleteIcon sx={{ fontSize: 14, marginRight: 0.5 }} />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No bank details added yet.</div>
      )}
    </CardContent>
  </Card>

  {/* Delete Confirmation Dialog */}
  <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete bank detail for <strong>{deletingBank?.item?.bankName}</strong> ({deletingBank?.item?.bankAccountNumber})? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  </div>
  )
}

export default BankdetailsTab