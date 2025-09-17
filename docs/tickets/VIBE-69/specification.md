# VIBE-69: Onboarding Form - UI/UX Specification

## Overview

This specification defines the user experience for a multi-step onboarding form that collects user information through a series of focused, accessible pages following GOV.UK Design System patterns.

## User Journey Flow

```
Homepage
    │
    └─── "See example form" button
            │
            ▼
    /onboarding/name ──────────────────┐
            │                         │
            ▼                         │
    /onboarding/date-of-birth         │
            │                         │
            ▼                         │
    /onboarding/address               │
            │                         │
            ▼                         │
    /onboarding/role                  │
            │                         │
            ▼                         │
    /onboarding/summary ──────────────┘
            │                    ▲
            ▼                    │
    /onboarding/confirmation    │
            │                    │
            ▼                    │
        [End]          "Change" links
```

### Navigation Flow Rules
- **Forward progression**: Users can only move forward by completing the current page
- **Back navigation**: "Back" link on every page except the first
- **Change functionality**: "Change" links on summary page return to specific pages
- **Session persistence**: Form data saved in session throughout journey
- **Validation gates**: Users cannot proceed without valid data

## Page Wireframes

### 1. Homepage Update

```
┌─────────────────────────────────────────────────────────────┐
│ GOV.UK Header                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ████████████████████████████████████████████               │
│  █  HMCTS Express Monorepo Template        █               │
│  █  Production-ready Node.js starter       █               │
│  ████████████████████████████████████████████               │
│                                                             │
│  A comprehensive monorepo template that demonstrates...     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  Try our example onboarding form                   │    │
│  │                                                     │    │
│  │  [See example form]                                │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [Existing content continues below...]                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### 2. Name Page (/onboarding/name)

```
┌─────────────────────────────────────────────────────────────┐
│ GOV.UK Header                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What is your full name?                                    │
│  ═══════════════════════                                    │
│                                                             │
│  ┌─ First name ──────────────────────────────────────────┐  │
│  │ [                                                   ] │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Last name ───────────────────────────────────────────┐  │
│  │ [                                                   ] │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                             │
│  [Continue]                                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### 3. Date of Birth Page (/onboarding/date-of-birth)

```
┌─────────────────────────────────────────────────────────────┐
│ GOV.UK Header                                               │
├─────────────────────────────────────────────────────────────┤
│ ← Back                                                      │
│                                                             │
│  What is your date of birth?                               │
│  ════════════════════════════                              │
│                                                             │
│  For example, 27 3 1985                                    │
│                                                             │
│  Day     Month    Year                                      │
│  ┌───┐   ┌───┐    ┌─────┐                                  │
│  │[  ]│   │[  ]│    │[    ]│                               │
│  └───┘   └───┘    └─────┘                                  │
│                                                             │
│  [Continue]                                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### 4. Address Page (/onboarding/address)

```
┌─────────────────────────────────────────────────────────────┐
│ GOV.UK Header                                               │
├─────────────────────────────────────────────────────────────┤
│ ← Back                                                      │
│                                                             │
│  What is your address?                                      │
│  ══════════════════════                                     │
│                                                             │
│  ┌─ Building and street ─────────────────────────────────┐  │
│  │ [                                                   ] │  │
│  │ [                                 ] (optional)      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Town or city ────────────────────────────────────────┐  │
│  │ [                                                   ] │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ County (optional) ───────────────────────────────────┐  │
│  │ [                                                   ] │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Postcode ────────────────────────────────────────────┐  │
│  │ [         ]                                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                             │
│  [Continue]                                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### 5. Role Page (/onboarding/role)

```
┌─────────────────────────────────────────────────────────────┐
│ GOV.UK Header                                               │
├─────────────────────────────────────────────────────────────┤
│ ← Back                                                      │
│                                                             │
│  What is your role?                                         │
│  ═══════════════════                                        │
│                                                             │
│  ○ Frontend Developer                                       │
│                                                             │
│  ○ Backend Developer                                        │
│                                                             │
│  ○ Test Engineer                                            │
│                                                             │
│  ○ Other                                                    │
│                                                             │
│  ┌─ If other, please specify ──────────────────────────────┐│
│  │ [                                                     ]││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [Continue]                                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### 6. Summary Page (/onboarding/summary)

```
┌─────────────────────────────────────────────────────────────┐
│ GOV.UK Header                                               │
├─────────────────────────────────────────────────────────────┤
│ ← Back                                                      │
│                                                             │
│  Check your answers                                         │
│  ═══════════════════                                        │
│                                                             │
│  Name                                                       │
│  John Smith                                    [Change]     │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Date of birth                                              │
│  27 March 1985                                 [Change]     │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Address                                                    │
│  123 Main Street                              [Change]     │
│  London                                                     │
│  SW1A 1AA                                                  │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Role                                                       │
│  Frontend Developer                           [Change]     │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Submit application]                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### 7. Confirmation Page (/onboarding/confirmation)

