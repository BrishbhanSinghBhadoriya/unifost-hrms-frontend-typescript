"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/api';
import { fetchAllEmployees } from '@/components/functions/Employee';
import { useQuery } from '@tanstack/react-query';

export default function MarkBulkAttendancePage() {
  const router = useRouter();
  const [bulkDate, setBulkDate] = useState<string>('');
  const [bulkCheckIn, setBulkCheckIn] = useState<string>('');
  const [bulkCheckOut, setBulkCheckOut] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<'present' | 'absent'>('present');
  const [selectAllBulk, setSelectAllBulk] = useState(false);
  const [selectedBulk, setSelectedBulk] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    setBulkDate(dayjs().format('YYYY-MM-DD'));
  }, []);

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchAllEmployees,
  });

  const normalized = useMemo(() => {
    const raw = (employeesData || []) as any[];
    return raw.map((e: any) => ({
      id: String(e._id || e.id || ''),
      name: e.name || e.employeeName || '',
      designation: e.designation,
    }));
  }, [employeesData]);

  const filtered = useMemo(() => {
    if (!search.trim()) return normalized;
    const q = search.toLowerCase();
    return normalized.filter(e => e.name.toLowerCase().includes(q) || String(e.designation || '').toLowerCase().includes(q));
  }, [normalized, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const allEmployeeIds = useMemo(() => filtered.map(e => e.id), [filtered]);

  const handleSubmit = async () => {
    if (!bulkDate) {
      toast.error('Please select a date');
      return;
    }
    try {
      setIsSubmitting(true);
      const toIso = (date?: string, hhmm?: string) => {
        if (!date || !hhmm) return undefined as unknown as string;
        return dayjs(`${date} ${hhmm}`).toISOString();
      };
      const selectedIds = selectAllBulk ? allEmployeeIds : Array.from(selectedBulk);
      if (selectedIds.length === 0) {
        toast.error('Please select at least one employee');
        setIsSubmitting(false);
        return;
      }
      const payload = {
        date: bulkDate,
        checkIn: bulkCheckIn ? toIso(bulkDate, bulkCheckIn) : undefined,
        checkOut: bulkCheckOut ? toIso(bulkDate, bulkCheckOut) : undefined,
        status: bulkStatus,
        // Force explicit selection to avoid backend marking unintended users
        selectAll: false,
        selectedEmployees: selectedIds,
      } as any;
      await api.post('/hr/bulkAttendance', payload);
      toast.success('Bulk attendance marked successfully');
      router.back();
    } catch (e) {
      toast.error('Bulk mark failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Mark Bulk Attendance</CardTitle>
          <CardDescription>Select date and optional times, then apply to selected employees.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check In (optional)</label>
              <Input type="time" value={bulkCheckIn} onChange={(e) => setBulkCheckIn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check Out (optional)</label>
              <Input type="time" value={bulkCheckOut} onChange={(e) => setBulkCheckOut(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as 'present' | 'absent')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Select Employees</label>
                <div className="flex items-center gap-2 text-sm">
                  <span>Select All</span>
                  <Checkbox
                    checked={selectAllBulk}
                    onCheckedChange={(v) => {
                      const flag = Boolean(v);
                      setSelectAllBulk(flag);
                      if (flag) setSelectedBulk(new Set(allEmployeeIds));
                      else setSelectedBulk(new Set());
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search by name or designation"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                {!selectAllBulk && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Select Page</span>
                    <Checkbox
                      checked={currentPageItems.length > 0 && currentPageItems.every(e => selectedBulk.has(e.id))}
                      onCheckedChange={(v) => {
                        const flag = Boolean(v);
                        const next = new Set(selectedBulk);
                        currentPageItems.forEach(e => { if (flag) next.add(e.id); else next.delete(e.id); });
                        setSelectedBulk(next);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="max-h-96 overflow-auto rounded-md border p-2 space-y-2">
                {currentPageItems.map((emp) => {
                  const id = emp.id;
                  const inputId = `bulk-emp-${id}`;
                  const checked = selectAllBulk || selectedBulk.has(id);
                  return (
                    <div key={id} className="flex items-center gap-3 text-sm">
                      <Checkbox
                        id={inputId}
                        checked={checked}
                        onCheckedChange={(v) => {
                          const shouldCheck = Boolean(v);
                          const next = new Set(selectedBulk);
                          if (shouldCheck) next.add(id); else next.delete(id);
                          setSelectedBulk(next);
                        }}
                      />
                      <label htmlFor={inputId} className="cursor-pointer select-none">
                        {emp.name}{emp.designation ? ` - ${emp.designation}` : ''}
                      </label>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-sm text-muted-foreground">No employees found.</div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                <div>{(selectAllBulk ? allEmployeeIds.length : selectedBulk.size)} selected</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                  <span>Page {page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting || ((selectAllBulk ? allEmployeeIds.length : selectedBulk.size) === 0)}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Marking...' : 'Mark Attendance'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


