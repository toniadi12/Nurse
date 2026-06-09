// Time-based greeting in UK English.
// Hour ranges per DESIGN.md section 11.
//
// Used in:
//   - Onboarding step 1 (name input)
//   - Home hero card (F5)
//
// Pure function (with `date` param) — easy to unit test for each time range
// without mocking Date.now(). Defaults to now if called without arguments.

const MORNING_START_HOUR = 4; //  04:00 — morning starts
const AFTERNOON_START_HOUR = 12; // 12:00 — afternoon starts
const EVENING_START_HOUR = 18; //  18:00 — evening starts
const NIGHT_START_HOUR = 22; //    22:00 — late night

export function getTimeBasedGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= MORNING_START_HOUR && hour < AFTERNOON_START_HOUR) {
    return 'Good morning';
  }
  if (hour >= AFTERNOON_START_HOUR && hour < EVENING_START_HOUR) {
    return 'Good afternoon';
  }
  if (hour >= EVENING_START_HOUR && hour < NIGHT_START_HOUR) {
    return 'Good evening';
  }
  // 22:00 – 03:59
  return 'Working late?';
}
