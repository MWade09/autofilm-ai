import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { SpaceBackground } from '@/components/SpaceBackground'

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <SpaceBackground />
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent mb-4 animate-pulse">
              AutoFilm AI
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Turn any story idea into a Hollywood-style short film in under 10 minutes.
            <span className="text-purple-400 font-semibold"> Powered by AI, built for creators.</span>
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="text-lg px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg shadow-purple-500/25">
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-purple-500/50 text-white hover:bg-purple-500/10 hover:border-purple-400 shadow-lg">
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="backdrop-blur-sm bg-black/20 border border-purple-500/20 p-8 rounded-xl shadow-xl hover:bg-black/30 transition-all duration-300">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Instant Generation
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Enter your story idea and watch as AI creates a complete short film with scenes, dialogue, and visuals in minutes.
            </p>
          </div>
          <div className="backdrop-blur-sm bg-black/20 border border-blue-500/20 p-8 rounded-xl shadow-xl hover:bg-black/30 transition-all duration-300">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Professional Quality
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Hollywood-style production with multiple scenes, character development, and cinematic effects.
            </p>
          </div>
          <div className="backdrop-blur-sm bg-black/20 border border-purple-500/20 p-8 rounded-xl shadow-xl hover:bg-black/30 transition-all duration-300">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-2xl font-semibold mb-4 text-white">
              Easy Sharing
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Download your film or share it directly with a link. Perfect for social media and presentations.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="backdrop-blur-sm bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Create Your Film?
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              Join creators worldwide who are turning their stories into cinematic masterpieces.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="text-xl px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg shadow-purple-500/25 transform hover:scale-105 transition-all duration-200">
                  🚀 Start Creating Films Today
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-xl px-12 py-4 border-purple-500/50 text-white hover:bg-purple-500/10 hover:border-purple-400 shadow-lg transform hover:scale-105 transition-all duration-200">
                  🎬 Create Your First Film
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  )
}
