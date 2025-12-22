'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

const API_BASE = '/api'

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  return await response.json()
}

export default function BannersManagement() {
  const [banners, setBanners] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    button_text: '',
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    loadBanners()
  }, [])

  async function loadBanners() {
    try {
      const data = await apiCall('/admin/banners')
      setBanners(data || [])
    } catch (error) {
      toast.error('Failed to load banners')
    }
  }

  async function saveBanner() {
    try {
      if (editingBanner) {
        await apiCall(`/admin/banners/${editingBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        toast.success('Banner updated!')
      } else {
        await apiCall('/admin/banners', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        toast.success('Banner created!')
      }
      setShowDialog(false)
      resetForm()
      loadBanners()
    } catch (error) {
      toast.error('Failed to save banner')
    }
  }

  async function deleteBanner(id) {
    if (!confirm('Delete this banner?')) return
    try {
      await apiCall(`/admin/banners/${id}`, { method: 'DELETE' })
      toast.success('Banner deleted')
      loadBanners()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  async function toggleBannerStatus(id, isActive) {
    try {
      await apiCall(`/admin/banners/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !isActive })
      })
      toast.success('Status updated')
      loadBanners()
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      button_text: '',
      display_order: 0,
      is_active: true
    })
    setEditingBanner(null)
  }

  function editBanner(banner) {
    setFormData(banner)
    setEditingBanner(banner)
    setShowDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="heading-lg">Homepage Banners</h2>
          <p className="text-gray-600 mt-2">Manage hero banners and promotional slides</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="glass-card overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              <img
                src={banner.image_url || 'https://via.placeholder.com/600x300'}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              {!banner.is_active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive">Hidden</Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold mb-1">{banner.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{banner.subtitle}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => editBanner(banner)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                >
                  {banner.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteBanner(banner.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Banner Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
            </div>
            <div>
              <Label>Image URL *</Label>
              <Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input value={formData.link_url} onChange={(e) => setFormData({...formData, link_url: e.target.value})} placeholder="/category/cricket" />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input value={formData.button_text} onChange={(e) => setFormData({...formData, button_text: e.target.value})} placeholder="Shop Now" />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={saveBanner}>Save Banner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
