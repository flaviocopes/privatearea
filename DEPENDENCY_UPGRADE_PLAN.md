# Comprehensive Dependency Upgrade Plan

## Current vs Target Versions

| Package | Current Version | Target Version | Complexity | Breaking Changes |
|---------|----------------|----------------|------------|------------------|
| next | 12.2.2 | 15.x | 🔴 High | App Router, React 19, Caching |
| react | 18.2.0 | 19.x | 🟡 Medium | New features, Compiler |
| next-auth | 4.9.0 | 5.x | 🔴 High | Complete rewrite, Auth.js |
| prisma | 4.0.0 | 6.x | 🟡 Medium | Node 16+, TypeScript 4.7+ |
| stripe | 9.12.0 | 18.x | 🟡 Medium | Billing API changes |
| @next-auth/prisma-adapter | 1.0.3 | 2.x | 🟡 Medium | Auth.js compatibility |
| tailwindcss | 3.1.6 | 3.4.x | 🟢 Low | Minor updates |
| eslint | 8.19.0 | 9.x | 🟢 Low | Config format changes |

## Migration Strategy Overview

### Phase 1: Environment & Simple Updates (1-2 days)
- Node.js version requirements
- Simple dependency updates
- Development tooling

### Phase 2: Medium Complexity Updates (3-5 days)
- Prisma upgrade
- Stripe API migration
- React 19 preparation

### Phase 3: Complex Architectural Changes (1-2 weeks)
- Next.js 15 migration
- NextAuth.js 5 (Auth.js) migration
- Testing and optimization

---

## Phase 1: Environment & Simple Updates 🟢

### Prerequisites
```bash
# Required Node.js version for latest dependencies
node --version  # Should be >= 18.17.0
npm --version   # Should be >= 9.0.0
```

### 1.1 Update Node.js Environment
```bash
# Update to Node.js 18.17+ (required for Prisma 6 and Next.js 15)
nvm install 18.17.0
nvm use 18.17.0
```

### 1.2 Simple Package Updates
These have minimal breaking changes:

```json
{
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.45",
    "tailwindcss": "^3.4.10"
  },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "nodemailer": "^6.9.14",
    "pg": "^8.12.0",
    "raw-body": "^2.5.2",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1"
  }
}
```

### 1.3 Update ESLint (Minor Changes)
```json
{
  "devDependencies": {
    "eslint": "^9.9.1",
    "eslint-config-next": "15.0.0"
  }
}
```

**Breaking Changes:**
- ESLint 9 uses flat config format
- Update `.eslintrc.json` to `eslint.config.js`

**Migration Steps:**
```bash
# Install new ESLint
npm install --save-dev eslint@^9.9.1

# Convert config (automated)
npx @eslint/migrate-config .eslintrc.json
```

---

## Phase 2: Medium Complexity Updates 🟡

### 2.1 Prisma 4.0.0 → 6.x Migration

**Prerequisites:**
- Node.js 16.13.0+ ✅ (covered in Phase 1)
- TypeScript 4.7+ (add if not present)

**Breaking Changes:**
1. `rejectOnNotFound` parameter removed
2. Array shortcuts removed
3. `jsonProtocol` changes
4. Generated client changes

**Migration Steps:**

```bash
# Update Prisma
npm install prisma@^6.0.0 @prisma/client@^6.0.0
```

**Code Changes Required:**

```typescript
// OLD (Prisma 4)
const user = await prisma.user.findUnique({
  where: { id: '123' },
  rejectOnNotFound: true
})

// NEW (Prisma 6)
const user = await prisma.user.findUniqueOrThrow({
  where: { id: '123' }
})
```

**Array Shortcuts Removal:**
```typescript
// OLD - Array shortcuts
where: {
  OR: ['condition1', 'condition2']
}

// NEW - Explicit objects
where: {
  OR: [
    { condition1 },
    { condition2 }
  ]
}
```

**Files to Update:**
- `lib/prisma.js` - Client initialization
- `pages/api/auth/[...nextauth].js` - Database queries
- `pages/api/stripe/success.js` - User updates

### 2.2 Stripe 9.12.0 → 18.x Migration

**Breaking Changes:**
1. Billing API changes
2. Usage records removed
3. API version pinning
4. Checkout session changes

**Migration Steps:**

```bash
# Update Stripe
npm install stripe@^18.0.0
```

**Code Changes Required:**

```javascript
// pages/api/stripe/session.js
// OLD (Stripe 9)
const stripe_session = await stripe.checkout.sessions.create({
  billing_address_collection: 'auto',
  line_items: [{
    price: process.env.STRIPE_PRICE_ID,
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: process.env.BASE_URL + '/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: process.env.BASE_URL + '/cancelled',
  client_reference_id: session.user.id,
})

// NEW (Stripe 18) - Shipping details now required
const stripe_session = await stripe.checkout.sessions.create({
  billing_address_collection: 'auto',
  line_items: [{
    price: process.env.STRIPE_PRICE_ID,
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: process.env.BASE_URL + '/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: process.env.BASE_URL + '/cancelled',
  client_reference_id: session.user.id,
  // Add shipping details if collecting shipping
  shipping_address_collection: {
    allowed_countries: ['US', 'CA'] // Example
  }
})
```

**Environment Variables:**
```env
# Add Stripe API version for consistency
STRIPE_API_VERSION=2024-11-20.acacia
```

### 2.3 React 18.2.0 → 19.x Preparation

**Breaking Changes:**
1. New JSX Transform
2. Stricter TypeScript types
3. Concurrent features

**Migration Steps:**

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

**Code Updates:**
- No immediate breaking changes for this project
- Prepare for Next.js 15 integration