```
┌─────────────────────────────────────────────────────────────┐
│ GOV.UK Header                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ████████████████████████████████████████████               │
│  █  ✓  Application submitted                █               │
│  █     Your reference number is ABC123      █               │
│  ████████████████████████████████████████████               │
│                                                             │
│  What happens next                                          │
│  ═══════════════════                                        │
│                                                             │
│  We've sent you a confirmation email.                      │
│                                                             │
│  Your application will be reviewed and we'll contact       │
│  you within 5 working days.                                │
│                                                             │
│  [Start a new application]                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

## Content Specification

### English Content

#### Homepage Addition
```typescript
exampleForm: {
  title: "Try our example onboarding form",
  description: "See how we collect information using best practice form design",
  linkText: "See example form"
}
```

#### Page Content

**Name Page**
```typescript
name: {
  title: "What is your full name?",
  firstNameLabel: "First name",
  lastNameLabel: "Last name",
  buttonText: "Continue"
}
```

**Date of Birth Page**
```typescript
dateOfBirth: {
  title: "What is your date of birth?",
  hint: "For example, 27 3 1985",
  dayLabel: "Day",
  monthLabel: "Month",
  yearLabel: "Year",
  buttonText: "Continue"
}
```

**Address Page**
```typescript
address: {
  title: "What is your address?",
  buildingStreetLabel: "Building and street",
  buildingStreet2Label: "Address line 2 (optional)",
  townCityLabel: "Town or city",
  countyLabel: "County (optional)",
  postcodeLabel: "Postcode",
  buttonText: "Continue"
}
```

**Role Page**
```typescript
role: {
  title: "What is your role?",
  options: {
    frontend: "Frontend Developer",
    backend: "Backend Developer",
    testEngineer: "Test Engineer",
    other: "Other"
  },
  otherLabel: "If other, please specify",
  buttonText: "Continue"
}
```

**Summary Page**
```typescript
summary: {
  title: "Check your answers",
  sections: {
    name: "Name",
    dateOfBirth: "Date of birth",
    address: "Address",
    role: "Role"
  },
  changeText: "Change",
  buttonText: "Submit application"
}
```

**Confirmation Page**
```typescript
confirmation: {
  title: "Application submitted",
  referenceText: "Your reference number is",
  nextStepsTitle: "What happens next",
  nextStepsContent: [
    "We've sent you a confirmation email.",
    "Your application will be reviewed and we'll contact you within 5 working days."
  ],
  startAgainText: "Start a new application"
}
```

### Welsh Content

#### Homepage Addition
```typescript
exampleForm: {
  title: "Rhowch gynnig ar ein ffurflen hyfforddi enghreifftiol",
  description: "Gwelwch sut rydym yn casglu gwybodaeth gan ddefnyddio dyluniad ffurflen arfer gorau",
  linkText: "Gweld ffurflen enghreifftiol"
}
```

#### Page Content

**Name Page**
```typescript
name: {
  title: "Beth yw eich enw llawn?",
  firstNameLabel: "Enw cyntaf",
  lastNameLabel: "Cyfenw",
  buttonText: "Parhau"
}
```

**Date of Birth Page**
```typescript
dateOfBirth: {
  title: "Beth yw eich dyddiad geni?",
  hint: "Er enghraifft, 27 3 1985",
  dayLabel: "Diwrnod",
  monthLabel: "Mis",
  yearLabel: "Blwyddyn",
  buttonText: "Parhau"
}
```

**Address Page**
```typescript
address: {
  title: "Beth yw eich cyfeiriad?",
  buildingStreetLabel: "Adeilad a stryd",
  buildingStreet2Label: "Llinell cyfeiriad 2 (dewisol)",
  townCityLabel: "Tref neu ddinas",
  countyLabel: "Sir (dewisol)",
  postcodeLabel: "Cod post",
  buttonText: "Parhau"
}
```

**Role Page**
```typescript
role: {
  title: "Beth yw eich rôl?",
  options: {
    frontend: "Datblygwr Blaen",
    backend: "Datblygwr Cefn",
    testEngineer: "Peiriannydd Prawf",
    other: "Arall"
  },
  otherLabel: "Os arall, nodwch",
  buttonText: "Parhau"
}
```

**Summary Page**
```typescript
summary: {
  title: "Gwiriwch eich atebion",
  sections: {
    name: "Enw",
    dateOfBirth: "Dyddiad geni",
    address: "Cyfeiriad",
    role: "Rôl"
  },
  changeText: "Newid",
  buttonText: "Cyflwyno cais"
}
```

**Confirmation Page**
```typescript
confirmation: {
  title: "Cais wedi'i gyflwyno",
  referenceText: "Eich rhif cyfeirnod yw",
  nextStepsTitle: "Beth sy'n digwydd nesaf",
  nextStepsContent: [
    "Rydym wedi anfon e-bost cadarnhau atoch.",
    "Bydd eich cais yn cael ei adolygu a byddwn yn cysylltu â chi o fewn 5 diwrnod gwaith."
  ],
  startAgainText: "Dechrau cais newydd"
}
```

## Form Field Specifications

### Name Page
```typescript
interface NameForm {
  firstName: string;    // Required, max 100 characters
  lastName: string;     // Required, max 100 characters
}
```

**Input Types:**
- First name: `<input type="text" autocomplete="given-name">`
- Last name: `<input type="text" autocomplete="family-name">`

**Validation Rules:**
- Both fields required
- Minimum 1 character after trim
- Maximum 100 characters
- No numeric characters only
- Allow letters, spaces, hyphens, apostrophes

### Date of Birth Page
```typescript
interface DateOfBirthForm {
  day: string;      // Required, 1-31
  month: string;    // Required, 1-12
  year: string;     // Required, 1900-current year
}
```

**Input Types:**
- Day: `<input type="text" inputmode="numeric" pattern="[0-9]*">`
- Month: `<input type="text" inputmode="numeric" pattern="[0-9]*">`
- Year: `<input type="text" inputmode="numeric" pattern="[0-9]*">`

**Validation Rules:**
- All fields required
- Day: 1-31, validated against month/year
- Month: 1-12
- Year: 1900 to current year
- Must be a valid date
- User must be 16+ years old

### Address Page
```typescript
interface AddressForm {
  buildingStreet: string;   // Required, max 200 characters
  buildingStreet2?: string; // Optional, max 200 characters
  townCity: string;         // Required, max 100 characters
  county?: string;          // Optional, max 100 characters
  postcode: string;         // Required, UK postcode format
}
```

**Input Types:**
- Building/street: `<input type="text" autocomplete="address-line1">`
- Address line 2: `<input type="text" autocomplete="address-line2">`
- Town/city: `<input type="text" autocomplete="address-level2">`
- County: `<input type="text" autocomplete="address-level1">`
- Postcode: `<input type="text" autocomplete="postal-code">`

**Validation Rules:**
- Building/street, town/city, postcode required
- Postcode must match UK format (flexible regex)
- Maximum character limits enforced
- Trim whitespace

### Role Page
```typescript
interface RoleForm {
  role: 'frontend' | 'backend' | 'testEngineer' | 'other';
  otherRole?: string;  // Required if role is 'other', max 100 characters
}
```

**Input Types:**
- Role selection: `<input type="radio">`
- Other role: `<input type="text">`

**Validation Rules:**
- Role selection required
- If "Other" selected, otherRole field becomes required
- Other role: max 100 characters, minimum 2 characters

## Error Messages

### English Error Messages

**Name Page:**
- First name empty: "Enter your first name"
- Last name empty: "Enter your last name"
- First name too long: "First name must be 100 characters or fewer"
- Last name too long: "Last name must be 100 characters or fewer"
- Invalid characters: "Name must only include letters, spaces, hyphens and apostrophes"

**Date of Birth Page:**
- Day empty: "Enter a day"
- Month empty: "Enter a month"
- Year empty: "Enter a year"
- Day invalid: "Day must be between 1 and 31"
- Month invalid: "Month must be between 1 and 12"
- Year invalid: "Year must be between 1900 and [current year]"
- Invalid date: "Enter a real date"
- Too young: "You must be at least 16 years old"

**Address Page:**
- Building/street empty: "Enter building and street"
- Town/city empty: "Enter town or city"
- Postcode empty: "Enter postcode"
- Postcode invalid: "Enter a real postcode"
- Field too long: "[Field] must be [limit] characters or fewer"

**Role Page:**
- No selection: "Select your role"
- Other empty: "Enter your role"
- Other too short: "Role must be at least 2 characters"
- Other too long: "Role must be 100 characters or fewer"

### Welsh Error Messages

**Name Page:**
- First name empty: "Rhowch eich enw cyntaf"
- Last name empty: "Rhowch eich cyfenw"
- First name too long: "Rhaid i'r enw cyntaf fod yn 100 o gymeriadau neu lai"
- Last name too long: "Rhaid i'r cyfenw fod yn 100 o gymeriadau neu lai"
- Invalid characters: "Rhaid i'r enw gynnwys llythrennau, bylchau, cysylltnodau a chollnodau yn unig"

**Date of Birth Page:**
- Day empty: "Rhowch ddiwrnod"
- Month empty: "Rhowch fis"
- Year empty: "Rhowch flwyddyn"
- Day invalid: "Rhaid i'r diwrnod fod rhwng 1 a 31"
- Month invalid: "Rhaid i'r mis fod rhwng 1 a 12"
- Year invalid: "Rhaid i'r flwyddyn fod rhwng 1900 a [blwyddyn gyfredol]"
- Invalid date: "Rhowch ddyddiad go iawn"
- Too young: "Rhaid i chi fod o leiaf 16 oed"

**Address Page:**
- Building/street empty: "Rhowch yr adeilad a'r stryd"
- Town/city empty: "Rhowch dref neu ddinas"
- Postcode empty: "Rhowch god post"
- Postcode invalid: "Rhowch god post go iawn"
- Field too long: "Rhaid i [Maes] fod yn [terfyn] o gymeriadau neu lai"

**Role Page:**
- No selection: "Dewiswch eich rôl"
- Other empty: "Rhowch eich rôl"
- Other too short: "Rhaid i'r rôl fod o leiaf 2 gymeriad"
- Other too long: "Rhaid i'r rôl fod yn 100 o gymeriadau neu lai"

## Component Specifications

### GOV.UK Design System Components Used

**Text Input Component:**
- Component: `govuk-input`
- Error state: `govuk-input--error`
- Label: `govuk-label`
- Hint: `govuk-hint`
- Error message: `govuk-error-message`

**Date Input Component:**
- Component: `govuk-date-input`
- Individual inputs: `govuk-date-input__input`
- Labels: `govuk-date-input__label`

**Radio Component:**
- Component: `govuk-radios`
- Individual radio: `govuk-radios__item`
- Labels: `govuk-radios__label`
- Conditional reveal: `govuk-radios__conditional`

**Button Component:**
- Primary button: `govuk-button`
- Start button: `govuk-button govuk-button--start`

**Summary List Component:**
- Component: `govuk-summary-list`
- Row: `govuk-summary-list__row`
- Key: `govuk-summary-list__key`
- Value: `govuk-summary-list__value`
- Actions: `govuk-summary-list__actions`

**Panel Component:**
- Confirmation panel: `govuk-panel govuk-panel--confirmation`

**Back Link Component:**
- Component: `govuk-back-link`

### Page Layout Components

**Default Layout:**
- Layout template: `layouts/default.njk`
- Page title: H1 with `govuk-heading-xl`
- Two-thirds column: `govuk-grid-column-two-thirds`

**Error Summary:**
- Component: `govuk-error-summary`
- Title: "There is a problem" / "Mae problem"
- Links to field errors with matching IDs

## Accessibility Requirements (WCAG 2.2 AA)

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order follows logical reading order
- Focus indicators visible on all focusable elements
- Skip links provided for screen reader users

### Screen Reader Support
- Proper heading hierarchy (H1 → H2 → H3)
- Form labels properly associated with inputs
- Error messages announced when displayed
- ARIA labels for complex interactions
- Page titles descriptive and unique

### Visual Design
- Color contrast minimum 4.5:1 for normal text
- Color contrast minimum 3:1 for large text and UI elements
- Information not conveyed by color alone
- Text readable up to 200% zoom
- Target size minimum 44x44px for interactive elements

### Content Accessibility
- Plain English language (reading age 9)
- Consistent terminology throughout
- Clear instructions and help text
- Error messages specific and actionable

### Assistive Technology
- Compatible with JAWS, NVDA, VoiceOver
- High contrast mode support
- Voice control software compatibility
- Switch control device support

## Back Button Navigation

### Back Link Behavior
- Present on all pages except first (name page)
- Links to previous page in sequence
- Preserves form data when navigating back
- Uses `govuk-back-link` component
- JavaScript enhancement for browser back button

### Change Link Behavior (Summary Page)
- Links directly to specific form pages
- Preserves all other form data
- Returns to summary page after editing
- Uses consistent "Change" link text
- Screen reader announces "Change [field name]"

## Session Management

### Data Structure
```typescript
interface OnboardingSession {
  name?: {
    firstName: string;
    lastName: string;
  };
  dateOfBirth?: {
    day: string;
    month: string;
    year: string;
  };
  address?: {
    buildingStreet: string;
    buildingStreet2?: string;
    townCity: string;
    county?: string;
    postcode: string;
  };
  role?: {
    role: string;
    otherRole?: string;
  };
  currentPage: string;
  completed: boolean;
  referenceNumber?: string;
}
```

## Error Handling

### Validation Flow
1. Server-side validation for security
2. Error summary at top of page
3. Inline errors next to fields
4. Focus management to error summary

### Error Display Pattern
- Error summary component with list of errors
- Links from summary to problematic fields
- Inline error messages below field labels
- Red border on invalid inputs
- Page title prefixed with "Error: " when errors present

### Input Validation
- Server-side validation mandatory
- SQL injection prevention
- XSS protection through templating
- File upload restrictions (if applicable)
- Rate limiting on form submissions

## Testing Requirements

### Accessibility Testing
- Automated testing with axe-core
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- Color contrast verification
- High contrast mode testing

### User Testing
- Task completion rate >95%
- Average completion time <5 minutes
- User satisfaction score >4/5
- Error recovery success rate >90%

### Cross-Browser Testing
- Visual regression testing
- Functional testing across browsers
- Performance testing on low-end devices
- Network throttling tests

## Clarifying Questions

The following areas may need clarification from stakeholders:

1. **Data Persistence**: How long should form data be retained after submission? Should incomplete sessions be preserved between browser sessions?

2. **Reference Number Generation**: What format should the reference number follow? Should it be sequential, random, or follow a specific pattern?

3. **Email Confirmation**: Should users receive an actual email confirmation? What email service should be used for the example?

4. **Analytics Tracking**: Should form completion and abandonment be tracked? What specific events should be monitored?

5. **Multiple Submissions**: Should users be prevented from submitting multiple applications? How should duplicate submissions be handled?

6. **Data Export**: Do administrators need to access submitted data? What format should data export take?

7. **Additional Validation**: Are there any specific business rules for validation beyond standard field validation?

8. **Integration Requirements**: Does this form need to integrate with any existing systems or databases?

9. **Content Management**: Who will be responsible for updating content and translations? Should this be configurable?

10. **Support Contact**: What contact information should be provided if users need help completing the form?

---

# Technical Implementation

## High-Level Technical Implementation Approach

### Multi-Step Form Flow Implementation

The onboarding form will be implemented as a stateful, multi-step wizard using Express.js with session-based data persistence. The implementation follows these core patterns:

**Progressive Form Journey**
- Each step validates and stores data before allowing progression
- Session middleware maintains state across page transitions
- Server-side rendering with Nunjucks templates for accessibility
- Progressive enhancement with minimal JavaScript for improved UX

**Validation Strategy**
- **Server-side validation**: Primary validation using validation schemas on each POST request
- **Error handling**: Comprehensive error display following GOV.UK patterns

**Flow Control Logic**
```typescript
// Flow control ensures users cannot skip steps
const FLOW_SEQUENCE = ['name', 'date-of-birth', 'address', 'role', 'summary'];

