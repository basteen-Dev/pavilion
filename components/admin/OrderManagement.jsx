import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye, Search, X, Check, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '@/lib/api-client'

export function OrderManagement() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [selectedOrderId, setSelectedOrderId] = useState(null)
    const queryClient = useQueryClient()

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', page, debouncedSearch],
        queryFn: () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: debouncedSearch
            })
            return apiCall(`/admin/orders?${params}`)
        }
    })

    const { data: selectedOrder, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['admin-order-details', selectedOrderId],
        queryFn: () => apiCall(`/admin/orders/${selectedOrderId}`),
        enabled: !!selectedOrderId
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }) =>
            apiCall('/admin/orders/update-status', {
                method: 'POST',
                body: JSON.stringify({ order_id: orderId, status })
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-orders'])
            queryClient.invalidateQueries(['admin-order-details'])
            toast.success('Order status updated')
        },
        onError: () => toast.error('Failed to update status')
    })

    const orders = data?.orders || []
    const totalPages = data?.totalPages || 1

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Orders</h2>

            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No orders yet
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.order_number}</TableCell>
                                    <TableCell>{order.company_name}</TableCell>
                                    <TableCell>₹{parseFloat(order.total).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge className={`uppercase ${order.status === 'completed' ? 'bg-green-600' :
                                                order.status === 'approved' ? 'bg-blue-600' :
                                                    order.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'
                                            }`}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" onClick={() => setSelectedOrderId(order.id)}>
                                            <Eye className="w-4 h-4 mr-2" /> View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 flex justify-center gap-2 border-t">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center text-sm text-gray-600 px-2">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order Details: {selectedOrder?.order_number}</DialogTitle>
                    </DialogHeader>

                    {isLoadingDetails || !selectedOrder ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="space-y-8">
                            {/* Header Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Customer</p>
                                    <p className="font-bold">{selectedOrder.company_name}</p>
                                    <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                                    <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Date</p>
                                    <p className="font-bold">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Amount</p>
                                    <p className="text-2xl font-black text-gray-900">₹{parseFloat(selectedOrder.total).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div>
                                <h3 className="font-bold mb-4">Items</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                                <TableHead className="text-right">Quantity</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedOrder.items?.map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {item.images?.[0] && <img src={item.images[0]} className="w-10 h-10 rounded bg-gray-100 object-cover" />}
                                                            <div>
                                                                <p className="font-bold text-sm">{item.product_name || item.name}</p>
                                                                <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">₹{parseFloat(item.price).toLocaleString()}</TableCell>
                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                    <TableCell className="text-right font-bold">₹{(item.price * item.quantity).toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                    <p className="text-xs text-yellow-800 font-bold uppercase tracking-wider mb-1">Customer Notes</p>
                                    <p className="text-sm text-yellow-900">{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-4 border-t">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-gray-500">Update Status:</span>
                                    <Select
                                        defaultValue={selectedOrder.status}
                                        onValueChange={(val) => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: val })}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="outline" onClick={() => setSelectedOrderId(null)}>Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
