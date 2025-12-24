'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle, Building2, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

export default function B2BRequests() {
    const queryClient = useQueryClient()
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [isApproveOpen, setIsApproveOpen] = useState(false)
    const [discountPercentage, setDiscountPercentage] = useState(0)

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['b2b-customers'],
        queryFn: () => apiCall('/admin/b2b-customers')
    })

    const pendingCustomers = customers.filter(c => c.status === 'pending')
    const historyCustomers = customers.filter(c => c.status !== 'pending')

    const approvalMutation = useMutation({
        mutationFn: ({ status, discount }) =>
            apiCall('/admin/customers/approve', {
                method: 'POST',
                body: JSON.stringify({
                    customer_id: selectedCustomer.id,
                    status,
                    discount_percentage: discount || 0
                })
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(['b2b-customers'])
            toast.success(isApproveOpen ? 'Customer approved' : 'Customer rejected')
            setIsApproveOpen(false)
            setSelectedCustomer(null)
            setDiscountPercentage(0)
        },
        onError: (err) => toast.error(err.message)
    })

    const handleApproveClick = (customer) => {
        setSelectedCustomer(customer)
        setDiscountPercentage(customer.discount_percentage || 0)
        setIsApproveOpen(true)
    }

    const handleRejectClick = (customer) => {
        if (!confirm('Are you sure you want to reject this B2B request?')) return
        setSelectedCustomer(customer)
        approvalMutation.mutate({ status: 'rejected' })
    }

    const confirmApprove = () => {
        approvalMutation.mutate({ status: 'approved', discount: discountPercentage })
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Pending Requests</h2>
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business Details</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No pending requests
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pendingCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{customer.company_name}</span>
                                                <span className="text-xs text-muted-foreground">{customer.gstin}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{customer.name}</span>
                                                <span className="text-xs text-muted-foreground">{customer.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{customer.business_type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(customer.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRejectClick(customer)}>
                                                    <XCircle className="w-4 h-4 mr-1" /> Reject
                                                </Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveClick(customer)}>
                                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight text-muted-foreground">Request History</h2>
                <div className="rounded-md border bg-gray-50/50">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Updated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historyCustomers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.company_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={customer.status === 'approved' ? 'success' : 'destructive'} className={customer.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {customer.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{customer.status === 'approved' ? `${customer.discount_percentage}%` : '-'}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(customer.updated_at || customer.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve B2B Customer</DialogTitle>
                        <DialogDescription>
                            Set a default discount percentage for <strong>{selectedCustomer?.company_name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Discount Percentage (%)</Label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={discountPercentage}
                            onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                            className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            This discount will be applied automatically to all their orders. You can override this per-order.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
                        <Button onClick={confirmApprove} className="bg-green-600 hover:bg-green-700">Confirm Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
