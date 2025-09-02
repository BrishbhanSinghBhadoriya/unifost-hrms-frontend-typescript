"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaveForm } from '@/components/forms/leave-form';
import { getLeaveBalance, mockEmployees } from '@/lib/mock';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ApplyLeavePage() {
  const router = useRouter();
  const { user } = useAuth();
  const currentEmployeeId = user?.id;
  const leaveBalance = getLeaveBalance(currentEmployeeId);

  const handleSubmit = async (data: any) => {
    try {
      // Backend expects: { leaveType, reason, startDate, endDate, durationType }
      const payload = {
        leaveType: data.type,
        reason: data.reason,
        startDate: data.startDate,
        endDate: data.endDate,
        durationType: data.days && data.days > 1 ? 'multiple_days' : 'single_day',
      };
      await api.post('/leaves', payload);
      toast.success('Leave request submitted successfully');
      router.push('/leaves');
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Apply for Leave</h1>
        <p className="text-muted-foreground">
          Submit a new leave request for approval
        </p>
      </div>

      {leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-lg p-2">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Casual Leave</p>
                  <p className="text-lg font-bold">{leaveBalance.casual.remaining} days</p>
                  <p className="text-xs text-muted-foreground">
                    of {leaveBalance.casual.total} total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300 rounded-lg p-2">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sick Leave</p>
                  <p className="text-lg font-bold">{leaveBalance.sick.remaining} days</p>
                  <p className="text-xs text-muted-foreground">
                    of {leaveBalance.sick.total} total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 rounded-lg p-2">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Earned Leave</p>
                  <p className="text-lg font-bold">{leaveBalance.earned.remaining} days</p>
                  <p className="text-xs text-muted-foreground">
                    of {leaveBalance.earned.total} total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Leave Application</CardTitle>
          <CardDescription>
            Please fill in all the required details for your leave request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeaveForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}