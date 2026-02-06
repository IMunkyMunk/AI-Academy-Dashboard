import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navigation } from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ParticipantProvider } from "@/components/ParticipantProvider";
import { AuthGuard } from "@/components/AuthGuard";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Academy",
  description: "AI Academy - Kyndryl AI Training Portal",
  icons: {
    icon: "/icons/icon.svg",
    shortcut: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0062FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider>
          <ClerkProvider>
            <ParticipantProvider>
              <AuthGuard>
                <Navigation />
                <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6">
                  {children}
                </main>
                <MobileBottomNav />
                <Toaster />
              </AuthGuard>
            </ParticipantProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