function validateFlowProgression(currentStep: string, requestedStep: string, sessionData: OnboardingSession): boolean {
  const currentIndex = FLOW_SEQUENCE.indexOf(currentStep);
  const requestedIndex = FLOW_SEQUENCE.indexOf(requestedStep);

  // Allow backward navigation and summary from any completed step
  if (requestedStep === 'summary' || requestedIndex <= currentIndex) {
    return true;
  }

  // Ensure all previous steps are completed
  return hasCompletedPreviousSteps(requestedIndex, sessionData);
}
```

### Session Management Strategy

**Session Configuration**
- Namespace: `req.session.onboarding` to avoid conflicts with other modules

**Data Persistence Pattern**
```typescript
// Session data structure with type safety
interface OnboardingSession {
  formData: Partial<OnboardingFormData>;
  currentStep: string;
  completedSteps: string[];
  startedAt: Date;
  lastActivity: Date;
  referenceNumber?: string;
}

// Session update pattern for each form step
function updateSession(req: Request, stepName: string, data: any): void {
  if (!req.session.onboarding) {
    req.session.onboarding = {
      formData: {},
      currentStep: stepName,
      completedSteps: [],
      startedAt: new Date(),
      lastActivity: new Date()
    };
  }

  req.session.onboarding.formData[stepName] = data;
  req.session.onboarding.currentStep = stepName;
  req.session.onboarding.lastActivity = new Date();

  if (!req.session.onboarding.completedSteps.includes(stepName)) {
    req.session.onboarding.completedSteps.push(stepName);
  }
}
```

**Session Recovery**
- Graceful handling of expired sessions with redirect to start
- Session restoration for incomplete journeys
- Clear session data after successful submission

## File Structure and Routing

### Module Structure

Following HMCTS monorepo patterns, the onboarding feature will be implemented as a self-contained module:

```
libs/onboarding/
├── package.json                    # Module configuration with build scripts
├── tsconfig.json                   # TypeScript configuration
├── vitest.config.ts               # Test configuration
└── src/
    ├── pages/
    |   ├── onboarding/                # Auto-discovered page controllers and templates
    |   │   ├── name.ts                # GET/POST handlers for name step
    |   │   ├── name.njk               # Name page template
    |   │   ├── date-of-birth.ts       # Date of birth step
    |   │   ├── date-of-birth.njk      # Date of birth template
    |   │   ├── address.ts             # Address collection step
    |   │   ├── address.njk            # Address page template
    |   │   ├── role.ts                # Role selection step
    |   │   ├── role.njk               # Role page template
    |   │   ├── summary.ts             # Check your answers page
    |   │   ├── summary.njk            # Summary page template
    |   │   ├── confirmation.ts        # Final confirmation
    |   │   └── confirmation.njk       # Confirmation template
    ├── locales/                   # i18n translations
    │   ├── en.ts                  # English translations
    │   └── cy.ts                  # Welsh translations
    ├── onboarding/               # Domain logic
    │   ├── onboarding-service.ts  # Business logic and orchestration
    │   ├── validation-schemas.ts  # Form validation rules
    │   ├── session-helpers.ts     # Session management utilities
    │   └── reference-generator.ts # Reference number generation
    └── assets/                   # Optional frontend assets
        ├── css/
        │   └── onboarding.scss    # Module-specific styles
        └── js/
            └── form-enhancement.ts # Progressive enhancement
