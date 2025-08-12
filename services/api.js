// API service layer for centralized API calls
class ApiService {
  constructor() {
    this.baseURL = '/api'
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    })
  }

  async registerWithCoupon(userData) {
    return this.request('/auth/register-with-coupon', {
      method: 'POST',
      body: userData,
    })
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    })
  }

  async getCurrentUser(token) {
    return this.request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // Letter endpoints
  async generateLetter(letterData, token) {
    return this.request('/letters/generate', {
      method: 'POST',
      body: letterData,
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  async getUserLetters(token) {
    return this.request('/letters', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  async getLetterById(id, token) {
    return this.request(`/letters/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  async sendLetter(id, recipientEmail, token) {
    return this.request(`/letters/${id}/send`, {
      method: 'POST',
      body: { recipientEmail },
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // Subscription endpoints
  async createCheckoutSession(packageType, token) {
    return this.request('/subscription/create-checkout', {
      method: 'POST',
      body: { packageType },
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // Coupon endpoints
  async validateCoupon(couponCode) {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: { coupon_code: couponCode },
    })
  }

  async createCoupon(couponData, token) {
    return this.request('/coupons/create', {
      method: 'POST',
      body: couponData,
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  async getCoupons(token) {
    return this.request('/coupons', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // Contractor/Remote Employee endpoints
  async getContractorStats(token) {
    return this.request('/contractor/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  async getRemoteEmployeeStats(token) {
    return this.request('/remote-employee/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // Admin endpoints
  async getAdminUsers(token) {
    return this.request('/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  async getAdminLetters(token) {
    return this.request('/admin/letters', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // Document endpoints
  async getDocumentTypes() {
    return this.request('/documents/types')
  }

  async generateDocument(documentData, token) {
    return this.request('/documents/generate', {
      method: 'POST',
      body: documentData,
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export const apiService = new ApiService()
export default apiService