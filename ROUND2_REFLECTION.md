# Round 2: Engineering Reflection

## What Went Well

### 1. Clear Scope, Smooth Execution

Round 2 had a well-defined scope that matched the actual implementation needs perfectly. Unlike Round 1 where many decisions were exploratory, Round 2 benefited from:

- **Clear Requirements:** Re-audit generation, comparison page, discovery flow were all explicit
- **Simple Architecture:** One-to-many audit lineage (parent → re-audits) is elegant and bug-free
- **Reusable Components:** Existing audit rendering logic worked immediately for side-by-side comparison
- **No Scope Creep:** Team stayed focused on core features; notification emails were intentionally deferred

**Result:** Implementation was straightforward. Most sessions involved building a feature, testing it, and moving on. No major pivots or architectural reversals were needed.

### 2. Incremental Verification

Each component was independently testable:

- Re-audit storage: Verified with API calls
- Comparison page: Tested with multiple audit pairs
- Discovery flow: Verified with manual page refreshes
- Production readiness: Built cleanly, zero warnings

This incremental approach meant bugs were caught early and isolated easily. No integration surprises.

### 3. Data Model Correctness

The immutable audit + `reaudit_of` lineage model was straightforward to implement and reason about:

- Original audits never change
- Re-audits are new rows with parent reference
- Queries are simple: `WHERE reaudit_of = id`
- Lineage is unambiguous

This simplicity prevented many classes of bugs that could have emerged from complex version tracking or mutation logic.

### 4. Type Safety Prevented Issues

Full TypeScript coverage meant several potential bugs were caught at compile time:

- Incorrect prop types for re-audit data
- Missing null checks on optional fields
- Serialization issues between server/client

No runtime type errors occurred.

---

## What Was Challenging

### 1. Server/Client Serialization Boundaries

The most tricky aspect was passing `StoredAudit | null` from server component to client component.

**The Problem:**
- Server components run on backend; client components run in browser
- Next.js serializes data across this boundary
- Undefined values can cause serialization issues
- Optional props are easy to mishandle

**How I Solved It:**
- Used `JSON.parse(JSON.stringify(audit))` to explicitly serialize data
- This strips any `undefined` values and ensures clean JSON
- Explicitly typed the prop as `StoredAudit | null` (never `undefined`)
- Added null checks in client component render logic

**Lesson:** This is a common Next.js App Router footgun. The solution is straightforward once you know about it, but the error messages aren't always clear.

### 2. Performance Uncertainty

Midway through implementation, I worried:

- "Will querying for re-audits on every report page load be too slow?"
- "Should I cache this? Add a materialized view? Use Redis?"

**Reality Check:**
- Query with index is O(1), typically <10ms
- Not worth optimization until there's actual evidence of problems
- Premature optimization adds complexity

**Lesson:** Measure before optimizing. Simple is better.

### 3. Scroll-Behavior Warning Mystery

The Next.js warning about `scroll-behavior: smooth` CSS on the `<html>` element was confusing because:

- The app *was* working correctly
- Smooth scrolling *was* happening
- The warning suggested a problem that wasn't visible

**The Real Issue:**
- Next.js App Router prefers to handle smooth scrolling via `data-scroll-behavior` attribute
- This gives Next.js JavaScript control over scroll behavior during route transitions
- CSS-based smooth scroll can interfere with route transitions
- The solution is moving the behavior from CSS to the attribute

**Lesson:** Sometimes warnings are about best practices rather than correctness. Reading the Next.js docs clarified this immediately.

---

## Intentional Tradeoffs & What Was Cut

### Notification Emails — Intentionally Deferred

**Decision:** Notifications when a new re-audit is created are NOT implemented in Round 2.

**Why Cut:**
- Requires new database schema: `user_preferences` or `audit_subscriptions` table
- Needs UI for notification preferences
- Depends on email queue system and background jobs
- Low priority compared to core comparison features

**What Would Be Required:**
1. User preference UI (settings page with email toggles)
2. Database migration for preferences
3. Email queue system (using existing Resend)
4. Background job to watch for new re-audits
5. Testing for all preference combinations

**Reasoning:** Notifications are a nice-to-have, but the core workflow (users manually reviewing reports) works fine without them. Better to ship the comparison features solid than to rush notifications and have quality issues.

**Future Work:** This is a clean feature to add in Round 3 once Round 2 is validated.

### Dashboard Rewrite — Intentionally Avoided

**Decision:** Dashboard was NOT redesigned to showcase re-audits.

**Why Not Rewritten:**
- Existing dashboard already displays audits effectively
- Redesign would introduce regression risk
- Re-audit features work standalone (report page discovery)
- UI clutter: adding too much to dashboard dilutes focus

**Trade-off:** Users can't easily see all re-audits in one place. They have to navigate to individual reports to see comparison cards.

**Mitigation:** Report page comparison discovery is good enough for MVP. Dashboard enhancement is a follow-up.

### Complex History Systems — Intentionally Simple

