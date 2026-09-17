# Testing Infrastructure Blueprint

This document defines the testing architecture and conventions configured for the Stock Market Analysis Platform, aligning with enterprise fintech deployment standards.

---

## 1. Unit Testing (Jest & ts-jest)

We test utilities, Zod validation schemas, and isolated React state hooks using Jest.

### Conventions
- File placement: `src/**/*.test.ts` or `src/**/*.test.tsx`.
- Configuration: `jest.config.js` mapping `@/*` path mapping.
- Example test execution:
  ```bash
  npm run test:unit
  ```

### Example Unit Test (`src/lib/schemas.test.ts`)
```typescript
import { LoginSchema } from './schemas';

describe('LoginSchema Validation', () => {
  it('should pass correct credentials structure', () => {
    const result = LoginSchema.safeParse({ email: 'sandbox@quant.com', password: 'Password123' });
    expect(result.success).toBe(true);
  });

  it('should decline incorrect emails', () => {
    const result = LoginSchema.safeParse({ email: 'invalid-email', password: 'Password123' });
    expect(result.success).toBe(false);
  });
});
```

---

## 2. Integration Testing (React Testing Library)

We verify user interactions across component bounds (e.g., rendering loading spinners, submitting forms, or checking error boundary fallbacks).

### Setup
- Library: `@testing-library/react` and `@testing-library/jest-dom`.
- Example run:
  ```bash
  npm run test:integration
  ```

---

## 3. End-to-End Testing (Cypress / Playwright)

We perform complete browser automation tests simulating trading scenarios, watchlist updates, and user login flow sequences.

### Conventions
- Folder structure: `cypress/e2e/**/*.cy.ts`.
- Commands:
  ```bash
  # Open Cypress interactive workspace
  npx cypress open

  # Run E2E tests headlessly
  npm run test:e2e
  ```
