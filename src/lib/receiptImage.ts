import type { ReceiptData } from './exportBill';

const BRAND = '#5048E5';
const BRAND_LIGHT = '#8B85F0';
const TEXT = '#1a1a1a';
const MUTED = '#8a8a8a';
const BORDER = '#e5e5e5';
// Deliberately not the app's --font-receipt-serif custom web font (Newsreader,
// via next/font): confirmed by direct comparison (a real browser screenshot
// vs. this same markup rasterized by html2canvas) that html2canvas mismeasures
// that custom font's vertical metrics badly enough to throw off text-centering
// math by ~10px, even though the live browser renders it correctly. Georgia is
// a plain system serif with no custom @font-face, which html2canvas measures
// reliably — worth the small loss of brand flourish in just this export.
// Single-quoted font name: this stack gets interpolated straight into a
// double-quoted HTML style="..." attribute, and a double-quoted "Times New
// Roman" there would silently truncate the attribute at that quote — every
// declaration after font-family would just be dropped by the HTML parser.
const SERIF_STACK = "Georgia, 'Times New Roman', serif";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char
  );
}

// The image export intentionally shows only the total and a plain
// label/amount list per member, not the itemized list — the itemized view
// lives on-screen and in the PDF/CSV exports. Per-item discount/tax tags
// and pill-shaped member chips were both tried here and dropped: html2canvas
// never rendered their small inline-block pills reliably once the receipt
// got tall enough (see git history on this file). Plain flex rows with
// align-items:baseline (no pills, no unset flex defaults) are the layout
// that has actually held up under Playwright's pixel-level checks.
function buildReceiptMarkup(data: ReceiptData): string {
  const memberRows = data.memberTotals
    .map(
      (member, index) => `
        <div data-testid="member-row" data-member-name="${escapeHtml(member.name)}" style="display:flex;align-items:baseline;justify-content:space-between;padding:8px 0;font-size:14px;${index > 0 ? `border-top:1px solid ${BORDER};` : ''}">
          <span data-testid="member-name">${escapeHtml(member.name)}</span><span data-testid="member-amount">$${member.amount}</span>
        </div>`
    )
    .join('');

  // The brand row's span line-height matches the mark's 18px height so both
  // flex children have identical box height. Even so, html2canvas paints
  // text glyphs anchored near the bottom of their line box rather than
  // centering the glyph ink within it (confirmed by comparing this exact
  // markup's rendered pixels against a real browser screenshot of it —
  // the live browser centers it correctly, html2canvas doesn't), so the
  // solid-color mark — whose own ink faithfully fills its box, unlike
  // text — needs a manual offset to visually land where html2canvas
  // actually draws the text. This offset is only safe as a hardcoded
  // constant because this row's content ("Split My Bill Plz" at a fixed
  // font-size) never varies per bill.
  return `
    <div style="background:#ffffff;color:${TEXT};font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;width:340px;padding:24px;">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:2px;">
        <div data-testid="brand-mark" style="width:18px;height:18px;border-radius:5px;background:linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT});flex-shrink:0;margin-top:10.5px;"></div>
        <span data-testid="brand-name" style="font-family:${SERIF_STACK};font-weight:500;font-size:17px;line-height:18px;">Split My Bill Plz</span>
      </div>
      <div style="color:${MUTED};font-size:12px;margin-bottom:16px;">${escapeHtml(data.date)}</div>
      <div style="display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid ${BORDER};margin-top:2px;padding-top:18px;font-weight:500;font-size:20px;">
        <span data-testid="total-label">Total</span><span data-testid="total-amount">$${data.total}</span>
      </div>
      ${
        data.memberTotals.length > 0
          ? `<div style="margin-top:20px;padding-top:6px;border-top:1px solid ${BORDER};">
              <div style="color:${MUTED};font-size:10px;font-weight:500;letter-spacing:0.02em;margin-top:10px;margin-bottom:2px;">WHO OWES WHAT</div>
              ${memberRows}
            </div>`
          : ''
      }
    </div>`;
}

// Renders the receipt off-screen (not visible, but laid out and painted —
// html2canvas needs real layout to rasterize) so the exported image is a
// clean, purpose-built receipt instead of a screenshot of the live app UI.
async function renderToCanvas(data: ReceiptData): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas');

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.innerHTML = buildReceiptMarkup(data);
  document.body.appendChild(container);

  try {
    // scale:2 (tried earlier for extra sharpness) turned out to be the
    // cause of a text-alignment bug in a previous version of this markup:
    // html2canvas's own text-layout engine accumulates a growing vertical
    // rounding error the further down the rendered content an element
    // sits, and doubling the internal render resolution doubled that
    // drift. scale:1 removes it entirely for the same DOM/CSS. The output
    // is a touch softer on very high-DPI screens, but that's a better
    // trade than misaligned text, and kept even now that the markup is
    // short — no reason to reintroduce the risk.
    return await html2canvas(container.firstElementChild as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 1,
    });
  } finally {
    document.body.removeChild(container);
  }
}

export async function generateReceiptImage(data: ReceiptData) {
  const canvas = await renderToCanvas(data);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'split-my-bill-plz.png';
  link.click();
}
