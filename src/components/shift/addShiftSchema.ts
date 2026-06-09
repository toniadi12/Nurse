// Validation schema + helpers for AddShiftSheet (F4). Extracted from
// AddShiftSheet.tsx to keep the main file under 300 lines (CLAUDE.md rule).
//
// Error messages MUST be in plain UK English (not zod's default technical
// "Invalid string: must match pattern /.../"). Rule from
// [[senior-users-accessibility]] — older users don't read regex.

import { z } from 'zod';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// 00-23 hours, 00-59 minutes — strict, not just "any digits".
const TIME_24H = /^([01]\d|2[0-3]):[0-5]\d$/;

export const AddShiftSchema = z
  .object({
    date: z
      .string()
      .regex(ISO_DATE, 'Date format: YYYY-MM-DD (e.g. 2026-05-27)'),
    code: z.enum(['P', 'S', 'M', 'L', 'C', 'CUSTOM']),
    startTime: z
      .string()
      .regex(TIME_24H, 'Time format: HH:MM (e.g. 07:00 or 21:30)')
      .optional()
      .or(z.literal('')),
    endTime: z
      .string()
      .regex(TIME_24H, 'Time format: HH:MM (e.g. 15:00 or 07:00)')
      .optional()
      .or(z.literal('')),
    ward: z.string().max(50, 'Max 50 characters').optional(),
    note: z.string().max(200, 'Max 200 characters').optional(),
  })
  .superRefine((data, ctx) => {
    // CUSTOM requires start + end. P/S/M optional (defaults apply).
    if (data.code === 'CUSTOM') {
      if (!data.startTime) {
        ctx.addIssue({
          code: 'custom',
          path: ['startTime'],
          message: 'Start time required for Custom shift',
        });
      }
      if (!data.endTime) {
        ctx.addIssue({
          code: 'custom',
          path: ['endTime'],
          message: 'End time required for Custom shift',
        });
      }
    }
  });

export type AddShiftFormData = z.infer<typeof AddShiftSchema>;

// Normalise time input so users typing "21.00" / "21 00" / "2100" auto-convert
// to "21:00". HP numeric keyboards default delimiter is dot (.), not colon (:).
// Returns string as-is if no normalisable pattern matches.
export function normalizeTimeInput(raw: string): string {
  const trimmed = raw.trim();
  // Replace dot / space → colon. Covers common patterns:
  // "21.00" → "21:00", "21 00" → "21:00"
  const dotReplaced = trimmed.replace(/[.\s]/g, ':');
  // "2100" without separator → "21:00" (4 digits).
  if (/^\d{4}$/.test(dotReplaced)) {
    return `${dotReplaced.slice(0, 2)}:${dotReplaced.slice(2)}`;
  }
  return dotReplaced;
}
