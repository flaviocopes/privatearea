# User Login Flow Diagram

## Overview
This diagram shows the complete user authentication and authorization flow for the Private Area subscription platform, which uses NextAuth.js with email magic link authentication.

## Login Flow Diagram

```mermaid
flowchart TD
    A[User visits /] --> B{Authenticated?}
    B -->|No| C[Show Landing Page]
    B -->|Yes| D{Is Subscriber?}
    
    C --> E[User clicks 'Become a supporter']
    E --> F[Redirect to /api/auth/signin]
    
    F --> G[NextAuth Sign-in Page]
    G --> H[User enters email]
    H --> I[NextAuth sends magic link email]
    
    I --> J[User checks email]
    J --> K[User clicks magic link]
    K --> L[NextAuth verifies token]
    
    L --> M{Token valid?}
    M -->|No| N[Show error message]
    M -->|Yes| O[Create/update user in database]
    
    O --> P[Create session]
    P --> Q[Set session cookie]
    Q --> R[Redirect to callback URL]
    
    R --> S{Is Subscriber?}
    S -->|No| T[Redirect to /join]
    S -->|Yes| U[Redirect to /members]
    
    D -->|No| T
    D -->|Yes| U
    
    T --> V[Show subscription page]
    V --> W[User clicks 'Create subscription']
    W --> X[Call /api/stripe/session]
    
    X --> Y[Create Stripe checkout session]
    Y --> Z[Redirect to Stripe checkout]
    
    Z --> AA[User completes payment]
    AA --> BB[Stripe redirects to /success]
    
    BB --> CC[Call /api/stripe/success]
    CC --> DD[Update user.isSubscriber = true]
    DD --> EE[Redirect to /members]
    
    U --> FF[Show members content]
    EE --> FF
    
    style A fill:#e1f5fe
    style C fill:#fff3e0
    style G fill:#f3e5f5
    style V fill:#e8f5e8
    style FF fill:#e8f5e8
    style N fill:#ffebee
```

## Detailed Flow Explanation

### 1. Initial Page Load (`/`)
- **Code**: `pages/index.js:8-19`
- User visits the landing page
- `useSession()` hook checks authentication status
- If loading, shows nothing (`return null`)
- If authenticated, immediately redirects to `/members`
- If not authenticated, shows landing page with benefits

### 2. Authentication Trigger
- **Code**: `pages/index.js:43-45`
- User clicks "Become a supporter" button
- Link points to `/api/auth/signin` (NextAuth built-in endpoint)

### 3. NextAuth Sign-in Process
- **Code**: `pages/api/auth/[...nextauth].js`
- NextAuth displays email input form
- User enters email address
- NextAuth generates verification token
- Email sent via configured SMTP server (`EMAIL_SERVER` env var)

### 4. Magic Link Verification
- **Code**: NextAuth internal processing
- User receives email with magic link
- Link contains verification token
- User clicks link, redirects back to application
- NextAuth verifies token against database (`VerificationToken` table)

### 5. User Creation/Update
- **Code**: `pages/api/auth/[...nextauth].js:25-31`
- If token valid, NextAuth creates or updates user in database
- Uses Prisma adapter for database operations
- User record created in `User` table with `isSubscriber: false`

### 6. Session Creation
- **Code**: `pages/api/auth/[...nextauth].js:17-20`
- NextAuth creates session with 30-day expiry
- Session callback adds `user.id` and `user.isSubscriber` to session
- Session cookie set in browser

### 7. Post-Login Routing
- **Code**: `pages/index.js:16-19`
- After successful login, user redirected back to `/`
- `useSession()` now returns authenticated session
- Logic checks `session.user.isSubscriber`
- If not subscriber: redirect to `/join`
- If subscriber: redirect to `/members`

### 8. Subscription Flow (`/join`)
- **Code**: `pages/join.js`
- Protected route - requires authentication
- If not authenticated, redirects to `/`
- If already subscriber, redirects to `/members`
- Shows subscription button

### 9. Stripe Payment Process
- **Code**: `pages/join.js:44-63` and `pages/api/stripe/session.js`
- User clicks "Create subscription"
- Calls `/api/stripe/session` API endpoint
- Creates Stripe checkout session for $5/month
- Redirects to Stripe-hosted checkout page

### 10. Payment Success Handling
- **Code**: `pages/success.js` and `pages/api/stripe/success.js`
- After successful payment, Stripe redirects to `/success`
- Success page calls `/api/stripe/success` endpoint
- Updates user record: `isSubscriber: true`
- Redirects to `/members`

### 11. Members Area Access
- **Code**: `pages/members.js`
- Protected route requiring authentication AND subscription
- Checks session and `session.user.isSubscriber`
- Displays markdown content from `content.md`

## Key Security Features

### Session Management
- **JWT-based sessions** with 30-day expiry
- **Secure cookies** with HttpOnly flag
- **Session verification** on every protected route

### Route Protection
- **Client-side checks** using `useSession()` hook
- **Server-side validation** for API endpoints
- **Automatic redirects** based on auth/subscription status

### Database Security
- **Prisma ORM** prevents SQL injection
- **Email verification** required for account creation
- **Subscription verification** before content access

## Environment Variables Required

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email Provider (for magic links)
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@example.com"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/privatearea"

# Stripe (for subscription)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID="price_..."

# Application
BASE_URL="http://localhost:3000"
```

## Database Tables Involved

### User Table
```sql
User {
  id            String   @id @default(cuid())
  email         String?  @unique
  isSubscriber  Boolean  @default(false)
  -- ... other NextAuth fields
}
```

### Session Table
```sql
Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
}
```

### VerificationToken Table
```sql
VerificationToken {
  identifier String   -- Email address
  token      String   @unique
  expires    DateTime
}
```

## Flow Variations

### Already Authenticated User
- Direct redirect to `/members` (if subscriber) or `/join` (if not subscriber)
- No re-authentication required

### Expired Session
- Session expires after 30 days
- User needs to go through magic link process again
- Previous subscription status maintained in database

### Payment Failure
- User remains on Stripe checkout page
- Can retry payment or return to `/join`
- Subscription status remains `false`

This authentication flow provides a seamless, passwordless experience while maintaining security through email verification and session management.