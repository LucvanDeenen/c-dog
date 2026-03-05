export function toEnum<T extends Record<string, string>>(
  enumObj: T,
  value: string,
  fallback: T[keyof T]
): T[keyof T] {
  const entries = Object.values(enumObj) as string[];
  return entries.includes(value) ? (value as T[keyof T]) : fallback;
}
