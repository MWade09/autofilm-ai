import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            AutoFilm AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Turn any story idea into a Hollywood-style short film in under 10 minutes.
            Powered by AI, built for creators.
          </p>
          <div className="flex gap-4 justify-center">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              ⚡ Instant Generation
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your story idea and watch as AI creates a complete short film with scenes, dialogue, and visuals.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              🎬 Professional Quality
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Hollywood-style production with multiple scenes, character development, and cinematic effects.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              📱 Easy Sharing
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Download your film or share it directly with a link. Perfect for social media and presentations.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="text-xl px-12 py-4">
                Start Creating Films Today
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-xl px-12 py-4">
                Create Your First Film
              </Button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  )
}
