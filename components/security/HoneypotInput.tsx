'use client';

import { useEffect, useId, useState } from 'react';
import { HONEYPOT_FIELD_PREFIX, generateTimestamp } from '@/lib/security/honeypot';

/**
 * Honeypot Input Component
 *
 * HOW TO USE:
 * 1. Add <HoneypotInput /> to any form
 * 2. On server, validate with validateHoneypot(formData)
 *
 * EXAMPLE:
 * ```tsx
 * <form action="/api/contact">
 *   <HoneypotInput />
 *   <input name="email" />
 *   <button>Submit</button>
 * </form>
 * ```
 */
export function HoneypotInput() {
  const [timestamp, setTimestamp] = useState<number>(0);
  // useId() is identical on the server and during hydration; strip its colons so
  // the result is a valid form field name.
  const fieldName = `${HONEYPOT_FIELD_PREFIX}${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    setTimestamp(generateTimestamp());
  }, []);

  return (
    <>
      {/* Honeypot field - hidden from humans, visible to bots */}
      <input
        type="text"
        name={fieldName}
        autoComplete="off"
        tabIndex={-1}
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Timestamp field for time-based validation */}
      <input
        type="hidden"
        name="__form_timestamp"
        value={timestamp}
      />
    </>
  );
}
