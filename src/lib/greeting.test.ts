// Test for getTimeBasedGreeting.
// Use `new Date(YYYY-MM-DDTHH:MM:SS)` (no timezone suffix = local time)
// so we can target a specific hour without worrying about UTC offset.

import { getTimeBasedGreeting } from './greeting';

describe('getTimeBasedGreeting', () => {
  it('returns "Good morning" between 04:00 and 11:59', () => {
    expect(getTimeBasedGreeting(new Date('2026-05-27T04:00:00'))).toBe('Good morning');
    expect(getTimeBasedGreeting(new Date('2026-05-27T07:30:00'))).toBe('Good morning');
    expect(getTimeBasedGreeting(new Date('2026-05-27T11:59:00'))).toBe('Good morning');
  });

  it('returns "Good afternoon" between 12:00 and 17:59', () => {
    expect(getTimeBasedGreeting(new Date('2026-05-27T12:00:00'))).toBe('Good afternoon');
    expect(getTimeBasedGreeting(new Date('2026-05-27T14:30:00'))).toBe('Good afternoon');
    expect(getTimeBasedGreeting(new Date('2026-05-27T17:59:00'))).toBe('Good afternoon');
  });

  it('returns "Good evening" between 18:00 and 21:59', () => {
    expect(getTimeBasedGreeting(new Date('2026-05-27T18:00:00'))).toBe('Good evening');
    expect(getTimeBasedGreeting(new Date('2026-05-27T20:00:00'))).toBe('Good evening');
    expect(getTimeBasedGreeting(new Date('2026-05-27T21:59:00'))).toBe('Good evening');
  });

  it('returns "Working late?" between 22:00 and 03:59 (wraps midnight)', () => {
    expect(getTimeBasedGreeting(new Date('2026-05-27T22:00:00'))).toBe('Working late?');
    expect(getTimeBasedGreeting(new Date('2026-05-27T23:30:00'))).toBe('Working late?');
    expect(getTimeBasedGreeting(new Date('2026-05-27T00:00:00'))).toBe('Working late?');
    expect(getTimeBasedGreeting(new Date('2026-05-27T03:59:00'))).toBe('Working late?');
  });

  it('defaults to current time when called without an argument', () => {
    // Don't assert a specific value (depends on when test runs) —
    // just check it returns one of the 4 valid greetings.
    const result = getTimeBasedGreeting();
    expect(['Good morning', 'Good afternoon', 'Good evening', 'Working late?']).toContain(result);
  });
});
