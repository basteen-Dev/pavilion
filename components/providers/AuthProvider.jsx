'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
    isAuthenticated: false
})

import { apiCall } from '@/lib/api-client'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token')
            const storedUser = localStorage.getItem('user')

            if (token && storedUser) {
                try {
                    let parsedUser = JSON.parse(storedUser)

                    // Verify token / Refresh profile
                    // Ideally we call /auth/me, but for now let's just fetch B2B status if needed
                    if (parsedUser.role === 'b2b_user') {
                        try {
                            const b2bProfile = await apiCall('/b2b/profile')
                            parsedUser = { ...parsedUser, b2b_status: b2bProfile.status, b2b_profile: b2bProfile }
                        } catch (err) {
                            console.error('Failed to fetch B2B profile', err)
                        }
                    }

                    setUser(parsedUser)
                } catch (e) {
                    console.error('Failed to parse user data', e)
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                }
            }
            setLoading(false)
        }

        initAuth()
    }, [])

    const login = async (token, userData) => {
        localStorage.setItem('token', token)

        let finalUser = userData
        if (userData.role === 'b2b_user') {
            try {
                // We need to set token first for apiCall to work? 
                // apiCall usually gets token from localStorage. 
                // So this is race condition if we don't handle it.
                // Assuming apiCall reads from localStorage.
                const b2bProfile = await apiCall('/b2b/profile')
                finalUser = { ...userData, b2b_status: b2bProfile.status, b2b_profile: b2bProfile }
            } catch (err) {
                console.warn('Could not fetch B2B profile on login', err)
            }
        }

        localStorage.setItem('user', JSON.stringify(finalUser))
        setUser(finalUser)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
