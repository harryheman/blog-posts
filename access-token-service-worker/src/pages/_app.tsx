import Footer from '@/components/Footer'
import Header from '@/components/Header'
import '@/styles/globals.css'
import registerSW from '@/utils/registerSW'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  // регистрируем СВ при запуске приложения
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerSW()
    }
  }, [])

  return (
    <>
      <Header />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  )
}
