'use client';

import { useEffect, useRef } from 'react';

interface BotEmbedProps {
  scriptCode: string;
  botName: string;
}

/**
 * Injects a third-party chatbot widget script tag into the page.
 * The script tag is parsed from the `scriptCode` HTML string and
 * dynamically appended to the DOM so the external widget boots up.
 */
export default function BotEmbed({ scriptCode, botName }: BotEmbedProps) {
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current || !scriptCode) return;
    injectedRef.current = true;

    // Parse the script tag from the HTML string
    const tmp = document.createElement('div');
    tmp.innerHTML = scriptCode.trim();
    const originalScript = tmp.querySelector('script');

    if (!originalScript) {
      console.warn('[BotEmbed] No <script> tag found in scriptCode for', botName);
      return;
    }

    // We must create a brand-new <script> element because
    // innerHTML-parsed scripts are not executed by the browser.
    const script = document.createElement('script');

    // Copy all attributes (id, src, defer, async, data-*, etc.)
    Array.from(originalScript.attributes).forEach((attr) => {
      script.setAttribute(attr.name, attr.value);
    });

    // Copy inline text content (some widgets put config IDs here)
    if (originalScript.textContent) {
      script.textContent = originalScript.textContent;
    }

    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      try {
        document.body.removeChild(script);
      } catch {
        // already removed
      }
    };
  }, [scriptCode, botName]);

  // This component renders nothing visible — the script creates its own widget UI
  return null;
}
