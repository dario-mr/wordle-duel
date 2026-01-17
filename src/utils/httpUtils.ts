export function isRedirectResponse(res: Response): boolean {
  return res.type === 'opaqueredirect' || (res.status >= 300 && res.status < 400);
}

export function isUnauthenticatedResponse(res: Response): boolean {
  return res.status === 401 || res.status === 403 || isRedirectResponse(res);
}
