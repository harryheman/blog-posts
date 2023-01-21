import createCache from '@emotion/cache'

// Создаем на клиенте тег `meta` с `name="emotion-insertion-point"` в начале  <head>.
// Это позволяет загружать стили MUI в первоочередном порядке.
// Это также позволяет разработчикам легко перезаписывать стили MUI, например, с помощью модулей CSS.
export default function createEmotionCache() {
  let insertionPoint

  if (typeof document !== 'undefined') {
    const emotionInsertionPoint = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]'
    )
    insertionPoint = emotionInsertionPoint ?? undefined
  }

  return createCache({ key: 'mui-style', insertionPoint })
}