```

### Homepage Integration

Update the existing homepage to include the onboarding form link:

```typescript
// Modification to existing homepage controller (apps/web/src/pages/index.ts)
export const GET = async (_req: Request, res: Response) => {
  res.render("index", {
    en: {
      // ... existing content ...
      exampleForm: {
        title: "Try our example onboarding form",
        description: "See how we collect information using best practice form design",
        linkText: "See example form",
        href: "/onboarding/name"
      }
    },
    cy: {
      // ... existing content ...
      exampleForm: {
        title: "Rhowch gynnig ar ein ffurflen hyfforddi enghreifftiol",
        description: "Gwelwch sut rydym yn casglu gwybodaeth gan ddefnyddio dyluniad ffurflen arfer gorau",
        linkText: "Gweld ffurflen enghreifftiol",
        href: "/onboarding/name"
      }
    }
  });
};
```

## Error Handling Implementation

### Server-Side Validation Approach

**Validation Pipeline**
```typescript
// libs/onboarding/src/onboarding/validation-schemas.ts
import { z } from 'zod';

export const nameSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, { message: 'Enter your first name' })
    .max(100, { message: 'First name must be 100 characters or fewer' })
    .regex(/^[a-zA-Z\s\-']+$/, { message: 'Name must only include letters, spaces, hyphens and apostrophes' }),
  lastName: z.string()
    .trim()
    .min(1, { message: 'Enter your last name' })
    .max(100, { message: 'Last name must be 100 characters or fewer' })
    .regex(/^[a-zA-Z\s\-']+$/, { message: 'Name must only include letters, spaces, hyphens and apostrophes' })
});

export const dateOfBirthSchema = z.object({
  day: z.string().min(1, { message: 'Enter a day' }),
  month: z.string().min(1, { message: 'Enter a month' }),
  year: z.string().min(1, { message: 'Enter a year' })
}).refine((data) => {
  const day = parseInt(data.day);
  const month = parseInt(data.month);
  const year = parseInt(data.year);

  // Validate ranges
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  // Validate real date
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return false;
  }

  // Validate age (16+)
  const today = new Date();
  const age = today.getFullYear() - year;
  return age >= 16;
}, { message: 'Enter a valid date. You must be at least 16 years old' });
```

**Validation Implementation Pattern**
```typescript
// libs/onboarding/src/pages/name.ts
import type { Request, Response } from 'express';
import { validateFormData } from '../onboarding/validation-helpers.js';
import { nameSchema } from '../onboarding/validation-schemas.js';
import { updateSession } from '../onboarding/session-helpers.js';

export const POST = async (req: Request, res: Response) => {
  const validationResult = validateFormData(nameSchema, req.body);

  if (!validationResult.success) {
    return res.render('name', {
      errors: validationResult.errors,
      errorSummary: validationResult.errorSummary,
      formData: req.body,
      hasErrors: true
    });
  }

  updateSession(req, 'name', validationResult.data);
  res.redirect('/onboarding/date-of-birth');
};
```

### Error State Management

**Error Display Pattern**
```typescript
// libs/onboarding/src/onboarding/validation-helpers.ts
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, { text: string; href: string }>;
  errorSummary?: Array<{ text: string; href: string }>;
}

