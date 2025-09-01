"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardSkeleton } from '@/components/ui/loading-skeleton';
import { Holiday } from '@/lib/types';
import { Calendar, CalendarDays, Plus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear, selectedRegion]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedRegion) params.append('region', selectedRegion);

      const response = await api.get(`/holidays?${params.toString()}`);
      setHolidays(response.data);
    } catch (error) {
      toast.error('Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);

  const groupedHolidays = holidays.reduce((acc, holiday) => {
    const month = dayjs(holiday.date).format('MMMM');
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {} as Record<string, Holiday[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Holidays</h1>
            <p className="text-muted-foreground">Company holidays and observances</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Holidays</h1>
          <p className="text-muted-foreground">
            Company holidays and observances for {selectedYear}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Regions</SelectItem>
              <SelectItem value="National">National</SelectItem>
              <SelectItem value="West">West</SelectItem>
              <SelectItem value="East">East</SelectItem>
              <SelectItem value="North">North</SelectItem>
              <SelectItem value="South">South</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
        </div>
      </div>

      {Object.keys(groupedHolidays).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedHolidays)
            .sort(([a], [b]) => dayjs(`2024-${a}-01`).diff(dayjs(`2024-${b}-01`)))
            .map(([month, monthHolidays]) => (
              <div key={month}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {month}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthHolidays
                    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
                    .map((holiday) => (
                      <Card key={holiday.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 text-primary rounded-lg p-2">
                                <CalendarDays className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{holiday.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {dayjs(holiday.date).format('dddd, MMM DD')}
                                </p>
                              </div>
                            </div>
                            <Badge variant={
                              holiday.type === 'national' ? 'default' :
                              holiday.type === 'regional' ? 'secondary' : 'outline'
                            }>
                              {holiday.type}
                            </Badge>
                          </div>
                          {holiday.description && (
                            <p className="text-sm text-muted-foreground">{holiday.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No holidays found</h3>
            <p className="text-muted-foreground">
              No holidays are scheduled for the selected filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}