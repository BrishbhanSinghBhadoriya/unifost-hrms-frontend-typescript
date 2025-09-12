import moment from 'moment';

export interface HolidayEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'national' | 'regional' | 'optional';
  description?: string;
  isIndianHoliday: boolean;
}

// Indian National Holidays for 2024
export const indianNationalHolidays: HolidayEvent[] = [
  {
    id: 'republic-day',
    title: 'Republic Day',
    start: moment('2024-01-26').toDate(),
    end: moment('2024-01-26').toDate(),
    type: 'national',
    description: 'Constitution of India came into effect',
    isIndianHoliday: true,
  },
  {
    id: 'independence-day',
    title: 'Independence Day',
    start: moment('2024-08-15').toDate(),
    end: moment('2024-08-15').toDate(),
    type: 'national',
    description: 'India gained independence from British rule',
    isIndianHoliday: true,
  },
  {
    id: 'gandhi-jayanti',
    title: 'Gandhi Jayanti',
    start: moment('2024-10-02').toDate(),
    end: moment('2024-10-02').toDate(),
    type: 'national',
    description: 'Birth anniversary of Mahatma Gandhi',
    isIndianHoliday: true,
  },
  {
    id: 'holi',
    title: 'Holi',
    start: moment('2024-03-25').toDate(),
    end: moment('2024-03-25').toDate(),
    type: 'national',
    description: 'Festival of Colors',
    isIndianHoliday: true,
  },
  {
    id: 'diwali',
    title: 'Diwali',
    start: moment('2024-11-01').toDate(),
    end: moment('2024-11-01').toDate(),
    type: 'national',
    description: 'Festival of Lights',
    isIndianHoliday: true,
  },
  {
    id: 'dussehra',
    title: 'Dussehra',
    start: moment('2024-10-12').toDate(),
    end: moment('2024-10-12').toDate(),
    type: 'national',
    description: 'Victory of good over evil',
    isIndianHoliday: true,
  },
  {
    id: 'eid-ul-fitr',
    title: 'Eid-ul-Fitr',
    start: moment('2024-04-10').toDate(),
    end: moment('2024-04-10').toDate(),
    type: 'national',
    description: 'End of Ramadan',
    isIndianHoliday: true,
  },
  {
    id: 'eid-ul-adha',
    title: 'Eid-ul-Adha',
    start: moment('2024-06-17').toDate(),
    end: moment('2024-06-17').toDate(),
    type: 'national',
    description: 'Festival of Sacrifice',
    isIndianHoliday: true,
  },
  {
    id: 'christmas',
    title: 'Christmas',
    start: moment('2024-12-25').toDate(),
    end: moment('2024-12-25').toDate(),
    type: 'national',
    description: 'Birth of Jesus Christ',
    isIndianHoliday: true,
  },
  {
    id: 'guru-nanak-jayanti',
    title: 'Guru Nanak Jayanti',
    start: moment('2024-11-15').toDate(),
    end: moment('2024-11-15').toDate(),
    type: 'national',
    description: 'Birth anniversary of Guru Nanak',
    isIndianHoliday: true,
  },
];

// Generate holidays for multiple years
export const generateIndianHolidays = (startYear: number, endYear: number): HolidayEvent[] => {
  const holidays: HolidayEvent[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    indianNationalHolidays.forEach(holiday => {
      const newHoliday: HolidayEvent = {
        ...holiday,
        id: `${holiday.id}-${year}`,
        start: moment(holiday.start).year(year).toDate(),
        end: moment(holiday.end).year(year).toDate(),
      };
      holidays.push(newHoliday);
    });
  }
  
  return holidays;
};