export function validateFormData<T>(schema: ZodSchema<T>, data: any): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, { text: string; href: string }> = {};
  const errorSummary: Array<{ text: string; href: string }> = [];

  result.error.errors.forEach((error) => {
    const field = error.path[0] as string;
    const errorData = {
      text: error.message,
      href: `#${field}`
    };

    errors[field] = errorData;
    errorSummary.push(errorData);
  });

  return { success: false, errors, errorSummary };
}
```

- All form submission uses standard HTTP POST requests
- Server-side validation provides complete error handling
- Page titles include "Error: " prefix when validation fails
- Back links use standard navigation without JavaScript enhancement
- Focus management handled through server-side HTML structure

**Template Error Handling**
```html
<!-- Error summary pattern in Nunjucks templates -->
{% if hasErrors %}
  {{ govukErrorSummary({
    titleText: errorSummaryTitle,
    errorList: errorSummary
  }) }}
{% endif %}

<!-- Input with error state -->
{{ govukInput({
  id: "firstName",
  name: "firstName",
  label: { text: firstNameLabel },
  value: formData.firstName,
  errorMessage: errors.firstName if errors.firstName
}) }}
```

## Data Models and Types

### Core Data Types

```typescript
// libs/onboarding/src/onboarding/types.ts

// Complete form data structure
export interface OnboardingFormData {
  name: {
    firstName: string;
    lastName: string;
  };
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  address: {
    buildingStreet: string;
    buildingStreet2?: string;
    townCity: string;
    county?: string;
    postcode: string;
  };
  role: {
    role: 'frontend' | 'backend' | 'testEngineer' | 'other';
    otherRole?: string;
  };
}

