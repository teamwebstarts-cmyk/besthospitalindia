/**
 * Tiny dependency-free validators for mock forms — BestHospitalIndia (A01).
 *
 * Decision D-2 posture (audit/IMPLEMENTATION-GAPS.md §4): controlled forms +
 * hand-rolled validation only — no validation dependency is added.
 * All validators are pure and return an error message string or null.
 */

/** Field values in mock forms; empty string is treated as "missing". */
export type FieldValues = Record<string, string | boolean | undefined>;

/** A validator receives the whole values bag plus the field's own value. */
export type FieldValidator = (
  value: string | boolean | undefined,
  allValues: FieldValues,
) => string | null;

/** Schema maps field name → one validator or a list (all must pass, first error wins). */
export type ValidationSchema = Record<string, FieldValidator | FieldValidator[]>;

/** {field: message} record — empty object when everything passes. */
export type ValidationErrors = Record<string, string>;

// ---------------------------------------------------------------------------
// Individual validators
// ---------------------------------------------------------------------------

/** Coerce a field value to its string form; booleans/undefined become ''. */
function asText(value: string | boolean | undefined): string {
  return typeof value === 'string' ? value : '';
}

/** Value must be present (non-empty after trim for strings). */
export function required(label = 'This field'): FieldValidator {
  return (value) => {
    if (typeof value === 'boolean') return value ? null : `${label} is required`;
    const text = (value ?? '').trim();
    return text.length > 0 ? null : `${label} is required`;
  };
}

/** Lenient email check: something@something.something, no spaces. */
export function email(message = 'Enter a valid email address'): FieldValidator {
  return (value) => {
    const text = asText(value).trim();
    if (text.length === 0) return null; // emptiness is `required`'s job
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? null : message;
  };
}

/**
 * Lenient phone check (demo forms): digits with optional leading +, allowing
 * spaces, hyphens and parentheses; 7–15 digits total. Demo-only — not E.164
 * validation.
 */
export function phone(message = 'Enter a valid phone number'): FieldValidator {
  return (value) => {
    const text = asText(value).trim();
    if (text.length === 0) return null;
    if (!/^\+?[\d\s\-().]+$/.test(text)) return message;
    const digits = text.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15 ? null : message;
  };
}

/** Minimum length (strings only; shorter values fail). */
export function minLength(min: number, message?: string): FieldValidator {
  return (value) => {
    const text = asText(value).trim();
    if (text.length === 0) return null; // emptiness is `required`'s job
    return text.length >= min ? null : message ?? `Must be at least ${min} characters`;
  };
}

/** Maximum length (strings only; longer values fail). */
export function maxLength(max: number, message?: string): FieldValidator {
  return (value) => {
    const text = asText(value).trim();
    return text.length <= max ? null : message ?? `Must be at most ${max} characters`;
  };
}

/**
 * ISO date (yyyy-mm-dd portion) must be today or later. Invalid dates fail.
 * Timestamps are evaluated in local time to match demo date inputs.
 */
export function dateNotInPast(message = 'Choose today or a future date'): FieldValidator {
  return (value) => {
    const text = asText(value).trim();
    if (text.length === 0) return null; // emptiness is `required`'s job
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return message;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfValue = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    return startOfValue.getTime() >= startOfToday.getTime() ? null : message;
  };
}

/** Checkbox-style consent must be exactly true. */
export function consentTrue(message = 'Consent is required to continue'): FieldValidator {
  return (value) => (value === true ? null : message);
}

// ---------------------------------------------------------------------------
// Schema runner
// ---------------------------------------------------------------------------

/**
 * Run a schema against values. Returns a {field: message} record; empty when
 * valid. First failing validator per field wins; validators run in schema
 * insertion order. Never throws — unknown fields are simply not validated.
 */
export function validate(schema: ValidationSchema, values: FieldValues): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const field of Object.keys(schema)) {
    const validators = schema[field];
    const list = Array.isArray(validators) ? validators : [validators];
    for (const check of list) {
      const error = check(values[field], values);
      if (error !== null) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
}
