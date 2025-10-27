// Submission Tracking and Notification Service
// Manages form submissions, tracking, and user notifications

export type SubmissionStatus = "submitted" | "processing" | "under_review" | "approved" | "rejected" | "completed"

export interface SubmissionEvent {
  timestamp: Date
  status: SubmissionStatus
  message: string
  details?: string
}

export interface Submission {
  id: string
  formId: string
  formTitle: string
  data: Record<string, string>
  status: SubmissionStatus
  submittedAt: Date
  updatedAt: Date
  events: SubmissionEvent[]
  notificationsSent: string[]
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  inApp: boolean
}

export class SubmissionService {
  private submissions: Map<string, Submission> = new Map()
  private notificationCallbacks: Array<(submission: Submission) => void> = []

  createSubmission(formId: string, formTitle: string, data: Record<string, string>): Submission {
    const id = `TRK${Date.now()}`
    const now = new Date()

    const submission: Submission = {
      id,
      formId,
      formTitle,
      data,
      status: "submitted",
      submittedAt: now,
      updatedAt: now,
      events: [
        {
          timestamp: now,
          status: "submitted",
          message: "Form submitted successfully",
          details: `Your ${formTitle} has been received and is being processed.`,
        },
      ],
      notificationsSent: [],
    }

    this.submissions.set(id, submission)
    this.notifySubscribers(submission)

    return submission
  }

  getSubmission(id: string): Submission | null {
    return this.submissions.get(id) || null
  }

  updateSubmissionStatus(id: string, status: SubmissionStatus, message: string, details?: string): Submission | null {
    const submission = this.submissions.get(id)
    if (!submission) return null

    const event: SubmissionEvent = {
      timestamp: new Date(),
      status,
      message,
      details,
    }

    submission.status = status
    submission.updatedAt = new Date()
    submission.events.push(event)

    this.notifySubscribers(submission)
    return submission
  }

  addEvent(id: string, status: SubmissionStatus, message: string, details?: string): Submission | null {
    const submission = this.submissions.get(id)
    if (!submission) return null

    const event: SubmissionEvent = {
      timestamp: new Date(),
      status,
      message,
      details,
    }

    submission.events.push(event)
    submission.updatedAt = new Date()

    return submission
  }

  getSubmissionHistory(id: string): SubmissionEvent[] {
    const submission = this.submissions.get(id)
    return submission?.events || []
  }

  getAllSubmissions(): Submission[] {
    return Array.from(this.submissions.values())
  }

  onSubmissionUpdate(callback: (submission: Submission) => void): () => void {
    this.notificationCallbacks.push(callback)
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter((cb) => cb !== callback)
    }
  }

  private notifySubscribers(submission: Submission): void {
    this.notificationCallbacks.forEach((callback) => {
      callback(submission)
    })
  }
}

export class NotificationService {
  private preferences: NotificationPreferences = {
    email: true,
    sms: false,
    inApp: true,
  }

  setPreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences }
  }

  getPreferences(): NotificationPreferences {
    return this.preferences
  }

  async sendNotification(submission: Submission, type: "email" | "sms" | "inApp" = "inApp"): Promise<boolean> {
    if (!this.preferences[type]) {
      return false
    }

    try {
      // In production, integrate with email/SMS services
      console.log(`[${type.toUpperCase()}] Notification sent for ${submission.id}:`, {
        status: submission.status,
        message: submission.events[submission.events.length - 1]?.message,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      return true
    } catch (error) {
      console.error(`Error sending ${type} notification:`, error)
      return false
    }
  }

  async sendNotifications(submission: Submission): Promise<void> {
    const notificationTypes: Array<"email" | "sms" | "inApp"> = ["email", "sms", "inApp"]

    for (const type of notificationTypes) {
      if (this.preferences[type]) {
        await this.sendNotification(submission, type)
        submission.notificationsSent.push(type)
      }
    }
  }

  getNotificationMessage(submission: Submission): string {
    const lastEvent = submission.events[submission.events.length - 1]
    if (!lastEvent) return "No updates available"

    return `${lastEvent.message} - ${lastEvent.details || ""}`
  }
}

// Singleton instances
let submissionServiceInstance: SubmissionService | null = null
let notificationServiceInstance: NotificationService | null = null

export function getSubmissionService(): SubmissionService {
  if (!submissionServiceInstance) {
    submissionServiceInstance = new SubmissionService()
  }
  return submissionServiceInstance
}

export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService()
  }
  return notificationServiceInstance
}
