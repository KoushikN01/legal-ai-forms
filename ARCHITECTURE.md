# Architecture Documentation

## System Overview

LegalVoice is a voice-powered legal form application built with Next.js. The architecture follows a client-first approach with modular service layers.

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                  │
│  (React Components: FormChooser, Recorder, ReviewForm)  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Service Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Speech     │  │    Form      │  │ Submission   │  │
│  │ Recognition  │  │   Mapping &  │  │  Tracking &  │  │
│  │   Service    │  │ Validation   │  │Notifications │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Data Layer                             │
│  (In-Memory State, LocalStorage, Future: Backend API)  │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Component Architecture

### Page Components

**app/page.tsx** - Main orchestrator
- Manages application state and routing
- Coordinates between components
- Handles step transitions

### Feature Components

**FormChooser** - Form selection
- Displays available legal forms
- Handles form selection
- Fetches form metadata

**Recorder** - Voice input
- Manages microphone access
- Handles speech recognition
- Displays real-time transcription
- Supports language selection

**ReviewForm** - Data review and editing
- Displays extracted form data
- Allows manual editing
- Validates form data
- Submits forms

**Tracker** - Submission tracking
- Retrieves submission status
- Displays status history
- Shows notification status

## Service Layer

### SpeechToTextService

**Responsibilities:**
- Initialize Web Speech API
- Manage recording lifecycle
- Handle transcription
- Support multiple languages
- Error handling

**Key Methods:**
- `start()` - Begin recording
- `stop()` - End recording and return transcript
- `abort()` - Cancel recording
- `setLanguage()` - Change language

### FormMapper

**Responsibilities:**
- Extract data from transcripts
- Map data to form fields
- Pattern matching for common fields
- Keyword-based extraction

**Key Methods:**
- `extractData()` - Extract all fields
- `extractPhone()` - Extract phone numbers
- `extractEmail()` - Extract email addresses
- `extractDate()` - Extract dates
- `extractByKeyword()` - Extract by field label

### FormValidator

**Responsibilities:**
- Validate individual fields
- Validate complete forms
- Support multiple validation rules
- Provide error messages

**Key Methods:**
- `validateField()` - Validate single field
- `validateForm()` - Validate all fields

### SubmissionService

**Responsibilities:**
- Create submissions
- Track submission status
- Manage submission history
- Notify subscribers

**Key Methods:**
- `createSubmission()` - Create new submission
- `getSubmission()` - Retrieve submission
- `updateSubmissionStatus()` - Update status
- `onSubmissionUpdate()` - Subscribe to updates

### NotificationService

**Responsibilities:**
- Send notifications
- Manage notification preferences
- Support multiple channels
- Format notification messages

**Key Methods:**
- `sendNotification()` - Send single notification
- `sendNotifications()` - Send all notifications
- `setPreferences()` - Configure preferences
- `getNotificationMessage()` - Format message

## Data Flow

### Form Submission Flow

\`\`\`
1. User selects form
   ↓
2. User records voice input
   ↓
3. SpeechToTextService transcribes audio
   ↓
4. FormMapper extracts data from transcript
   ↓
5. User reviews and edits data
   ↓
6. FormValidator validates all fields
   ↓
7. SubmissionService creates submission
   ↓
8. NotificationService sends notifications
   ↓
9. User receives tracking ID
\`\`\`

### Tracking Flow

\`\`\`
1. User enters tracking ID
   ↓
2. SubmissionService retrieves submission
   ↓
3. Display submission status and history
   ↓
4. Show notification channels used
\`\`\`

## State Management

### Local Component State

- Form data
- Recording state
- UI state (loading, errors)

### Service State (Singleton)

- Submissions (SubmissionService)
- Notification preferences (NotificationService)

### Future: Backend State

- Persistent submission storage
- User authentication
- Form definitions
- Audit logs

## Error Handling

### Speech Recognition Errors

- Microphone access denied
- Browser not supported
- Network errors
- Timeout errors

### Form Validation Errors

- Required field missing
- Invalid format
- Length constraints
- Custom validation failures

### Submission Errors

- Network failures
- Server errors
- Duplicate submissions
- Invalid data

## Security Considerations

### Client-Side

- Input validation
- XSS prevention
- CSRF protection
- Secure headers

### Data Privacy

- No sensitive data in localStorage
- HTTPS required for production
- Audio data not stored
- Transcripts encrypted in transit

### Future Backend

- Authentication and authorization
- Rate limiting
- Input sanitization
- Audit logging

## Performance Optimization

### Code Splitting

- Dynamic imports for heavy components
- Route-based splitting (automatic)

### Caching

- Service worker for offline support
- Browser caching for static assets
- API response caching

### Rendering

- React.memo for expensive components
- useCallback for stable references
- Lazy loading of images

## Scalability

### Current (Single User)

- In-memory state
- Client-side processing
- No backend required

### Future (Multi-User)

- Backend API for persistence
- Database for submissions
- User authentication
- Real-time updates with WebSockets
- Horizontal scaling with load balancing

## Testing Strategy

### Unit Tests

- Service functions
- Validation rules
- Data extraction

### Integration Tests

- Component interactions
- Service integration
- Data flow

### E2E Tests

- Complete user flows
- Form submission
- Tracking

## Deployment Architecture

### Development

\`\`\`
Local Machine
    ↓
npm run dev
    ↓
http://localhost:3000
\`\`\`

### Production (Vercel)

\`\`\`
GitHub Repository
    ↓
Vercel CI/CD
    ↓
Build & Test
    ↓
Deploy to Edge Network
    ↓
https://your-domain.com
\`\`\`

### Self-Hosted

\`\`\`
GitHub Repository
    ↓
Pull & Build
    ↓
PM2 Process Manager
    ↓
Nginx Reverse Proxy
    ↓
https://your-domain.com
\`\`\`

## Future Enhancements

### Phase 2

- Backend API integration
- Database persistence
- User authentication
- Email/SMS integration

### Phase 3

- Advanced NLP
- Document generation
- Payment integration
- Admin dashboard

### Phase 4

- Mobile app
- Offline support
- Advanced analytics
- API for partners
