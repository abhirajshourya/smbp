import { type Row, isMemberColumn, toKey } from '@/hooks/useSplitManager';

export type BillCalculations = {
  calculateSubtotal: (row: Row) => string;
  calculateMemberShare: (row: Row, column: string) => string;
  calculateMemberTotal: (column: string) => string;
  calculateTotal: () => string;
};

export type ShareableBillState = {
  rows: Row[];
  columns: string[];
  billTotal: string;
};

export type ReceiptTag = {
  label: string;
  tone: 'discount' | 'tax';
};

export type ReceiptItem = {
  name: string;
  amount: string;
  splitWith: string;
  tags: ReceiptTag[];
};

export type ReceiptData = {
  date: string;
  items: ReceiptItem[];
  total: string;
  memberTotals: { name: string; amount: string }[];
};

// Shared shape for the image/PDF receipt renderers — a purpose-built layout,
// not a screenshot of the live table, so it stays legible and consistent
// regardless of what's on screen at export time.
export function buildReceiptData(
  rows: Row[],
  columns: string[],
  { calculateSubtotal, calculateMemberShare, calculateMemberTotal, calculateTotal }: BillCalculations
): ReceiptData {
  const memberColumns = columns.filter(isMemberColumn);

  const items = rows.map((row) => {
    const splitWith = memberColumns.filter((col) => parseFloat(calculateMemberShare(row, col)) > 0);
    const discount = parseFloat(row.discount) || 0;
    const tax = parseFloat(row.tax) || 0;
    const tags: ReceiptTag[] = [];
    if (discount > 0) tags.push({ label: `−${discount}% off`, tone: 'discount' });
    if (tax > 0) tags.push({ label: `+${tax}% tax`, tone: 'tax' });
    return {
      name: row.item?.trim() || 'Item',
      amount: calculateSubtotal(row),
      splitWith: splitWith.length > 0 ? splitWith.join(', ') : '—',
      tags,
    };
  });

  const memberTotals = memberColumns.map((col) => ({
    name: col,
    amount: calculateMemberTotal(col),
  }));

  return {
    date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    items,
    total: calculateTotal(),
    memberTotals,
  };
}

// Plain-text breakdown, formatted to be pasted straight into a chat with
// friends: each item's subtotal and who's splitting it, then the grand
// total and what everyone owes.
export function buildTextSummary(
  rows: Row[],
  columns: string[],
  { calculateSubtotal, calculateMemberShare, calculateMemberTotal, calculateTotal }: BillCalculations
): string {
  const memberColumns = columns.filter(isMemberColumn);
  const lines: string[] = ['Split My Bill Plz', ''];

  rows.forEach((row) => {
    const name = row.item?.trim() || 'Item';
    lines.push(`${name} — $${calculateSubtotal(row)}`);
    const shares = memberColumns
      .map((col) => {
        const share = parseFloat(calculateMemberShare(row, col));
        return share > 0 ? `${col} $${share.toFixed(2)}` : null;
      })
      .filter((s): s is string => s !== null);
    if (shares.length > 0) lines.push(`  ${shares.join(' · ')}`);
  });

  lines.push('', `Total: $${calculateTotal()}`);
  memberColumns.forEach((col) => {
    lines.push(`${col} owes $${calculateMemberTotal(col)}`);
  });

  return lines.join('\n');
}

const escapeCsvValue = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

// CSV keeps every raw column value as-is except Sub-Total, which is never
// actually written to row data (BillTable only ever displays it, computed
// live) so it has to come from calculateSubtotal instead.
export function buildCsv(
  rows: Row[],
  columns: string[],
  calculateSubtotal: (row: Row) => string
): string {
  const header = columns.map(escapeCsvValue).join(',');
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const key = toKey(col);
        const value = key === 'sub-total' ? calculateSubtotal(row) : row[key] ?? '';
        return escapeCsvValue(value);
      })
      .join(',')
  );
  return [header, ...lines].join('\n');
}

// No backend to host a shared bill, so the link carries the state itself —
// base64 of the JSON blob in a query param. encodeURIComponent first so
// btoa (Latin1-only) can safely round-trip any Unicode in item/member names.
export function encodeShareLink(state: ShareableBillState): string {
  const json = JSON.stringify(state);
  const encoded = window.btoa(encodeURIComponent(json));
  return `${window.location.origin}/split?shared=${encoded}`;
}

export function decodeShareLink(encoded: string): ShareableBillState | null {
  try {
    const json = decodeURIComponent(window.atob(encoded));
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed.rows) || !Array.isArray(parsed.columns)) return null;
    return {
      rows: parsed.rows,
      columns: parsed.columns,
      billTotal: typeof parsed.billTotal === 'string' ? parsed.billTotal : '',
    };
  } catch {
    return null;
  }
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
