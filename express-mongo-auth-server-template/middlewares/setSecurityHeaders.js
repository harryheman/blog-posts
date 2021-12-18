export const setSecurityHeaders = (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Referrer-Policy': 'no-referrer',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Expect-CT': 'enforce, max-age=86400',
    'Content-Security-Policy': `object-src 'none'; script-src 'self'; img-src 'self'; frame-ancestors 'self'; require-trusted-types-for 'script'; block-all-mixed-content; upgrade-insecure-requests`,
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  })
  next()
}
