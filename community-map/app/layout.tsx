import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Pepre Community Map",
    description: "愛犬家のためのコミュニティマップ",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
                {children}
            </body>
        </html>
    );
}
