'use client'

import { InventoryManagement } from '@/components/admin/InventoryManagement'

export default function ProductsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products Management</h1>
                <p className="text-muted-foreground mt-1">Manage your inventory, prices, and stock levels.</p>
            </div>
            <InventoryManagement />
        </div>
    )
}
