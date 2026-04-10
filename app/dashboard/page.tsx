'use client'

import { useState } from 'react'
import { IdeaForm } from '@/components/IdeaForm'
import { FilmGallery } from '@/components/FilmGallery'
import { PortalBackground } from '@/components/PortalBackground'

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen relative">
      <PortalBackground />
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-8">
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <IdeaForm onRefresh={handleRefresh} />
          </div>

          {/* Right Column - Gallery */}
          <div className="lg:col-span-2">
            <FilmGallery key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  )
}
