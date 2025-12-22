'use client'

import { useState } from 'react'
import { QuotationsList } from '@/components/admin/QuotationsList'
import { QuotationBuilder } from '@/components/admin/QuotationBuilder'

export default function QuotationsPage() {
    const [showQuotationBuilder, setShowQuotationBuilder] = useState(false)

    return (
        <div className="space-y-6">
            {!showQuotationBuilder && (
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quotations</h1>
                    <p className="text-muted-foreground mt-1">Build, manage and track customer quotations.</p>
                </div>
            )}
            {showQuotationBuilder ? (
                <QuotationBuilder onCancel={() => setShowQuotationBuilder(false)} />
            ) : (
                <QuotationsList onCreate={() => setShowQuotationBuilder(true)} />
            )}
        </div>
    )
}
