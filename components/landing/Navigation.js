import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Scale, User } from 'lucide-react'

export function Navigation({ onGetStarted }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'nav-modern-scrolled backdrop-blur-xl bg-white/95 shadow-xl border-b border-white/20' 
        : 'nav-modern backdrop-blur-md bg-white/80'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="logo-glow relative">
              <Scale className="h-8 w-8 text-blue-600 animate-pulse-gentle" />
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-20 animate-ping"></div>
            </div>
            <h1 className="text-2xl font-bold text-gradient-brand tracking-tight">Talk-to-My-Lawyer</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('why-choose-us')} 
              className="nav-item-modern text-gray-700 hover:text-blue-600 font-medium"
            >
              Why Choose Us
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="nav-item-modern text-gray-700 hover:text-blue-600 font-medium"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('letters')} 
              className="nav-item-modern text-gray-700 hover:text-blue-600 font-medium"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('contact-us')} 
              className="nav-item-modern text-gray-700 hover:text-blue-600 font-medium"
            >
              Contact
            </button>
            <Button 
              onClick={onGetStarted}
              className="btn-professional px-6 py-2 shimmer-effect"
            >
              <User className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}