'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Upload, X, Loader2, FileUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ImageUploader({ value, onChange, label = "Image URL" }) {
    const [preview, setPreview] = useState(value)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)
    const { toast } = useToast()

    const handleUrlChange = (e) => {
        const url = e.target.value
        setPreview(url)
        onChange(url)
    }

    const handleClear = () => {
        setPreview('')
        onChange('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
    }

    const handleUpload = async (file) => {
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file (JPG, PNG, WebP)",
                variant: "destructive"
            })
            return
        }

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Upload failed')

            setPreview(data.url)
            onChange(data.url)
            toast({
                title: "Image uploaded",
                description: "Image uploaded successfully",
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Upload failed",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleUpload(file)
    }

    return (
        <div className="space-y-3">
            <Label>{label}</Label>
            <div
                className={`border-2 border-dashed rounded-xl p-4 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* Preview Area */}
                    <div className="shrink-0">
                        {preview ? (
                            <div className="relative group">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border shadow-sm bg-white"
                                    onError={(e) => {
                                        e.target.src = 'https://placehold.co/100?text=Invalid+URL'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <div className="w-32 h-32 rounded-lg border-2 border-gray-100 bg-white flex flex-col items-center justify-center text-gray-400">
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                )}
                                <span className="text-[10px] font-medium uppercase tracking-wide">
                                    {isUploading ? 'Uploading...' : 'No Image'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="flex-1 space-y-3 w-full">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="https://example.com/image.jpg"
                                    value={value || ''}
                                    onChange={handleUrlChange}
                                    className="pl-9 bg-white"
                                />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />}
                                Upload
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Drag and drop an image here, or upload from your device.
                            <br />
                            <span className="italic opacity-70">Supports JPG, PNG, WebP. Max 5MB.</span>
                        </p>

                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => onChange('https://placehold.co/600x400')}>
                                Use Placeholder
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
