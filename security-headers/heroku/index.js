const express = require('express')
// утилита для генерации уникальных значений
// const crypto = require('crypto')

// создаем экземпляр Express-приложения
const app = express()

// посредник для генерации `nonce`
/*
const getNonce = (_, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
  next()
}
*/

// посредник для установки заголовков
// 31536000 - 365 дней
// 86400 - 1 сутки
const setSecurityHeaders = (_, res, next) => {
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

// удаляем заголовок `X-Powered-By`
app.disable('x-powered-by')
// подключаем посредника для генерации `nonce`
// app.use(getNonce)
// подключаем посредника для установки заголовков
app.use(setSecurityHeaders)
app.use(express.static('public'))

// определяем порт
const PORT = process.env.PORT || 3000
// запускам сервер
app.listen(PORT, () => {
  console.log('Сервер готов')
})
