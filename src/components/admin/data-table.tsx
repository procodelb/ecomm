"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface Column<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sort?: string;
  dir?: string;
  onSort?: (key: string) => void;
  getRowLink?: (item: T) => string;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

function getVal<T>(item: T, key: string): string {
  const val = (item as Record<string, unknown>)[key];
  return val == null ? "" : String(val);
}

export function DataTable<T>({
  columns, data, sort, dir, onSort, getRowLink, keyExtractor, emptyMessage = "No data",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className="px-5 py-12 text-center text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("px-5 py-3", col.sortable && "cursor-pointer select-none hover:text-foreground/50", col.className)}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sort === col.key && (
                    <span className="text-primary">{dir === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const cells = (isLinked: boolean) => columns.map((col) => (
              <td key={col.key as string} className={cn("px-5 py-3", col.className)}>
                {isLinked ? (
                  <Link href={getRowLink!(item)} className="block text-foreground/80 hover:text-foreground transition-colors">
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode ?? ""}
                  </Link>
                ) : (
                  col.render ? col.render(item) : getVal(item, col.key)
                )}
              </td>
            ));
            return (
              <tr key={keyExtractor(item)} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                {getRowLink ? cells(true) : cells(false)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
