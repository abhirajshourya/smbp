'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useSplitManager from '@/hooks/useSplitManager';
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

  return (
    <div>
      <CustomNav />
      <div className="p-6 flex flex-col text-center min-h-screen gap-4">
        <div className="flex gap-4 items-center flex-wrap">
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
        <div className="flex flex-col font-semibold gap-2 flex-wrap mx-4">
          {columns
            .filter(
              (col) =>
                !['Item', 'Quantity', 'Unit', 'Price', 'Discount', 'Tax', 'Sub-Total', 'Total'].includes(
                  col
                )
            )
            .map((col, index) => (
              <div key={index} className="flex items-center justify-end self-end gap-2 w-1/4">
                <span className="text-muted-foreground">{col}:</span>
                <span className="w-fit">$</span>
                <span className="w-8">{calculateMemberTotal(col)}</span>
              </div>
            ))}
        </div>
        <div className="flex flex-col self-end gap-2 w-64">
          <div className="flex justify-end items-center gap-2 w-full">
            <span className="text-muted-foreground w-24 text-right">Discount:</span>
            <Input
              type="text"
              inputMode="decimal"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="25"
              className="text-center w-16"
            />
            <span className="text-muted-foreground">%</span>
            <Button onClick={handleApplyDiscount} className="p-2" variant="outline">
              <Check size={16} />
            </Button>
          </div>
          <div className="flex justify-end items-center gap-2 w-full">
            <span className="text-muted-foreground w-24 text-right">Tax:</span>
            <Input
              type="text"
              inputMode="decimal"
              value={taxInput}
              onChange={(e) => setTaxInput(e.target.value)}
              placeholder="13"
              className="text-center w-16"
            />
            <span className="text-muted-foreground">%</span>
            <Button onClick={handleApplyTax} className="p-2" variant="outline">
              <Check size={16} />
            </Button>
          </div>
        </div>
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
