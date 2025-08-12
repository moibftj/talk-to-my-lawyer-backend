'use client'

import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Navigation } from '@/components/landing/Navigation'
import { HeroSection } from '@/components/landing/HeroSection'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { WhyChooseUsSection } from '@/components/landing/WhyChooseUsSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { LetterTypesSection } from '@/components/landing/LetterTypesSection'
import { ContactSection } from '@/components/landing/ContactSection'
import { Footer } from '@/components/landing/Footer'
import { EngagementPopup } from '@/components/landing/EngagementPopup'
import { ParticleBackground } from '@/components/ui/ParticleBackground'

export default function App() {
  const { user, token, loading, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupShown, setPopupShown] = useState(false)

  // Auto-show popup after 3 seconds for non-authenticated users
  useEffect(() => {
    if (!popupShown && !user && !loading) {
      const timer = setTimeout(() => {
        setShowPopup(true)
        setPopupShown(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [popupShown, user, loading])

  const handleAuthSuccess = (userData, userToken) => {
    setShowAuthModal(false)
    // Auth hook will handle the state updates
  }

  const handleGetStarted = () => {
    setShowAuthModal(true)
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show appropriate dashboard for authenticated users
  if (user) {
    if (user.role === 'admin') {
      return (
        <>
          <AdminDashboard user={user} token={token} onLogout={logout} />
          <Toaster position="top-right" theme="light" />
        </>
      )
    } else {
      return (
        <>
          <UserDashboard user={user} token={token} onLogout={logout} />
          <Toaster position="top-right" theme="light" />
        </>
      )
    }
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <ParticleBackground />
      
      <Navigation onGetStarted={handleGetStarted} />
      
      <HeroSection 
        onGetStarted={handleGetStarted}
        onViewServices={() => scrollToSection('letters')}
      />
      
      <WhyChooseUsSection />
      
      <HowItWorksSection />
      
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-slide-up-modern">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Request a Professional Letter Now
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Join thousands of satisfied clients who've resolved their business conflicts 
              with our professional legal letters
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={handleGetStarted}
                className="bg-white text-blue-600 hover:bg-gray-50 h-14 px-8 text-lg font-semibold shimmer-effect rounded-lg transition-all duration-300"
              >
                Start Your Letter Now
              </button>
              <button 
                onClick={() => scrollToSection('letters')}
                className="border-white text-white hover:bg-white/10 h-14 px-8 text-lg font-semibold border-2 rounded-lg transition-all duration-300"
              >
                View Sample Letters
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <LetterTypesSection />
      
      <ContactSection onGetStarted={handleGetStarted} />
      
      <Footer />
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
      
      <EngagementPopup 
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onGetStarted={handleGetStarted}
      />
      
      <Toaster position="top-right" theme="light" />
    </div>
  )
}