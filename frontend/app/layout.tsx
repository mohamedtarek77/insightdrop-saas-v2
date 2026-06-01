import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsightDrop – Instant Sales Analytics",
  description:
    "Upload your sales data. Get instant KPIs and charts. Zero data stored. Enterprise privacy, zero-config setup.",
  openGraph: {
    title: "InsightDrop – Instant Sales Analytics",
    description: "Upload. Analyze. Done. Your data never leaves your session.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-ink text-ink-50 antialiased">{children}</body>
    </html>
  );
}
