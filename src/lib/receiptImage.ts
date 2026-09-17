import type { ReceiptData } from './exportBill';

const BRAND = '#5048E5';
const BRAND_LIGHT = '#8B85F0';
const TEXT = '#1a1a1a';
const MUTED = '#8a8a8a';
const BORDER = '#e5e5e5';
const SERIF_STACK = 'var(--font-receipt-serif), Georgia, serif';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char
  );
}

// The image export intentionally shows only the total, not the itemized
// list or the per-member breakdown — those live on-screen and in the
// PDF/CSV exports. This also sidesteps html2canvas's text-layout quirks
// with small pill-shaped labels, which never rendered reliably once the
// receipt got tall enough (see git history on this file for the earlier
// attempts).
function buildReceiptMarkup(data: ReceiptData): string {
  return `
    <div style="background:#ffffff;color:${TEXT};font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;width:340px;padding:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
        <div style="width:18px;height:18px;border-radius:5px;background:linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT});flex-shrink:0;"></div>
        <span style="font-family:${SERIF_STACK};font-weight:500;font-size:17px;">Split My Bill Plz</span>
      </div>
      <div style="color:${MUTED};font-size:12px;margin-bottom:16px;">${escapeHtml(data.date)}</div>
      <div style="display:flex;justify-content:space-between;border-top:1px solid ${BORDER};margin-top:2px;padding-top:18px;font-weight:500;font-size:20px;">
        <span>Total</span><span>$${data.total}</span>
      </div>
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
