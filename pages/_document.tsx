
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ar" dir="rtl">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="font-cairo">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
