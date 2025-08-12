'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts'
import { User, Users, Shield, PenTool, Gift, Star, Mail, LogOut, FileText, TrendingUp, Award, Crown, Scale, Gavel, CheckCircle, Download, Send, ArrowDown, Home, Phone, Clock, Copy, Building, AlertCircle, Sparkles, Zap, Target, Globe, Heart, Briefcase, ArrowRight, Play, ChevronRight, X, Eye, Calendar, MessageSquare, HandShake, CheckCheck, Users2, MapPin, PlaneTakeoff, Building2, UserCheck, Upload, ChevronLeft } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import jsPDF from 'jspdf'
import { v4 as uuidv4 } from 'uuid'
import LetterGenerationTimeline from '@/components/timeline/LetterGenerationTimeline'
import NewLandingPage from '@/components/landing/NewLandingPage'
import SubscriptionModal from '@/components/modals/SubscriptionModal'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// Enhanced Professional Legal Services Landing Page
export default function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [activeTab, setActiveTab] = useState('login')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [letters, setLetters] = useState([])
  const [refreshLetters, setRefreshLetters] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [popupShown, setPopupShown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Scroll handling for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-show popup after 3 seconds
  useEffect(() => {
    if (!popupShown && !user) {
      const timer = setTimeout(() => {
        setShowPopup(true)
        setPopupShown(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [popupShown, user])

  // Scroll functions
  const scrollToAuth = () => {
    const element = document.getElementById('get-started')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToLetterTypes = () => {
    const element = document.getElementById('letters')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToWhyChooseUs = () => {
    const element = document.getElementById('why-choose-us')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToContact = () => {
    const element = document.getElementById('contact-us')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Authentication functions
  const handleAuthSuccess = async (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    setShowAuthModal(false)
    
    try {
      const response = await fetch('/api/letters', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
      if (response.ok) {
        const data = await response.json()
        setLetters(data.letters)
      }
    } catch (error) {
      console.error('Error fetching letters:', error)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    setLetters([])
    localStorage.removeItem('token')
    window.location.reload()
  }

  const createSubscriptionCheckout = async (packageType) => {
    setLoading(true)
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ packageType })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const stripe = await stripePromise
        const result = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        })
        
        if (result.error) {
          toast.error(result.error.message)
        }
      } else {
        toast.error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  // Auto-login on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setToken(savedToken)
          
          // Fetch letters
          fetch('/api/letters', {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          })
          .then(res => res.json())
          .then(letterData => {
            if (letterData.letters) {
              setLetters(letterData.letters)
            }
          })
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
      })
    }
  }, [])

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard 
        user={user} 
        token={token} 
        handleLogout={handleLogout}
      />
    } else {
      return <UserDashboard 
        user={user} 
        token={token} 
        letters={letters} 
        handleLogout={handleLogout}
        createSubscriptionCheckout={createSubscriptionCheckout}
        loading={loading}
      />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* New Comprehensive Landing Page */}
      <NewLandingPage
        onGetStarted={(email) => {
          console.log('Get started with email:', email)
          setShowAuthModal(true)
        }}
      />

      {/* Enhanced Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}

// Enhanced Auth Modal Component
const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'user',
    couponCode: ''
  })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        onAuthSuccess(data.user, data.token)
        toast.success('Login successful!')
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = registerData.couponCode ? '/api/auth/register-with-coupon' : '/api/auth/register'
      const payload = registerData.couponCode 
        ? { ...registerData, couponCode: registerData.couponCode }
        : registerData

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        onAuthSuccess(data.user, data.token)
        toast.success('Registration successful!')
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <Card className="modal-modern max-w-md w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50"></div>
        
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 shadow-md border"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>

        <CardHeader className="relative pb-4 pt-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gradient-modern">
            {activeTab === 'login' ? 'Welcome Back' : 'Join Our Community'}
          </CardTitle>
          <p className="text-gray-600 mt-2 font-medium">
            {activeTab === 'login' 
              ? 'Sign in to access your legal letters' 
              : 'Create your account to get started'
            }
          </p>
        </CardHeader>

        <CardContent className="relative px-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 h-12 rounded-xl">
              <TabsTrigger 
                value="login" 
                className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-700 font-semibold">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="input-modern h-12 text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-700 font-semibold">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="input-modern h-12 text-base"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </a>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full btn-professional h-12 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-gray-700 font-semibold">Full Name</Label>
                  <Input
                    id="register-name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    className="input-modern h-12 text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-700 font-semibold">Email Address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    className="input-modern h-12 text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-700 font-semibold">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="input-modern h-12 text-base"
                    placeholder="Create a strong password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-role" className="text-gray-700 font-semibold">Account Type</Label>
                  <Select value={registerData.role} onValueChange={(value) => setRegisterData({...registerData, role: value})}>
                    <SelectTrigger className="input-modern h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Personal User</SelectItem>
                      <SelectItem value="contractor">Business Contractor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-coupon" className="text-gray-700 font-semibold">Referral Code (Optional)</Label>
                  <Input
                    id="register-coupon"
                    value={registerData.couponCode}
                    onChange={(e) => setRegisterData({...registerData, couponCode: e.target.value})}
                    className="input-modern h-12 text-base"
                    placeholder="Enter referral code for discount"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full btn-professional h-12 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <Sparkles className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-gray-500 text-center mt-8 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// User Dashboard Component (keeping existing functionality)
// Analytics Helper Functions
const processLettersByType = (letters) => {
  const typeCount = {}
  letters.forEach(letter => {
    const type = letter.letter_type || 'Unknown'
    typeCount[type] = (typeCount[type] || 0) + 1
  })
  
  return Object.entries(typeCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))
}

const processLettersTrend = (letters) => {
  const trend = {}
  letters.forEach(letter => {
    const date = new Date(letter.created_at).toISOString().split('T')[0]
    trend[date] = (trend[date] || 0) + 1
  })
  
  return Object.entries(trend)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(-30) // Last 30 days
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(),
      letters: count
    }))
}

const processUserGrowth = (users) => {
  const growth = {}
  users.forEach(user => {
    const date = new Date(user.created_at).toISOString().split('T')[0]
    growth[date] = (growth[date] || 0) + 1
  })
  
  return Object.entries(growth)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(-30) // Last 30 days
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(),
      users: count
    }))
}

// Admin Dashboard Component
const AdminDashboard = ({ user, token, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('users')
  const [usersData, setUsersData] = useState([])
  const [remoteEmployeesData, setRemoteEmployeesData] = useState([])
  const [lettersData, setLettersData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRemoteEmployees: 0,
    totalCouponUsage: 0,
    totalLetters: 0,
    lettersByType: [],
    userGrowth: [],
    lettersTrend: []
  })

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        
        // Fetch all users
        const usersResponse = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const usersData = await usersResponse.json()
        
        if (usersResponse.ok) {
          setUsersData(usersData.users)
          
          // Calculate stats
          const totalUsers = usersData.users.length
          const remoteEmployees = usersData.users.filter(user => user.role === 'contractor')
          const totalCouponUsage = usersData.users.filter(user => user.referral_code).length
          
          setStats(prev => ({
            ...prev,
            totalUsers,
            totalRemoteEmployees: remoteEmployees.length,
            totalCouponUsage
          }))
          
          // Get remote employees with their stats
          const remoteEmployeesWithStats = await Promise.all(
            remoteEmployees.map(async (employee) => {
              try {
                // Get contractor profile
                const contractorResponse = await fetch('/api/remote-employee/stats', {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                
                if (contractorResponse.ok) {
                  const contractorData = await contractorResponse.json()
                  return {
                    ...employee,
                    points: contractorData.points || 0,
                    total_signups: contractorData.total_signups || 0,
                    username: contractorData.username || employee.name.toLowerCase().replace(/\s+/g, '').substring(0, 5)
                  }
                }
                return {
                  ...employee,
                  points: 0,
                  total_signups: 0,
                  username: employee.name.toLowerCase().replace(/\s+/g, '').substring(0, 5)
                }
              } catch (error) {
                console.error('Error fetching contractor stats:', error)
                return {
                  ...employee,
                  points: 0,
                  total_signups: 0,
                  username: employee.name.toLowerCase().replace(/\s+/g, '').substring(0, 5)
                }
              }
            })
          )
          
          setRemoteEmployeesData(remoteEmployeesWithStats)
        }
        
        // Fetch letters count
        const lettersResponse = await fetch('/api/admin/letters', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const lettersData = await lettersResponse.json()
        
        if (lettersResponse.ok) {
          setLettersData(lettersData.letters)
          
          // Process letter analytics
          const lettersByType = processLettersByType(lettersData.letters)
          const lettersTrend = processLettersTrend(lettersData.letters)
          
          setStats(prev => ({
            ...prev,
            totalLetters: lettersData.letters.length,
            lettersByType,
            lettersTrend
          }))
        }
        
        // Process user growth analytics
        const userGrowth = processUserGrowth(usersData.users)
        setStats(prev => ({
          ...prev,
          userGrowth
        }))
        
      } catch (error) {
        console.error('Error fetching admin data:', error)
        toast.error('Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAdminData()
  }, [token])

  const getUsersByRole = (role) => {
    return usersData.filter(user => user.role === role)
  }

  const getCouponUsageStats = () => {
    const usersWithCoupons = usersData.filter(user => user.referral_code)
    const totalDiscountUsed = usersWithCoupons.reduce((sum, user) => {
      return sum + (user.discount_applied || 0)
    }, 0)
    
    return {
      totalUsages: usersWithCoupons.length,
      totalDiscountUsed,
      averageDiscount: usersWithCoupons.length > 0 ? totalDiscountUsed / usersWithCoupons.length : 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-modern">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user.name} - System Administrator</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remote Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRemoteEmployees}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Coupon Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCouponUsage}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Letters</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLetters}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-sm h-12">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users Management
            </TabsTrigger>
            <TabsTrigger value="remote-employees" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Remote Employees
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersSection users={usersData} couponStats={getCouponUsageStats()} />
          </TabsContent>

          <TabsContent value="remote-employees">
            <RemoteEmployeesSection remoteEmployees={remoteEmployeesData} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSection stats={stats} lettersData={lettersData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Users Section Component
const UsersSection = ({ users, couponStats }) => {
  const getUsersByRole = (role) => {
    return users.filter(user => user.role === role)
  }

  const regularUsers = getUsersByRole('user')
  const contractors = getUsersByRole('contractor')
  const admins = getUsersByRole('admin')

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{regularUsers.length}</div>
              <div className="text-sm text-gray-600">Regular Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{contractors.length}</div>
              <div className="text-sm text-gray-600">Contractors</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{admins.length}</div>
              <div className="text-sm text-gray-600">Administrators</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Usage Statistics */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Coupon Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{couponStats.totalUsages}</div>
              <div className="text-sm text-gray-600">Total Coupon Uses</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">${couponStats.totalDiscountUsed.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Discount Given</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">${couponStats.averageDiscount.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Average Discount</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Referral Code</th>
                  <th className="text-left p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3 text-gray-600">{user.email}</td>
                    <td className="p-3">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'contractor' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-600">{user.referral_code || 'None'}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Remote Employees Section Component
const RemoteEmployeesSection = ({ remoteEmployees }) => {
  const totalSignups = remoteEmployees.reduce((sum, employee) => sum + (employee.total_signups || 0), 0)
  const totalPoints = remoteEmployees.reduce((sum, employee) => sum + (employee.points || 0), 0)

  return (
    <div className="space-y-6">
      {/* Remote Employee Statistics */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Remote Employee Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{remoteEmployees.length}</div>
              <div className="text-sm text-gray-600">Active Remote Employees</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalSignups}</div>
              <div className="text-sm text-gray-600">Total Signups Generated</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remote Employees Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Remote Employee Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Username/Code</th>
                  <th className="text-left p-3">Signups</th>
                  <th className="text-left p-3">Points</th>
                  <th className="text-left p-3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {remoteEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{employee.name}</td>
                    <td className="p-3 text-gray-600">{employee.email}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{employee.username}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(employee.username)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{employee.total_signups || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">{employee.points || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={
                        (employee.total_signups || 0) > 10 ? 'default' : 
                        (employee.total_signups || 0) > 5 ? 'secondary' : 'outline'
                      }>
                        {(employee.total_signups || 0) > 10 ? 'Excellent' : 
                         (employee.total_signups || 0) > 5 ? 'Good' : 'New'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {remoteEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No remote employees found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const UserDashboard = ({ user, token, letters, handleLogout, createSubscriptionCheckout, loading }) => {
  const [activeTab, setActiveTab] = useState('generate')
  const [refreshLetters, setRefreshLetters] = useState(0)

  const fetchUpdatedLetters = async () => {
    setRefreshLetters(prev => prev + 1)
  }

  const subscription = user.subscription || { status: 'free', lettersRemaining: 0 }
  const hasActiveSubscription = subscription.status === 'paid' && subscription.lettersRemaining > 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(17, 17, 17)' }}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Welcome, {user.name}</h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">Manage your legal letters and subscription</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500 w-fit"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 bg-gray-800 border border-gray-600 h-12 sm:h-14">
            <TabsTrigger
              value="generate"
              className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white text-sm sm:text-base"
            >
              <PenTool className="h-4 w-4" />
              <span className="hidden sm:inline">Generate Letter</span>
              <span className="sm:hidden">Generate</span>
            </TabsTrigger>
            <TabsTrigger
              value="letters"
              className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white text-sm sm:text-base"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">My Letters</span>
              <span className="sm:hidden">Letters</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white text-sm sm:text-base"
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Subscription</span>
              <span className="sm:hidden">Plan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <DetailedLetterGenerationForm
              user={user}
              token={token}
              subscription={subscription}
              onLetterGenerated={fetchUpdatedLetters}
              createSubscriptionCheckout={createSubscriptionCheckout}
            />
          </TabsContent>

          <TabsContent value="letters">
            <MyLettersSection letters={letters} refreshKey={refreshLetters} />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionManagement 
              user={user}
              subscription={subscription}
              createSubscriptionCheckout={createSubscriptionCheckout}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Document Type Selection Component
const DocumentTypeSelector = ({ onSelect, selectedCategory, selectedType }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await fetch('/api/documents/types')
        const data = await response.json()
        setCategories(data.categories)
      } catch (error) {
        console.error('Error fetching document types:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDocumentTypes()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading document types...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Document Type</h3>
        <p className="text-gray-600">Select the type of legal document you need</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                  <CardDescription className="text-xs">{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => onSelect(category.id, type.id, type.name)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id && selectedType === type.id
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Enhanced Document Generation Form
const DetailedLetterGenerationForm = ({ user, token, subscription, onLetterGenerated, createSubscriptionCheckout }) => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedTypeName, setSelectedTypeName] = useState('')
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    businessName: '',
    address: '',
    email: user?.email || '',
    phone: '',
    recipientName: '',
    recipientBusinessName: '',
    recipientAddress: '',
    conflictType: '',
    conflictDetails: '',
    demand: '',
    deadline: '',
    additionalComments: '',
    urgencyLevel: 'standard'
  })
  const [urgencyLevel, setUrgencyLevel] = useState('standard')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [showTimeline, setShowTimeline] = useState(false)
  const [timelineStep, setTimelineStep] = useState(0)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  const conflictTypes = [
    'Debt Collection',
    'Breach of Contract', 
    'Property Dispute',
    'Employment Issue',
    'Cease & Desist',
    'Settlement Discussion',
    'Other'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newFiles = files.map(file => ({
      id: uuidv4(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded: false
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const generateLetter = async () => {
    setLoading(true)
    setShowTimeline(true)
    setTimelineStep(0)

    // Simulate timeline progression
    const progressTimer = setInterval(() => {
      setTimelineStep(prev => {
        if (prev < 5) {
          return prev + 1
        } else {
          clearInterval(progressTimer)
          return prev
        }
      })
    }, 2000)

    try {
      // Prepare form data for API
      const letterData = {
        title: `${formData.conflictType} - ${formData.recipientName}`,
        prompt: `Professional legal letter regarding ${formData.conflictType.toLowerCase()} situation. ${formData.conflictDetails}`,
        letterType: formData.conflictType.toLowerCase().replace(' ', '_'),
        formData: {
          fullName: formData.fullName,
          businessName: formData.businessName,
          yourAddress: formData.address,
          email: formData.email,
          phone: formData.phone,
          recipientName: formData.recipientName,
          recipientBusinessName: formData.recipientBusinessName,
          recipientAddress: formData.recipientAddress,
          briefDescription: formData.conflictType,
          detailedInformation: formData.conflictDetails,
          whatToAchieve: formData.demand,
          timeframe: formData.deadline,
          consequences: formData.additionalComments
        },
        urgencyLevel: formData.urgencyLevel
      }

      const response = await fetch('/api/letters/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(letterData)
      })

      const result = await response.json()

      if (response.ok) {
        // Wait for timeline to complete before showing success
        setTimeout(() => {
          clearInterval(progressTimer)
          toast.success('Letter generated successfully!')
          onLetterGenerated()
          setShowTimeline(false)
          setTimelineStep(0)
          // Reset form
          setCurrentStep(1)
          setFormData({
            fullName: user?.name || '',
            businessName: '',
            address: '',
            email: user?.email || '',
            phone: '',
            recipientName: '',
            recipientBusinessName: '',
            recipientAddress: '',
            conflictType: '',
            conflictDetails: '',
            demand: '',
            deadline: '',
            additionalComments: '',
            urgencyLevel: 'standard'
          })
          setUploadedFiles([])
        }, 12000) // Wait for timeline animation to complete
      } else {
        clearInterval(progressTimer)
        setShowTimeline(false)
        setTimelineStep(0)

        // Check if it's a subscription error
        if (response.status === 403 && result.error?.includes('No letters remaining')) {
          setShowSubscriptionModal(true)
        } else {
          toast.error(result.error || 'Failed to generate letter')
        }
      }
    } catch (error) {
      clearInterval(progressTimer)
      setShowTimeline(false)
      setTimelineStep(0)

      // Check if it's a subscription-related error
      if (error.message?.includes('subscription') || error.message?.includes('403')) {
        setShowSubscriptionModal(true)
      } else {
        toast.error('Network error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.address && formData.email && formData.phone
      case 2:
        return formData.recipientName && formData.recipientAddress
      case 3:
        return formData.conflictType && formData.conflictDetails
      case 4:
        return formData.demand && formData.deadline
      case 5:
        return true
      default:
        return false
    }
  }

  if (showTimeline) {
    return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-800 border border-gray-600 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <PenTool className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Generating Your Letter
          </CardTitle>
          <p className="text-base sm:text-lg text-blue-400 font-semibold mt-2">
            Please wait while our AI and legal experts craft your professional letter
          </p>
        </CardHeader>
        <CardContent className="flex justify-center p-4 sm:p-8">
          <LetterGenerationTimeline
            isGenerating={loading}
            currentStep={timelineStep}
            onComplete={() => {
              // Timeline animation complete
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-800 border border-gray-600 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <PenTool className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Request Service Now
          </CardTitle>
          <p className="text-base sm:text-lg text-green-400 font-semibold mt-2">
            You pay nothing for this request! There's no charge and no obligation.
          </p>
          <p className="text-gray-300 mt-2 leading-relaxed text-sm sm:text-base">
            Let's see if we can help. Complete the form below to request a local law firm draft and deliver your letter. We'll handle the rest.
          </p>
          <div className="mt-4 p-3 bg-amber-900/30 border border-amber-600/30 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                <strong>Important:</strong> We receive hundreds of requests daily. Our team prioritizes cases based on urgency and completeness of information provided.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center flex-shrink-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                    step <= currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {step}
                  </div>
                  {step < 5 && (
                    <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 ${
                      step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-300">
              Step {currentStep} of 5
            </div>
          </div>

          {/* Step 1: Your Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Your Information</h3>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">Provide your details so we can contact you and include them in the demand letter.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-gray-200 font-semibold text-sm sm:text-base">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessName" className="text-gray-200 font-semibold text-sm sm:text-base">Business Name (if applicable)</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your business name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address" className="text-gray-200 font-semibold text-sm sm:text-base">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your complete address"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-200 font-semibold text-sm sm:text-base">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-200 font-semibold text-sm sm:text-base">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recipient Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Recipient Information</h3>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">Tell us who will receive the demand letter.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipientName" className="text-gray-200 font-semibold text-sm sm:text-base">Full Name *</Label>
                  <Input
                    id="recipientName"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter recipient's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="recipientBusinessName" className="text-gray-200 font-semibold text-sm sm:text-base">Business Name (if applicable)</Label>
                  <Input
                    id="recipientBusinessName"
                    value={formData.recipientBusinessName}
                    onChange={(e) => handleInputChange('recipientBusinessName', e.target.value)}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter recipient's business name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="recipientAddress" className="text-gray-200 font-semibold text-sm sm:text-base">Address *</Label>
                <Textarea
                  id="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter recipient's complete address"
                  rows={3}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Describe the Conflict */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Describe the Conflict</h3>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">Help us understand the issue so we can craft an effective letter.</p>
              
              <div>
                <Label htmlFor="conflictType" className="text-gray-200 font-semibold text-sm sm:text-base">Type of Conflict *</Label>
                <Select value={formData.conflictType} onValueChange={(value) => handleInputChange('conflictType', value)}>
                  <SelectTrigger className="h-12 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select conflict type" className="text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {conflictTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-gray-600">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400 mt-2">
                  Examples include unpaid invoices, contract disputes, partnership disagreements, intellectual property issues, etc.
                </p>
              </div>
              
              <div>
                <Label htmlFor="conflictDetails" className="text-gray-200 font-semibold text-sm sm:text-base">Detailed Description *</Label>
                <Textarea
                  id="conflictDetails"
                  value={formData.conflictDetails}
                  onChange={(e) => handleInputChange('conflictDetails', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Provide a detailed account of the issue, including relevant dates, amounts, and any previous attempts to resolve the conflict. Be as specific as possible."
                  rows={6}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 4: Your Demand */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Your Demand</h3>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">Specify what you want the recipient to do.</p>
              
              <div>
                <Label htmlFor="demand" className="text-gray-200 font-semibold text-sm sm:text-base">What are you asking the recipient to do? *</Label>
                <Textarea
                  id="demand"
                  value={formData.demand}
                  onChange={(e) => handleInputChange('demand', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., pay a specific amount, fulfill a contractual obligation, stop a certain behavior, etc."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="deadline" className="text-gray-200 font-semibold text-sm sm:text-base">Deadline for Response *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="h-12 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 5: Additional Information */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Additional Information</h3>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">Include anything else that might help us generate your letter.</p>
              
              <div>
                <Label htmlFor="fileUpload" className="text-gray-200 font-semibold text-sm sm:text-base">Supporting Documents</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-dashed border-2 border-gray-600 hover:border-blue-500 bg-gray-700 text-gray-200 hover:bg-gray-600"
                    onClick={() => document.getElementById('fileUpload').click()}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Supporting Documents
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">
                    Upload any relevant documents, such as contracts, invoices, or correspondence.
                  </p>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-700 border border-gray-600 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-white">{file.name}</span>
                          <span className="text-xs text-gray-400 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="additionalComments" className="text-gray-200 font-semibold text-sm sm:text-base">Additional Comments</Label>
                <Textarea
                  id="additionalComments"
                  value={formData.additionalComments}
                  onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Any additional information or special requests"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-gray-600 gap-4">
            <div className="flex items-center order-2 sm:order-1">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2 bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2">
              {subscription.status === 'paid' && subscription.lettersRemaining > 0 && (
                <p className="text-sm text-gray-300 text-center">
                  {subscription.lettersRemaining} letters remaining
                </p>
              )}

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 flex items-center gap-2 shadow-lg"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={generateLetter}
                  disabled={loading || !isStepValid()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 flex items-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Generate Letter
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Modal */}
      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSelectPackage={(pkg) => {
          setShowSubscriptionModal(false)
          createSubscriptionCheckout(pkg.id)
        }}
        loading={loading}
      />
    </div>
  )
}

// My Letters Section Component
const MyLettersSection = ({ letters, refreshKey }) => {
  const [userLetters, setUserLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const token = localStorage.getItem('token')

  const fetchLetters = async () => {
    try {
      const response = await fetch('/api/letters', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserLetters(data.letters || [])
      }
    } catch (error) {
      console.error('Error fetching letters:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLetters()
  }, [refreshKey])

  const downloadLetter = (letter) => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.height
    const margin = 15
    
    // Title
    doc.setFontSize(16)
    doc.text(letter.title, margin, margin + 10)
    
    // Content
    doc.setFontSize(12)
    const splitContent = doc.splitTextToSize(letter.content, doc.internal.pageSize.width - 2 * margin)
    
    let yPos = margin + 25
    splitContent.forEach((line) => {
      if (yPos > pageHeight - margin) {
        doc.addPage()
        yPos = margin
      }
      doc.text(line, margin, yPos)
      yPos += 7
    })
    
    doc.save(`${letter.title}.pdf`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">My Letters</h3>
        <Badge variant="outline" className="px-3 py-1 bg-gray-700 border-gray-600 text-gray-200 w-fit">
          {userLetters.length} Total Letters
        </Badge>
      </div>

      {userLetters.length === 0 ? (
        <Card className="bg-gray-800 border-gray-600 p-6 sm:p-8 text-center">
          <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-200 mb-2">No Letters Yet</h4>
          <p className="text-gray-400">
            Generate your first letter using the form above to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userLetters.map((letter) => (
            <Card key={letter.id} className="bg-gray-800 border-gray-600 p-4 sm:p-6 hover:bg-gray-750 transition-all duration-200 hover:shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <h4 className="text-base sm:text-lg font-semibold text-white">{letter.title}</h4>
                    <Badge className={`${getStatusColor(letter.status)} w-fit`}>
                      {letter.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(letter.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {letter.letter_type || 'General'}
                    </span>
                    {letter.urgency_level && letter.urgency_level !== 'standard' && (
                      <Badge variant="outline" className="text-xs bg-gray-700 border-gray-600 text-gray-300">
                        {letter.urgency_level}
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-300 line-clamp-2 mb-4 text-sm sm:text-base">
                    {letter.content?.substring(0, 200)}...
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLetter(letter)
                      setShowPreview(true)
                    }}
                    className="flex items-center gap-2 bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 text-xs sm:text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLetter(letter)}
                    className="flex items-center gap-2 bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 text-xs sm:text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Letter Preview Modal */}
      {showPreview && selectedLetter && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedLetter.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <strong>Created:</strong> {formatDate(selectedLetter.created_at)}
                </div>
                <div className="text-sm">
                  <strong>Type:</strong> {selectedLetter.letter_type || 'General'}
                </div>
                <div className="text-sm">
                  <strong>Status:</strong> 
                  <Badge className={`ml-2 ${getStatusColor(selectedLetter.status)}`}>
                    {selectedLetter.status}
                  </Badge>
                </div>
              </div>
              
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed border p-4 rounded-lg bg-white">
                {selectedLetter.content}
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                <Button onClick={() => downloadLetter(selectedLetter)} className="btn-professional">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Subscription Management Component
const SubscriptionManagement = ({ user, subscription, createSubscriptionCheckout, loading }) => {
  const [currentPlan, setCurrentPlan] = useState(null)

  const subscriptionPlans = [
    {
      id: '4letters',
      name: 'Starter Package',
      letters: 4,
      price: 199,
      description: 'Perfect for small businesses',
      features: ['4 Professional Letters', 'Attorney Review', '48-Hour Delivery', 'Email Support'],
      popular: false
    },
    {
      id: '6letters',
      name: 'Professional Package',
      letters: 6,
      price: 279,
      description: 'Most popular choice',
      features: ['6 Professional Letters', 'Attorney Review', '24-Hour Delivery', 'Priority Support', 'Document Templates'],
      popular: true
    },
    {
      id: '8letters',
      name: 'Business Package',
      letters: 8,
      price: 349,
      description: 'For growing businesses',
      features: ['8 Professional Letters', 'Senior Attorney Review', '12-Hour Delivery', 'Priority Support', 'Document Templates', 'Legal Consultation'],
      popular: false
    }
  ]

  useEffect(() => {
    if (subscription?.packageType) {
      const plan = subscriptionPlans.find(p => p.id === subscription.packageType)
      setCurrentPlan(plan)
    }
  }, [subscription])

  const formatPrice = (price) => {
    return (price / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    })
  }

  const getSubscriptionStatus = () => {
    if (subscription?.status === 'paid' && subscription?.lettersRemaining > 0) {
      return {
        status: 'active',
        message: `${subscription.lettersRemaining} letters remaining`,
        color: 'text-green-600'
      }
    } else if (subscription?.status === 'paid' && subscription?.lettersRemaining === 0) {
      return {
        status: 'expired',
        message: 'No letters remaining - Time to upgrade!',
        color: 'text-amber-600'
      }
    } else {
      return {
        status: 'free',
        message: 'Free plan - Upgrade for full access',
        color: 'text-gray-600'
      }
    }
  }

  const statusInfo = getSubscriptionStatus()

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <Card className="card-modern p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gradient-modern">Current Subscription</h3>
          <Badge variant="outline" className={`px-3 py-1 ${statusInfo.color}`}>
            {statusInfo.status.toUpperCase()}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {subscription?.lettersRemaining || 0}
            </div>
            <div className="text-sm text-gray-600">Letters Remaining</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {currentPlan?.name || 'Free Plan'}
            </div>
            <div className="text-sm text-gray-600">Current Package</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {subscription?.currentPeriodEnd ? 
                new Date(subscription.currentPeriodEnd).toLocaleDateString() : 
                'N/A'
              }
            </div>
            <div className="text-sm text-gray-600">Renewal Date</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className={`text-center font-medium ${statusInfo.color}`}>
            {statusInfo.message}
          </p>
        </div>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h3 className="text-2xl font-bold text-gradient-modern mb-6 text-center">
          Choose Your Package
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id} className={`card-modern relative overflow-hidden ${
              plan.popular ? 'border-2 border-blue-500' : ''
            }`}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <CardContent className={`p-6 ${plan.popular ? 'pt-12' : ''}`}>
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPrice(plan.price / plan.letters)} per letter
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => createSubscriptionCheckout(plan.id)}
                  disabled={loading}
                  className={`w-full h-12 font-semibold ${
                    plan.popular ? 'btn-professional' : 'btn-outline-modern'
                  }`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    <>
                      {currentPlan?.id === plan.id ? 'Current Plan' : 'Select Plan'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Additional Features */}
      <Card className="card-modern p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Why Choose Our Professional Letters?
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <h5 className="font-semibold text-gray-800 mb-2">Attorney Reviewed</h5>
            <p className="text-sm text-gray-600">Every letter reviewed by licensed attorneys</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h5 className="font-semibold text-gray-800 mb-2">Fast Delivery</h5>
            <p className="text-sm text-gray-600">Professional letters delivered within 48 hours</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <h5 className="font-semibold text-gray-800 mb-2">High Success Rate</h5>
            <p className="text-sm text-gray-600">95% of our letters achieve desired outcomes</p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-amber-600" />
            </div>
            <h5 className="font-semibold text-gray-800 mb-2">Satisfaction Guaranteed</h5>
            <p className="text-sm text-gray-600">100% satisfaction or money back guarantee</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
