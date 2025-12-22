'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

const posts = [
    {
        title: 'Choosing the Right Grade of English Willow',
        excerpt: 'Deep dive into what makes Grade 1+ willow the choice of test cricketers.',
        category: 'Guides',
        date: 'Dec 15, 2024',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600'
    },
    {
        title: 'Evolution of Modern Day Football Boots',
        excerpt: 'How light-weight synthetic materials are changing the game of speed.',
        category: 'Trends',
        date: 'Dec 10, 2024',
        image: 'https://images.unsplash.com/photo-1546519150-13867664653a?w=600'
    },
    {
        title: 'Setting up a Professional Cricket Academy',
        excerpt: 'Must-have equipment and infrastructure for elite training facilities.',
        category: 'Business',
        date: 'Dec 05, 2024',
        image: 'https://images.unsplash.com/photo-1540747913346-19e3adca174f?w=600'
    }
]

export function RecentBlogs() {
    return (
        <section className="py-24 bg-white">
            <div className="container">
                <div className="flex justify-between items-end mb-16 px-4">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-600 mb-4">Latest Insights</h2>
                        <h3 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-none">News & Field Guides</h3>
                    </div>
                    <Link href="/blog" className="hidden border-b-2 border-red-600 pb-1 text-gray-900 font-bold hover:text-red-600 transition-colors md:block">
                        View All Stories
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {posts.map((post, idx) => (
                        <Card key={idx} className="group border-none shadow-none bg-transparent">
                            <CardContent className="p-0 space-y-6">
                                <div className="relative h-72 rounded-[2rem] overflow-hidden shadow-xl mb-6">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-red-600">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                    <Clock className="w-3.5 h-3.5" />
                                    {post.date}
                                </div>

                                <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                                    {post.title}
                                </h4>

                                <p className="text-gray-500 leading-relaxed text-sm line-clamp-2">
                                    {post.excerpt}
                                </p>

                                <Link href="#" className="inline-flex items-center gap-2 text-gray-900 font-black text-sm uppercase tracking-tighter hover:gap-4 transition-all">
                                    Read Story <ArrowRight className="w-4 h-4 text-red-600" />
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
