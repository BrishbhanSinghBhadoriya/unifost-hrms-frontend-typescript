import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initialize dayjs plugins locally for date/time helpers
dayjs.extend(utc);
dayjs.extend(timezone);

// Formats a date/time value to IST. If `time` is an ISO string (contains 'T'),
// the `date` parameter is ignored. When `includeDate` is true, returns
// "DD MMM YYYY, hh:mm A"; otherwise returns "hh:mm A".
export function formatDateTimeIST(date?: string, time?: string, includeDate: boolean = true): string {
  if (!time) return '-';

  // If time looks like ISO or a parseable date-time, treat it as UTC and convert to IST
  const isIsoLike = time.includes('T') || /GMT\+?0{4}/i.test(time) || dayjs(time).isValid();
  const effectiveDate = dayjs(date).isValid() ? dayjs(date).format('YYYY-MM-DD') : String(date || '').slice(0, 10);

  let dt;
  if (isIsoLike) {
    dt = dayjs.utc(time).tz('Asia/Kolkata');
  } else {
    dt = dayjs.tz(`${effectiveDate} ${time}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
  }

  if (!dt || !dt.isValid()) return '-';
  return includeDate ? dt.format('DD MMM YYYY, hh:mm A') : dt.format('hh:mm A');
}
