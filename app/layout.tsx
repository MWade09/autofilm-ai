import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { CreditsDisplay } from "@/components/CreditsDisplay";
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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AutoFilm AI
              </h1>
              <div className="flex gap-4 items-center">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="outline">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button>Sign Up</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <CreditsDisplay />
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
