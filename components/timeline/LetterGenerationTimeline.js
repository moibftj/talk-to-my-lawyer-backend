import React, { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

const LetterGenerationTimeline = ({ 
  isGenerating = false, 
  currentStep = 0, 
  onComplete = () => {} 
}) => {
  const [completedSteps, setCompletedSteps] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const steps = [
    {
      id: 1,
      title: "Letter received and under attorney review",
      description: "Your request has been submitted and assigned to a qualified attorney",
      completed: false
    },
    {
      id: 2, 
      title: "AI analysis and initial draft preparation",
      description: "Our AI system is analyzing your case details and generating the first draft",
      completed: false
    },
    {
      id: 3,
      title: "Attorney review and refinement", 
      description: "Legal expert is reviewing and enhancing the AI-generated content",
      completed: false
    },
    {
      id: 4,
      title: "Quality assurance and final review",
      description: "Final legal review to ensure accuracy and effectiveness",
      completed: false
    },
    {
      id: 5,
      title: "Letter ready for delivery",
      description: "Your professional legal letter is complete and ready for download",
      completed: false
    }
  ]

  useEffect(() => {
    if (isGenerating && currentStep < steps.length) {
      setIsLoading(true)
      
      // Simulate progressive completion of steps
      const timer = setTimeout(() => {
        setCompletedSteps(prev => {
          const newCompleted = Math.min(prev + 1, currentStep)
          if (newCompleted === steps.length) {
            setIsLoading(false)
            onComplete()
          }
          return newCompleted
        })
      }, 2000) // 2 seconds between steps

      return () => clearTimeout(timer)
    }
  }, [isGenerating, currentStep, completedSteps])

  const progressBars = Array.from({ length: 15 }, (_, index) => {
    const isActive = index < completedSteps * 3 // 3 bars per completed step
    const isAnimating = isLoading && index === completedSteps * 3
    
    return (
      <div
        key={index}
        className="relative w-6 h-10 bg-slate-700 rounded-sm overflow-hidden"
      >
        <div 
          className={`
            absolute inset-0 transition-all duration-300 ease-out
            ${isActive 
              ? 'bg-gradient-to-t from-cyan-500 to-cyan-400' 
              : 'bg-slate-700'
            }
            ${isAnimating ? 'animate-pulse' : ''}
          `}
          style={{
            background: isActive 
              ? 'radial-gradient(50% 50% at 50% 50%, rgba(128, 255, 249, 0.15), rgba(128, 255, 249, 0.075)), linear-gradient(to top, rgb(27, 180, 204), rgb(27, 180, 204))'
              : 'rgb(20, 44, 51)',
            boxShadow: isActive 
              ? 'rgba(128, 255, 249, 0.4) 0px 0px 20px 0px'
              : 'none'
          }}
        >
          <div 
            className={`
              w-full h-full flex items-center justify-center rounded-sm
              transition-all duration-300 ease-out
              ${isActive 
                ? 'bg-gradient-to-t from-cyan-500 to-cyan-400' 
                : ''
              }
            `}
            style={{
              background: isActive 
                ? 'radial-gradient(50% 50% at 50% 50%, rgba(128, 255, 249, 0.15), rgba(128, 255, 249, 0.075)), linear-gradient(to top, rgb(27, 180, 204), rgb(27, 180, 204))'
                : 'transparent'
            }}
          />
        </div>
      </div>
    )
  })

  const taskItems = [
    {
      text: "Initializing agent environment",
      completed: completedSteps >= 1
    },
    {
      text: "Allocating resources", 
      completed: completedSteps >= 2
    },
    {
      text: "Loading agent state",
      completed: completedSteps >= 3,
      isLoading: isLoading && completedSteps === 2
    },
    {
      text: "Analyzing case details",
      completed: completedSteps >= 4,
      isLoading: isLoading && completedSteps === 3
    },
    {
      text: "Generating legal content",
      completed: completedSteps >= 5,
      isLoading: isLoading && completedSteps === 4
    }
  ]

  return (
    <div
      className="max-w-lg w-full p-8 rounded-xl border border-cyan-500/20 shadow-2xl backdrop-blur-md relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)',
        maxWidth: '512px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 opacity-30 animate-pulse"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
        }}
      />
      {/* Progress Bars */}
      <div className="w-full mb-10 relative z-10">
        <div className="flex gap-2 justify-center">
          {progressBars}
        </div>
        {/* Subtle glow underneath progress bars */}
        <div
          className="absolute inset-0 -z-10 blur-xl opacity-20"
          style={{
            background: `linear-gradient(90deg, ${Array.from({ length: 15 }, (_, i) =>
              i < completedSteps * 3 ? 'rgba(27, 180, 204, 0.6)' : 'transparent'
            ).join(', ')})`
          }}
        />
      </div>

      {/* Task Status Items */}
      <div className="space-y-5 relative z-10">
        {taskItems.map((task, index) => (
          <div
            key={index}
            className={`flex items-center p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
              task.completed
                ? 'bg-green-500/10 border border-green-500/20'
                : task.isLoading
                  ? 'bg-cyan-500/10 border border-cyan-500/20 animate-pulse'
                  : 'bg-slate-800/30 border border-slate-600/20'
            }`}
          >
            <div className="flex-shrink-0 mr-4">
              {task.completed ? (
                <div className="relative">
                  <Check
                    className="w-6 h-6 text-green-400 drop-shadow-lg"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))'
                    }}
                  />
                  <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-20 animate-ping"></div>
                </div>
              ) : task.isLoading ? (
                <div className="w-6 h-6 relative">
                  <div
                    className="w-full h-full rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.5))'
                    }}
                  />
                  <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-20 animate-pulse"></div>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-500 bg-slate-700/50"></div>
              )}
            </div>
            <span
              className={`text-sm font-mono font-medium transition-all duration-300 ${
                task.completed
                  ? 'text-green-300'
                  : task.isLoading
                    ? 'text-cyan-300'
                    : 'text-slate-400'
              }`}
              style={{
                fontFamily: '"Berkeley Mono Trial", "Monaco", "Menlo", monospace',
                textShadow: task.completed
                  ? '0 0 10px rgba(34, 197, 94, 0.3)'
                  : task.isLoading
                    ? '0 0 10px rgba(6, 182, 212, 0.3)'
                    : 'none'
              }}
            >
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LetterGenerationTimeline
