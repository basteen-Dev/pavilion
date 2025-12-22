import { LayoutDashboard, Package, FileText, ShoppingCart, Settings, HelpCircle, ChevronLeft, Building2, Image as ImageIcon, LayoutList } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export function AdminSidebar({ collapsed, setCollapsed }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', sublabel: 'Overview & Analytics', icon: LayoutDashboard, href: '/admin/dashboard' },
        { id: 'products', label: 'Products', sublabel: 'Manage Inventory', icon: Package, href: '/admin/products' },
        { id: 'quotations', label: 'Quotations', sublabel: 'Build & Track Quotes', icon: FileText, href: '/admin/quotations' },
        { id: 'orders', label: 'Orders', sublabel: 'Order Management', icon: ShoppingCart, href: '/admin/orders' },
        { id: 'customers', label: 'Customers', sublabel: 'Customer Database', icon: Building2, href: '/admin/customers' },
        { id: 'cms', label: 'CMS Components', sublabel: 'Content Management', icon: FileText, isHeader: true },
        { id: 'banners', label: 'Banners', sublabel: 'Home Page Sliders', icon: ImageIcon, href: '/admin/banners' },
        { id: 'blogs', label: 'Blogs', sublabel: 'News & Articles', icon: FileText, href: '/admin/blogs' },
        { id: 'cms-pages', label: 'Pages', sublabel: 'Static Pages', icon: LayoutList, href: '/admin/cms-pages' },
    ]

    const bottomItems = [
        { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
        { id: 'help', label: 'Help', icon: HelpCircle, href: '/admin/help' },
    ]

    const pathname = usePathname()

    // Improve active state detection
    const isActive = (item) => {
        if (!item.href) return false
        if (item.href === '/admin/dashboard') {
            return pathname === '/admin/dashboard'
        }
        return pathname.startsWith(item.href)
    }

    return (
        <aside className={`bg-white border-r min-h-[calc(100vh-64px)] flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
            <div className="p-4">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                >
                    <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
                {menuItems.map((item) => {
                    if (item.isHeader) {
                        if (collapsed) return <div key={item.id} className="h-4"></div>
                        return (
                            <div key={item.id} className="px-3 pt-4 pb-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive(item)
                                ? 'bg-red-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && (
                                <div className="text-left">
                                    <p className="font-medium text-sm">{item.label}</p>
                                    <p className={`text-xs ${isActive(item) ? 'text-white/70' : 'text-gray-500'}`}>
                                        {item.sublabel}
                                    </p>
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-3 space-y-1 mt-auto border-t border-gray-100">
                {bottomItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item)
                            ? 'bg-red-50 text-red-600'
                            : 'hover:bg-gray-100 text-gray-700'
                            }`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.label}</span>}
                    </Link>
                ))}
            </div>
        </aside>
    )
}
