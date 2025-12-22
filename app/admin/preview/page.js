'use client';

import { useEffect, useState } from 'react';
import { Calendar, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PreviewPage() {
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const data = localStorage.getItem('previewData');
            if (data) {
                setPreviewData(JSON.parse(data));
            }
        } catch (e) {
            console.error('Failed to load preview data', e);
        } finally {
            setLoading(false);
        }
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center">Loading Preview...</div>;

    if (!previewData) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">No Preview Data Found</h1>
                <p>Please initiate preview from the editor.</p>
                <Button onClick={() => window.close()}>Close Window</Button>
            </div>
        );
    }

    const { type, data } = previewData;

    return (
        <div className="relative min-h-screen bg-white">
            {/* Preview Toolbar */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    Preview Mode
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full shadow-lg"
                    onClick={() => window.close()}
                >
                    <X className="w-4 h-4 mr-2" /> Close Preview
                </Button>
            </div>

            {/* Blog Preview */}
            {type === 'blog' && (
                <article>
                    {/* Hero Section */}
                    <div className="relative h-[400px] w-full bg-gray-900">
                        {data.image_url && (
                            <>
                                <div className="absolute inset-0 bg-black/50 z-10"></div>
                                <img
                                    src={data.image_url}
                                    alt={data.title}
                                    className="w-full h-full object-cover"
                                />
                            </>
                        )}
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <div className="container max-w-4xl text-center text-white">
                                <div className="flex items-center justify-center gap-2 mb-4 text-sm opacity-80">
                                    <Calendar className="w-4 h-4" />
                                    {new Date().toLocaleDateString()} (Draft)
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
                                    {data.title || 'Untitled Post'}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="container max-w-3xl py-12 md:py-20">
                        <div
                            className="prose prose-lg prose-red max-w-none"
                            dangerouslySetInnerHTML={{ __html: data.content || '<p>No content...</p>' }}
                        />

                        {/* Mock Tags */}
                        {data.tags && (
                            <div className="mt-12 pt-8 border-t">
                                <div className="flex flex-wrap gap-2">
                                    {data.tags.split(',').map((tag, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            )}

            {/* CMS Page Preview */}
            {type === 'cms-page' && (
                <div>
                    <div className="bg-gray-50 border-b">
                        <div className="container py-12">
                            <h1 className="text-4xl font-bold">{data.title || 'Untitled Page'}</h1>
                        </div>
                    </div>

                    <div className="container py-12">
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: data.content || '<p>No content...</p>' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
