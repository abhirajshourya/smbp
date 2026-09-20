import { ImageResponse } from 'next/og';
import { logoMarkDataUri } from '@/lib/logoMarkSvg';

// iOS ignores SVG favicons, so the existing icon.svg never reaches a home
// screen bookmark. Generated rather than committed as a PNG so it can't drift
// out of sync with <LogoMark />.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoMarkDataUri({ rounded: false })} width={180} height={180} alt="" />
      </div>
    ),
    size
  );
}
