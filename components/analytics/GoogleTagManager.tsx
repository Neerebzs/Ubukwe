/**
 * Google Tag Manager script injection component.
 *
 * Usage: Add <GoogleTagManager /> to the root layout.
 * Requires NEXT_PUBLIC_GTM_ID to be set (e.g. GTM-XXXXXXX).
 *
 * If NEXT_PUBLIC_GTM_ID is not set, this component renders nothing.
 * This allows the app to run in dev/CI without a GTM account.
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function GoogleTagManagerScript() {
  if (!GTM_ID) return null;

  return (
    <>
      {/* GTM — head script (loads the container) */}
      <script
        id="gtm-script"
        dangerouslySetInnerHTML={{
          __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
`.trim(),
        }}
      />
    </>
  );
}

export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
