// Real-time status update system
// Connects admin status changes to user dashboard

interface StatusUpdate {
  trackingId: string
  status: string
  message: string
  timestamp: string
}

class StatusUpdater {
  private static instance: StatusUpdater
  private updateInterval: NodeJS.Timeout | null = null
  private lastCheckTime: string = new Date().toISOString()

  static getInstance(): StatusUpdater {
    if (!StatusUpdater.instance) {
      StatusUpdater.instance = new StatusUpdater()
    }
    return StatusUpdater.instance
  }

  startPolling() {
    // Check for updates every 30 seconds
    this.updateInterval = setInterval(() => {
      this.checkForUpdates()
    }, 30000)
  }

  stopPolling() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  private async checkForUpdates() {
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) return

      const user = JSON.parse(userStr)
      const userId = user.id

      // Get current submissions from localStorage
      const submissions = JSON.parse(localStorage.getItem(`userSubmissions_${userId}`) || "[]")
      
      // Check each submission for status updates
      let hasUpdates = false
      const updatedSubmissions = [...submissions]

      for (let i = 0; i < updatedSubmissions.length; i++) {
        const submission = updatedSubmissions[i]
        
        try {
          // Try to fetch latest status from backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/track/${submission.trackingId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            
            // Check if status has changed
            if (data.status !== submission.status) {
              updatedSubmissions[i] = {
                ...submission,
                status: data.status,
                updatedAt: new Date().toISOString(),
                adminMessage: data.message || submission.adminMessage
              }
              hasUpdates = true
              
              // Show notification to user
              this.showStatusNotification(submission.trackingId, data.status, data.message)
            }
          }
        } catch (error) {
          // Backend unavailable, check admin updates in localStorage
          const adminUpdates = JSON.parse(localStorage.getItem('adminStatusUpdates') || '[]')
          const relevantUpdate = adminUpdates.find((update: StatusUpdate) => 
            update.trackingId === submission.trackingId && 
            new Date(update.timestamp) > new Date(submission.updatedAt)
          )

          if (relevantUpdate) {
            updatedSubmissions[i] = {
              ...submission,
              status: relevantUpdate.status,
              updatedAt: relevantUpdate.timestamp,
              adminMessage: relevantUpdate.message
            }
            hasUpdates = true
            
            // Show notification
            this.showStatusNotification(submission.trackingId, relevantUpdate.status, relevantUpdate.message)
          }
        }
      }

      // Save updated submissions if there were changes
      if (hasUpdates) {
        localStorage.setItem(`userSubmissions_${userId}`, JSON.stringify(updatedSubmissions))
        
        // Dispatch custom event to update UI
        window.dispatchEvent(new CustomEvent('submissionStatusUpdated', {
          detail: { submissions: updatedSubmissions }
        }))
      }

      this.lastCheckTime = new Date().toISOString()
    } catch (error) {
      console.error('[StatusUpdater] Error checking for updates:', error)
    }
  }

  private showStatusNotification(trackingId: string, status: string, message: string) {
    // Create browser notification if permission granted
    if (Notification.permission === 'granted') {
      const statusLabels: Record<string, string> = {
        'approved': '✅ Approved',
        'rejected': '❌ Rejected', 
        'processing': '🔄 Processing',
        'under_review': '👀 Under Review'
      }

      new Notification(`Form Status Update`, {
        body: `Your form ${trackingId} status: ${statusLabels[status] || status}${message ? ` - ${message}` : ''}`,
        icon: '/placeholder-logo.png'
      })
    }

    // Also show in-app notification
    this.showInAppNotification(trackingId, status, message)
  }

  private showInAppNotification(trackingId: string, status: string, message: string) {
    // Create a toast notification element
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
      status === 'approved' ? 'bg-green-50 border-green-500' :
      status === 'rejected' ? 'bg-red-50 border-red-500' :
      'bg-blue-50 border-blue-500'
    } max-w-sm`
    
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '🔄'}
        </div>
        <div class="ml-3">
          <h4 class="text-sm font-medium text-gray-900">Status Update</h4>
          <p class="text-sm text-gray-600">Form ${trackingId}</p>
          <p class="text-sm text-gray-600">Status: ${status}</p>
          ${message ? `<p class="text-sm text-gray-600">${message}</p>` : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 10000)
  }

  // Method to be called by admin when status is updated
  static notifyStatusUpdate(trackingId: string, status: string, message: string) {
    const update: StatusUpdate = {
      trackingId,
      status,
      message,
      timestamp: new Date().toISOString()
    }

    // Save to localStorage for polling
    const updates = JSON.parse(localStorage.getItem('adminStatusUpdates') || '[]')
    updates.push(update)
    localStorage.setItem('adminStatusUpdates', JSON.stringify(updates))

    // Also try to notify immediately if possible
    const instance = StatusUpdater.getInstance()
    instance.showStatusNotification(trackingId, status, message)
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }
}

export default StatusUpdater
