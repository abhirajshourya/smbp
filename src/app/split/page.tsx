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
};

const columnDefinitions: Record<string, ColumnDefinition> = {
  Item: { align: 'left', width: 'auto' },
  Unit: { align: 'left', width: 'auto' },
  Quantity: { align: 'right', width: '80px' },
  Price: { align: 'right', width: '100px' },
  'Sub-Total': { align: 'right', width: '100px' },
  Discount: { align: 'right', width: '100px' },
  Tax: { align: 'right', width: '100px' },
  Total: { align: 'right', width: 'auto' },
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

  const handleAddColumn = () => {
    const newColumn = prompt('Enter member name:');
    if (newColumn) {
      addColumn(newColumn);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-4">
        <Button onClick={addRow} className="flex gap-2 w-fit">
          <Plus /> Item
        </Button>
        <Button onClick={handleAddColumn} className="flex gap-2 w-fit">
          <Plus /> Member
        </Button>
        <div className="flex-grow" />
        <div className="flex gap-2 font-bold">
          <span>Total:</span>
          <span>$ {calculateTotal()}</span>
        </div>
      </div>
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
                    style={{ width: columnDefinitions[col]?.width || 'auto' }}
                  >
                    {col}
                  </TableHead>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => deleteColumn(col)}>Delete Column</ContextMenuItem>
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
                      ) : col === 'Discount' ||
                        col === 'Tax' ||
                        col === 'Quantity' ||
                        col === 'Price' ? (
                        <div className="flex items-center">
                          <Input
                            type="text"
                            value={row[col.toLowerCase().replace(' ', '')]}
                            onChange={(e) => {
                              updateRow(row.id, col, e.target.value);
                            }}
                            className="w-full text-right"
                          />
                          {col === 'Discount' || col === 'Tax' ? (
                            <span className="ml-1">%</span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="flex flex-col">
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
                            <span className="text-gray-500 text-sm mt-1 text-right">
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
  );
}
