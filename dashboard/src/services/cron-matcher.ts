/**
 * Minimal 5-field cron matcher (minute hour dom month dow)
 * Supports: *, numbers, ranges (1-5), steps (asterisk/5), lists (1,3,5)
 */

export function matchesCron(expression: string, date: Date): boolean {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return false;

  const fields = [
    { value: date.getMinutes(), min: 0, max: 59 },
    { value: date.getHours(), min: 0, max: 23 },
    { value: date.getDate(), min: 1, max: 31 },
    { value: date.getMonth() + 1, min: 1, max: 12 },
    { value: date.getDay(), min: 0, max: 6 },
  ];

  return parts.every((part, i) => matchField(part, fields[i].value, fields[i].min, fields[i].max));
}

function matchField(field: string, value: number, min: number, max: number): boolean {
  return field.split(',').some((segment) => matchSegment(segment.trim(), value, min, max));
}

function matchSegment(segment: string, value: number, min: number, max: number): boolean {
  // Handle step: */n or range/n
  const [rangePart, stepStr] = segment.split('/');
  const step = stepStr ? parseInt(stepStr, 10) : 1;
  if (isNaN(step) || step < 1) return false;

  let start: number, end: number;

  if (rangePart === '*') {
    start = min;
    end = max;
  } else if (rangePart.includes('-')) {
    const [lo, hi] = rangePart.split('-').map(Number);
    if (isNaN(lo) || isNaN(hi)) return false;
    start = lo;
    end = hi;
  } else {
    const num = parseInt(rangePart, 10);
    if (isNaN(num)) return false;
    if (step === 1) return value === num;
    start = num;
    end = max;
  }

  for (let i = start; i <= end; i += step) {
    if (i === value) return true;
  }
  return false;
}

/**
 * Check if a cron expression should fire within a given window (e.g. 15 min)
 */
export function shouldRunInWindow(expression: string, windowStart: Date, windowMinutes = 15): boolean {
  for (let offset = 0; offset < windowMinutes; offset++) {
    const check = new Date(windowStart.getTime() + offset * 60000);
    if (matchesCron(expression, check)) return true;
  }
  return false;
}
