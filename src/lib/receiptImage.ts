import type { ReceiptData } from './exportBill';

const BRAND = '#5048E5';
const BRAND_LIGHT = '#8B85F0';
const TEXT = '#1a1a1a';
const MUTED = '#8a8a8a';
const BORDER = '#e5e5e5';
const CHIP_BG = '#E8E7FB';
const CHIP_TEXT = '#3C3489';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char
  );
}

function buildReceiptMarkup(data: ReceiptData): string {
  const rows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 0 0;">${escapeHtml(item.name)}</td>
          <td style="padding:6px 0 0;text-align:right;">$${item.amount}</td>
        </tr>
        <tr>
          <td style="padding:0 0 6px;color:${MUTED};font-size:10.5px;">${escapeHtml(item.splitWith)}</td>
          <td></td>
        </tr>`
    )
    .join('');

  const chips = data.memberTotals
    .map(
      (member) => `
        <span style="background:${CHIP_BG};color:${CHIP_TEXT};border-radius:20px;padding:4px 10px;font-size:11px;font-weight:500;display:inline-block;">
          ${escapeHtml(member.name)} $${member.amount}
        </span>`
    )
    .join('');

  return `
    <div style="background:#ffffff;color:${TEXT};font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;width:340px;padding:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
        <div style="width:18px;height:18px;border-radius:5px;background:linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT});flex-shrink:0;"></div>
        <span style="font-weight:500;font-size:14px;">Split My Bill Plz</span>
      </div>
      <div style="color:${MUTED};font-size:12px;margin-bottom:16px;">${escapeHtml(data.date)}</div>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
        <tr style="border-bottom:1px solid ${BORDER};">
          <td style="padding:4px 0;color:${MUTED};font-weight:500;">item</td>
          <td style="padding:4px 0;color:${MUTED};font-weight:500;text-align:right;">amount</td>
        </tr>
        ${rows}
      </table>
      <div style="display:flex;justify-content:space-between;border-top:1px solid ${TEXT};margin-top:6px;padding-top:10px;font-weight:500;font-size:15px;">
        <span>Total</span><span>$${data.total}</span>
      </div>
      ${
        data.memberTotals.length > 0
          ? `<div style="margin-top:16px;padding-top:14px;border-top:1px solid ${BORDER};">
              <div style="color:${MUTED};font-size:11px;font-weight:500;margin-bottom:8px;">who owes what</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">${chips}</div>
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
    return await html2canvas(container.firstElementChild as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
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
