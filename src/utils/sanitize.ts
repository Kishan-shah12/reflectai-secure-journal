/**
 * Sanitizes an object by recursively removing all undefined values.
 * Essential for zero-crash Firestore serialization.
 */
export function stripUndefined<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? stripUndefined(item) : item)) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !(value instanceof Date) && typeof value.toDate !== 'function') {
        result[key] = stripUndefined(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}
