"use client";

import { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { HolidayEvent, indianNationalHolidays, generateIndianHolidays } from '@/lib/indian-holidays';
import { useAuth } from '@/lib/auth-context';

// Setup moment localizer
moment.locale('en');
const localizer = momentLocalizer(moment);

export default function HolidaysPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<HolidayEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<HolidayEvent | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form state for adding/editing holidays
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    type: 'national' as 'national' | 'regional' | 'optional',
    description: '',
  });

  // Load holidays on component mount
  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = () => {
    // Load Indian national holidays for current year ± 2 years
    const currentYear = new Date().getFullYear();
    const indianHolidays = generateIndianHolidays(currentYear - 2, currentYear + 2);
    
    // Load custom holidays from localStorage
    const customHolidays = JSON.parse(localStorage.getItem('customHolidays') || '[]');
    
    setEvents([...indianHolidays, ...customHolidays]);
  };

  const saveCustomHolidays = (customHolidays: HolidayEvent[]) => {
    localStorage.setItem('customHolidays', JSON.stringify(customHolidays));
  };

  const handleAddHoliday = () => {
    if (!formData.title || !formData.startDate) {
      toast.error('Please fill in required fields');
      return;
    }

    const newHoliday: HolidayEvent = {
      id: `custom-${Date.now()}`,
      title: formData.title,
      start: new Date(formData.startDate),
      end: new Date(formData.endDate || formData.startDate),
      type: formData.type,
      description: formData.description,
      isIndianHoliday: false,
    };

    const customHolidays = JSON.parse(localStorage.getItem('customHolidays') || '[]');
    customHolidays.push(newHoliday);
    saveCustomHolidays(customHolidays);
    
    setEvents(prev => [...prev, newHoliday]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Holiday added successfully');
  };

  const handleEditHoliday = () => {
    if (!selectedEvent || !formData.title || !formData.startDate) {
      toast.error('Please fill in required fields');
      return;
    }

    // Don't allow editing Indian holidays
    if (selectedEvent.isIndianHoliday) {
      toast.error('Cannot edit Indian national holidays');
      return;
    }

    const updatedHoliday: HolidayEvent = {
      ...selectedEvent,
      title: formData.title,
      start: new Date(formData.startDate),
      end: new Date(formData.endDate || formData.startDate),
      type: formData.type,
      description: formData.description,
    };

    const customHolidays = JSON.parse(localStorage.getItem('customHolidays') || '[]');
    const updatedCustomHolidays = customHolidays.map((h: HolidayEvent) => 
      h.id === selectedEvent.id ? updatedHoliday : h
    );
    saveCustomHolidays(updatedCustomHolidays);
    
    setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedHoliday : e));
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
    resetForm();
    toast.success('Holiday updated successfully');
  };

  const handleDeleteHoliday = (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    // Don't allow deleting Indian holidays
    if (eventToDelete.isIndianHoliday) {
      toast.error('Cannot delete Indian national holidays');
      return;
    }

    const customHolidays = JSON.parse(localStorage.getItem('customHolidays') || '[]');
    const updatedCustomHolidays = customHolidays.filter((h: HolidayEvent) => h.id !== eventId);
    saveCustomHolidays(updatedCustomHolidays);
    
    setEvents(prev => prev.filter(e => e.id !== eventId));
    toast.success('Holiday deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      startDate: '',
      endDate: '',
      type: 'national',
      description: '',
    });
  };

  const openEditDialog = (event: HolidayEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      startDate: moment(event.start).format('YYYY-MM-DD'),
      endDate: moment(event.end).format('YYYY-MM-DD'),
      type: event.type,
      description: event.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const eventStyleGetter = (event: HolidayEvent) => {
    let backgroundColor = '#3174ad';
    
    if (event.type === 'national') {
      backgroundColor = event.isIndianHoliday ? '#dc2626' : '#059669';
    } else if (event.type === 'regional') {
      backgroundColor = '#7c3aed';
    } else if (event.type === 'optional') {
      backgroundColor = '#ea580c';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const onSelectEvent = (event: HolidayEvent) => {
    setSelectedEvent(event);
  };

  const onSelectSlot = (slotInfo: any) => {
    if (user?.role === 'hr' || user?.role === 'admin') {
      setFormData({
        title: '',
        startDate: moment(slotInfo.start).format('YYYY-MM-DD'),
        endDate: moment(slotInfo.end).subtract(1, 'day').format('YYYY-MM-DD'),
        type: 'national',
        description: '',
      });
      setIsAddDialogOpen(true);
    }
  };

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Holiday Calendar</h1>
          <p className="text-muted-foreground">
            Indian National Holidays and Company Holidays
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={currentView} onValueChange={(value) => setCurrentView(value as View)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Views.MONTH}>Month</SelectItem>
              <SelectItem value={Views.WEEK}>Week</SelectItem>
              <SelectItem value={Views.DAY}>Day</SelectItem>
              <SelectItem value={Views.AGENDA}>Agenda</SelectItem>
            </SelectContent>
          </Select>
          
          {(user?.role === 'hr' || user?.role === 'admin') && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Holiday</DialogTitle>
                  <DialogDescription>
                    Add a custom holiday to the calendar
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Holiday Name *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter holiday name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
        </div>
      </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                              </div>
                              <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter holiday description"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddHoliday}>
                      Add Holiday
                    </Button>
                              </div>
                            </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
                          </div>

      <Card>
        <CardContent className="p-6">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            defaultDate={defaultDate}
            scrollToTime={scrollToTime}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
            selectable={user?.role === 'hr' || user?.role === 'admin'}
            popup
            showMultiDayTimes
          />
                        </CardContent>
                      </Card>

      {/* Holiday Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Holiday Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-sm">Indian National Holidays</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm">Custom National Holidays</span>
            </div>
                            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span className="text-sm">Regional Holidays</span>
                              </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-600 rounded"></div>
              <span className="text-sm">Optional Holidays</span>
                </div>
              </div>
          </CardContent>
        </Card>

      {/* Holiday Details Dialog */}
      <Dialog open={!!selectedEvent && !isEditDialogOpen} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Holiday Details
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p>{moment(selectedEvent.start).format('MMMM DD, YYYY')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                            <Badge variant={
                    selectedEvent.type === 'national' ? 'default' :
                    selectedEvent.type === 'regional' ? 'secondary' : 'outline'
                            }>
                    {selectedEvent.type}
                            </Badge>
                          </div>
              </div>
              {selectedEvent.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.isIndianHoliday && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Indian National Holiday
                </div>
              )}
              {(user?.role === 'hr' || user?.role === 'admin') && !selectedEvent.isIndianHoliday && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(selectedEvent)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteHoliday(selectedEvent.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Holiday Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
            <DialogDescription>
              Update holiday information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Holiday Name *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter holiday name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter holiday description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditHoliday}>
                Update Holiday
              </Button>
            </div>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}