import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, PenTool, ArrowRight, Play, CheckCircle, Clock } from 'lucide-react'

export function HeroSection({ onGetStarted, onViewServices }) {
  return (
    <section className="hero-section relative pt-24 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up-modern">
            <div className="space-y-6">
              <Badge variant="outline" className="badge-shimmer px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                Fast, Affordable, Zero-Hassle Business Conflict Resolution
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gradient-hero">
                Professional Legal Letters for
                <span className="block text-gradient-animated mt-2">
                  Business Conflicts
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Get expert-crafted legal letters to resolve business disputes, debt collection, 
                contract issues, and more. Professional attorney-reviewed correspondence 
                delivered in 48 hours.
              </p>

              <div className="flex items-center space-x-6 text-lg">
                <div className="flex items-center space-x-2 text-green-600 font-semibold">
                  <CheckCircle className="h-5 w-5" />
                  <span>Starting at $79</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                  <Clock className="h-5 w-5" />
                  <span>48-Hour Delivery</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="btn-professional h-14 px-8 text-lg font-semibold shimmer-effect"
                onClick={onGetStarted}
              >
                <PenTool className="h-5 w-5 mr-2" />
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-outline-modern h-14 px-8 text-lg font-semibold"
                onClick={onViewServices}
              >
                <Play className="h-5 w-5 mr-2" />
                View Services
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10,000+</div>
                <div className="text-sm text-gray-600">Letters Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24hr</div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-scale-in-modern stagger-modern-2">
            <div className="hero-image-container relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl animate-pulse-gentle"></div>
              <img 
                src="https://images.unsplash.com/photo-1662104935883-e9dd0619eaba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsYXd5ZXJ8ZW58MHx8fGJsdWV8MTc1MjM4OTk5OXww&ixlib=rb-4.1.0&q=85"
                alt="Professional Legal Services"
                className="hero-image relative z-10 w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent rounded-3xl z-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}