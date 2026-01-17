function toBaseUrl(base: string): URL {
  const url = base.startsWith('http') ? new URL(base) : new URL(base, window.location.origin);

  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }

  return url;
}

export function joinUrl(base: string, path: string): string {
  const baseUrl = toBaseUrl(base);
  const normalizedPath = path.replace(/^\//, '');
  return new URL(normalizedPath, baseUrl).toString();
}
