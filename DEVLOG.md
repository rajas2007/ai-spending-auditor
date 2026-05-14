# DEVLOG.md

## Day 1 — 2026-05-07

**Hours worked:** 5

**What I did:**  
Started planning the overall architecture for Aethra and finalized the product direction as an AI spend optimization platform. Set up the Next.js 16 project with TypeScript and Tailwind CSS. Began building the landing page and initial audit input workflow. Researched AI pricing models and reviewed competitor approaches for AI tooling cost analysis.

**What I learned:**  
I realized very quickly that this project was more product-focused than algorithm-focused. The UX and onboarding flow matter almost as much as the actual audit engine.

**Blockers / what I'm stuck on:**  
I was still unsure how detailed the pricing logic should be and whether to use AI for all recommendations or only summaries.

**Plan for tomorrow:**  
Implement the initial audit engine structure and begin integrating pricing logic.

---

## Day 2 — 2026-05-07

**Hours worked:** 6

**What I did:**  
Built the first version of the audit engine using deterministic pricing calculations. Added support for multiple AI tools and plans. Started creating the results page UI and implemented recommendation cards showing savings opportunities. Began experimenting with Anthropic API integration for personalized summaries.

**What I learned:**  
Using AI for all calculations was a mistake. Deterministic logic is much more reliable for pricing analysis, while AI works better for summaries and explanations.

**Blockers / what I'm stuck on:**  
Formatting AI responses consistently was difficult. Some outputs were too long or inconsistent for rendering inside the UI.

**Plan for tomorrow:**  
Add normalization and improve report rendering consistency.

---

## Day 3 — 2026-05-07

**Hours worked:** 7

**What I did:**  
Added Supabase integration for authentication and persistent audit storage. Implemented dashboard history and started building public report routes. Added support for unique report URLs and experimented with public access patterns. Worked on responsive styling and improved the overall visual design.

**What I learned:**  
Public sharing creates real security considerations. Anonymous report access is much harder to implement safely than I originally expected.

**Blockers / what I'm stuck on:**  
Supabase row-level security policies were becoming complicated once guest access and public reports both needed to work together.

**Plan for tomorrow:**  
Continue stabilizing persistence and public report retrieval.

---

## Day 4 — 2026-05-12

**Hours worked:** 8

**What I did:**  
Implemented PDF export and transactional email delivery using Resend. Built the lead capture workflow and connected it to the backend. Added share buttons and improved the report presentation layout. Started debugging hydration mismatches and client/server rendering issues on report pages.

**What I learned:**  
Email and export workflows take significantly more polish than expected. Small rendering problems make the product feel unfinished very quickly.

**Blockers / what I'm stuck on:**  
I ran into multiple issues with Resend environment variables, domain verification restrictions, and React email rendering packages.

**Plan for tomorrow:**  
Fix report persistence issues and improve production stability.

---

## Day 5 — 2026-05-12

**Hours worked:** 7

**What I did:**  
Focused heavily on debugging Supabase persistence and report saving issues. The guest audit flow kept failing because of conflicting RLS policies. Simplified the abuse protection approach by replacing backend-heavy logic with a lightweight frontend cooldown and honeypot field. Stabilized public report retrieval using a secure RPC function.

**What I learned:**  
I learned that overengineering relatively small requirements can destabilize the entire application. Simpler systems are often more reliable and easier to maintain.

**Blockers / what I'm stuck on:**  
Guest persistence failures were difficult to debug because the issue involved frontend behavior, backend APIs, and database policies simultaneously.

**Plan for tomorrow:**  
Optimize Lighthouse performance and finalize production readiness.

---

## Day 6 — 2026-05-13

**Hours worked:** 6

**What I did:**  
Improved Lighthouse performance significantly by reducing expensive visual effects, lazy-loading heavier components, and removing excessive debug logging. Verified production builds and fixed lint issues. Improved PDF formatting and stabilized mobile responsiveness across audit and report pages.

**What I learned:**  
Development mode performance is very misleading. The production build performed dramatically better than the development environment during Lighthouse testing.

**Blockers / what I'm stuck on:**  
Balancing visual polish with mobile performance required more iteration than expected.

**Plan for tomorrow:**  
Finish documentation, polish repository presentation, and validate final submission requirements.

---

## Day 7 — 2026-05-13

**Hours worked:** 5

**What I did:**  
Completed documentation files including architecture notes, GTM strategy, economics analysis, prompt documentation, testing notes, and user validation writeups. Cleaned the repository structure, verified production builds, confirmed lint/test stability, and prepared the project for deployment and submission.

**What I learned:**  
Good engineering is not only about shipping features. Product thinking, documentation quality, and clear reasoning behind trade-offs matter just as much.

**Blockers / what I'm stuck on:**  
The biggest challenge at this stage was ensuring the submission matched all assignment formatting requirements exactly.

**Plan for tomorrow:**  
Finalize deployment verification and submit the assignment.