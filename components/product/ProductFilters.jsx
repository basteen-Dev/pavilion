'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

export default function ProductFilters({ brands = [], subCategories = [], priceRange = { min: 0, max: 100000 }, showSubCategories = false }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for local changes before applying
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedSubCats, setSelectedSubCats] = useState([]);
    const [price, setPrice] = useState([priceRange.min, priceRange.max]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Sync state with URL on mount
    useEffect(() => {
        const brandParam = searchParams.get('brand');
        const subParam = searchParams.get('sub_category');
        const minPrice = searchParams.get('price_min');
        const maxPrice = searchParams.get('price_max');

        if (brandParam) setSelectedBrands([brandParam]);
        if (subParam) setSelectedSubCats([subParam]);
        if (minPrice && maxPrice) setPrice([Number(minPrice), Number(maxPrice)]);
    }, [searchParams]);

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Handle Brands (single select for now as per API structure usually but UI can be multi if API supported OR)
        // Current API `products.js` expects single `brand_id`. Let's assume single select for simplicity unless refactored.
        // Actually UI mimics multi-select usually. Let's send the last selected one or clear if empty.
        // Or better: update API to support IN clause. For now, I will restricting to single selection behavior in effect or just take first.
        if (selectedBrands.length > 0) params.set('brand', selectedBrands[0]);
        else params.delete('brand');

        if (selectedSubCats.length > 0) params.set('sub_category', selectedSubCats[0]);
        else params.delete('sub_category');

        params.set('price_min', price[0]);
        params.set('price_max', price[1]);
        params.delete('page'); // Reset to page 1

        router.push(`?${params.toString()}`);
        setIsMobileOpen(false);
    };

    const clearFilters = () => {
        setSelectedBrands([]);
        setSelectedSubCats([]);
        setPrice([priceRange.min, priceRange.max]);
        router.push(window.location.pathname); // Clear search params
        setIsMobileOpen(false);
    }

    const FilterContent = () => (
        <div className="space-y-8">
            {/* Price Filter */}
            <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 border-b pb-2">Price Range</h3>
                <Slider
                    defaultValue={[priceRange.min, priceRange.max]}
                    value={price}
                    min={0}
                    max={100000}
                    step={100}
                    onValueChange={(val) => setPrice(val)}
                    className="py-4"
                />
                <div className="flex items-center justify-between text-sm font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded">₹{price[0]}</span>
                    <span className="text-gray-400">-</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">₹{price[1]}</span>
                </div>
            </div>

            {/* Sub Categories Filter */}
            {showSubCategories && subCategories.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 border-b pb-2">Category</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {subCategories.map((sub) => (
                            <div key={sub.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`sub-${sub.id}`}
                                    checked={selectedSubCats.includes(sub.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedSubCats([sub.id]); // Single select logic for now
                                        else setSelectedSubCats([]);
                                    }}
                                />
                                <Label htmlFor={`sub-${sub.id}`} className="text-sm font-medium text-gray-600 cursor-pointer">{sub.name}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Brands Filter */}
            {brands.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 border-b pb-2">Brands</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {brands.map((brand) => (
                            <div key={brand.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`brand-${brand.id}`}
                                    checked={selectedBrands.includes(brand.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedBrands([brand.id]); // Single select logic
                                        else setSelectedBrands([]);
                                    }}
                                />
                                <Label htmlFor={`brand-${brand.id}`} className="text-sm font-medium text-gray-600 cursor-pointer">{brand.name}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-4 flex flex-col gap-3">
                <Button onClick={applyFilters} className="w-full bg-red-600 hover:bg-red-700 font-bold">Apply Filters</Button>
                <Button onClick={clearFilters} variant="outline" className="w-full">Clear All</Button>
            </div>
        </div>
    );

    return (
        <>
            <div className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-24 h-fit">
                <FilterContent />
            </div>

            {/* Mobile Filter Sheet/Drawer */}
            <div className="lg:hidden mb-6">
                <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => setIsMobileOpen(true)}>
                    <Filter className="w-4 h-4" /> Filters & Sort
                </Button>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)}></div>
                    <div className="relative bg-white w-4/5 max-w-xs h-full ml-auto shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Filters</h2>
                            <button onClick={() => setIsMobileOpen(false)}><X className="w-6 h-6" /></button>
                        </div>
                        <FilterContent />
                    </div>
                </div>
            )}
        </>
    );
}
