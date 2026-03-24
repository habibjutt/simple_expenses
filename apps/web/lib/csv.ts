/** RFC 4180-style CSV cell escaping */
export const escapeCsvCell = (value: string | number | null | undefined): string => {
  const s = value == null ? "" : String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export const toCsvRow = (cells: (string | number | null | undefined)[]): string =>
  cells.map(escapeCsvCell).join(",");
