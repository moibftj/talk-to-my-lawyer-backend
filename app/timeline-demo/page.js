'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LetterGenerationTimeline from '@/components/timeline/LetterGenerationTimeline'
import { PlayCircle, RotateCcw } from 'lucide-react'

export default function TimelineDemo() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const startDemo = () => {
    setIsGenerating(true)
    setCurrentStep(1)
    
    // Simulate progressive steps
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 5) {
          return prev + 1
        } else {
          clearInterval(timer)
          setIsGenerating(false)
          return prev
        }
      })
    }, 2500)
  }

  const resetDemo = () => {
    setIsGenerating(false)
    setCurrentStep(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Letter Generation Timeline Demo
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Experience the professional timeline that users see when generating their legal letters
          </p>
        </div>

        {/* Demo Controls */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={startDemo}
            disabled={isGenerating}
            className="btn-professional flex items-center gap-2"
          >
            <PlayCircle className="h-5 w-5" />
            Start Demo
          </Button>
          <Button 
            onClick={resetDemo}
            variant="outline"
            className="btn-outline-modern flex items-center gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </Button>
        </div>

        {/* Timeline Display */}
        <Card className="card-modern">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gradient-modern">
              Letter Generation in Progress
            </CardTitle>
            <CardDescription className="text-slate-400">
              AI-powered legal letter generation with attorney review
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-8">
            <LetterGenerationTimeline 
              isGenerating={isGenerating}
              currentStep={currentStep}
              onComplete={() => {
                console.log('Timeline completed!')
              }}
            />
          </CardContent>
        </Card>

        {/* Information */}
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Timeline Features:</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Progressive step completion with visual feedback
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Animated progress bars with cyan gradient effects
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Task status indicators with loading animations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Professional monospace typography
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Dark theme optimized for legal applications
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
