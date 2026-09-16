'use client';

import { useMemo, useState } from 'react';
import { Trash, ArrowRightLeft } from 'lucide-react';
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
import clsx from 'clsx';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { Row } from '@/hooks/useSplitManager';

type ColumnDefinition = {
  align: string;
  width: string;
  minWidth?: string;
};

const baseColumnDefinitions: Record<string, ColumnDefinition> = {
  Item: { align: 'left', width: 'auto', minWidth: '150px' },
  Unit: { align: 'left', width: 'auto', minWidth: '100px' },
  Quantity: { align: 'right', width: '80px', minWidth: '80px' },
  Price: { align: 'right', width: '100px', minWidth: '100px' },
  'Sub-Total': { align: 'right', width: '100px', minWidth: '100px' },
  Discount: { align: 'right', width: '100px', minWidth: '100px' },
  Tax: { align: 'right', width: '100px', minWidth: '100px' },
  Total: { align: 'right', width: 'auto', minWidth: '100px' },
};

const predefinedShares = [
  { name: '--', value: 0 },
  { name: '1/5', value: 20 },
  { name: '1/4', value: 25 },
  { name: '1/3', value: 33.33 },
  { name: '1/2', value: 50 },
  { name: '2/3', value: 66.67 },
  { name: '3/4', value: 75 },
  { name: '4/5', value: 80 },
  { name: '1', value: 100 },
];

const predefinedColumns = [
  'item',
  'unit',
  'quantity',
  'price',
  'sub-total',
  'discount',
  'tax',
  'total',
];

type BillTableProps = {
  rows: Row[];
  columns: string[];
  units: string[];
  updateRow: (rowId: string, column: string, value: string) => void;
  deleteRow: (rowId: string) => void;
  deleteColumn: (column: string) => void;
  calculateSubtotal: (row: Row) => string;
  calculateAmountRemaining: (row: Row) => string;
  calculateMemberShare: (row: Row, column: string) => string;
  calculateMemberTotal: (column: string) => string;
};

