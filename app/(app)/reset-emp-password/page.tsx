"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Key, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/auth';

interface ForgotPasswordRequest {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function ResetEmpPasswordPage() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ForgotPasswordRequest | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<{ exists: boolean; user?: any; message?: string } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Check for email parameter in URL
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setSearchEmail(emailParam);
      checkEmailExists(emailParam);
    }
  }, [searchParams]);

  // Email checking function
  const checkEmailExists = async (email: string) => {
    if (!email || email.length < 3) {
      setEmailCheckResult(null);
      return;
    }

    setIsCheckingEmail(true);
    try {
      const result = await authService.checkEmailExists(email);
      setEmailCheckResult(result);
    } catch (error) {
      console.error('Email check error:', error);
      setEmailCheckResult({ exists: false, message: 'Failed to check email' });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Debounced email checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkEmailExists(searchEmail);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchEmail]);

  // Fetch forgot password requests
  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ['forgotPasswordRequests'],
    queryFn: async () => {
      const result = await authService.getForgotPasswordRequests();
      if (result.success) {
        return result.data || [];
      }
      throw new Error(result.message || 'Failed to fetch requests');
    },
  });

  // Delete request mutation
  const deleteMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const result = await authService.deleteForgotPasswordRequest(requestId);
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete request');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Request deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['forgotPasswordRequests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete request');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const result = await authService.resetEmployeePassword(userId, password);
      if (!result.success) {
        throw new Error(result.message || 'Failed to reset password');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
      setIsResetDialogOpen(false);
      setSelectedRequest(null);
      setNewPassword('');
      queryClient.invalidateQueries({ queryKey: ['forgotPasswordRequests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const generatePassword = () => {
    setIsGeneratingPassword(true);
    // Generate a random password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setIsGeneratingPassword(false);
  };

  const handleResetPassword = () => {
    if (!selectedRequest || !newPassword) {
      toast.error('Please enter a password');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    resetPasswordMutation.mutate({
      userId: selectedRequest._id,
      password: newPassword
    });
  };

  const handleDeleteRequest = (requestId: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      deleteMutation.mutate(requestId);
    }
  };

  const columns = [
    {
      key: 'name' as keyof ForgotPasswordRequest,
      label: 'Name',
      sortable: true,
    },
    {
      key: 'email' as keyof ForgotPasswordRequest,
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role' as keyof ForgotPasswordRequest,
      label: 'Role',
      sortable: true,
      render: (value: string) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'department' as keyof ForgotPasswordRequest,
      label: 'Department',
      sortable: true,
    },
    {
      key: 'designation' as keyof ForgotPasswordRequest,
      label: 'Designation',
      sortable: true,
    },
    {
      key: 'status' as keyof ForgotPasswordRequest,
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge 
          variant={value === 'pending' ? 'default' : value === 'approved' ? 'secondary' : 'destructive'}
          className="capitalize"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt' as keyof ForgotPasswordRequest,
      label: 'Requested Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (row: ForgotPasswordRequest) => (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setSelectedRequest(row);
          setIsResetDialogOpen(true);
        }}
        disabled={resetPasswordMutation.isPending}
      >
        <Key className="h-4 w-4 mr-1" />
        Reset
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDeleteRequest(row._id)}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertDescription>
            Failed to load password reset requests. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reset Employee Passwords</h1>
          <p className="text-muted-foreground">
            Manage password reset requests from employees
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Email Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Employee by Email</CardTitle>
          <CardDescription>
            Enter an email address to find and reset password for a specific employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-email">Email Address</Label>
              <div className="relative">
                <Input
                  id="search-email"
                  type="email"
                  placeholder="Enter employee email address"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className={`${emailCheckResult?.exists ? 'border-green-500' : emailCheckResult?.exists === false ? 'border-red-500' : ''}`}
                />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              {emailCheckResult && (
                <div className={`text-sm ${emailCheckResult.exists ? 'text-green-600' : 'text-red-600'}`}>
                  {emailCheckResult.exists ? (
                    <div className="space-y-2">
                      <p className="font-medium">✓ Employee found in system</p>
                      {emailCheckResult.user && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm font-medium">Name: {emailCheckResult.user.name}</p>
                          <p className="text-sm text-gray-600">Email: {emailCheckResult.user.email}</p>
                          <p className="text-sm text-gray-600">ID: {emailCheckResult.user.id}</p>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSelectedRequest({
                                _id: emailCheckResult.user.id,
                                name: emailCheckResult.user.name,
                                email: emailCheckResult.user.email,
                                role: '',
                                department: '',
                                designation: '',
                                status: 'pending',
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              });
                              setIsResetDialogOpen(true);
                            }}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>✗ {emailCheckResult.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Reset Requests</CardTitle>
          <CardDescription>
            Review and manage employee password reset requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={requests || []}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search requests..."
            initialPageSize={10}
          />
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedRequest?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePassword}
                disabled={isGeneratingPassword}
                className="w-full"
              >
                {isGeneratingPassword ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Generate Random Password
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsResetDialogOpen(false);
                  setSelectedRequest(null);
                  setNewPassword('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending || !newPassword}
                className="flex-1"
              >
                {resetPasswordMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Reset Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
