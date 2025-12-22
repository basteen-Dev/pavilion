'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Package, FileText } from 'lucide-react'

export default function RootAdminLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    const isLoginPage = pathname === '/admin/login'

    useEffect(() => {
        if (isLoginPage) {
            setLoading(false)
            return
        }

        const userData = localStorage.getItem('user')
        if (!userData) {
            router.push('/admin/login')
            return
        }
        setUser(JSON.parse(userData))
        setLoading(false)
    }, [router, isLoginPage])

    function handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/admin/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        )
    }

    // If it's the login page, render without the shared admin shell
    if (isLoginPage) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="flex items-center justify-between h-16 px-6">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/dashboard" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">P</span>
                            </div>
                            <div className="hidden md:block">
                                <h1 className="font-bold text-lg">Pavilion Sports</h1>
                                <p className="text-xs text-gray-500">Admin Console</p>
                            </div>
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center gap-6 mr-auto ml-10">
                        <Link href="/admin/dashboard" className="text-sm font-medium flex items-center gap-2 hover:text-red-600 transition-colors">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <Link href="/admin/products" className="text-sm font-medium flex items-center gap-2 hover:text-red-600 transition-colors">
                            <Package className="w-4 h-4" />
                            Products
                        </Link>
                        <Link href="/admin/quotations" className="text-sm font-medium flex items-center gap-2 hover:text-red-600 transition-colors">
                            <FileText className="w-4 h-4" />
                            Quotations
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-bold text-sm">
                                    {user?.email?.[0].toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium leading-none">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex">
                <AdminSidebar
                    collapsed={sidebarCollapsed}
                    setCollapsed={setSidebarCollapsed}
                />
                <main className="flex-1 overflow-auto p-8 min-h-[calc(100vh-64px)]">
                    {children}
                </main>
            </div>
        </div>
    )
}
