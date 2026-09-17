import type { ReceiptData } from './exportBill';

const BRAND = '#5048E5';
const TEXT = '#1a1a1a';
const MUTED = '#8a8a8a';
const ON_BRAND = '#ffffff';
const ON_BRAND_MUTED = '#CFCBF5';
const ZEBRA = '#F7F7FB';
const BORDER = '#e5e5e5';
const DISCOUNT_BG = '#EAF3DE';
const DISCOUNT_TEXT = '#3B6D11';
const TAX_BG = '#FAEEDA';
const TAX_TEXT = '#854F0B';

// Each item row spans two text lines (name+tags, then who split it) inside
// a fixed-height band. jsPDF draws exactly what it's told at explicit pt
// coordinates — deterministic vector output, not a rasterizer reconstructing
// layout from CSS — so a fixed row height is safe here without measuring
// real text-wrap the way the html2canvas-based image export has to.
const ROW_HEIGHT = 36;
const NAME_BASELINE_OFFSET = 14;
const SPLIT_BASELINE_OFFSET = 28;

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

  // Full-width branded header band, echoing the same mark/wordmark as the
  // image export's header but as the page's dominant visual anchor instead
  // of a small corner mark.
  const bandHeight = 72;
  pdf.setFillColor(BRAND);
  pdf.rect(0, 0, pageWidth, bandHeight, 'F');

  const markSize = 18;
  pdf.setFillColor(ON_BRAND);
  pdf.roundedRect(marginX, bandHeight / 2 - markSize / 2, markSize, markSize, 5, 5, 'F');

  // "times" is one of jsPDF's three built-in fonts — a real serif with no
  // custom font embedding needed, for an editorial touch on the brand name.
  pdf.setFont('times', 'bolditalic');
  pdf.setFontSize(17);
  pdf.setTextColor(ON_BRAND);
  pdf.text('Split My Bill Plz', marginX + markSize + 10, bandHeight / 2 + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(ON_BRAND_MUTED);
  pdf.text(data.date, pageWidth - marginX, bandHeight / 2 + 4, { align: 'right' });

  let y = bandHeight + 36;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(MUTED);
  pdf.text('ITEM', marginX, y);
  pdf.text('AMOUNT', pageWidth - marginX, y, { align: 'right' });
  y += 8;
  pdf.setDrawColor(BORDER);
  pdf.setLineWidth(1);
  pdf.line(marginX, y, pageWidth - marginX, y);
  y += 4;

  // Draws one discount/tax pill immediately after the running cursor and
  // returns the cursor's new x — same inline-after-the-name placement as
  // the image export, just in jsPDF's own drawing primitives.
  const drawTag = (label: string, tone: 'discount' | 'tax', cursorX: number, baselineY: number) => {
    const [bg, fg] = tone === 'discount' ? [DISCOUNT_BG, DISCOUNT_TEXT] : [TAX_BG, TAX_TEXT];
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const tagWidth = pdf.getTextWidth(label) + 12;
    pdf.setFillColor(bg);
    pdf.roundedRect(cursorX, baselineY - 10, tagWidth, 13, 6.5, 6.5, 'F');
    pdf.setTextColor(fg);
    pdf.text(label, cursorX + 6, baselineY - 1);
    return cursorX + tagWidth + 6;
  };

  // Items are drawn manually rather than through jspdf-autotable's cell
  // model, because a table cell can't easily hold two differently-styled
  // lines (the item name and, beneath it in smaller muted text, who split
  // it) the way a hand-drawn two-line row can.
  data.items.forEach((item, index) => {
    const rowTop = y;
    if (index % 2 === 1) {
      pdf.setFillColor(ZEBRA);
      pdf.rect(marginX - 8, rowTop, pageWidth - marginX * 2 + 16, ROW_HEIGHT, 'F');
    }

    const nameBaseline = rowTop + NAME_BASELINE_OFFSET;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(TEXT);
    pdf.text(item.name, marginX, nameBaseline);

    let cursorX = marginX + pdf.getTextWidth(item.name) + 10;
    item.tags.forEach((tag) => {
      cursorX = drawTag(tag.label, tag.tone, cursorX, nameBaseline);
    });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(MUTED);
    pdf.text(item.splitWith, marginX, rowTop + SPLIT_BASELINE_OFFSET);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(TEXT);
    pdf.text(`$${item.amount}`, pageWidth - marginX, rowTop + (NAME_BASELINE_OFFSET + SPLIT_BASELINE_OFFSET) / 2 + 3, {
      align: 'right',
    });

    y += ROW_HEIGHT;
  });

  pdf.setDrawColor(TEXT);
  pdf.setLineWidth(1);
  pdf.line(marginX, y, pageWidth - marginX, y);
  y += 22;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(TEXT);
  pdf.text('Total', marginX, y);
  pdf.text(`$${data.total}`, pageWidth - marginX, y, { align: 'right' });

  y += 34;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(MUTED);
  pdf.text('WHO OWES WHAT', marginX, y);
  y += 10;

  if (data.memberTotals.length > 0) {
    autoTable(pdf, {
      startY: y,
      margin: { left: marginX, right: marginX },
      body: data.memberTotals.map((member) => [member.name, `$${member.amount}`]),
      theme: 'plain',
      showHead: false,
      styles: { font: 'helvetica', fontSize: 11, textColor: TEXT, cellPadding: 8 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      alternateRowStyles: { fillColor: ZEBRA },
    });
  }

  pdf.save('split-my-bill-plz.pdf');
}
