/**
 * Google OAuth 2.0 — Authorization Code Flow via Popup
 *
 * Opens a Google sign-in popup, captures the authorization code via the
 * redirect to `postmessage`, and returns it for exchange with the backend.
 *
 * Why popup / postmessage?
 *   - No page navigation → seamless UX
 *   - Works on mobile browsers and desktop
 *   - Compatible with future mobile app (PKCE extension)
 */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export interface GoogleOAuthResult {
  code: string;
}

/**
 * Initiate Google OAuth 2.0 Authorization Code Flow in a popup window.
 * Returns the authorization code when the user completes Google sign-in.
 *
 * @throws Error if the popup is blocked, user cancels, or Google returns an error.
 */
export async function initiateGoogleLogin(): Promise<GoogleOAuthResult> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. ' +
      'Add it to your .env.local file.'
    );
  }

  // Build the Google OAuth authorization URL
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: 'postmessage',   // tells Google to use postMessage to the opener
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',      // always show account picker
  });

  const authUrl = `${GOOGLE_OAUTH_URL}?${params.toString()}`;

  return new Promise((resolve, reject) => {
    // Open a centered popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top},` +
        'scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      reject(new Error('Popup was blocked. Please allow popups for this site.'));
      return;
    }

    // Listen for the authorization code message from Google's redirect
    const messageHandler = (event: MessageEvent) => {
      // Security: only accept messages from accounts.google.com
      // (Google uses postMessage from the popup to the opener)
      if (!event.origin.includes('accounts.google.com')) {
        // Also accept from our own origin (some setups)
        if (event.origin !== window.location.origin) return;
      }

      const data = event.data;

      // Google sends the code in different formats depending on config
      if (data?.code) {
        cleanup();
        resolve({ code: data.code });
        return;
      }

      if (data?.error) {
        cleanup();
        reject(new Error(`Google OAuth error: ${data.error}`));
        return;
      }
    };

    // Poll for popup closure (user closed without completing)
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error('Google sign-in was cancelled.'));
      }
    }, 500);

    const cleanup = () => {
      window.removeEventListener('message', messageHandler);
      clearInterval(pollTimer);
      if (!popup.closed) popup.close();
    };

    window.addEventListener('message', messageHandler);

    // Fallback: check popup URL for the code (for backends that redirect to a page)
    const urlPollTimer = setInterval(() => {
      try {
        if (popup.closed) return;
        const popupUrl = popup.location.href;
        if (popupUrl && popupUrl !== 'about:blank') {
          const url = new URL(popupUrl);
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (code) {
            clearInterval(urlPollTimer);
            cleanup();
            resolve({ code });
          } else if (error) {
            clearInterval(urlPollTimer);
            cleanup();
            reject(new Error(`Google OAuth error: ${error}`));
          }
        }
      } catch {
        // Cross-origin access — popup is still on Google's domain, skip
      }
    }, 200);
  });
}
