'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { apiCall } from '@/lib/api-client'
import { Shield, Key, User } from 'lucide-react'

export default function AdminSettingsPage() {
    const [user, setUser] = useState(null)
    const [showMFASetup, setShowMFASetup] = useState(false)
    const [mfaSecret, setMfaSecret] = useState('')
    const [mfaQR, setMfaQR] = useState('')
    const [mfaCode, setMfaCode] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
        setLoading(false)
    }, [])

    async function setupMFA() {
        try {
            const data = await apiCall('/auth/mfa/setup', { method: 'POST' })
            setMfaSecret(data.secret)
            setMfaQR(data.qrCode)
            setShowMFASetup(true)
        } catch (error) {
            toast.error(error.message)
        }
    }

    async function verifyMFA() {
        try {
            await apiCall('/auth/mfa/verify', {
                method: 'POST',
                body: JSON.stringify({ code: mfaCode })
            })
            toast.success('MFA enabled successfully!')
            setShowMFASetup(false)

            // Update local storage and state
            const userData = JSON.parse(localStorage.getItem('user'))
            userData.mfa_enabled = true
            localStorage.setItem('user', JSON.stringify(userData))
            setUser(userData)
        } catch (error) {
            toast.error(error.message)
        }
    }

    if (loading || !user) return null

    return (
        <>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account security and profile preferences.</p>
                </div>

                <div className="grid gap-6">
                    {/* Profile Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="w-5 h-5 text-gray-500" />
                                Profile Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Full Name</Label>
                                    <Input value={user.name || 'Admin User'} readOnly className="bg-gray-50" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Email Address</Label>
                                    <Input value={user.email} readOnly className="bg-gray-50" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Role</Label>
                                <div>
                                    <Badge variant="outline" className="capitalize">{user.role || 'administrator'}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="w-5 h-5 text-gray-500" />
                                Account Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="space-y-1">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        Multi-Factor Authentication
                                        {user.mfa_enabled && (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Enabled</Badge>
                                        )}
                                    </h4>
                                    <p className="text-sm text-gray-600">Add an extra layer of security to your account using an authenticator app.</p>
                                </div>
                                {!user.mfa_enabled && (
                                    <Button onClick={setupMFA} className="bg-red-600 hover:bg-red-700 text-white">
                                        Enable MFA
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 opacity-50 cursor-not-allowed">
                                <div className="space-y-1">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        Password Management
                                    </h4>
                                    <p className="text-sm text-gray-600">Change your administrative password periodically.</p>
                                </div>
                                <Button variant="outline" disabled>Change Password</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* MFA Setup Dialog */}
            <Dialog open={showMFASetup} onOpenChange={setShowMFASetup}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Setup Multi-Factor Authentication</DialogTitle>
                        <DialogDescription>
                            Scan this QR code with your authenticator app (like Google Authenticator or Authy)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {mfaQR && (
                            <div className="flex justify-center p-2 bg-white rounded-xl border-4 border-gray-50">
                                <img src={mfaQR} alt="MFA QR Code" className="w-48 h-48" />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Manual Entry Code</Label>
                            <div className="flex gap-2">
                                <Input value={mfaSecret} readOnly className="font-mono text-sm bg-gray-50" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Enter 6-digit verification code</Label>
                            <InputOTP maxLength={6} value={mfaCode} onChange={setMfaCode}>
                                <InputOTPGroup className="gap-2 justify-center w-full">
                                    <InputOTPSlot index={0} className="w-12 h-14 text-lg" />
                                    <InputOTPSlot index={1} className="w-12 h-14 text-lg" />
                                    <InputOTPSlot index={2} className="w-12 h-14 text-lg" />
                                    <InputOTPSlot index={3} className="w-12 h-14 text-lg" />
                                    <InputOTPSlot index={4} className="w-12 h-14 text-lg" />
                                    <InputOTPSlot index={5} className="w-12 h-14 text-lg" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={verifyMFA}
                            className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
                            disabled={mfaCode.length !== 6}
                        >
                            Verify and Complete Setup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
