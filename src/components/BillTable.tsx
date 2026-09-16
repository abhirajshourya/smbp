'use client';

import { useMemo, useState } from 'react';
import { Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
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
import { type Row, isMemberColumn, toKey } from '@/hooks/useSplitManager';

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

type BillTableProps = {
  rows: Row[];
  columns: string[];
  units: string[];
  updateRow: (rowId: string, column: string, value: string) => void;
  deleteRow: (rowId: string) => void;
  deleteColumn: (column: string) => void;
  toggleMemberInclusion: (rowId: string, memberKey: string) => void;
  calculateSubtotal: (row: Row) => string;
  calculateAmountRemaining: (row: Row) => string;
  calculateMemberShare: (row: Row, column: string) => string;
  calculateMemberTotal: (column: string) => string;
};

// A member's cell defaults to a click-to-toggle chip that auto-splits the row
// evenly across whoever's included; "custom" mode reveals the raw % input for
// an exact uneven share.
const MemberCell = ({
  row,
  col,
  isCustomSplit,
  onToggle,
  onCustomChange,
  calculateMemberShare,
}: {
  row: Row;
  col: string;
  isCustomSplit: boolean;
  onToggle: () => void;
  onCustomChange: (value: string) => void;
  calculateMemberShare: (row: Row, column: string) => string;
}) => {
  const key = toKey(col);
  const percentage = parseFloat(row[key]) || 0;
  const isIncluded = percentage > 0;

  if (isCustomSplit) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <Input
          type="text"
          inputMode="decimal"
          value={row[key]}
          onChange={(e) => onCustomChange(e.target.value)}
          className="w-16 text-right"
        />
        <span className="text-muted-foreground">%</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'w-full rounded-md px-3 py-2.5 sm:py-1.5 text-sm font-medium transition-colors border active:scale-95',
        isIncluded
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'bg-transparent text-muted-foreground border-input hover:bg-accent'
      )}
    >
      $ {calculateMemberShare(row, col)}
    </button>
  );
};

// A two-segment pill showing both split modes at once, so the active mode
// and the click target are unambiguous (unlike a single toggle button whose
// label just names whichever mode is currently active).
const SplitModeToggle = ({
  isCustomSplit,
  onChange,
}: {
  isCustomSplit: boolean;
  onChange: (isCustomSplit: boolean) => void;
}) => (
  <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
    {(['quick', 'custom'] as const).map((mode) => {
      const active = (mode === 'custom') === isCustomSplit;
      return (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode === 'custom')}
          className={clsx(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            active
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {mode === 'quick' ? 'Quick split' : 'Custom %'}
        </button>
      );
    })}
  </div>
);

export const BillTable = ({
  rows,
  columns,
  units,
  updateRow,
  deleteRow,
  deleteColumn,
  toggleMemberInclusion,
  calculateSubtotal,
  calculateAmountRemaining,
  calculateMemberShare,
  calculateMemberTotal,
}: BillTableProps) => {
  const [isCustomSplit, setIsCustomSplit] = useState<boolean>(false);

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
        <div className="flex justify-end mb-2">
          <SplitModeToggle isCustomSplit={isCustomSplit} onChange={setIsCustomSplit} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <ContextMenu key={index}>
                  <ContextMenuTrigger asChild>
                    <TableHead
                      className={clsx(
                        columnDefinitions[col]?.align === 'right' || isMemberColumn(col)
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
                          columnDefinitions[col]?.align === 'right' || isMemberColumn(col)
                            ? 'text-right'
                            : '',
                          columnDefinitions[col]?.width
                            ? `w-[${columnDefinitions[col].width}]`
                            : 'w-28'
                        )}
                      >
                        {col === 'Unit' ? (
                          <Select
                            value={row[toKey(col)] || 'ea'}
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
                              inputMode="decimal"
                              value={row[toKey(col)]}
                              onChange={(e) => updateRow(row.id, col, e.target.value)}
                              className="w-20 text-right"
                            />
                          </div>
                        ) : col === 'Discount' || col === 'Tax' ? (
                          <div className="flex items-center gap-2 pl-4">
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={row[toKey(col)]}
                              onChange={(e) => {
                                updateRow(row.id, col, e.target.value);
                              }}
                              className="w-full text-right"
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        ) : ['item', 'quantity'].includes(toKey(col)) ? (
                          <Input
                            type="text"
                            inputMode={toKey(col) === 'quantity' ? 'decimal' : undefined}
                            value={row[toKey(col)]}
                            onChange={(e) => updateRow(row.id, col, e.target.value)}
                            className="w-full"
                          />
                        ) : isMemberColumn(col) ? (
                          <MemberCell
                            row={row}
                            col={col}
                            isCustomSplit={isCustomSplit}
                            onToggle={() => toggleMemberInclusion(row.id, toKey(col))}
                            onCustomChange={(value) => updateRow(row.id, col, value)}
                            calculateMemberShare={calculateMemberShare}
                          />
                        ) : null}
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
                  {isMemberColumn(col) ? `$ ${calculateMemberTotal(col)}` : ''}
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
        <div className="flex justify-end mb-2">
          <SplitModeToggle isCustomSplit={isCustomSplit} onChange={setIsCustomSplit} />
        </div>
        {rows.map((row) => (
          <div
            key={row.id}
            className="relative bg-card border border-border rounded-xl shadow-sm active:bg-accent/30 transition-colors p-4 mb-4"
          >
            <button
              type="button"
              onClick={() => deleteRow(row.id)}
              aria-label="Delete item"
              className="absolute top-3 right-3 p-1.5 rounded-md text-destructive hover:bg-destructive/10 active:scale-95 transition-transform"
            >
              <Trash size={16} />
            </button>
            {columns.map((col, colIndex) => (
              <div key={colIndex}>
                {isMemberColumn(col) &&
                  !columns.slice(0, colIndex).some((c) => isMemberColumn(c)) && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-2">
                      Split between
                    </p>
                  )}
                <div
                  className={clsx(
                    'flex justify-between mb-2 items-center',
                    colIndex === 0 && 'pr-8',
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
                      value={row[toKey(col)] || 'ea'}
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
                        inputMode="decimal"
                        value={row[toKey(col)]}
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
                        inputMode="decimal"
                        value={row[toKey(col)]}
                        onChange={(e) => {
                          updateRow(row.id, col, e.target.value);
                        }}
                        className="w-full text-right"
                      />
                      <span className="ml-1 text-muted-foreground">%</span>
                    </div>
                  ) : ['item', 'quantity'].includes(toKey(col)) ? (
                    <Input
                      type="text"
                      inputMode={toKey(col) === 'quantity' ? 'decimal' : undefined}
                      value={row[toKey(col)]}
                      onChange={(e) => updateRow(row.id, col, e.target.value)}
                      className="w-full"
                    />
                  ) : isMemberColumn(col) ? (
                    <MemberCell
                      row={row}
                      col={col}
                      isCustomSplit={isCustomSplit}
                      onToggle={() => toggleMemberInclusion(row.id, toKey(col))}
                      onCustomChange={(value) => updateRow(row.id, col, value)}
                      calculateMemberShare={calculateMemberShare}
                    />
                  ) : null}
                  </div>
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
          </div>
        ))}
      </div>
    </>
  );
};