// Session data structure
export interface OnboardingSession {
  formData: Partial<OnboardingFormData>;
  currentStep: string;
  completedSteps: string[];
  startedAt: Date;
  lastActivity: Date;
  referenceNumber?: string;
}

// Express session type extension
declare module 'express-session' {
  interface SessionData {
    onboarding?: OnboardingSession;
  }
}

// Request validation types
export interface NameFormRequest {
  firstName: string;
  lastName: string;
}

export interface DateOfBirthFormRequest {
  day: string;
  month: string;
  year: string;
}

export interface AddressFormRequest {
  buildingStreet: string;
  buildingStreet2?: string;
  townCity: string;
  county?: string;
  postcode: string;
}

export interface RoleFormRequest {
  role: string;
  otherRole?: string;
}

// Template data types
export interface PageTemplateData {
  en: Record<string, any>;
  cy: Record<string, any>;
  errors?: Record<string, { text: string; href: string }>;
  errorSummary?: Array<{ text: string; href: string }>;
  formData?: any;
  hasErrors?: boolean;
}
```

### Validation Schema Types

```typescript
// libs/onboarding/src/onboarding/validation-schemas.ts
import { z } from 'zod';

// UK postcode validation regex
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

// Name validation schema
export const nameSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, { message: 'Enter your first name' })
    .max(50, { message: 'First name must be 50 characters or fewer' }),
  lastName: z.string()
    .trim()
    .min(1, { message: 'Enter your last name' })
    .max(50, { message: 'Last name must be 50 characters or fewer' })
});

