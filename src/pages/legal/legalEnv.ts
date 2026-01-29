function requiredEnv(name: string): string {
  const value: unknown = (import.meta.env as unknown as Record<string, unknown>)[name];

  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return `[set ${name}]`;
}

export const LEGAL = {
  operatorName: requiredEnv('VITE_PUBLIC_OPERATOR_NAME'),
  contactEmail: requiredEnv('VITE_PUBLIC_CONTACT_EMAIL'),
  effectiveDate: requiredEnv('VITE_PUBLIC_EFFECTIVE_DATE'),
  country: requiredEnv('VITE_PUBLIC_COUNTRY'),
} as const;
