import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthButton } from "@/components/AuthButton";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AutoFilm AI - Generate Short Films in Minutes',
  description: 'Turn any story idea into a Hollywood-style short film using AI. Create, generate, and share amazing videos instantly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FloatingParticles />
        <AuthProvider>
          <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center gap-2">
                <span className="text-3xl hidden md:inline">🎬</span> AutoFilm AI
              </h1>
              <div className="flex gap-4 items-center">
                <CreditsDisplay />
                <AuthButton />
              </div>
            </div>
          </header>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
      </body>
    </html>
  );
}
