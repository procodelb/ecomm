"use client";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPage: (page: number) => void;
  label?: string;
}

export function Pagination({ page, pages, total, onPage, label = "items" }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-4">
      <span className="text-xs text-muted-foreground">{total} {label}</span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <span className="text-xs text-muted-foreground">
          {page} / {pages}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
