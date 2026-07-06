export const fireAndForget = (label: string) => (err: unknown) => {
  console.error(`[fire-and-forget] ${label}:`, err instanceof Error ? err.message : err);
};