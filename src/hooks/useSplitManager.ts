import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type Row = {
  id: string;
  [key: string]: string;
};

const initialColumns = ['Item', 'Quantity', 'Unit', 'Price', 'Discount', 'Tax', 'Sub-Total'];
const units = ['kg', 'g', 'lb', 'oz', 'ea'];

export const toKey = (col: string) => col.toLowerCase().replace(' ', '');

export const predefinedColumnKeys = [
  'item',
  'quantity',
  'unit',
  'price',
  'discount',
  'tax',
  'sub-total',
  'total',
];

export const isMemberColumn = (col: string) => !predefinedColumnKeys.includes(toKey(col));

// Plain `.toFixed(2)` on a raw float can round the wrong way at a .xx5
// boundary (e.g. (1.005).toFixed(2) === '1.00') because 1.005 isn't exactly
// representable in binary floating point and is actually stored as
// 1.00499999999999989... Nudging by an epsilon that scales with the value's
// magnitude (rather than a fixed Number.EPSILON, which is too small to
// matter once the number is more than ~1) corrects that representation
// error without affecting genuinely different values.
const round2 = (value: number) => Math.round((value + Number.EPSILON * Math.abs(value) * 4) * 100) / 100;

const useSplitManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>(initialColumns);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [globalTax, setGlobalTax] = useState<number>(0);
  const [billTotal, setBillTotal] = useState<string>('');

  const addRow = () => {
    const newRow: Row = { id: uuidv4() };
    columns.forEach((col) => {
      const key = toKey(col);
      if (key === 'quantity') {
        newRow[key] = '1';
      } else if (key === 'discount') {
        newRow[key] = globalDiscount ? globalDiscount.toString() : '';
      } else if (key === 'tax') {
        newRow[key] = globalTax ? globalTax.toString() : '';
      } else {
        newRow[key] = '';
      }
    });
    setRows([...rows, newRow]);
  };

  const deleteRow = (rowId: string) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const addColumn = (newColumn: string) => {
    setColumns([...columns, newColumn]);
    setRows(
      rows.map((row) => ({
        ...row,
        [toKey(newColumn)]: '',
      }))
    );
  };

  const deleteColumn = (column: string) => {
    const updatedColumns = columns.filter((col) => col !== column);
    setColumns(updatedColumns);
    setRows(
      rows.map((row) => {
        // Destructure-and-discard: pulls the deleted column's key out of the
        // row so `rest` is the row without it. `_` is deliberately unused.
        const { [toKey(column)]: _, ...rest } = row;
        return { id: row.id, ...rest };
      })
    );
  };

  const updateRow = (rowId: string, column: string, value: string) => {
    setRows(rows.map((row) => (row.id === rowId ? { ...row, [toKey(column)]: value } : row)));
  };

  // Toggles whether a member is included in a row's split, dividing 100% evenly
  // across however many members end up included (leftover cents surface via
  // calculateAmountRemaining, same as a manual split that doesn't add to 100%).
  const toggleMemberInclusion = (rowId: string, memberKey: string) => {
    const memberKeys = columns.filter(isMemberColumn).map(toKey);

    setRows(
      rows.map((row) => {
        if (row.id !== rowId) return row;

        const isIncluded = (key: string) => {
          const value = parseFloat(row[key]);
          return !isNaN(value) && value > 0;
        };
        const currentlyIncluded = memberKeys.filter(isIncluded);
        const willInclude = currentlyIncluded.includes(memberKey)
          ? currentlyIncluded.filter((key) => key !== memberKey)
          : [...currentlyIncluded, memberKey];

        // (100 / n).toFixed(2) alone can lose or gain a cent of percentage
        // once n doesn't divide 100 evenly to 2 decimals (e.g. n=3 gives
        // 33.33 * 3 = 99.99%, leaving a phantom "amount remaining"). Give
        // the leftover 0.01%-units to as many members as needed (largest-
        // remainder method) so the shares always sum to exactly 100%.
        const n = willInclude.length;
        const base = n > 0 ? Math.floor((100 / n) * 100) / 100 : 0;
        const remainderCount = n > 0 ? Math.round((100 - base * n) * 100) : 0;

        const updatedRow = { ...row };
        memberKeys.forEach((key) => {
          if (!willInclude.includes(key)) {
            updatedRow[key] = '';
            return;
          }
          const position = willInclude.indexOf(key);
          const share = base + (position < remainderCount ? 0.01 : 0);
          updatedRow[key] = share.toFixed(2);
        });
        return updatedRow;
      })
    );
  };

  const calculateSubtotal = (row: Row) => {
    const quantity = parseFloat(row['quantity']) || 0;
    const price = parseFloat(row['price']) || 0;
    const discount = parseFloat(row['discount']) || 0;
    const tax = parseFloat(row['tax']) || 0;
    const subtotal = quantity * price;
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = (subtotal * tax) / 100;
    return round2(subtotal - discountAmount + taxAmount).toFixed(2);
  };

  const calculateTotal = () => {
    return round2(
      rows.reduce((total, row) => total + parseFloat(calculateSubtotal(row)), 0)
    ).toFixed(2);
  };

  const calculateAmountRemaining = (row: Row) => {
    const subtotal = parseFloat(calculateSubtotal(row));
    const totalSplit = columns.reduce((total, col) => {
      if (!isMemberColumn(col)) {
        return total;
      }
      const splitPercent = parseFloat(row[toKey(col)]) || 0;
      return total + (subtotal * splitPercent) / 100;
    }, 0);
    return round2(subtotal - totalSplit).toFixed(2);
  };

  const calculateMemberShare = (row: Row, column: string) => {
    const subtotal = parseFloat(calculateSubtotal(row));
    const percentage = parseFloat(row[toKey(column)]) || 0;
    return round2((subtotal * percentage) / 100).toFixed(2);
  };

  const calculateMemberTotal = (column: string) => {
    return round2(
      rows.reduce((total, row) => total + parseFloat(calculateMemberShare(row, column)), 0)
    ).toFixed(2);
  };

  // How much of the receipt's printed total hasn't been itemized yet — lets
  // a user type the total up front and watch it count down as they add
  // items, catching a missed item or typo before it's the final surprise.
  const calculateAmountLeftToItemize = () => {
    const target = parseFloat(billTotal) || 0;
    return round2(target - parseFloat(calculateTotal())).toFixed(2);
  };

  const applyGlobalDiscount = (discount: number) => {
    setGlobalDiscount(discount);
    setRows(
      rows.map((row) => ({
        ...row,
        discount: discount.toString(),
      }))
    );
  };

  const applyGlobalTax = (tax: number) => {
    setGlobalTax(tax);
    setRows(
      rows.map((row) => ({
        ...row,
        tax: tax.toString(),
      }))
    );
  };

  return {
    rows,
    columns,
    units,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    updateRow,
    toggleMemberInclusion,
    calculateSubtotal,
    calculateTotal,
    calculateAmountRemaining,
    calculateMemberShare,
    calculateMemberTotal,
    calculateAmountLeftToItemize,
    setRows,
    setColumns,
    globalDiscount,
    setGlobalDiscount,
    applyGlobalDiscount,
    globalTax,
    setGlobalTax,
    applyGlobalTax,
    billTotal,
    setBillTotal,
  };
};

export default useSplitManager;
