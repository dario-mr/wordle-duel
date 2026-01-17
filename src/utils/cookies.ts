export function getCookieValue(name: string): string | undefined {
  const raw = document.cookie;
  if (!raw) {
    return undefined;
  }

  const parts = raw.split(';');
  for (const part of parts) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return undefined;
}
