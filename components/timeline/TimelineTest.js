import React from 'react'
import { Check } from 'lucide-react'

const TimelineTest = () => {
  // Static timeline with 15 progress bars matching the user's design
  const progressBars = Array.from({ length: 15 }, (_, index) => {
    const isActive = index < 9 // Show first 9 as completed
    
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
          `}
          style={{
            background: isActive 
              ? 'radial-gradient(50% 50% at 50% 50%, rgba(128, 255, 249, 0.15), rgba(128, 255, 249, 0.075)), linear-gradient(to top, rgb(27, 180, 204), rgb(27, 180, 204))'
              : 'rgb(20, 44, 51)',
            boxShadow: isActive 
              ? 'rgba(128, 255, 249, 0.4) 0px 0px 20px 0px'
              : 'none'
          }}
        />
      </div>
    )
  })

  const taskItems = [
    {
      text: "Initializing agent environment",
      completed: true
    },
    {
      text: "Allocating resources", 
      completed: true
    },
    {
      text: "Loading agent state",
      completed: false,
      isLoading: true
    }
  ]

  return (
    <div 
      className="max-w-lg w-full p-6 rounded-lg"
      style={{
        backgroundColor: 'rgb(15, 15, 16)',
        maxWidth: '512px'
      }}
    >
      {/* Progress Bars */}
      <div className="w-full mb-10">
        <div className="flex gap-2 justify-center">
          {progressBars}
        </div>
      </div>

      {/* Task Status Items */}
      <div className="space-y-4">
        {taskItems.map((task, index) => (
          <div key={index} className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {task.completed ? (
                <Check 
                  className="w-6 h-6"
                  style={{
                    color: 'rgb(221, 221, 230)',
                    fill: 'none',
                    stroke: 'rgb(221, 221, 230)',
                    strokeWidth: '2px',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round'
                  }}
                />
              ) : task.isLoading ? (
                <div className="w-5 h-5 relative">
                  <div 
                    className="w-full h-full rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-gray-600"></div>
              )}
            </div>
            <span 
              className={`text-sm font-mono ${
                task.completed 
                  ? 'text-gray-300' 
                  : task.isLoading 
                    ? 'text-cyan-400' 
                    : 'text-gray-500'
              }`}
              style={{
                fontFamily: 'Berkeley Mono Trial, monospace',
                color: task.completed 
                  ? 'rgb(221, 221, 230)' 
                  : task.isLoading 
                    ? 'rgb(46, 187, 229)' 
                    : 'rgb(156, 163, 175)'
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

export default TimelineTest
