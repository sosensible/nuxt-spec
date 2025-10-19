# Template Updates - Constitution & Standards Alignment

**Date**: 2025-10-18  
**Version**: Aligned with Constitution v1.2.0

## Summary

Updated all three SpecKit templates to enforce constitutional requirements and development standards:

1. `plan-template.md` - Added Standards Compliance Checklist
2. `spec-template.md` - Added comprehensive TDD Requirements and Standards sections
3. `tasks-template.md` - Made TDD mandatory with RED-GREEN-REFACTOR phases and Standards verification

## Changes by Template

### 1. plan-template.md

**Section Added**: Standards Compliance Checklist

**Key Changes**:

- ✅ Updated "Component-Driven Testing" to "Test-Driven Development" in Constitution Check
- ✅ Added comprehensive standards checklist covering:
  - State management patterns
  - Component design limits
  - Accessibility & UX requirements
  - Error handling strategy
  - Documentation requirements
  - CSS & styling approach

**Impact**: Every new plan will now require upfront consideration of all development standards

---

### 2. spec-template.md

**Section Added**: Test-Driven Development Requirements (mandatory)

**Key Changes**:

- ✅ Added detailed TDD section with RED-GREEN-REFACTOR phases
- ✅ Added testing strategy breakdown (Unit, API Contract, E2E)
- ✅ Added comprehensive Standards Compliance Requirements section
- ✅ Checklist items for:
  - Accessibility (WCAG 2.1 AA)
  - Component communication patterns
  - Error handling requirements
  - CSS & styling standards
  - Documentation requirements
  - Naming conventions

**Impact**: Every new spec will explicitly define TDD approach and standards compliance from the start

---

### 3. tasks-template.md

**Major Restructure**: Made TDD mandatory with explicit phases

**Key Changes**:

- ✅ Removed "OPTIONAL - only if tests requested" language
- ✅ Made tests MANDATORY following Constitution Principle IV
- ✅ Split each user story into three phases:
  1. **RED Phase**: Write tests, verify they FAIL, document failure
  2. **GREEN Phase**: Implement features, verify tests PASS
  3. **REFACTOR Phase**: Improve code while keeping tests GREEN
- ✅ Added Standards Compliance Verification section for each user story
- ✅ Added Final TDD Verification section
- ✅ Added Final Standards Compliance Review section
- ✅ Added checkpoints after each phase

**Impact**: Every task list will now enforce TDD cycle and standards verification at every user story

---

## Constitutional Alignment

These updates ensure all templates enforce:

### Core Principle IV: Test-Driven Development (NON-NEGOTIABLE)

✅ **RED-GREEN-REFACTOR Cycle**: Explicitly required in tasks template  
✅ **Tests Before Code**: Phase structure enforces test-first approach  
✅ **Proof of RED**: Requires documentation of failing tests  
✅ **Proof of GREEN**: Requires verification tests pass after implementation  
✅ **Refactor Safety**: Maintains green tests during refactoring

### Development Standards Reference

✅ **State Management**: Composable wrappers, pattern selection  
✅ **Component Communication**: Props/events decision trees  
✅ **Accessibility**: WCAG 2.1 AA requirements  
✅ **Error Handling**: Client and server patterns  
✅ **CSS & Styling**: Tailwind-first approach  
✅ **Documentation**: JSDoc, README requirements  
✅ **Naming Conventions**: All file and variable patterns

---

## Template Usage

### For New Features

1. **Plan Phase** (`/speckit.plan`)

   - Constitution Check ensures core principles followed
   - Standards Compliance Checklist identifies patterns upfront

2. **Spec Phase** (spec.md creation)

   - TDD Requirements section defines test strategy
   - Standards Compliance Requirements lists all standards to meet

3. **Tasks Phase** (`/speckit.tasks`)
   - Each user story follows RED-GREEN-REFACTOR
   - Standards verified per user story
   - Final verification before completion

### Verification Points

**At Plan Creation**:

- [ ] Constitution Check complete
- [ ] Standards Compliance Checklist filled

**At Spec Creation**:

- [ ] TDD strategy defined
- [ ] Test types identified (Unit, API, E2E)
- [ ] Standards requirements listed

**During Implementation**:

- [ ] Tests written BEFORE code (RED phase)
- [ ] Tests initially FAIL (documented)
- [ ] Code makes tests PASS (GREEN phase)
- [ ] Code refactored (tests stay GREEN)
- [ ] Standards verified per user story

**At Completion**:

- [ ] Git history shows test commits before implementation
- [ ] Coverage >80% achieved
- [ ] All standards met
- [ ] Documentation complete

---

## Benefits

1. **Impossible to Forget**: Templates make TDD and standards compliance part of the process
2. **Clear Checkpoints**: Each phase has verification steps
3. **Independent Stories**: Each user story has its own standards verification
4. **Constitutional Enforcement**: Templates encode constitutional requirements
5. **Living Standards**: References link to development-standards.md for details

---

## Next Steps

1. ✅ Templates updated and aligned
2. ⏭️ Test templates with next feature spec
3. ⏭️ Gather feedback and refine if needed
4. ⏭️ Consider creating PR review checklist that references these sections

---

_These templates are now aligned with Constitution v1.2.0 and Development Standards v1.0.0_
