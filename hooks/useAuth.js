import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token')
        if (savedToken) {
          const userData = await apiService.getCurrentUser(savedToken)
          setUser(userData.user)
          setToken(savedToken)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('token')
        setError('Session expired. Please login again.')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.login(credentials)
      
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('token', response.token)
      
      return response
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.register(userData)
      
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('token', response.token)
      
      return response
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const registerWithCoupon = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.registerWithCoupon(userData)
      
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('token', response.token)
      
      return response
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setError(null)
    localStorage.removeItem('token')
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    registerWithCoupon,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isContractor: user?.role === 'contractor',
    isUser: user?.role === 'user'
  }
}