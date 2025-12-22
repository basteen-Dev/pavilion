'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

export function ImageUploader({
    value = [],
    onChange,
    maxFiles = 1,
    accept = 'image/*',
    className = ''
}) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef(null)

    // Normalize value to array
    const files = Array.isArray(value) ? value : (value ? [value] : [])

    const handleFileSelect = async (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (selectedFiles.length === 0) return

        if (files.length + selectedFiles.length > maxFiles) {
            toast.error(`You can only upload up to ${maxFiles} files`)
            return
        }

        setIsUploading(true)
        const uploadedUrls = []

        try {
            for (const file of selectedFiles) {
                const formData = new FormData()
                formData.append('file', file)

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) throw new Error('Upload failed')

                const data = await res.json()
                uploadedUrls.push(data.url)
            }

            const newValues = [...files, ...uploadedUrls]
            onChange(maxFiles === 1 ? newValues[0] : newValues)
            toast.success('Upload successful')
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeFile = (indexToRemove) => {
        const newFiles = files.filter((_, index) => index !== indexToRemove)
        onChange(maxFiles === 1 ? (newFiles[0] || '') : newFiles)
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {files.length > 0 && (
                <div className={`grid gap-4 ${maxFiles === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
                    {files.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-50">
                            <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {files.length < maxFiles && (
                <div className="flex items-center gap-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        multiple={maxFiles > 1}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-32 border-dashed border-2 flex flex-col gap-2 hover:bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : (
                            <Upload className="w-8 h-8 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-500">
                            {isUploading ? 'Uploading...' : `Click to upload ${maxFiles > 1 ? 'images' : 'image'}`}
                        </span>
                    </Button>
                </div>
            )}
        </div>
    )
}
