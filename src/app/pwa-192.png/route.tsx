import { pwaIconResponse } from '@/lib/pwaIconResponse';

export function GET() {
  return pwaIconResponse(192, 'any');
}

// Nothing here reads the request, so prerender at build time rather than
// paying a function invocation every time an installer fetches an icon.
export const dynamic = 'force-static';
