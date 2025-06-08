// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ar" dir="rtl">
        <Head>
          {/* 1. تعيين ترميز الصفحة */}
          <meta charSet="UTF-8" />

          {/* 2. preconnect لتحسين تحميل الخطوط */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

          {/* 3. تحميل خط Cairo */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"
          />

          {/* 4. أيقونة المتصفح */}
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <body className="font-cairo bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
          {/* ✅ زر رجوع (للصفحات المستقلة مثل الخطأ أو loading) */}
          <div id="page-wrapper" className="min-h-screen">
            <Main />
          </div>
          <NextScript />

          {/* ✅ fallback للخط إن لم يتم تحميله تلقائيًا */}
          <noscript>
            <link
              href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"
              rel="stylesheet"
            />
          </noscript>
        </body>
      </Html>
    );
  }
}
