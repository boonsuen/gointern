import '@/styles/globals.css';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (typeof window !== 'undefined') {
    window.onload = () => {
      document.getElementById('holderStyle')!.remove();
    };
  }

  return (
    <>
      <Head>
        <title>GoIntern</title>
        <link rel="icon" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily}, ui-sans-serif, system-ui,
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
            'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
            'Noto Color Emoji' !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: inter.style.fontFamily,
          },
        }}
      >
        <style
          id="holderStyle"
          dangerouslySetInnerHTML={{
            __html: `
                    *, *::before, *::after {
                        transition: none!important;
                    }
                    `,
          }}
        />
        <div style={{ visibility: !mounted ? 'hidden' : 'visible' }}>
          <Component {...pageProps} />
        </div>
      </ConfigProvider>
      <Toaster position="top-right" />
    </>
  );
}
