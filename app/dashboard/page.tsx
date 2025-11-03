import { IdeaForm } from '@/components/IdeaForm'
import { FilmGallery } from '@/components/FilmGallery'
import { PortalBackground } from '@/components/PortalBackground'

export default function Dashboard() {
  return (
    <div className="min-h-screen relative">
      <PortalBackground />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <IdeaForm />
          </div>

          {/* Right Column - Gallery */}
          <div className="lg:col-span-2">
            <FilmGallery />
          </div>
        </div>
      </div>
    </div>
  )
}
