'use client'

import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function B2BOrdersPage() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['b2b-orders'],
        queryFn: () => apiCall('/b2b/orders')
    })

    if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container py-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/b2b">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tight">My Orders</h1>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                            <tr>
                                <th className="px-6 py-4">Order #</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No historical orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {format(new Date(order.created_at), 'PPP')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                order.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                                        'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                            }>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            ₹{parseFloat(order.total).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
