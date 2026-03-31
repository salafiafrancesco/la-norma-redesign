export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeText(value, { fallback = '', trim = true, lowercase = false } = {}) {
  if (value === null || value === undefined) return fallback;

  let nextValue = String(value);
  if (trim) nextValue = nextValue.trim();
  if (lowercase) nextValue = nextValue.toLowerCase();

  return nextValue || fallback;
}

export function normalizeOptionalText(value) {
  const nextValue = normalizeText(value);
  return nextValue || '';
}

export function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

export function normalizeInteger(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function normalizeNumber(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeText(value));
}

export function normalizeIsoDate(value) {
  const nextValue = normalizeText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nextValue)) return '';
  return nextValue;
}

export function cleanObject(input = {}) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );
}

export function normalizeGuestSelection(guests, guestLabel = '') {
  const normalizedLabel = normalizeText(guestLabel);

  if (normalizedLabel) {
    const numeric = Number.parseInt(normalizedLabel, 10);
    return {
      display: normalizedLabel,
      count: Number.isFinite(numeric) ? numeric : null,
      label: normalizedLabel,
    };
  }

  if (typeof guests === 'string' && /\D/.test(guests.trim())) {
    return {
      display: guests.trim(),
      count: null,
      label: guests.trim(),
    };
  }

  const count = normalizeInteger(guests, { min: 1, max: 30, fallback: 1 });
  return {
    display: String(count),
    count,
    label: '',
  };
}
