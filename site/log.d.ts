/** Types for site/log.js, the landing page's reading of the city's public log. */
export type LogLine = { text: string; when: string };
export function ago(at: number, now: number): string;
export function logLines(events: unknown, now: number): LogLine[];
export function mountCityLog(doc?: Document, fetcher?: typeof fetch, now?: () => number): Promise<number>;
