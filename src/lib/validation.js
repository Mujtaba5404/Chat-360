import { hasLength, isEmail, isNotEmpty } from '@mantine/form';

/** Reusable form rules (compatible with @mantine/form `validate`). */
export const rules = {
  required: (label) => isNotEmpty(`${label} is required`),
  name: (label = 'Name') => hasLength({ min: 2, max: 80 }, `${label} must be 2–80 characters`),
  email: isEmail('Enter a valid email address'),
  domain: (value) =>
    /^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,}$/i.test(value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
      ? null
      : 'Enter a valid domain, e.g. example.com',
  shortcut: (value) => (/^[a-z0-9-]{2,24}$/.test(value) ? null : 'Use 2–24 lowercase letters, numbers or dashes'),
  /** Fails when another record (different id) already uses the value. */
  unique: (items, field, currentId, message) => (value) =>
    items.some((item) => item.id !== currentId && String(item[field]).toLowerCase() === value.trim().toLowerCase())
      ? message
      : null,
};

/** Combines several rules; the first error wins. */
export const all =
  (...validators) =>
  (value, values) => {
    for (const validate of validators) {
      const error = validate(value, values);
      if (error) return error;
    }
    return null;
  };

export const normalizeDomain = (value) => value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
