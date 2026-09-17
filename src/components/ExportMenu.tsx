'use client';

import { useRef, useState } from 'react';
import { FileSpreadsheet, FileText, FileType2, Image as ImageIcon, Link as LinkIcon, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Row } from '@/hooks/useSplitManager';
import { type BillCalculations, buildCsv, buildTextSummary, downloadTextFile } from '@/lib/exportBill';

type ExportMenuProps = {
  rows: Row[];
  columns: string[];
  calculations: BillCalculations;
  captureRef: React.RefObject<HTMLElement | null>;
};

export function ExportMenu({ rows, columns, calculations, captureRef }: ExportMenuProps) {
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const statusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    if (statusTimeout.current) clearTimeout(statusTimeout.current);
    statusTimeout.current = setTimeout(() => setStatus(null), isError ? 4000 : 2000);
  };

  // Prefer the native share sheet (the natural "send to a friend" flow on
  // mobile); fall back to the clipboard. Both can genuinely fail for a real
  // user (permissions policy, insecure context, a denied prompt) so both are
  // caught — an unhandled rejection here would fail silently with no
  // feedback, since a closed dropdown menu can't show anything inside itself.
  const shareOrCopy = async (text: string, copiedMessage: string) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // Share sheet dismissed/cancelled — fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      flashStatus(copiedMessage);
    } catch {
      flashStatus("Couldn't copy — check clipboard permissions", true);
    }
  };

  const handleTextExport = () => {
    shareOrCopy(buildTextSummary(rows, columns, calculations), 'Copied to clipboard!');
  };

  const handleCsvExport = () => {
    try {
      const csv = buildCsv(rows, columns, calculations.calculateSubtotal);
      downloadTextFile('split-my-bill-plz.csv', csv, 'text/csv;charset=utf-8;');
    } catch {
      flashStatus("Couldn't generate the CSV", true);
    }
  };

  const handleImageExport = async () => {
    if (!captureRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(captureRef.current, { backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'split-my-bill-plz.png';
      link.click();
    } catch {
      flashStatus("Couldn't generate the image", true);
    }
  };

  const handlePdfExport = async () => {
    if (!captureRef.current) return;
    try {
      const [{ default: html2canvas }, { default: JsPdf }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(captureRef.current, { backgroundColor: '#ffffff' });
      const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
      const pdf = new JsPdf({ orientation, unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('split-my-bill-plz.pdf');
    } catch {
      flashStatus("Couldn't generate the PDF", true);
    }
  };

  // Disabled for now: this would encode the whole bill into the URL itself
  // (no backend to host it against). Revisit once bills are DB-backed and a
  // real short link can point at server-stored state instead. See issue.

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-fit" aria-label="Export or share this bill">
            <Share2 size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleTextExport} className="gap-2">
            <FileText size={16} /> Copy / share text summary
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCsvExport} className="gap-2">
            <FileSpreadsheet size={16} /> Download CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImageExport} className="gap-2">
            <ImageIcon size={16} /> Download image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePdfExport} className="gap-2">
            <FileType2 size={16} /> Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="gap-2">
            <LinkIcon size={16} /> Copy shareable link
            <span className="ml-auto text-[10px] font-medium text-muted-foreground">Coming soon</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {status && (
        <span
          className={`absolute top-full right-0 mt-1 whitespace-nowrap text-xs font-medium ${
            status.isError ? 'text-destructive' : 'text-success'
          }`}
        >
          {status.message}
        </span>
      )}
    </div>
  );
}
