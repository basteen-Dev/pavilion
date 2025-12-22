'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'

const API_BASE = '/api'

async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }
  
  return data
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaRequired, setMfaRequired] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          mfa_code: mfaCode || undefined 
        })
      })

      if (data.mfa_required) {
        setMfaRequired(true)
        toast.info('Please enter your 6-digit MFA code from authenticator app')
      } else {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success('Login successful!')
        
        // Check if admin/superadmin role
        if (data.user.role === 'superadmin' || data.user.role === 'admin') {
          router.push('/admin')
        } else if (data.user.role === 'b2b_customer') {
          router.push('/b2b')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610450294178-f1e30562db21?w=1920')] bg-cover bg-center opacity-10"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl mb-4 border border-white/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PAVILION SPORTS</h1>
          <p className="text-white/80 text-lg">Admin Portal</p>
        </div>

        {/* Login Card */}
        <Card className="glass-card border-white/20 animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {!mfaRequired ? (
                <>
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@pavilion.com"
                        className="pl-10 h-12 glass-card border-gray-300"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-12 glass-card border-gray-300"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* MFA Code Field */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Enter 6-Digit MFA Code
                    </Label>
                    <p className="text-xs text-gray-600 mb-3">
                      Open your authenticator app (Google Authenticator or Microsoft Authenticator) and enter the 6-digit code
                    </p>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={mfaCode}
                        onChange={setMfaCode}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-12 text-xl" />
                          <InputOTPSlot index={1} className="w-12 h-12 text-xl" />
                          <InputOTPSlot index={2} className="w-12 h-12 text-xl" />
                          <InputOTPSlot index={3} className="w-12 h-12 text-xl" />
                          <InputOTPSlot index={4} className="w-12 h-12 text-xl" />
                          <InputOTPSlot index={5} className="w-12 h-12 text-xl" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMfaRequired(false)
                      setMfaCode('')
                    }}
                    className="w-full"
                  >
                    ← Back to login
                  </Button>
                </>
              )}

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-red-600 hover:bg-red-700"
                disabled={loading || (mfaRequired && mfaCode.length !== 6)}
              >
                {loading ? (
                  'Signing in...'
                ) : mfaRequired ? (
                  'Verify & Login'
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* Demo Credentials */}
            <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Demo Admin Credentials:
              </p>
              <div className="space-y-1 text-xs text-blue-800">
                <p><strong>Email:</strong> admin@pavilionsports.com</p>
                <p><strong>Password:</strong> admin123</p>
                <p className="text-blue-600 mt-2">
                  * You'll need to setup MFA on first login
                </p>
              </div>
            </div>

            {/* Other Login Options */}
            <div className="text-center text-sm text-gray-600">
              <p>
                B2B Customer?{' '}
                <Link href="/login" className="text-red-600 hover:underline font-semibold">
                  Login here
                </Link>
              </p>
              <p className="mt-2">
                <Link href="/" className="text-gray-500 hover:text-red-600 transition">
                  ← Back to Homepage
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center text-white/80 text-sm">
          <p>🔒 Secured with MFA & JWT Authentication</p>
          <p className="text-xs text-white/60 mt-2">
            Protected by industry-standard security protocols
          </p>
        </div>
      </div>
    </div>
  )
}
