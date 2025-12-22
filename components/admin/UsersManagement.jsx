'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Shield, UserPlus } from 'lucide-react'

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

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'editor'
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const usersData = await apiCall('/admin/users')
      setUsers(usersData || [])
      
      // Predefined roles
      setRoles([
        { id: 'superadmin', name: 'Superadmin', description: 'Full system access' },
        { id: 'admin', name: 'Admin', description: 'Products, Customers, Quotations, Orders' },
        { id: 'collaborator', name: 'Collaborator', description: 'Quotations, Read-only Customers' },
        { id: 'editor', name: 'Editor', description: 'Products, Pages, Content' }
      ])
    } catch (error) {
      toast.error('Failed to load users')
    }
  }

  async function createUser() {
    try {
      await apiCall('/admin/users/create', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })
      toast.success('User created successfully!')
      setShowCreateDialog(false)
      setNewUser({ email: '', password: '', name: '', phone: '', role: 'editor' })
      loadData()
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  async function toggleUserStatus(userId, isActive) {
    try {
      await apiCall(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !isActive })
      })
      toast.success('User status updated')
      loadData()
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="heading-lg">User Management</h2>
          <p className="text-gray-600 mt-2">Manage admin users, editors, and collaborators</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                {role.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">{role.description}</p>
              <p className="text-2xl font-bold mt-2">
                {users.filter(u => u.role_name === role.id).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role_name === 'superadmin' ? 'default' : 'secondary'}>
                      {user.role_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.mfa_enabled ? (
                      <Badge className="bg-green-600">Enabled</Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new admin, editor, or collaborator to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Secure password"
                required
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                placeholder="+91 1234567890"
              />
            </div>
            <div>
              <Label>Role *</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full access except user management</SelectItem>
                  <SelectItem value="collaborator">Collaborator - Quotations + Read-only customers</SelectItem>
                  <SelectItem value="editor">Editor - Products + Content management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={createUser}
              disabled={!newUser.email || !newUser.password}
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
