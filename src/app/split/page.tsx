'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useSplitManager, { isMemberColumn } from '@/hooks/useSplitManager';
import { CustomNav } from '@/components/CustomNav';
import { BillTable } from '@/components/BillTable';

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
    toggleMemberInclusion,
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
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

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

  const handleConfirmAddMember = () => {
    const name = newMemberName.trim();
    if (name) {
      addColumn(name);
    }
    setNewMemberName('');
    setIsAddingMember(false);
  };

  const handleCancelAddMember = () => {
    setNewMemberName('');
    setIsAddingMember(false);
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

  const memberColumns = columns.filter(isMemberColumn);

  return (
    <div>
      <CustomNav />
      <div className="p-6 flex flex-col text-center min-h-screen gap-4">
        <div className="sticky top-[57px] z-40 -mx-6 px-6 py-2 bg-background/90 backdrop-blur-md border-b border-border flex gap-4 items-center flex-wrap">
          <Button onClick={addRow} className="flex gap-2 w-fit" variant="outline">
            <Plus /> Item
          </Button>
          {isAddingMember ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmAddMember();
                  if (e.key === 'Escape') handleCancelAddMember();
                }}
                placeholder="Member name"
                className="w-40"
              />
              <Button onClick={handleConfirmAddMember} className="p-2" variant="outline">
                <Check size={16} />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsAddingMember(true)}
              className="flex gap-2 w-fit"
              variant="outline"
            >
              <Plus /> Member
            </Button>
          )}
          {isDataLoaded && (
            <Button onClick={handleClearData} className="flex gap-2 w-fit" variant="destructive">
              <Trash2 />
            </Button>
          )}
          <div className="flex-grow md:block hidden" />
          <div className="flex gap-2 text-2xl w-full md:w-auto">
            <span>Total:</span>
            <span className="font-semibold font-mono">${calculateTotal()}</span>
          </div>
        </div>
        {rows.length > 0 && (
          <div className="rounded-xl border border-border bg-card shadow-sm p-4 text-left sm:w-80 sm:self-end">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Summary
            </p>
            {memberColumns.map((col, index) => (
              <div
                key={col}
                className={clsx(
                  'flex items-center justify-between py-2',
                  index === 0 && 'pt-0',
                  index === memberColumns.length - 1 && 'pb-0',
                  index !== memberColumns.length - 1 && 'border-b border-border'
                )}
              >
                <span className="text-sm font-medium text-muted-foreground">{col}</span>
                <span className="font-semibold font-mono">$ {calculateMemberTotal(col)}</span>
              </div>
            ))}
            <div className={clsx(memberColumns.length > 0 && 'mt-4 pt-4 border-t border-border')}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Apply to all items
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Discount
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      placeholder="25"
                      className="text-right"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      aria-label="Apply discount to all items"
                      className="p-2 rounded-md border border-input hover:bg-accent active:scale-95 transition-transform shrink-0"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Tax
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={taxInput}
                      onChange={(e) => setTaxInput(e.target.value)}
                      placeholder="13"
                      className="text-right"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                    <button
                      type="button"
                      onClick={handleApplyTax}
                      aria-label="Apply tax to all items"
                      className="p-2 rounded-md border border-input hover:bg-accent active:scale-95 transition-transform shrink-0"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <BillTable
          rows={rows}
          columns={columns}
          units={units}
          updateRow={updateRow}
          deleteRow={deleteRow}
          deleteColumn={deleteColumn}
          toggleMemberInclusion={toggleMemberInclusion}
          calculateSubtotal={calculateSubtotal}
          calculateAmountRemaining={calculateAmountRemaining}
          calculateMemberShare={calculateMemberShare}
          calculateMemberTotal={calculateMemberTotal}
        />
      </div>
    </div>
  );
}
