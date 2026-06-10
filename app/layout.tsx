import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "六级作文小陪练 🌷",
  description: "送给女朋友的 CET-6 作文批改助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-stone-50 font-sans text-stone-700 antialiased">
        {children}
      </body>
    </html>
  );
}
