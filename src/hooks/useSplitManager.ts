import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type Row = {
  id: string;
  [key: string]: string;
};

const initialColumns = ['Item', 'Quantity', 'Unit', 'Price', 'Discount', 'Tax', 'Sub-Total'];
const units = ['kg', 'g', 'lb', 'oz', 'ea'];

const useSplitManager = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>(initialColumns);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [globalTax, setGlobalTax] = useState<number>(0);

  const addRow = () => {
    const newRow: Row = { id: uuidv4() };
    columns.forEach((col) => {
      newRow[col.toLowerCase().replace(' ', '')] = '';
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
        [newColumn.toLowerCase().replace(' ', '')]: '',
      }))
    );
  };

  const deleteColumn = (column: string) => {
    const updatedColumns = columns.filter((col) => col !== column);
    setColumns(updatedColumns);
    setRows(
      rows.map((row) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [column.toLowerCase().replace(' ', '')]: _, ...rest } = row;
        return { id: row.id, ...rest };
      })
    );
  };

  const updateRow = (rowId: string, column: string, value: string) => {
    setRows(
      rows.map((row) =>
        row.id === rowId ? { ...row, [column.toLowerCase().replace(' ', '')]: value } : row
      )
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
      const predefinedColumns = [
        'item',
        'quantity',
        'unit',
        'price',
        'discount',
        'tax',
        'sub-total',
      ];
      if (predefinedColumns.includes(col.toLowerCase().replace(' ', ''))) {
        return total;
      }
      const splitPercent = parseFloat(row[col.toLowerCase().replace(' ', '')]) || 0;
      return total + (subtotal * splitPercent) / 100;
    }, 0);
    const amountRemaining = subtotal - totalSplit;
    return amountRemaining.toFixed(2);
  };

  const calculateMemberShare = (row: Row, column: string) => {
    const subtotal = parseFloat(calculateSubtotal(row));
    const percentage = parseFloat(row[column.toLowerCase().replace(' ', '')]) || 0;
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
