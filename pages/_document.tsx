// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ar" dir="rtl">
        <Head>
          {/* 1. تعيين ترميز الصفحة */}
          <meta charSet="UTF-8" />

          {/* 2. preconnect للربط مع Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />

          {/* 3. تحميل مسبق (preload) لخط Cairo لتحسين الأداء */}
          <link
            rel="preload"
            as="style"
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"
            rel="stylesheet"
          />

          {/* 4. (اختياري) يمكنك إضافة favicon هنا */}
          {/* <link rel="icon" href="/favicon.ico" /> */}
        </Head>
        <body className="font-cairo bg-background text-foreground">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
