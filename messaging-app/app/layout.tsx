import type { Metadata } from "next";
import { NotificationProvider } from "@/providers/NotificationContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Messaging APP",
    description: "App de Mensajeria",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NotificationProvider>
                    <main className="flex min-h-screen bg-gray-800">
                        {children}
                    </main>
                </NotificationProvider>
            </body>
        </html> 
    );
}
