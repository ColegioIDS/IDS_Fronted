// src/hooks/useRecaptcha.ts
'use client';

import { useCallback } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const useRecaptcha = () => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const executeRecaptcha = useCallback(
    async (action: string = 'login'): Promise<string | null> => {
      if (!siteKey) {
        console.warn('reCAPTCHA site key not configured');
        return null;
      }

      try {
        return await new Promise((resolve, reject) => {
          window.grecaptcha.ready(() => {
            window.grecaptcha
              .execute(siteKey, { action })
              .then((token: string) => {
                resolve(token);
              })
              .catch((error: Error) => {
                console.error('reCAPTCHA execution error:', error);
                reject(error);
              });
          });
        });
      } catch (error) {
        console.error('reCAPTCHA error:', error);
        return null;
      }
    },
    [siteKey]
  );

  return { executeRecaptcha, siteKey };
};
