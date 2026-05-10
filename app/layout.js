import { Anuphan } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-anuphan",
  display: "swap",
});

export const metadata = {
  title: "Rangsit Hospital — ระบบจองนัดหมายแพทย์ออนไลน์",
  description: "นัดหมายแพทย์ออนไลน์ รู้ทันใจ ไม่ต้องรอ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${anuphan.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900 font-sans">
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
