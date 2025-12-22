"use client";

import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib/api-client';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BlogDetailPage({ params }) {
    const { slug } = params;

    const { data: blog, isLoading } = useQuery({
        queryKey: ['blog', slug],
        queryFn: () => apiCall(`/blogs/slug/${slug}`)
    });

    if (isLoading) {
        return <div className="container py-20 text-center">Loading...</div>;
    }

    if (!blog) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
                <Link href="/blogs" className="text-red-600 hover:underline">← Back to Blogs</Link>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full bg-gray-900">
                {blog.image_url && (
                    <>
                        <div className="absolute inset-0 bg-black/50 z-10"></div>
                        <img
                            src={blog.image_url}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                    </>
                )}
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="container max-w-4xl text-center text-white">
                        <div className="flex items-center justify-center gap-2 mb-4 text-sm opacity-80">
                            <Calendar className="w-4 h-4" />
                            {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
                            {blog.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container max-w-3xl py-12 md:py-20">
                <Link href="/blogs" className="inline-flex items-center text-muted-foreground hover:text-red-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blogs
                </Link>

                <div
                    className="prose prose-lg prose-red max-w-none"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.map((tag, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
