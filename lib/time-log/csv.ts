// Tiny CSV writer — quotes everything to dodge edge-case parsing in
// downstream spreadsheets. No external dep; the data shape is small.

function quote(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(
  rows: Array<Record<string, unknown>>,
  columns: { key: string; header: string }[],
): string {
  const head = columns.map((c) => quote(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => quote(row[c.key])).join(","))
    .join("\n");
  return body ? `${head}\n${body}\n` : `${head}\n`;
}
