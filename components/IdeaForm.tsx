'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles } from 'lucide-react'

export function IdeaForm() {
  const [idea, setIdea] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!idea.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: idea.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Film generation started! Check your dashboard for progress.')
        setIdea('')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch {
      alert('Failed to start film generation. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Create Your Film
        </CardTitle>
        <CardDescription>
          Enter a story idea and watch AI create a Hollywood-style short film in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="e.g., A robot falls in love with a human in a futuristic city..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={6}
              className="resize-none"
              disabled={isGenerating}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {idea.length}/500 characters
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!idea.trim() || idea.length > 500 || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Film...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Film
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
