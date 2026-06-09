// Tests for whatsapp.ts — focus on phone normalisation (most error-prone)
// and message template (regression check if template changes).

import {
  normalizePhoneForWhatsApp,
  buildSwapMessage,
  buildWhatsAppLink,
  buildAutoSwapPlan,
} from './whatsapp';

describe('normalizePhoneForWhatsApp', () => {
  it('local 07xx UK format → 447xx', () => {
    expect(normalizePhoneForWhatsApp('07123456789')).toBe('447123456789');
  });

  it('international +44 → strip the plus', () => {
    expect(normalizePhoneForWhatsApp('+447123456789')).toBe('447123456789');
  });

  it('44 without plus → leave as is', () => {
    expect(normalizePhoneForWhatsApp('447123456789')).toBe('447123456789');
  });

  it('short 7xx format → prepend 44', () => {
    expect(normalizePhoneForWhatsApp('7123456789')).toBe('447123456789');
  });

  it('strip dashes and spaces', () => {
    expect(normalizePhoneForWhatsApp('07123 456 789')).toBe('447123456789');
    expect(normalizePhoneForWhatsApp('+44 7123 456 789')).toBe('447123456789');
    expect(normalizePhoneForWhatsApp('(07123) 456-789')).toBe('447123456789');
  });

  it('too short → null', () => {
    expect(normalizePhoneForWhatsApp('0712345')).toBeNull();
    expect(normalizePhoneForWhatsApp('123')).toBeNull();
  });

  it('non-numeric or empty → null', () => {
    expect(normalizePhoneForWhatsApp('abc')).toBeNull();
    expect(normalizePhoneForWhatsApp('')).toBeNull();
  });
});

describe('buildSwapMessage', () => {
  it('without colleague shift info — minimal valid message', () => {
    const msg = buildSwapMessage({
      myName: 'Rina',
      colleagueName: 'Maya',
      myShiftDate: '2026-05-28',
      myShiftCode: 'P',
    });
    expect(msg).toContain('Hi Maya,');
    expect(msg).toContain('Rina');
    expect(msg).toContain('Morning');
    expect(msg).toContain('28 May 2026');
    expect(msg).not.toContain("I'd like to take");
  });

  it("with colleague shift info — includes 'I'd like to take' line", () => {
    const msg = buildSwapMessage({
      myName: 'Rina',
      colleagueName: 'Maya',
      myShiftDate: '2026-05-28',
      myShiftCode: 'P',
      colleagueShiftDate: '2026-05-30',
      colleagueShiftCode: 'S',
    });
    expect(msg).toContain("I'd like to take your Afternoon shift");
    expect(msg).toContain('30 May 2026');
  });
});

describe('buildWhatsAppLink', () => {
  it('encodes message into wa.me URL', () => {
    const link = buildWhatsAppLink('447123456789', 'Hi there');
    expect(link).toBe('https://wa.me/447123456789?text=Hi%20there');
  });

  it('encodes special characters (newline, question mark)', () => {
    const link = buildWhatsAppLink('447123456789', 'Hi?\nTwoLines');
    expect(link).toContain('Hi%3F%0ATwoLines');
  });
});

describe('buildAutoSwapPlan', () => {
  it('without colleague info → only myDateToLibur', () => {
    const plan = buildAutoSwapPlan({ myShiftDate: '2026-05-28' });
    expect(plan.myDateToLibur).toBe('2026-05-28');
    expect(plan.newShift).toBeUndefined();
  });

  it('with colleague info → newShift set', () => {
    const plan = buildAutoSwapPlan({
      myShiftDate: '2026-05-28',
      colleagueShiftDate: '2026-05-30',
      colleagueShiftCode: 'S',
    });
    expect(plan.myDateToLibur).toBe('2026-05-28');
    expect(plan.newShift).toEqual({ date: '2026-05-30', code: 'S' });
  });
});
