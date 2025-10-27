// Data Migration Utility
// Handles migration of user data between different user IDs and email-based recovery

export interface UserData {
  submissions: any[]
  chatMessages: any[]
  tickets: any[]
  feedbacks: any[]
}

export class DataMigrationService {
  /**
   * Migrate user data from old user ID to new user ID
   */
  static migrateUserData(oldUserId: string, newUserId: string): boolean {
    try {
      const dataTypes = ['userSubmissions', 'userChatMessages', 'userTickets', 'userFeedbacks']
      let migrated = false

      for (const dataType of dataTypes) {
        const oldKey = `${dataType}_${oldUserId}`
        const newKey = `${dataType}_${newUserId}`
        
        const oldData = localStorage.getItem(oldKey)
        if (oldData) {
          localStorage.setItem(newKey, oldData)
          localStorage.removeItem(oldKey)
          migrated = true
          console.log(`[DataMigration] Migrated ${dataType} from ${oldKey} to ${newKey}`)
        }
      }

      return migrated
    } catch (error) {
      console.error('[DataMigration] Error migrating user data:', error)
      return false
    }
  }

  /**
   * Recover user data using email as identifier
   */
  static recoverUserDataByEmail(email: string, newUserId: string): boolean {
    try {
      const backupKey = `submissions_backup_${email}`
      const backupData = localStorage.getItem(backupKey)
      
      if (backupData) {
        // Restore submissions
        localStorage.setItem(`userSubmissions_${newUserId}`, backupData)
        
        // Clean up backup
        localStorage.removeItem(backupKey)
        
        console.log(`[DataMigration] Recovered submissions for user ${newUserId} from email ${email}`)
        return true
      }

      return false
    } catch (error) {
      console.error('[DataMigration] Error recovering user data:', error)
      return false
    }
  }

  /**
   * Create backup of user data using email as key
   */
  static createBackup(userId: string, email: string): boolean {
    try {
      const dataTypes = ['userSubmissions', 'userChatMessages', 'userTickets', 'userFeedbacks']
      let backupCreated = false

      for (const dataType of dataTypes) {
        const userKey = `${dataType}_${userId}`
        const backupKey = `${dataType}_backup_${email}`
        
        const userData = localStorage.getItem(userKey)
        if (userData) {
          localStorage.setItem(backupKey, userData)
          backupCreated = true
          console.log(`[DataMigration] Created backup for ${dataType} with key ${backupKey}`)
        }
      }

      return backupCreated
    } catch (error) {
      console.error('[DataMigration] Error creating backup:', error)
      return false
    }
  }

  /**
   * Clean up old user data
   */
  static cleanupUserData(userId: string): void {
    try {
      const dataTypes = ['userSubmissions', 'userChatMessages', 'userTickets', 'userFeedbacks']
      
      for (const dataType of dataTypes) {
        const userKey = `${dataType}_${userId}`
        localStorage.removeItem(userKey)
        console.log(`[DataMigration] Cleaned up ${userKey}`)
      }
    } catch (error) {
      console.error('[DataMigration] Error cleaning up user data:', error)
    }
  }

  /**
   * Get all user data for a specific user
   */
  static getUserData(userId: string): UserData {
    return {
      submissions: JSON.parse(localStorage.getItem(`userSubmissions_${userId}`) || '[]'),
      chatMessages: JSON.parse(localStorage.getItem(`userChatMessages_${userId}`) || '[]'),
      tickets: JSON.parse(localStorage.getItem(`userTickets_${userId}`) || '[]'),
      feedbacks: JSON.parse(localStorage.getItem(`userFeedbacks_${userId}`) || '[]')
    }
  }

  /**
   * Check if user has any data
   */
  static hasUserData(userId: string): boolean {
    const data = this.getUserData(userId)
    return data.submissions.length > 0 || 
           data.chatMessages.length > 0 || 
           data.tickets.length > 0 || 
           data.feedbacks.length > 0
  }

  /**
   * Find user data by email across all possible keys
   */
  static findUserDataByEmail(email: string): { userId: string; data: UserData } | null {
    try {
      // Check all localStorage keys for potential matches
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('userSubmissions_')) {
          const userId = key.replace('userSubmissions_', '')
          const submissions = JSON.parse(localStorage.getItem(key) || '[]')
          
          // Check if any submission has matching email
          const hasMatchingEmail = submissions.some((submission: any) => 
            submission.userEmail === email || submission.user_email === email
          )
          
          if (hasMatchingEmail) {
            return {
              userId,
              data: this.getUserData(userId)
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error('[DataMigration] Error finding user data by email:', error)
      return null
    }
  }
}
