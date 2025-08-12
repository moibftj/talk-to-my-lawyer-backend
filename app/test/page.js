'use client'

import TimelineTest from '@/components/timeline/TimelineTest'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="space-y-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-8">
          Timeline Component Test
        </h1>
        <TimelineTest />
      </div>
    </div>
  )
}
