/**
 * Booking Calendar Utility Functions
 *
 * Operating hours, slot generation, Czech date helpers
 */

import type { DayHours, OperatingHours } from '@/types/booking';

// =====================================================
// DEFAULT OPERATING HOURS
// =====================================================

export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday:    { open: '18:00', close: '22:00' },
  tuesday:   { open: '18:00', close: '22:00' },
  wednesday: { open: '18:00', close: '22:00' },
  thursday:  { open: '18:00', close: '22:00' },
  friday:    { open: '17:00', close: '23:00' },
  saturday:  { open: '10:00', close: '23:00' },
  sunday:    { open: '10:00', close: '23:00' },
};

// =====================================================
// CZECH LOCALE HELPERS
// =====================================================

export const CZECH_DAY_NAMES = [
  'Neděle', 'Pondělí', 'Úterý', 'Středa',
  'Čtvrtek', 'Pátek', 'Sobota',
] as const;

export const CZECH_DAY_NAMES_SHORT = [
  'Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So',
] as const;

export const CZECH_MONTH_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
] as const;

// Map JS day index (0=Sun) to English name used in OperatingHours
const DAY_INDEX_TO_NAME: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

// =====================================================
// DATE HELPERS
// =====================================================

/**
 * Get English day name from date string "YYYY-MM-DD"
 */
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return DAY_INDEX_TO_NAME[date.getDay()];
}

/**
 * Get Czech day name from date string
 */
export function getCzechDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return CZECH_DAY_NAMES[date.getDay()];
}

/**
 * Check if a date string is in the past
 */
export function isDatePast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  return date < today;
}

/**
 * Format date as "YYYY-MM-DD"
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// =====================================================
// OPERATING HOURS
// =====================================================

/**
 * Get operating hours for a specific date
 */
export function getOperatingHoursForDate(
  dateStr: string,
  customHours?: OperatingHours | null
): DayHours | null {
  const hours = customHours || DEFAULT_OPERATING_HOURS;
  const dayName = getDayName(dateStr);
  return hours[dayName] || null;
}

// =====================================================
// SLOT GENERATION
// =====================================================

/**
 * Generate 1-hour time slots from operating hours
 * e.g. "18:00"-"22:00" → ["18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"]
 */
export function generateSlots(dayHours: DayHours): Array<{ start: string; end: string }> {
  const slots: Array<{ start: string; end: string }> = [];
  const [openH, openM] = dayHours.open.split(':').map(Number);
  const [closeH, closeM] = dayHours.close.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  for (let m = openMinutes; m + 60 <= closeMinutes; m += 60) {
    const startH = Math.floor(m / 60).toString().padStart(2, '0');
    const startM = (m % 60).toString().padStart(2, '0');
    const endH = Math.floor((m + 60) / 60).toString().padStart(2, '0');
    const endM = ((m + 60) % 60).toString().padStart(2, '0');
    slots.push({ start: `${startH}:${startM}`, end: `${endH}:${endM}` });
  }

  return slots;
}

/**
 * Get all dates in a month as "YYYY-MM-DD" strings
 */
export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    dates.push(formatDate(date));
  }
  return dates;
}