export const BillTable = ({
  rows,
  columns,
  units,
  updateRow,
  deleteRow,
  deleteColumn,
  calculateSubtotal,
  calculateAmountRemaining,
  calculateMemberShare,
  calculateMemberTotal,
}: BillTableProps) => {
  const [isDropdown, setIsDropdown] = useState<boolean>(false);
  const toggleInputType = () => setIsDropdown(!isDropdown);

  const columnDefinitions = useMemo(() => {
    const definitions = { ...baseColumnDefinitions };
    columns.forEach((col) => {
      if (!definitions[col]) {
        definitions[col] = { align: 'right', width: 'auto', minWidth: '100px' };
      }
    });
    return definitions;
  }, [columns]);

  return (
    <>
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
                          !predefinedColumns.includes(col.toLowerCase().replace(' ', ''))
                          ? 'text-right'
                          : '',
                        'font-semibold',
                        ['Sub-Total'].includes(col) ? 'text-foreground' : ''
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
              <TableHead className="text-right">Remaining</TableHead>
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
                            !predefinedColumns.includes(col.toLowerCase().replace(' ', ''))
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
                              <SelectValue placeholder="--" />
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
                          <div className="flex items-center px-1 gap-2 justify-end text-foreground font-semibold">
                            <span className="">$</span>
                            <span className="">{calculateSubtotal(row)}</span>
                          </div>
                        ) : col === 'Price' ? (
                          <div className="flex items-center px-1 gap-2 justify-end">
                            <span className="text-muted-foreground">$</span>
                            <Input
                              type="text"
                              value={row[col.toLowerCase().replace(' ', '')]}
                              onChange={(e) => updateRow(row.id, col, e.target.value)}
                              className="w-20 text-right"
                            />
                          </div>
                        ) : col === 'Discount' || col === 'Tax' ? (
                          <div className="flex items-center gap-2 pl-4">
                            <Input
                              type="text"
                              value={row[col.toLowerCase().replace(' ', '')]}
                              onChange={(e) => {
                                updateRow(row.id, col, e.target.value);
                              }}
                              className="w-full text-right"
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-col">
                              {['item', 'quantity', 'unit', 'discount', 'tax', 'sub-total'].includes(
                                col.toLowerCase().replace(' ', '')
                              ) && (
                                <Input
                                  type="text"
                                  value={row[col.toLowerCase().replace(' ', '')]}
                                  onChange={(e) => updateRow(row.id, col, e.target.value)}
                                  className="w-full"
                                />
                              )}
                            </div>
                            <div className="flex flex-col">
                              {!predefinedColumns.includes(col.toLowerCase().replace(' ', '')) && (
                                <div className="flex items-center gap-2 justify-end">
                                  <div className="flex flex-col gap-2 justify-center">
                                    {isDropdown ? (
                                      <Select
                                        value={row[col.toLowerCase().replace(' ', '')]}
                                        onValueChange={(value) => updateRow(row.id, col, value)}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue placeholder="--" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectGroup>
                                            <SelectLabel>Shares</SelectLabel>
                                            {predefinedShares.map((share) => (
                                              <SelectItem
                                                key={share.name}
                                                value={share.value?.toString() || '100'}
                                              >
                                                {share.name}
                                              </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="text"
                                          value={row[col.toLowerCase().replace(' ', '')]}
                                          onChange={(e) => updateRow(row.id, col, e.target.value)}
                                          className="w-16 text-right"
                                        />
                                        <span className="text-muted-foreground">%</span>
                                      </div>
                                    )}
                                    <span className="text-muted-foreground self-start px-2">
                                      $ {calculateMemberShare(row, col)}
                                    </span>
                                  </div>
                                  <Button
                                    onClick={toggleInputType}
                                    variant="outline"
                                    size="icon"
                                    className="p-2"
                                  >
                                    <ArrowRightLeft size={16} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>
                    ))}
                    <TableCell
                      className={clsx(
                        'text-right',
                        Number(calculateAmountRemaining(row)) !== 0 ? 'text-destructive' : ''
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
                  {!['Item', 'Unit', 'Quantity', 'Price', 'Sub-Total', 'Discount', 'Tax', 'Total'].includes(
                    col
                  )
                    ? `$ ${calculateMemberTotal(col)}`
                    : ''}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {rows.length === 0 && (
        <div className="flex-auto flex justify-center pt-32">
          <p className="text-muted-foreground">Start by adding an item</p>
        </div>
      )}
      <div className="block sm:hidden">
        {rows.map((row) => (
          <div key={row.id} className="border-2 rounded-lg p-4 mb-4">
            {columns.map((col, colIndex) => (
              <div
                key={colIndex}
                className={clsx(
                  'flex justify-between mb-2 items-center',
                  col === 'Sub-Total' && 'border-b-2 py-2 border-border'
                )}
              >
                <div>
                  <span
                    className={clsx(
                      'text-muted-foreground',
                      'font-semibold',
                      col === 'Sub-Total' && 'text-foreground '
                    )}
                  >
                    {col}:
                  </span>
                </div>
                <div className={clsx('w-1/2', col === 'Sub-Total' ? 'text-right' : '')}>
                  {col === 'Unit' ? (
                    <Select
                      value={row[col.toLowerCase().replace(' ', '')] || 'ea'}
                      onValueChange={(value) => updateRow(row.id, col, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="--" />
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
                  ) : col === 'Price' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        value={row[col.toLowerCase().replace(' ', '')]}
                        onChange={(e) => updateRow(row.id, col, e.target.value)}
                        className="w-full"
                      />
                    </div>
                  ) : col === 'Sub-Total' ? (
                    <span className="font-semibold">{'$ ' + calculateSubtotal(row)}</span>
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
                      <span className="ml-1 text-muted-foreground">%</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col">
                        {[
                          'item',
                          'quantity',
                          'unit',
                          'price',
                          'discount',
                          'tax',
                          'sub-total',
                        ].includes(col.toLowerCase().replace(' ', '')) && (
                          <Input
                            type="text"
                            value={row[col.toLowerCase().replace(' ', '')]}
                            onChange={(e) => updateRow(row.id, col, e.target.value)}
                            className="w-full"
                          />
                        )}
                      </div>
                      <div className="flex flex-col my-1">
                        {!predefinedColumns.includes(col.toLowerCase().replace(' ', '')) && (
                          <div className="flex flex-col">
                            <div className="flex items-center justify-end gap-2">
                              {isDropdown ? (
                                <Select
                                  value={row[col.toLowerCase().replace(' ', '')]}
                                  onValueChange={(value) => updateRow(row.id, col, value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="--" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Shares</SelectLabel>
                                      {predefinedShares.map((share) => (
                                        <SelectItem
                                          key={share.name}
                                          value={share.value?.toString() || '1/2'}
                                        >
                                          {share.name}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    type="text"
                                    value={row[col.toLowerCase().replace(' ', '')]}
                                    onChange={(e) => updateRow(row.id, col, e.target.value)}
                                    className="w-full text-right"
                                  />
                                  <span className="text-muted-foreground">%</span>
                                </div>
                              )}
                              <Button
                                onClick={toggleInputType}
                                variant="outline"
                                size="icon"
                                className="p-2"
                              >
                                <ArrowRightLeft size={16} />
                              </Button>
                            </div>
                            <span className="text-muted-foreground text-sm mt-1 mx-2 self-start">
                              $ {calculateMemberShare(row, col)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div
              className={clsx(
                'flex justify-between mt-2',
                Number(calculateAmountRemaining(row)) !== 0
                  ? 'font-semibold text-destructive'
                  : 'hidden'
              )}
            >
              <span>Amount Remaining:</span>
              <span>{calculateAmountRemaining(row)}</span>
            </div>
            <Button onClick={() => deleteRow(row.id)} className="mt-4 w-full flex gap-2 items-center">
              <Trash /> Item
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};
