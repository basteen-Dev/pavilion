'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, FileText, Settings, User, Package, Clock } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function B2BDashboard() {
    const { user } = useAuth()

    const { data: profile } = useQuery({
        queryKey: ['b2b-profile'],
        queryFn: () => apiCall('/b2b/profile'),
        enabled: !!user
    })

    const { data: orders = [] } = useQuery({
        queryKey: ['b2b-orders'],
        queryFn: () => apiCall('/b2b/orders'),
        enabled: !!user
    })

    const recentOrders = orders.slice(0, 5)

    if (!user) return <div className="py-20 text-center">Please login</div>

    return (
        <div className="container py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">B2B Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {profile?.company_name || user.name}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Settings className="w-4 h-4" /> Account Settings
                    </Button>
                    <Link href="/b2b/cart">
                        <Button className="bg-red-600 hover:bg-red-700 gap-2">
                            <ShoppingCart className="w-4 h-4" /> New Order
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Orders</CardTitle>
                        <Package className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</CardTitle>
                        <Clock className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Approved</CardTitle>
                        <FileText className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.filter(o => o.status === 'approved' || o.status === 'completed').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account Status</CardTitle>
                        <User className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <Badge className={`${profile?.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} hover:bg-none border-0`}>
                            {profile?.status || 'Unknown'}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Recent Orders</h2>
                    <Link href="/b2b/orders" className="text-sm font-medium text-red-600 hover:text-red-700">View All</Link>
                </div>

                <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Order #</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No orders placed yet.
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {format(new Date(order.created_at), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="uppercase text-[10px]">
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {/* Requires separate query or join for item count, assuming basic info for now */}
                                                View Details
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                ₹{parseFloat(order.total).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
