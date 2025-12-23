# Footer Login Modal Integration Guide

## Overview
The Footer component now includes a "Quick Log In" button that opens the LoginModal when clicked. This requires all pages using the Footer to pass an `onOpenLoginModal` callback prop.

## Changes Made

### 1. Footer Component (`src/components/Footer.tsx`)
- Added `onOpenLoginModal?: () => void` prop to FooterProps interface
- Updated "Quick Log In" button to call `onOpenLoginModal?.()` instead of `onNavigate?.('login')`

### 2. LandingPage (`src/pages/LandingPage.tsx`) - ✅ COMPLETED
- Added `import LoginModal from "../components/LoginModal"`
- Added state: `const [showLoginModal, setShowLoginModal] = useState(false)`
- Updated Footer: `<Footer onNavigate={onNavigate} onOpenLoginModal={() => setShowLoginModal(true)} />`
- Added LoginModal component before PartnerLoginModal

## Pages That Need Updates

The following pages use the Footer component and need to be updated:

### High Priority (User-Facing Pages)
1. ✅ **LandingPage.tsx** - COMPLETED
2. **EventDetailPage.tsx** - Line 1137
3. **PartnerProfilePage.tsx** - Line 806
4. **AllEventsPage.tsx** - Line 531
5. **ThisWeekend.tsx** - Line 328
6. **CalendarPage.tsx** - Line 280
7. **AboutUs.tsx** - Line 430

### Medium Priority (Utility Pages)
8. **BecomePartner.tsx** - Line 418
9. **ContactUs.tsx** - Line 244
10. **Feedback.tsx** - Line 260

### Low Priority (Auth Pages - users likely already authenticated)
11. **ResetPassword.tsx** - Lines 131 and 286

## Implementation Steps for Each Page

For each page listed above, follow these steps:

### Step 1: Add Import
```typescript
import LoginModal from "../components/LoginModal";
```

### Step 2: Add State (inside the component function)
```typescript
const [showLoginModal, setShowLoginModal] = useState(false);
```

### Step 3: Update Footer Component
Change from:
```typescript
<Footer onNavigate={onNavigate} />
```

To:
```typescript
<Footer onNavigate={onNavigate} onOpenLoginModal={() => setShowLoginModal(true)} />
```

### Step 4: Add LoginModal Component (before closing divs, typically near other modals)
```typescript
{/* Login Modal */}
<LoginModal
  isOpen={showLoginModal}
  onClose={() => setShowLoginModal(false)}
  onNavigate={onNavigate}
/>
```

## Example: Complete Implementation

Here's a complete example for a typical page:

```typescript
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';  // Step 1: Import

export default function ExamplePage({ onNavigate }) {
  const [showLoginModal, setShowLoginModal] = useState(false);  // Step 2: State

  return (
    <div className="min-h-screen">
      <Navbar onNavigate={onNavigate} currentPage="example" />
      
      {/* Page content */}
      <div className="content">
        {/* ... */}
      </div>

      {/* Step 3: Update Footer */}
      <Footer 
        onNavigate={onNavigate} 
        onOpenLoginModal={() => setShowLoginModal(true)} 
      />

      {/* Step 4: Add LoginModal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
}
```

## Testing

After updating each page:
1. Navigate to the page
2. Scroll to the footer
3. Click "Quick Log In" in the footer
4. Verify the LoginModal opens correctly
5. Verify you can close the modal
6. Verify login functionality works

## Notes

- The `onOpenLoginModal` prop is optional (`?:`), so pages that don't pass it won't break
- If `onOpenLoginModal` is not provided, the button click will do nothing (silent failure)
- The Navbar already has its own LoginModal implementation and doesn't need changes
- Some pages may already have PartnerLoginModal - the LoginModal should be added alongside it

## Automation Script (Optional)

You can use the following pattern in a script to batch update files:

```bash
# For each page, add import, state, and modal
# This would need to be a proper script with AST manipulation
```

## Progress Tracking

- [x] Footer component updated
- [x] LandingPage updated
- [ ] EventDetailPage
- [ ] PartnerProfilePage
- [ ] AllEventsPage
- [ ] ThisWeekend
- [ ] CalendarPage
- [ ] AboutUs
- [ ] BecomePartner
- [ ] ContactUs
- [ ] Feedback
- [ ] ResetPassword

## Support

If you encounter any issues, check:
1. Import path is correct: `"../components/LoginModal"`
2. State is declared inside the component function
3. Footer prop callback uses arrow function: `() => setShowLoginModal(true)`
4. LoginModal component is placed within the JSX return