---

## Phase 3: Complex Architectural Changes 🔴

### 3.1 NextAuth.js 4.9.0 → Auth.js 5.x Migration

**Major Breaking Changes:**
1. Complete API rewrite
2. Configuration moved to root
3. Session cookie names changed
4. Import path changes

**Migration Steps:**

```bash
# Install Auth.js
npm uninstall next-auth @next-auth/prisma-adapter
npm install next-auth@beta @auth/prisma-adapter
```

**New Configuration Structure:**

Create `auth.ts` in project root:
```typescript
// auth.ts
import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (user) {
        session.user.id = user.id
        session.user.isSubscriber = user.isSubscriber
      }
      return session
    },
  },
})
```

**Update API Route:**
```typescript
// pages/api/auth/[...nextauth].ts
import { handlers } from "../../../auth"
export const { GET, POST } = handlers
```

**Update Components:**
```typescript
// pages/index.js
import { auth } from "../auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()
  
  if (session) {
    redirect('/members')
  }
  
  // ... rest of component
}
```

**Session Cookie Migration:**
```typescript
// Add to auth.ts to maintain existing sessions
export const { handlers, signIn, signOut, auth } = NextAuth({
  // ... other config
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`, // Keep old cookie name
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
})
```

### 3.2 Next.js 12.2.2 → 15.x Migration

**Major Breaking Changes:**
1. App Router is now stable
2. React 19 support
3. Caching changes
4. Async Request APIs

**Migration Steps:**

```bash
# Update Next.js
npm install next@15 @next/bundle-analyzer
```

**New package.json:**
```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

**Migration Options:**

**Option A: Gradual Migration (Recommended)**
Keep existing Pages Router, add App Router incrementally:

```
project/
├── pages/          # Existing Pages Router
├── app/            # New App Router (optional)
│   ├── layout.tsx
│   └── page.tsx
```

**Option B: Complete Migration**
Convert all pages to App Router:

```
app/
├── layout.tsx
├── page.tsx        # Home page
├── join/
│   └── page.tsx
├── members/
│   └── page.tsx
├── success/
│   └── page.tsx
└── api/
    ├── auth/
    └── stripe/
```

**Updated next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable if using App Router
    appDir: true,
  },
}

module.exports = nextConfig
```

**Caching Changes:**
```typescript
// pages/api/stripe/session.js
// Add explicit caching headers
export default async function handler(req, res) {
  // Set cache headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  
  // ... rest of handler
}
```

---

## Implementation Timeline

### Week 1: Foundation (Phase 1)
- **Day 1-2**: Node.js environment setup, simple updates
- **Day 3**: ESLint migration and testing
- **Day 4-5**: Prisma 6 migration and testing

### Week 2: Core Updates (Phase 2)
- **Day 1-2**: Stripe API migration
- **Day 3**: React 19 preparation
- **Day 4-5**: Integration testing

### Week 3-4: Architecture (Phase 3)
- **Week 3**: NextAuth.js 5 migration
- **Week 4**: Next.js 15 migration
- **Testing**: Comprehensive testing throughout

---

## Testing Strategy

### Unit Tests
```bash
# Add testing framework
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Integration Tests
```bash
# Test authentication flow
npm run test:auth

# Test payment flow
npm run test:payments

# Test database operations
npm run test:db
```

### Manual Testing Checklist
- [ ] User registration with email
- [ ] Magic link authentication
- [ ] Subscription payment flow
- [ ] Members area access
- [ ] Session persistence
- [ ] Error handling

---

## Rollback Strategy

### Database Backups
```bash
# Before starting migration
pg_dump privatearea > backup_pre_migration.sql
```

### Package Rollbacks
```bash
# Keep backup of working package.json
cp package.json package.json.backup

# Rollback if needed
cp package.json.backup package.json
npm install
```

### Feature Flags
```javascript
// Use environment variables for gradual rollout
const USE_AUTH_V5 = process.env.USE_AUTH_V5 === 'true'
const USE_NEXT_15 = process.env.USE_NEXT_15 === 'true'
```

---

## Risk Assessment

### High Risk Items
1. **NextAuth.js 5 Migration** - Session cookie changes may log out users
2. **Stripe API Changes** - Billing flow changes may break payments
3. **Next.js 15 Caching** - May affect performance unexpectedly

### Mitigation Strategies
1. **Staged Deployment** - Deploy to staging first
2. **Feature Flags** - Gradual rollout with fallbacks
3. **Monitoring** - Enhanced logging during migration
4. **Communication** - User notification about potential disruptions

---

## Success Metrics

### Performance
- [ ] Page load times maintained or improved
- [ ] Build time under 2 minutes
- [ ] Bundle size not increased significantly

### Functionality
- [ ] All existing features working
- [ ] Authentication flow functional
- [ ] Payment processing working
- [ ] No security regressions

### Code Quality
- [ ] No TypeScript errors
- [ ] ESLint passing
- [ ] Test coverage maintained
- [ ] Documentation updated

---

## Post-Migration Cleanup

### Remove Deprecated Code
```bash
# Remove old NextAuth files
rm -rf pages/api/auth/[...nextauth].js

# Clean up old dependencies
npm uninstall next-auth@4 @next-auth/prisma-adapter
```

### Update Documentation
- Update README.md with new setup instructions
- Update API documentation
- Create migration notes for future reference

### Performance Optimization
- Implement new Next.js 15 caching strategies
- Optimize bundle size with new features
- Add monitoring for new architecture

This comprehensive plan provides a structured approach to upgrading all dependencies while minimizing risk and maintaining functionality throughout the migration process.