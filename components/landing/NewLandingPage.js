'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Star,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  Users,
  Zap,
  Award,
  ArrowRight,
  Play,
  Sparkles,
  TrendingUp,
  Target,
  Gavel,
  Scale,
  Heart,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

const NewLandingPage = ({ onGetStarted }) => {
  const [email, setEmail] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const observerRef = useRef()
  const sectionsRef = useRef({})

  useEffect(() => {
    setIsVisible(true)

    // Handle scroll for navbar background
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1, rootMargin: '-10% 0px' }
    )

    // Observe all sections
    Object.values(sectionsRef.current).forEach(section => {
      if (section) observerRef.current.observe(section)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  const setSectionRef = (id) => (ref) => {
    sectionsRef.current[id] = ref
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onGetStarted) {
      onGetStarted(email)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 transition-all duration-500 ${
        scrollY > 50
          ? 'bg-black/95 backdrop-blur-xl border-b border-gray-800/50'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 animate-slide-in-left">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse-glow">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Talk-to-My-Lawyer
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">How It Works</a>
            <a href="#why-choose" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Why Choose Us</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Reviews</a>
            <Button
              variant="outline"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:scale-105 transition-all duration-300 btn-touch"
              onClick={() => onGetStarted && onGetStarted()}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-gray-800 btn-touch"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-gray-800/50 animate-slide-down">
            <div className="px-4 py-6 space-y-4">
              <a href="#how-it-works" className="block text-gray-300 hover:text-white transition-colors py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#why-choose" className="block text-gray-300 hover:text-white transition-colors py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Why Choose Us</a>
              <a href="#testimonials" className="block text-gray-300 hover:text-white transition-colors py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
              <Button
                variant="outline"
                className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 btn-touch mt-4"
                onClick={() => {
                  onGetStarted && onGetStarted()
                  setMobileMenuOpen(false)
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        ref={setSectionRef('hero')}
        className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen flex items-center"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Trust Badge */}
            <div className={`inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-3 sm:px-4 py-2 mb-6 sm:mb-8 animate-pulse-subtle hover:scale-105 transition-all duration-300 ${isVisible ? 'animate-slide-up-modern' : 'opacity-0'}`}>
              <Shield className="h-4 w-4 text-blue-400 animate-outline-glow" />
              <span className="text-xs sm:text-sm text-gray-300 font-medium animate-highlight-sweep">Trusted by 15,000+ clients nationwide</span>
            </div>

            {/* Main Headline */}
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight ${isVisible ? 'animate-slide-up-modern stagger-modern-1' : 'opacity-0'}`}>
              <span className="text-white animate-fade-in-up">Need a </span>
              <span className="relative inline-block">
                <span className="text-gradient-shift animate-text-breathe hover:scale-105 transition-transform duration-300">
                  Lawyer's Voice
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"></div>
              </span>
              <br className="hidden sm:block" />
              <span className="text-white animate-fade-in-up">Without the </span>
              <span className="relative inline-block">
                <span className="text-color-wave text-underline-animate hover:scale-105 transition-transform duration-300">
                  Legal Bill?
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0 animate-slide-reveal ${isVisible ? 'animate-slide-up-modern stagger-modern-2' : 'opacity-0'}`}>
              Get professional, lawyer-drafted letters for tenant disputes, debt collections, HR issues,
              and more. Resolve conflicts quickly and affordably with the{" "}
              <span className="text-highlight-sweep font-semibold">power of legal communication</span>.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col gap-4 justify-center items-center mb-12 sm:mb-16 px-4 sm:px-0 ${isVisible ? 'animate-slide-up-modern stagger-modern-3' : 'opacity-0'}`}>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg sm:max-w-none">
                <div className="relative group flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 sm:h-14 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20 text-base sm:text-lg backdrop-blur-sm btn-touch transition-all duration-300 hover:bg-gray-700/50"
                    required
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl"></div>
                </div>
                <Button
                  type="submit"
                  className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group btn-touch hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </form>
              <Button
                variant="outline"
                className="h-12 sm:h-14 px-6 sm:px-8 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 text-base sm:text-lg group btn-touch hover:scale-105 transition-all duration-300"
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                View Letter Types
              </Button>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto px-4 sm:px-0 ${isVisible ? 'animate-slide-up-modern stagger-modern-4' : 'opacity-0'}`}>
              <div className="text-center group hover:scale-105 transition-all duration-300 p-3 rounded-lg hover:bg-gray-800/30">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 group-hover:animate-bounce" />
                  <span className="text-sm sm:text-base text-green-400 font-medium">No Legal Fees</span>
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-all duration-300 p-3 rounded-lg hover:bg-gray-800/30">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-blue-400 mr-2 group-hover:animate-spin" />
                  <span className="text-sm sm:text-base text-blue-400 font-medium">24-48 Hour Delivery</span>
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-all duration-300 p-3 rounded-lg hover:bg-gray-800/30">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-5 w-5 text-purple-400 mr-2 group-hover:animate-pulse" />
                  <span className="text-sm sm:text-base text-purple-400 font-medium">Lawyer Reviewed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        ref={setSectionRef('how-it-works')}
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-b from-transparent to-gray-900/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 sm:mb-16 ${visibleSections.has('how-it-works') ? 'animate-slide-up-modern' : 'opacity-0 translate-y-10'} transition-all duration-800`}>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4 hover:scale-105 transition-transform duration-300 animate-pulse-subtle">
              How It Works
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
              Get professional legal letters in{" "}
              <span className="text-gradient-shift animate-outline-glow">
                three simple steps
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "1",
                title: "Choose Letter Type",
                description: "Select from our library of professional legal letter templates",
                icon: FileText,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "2",
                title: "Provide Details",
                description: "Provide your situation details through our smart form",
                icon: Users,
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "3",
                title: "Get Your Letter",
                description: "Receive a lawyer-reviewed letter ready to send",
                icon: Zap,
                color: "from-orange-500 to-red-500"
              }
            ].map((item, index) => (
              <Card
                key={index}
                className={`relative group bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer ${
                  visibleSections.has('how-it-works')
                    ? 'animate-slide-up-modern opacity-100'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6 sm:p-8 text-center relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                  <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center relative group-hover:scale-110 transition-all duration-300 animate-pulse-glow`}>
                    <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white group-hover:animate-bounce" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity blur-xl"></div>
                  </div>

                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-xs sm:text-sm animate-bounce`} style={{ animationDelay: `${index * 100}ms` }}>
                      {item.step}
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white group-hover:text-blue-300 transition-colors relative z-10">{item.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base group-hover:text-gray-300 transition-colors relative z-10">{item.description}</p>

                  {/* Hover Effect Lines */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section
        id="why-choose"
        ref={setSectionRef('why-choose')}
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 sm:mb-16 ${visibleSections.has('why-choose') ? 'animate-slide-up-modern' : 'opacity-0 translate-y-10'} transition-all duration-800`}>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-4 hover:scale-105 transition-transform duration-300 animate-pulse-subtle">
              Why Choose LawyerLetters?
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
              <span className="text-highlight-sweep animate-scale-pulse">
                Professional legal communication
              </span>{" "}
              <span className="text-white">that gets results</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: Clock,
                title: "24-48 Hour Delivery",
                description: "Fast turnaround for all letters",
                color: "text-blue-400",
                bgColor: "bg-blue-500/10"
              },
              {
                icon: Award,
                title: "Lawyer Reviewed",
                description: "Every letter is reviewed for legal consistency",
                color: "text-purple-400",
                bgColor: "bg-purple-500/10"
              },
              {
                icon: TrendingUp,
                title: "Proven Results",
                description: "95% of our letters achieve desired outcomes",
                color: "text-green-400",
                bgColor: "bg-green-500/10"
              },
              {
                icon: FileText,
                title: "Professional Format",
                description: "Proper legal formatting and language",
                color: "text-orange-400",
                bgColor: "bg-orange-500/10"
              }
            ].map((item, index) => (
              <Card
                key={index}
                className={`group bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden cursor-pointer btn-touch ${
                  visibleSections.has('why-choose')
                    ? 'animate-slide-up-modern opacity-100'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center relative z-10">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-6 rounded-full ${item.bgColor} flex items-center justify-center relative group-hover:scale-110 transition-all duration-300 animate-pulse-glow`}>
                    <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 ${item.color} group-hover:animate-bounce`} />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white group-hover:text-blue-300 transition-colors">{item.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm group-hover:text-gray-300 transition-colors">{item.description}</p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {/* Animated border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-500/50 group-hover:to-purple-500/50 rounded-lg transition-all duration-500"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        ref={setSectionRef('testimonials')}
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-b from-gray-900/50 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 sm:mb-16 ${visibleSections.has('testimonials') ? 'animate-slide-up-modern' : 'opacity-0 translate-y-10'} transition-all duration-800`}>
            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 mb-4 hover:scale-105 transition-transform duration-300 animate-pulse-subtle">
              What Our Clients Say
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
              <span className="text-color-wave animate-text-breathe">
                Real results
              </span>{" "}
              <span className="text-white">from real people</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Sarah M.",
                role: "Small Business Owner",
                content: "Got my security deposit back within 24 hours of sending the letter. Saved me thousands of avoiding the lawyer fees!",
                rating: 5,
                avatar: "S"
              },
              {
                name: "Mike R.",
                role: "Freelance Developer",
                content: "The debt collection letter I received was worth over $15,000 from a client. Professional and effective.",
                rating: 5,
                avatar: "M"
              },
              {
                name: "Jennifer L.",
                role: "Property Manager",
                content: "Tenant dispute resolved quickly with the cease & desist letter. Highly recommend!",
                rating: 5,
                avatar: "J"
              }
            ].map((testimonial, index) => (
              <Card
                key={index}
                className={`bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer group ${
                  visibleSections.has('testimonials')
                    ? 'animate-slide-up-modern opacity-100'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                  <div className="flex items-center mb-4 relative z-10">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current group-hover:animate-bounce transition-all duration-300"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 sm:mb-6 italic text-sm sm:text-base group-hover:text-gray-200 transition-colors relative z-10">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center relative z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4 group-hover:scale-110 transition-all duration-300 animate-pulse-glow">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm sm:text-base group-hover:text-blue-300 transition-colors">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{testimonial.role}</p>
                    </div>
                  </div>

                  {/* Quote decoration */}
                  <div className="absolute top-2 right-2 text-6xl text-blue-500/10 font-serif group-hover:text-blue-500/20 transition-colors">"</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        ref={setSectionRef('final-cta')}
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-b from-transparent to-gray-900"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className={`${visibleSections.has('final-cta') ? 'animate-slide-up-modern' : 'opacity-0 translate-y-10'} transition-all duration-800`}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
              <span className="text-gradient-shift animate-outline-glow text-underline-animate">
                Ready to Get Started?
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 px-4 sm:px-0">
              Join thousands of satisfied clients who resolved their legal issues with professional letters.
            </p>

            <div className="flex flex-col gap-4 justify-center items-center px-4 sm:px-0">
              <Button
                onClick={() => onGetStarted && onGetStarted()}
                className="h-12 sm:h-14 lg:h-16 px-8 sm:px-10 lg:px-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group btn-touch hover:scale-105 active:scale-95 w-full sm:w-auto max-w-sm sm:max-w-none animate-pulse-glow"
              >
                <span className="flex items-center">
                  Start Your Letter Today
                  <ChevronRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 px-4 sm:px-0">
              No hidden fees • 30-day money-back guarantee • Available nationwide
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Talk-to-My-Lawyer
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional legal letters without the legal bills.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Tenant Disputes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Debt Collection</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HR Issues</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Property Disputes</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">My Letters</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@lawyerletters.com</li>
                <li>Available Nationwide</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2023 LawyerLetters.com All rights reserved</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shimmer-continuous {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes slide-in-left {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-shimmer-continuous {
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 75%
          );
          background-size: 200% 100%;
          animation: shimmer-continuous 2s linear infinite;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }

        .btn-touch {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        @media (max-width: 768px) {
          .btn-touch {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  )
}

export default NewLandingPage
