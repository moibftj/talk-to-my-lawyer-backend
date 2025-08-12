'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Sparkles, Crown, Zap } from 'lucide-react'

const SubscriptionModal = ({ open, onClose, onSelectPackage, loading = false }) => {
  const [selectedPackage, setSelectedPackage] = useState(null)

  const packages = [
    {
      id: 'starter',
      name: 'Starter Package',
      letters: 4,
      price: 199.99,
      description: 'Perfect for small businesses and individual disputes',
      features: [
        '4 Professional Legal Letters',
        'AI + Attorney Review',
        '48-Hour Delivery',
        'PDF Download & Email Delivery',
        'Basic Support'
      ],
      icon: Sparkles,
      color: 'blue',
      popular: false
    },
    {
      id: 'business',
      name: 'Business Package',
      letters: 6,
      price: 499.99,
      description: 'Ideal for growing businesses with multiple conflicts',
      features: [
        '6 Professional Legal Letters',
        'AI + Attorney Review',
        '24-Hour Priority Delivery',
        'PDF Download & Email Delivery',
        'Priority Support',
        'Legal Template Library'
      ],
      icon: Crown,
      color: 'purple',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Package',
      letters: 8,
      price: 999.99,
      description: 'For large organizations with frequent legal needs',
      features: [
        '8 Professional Legal Letters',
        'AI + Attorney Review',
        '12-Hour Express Delivery',
        'PDF Download & Email Delivery',
        'Dedicated Support Manager',
        'Legal Template Library',
        'Custom Letter Templates',
        'Bulk Letter Generation'
      ],
      icon: Zap,
      color: 'orange',
      popular: false
    }
  ]

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg.id)
    if (onSelectPackage) {
      onSelectPackage(pkg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border border-blue-500/20">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <DialogTitle className="text-3xl font-bold text-gradient-modern flex-1">
              Choose Your Package
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10 flex-shrink-0"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Select the perfect package for your legal letter needs. All packages include professional attorney review and guaranteed delivery.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {packages.map((pkg) => {
            const IconComponent = pkg.icon
            return (
              <Card 
                key={pkg.id}
                className={`
                  relative cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden
                  ${pkg.popular ? 'ring-2 ring-purple-500 scale-105' : ''}
                  ${selectedPackage === pkg.id ? 'ring-2 ring-blue-500' : ''}
                  card-modern hover:shadow-2xl
                `}
                onClick={() => handleSelectPackage(pkg)}
              >
                {pkg.popular && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <Badge className="bg-purple-600 text-white px-3 py-1 text-xs font-semibold">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-${pkg.color}-500 to-${pkg.color}-600 flex items-center justify-center`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">{pkg.name}</CardTitle>
                  <CardDescription className="text-slate-400 mb-4">
                    {pkg.description}
                  </CardDescription>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-1">
                      ${pkg.price}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {pkg.letters} letters • ${(pkg.price / pkg.letters).toFixed(2)} per letter
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-300">
                        <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`
                      w-full h-12 font-semibold text-lg transition-all duration-300
                      ${pkg.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' 
                        : 'btn-professional'
                      }
                      ${selectedPackage === pkg.id ? 'ring-2 ring-white' : ''}
                    `}
                    disabled={loading}
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    {loading && selectedPackage === pkg.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      `Get ${pkg.letters} Letters - $${pkg.price}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm mb-4">
            ✅ All packages include 30-day money-back guarantee
            <br />
            ✅ No hidden fees or recurring charges
            <br />
            ✅ Professional attorney review on every letter
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-xs text-slate-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Secure Checkout
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Instant Access
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              Money-Back Guarantee
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubscriptionModal
