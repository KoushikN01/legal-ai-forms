// Admin API Client
// Handles admin-specific API requests with proper authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class AdminApiClient {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token')
    console.log('[AdminAPI] Token from localStorage:', token ? 'Present' : 'Missing')
    console.log('[AdminAPI] Token value:', token)
    console.log('[AdminAPI] localStorage keys:', Object.keys(localStorage))
    
    if (!token) {
      console.error('[AdminAPI] No token found in localStorage')
      throw new Error('No authentication token found')
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`
      const headers = this.getAuthHeaders()
      
      console.log(`[AdminAPI] Making request to: ${url}`)
      console.log(`[AdminAPI] Headers:`, headers)
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      console.log(`[AdminAPI] Response status: ${response.status}`)
      console.log(`[AdminAPI] Response headers:`, Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`[AdminAPI] Error response body:`, errorText)
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.')
        } else if (response.status === 403) {
          throw new Error('Admin privileges required.')
        } else {
          throw new Error(`Request failed with status ${response.status}: ${errorText}`)
        }
      }

      return await response.json()
    } catch (error) {
      console.error(`[AdminAPI] Error making request to ${endpoint}:`, error)
      throw error
    }
  }

  // Admin submissions
  static async getSubmissions(formId?: string, status?: string) {
    const params = new URLSearchParams()
    if (formId) params.append('form_id', formId)
    if (status) params.append('status', status)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/admin/submissions?${queryString}` : '/admin/submissions'
    return this.makeRequest(endpoint)
  }

  static async updateSubmissionStatus(trackingId: string, status: string, message?: string) {
    return this.makeRequest(`/admin/submissions/${trackingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, message })
    })
  }

  static async deleteSubmission(trackingId: string) {
    return this.makeRequest(`/admin/submissions/${trackingId}`, {
      method: 'DELETE'
    })
  }

  static async downloadSubmissionPDF(trackingId: string) {
    const url = `${API_BASE_URL}/admin/submissions/${trackingId}/pdf`
    const token = localStorage.getItem('token')
    
    console.log(`[AdminAPI] Downloading PDF for tracking ID: ${trackingId}`)
    console.log(`[AdminAPI] PDF download URL: ${url}`)
    console.log(`[AdminAPI] Token present: ${!!token}`)
    
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`[AdminAPI] PDF download response status: ${response.status}`)
      console.log(`[AdminAPI] PDF download response ok: ${response.ok}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[AdminAPI] PDF download error response:`, errorText)
        throw new Error(`Failed to download PDF: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const blob = await response.blob()
      console.log(`[AdminAPI] PDF blob size: ${blob.size} bytes`)
      
      if (blob.size === 0) {
        throw new Error('PDF file is empty')
      }
      
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${trackingId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      console.log(`[AdminAPI] PDF downloaded successfully: ${trackingId}.pdf`)
      return { success: true, message: 'PDF downloaded successfully' }
    } catch (error) {
      console.error(`[AdminAPI] PDF download error:`, error)
      throw error
    }
  }

  // Admin tickets
  static async getTickets() {
    return this.makeRequest('/admin/tickets')
  }

  static async updateTicketStatus(ticketId: string, status: string) {
    return this.makeRequest(`/admin/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  // Admin messages
  static async getMessages() {
    return this.makeRequest('/admin/messages')
  }

  static async sendMessageToUser(userId: string, message: string) {
    return this.makeRequest('/admin/messages/send', {
      method: 'POST',
      body: JSON.stringify({ userId, message })
    })
  }

  // Admin users
  static async getUsers() {
    return this.makeRequest('/admin/users')
  }

  static async updateUserStatus(userId: string, status: string) {
    return this.makeRequest(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  // Admin feedbacks
  static async getFeedbacks() {
    return this.makeRequest('/admin/feedbacks')
  }

  static async replyToFeedback(feedbackId: string, reply: string, userEmail?: string, userName?: string, feedbackType?: string) {
    return this.makeRequest(`/admin/feedbacks/${feedbackId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ 
        reply,
        user_email: userEmail,
        user_name: userName,
        feedback_type: feedbackType
      })
    })
  }

  // Admin help tickets
  static async replyToTicket(ticketId: string, reply: string, userEmail?: string, userName?: string, subject?: string) {
    return this.makeRequest(`/admin/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ 
        reply,
        user_email: userEmail,
        user_name: userName,
        subject: subject
      })
    })
  }

  // Health check
  static async healthCheck() {
    return this.makeRequest('/health')
  }
}

// Fallback data for when backend is unavailable
export const getFallbackAdminData = () => {
  return {
    submissions: JSON.parse(localStorage.getItem('adminSubmissions') || '[]'),
    tickets: JSON.parse(localStorage.getItem('helpTickets') || '[]'),
    messages: JSON.parse(localStorage.getItem('chatMessages') || '[]'),
    users: JSON.parse(localStorage.getItem('registeredUsers') || '[]'),
    feedbacks: JSON.parse(localStorage.getItem('userFeedbacks') || '[]')
  }
}

// Save data to localStorage as fallback
export const saveFallbackData = (type: string, data: any) => {
  const key = type === 'submissions' ? 'adminSubmissions' :
              type === 'tickets' ? 'helpTickets' :
              type === 'messages' ? 'chatMessages' :
              type === 'users' ? 'registeredUsers' :
              type === 'feedbacks' ? 'userFeedbacks' : null
  
  if (key) {
    localStorage.setItem(key, JSON.stringify(data))
  }
}
