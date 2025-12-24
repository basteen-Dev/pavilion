'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Upload, X, Loader2, FileUp, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ImageUploader({ value, onChange, label = "Image URL", maxFiles = 1 }) {
    // Determine mode based on maxFiles or value type
    const isMulti = maxFiles > 1
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)
    const { toast } = useToast()

    // Normalize value for internal use
    const values = Array.isArray(value) ? value : (value ? [value] : [])

    const handleUrlChange = (e) => {
        const url = e.target.value
        if (isMulti) {
            // In multi mode, we probably don't want a manual URL input for *adding* unless we design it specifically
            // For now, let's assume manual input is for single mode or adding one by one
            // But complex to handle array updates via text input. 
            // Let's keep it simple: Text input only updates the *first* image in single mode, 
            // or we disable it for multi mode? 
            // Actually, existing usage implies manual URL entry might be desired.
            // Let's support adding a URL in multi mode if needed, or just editing the single value.
            // For simplicity and to match common patterns: 
            // Single mode: Input updates the string.
            // Multi mode: Input adds a new URL? Or just disabled?
            // Given the UI layout, let's keep Input for single mode mostly, or hide it in multi?
        } else {
            onChange(url)
        }
    }

    // Helper to update parent
    const updateParent = (newValues) => {
        if (isMulti) {
            onChange(newValues)
        } else {
            onChange(newValues[0] || '')
        }
    }

    const handleClear = (indexToRemove) => {
        if (isMulti) {
            if (typeof indexToRemove === 'number') {
                const newValues = values.filter((_, i) => i !== indexToRemove)
                updateParent(newValues)
            } else {
                // Clear all
                updateParent([])
            }
        } else {
            onChange('')
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) handleUpload(files)
        // Reset input to allow selecting same files again
        e.target.value = ''
    }

    const handleUpload = async (files) => {
        // Validate total files
        if (isMulti && values.length + files.length > maxFiles) {
            toast({
                title: "Too many files",
                description: `You can only upload a maximum of ${maxFiles} images.`,
                variant: "destructive"
            })
            return
        }

        const validFiles = files.filter(file => file.type.startsWith('image/'))
        if (validFiles.length !== files.length) {
            toast({
                title: "Invalid file type",
                description: "Some files were skipped. Please upload only images.",
                variant: "destructive"
            })
        }

        if (validFiles.length === 0) return

        setIsUploading(true)
        const uploadedUrls = []
        let failCount = 0

        try {
            // Upload sequentially or parallel - parallel is better
            await Promise.all(validFiles.map(async (file) => {
                const formData = new FormData()
                formData.append('file', file)

                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: {
                            ...(token && { 'Authorization': `Bearer ${token}` })
                        },
                        body: formData
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Upload failed')
                    uploadedUrls.push(data.url)
                } catch (err) {
                    console.error(err)
                    failCount++
                }
            }))

            if (uploadedUrls.length > 0) {
                if (isMulti) {
                    updateParent([...values, ...uploadedUrls])
                } else {
                    // Start replace
                    updateParent([uploadedUrls[0]])
                }
                toast({
                    title: "Upload complete",
                    description: `Successfully uploaded ${uploadedUrls.length} images.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
                })
            } else if (failCount > 0) {
                toast({
                    title: "Upload failed",
                    description: "Details in console",
                    variant: "destructive"
                })
            }

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
        const files = Array.from(e.dataTransfer.files || [])
        if (files.length > 0) handleUpload(files)
    }

    return (
        <div className="space-y-3">
            <Label>{label} {isMulti && <span className="text-xs text-gray-400">({values.length}/{maxFiles})</span>}</Label>

            <div
                className={`border-2 border-dashed rounded-xl p-4 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Images Grid */}
                <div className="space-y-4">
                    {/* Display Images */}
                    {values.length > 0 ? (
                        <div className={`grid gap-4 ${isMulti ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
                            {values.map((url, index) => (
                                <div key={index + url} className="relative group aspect-square">
                                    <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg border shadow-sm bg-white"
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/100?text=Invalid+URL'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleClear(isMulti ? index : undefined)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* Add more button if space available in multi mode */}
                            {isMulti && values.length < maxFiles && (
                                <div
                                    className="aspect-square flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Plus className="w-6 h-6 mx-auto mb-1" />
                                            <span className="text-xs">Add</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Empty State
                        <div className="py-8 flex flex-col items-center justify-center text-gray-400">
                            {isUploading ? (
                                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-2" />
                            ) : (
                                <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                            )}
                            <span className="text-sm font-medium">
                                {isUploading ? 'Uploading...' : 'No images'}
                            </span>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-col gap-2">
                        {/* File Input (Hidden) */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple={isMulti}
                            onChange={handleFileSelect}
                        />

                        {/* Action Bar */}
                        <div className="flex gap-2 items-center">
                            {/* Manual URL Input - Only showing in single mode for simplicity, or complex logic needed */}
                            {!isMulti && (
                                <div className="relative flex-1">
                                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="https://example.com/image.jpg"
                                        value={value || ''}
                                        onChange={(e) => onChange(e.target.value)}
                                        className="pl-9 bg-white"
                                    />
                                </div>
                            )}

                            {/* Main Upload Button (if not already handled by grid add button) */}
                            {(!isMulti || values.length === 0) && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full sm:w-auto"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />}
                                    {values.length > 0 ? 'Replace' : 'Upload Image'}
                                </Button>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">
                                {isMulti ? `Drag & drop up to ${maxFiles} images` : 'Drag and drop or upload'}
                                <br />
                                <span className="italic opacity-70">Supports JPG, PNG, WebP. Max 5MB.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
