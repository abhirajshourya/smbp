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

const useSplitManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>(initialColumns);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [globalTax, setGlobalTax] = useState<number>(0);

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        const updatedRow = { ...row };
        const evenShare = willInclude.length > 0 ? (100 / willInclude.length).toFixed(2) : '';
        memberKeys.forEach((key) => {
          updatedRow[key] = willInclude.includes(key) ? evenShare : '';
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
    return (subtotal - discountAmount + taxAmount).toFixed(2);
  };

  const calculateTotal = () => {
    return rows
      .reduce((total, row) => {
        return total + parseFloat(calculateSubtotal(row));
      }, 0)
      .toFixed(2);
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
    const amountRemaining = subtotal - totalSplit;
    return amountRemaining.toFixed(2);
  };

  const calculateMemberShare = (row: Row, column: string) => {
    const subtotal = parseFloat(calculateSubtotal(row));
    const percentage = parseFloat(row[toKey(column)]) || 0;
    return ((subtotal * percentage) / 100).toFixed(2);
  };

  const calculateMemberTotal = (column: string) => {
    return rows
      .reduce((total, row) => {
        return total + parseFloat(calculateMemberShare(row, column));
      }, 0)
      .toFixed(2);
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
    setRows,
    setColumns,
    globalDiscount,
    setGlobalDiscount,
    applyGlobalDiscount,
    globalTax,
    setGlobalTax,
    applyGlobalTax,
  };
};

export default useSplitManager;
