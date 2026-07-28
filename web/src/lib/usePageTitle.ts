import { useEffect } from 'react';
import { BRAND } from './constants';

/**
 * Replaces Next.js `generateMetadata` for the browser tab. This runs after the
 * page renders, so it does not produce server-rendered meta tags — link
 * previews on social platforms will show the generic index.html metadata.
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND.name}` : BRAND.name;
  }, [title]);
}
