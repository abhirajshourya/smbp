import type { Page } from '@playwright/test';

export function keyFor(testId: string, memberName = ''): string {
  return `${testId}:${memberName}`;
}

export interface RowSpec {
  row: string;
  leftKey: string;
  rightKey: string;
}

export interface RowAlignmentResult {
  row: string;
  leftInkCenterY: number;
  rightInkCenterY: number;
  delta: number;
}

declare global {
  interface Window {
    __receiptCapture?: {
      rects: Promise<Record<string, { left: number; top: number; width: number; height: number }>>;
      dataUrl: Promise<string>;
      restoreAnchorClick: () => void;
    };
  }
}

// Installs capture hooks BEFORE the export button is clicked, so nothing
// about the app's real export flow needs to change or be reimplemented.
async function installCaptureHooks(page: Page) {
  await page.evaluate(() => {
    type Rect = { left: number; top: number; width: number; height: number };

    // Grabs the exact rects of every data-testid element the instant the
    // app appends its offscreen receipt container — before it's removed
    // from the DOM, which would zero out getBoundingClientRect.
    const rects: Promise<Record<string, Rect>> = new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of Array.from(m.addedNodes)) {
            const el = node as HTMLElement;
            if (node.nodeType === 1 && el.style && el.style.left === '-9999px') {
              observer.disconnect();
              const receipt = el.firstElementChild as HTMLElement;
              const receiptRect = receipt.getBoundingClientRect();
              const out: Record<string, Rect> = {};
              receipt.querySelectorAll('[data-testid]').forEach((child) => {
                const testId = child.getAttribute('data-testid') ?? '';
                const memberName = child.closest('[data-member-name]')?.getAttribute('data-member-name') ?? '';
                const r = (child as HTMLElement).getBoundingClientRect();
                out[`${testId}:${memberName}`] = {
                  left: r.left - receiptRect.left,
                  top: r.top - receiptRect.top,
                  width: r.width,
                  height: r.height,
                };
              });
              resolve(out);
              return;
            }
          }
        }
      });
      observer.observe(document.body, { childList: true });
    });

    // Captures the exact canvas the app's own html2canvas call produces.
    const dataUrl: Promise<string> = new Promise((resolve) => {
      const orig = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function (this: HTMLCanvasElement, ...args: unknown[]) {
        const url = (orig as (...a: unknown[]) => string).apply(this, args);
        if (this.width > 200) {
          HTMLCanvasElement.prototype.toDataURL = orig;
          resolve(url);
        }
        return url;
      } as typeof orig;
    });

    // Swallows the real file download so it doesn't hang/interfere.
    const origAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      if (this.download) return;
      return origAnchorClick.call(this);
    };

    window.__receiptCapture = {
      rects,
      dataUrl,
      restoreAnchorClick: () => {
        HTMLAnchorElement.prototype.click = origAnchorClick;
      },
    };
  });
}

async function finishCapture(page: Page, rows: RowSpec[]): Promise<RowAlignmentResult[]> {
  return page.evaluate(async (rows) => {
    function inkCenterY(imageData: ImageData, xStart: number, xEnd: number, yStart: number, yEnd: number): number {
      const { data, width, height } = imageData;
      let weightedYSum = 0;
      let weightTotal = 0;
      const x0 = Math.max(0, Math.floor(xStart));
      const x1 = Math.min(width, Math.ceil(xEnd));
      const y0 = Math.max(0, Math.floor(yStart));
      const y1 = Math.min(height, Math.ceil(yEnd));
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4;
          const darkness = 255 * 3 - (data[idx] + data[idx + 1] + data[idx + 2]);
          if (darkness > 40) {
            weightedYSum += y * darkness;
            weightTotal += darkness;
          }
        }
      }
      if (weightTotal === 0) return NaN;
      return weightedYSum / weightTotal;
    }

    const capture = window.__receiptCapture;
    if (!capture) throw new Error('installCaptureHooks() was not called before finishCapture()');
    const [rects, dataUrl] = await Promise.all([capture.rects, capture.dataUrl]);
    capture.restoreAnchorClick();

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(undefined);
      img.onerror = reject;
      img.src = dataUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const margin = 8;
    return rows.map(({ row, leftKey, rightKey }) => {
      const left = rects[leftKey];
      const right = rects[rightKey];
      if (!left || !right) {
        throw new Error(`Missing rect for row "${row}" (left=${leftKey} right=${rightKey})`);
      }
      const leftInkCenterY = inkCenterY(imageData, left.left, left.left + left.width, left.top - margin, left.top + left.height + margin);
      const rightInkCenterY = inkCenterY(imageData, right.left, right.left + right.width, right.top - margin, right.top + right.height + margin);
      return { row, leftInkCenterY, rightInkCenterY, delta: Math.abs(leftInkCenterY - rightInkCenterY) };
    });
  }, rows);
}

// Clicks the real "Download image" export button and inspects the actual
// rendered canvas pixels for text-baseline alignment — not the source DOM.
// The bugs this guards against (tag text sitting low in its pill, the Total
// row's label/amount drifting apart) never showed up in getBoundingClientRect
// checks on the pre-rasterization DOM; they were specific to how html2canvas
// paints that DOM onto the canvas. So "ink center" is read straight from
// pixel data, the same way a human eyeballing the PNG would judge it, just
// numerically instead of visually.
export async function captureRowAlignment(page: Page, rows: RowSpec[]): Promise<RowAlignmentResult[]> {
  await installCaptureHooks(page);
  await page.click('button[aria-label="Export or share this bill"]');
  await page.click('text=Download image');
  return finishCapture(page, rows);
}
