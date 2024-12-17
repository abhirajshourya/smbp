'use client';

import { Plus } from 'lucide-react';
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
  } = useSplitManager();

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

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex gap-4 items-center">
        <Button onClick={addRow} className="flex gap-2 w-fit">
          <Plus /> Add Item
        </Button>
        <Button onClick={handleAddColumn} className="flex gap-2 w-fit">
          <Plus /> Add Member
        </Button>
        <div className="flex-grow" />
        <div className="flex gap-2 font-bold text-lg">
          <span>Total:</span>
          <span>$ {calculateTotal()}</span>
        </div>
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
                    <ContextMenuItem onClick={() => deleteColumn(col)}>
                      Delete Column
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
                  <ContextMenuItem onClick={() => deleteRow(row.id)}>Delete Row</ContextMenuItem>
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
            <Button onClick={() => deleteRow(row.id)} className="mt-4 w-full">
              Delete Row
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
