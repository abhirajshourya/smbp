import type { ReceiptData } from './exportBill';

const BRAND = '#5048E5';
const TEXT = '#1a1a1a';
const MUTED = '#8a8a8a';
const DISCOUNT_BG = '#EAF3DE';
const DISCOUNT_TEXT = '#3B6D11';
const TAX_BG = '#FAEEDA';
const TAX_TEXT = '#854F0B';

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
  let y = 52;

  pdf.setFillColor(BRAND);
  pdf.roundedRect(marginX, y - 14, 16, 16, 4, 4, 'F');
  // "times" is one of jsPDF's three built-in fonts — a real serif with no
  // custom font embedding needed, for an editorial touch on the brand name.
  pdf.setFont('times', 'bolditalic');
  pdf.setFontSize(15);
  pdf.setTextColor(TEXT);
  pdf.text('Split My Bill Plz', marginX + 24, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(MUTED);
  pdf.text(data.date, pageWidth - marginX, y, { align: 'right' });

  y += 28;

  // Draws each tag as a small filled rounded pill immediately after the item
  // name's own text, mirroring the inline rate-tag look from the image
  // export — autoTable cells only render one plain text run, so the pills
  // have to be drawn manually once the cell's own text is in place.
  const drawItemTags = (itemIndex: number, cellX: number, cellY: number, cellHeight: number) => {
    const item = data.items[itemIndex];
    if (!item || item.tags.length === 0) return;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const baselineY = cellY + cellHeight / 2 + 3.5;
    let cursorX = cellX + pdf.getTextWidth(item.name) + 8;

    item.tags.forEach((tag) => {
      const [bg, fg] = tag.tone === 'discount' ? [DISCOUNT_BG, DISCOUNT_TEXT] : [TAX_BG, TAX_TEXT];
      pdf.setFontSize(7.5);
      const tagWidth = pdf.getTextWidth(tag.label) + 8;
      pdf.setFillColor(bg);
      pdf.roundedRect(cursorX, baselineY - 9, tagWidth, 11, 3, 3, 'F');
      pdf.setTextColor(fg);
      pdf.text(tag.label, cursorX + 4, baselineY - 1);
      cursorX += tagWidth + 4;
    });

    pdf.setTextColor(TEXT);
    pdf.setFontSize(10);
  };

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
    didDrawCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 0) {
        drawItemTags(hookData.row.index, hookData.cell.x, hookData.cell.y, hookData.cell.height);
      }
    },
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
