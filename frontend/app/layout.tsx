import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsightDrop – Instant Sales Analytics",
  description:
    "Upload your sales data. Get instant KPIs and charts. Zero data stored. Enterprise privacy, zero-config setup.",
  openGraph: {
    title: "InsightDrop – Instant Sales Analytics",
    description:
      "Upload. Analyze. Done. Your data never leaves your session.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,700&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('id-theme') || 'dark';
                  var l = localStorage.getItem('id-lang') || 'en';
                  document.documentElement.setAttribute('data-theme', t);
                  document.documentElement.setAttribute('lang', l);
                  document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}