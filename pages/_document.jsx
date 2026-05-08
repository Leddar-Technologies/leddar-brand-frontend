import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FAF7F4" />
        <style
          dangerouslySetInnerHTML={{
            __html:
              'html,body{margin:0;padding:0;background:#FAF7F4;color:#1A1A1A;font-family:"DM Sans","Segoe UI",sans-serif}*,*::before,*::after{box-sizing:border-box}',
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
