'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash, Trash2, ArrowRightLeft, Check } from 'lucide-react';
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

const predefinedShares = [
  {
    name: '--',
    value: 0,
  },
  {
    name: '1/5',
    value: 20,
  },
  {
    name: '1/4',
    value: 25,
  },
  {
    name: '1/3',
    value: 33.33,
  },
  {
    name: '1/2',
    value: 50,
  },
  {
    name: '2/3',
    value: 66.67,
  },

  {
    name: '3/4',
    value: 75,
  },
  {
    name: '4/5',
    value: 80,
  },
  {
    name: '1',
    Value: 100,
  },
];

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
    applyGlobalDiscount,
    applyGlobalTax,
  } = useSplitManager();

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [discountInput, setDiscountInput] = useState<string>('');
  const [taxInput, setTaxInput] = useState<string>('');
  const [isDropdown, setIsDropdown] = useState<boolean>(false);

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

  const handleApplyDiscount = () => {
    const discount = parseFloat(discountInput);
    if (!isNaN(discount)) {
      applyGlobalDiscount(discount);
    }
  };

  const handleApplyTax = () => {
    const tax = parseFloat(taxInput);
    if (!isNaN(tax)) {
      applyGlobalTax(tax);
    }
  };

  const toggleInputType = () => {
    setIsDropdown(!isDropdown);
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
        <div className="flex flex-col font-semibold gap-2 flex-wrap mx-4">
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
              <div key={index} className="flex items-center justify-end self-end gap-2 w-1/4">
                <span className="text-neutral-700">{col}:</span>
                <span className="w-fit">$</span>
                <span className="w-8">{calculateMemberTotal(col)}</span>
              </div>
            ))}
        </div>
        <div className="flex flex-col self-end gap-2 w-64">
          <div className="flex justify-end items-center gap-2 w-full">
            <span className="text-gray-600 w-24 text-right">Discount:</span>
            <Input
              type="text"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="25"
              className="text-center w-16"
            />
            <span className="text-gray-600">%</span>
            <Button onClick={handleApplyDiscount} className="p-2" variant="outline">
              <Check size={16} />
            </Button>
          </div>
          <div className="flex justify-end items-center gap-2 w-full">
            <span className="text-gray-600 w-24 text-right">Tax:</span>
            <Input
              type="text"
              value={taxInput}
              onChange={(e) => setTaxInput(e.target.value)}
              placeholder="13"
              className="text-center w-16"
            />
            <span className="text-gray-600">%</span>
            <Button onClick={handleApplyTax} className="p-2" variant="outline">
              <Check size={16} />
            </Button>
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
                            : '',
                          'font-semibold',
                          ['Sub-Total'].includes(col) ? 'text-neutral-800' : ''
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
                            <div className="flex items-center px-1 gap-2 justify-end text-neutral-800 font-semibold">
                              <span className="">$</span>
                              <span className="">{calculateSubtotal(row)}</span>
                            </div>
                          ) : col === 'Price' ? (
                            <div className="flex items-center px-1 gap-2 justify-end">
                              <span className="text-neutral-600">$</span>
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
                              <span className="text-gray-600">%</span>
                            </div>
                          ) : (
                            <div>
                              <div className="flex flex-col">
                                {[
                                  'item',
                                  'quantity',
                                  'unit',
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
                              <div className="flex flex-col">
                                {![
                                  'item',
                                  'quantity',
                                  'unit',
                                  'price',
                                  'discount',
                                  'tax',
                                  'sub-total',
                                ].includes(col.toLowerCase().replace(' ', '')) && (
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
                                          <span className="text-gray-600">%</span>
                                        </div>
                                      )}
                                      <span className="text-neutral-600 self-start px-2">
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
                          Number(calculateAmountRemaining(row)) !== 0 ? 'text-red-500' : ''
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
        {rows.length === 0 && (
          <div className="flex-auto flex justify-center pt-32">
            <p className="text-neutral-600">Start by adding an item</p>
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
                    col === 'Sub-Total' && 'border-b-2 py-2 border-neutral-200'
                  )}
                >
                  <div>
                    <span
                      className={clsx(
                        'text-neutral-700',
                        'font-semibold',
                        col === 'Sub-Total' && 'text-neutral-900 '
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
                        <span className="text-gray-600 text-sm">$</span>
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
                        <span className="ml-1 text-gray-600">%</span>
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
                          {![
                            'item',
                            'quantity',
                            'unit',
                            'price',
                            'discount',
                            'tax',
                            'sub-total',
                          ].includes(col.toLowerCase().replace(' ', '')) && (
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
                                    <span className="text-gray-600">%</span>
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
                              <span className="text-gray-600 text-sm mt-1 mx-2 self-start">
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
                    ? 'font-semibold text-red-500'
                    : 'hidden'
                )}
              >
                <span>Amount Remaining:</span>
                <span>{calculateAmountRemaining(row)}</span>
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