// Date of birth schema with custom validation
export const dateOfBirthSchema = z.object({
  day: z.string().min(1, { message: 'Enter a day' }),
  month: z.string().min(1, { message: 'Enter a month' }),
  year: z.string().min(1, { message: 'Enter a year' })
}).superRefine((data, ctx) => {
  const day = parseInt(data.day);
  const month = parseInt(data.month);
  const year = parseInt(data.year);

  // Individual field validation
  if (isNaN(day) || day < 1 || day > 31) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['day'],
      message: 'Day must be between 1 and 31'
    });
  }

  if (isNaN(month) || month < 1 || month > 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['month'],
      message: 'Month must be between 1 and 12'
    });
  }

  if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['year'],
      message: `Year must be between 1900 and ${new Date().getFullYear()}`
    });
  }

  // Date validity check
  if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['day'],
        message: 'Enter a real date'
      });
    } else {
      // Age validation (0-120)
      const today = new Date();
      const age = today.getFullYear() - year - (today.getMonth() < month - 1 ||
        (today.getMonth() === month - 1 && today.getDate() < day) ? 1 : 0);

      if (age < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['year'],
          message: 'Date of birth cannot be in the future'
        });
      }

      if (age > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['year'],
          message: 'Age must be 120 years or less'
        });
      }
    }
  }
});

// Address validation schema
export const addressSchema = z.object({
  buildingStreet: z.string()
    .trim()
    .min(1, { message: 'Enter building and street' })
    .max(200, { message: 'Building and street must be 200 characters or fewer' }),
  buildingStreet2: z.string()
    .trim()
    .max(200, { message: 'Address line 2 must be 200 characters or fewer' })
    .optional(),
  townCity: z.string()
    .trim()
    .min(1, { message: 'Enter town or city' })
    .max(100, { message: 'Town or city must be 100 characters or fewer' }),
  county: z.string()
    .trim()
    .max(100, { message: 'County must be 100 characters or fewer' })
    .optional(),
  postcode: z.string()
    .trim()
    .min(1, { message: 'Enter postcode' })
    .regex(UK_POSTCODE_REGEX, { message: 'Enter a real postcode' })
});

// Role validation schema
export const roleSchema = z.object({
  role: z.enum(['frontend', 'backend', 'testEngineer', 'other'], {
    errorMap: () => ({ message: 'Select your role' })
  }),
  otherRole: z.string().trim().optional()
}).superRefine((data, ctx) => {
  if (data.role === 'other') {
    if (!data.otherRole || data.otherRole.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherRole'],
        message: 'Enter your role'
      });
    } else if (data.otherRole.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherRole'],
        message: 'Role must be at least 2 characters'
      });
    } else if (data.otherRole.length > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherRole'],
        message: 'Role must be 100 characters or fewer'
      });
    }
  }
});

// Schema type exports
export type NameFormData = z.infer<typeof nameSchema>;
export type DateOfBirthFormData = z.infer<typeof dateOfBirthSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type RoleFormData = z.infer<typeof roleSchema>;
```

## Module Integration

### Auto-Discovery Integration

The onboarding module integrates seamlessly with the existing web application through the module auto-discovery system:

**Automatic Registration**
```typescript
// No manual registration required - the module is automatically discovered
// by apps/web/src/modules.ts because it contains a pages/ directory

