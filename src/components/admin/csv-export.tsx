"use client";

interface CsvExportProps<T> {
  data: T[];
  filename: string;
  columns: { key: string; label: string }[];
  label?: string;
}

export function CsvExport<T>({ data, filename, columns, label = "CSV" }: CsvExportProps<T>) {
  const handleExport = () => {
    const header = columns.map((c) => `"${c.label}"`).join(",");
    const rows = data.map((item) =>
      columns.map((c) => {
        const val = (item as Record<string, unknown>)[c.key];
        const str = val == null ? "" : String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground/80"
    >
      {label}
    </button>
  );
}
