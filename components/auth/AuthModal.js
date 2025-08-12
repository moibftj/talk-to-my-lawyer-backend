import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { User, Users, Shield, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { apiService } from '@/services/api'

export function AuthModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponValid, setCouponValid] = useState(null)
  const { login, register, registerWithCoupon } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.target)
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password')
    }

    try {
      const response = await login(credentials)
      toast.success('Login successful!')
      onSuccess(response.user, response.token)
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.target)
    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      role: formData.get('role') || 'user'
    }

    try {
      const response = await register(userData)
      toast.success('Registration successful!')
      onSuccess(response.user, response.token)
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterWithCoupon = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.target)
    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      role: formData.get('role') || 'user',
      coupon_code: couponCode
    }

    try {
      const response = await registerWithCoupon(userData)
      toast.success('Registration with coupon successful!')
      onSuccess(response.user, response.token)
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) return
    
    try {
      const response = await apiService.validateCoupon(couponCode)
      setCouponValid(response.valid)
      if (response.valid) {
        toast.success(`Valid coupon! ${response.discount_percent}% discount applied`)
      } else {
        toast.error('Invalid coupon code')
      }
    } catch (error) {
      setCouponValid(false)
      toast.error('Invalid coupon code')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-modern max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gradient-modern">
            Welcome to Talk-to-My-Lawyer
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="coupon">With Coupon</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      className="input-modern"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-professional"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join our platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      name="name"
                      required
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      required
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-role">Account Type</Label>
                    <Select name="role" defaultValue="user">
                      <SelectTrigger className="input-modern">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Regular User
                          </div>
                        </SelectItem>
                        <SelectItem value="contractor">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Remote Employee
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Administrator
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-professional"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupon">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle>Register with Referral Code</CardTitle>
                <CardDescription>Get 20% discount with referral code</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterWithCoupon} className="space-y-4">
                  <div>
                    <Label htmlFor="coupon-code">Referral Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon-code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter referral code"
                        className="input-modern"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={validateCoupon}
                        disabled={!couponCode.trim()}
                      >
                        Validate
                      </Button>
                    </div>
                    {couponValid === true && (
                      <p className="text-sm text-green-600 mt-1">✓ Valid referral code - 20% discount applied!</p>
                    )}
                    {couponValid === false && (
                      <p className="text-sm text-red-600 mt-1">✗ Invalid referral code</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="coupon-name">Full Name</Label>
                    <Input
                      id="coupon-name"
                      name="name"
                      required
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coupon-email">Email</Label>
                    <Input
                      id="coupon-email"
                      name="email"
                      type="email"
                      required
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coupon-password">Password</Label>
                    <Input
                      id="coupon-password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coupon-role">Account Type</Label>
                    <Select name="role" defaultValue="user">
                      <SelectTrigger className="input-modern">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Regular User
                          </div>
                        </SelectItem>
                        <SelectItem value="contractor">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Remote Employee
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-professional"
                    disabled={loading || !couponValid}
                  >
                    {loading ? 'Creating Account...' : 'Create Account with Discount'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle>Account Types</CardTitle>
                <CardDescription>Choose the right account for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Regular User</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Generate professional legal letters, manage subscriptions, and access all letter services.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Remote Employee</h3>
                  </div>
                  <p className="text-sm text-green-700">
                    Earn points for referrals, create referral codes, and track your performance metrics.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">Administrator</h3>
                  </div>
                  <p className="text-sm text-purple-700">
                    Full system access, user management, analytics, and administrative controls.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}