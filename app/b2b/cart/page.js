'use client'

import { useB2BCart } from '@/components/providers/B2BCartProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function B2BCartPage() {
    const { cart, removeFromCart, addToCart, cartTotal, placeOrder, clearCart } = useB2BCart()
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleQuantityChange = (product, newQty) => {
        if (newQty < 1) return
        // We calculate difference
        const diff = newQty - product.quantity
        addToCart(product, diff)
        // Note: addToCart impl adds to existing. 
        // If diff is negative, it adds negative? 
        // Let's check B2BCartProvider. 
        // lines 43: { ...item, quantity: item.quantity + quantity }
        // Yes, if quantity is negative, it reduces.
    }

    const handleSubmitOrder = async () => {
        setIsSubmitting(true)
        try {
            await placeOrder(notes)
            toast.success('Order placed successfully!')
            router.push('/b2b/orders')
        } catch (error) {
            toast.error('Failed to place order')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (cart.length === 0) {
        return (
            <div className="container py-24 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-10 h-10 text-gray-400" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-4">Your Order List is Empty</h1>
                <p className="text-gray-500 mb-8">Add products to your list to request a quote or place a wholesale order.</p>
                <Link href="/">
                    <Button className="bg-red-600 hover:bg-red-700">Browse Catalog</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Draft Order</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                            <div className="flex p-4 gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                                    {item.images?.[0] && (
                                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mb-1">SKU: {item.sku}</p>
                                            <p className="font-semibold text-gray-900">₹{item.dealer_price || item.selling_price || item.mrp_price}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-red-600"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="flex items-center border rounded-md">
                                            <button
                                                className="px-3 py-1 hover:bg-gray-100"
                                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                                            <button
                                                className="px-3 py-1 hover:bg-gray-100"
                                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="ml-auto font-bold">
                                            ₹{((item.dealer_price || item.selling_price || item.mrp_price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div>
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Estimated Total</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="space-y-2">
                                <Label>Order Notes / Special Instructions</Label>
                                <Textarea
                                    placeholder="Add any specific requirements..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg font-bold"
                                onClick={handleSubmitOrder}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                                    </>
                                ) : (
                                    <>
                                        Submit Order <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        This is a request. Final invoice including tax and shipping will be sent for confirmation.
                    </p>
                </div>
            </div>
        </div>
    )
}
