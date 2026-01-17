export function sanitizeReturnTo(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (!value.startsWith('/')) {
    return null;
  }

  if (value.startsWith('//') || value.includes('://') || value.includes('\\')) {
    return null;
  }

  return value;
}
