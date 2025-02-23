'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useSplitManager from '@/hooks/useSplitManager';
import clsx from 'clsx';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { CustomNav } from '@/components/CustomNav';

type ColumnDefinition = {
  align: string;
  width: string;
  minWidth?: string;
};

const columnDefinitions: Record<string, ColumnDefinition> = {
  Item: { align: 'left', width: 'auto', minWidth: '150px' },
  Unit: { align: 'left', width: 'auto', minWidth: '100px' },
  Quantity: { align: 'right', width: '80px', minWidth: '80px' },
  Price: { align: 'right', width: '100px', minWidth: '100px' },
  'Sub-Total': { align: 'right', width: '100px', minWidth: '100px' },
  Discount: { align: 'right', width: '100px', minWidth: '100px' },
  Tax: { align: 'right', width: '100px', minWidth: '100px' },
  Total: { align: 'right', width: 'auto', minWidth: '100px' },
  // Add other columns as needed
};

export default function Split() {
  const {
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
  } = useSplitManager();

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('splitData');
    if (savedData) {
      const { savedRows, savedColumns } = JSON.parse(savedData);
      setRows(savedRows);
      setColumns(savedColumns);
      setIsDataLoaded(true);
    }
  }, [setRows, setColumns]);

  useEffect(() => {
    const dataToSave = JSON.stringify({ savedRows: rows, savedColumns: columns });
    localStorage.setItem('splitData', dataToSave);
  }, [rows, columns]);

  columns.forEach((col) => {
    if (!columnDefinitions[col]) {
      columnDefinitions[col] = { align: 'right', width: 'auto', minWidth: '100px' };
    }
  });

  const handleAddColumn = () => {
    const newColumn = prompt('Enter member name:');
    if (newColumn) {
      addColumn(newColumn);
    }
  };

  const handleClearData = () => {
    const res = confirm('Are you sure you want to clear all data?');
    if (!res) return;
    localStorage.removeItem('splitData');
    setRows([]);
    setColumns(['Item', 'Quantity', 'Unit', 'Price', 'Discount', 'Tax', 'Sub-Total']);
    setIsDataLoaded(false);
  };

  return (
    <div>
      <CustomNav />
      <div className="p-6 flex flex-col text-center min-h-screen gap-4">
        <div className="flex gap-4 items-center flex-wrap">
          <Button onClick={addRow} className="flex gap-2 w-fit" variant="outline">
            <Plus /> Item
          </Button>
          <Button onClick={handleAddColumn} className="flex gap-2 w-fit" variant="outline">
            <Plus /> Member
          </Button>
          {isDataLoaded && (
            <Button onClick={handleClearData} className="flex gap-2 w-fit" variant="destructive">
              <Trash2 />
            </Button>
          )}
          <div className="flex-grow md:block hidden" />
          <div className="flex gap-2 text-2xl w-full md:w-auto">
            <span>Total:</span>
            <span className="font-semibold">${calculateTotal()}</span>
          </div>
        </div>
        <div className="flex flex-col font-semibold gap-2 flex-wrap">
          {columns
            .filter(
              (col) =>
                ![
                  'Item',
                  'Quantity',
                  'Unit',
                  'Price',
                  'Discount',
                  'Tax',
                  'Sub-Total',
                  'Total',
                ].includes(col)
            )
            .map((col, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-neutral-700">{col}:</span>
                <span>${calculateMemberTotal(col)}</span>
              </div>
            ))}
        </div>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, index) => (
                  <ContextMenu key={index}>
                    <ContextMenuTrigger asChild>
                      <TableHead
                        className={clsx(
                          columnDefinitions[col]?.align === 'right' ||
                            ![
                              'Item',
                              'Unit',
                              'Quantity',
                              'Price',
                              'Sub-Total',
                              'Discount',
                              'Tax',
                              'Total',
                            ].includes(col)
                            ? 'text-right'
                            : ''
                        )}
                        style={{
                          width: columnDefinitions[col]?.width || 'auto',
                          minWidth: columnDefinitions[col]?.minWidth || 'auto',
                        }}
                      >
                        {col}
                      </TableHead>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        className="flex gap-2 items-center"
                        onClick={() => deleteColumn(col)}
                      >
                        <Trash size={16} /> Member
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
                <TableHead className="text-right">Amount Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow>
                      {columns.map((col, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={clsx(
                            columnDefinitions[col]?.align === 'right' ||
                              ![
                                'item',
                                'unit',
                                'quantity',
                                'price',
                                'sub-total',
                                'discount',
                                'tax',
                                'total',
                              ].includes(col.toLowerCase().replace(' ', ''))
                              ? 'text-right'
                              : '',
                            columnDefinitions[col]?.width
                              ? `w-[${columnDefinitions[col].width}]`
                              : 'w-28'
                          )}
                        >
                          {col === 'Unit' ? (
                            <Select
                              value={row[col.toLowerCase().replace(' ', '')] || 'ea'}
                              onValueChange={(value) => updateRow(row.id, col, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Units</SelectLabel>
                                  {units.map((unit) => (
                                    <SelectItem key={unit} value={unit}>
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          ) : col === 'Sub-Total' ? (
                            '$ ' + calculateSubtotal(row)
                          ) : col === 'Discount' || col === 'Tax' ? (
                            <div className="flex items-center">
                              <Input
                                type="text"
                                value={row[col.toLowerCase().replace(' ', '')]}
                                onChange={(e) => {
                                  updateRow(row.id, col, e.target.value);
                                }}
                                className="w-full text-right"
                              />
                              <span className="ml-1 text-gray-600">%</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <Input
                                  type="text"
                                  value={row[col.toLowerCase().replace(' ', '')]}
                                  onChange={(e) => {
                                    updateRow(row.id, col, e.target.value);
                                  }}
                                  className={clsx(col === 'Item' ? 'w-full' : 'w-full text-right')}
                                />
                                {![
                                  'item',
                                  'quantity',
                                  'unit',
                                  'price',
                                  'discount',
                                  'tax',
                                  'sub-total',
                                ].includes(col.toLowerCase().replace(' ', '')) && (
                                  <span className="ml-1 text-gray-600">%</span>
                                )}
                              </div>
                              {![
                                'item',
                                'quantity',
                                'unit',
                                'price',
                                'discount',
                                'tax',
                                'sub-total',
                              ].includes(col.toLowerCase().replace(' ', '')) && (
                                <span className="text-gray-600 text-sm mt-1 text-right">
                                  $ {calculateMemberShare(row, col)}
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      ))}
                      <TableCell
                        className={clsx(
                          'text-right',
                          Number(calculateAmountRemaining(row)) < 0 ? 'text-red-500' : ''
                        )}
                      >
                        {calculateAmountRemaining(row)}
                      </TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      className="flex gap-2 items-center"
                      onClick={() => deleteRow(row.id)}
                    >
                      <Trash size={16} /> Item
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                {columns.map((col, index) => (
                  <TableCell key={index} className="text-right font-bold">
                    {![
                      'Item',
                      'Unit',
                      'Quantity',
                      'Price',
                      'Sub-Total',
                      'Discount',
                      'Tax',
                      'Total',
                    ].includes(col)
                      ? `$ ${calculateMemberTotal(col)}`
                      : ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <div className="block sm:hidden">
          {rows.length === 0 && (
            <div>
              <p className="text-neutral-600">Start by adding an item</p>
            </div>
          )}
          {rows.map((row) => (
            <div key={row.id} className="border rounded-lg p-4 mb-4">
              {columns.map((col, colIndex) => (
                <div key={colIndex} className="flex justify-between mb-2">
                  <span className="font-medium">{col}:</span>
                  <span className={clsx('w-1/2', col === 'Sub-Total' ? 'text-right' : '')}>
                    {col === 'Unit' ? (
                      <Select
                        value={row[col.toLowerCase().replace(' ', '')] || 'ea'}
                        onValueChange={(value) => updateRow(row.id, col, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Units</SelectLabel>
                            {units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : col === 'Sub-Total' ? (
                      '$ ' + calculateSubtotal(row)
                    ) : col === 'Discount' || col === 'Tax' ? (
                      <div className="flex items-center">
                        <Input
                          type="text"
                          value={row[col.toLowerCase().replace(' ', '')]}
                          onChange={(e) => {
                            updateRow(row.id, col, e.target.value);
                          }}
                          className="w-full text-right"
                        />
                        <span className="ml-1 text-gray-600">%</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Input
                            type="text"
                            value={row[col.toLowerCase().replace(' ', '')]}
                            onChange={(e) => {
                              updateRow(row.id, col, e.target.value);
                            }}
                            className="w-full text-right"
                          />
                          {![
                            'item',
                            'quantity',
                            'unit',
                            'price',
                            'discount',
                            'tax',
                            'sub-total',
                          ].includes(col.toLowerCase().replace(' ', '')) && (
                            <span className="ml-1 text-gray-600">%</span>
                          )}
                        </div>
                        {![
                          'item',
                          'quantity',
                          'unit',
                          'price',
                          'discount',
                          'tax',
                          'sub-total',
                        ].includes(col.toLowerCase().replace(' ', '')) && (
                          <span className="text-gray-600 text-sm mt-1 text-right">
                            $ {calculateMemberShare(row, col)}
                          </span>
                        )}
                      </div>
                    )}
                  </span>
                </div>
              ))}
              <div className="flex justify-between mt-2">
                <span className="font-medium">Amount Remaining:</span>
                <span
                  className={clsx(
                    'text-right',
                    Number(calculateAmountRemaining(row)) < 0 ? 'text-red-500' : ''
                  )}
                >
                  {calculateAmountRemaining(row)}
                </span>
              </div>
              <Button
                onClick={() => deleteRow(row.id)}
                className="mt-4 w-full flex gap-2 items-center"
              >
                <Trash /> Item
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