// Module will be automatically included when:
// 1. libs/onboarding/src/pages/ directory exists
// 2. Module added to root tsconfig.json paths
// 3. Build process includes the module
```

**Root Configuration Updates**
```json
// tsconfig.json (root level)
{
  "compilerOptions": {
    "paths": {
      // ... existing paths ...
      "@hmcts/onboarding": ["libs/onboarding/src"]
    }
  }
}
```

**Module Package Configuration**
```json
// libs/onboarding/package.json
{
  "name": "@hmcts/onboarding",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc && yarn build:nunjucks",
    "build:nunjucks": "mkdir -p dist/pages && cd src/pages && find . -name '*.njk' -exec sh -c 'mkdir -p ../../dist/pages/$(dirname {}) && cp {} ../../dist/pages/{}' \\;",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest watch"
  },
  "peerDependencies": {
    "express": "^5.1.0"
  },
  "dependencies": {
    "zod": "^3.22.4"
  }
}
```

### Dependencies and Integration Points

**Session Middleware Dependency**
- Requires Express session middleware to be configured in the main app
- Sessions already configured in `apps/web/src/app.ts`
- Module uses namespaced session key: `req.session.onboarding`

**Template System Integration**
- Uses existing Nunjucks configuration from main web app
- Extends `layouts/base.njk` for consistent page structure
- Integrates with existing i18n middleware for language switching

**No External Module Dependencies**
- Self-contained module with no dependencies on other custom modules
- Uses shared infrastructure (sessions, templates, i18n) provided by main app
- Can be developed and tested independently

### Service Integration Pattern

```typescript
// libs/onboarding/src/onboarding/onboarding-service.ts
export class OnboardingService {

  static generateReferenceNumber(): string {
    // Generate reference number in format NNNN-NNNN-NNNN-NNNN based on timestamp
    const timestamp = Date.now().toString();
    const padded = timestamp.padStart(16, '0');
    const chunks = padded.match(/.{1,4}/g) || [];
    return chunks.join('-');
  }

  static formatDateForDisplay(dateData: { day: string; month: string; year: string }): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const day = parseInt(dateData.day);
    const month = parseInt(dateData.month) - 1;
    const year = parseInt(dateData.year);

    return `${day} ${months[month]} ${year}`;
  }

  static formatAddressForDisplay(addressData: AddressFormData): string[] {
    const lines = [addressData.buildingStreet];

    if (addressData.buildingStreet2) {
      lines.push(addressData.buildingStreet2);
    }

    lines.push(addressData.townCity);

    if (addressData.county) {
      lines.push(addressData.county);
    }

    lines.push(addressData.postcode);

    return lines;
  }

  static isFormComplete(formData: Partial<OnboardingFormData>): boolean {
    return !!(
      formData.name &&
      formData.dateOfBirth &&
      formData.address &&
      formData.role
    );
  }
}
```

## Data Persistence

### Database Schema

Form submissions will be persisted to PostgreSQL using Prisma:

```prisma
// apps/postgres/prisma/schema.prisma - Addition to existing schema

model OnboardingSubmission {
  id              String   @id @default(cuid())
  referenceNumber String   @unique @map("reference_number")
  firstName       String   @map("first_name")
  lastName        String   @map("last_name")
  dateOfBirth     DateTime @map("date_of_birth")
  buildingStreet  String   @map("building_street")
  buildingStreet2 String?  @map("building_street_2")
  townCity        String   @map("town_city")
  county          String?  @map("county")
  postcode        String   @map("postcode")
  role            String   @map("role")
  otherRole       String?  @map("other_role")
  submittedAt     DateTime @default(now()) @map("submitted_at")

  @@map("onboarding_submission")
}
```

### Persistence Service

```typescript
// libs/onboarding/src/onboarding/submission-service.ts
import { prisma } from '@hmcts/postgres';
import type { OnboardingFormData } from './types.js';

export class SubmissionService {
  static async saveSubmission(formData: OnboardingFormData, referenceNumber: string) {
    const dateOfBirth = new Date(
      parseInt(formData.dateOfBirth.year),
      parseInt(formData.dateOfBirth.month) - 1,
      parseInt(formData.dateOfBirth.day)
    );

    await prisma.onboardingSubmission.create({
      data: {
        referenceNumber,
        firstName: formData.name.firstName,
        lastName: formData.name.lastName,
        dateOfBirth,
        buildingStreet: formData.address.buildingStreet,
        buildingStreet2: formData.address.buildingStreet2,
        townCity: formData.address.townCity,
        county: formData.address.county,
        postcode: formData.address.postcode,
        role: formData.role.role,
        otherRole: formData.role.otherRole
      }
    });
  }
}
```

## Clarifications Applied

### Resolved Questions:
1. **Reference Number Format**: NNNN-NNNN-NNNN-NNNN based on timestamp
2. **Name Validation**: Maximum 50 characters, no special character restrictions
3. **Age Validation**: Minimum age 0, maximum age 120
4. **Postcode Validation**: Basic regex pattern validation
5. **Role Options**: Fixed list (Frontend Developer, Backend Developer, Test Engineer, Other)
6. **Data Persistence**: Store in PostgreSQL using Prisma
7. **Test Coverage**: E2E tests in English only

### Not Required:
- Session timeout handling (handled by existing infrastructure)
- Address lookup service integration
- Cross-browser testing
- Performance testing

---

*This technical implementation supplement should be reviewed alongside the UI/UX specification by technical architects, backend developers, and frontend developers before development begins.*