export function parsePageSegment(segment: string): number | null {
  const match = /^page-(\d+)$/.exec(segment);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isInteger(value) || value < 2) return null;
  return value;
}

export function pageHref(basePath: string, page: number, search?: string): string {
  const path = page <= 1 ? basePath : `${basePath}/page-${page}`;
  return search ? `${path}?${search}` : path;
}

export function resolvePageFromPathname(pathname: string, basePath: string): number {
  if (pathname === basePath) return 1;
  const prefix = `${basePath}/`;
  if (!pathname.startsWith(prefix)) return 1;
  const parsed = parsePageSegment(pathname.slice(prefix.length));
  return parsed ?? 1;
}

export function buildPageParams(maxPage: number): { page: string }[] {
  const params: { page: string }[] = [];
  for (let page = 2; page <= maxPage; page++) {
    params.push({ page: `page-${page}` });
  }
  return params;
}

export function buildSearchString(params: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value) search.set(key, value);
  }
  return search.toString();
}
