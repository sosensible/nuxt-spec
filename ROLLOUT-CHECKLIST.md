# SpecKit Validation Testing: Rollout Checklist

**Purpose**: Track standardization of validation testing across all SpecKit starter repos.

## Core Files to Copy

From `nuxt-spec` repo → Target repo:

- [ ] `tests/helpers/hydration.ts`
- [ ] `tests/helpers/form-validation.ts`
- [ ] `tests/examples/validation-patterns.spec.ts`
- [ ] `tests/VALIDATION-TESTING.md`
- [ ] `tests/SPECKIT-VALIDATION-STANDARD.md`
- [ ] `tests/QUICK-START.md`

## Phase 1: Core Authentication Repos

### 1. nuxt-saas-starter

**Priority**: 🔴 High (Primary reference)  
**Owner**: @sosensible  
**Target Date**: 2025-10-24

Forms to update:

- [ ] Login form (`/login`)
- [ ] Registration form (`/register`)
- [ ] Password reset request (`/password-reset`)
- [ ] Password reset confirm (`/password-reset/[token]`)
- [ ] Email verification flow
- [ ] User profile edit

Test files to create/update:

- [ ] `tests/e2e/auth/login.spec.ts`
- [ ] `tests/e2e/auth/registration.spec.ts`
- [ ] `tests/e2e/auth/password-reset.spec.ts`
- [ ] `tests/e2e/auth/email-verification.spec.ts`
- [ ] `tests/e2e/user/profile.spec.ts`

Validation:

- [ ] All validation tests pass (minimum 10/10)
- [ ] Playwright config updated (suppress server noise)
- [ ] README updated with testing instructions
- [ ] CI/CD updated to run with `--workers=1`

---

### 2. nuxt-auth-starter

**Priority**: 🔴 High (Auth-focused template)  
**Owner**: @sosensible  
**Target Date**: 2025-10-25

Forms to update:

- [ ] Login form with MFA
- [ ] Registration with email verification
- [ ] Password reset flow
- [ ] MFA setup form
- [ ] Profile settings

Test files:

- [ ] `tests/e2e/auth/login-mfa.spec.ts`
- [ ] `tests/e2e/auth/registration.spec.ts`
- [ ] `tests/e2e/auth/mfa-setup.spec.ts`
- [ ] `tests/e2e/settings/profile.spec.ts`

Special considerations:

- [ ] MFA code validation patterns
- [ ] Backup code validation
- [ ] Session management testing

---

### 3. nuxt-admin-starter

**Priority**: 🟡 Medium (Admin-specific patterns)  
**Owner**: @sosensible  
**Target Date**: 2025-10-28

Forms to update:

- [ ] Admin login
- [ ] User management (create/edit users)
- [ ] Role/permission forms
- [ ] Settings forms
- [ ] Bulk actions

Test files:

- [ ] `tests/e2e/admin/login.spec.ts`
- [ ] `tests/e2e/admin/user-management.spec.ts`
- [ ] `tests/e2e/admin/settings.spec.ts`

Special considerations:

- [ ] Admin-specific validation rules
- [ ] Bulk operation validation
- [ ] Permission-based form access

---

## Phase 2: Specialized Application Repos

### 4. nuxt-ecommerce-starter

**Priority**: 🟡 Medium  
**Owner**: TBD  
**Target Date**: 2025-10-30

Forms to update:

- [ ] Checkout forms (shipping, billing)
- [ ] Product creation/editing
- [ ] Customer address forms
- [ ] Payment method forms
- [ ] Review/rating forms

Test files:

- [ ] `tests/e2e/checkout/shipping.spec.ts`
- [ ] `tests/e2e/checkout/payment.spec.ts`
- [ ] `tests/e2e/products/create.spec.ts`

Special considerations:

- [ ] Multi-step form validation
- [ ] Payment validation patterns
- [ ] Address validation (postal codes, etc.)

---

### 5. nuxt-blog-starter

**Priority**: 🟢 Low  
**Owner**: TBD  
**Target Date**: 2025-11-01

Forms to update:

- [ ] Contact form
- [ ] Comment form
- [ ] Newsletter signup
- [ ] Post creation/editing

Test files:

- [ ] `tests/e2e/contact.spec.ts`
- [ ] `tests/e2e/comments.spec.ts`
- [ ] `tests/e2e/newsletter.spec.ts`

---

### 6. nuxt-crm-starter

**Priority**: 🟡 Medium  
**Owner**: TBD  
**Target Date**: 2025-11-03

Forms to update:

- [ ] Lead capture forms
- [ ] Contact creation/editing
- [ ] Deal/opportunity forms
- [ ] Task/activity forms
- [ ] Custom field forms

Test files:

- [ ] `tests/e2e/leads/capture.spec.ts`
- [ ] `tests/e2e/contacts/management.spec.ts`
- [ ] `tests/e2e/deals/pipeline.spec.ts`

---

## Standardization Requirements

Every repo must have:

### Documentation

- [ ] `tests/QUICK-START.md` (copied)
- [ ] `tests/VALIDATION-TESTING.md` (copied)
- [ ] `tests/SPECKIT-VALIDATION-STANDARD.md` (copied)
- [ ] README section on testing

### Configuration

- [ ] `playwright.config.ts` updated (suppress server output)
- [ ] `package.json` has test scripts
- [ ] `.github/workflows/` updated for serial execution

### Code Quality

- [ ] All forms have `data-testid` attributes
- [ ] All schemas in `app/schemas/`
- [ ] Consistent error messages
- [ ] TypeScript strict mode

### Test Coverage

- [ ] Minimum 80% validation coverage
- [ ] All critical paths tested
- [ ] Edge cases documented

---

## CI/CD Integration

Update GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run validation tests
        run: npx playwright test -g "validation" --workers=1

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Success Criteria

### Per-Repo

- [ ] ✅ All validation tests passing (100%)
- [ ] ✅ Test execution < 5 minutes
- [ ] ✅ Zero flaky tests
- [ ] ✅ Documentation complete
- [ ] ✅ CI/CD passing

### Cross-Repo

- [ ] ✅ Consistent test patterns
- [ ] ✅ Shared utilities working
- [ ] ✅ Same error message formats
- [ ] ✅ Unified documentation

---

## Maintenance Plan

### Weekly

- [ ] Review test failures across repos
- [ ] Update shared utilities if needed
- [ ] Address flaky tests

### Monthly

- [ ] Update dependencies (Playwright, Nuxt, etc.)
- [ ] Review test coverage metrics
- [ ] Update documentation

### Quarterly

- [ ] Comprehensive testing pattern review
- [ ] Performance optimization
- [ ] Add new patterns as needed

---

## Resources

- **Reference Repo**: [nuxt-spec](https://github.com/sosensible/nuxt-spec)
- **Standard Docs**: `tests/SPECKIT-VALIDATION-STANDARD.md`
- **Quick Start**: `tests/QUICK-START.md`
- **Discussions**: [GitHub Discussions](https://github.com/sosensible/speckit/discussions)

---

## Notes

- Use `--workers=1` for initial implementation to avoid hydration issues
- Test data must use "invalidemail" (no @) for email validation
- All forms need 3-second hydration buffer
- Document any repo-specific patterns
