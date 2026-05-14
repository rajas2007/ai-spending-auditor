# REFLECTION.md

# 1. The hardest bug I hit this week, and how I debugged it

The hardest issue I encountered was related to Supabase row-level security (RLS) and anonymous audit persistence. The application needed to support guest users generating and saving audits without requiring login, while also supporting authenticated dashboards and public report sharing. Initially, everything worked locally in isolated flows, but once all systems interacted together, audit saving began failing unpredictably with RLS policy violations.

The debugging process was frustrating because the failure was spread across multiple layers: frontend requests, API routes, Supabase policies, and anonymous authentication behavior. My first hypothesis was that the frontend payload structure was malformed, so I logged the request bodies and validated them against the database schema. That looked correct. Then I suspected the API route was using the wrong Supabase client configuration, especially because environment variables were behaving differently under Next.js 16 and Turbopack. I verified the environment setup and tested requests directly.

After that, I started focusing on database policies themselves. I discovered that some of the abuse-protection logic I had introduced earlier unintentionally conflicted with anonymous insert behavior. I had initially tried implementing more aggressive backend protection, but it created cascading permission failures for guest users.

What finally worked was simplifying the architecture instead of adding more complexity. I removed the intrusive backend abuse protections and switched to lightweight frontend-only protection using a honeypot field and cooldown timer. I also simplified the insert policy structure and used a secure RPC approach for public report retrieval. That stabilized the persistence flow completely.

The biggest lesson from this bug was that overengineering small security requirements can destabilize an otherwise solid product. Simpler systems are often easier to reason about, debug, and maintain.

---

# 2. A decision I reversed mid-week, and what made me reverse it

One major decision I reversed was how much of the audit engine should rely on AI-generated reasoning versus deterministic logic. At the start of the project, I considered using the LLM for most of the recommendation generation because it seemed flexible and fast to implement. My initial thinking was that an AI model could analyze the user’s tooling stack and dynamically produce recommendations with minimal hardcoded logic.

After building an early version, I realized this approach introduced several problems. The outputs were inconsistent, difficult to validate financially, and sometimes too vague. Since the assignment specifically emphasized that the audit reasoning should feel defensible to a finance-literate person, relying entirely on AI generation started feeling risky. The same inputs occasionally produced different recommendation styles, which also made UI rendering and report consistency harder.

Midway through development, I reversed the architecture completely. I moved the pricing analysis and optimization logic into deterministic TypeScript rules while limiting the AI usage to personalized summaries only. The deterministic engine handled calculations such as plan overkill detection, overlap analysis, alternative recommendations, and savings estimation. The AI layer became a lightweight narrative enhancement instead of the decision-maker.

This reversal improved the product significantly. The reports became faster, more stable, easier to debug, and more financially credible. It also aligned much better with the assignment’s guidance about knowing when not to use AI.

The experience reinforced an important engineering principle for me: AI is strongest when augmenting structured systems, not replacing them entirely. The final architecture became a hybrid system where deterministic logic ensured correctness and AI improved readability and personalization.

---

# 3. What I would build in week 2 if I had it

If I had another full week to continue the project, I would focus on improving the realism and personalization of the audit engine rather than simply adding more features. The current version works well for generalized startup AI usage patterns, but it still makes broad assumptions about team behavior and tooling intensity.

The first major improvement I would build is role-specific audit modeling. Right now, the application assumes generalized usage across engineering, writing, research, and mixed teams. In reality, different workflows consume AI products very differently. For example, API-heavy engineering teams, data science groups, and content operations teams all have different optimization opportunities. I would introduce separate input flows and benchmarking models tailored to different operational profiles.

Second, I would implement benchmarking analytics. One of the most valuable additions would be allowing users to compare their spend against companies of similar size or workflow category. That would make the audit results feel more grounded and actionable.

Third, I would improve the shareability and virality layer. Public reports already exist, but I would expand them with richer Open Graph previews, embeddable widgets, and perhaps lightweight team collaboration features.

Finally, I would improve the economics side of the platform itself. I would add lead scoring, track estimated savings over time, and experiment with identifying which users are most likely to convert into high-value Credex consultation leads.

Overall, week 1 focused on building a stable MVP. Week 2 would focus on making the product feel smarter, more operationally useful, and more differentiated.

---

# 4. How I used AI tools

I used AI tools extensively throughout the project, but not in a one-shot code generation way. My workflow was highly iterative. I primarily used ChatGPT for debugging assistance, architectural reasoning, documentation drafting, and rapid iteration during frontend and backend integration work. I also used AI to help reason about TypeScript issues, Supabase policy behavior, prompt engineering, and deployment problems.

One of the biggest productivity gains came from using AI as a debugging partner. Instead of searching through many Stack Overflow threads individually, I could quickly test hypotheses and narrow down likely causes of issues. This was especially helpful during the Supabase RLS debugging process and while integrating Resend transactional emails.

However, I was careful not to trust AI blindly for core business logic. The audit engine calculations, pricing assumptions, and recommendation rules were all manually validated and adjusted because AI-generated financial reasoning often sounded convincing while being logically weak. I intentionally avoided letting the model fully control optimization recommendations.

There were several moments where the AI was confidently wrong. One specific example happened during the persistence debugging process. An AI-generated suggestion proposed adding more aggressive Supabase policies and backend protection layers to solve guest abuse issues. Implementing that advice actually made the persistence system significantly less stable by creating conflicting anonymous access behavior. I eventually realized the better solution was simplifying the architecture instead of adding more rules.

That experience taught me that AI is most useful when treated as a fast collaborator rather than an authoritative engineer. It accelerated iteration, but final judgment still required careful human reasoning and testing.

---

# 5. Self-rating

## Discipline — 8/10

I maintained consistent progress across multiple days, documented the work carefully, and continued iterating even during frustrating debugging sessions. I could still improve my early planning and time allocation.

## Code Quality — 7/10

The final system is reasonably modular, typed, and production-ready, but there are still areas where the architecture could be cleaner and more scalable if this evolved into a long-term product.

## Design Sense — 8/10

I focused heavily on making the reports visually clean, shareable, and modern. The product feels significantly more polished than a typical assignment submission, especially in the report presentation and UX flow.

## Problem-Solving — 9/10

The project involved several difficult integration and debugging issues across frontend, backend, deployment, and database systems. I was able to systematically isolate and solve them without abandoning core functionality.

## Entrepreneurial Thinking — 8/10

I tried to treat the assignment like a real product instead of a coding exercise. I thought carefully about onboarding flow, lead capture, shareability, product positioning, and why users would actually use or share the tool.