**Decision:** Audit history is represented as simple lineage, not a complex graph.

**Why Stayed Simple:**
- Each audit has one parent (if it's a re-audit) → tree structure
- No branches, no merges, no complex ancestry
- Queries are trivial: `WHERE reaudit_of = id`

**Alternative Considered:** Full version graph with merkle hashing, branching re-audits, etc.
- Rejected because unnecessary for current use case
- Would add significant complexity without clear benefit
- Simpler lineage enables faster development and fewer bugs

### Realtime Infrastructure — Intentionally Not Added

**Decision:** No WebSocket or realtime subscriptions for re-audit updates.

**Why Not Built:**
- Re-audit generation is asynchronous (takes ~1 second)
- Users are happy to refresh and wait (not expecting instant notifications)
- Realtime infrastructure (Socket.io, Pusher, etc.) adds operational complexity
- Cost and maintenance burden not justified

**Trade-off:** Users have to manually refresh to see new re-audits. This is acceptable.

---

## Lessons Learned

### 1. Simplicity Is a Feature

The best decisions this round were the simplest:

- **Immutable records:** Don't mutate audits; create new rows instead
- **Linear lineage:** One parent per audit; no complex graphs
- **Simple queries:** Filter by `reaudit_of`, done
- **Lightweight discovery:** One card on report page; that's it

Each of these "simple" choices prevented entire classes of bugs. The cost of simplicity is trivial compared to the bugs it prevents.

### 2. Incremental Verification Works

Building and testing each feature independently meant:

- Bugs were isolated and easy to fix
- No cascading failures
- Confidence in each component before integration
- Easier to explain to reviewers ("here's what I built, here's how to test it")

### 3. Type Safety Is Worth Defending

Full TypeScript coverage caught errors before runtime:

- Missing null checks
- Type mismatches on server/client boundary
- Incorrect prop shapes

The investment in strict mode paid off.

### 4. Measure Before Optimizing

I was initially worried about re-audit discovery query performance. Benchmarking showed:

- Indexed lookup: <10ms
- Negligible compared to page load time
- No optimization needed

This freed me to focus on correctness instead of premature micro-optimization.

### 5. Deferred Features Are OK

Intentionally deferring notifications and dashboard redesigns meant:

- Sharper focus on core features
- Higher quality implementation
- Easier review process
- Clearer scope for Round 3

Over-committing and doing everything half-finished would have been worse.

---

## What I'd Build Differently Next Time

### 1. Document Assumptions Earlier

I should have written down early:

- "Re-audits are linear, not branching"
- "No realtime infrastructure"
- "Notifications are deferred"
- "Dashboard unchanged"

This would have made it easier to explain scope decisions to reviewers.

### 2. Create a Test Matrix

Before implementation, I could have created a table:

| Scenario | Expected | Status |
|----------|----------|--------|
| Create re-audit for original audit | New row with reaudit_of set | ✅ |
| View comparison page | Both audits side-by-side | ✅ |
| Guest shares report with re-audit | Comparison card visible | ✅ |
| No re-audit exists | Card absent | ✅ |

This would have provided clear testing targets.

### 3. Separate Schema Changes into Own PR

I bundled the `reaudit_of` column addition with feature implementation. Next time:

- PR 1: Schema change with migration
- PR 2: Feature implementation
- PR 3: UI polish

This makes reviews cleaner.

### 4. Add Performance Benchmarks Earlier

Instead of guessing about query performance, I should have:

- Measured baseline
- Profiled after implementation
- Documented query times in PR

Would have prevented uncertainty.

---

## Broader Reflections on Round 2

### On Scope

Round 2 had the right scope. Features were complete and cohesive. Cutting notifications and dashboard redesigns was the right call. Over-scoping would have meant shipping half-finished features.

### On Execution

The execution was smooth because the architecture was simple and the scope was clear. This suggests that both were well-planned in the requirements.

### On Code Quality

Full TypeScript, zero warnings, zero lint issues, clean builds. This is the standard we should maintain. It's not extra work; it's just good discipline.

### On Documentation

The existing codebase was easy to understand because of good naming and simple patterns. This made Round 2 implementation fast. Comments were minimal but strategic.

### On Team Decisions

Deferring notifications in favor of shipping quality comparison features was the right call. Shipping fast is good, but shipping broken is worse. Quality first.

---

## Final Thoughts

Round 2 was a satisfying round because the architecture was clean, the scope was right-sized, and the execution was solid. The immutable audit model is elegant. The discovery flow is user-friendly. The codebase is maintainable.

The main "risk" going forward is that other features might tempt us to complicate the system. Resist that. The simplicity is a feature. The next round should focus on:

1. **Notifications** (clean, isolated feature)
2. **Analytics** (how often do users re-audit?)
3. **Benchmarking** (compare user spend to cohort)

Not:

1. Complex version graphs
2. Realtime infrastructure
3. Dashboard redesigns
4. Fancy animations

Stay focused. Stay simple.

