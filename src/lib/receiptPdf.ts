import type { ReceiptData } from './exportBill';

const BRAND = '#5048E5';
const TEXT = '#1a1a1a';
const MUTED = '#8a8a8a';

// Draws a real vector PDF (text, lines, a native table via jspdf-autotable) —
// not a rasterized screenshot — so it stays crisp at any zoom and the text
// is selectable/searchable like an actual generated document.
export async function generateReceiptPdf(data: ReceiptData) {
  const [{ default: JsPdf }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const pdf = new JsPdf({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 50;

  pdf.setFillColor(BRAND);
  pdf.roundedRect(marginX, y - 13, 16, 16, 4, 4, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(TEXT);
  pdf.text('Split My Bill Plz', marginX + 24, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(MUTED);
  pdf.text(data.date, pageWidth - marginX, y, { align: 'right' });

  y += 30;

  autoTable(pdf, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [['Item', 'Split between', 'Amount']],
    body: data.items.map((item) => [item.name, item.splitWith, `$${item.amount}`]),
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 10, textColor: TEXT, cellPadding: 6 },
    headStyles: {
      textColor: MUTED,
      fontStyle: 'normal',
      lineWidth: { bottom: 1 },
      lineColor: TEXT,
    },
    columnStyles: { 2: { halign: 'right' } },
  });

  const afterItemsY = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  pdf.setDrawColor(TEXT);
  pdf.setLineWidth(1);
  pdf.line(marginX, afterItemsY, pageWidth - marginX, afterItemsY);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(TEXT);
  pdf.text('Total', marginX, afterItemsY + 22);
  pdf.text(`$${data.total}`, pageWidth - marginX, afterItemsY + 22, { align: 'right' });

  let memberY = afterItemsY + 48;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(MUTED);
  pdf.text('WHO OWES WHAT', marginX, memberY);
  memberY += 12;

  if (data.memberTotals.length > 0) {
    autoTable(pdf, {
      startY: memberY,
      margin: { left: marginX, right: marginX },
      body: data.memberTotals.map((member) => [member.name, `$${member.amount}`]),
      theme: 'plain',
      showHead: false,
      styles: { font: 'helvetica', fontSize: 11, textColor: TEXT, cellPadding: 6 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    });
  }

  pdf.save('split-my-bill-plz.pdf');
}
