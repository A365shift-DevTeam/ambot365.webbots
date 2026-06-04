import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AMBOT 365 — Branded AI Chatbot Landing Pages",
    template: "%s | AMBOT 365",
  },
  description:
    "Launch branded AI chatbot pages under your own domain. Share your chatbot flows with customers using AMBOT 365 branded landing pages.",
  keywords: [
    "chatbot",
    "AI chatbot",
    "branded chatbot",
    "white-label chatbot",
    "chatbot landing page",
    "AMBOT 365",
  ],
  authors: [{ name: "AMBOT 365" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AMBOT 365",
    title: "AMBOT 365 — Branded AI Chatbot Landing Pages",
    description:
      "Launch branded AI chatbot pages under your own domain.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-slate-800 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
