# ARCHITECTURE.md

# Aethra — System Architecture

## Overview

Aethra is an AI-powered SaaS platform designed to help teams analyze and optimize their AI tooling spend. The application allows users to model their AI stack, generate optimization recommendations, export reports, and share insights publicly.

The system was designed around four primary goals:

1. Fast onboarding with minimal friction
2. Public shareability of optimization reports
3. Reliable persistence and audit history
4. Modern SaaS-grade user experience

---

# High-Level Architecture

```text
┌──────────────────────┐
│      Frontend        │
│   Next.js App Router │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   API Route Layer    │
│  Next.js Server APIs │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      AI Engine       │
│ Anthropic + Ruleset  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Supabase        │
│ Auth + Database +    │
│ Public Report Store  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Email + PDF Services │
│ Resend + Client PDF  │
└──────────────────────┘
```

---

# Frontend Architecture

## Framework

- Next.js 16 (App Router)
- React
- TypeScript
- Tailwind CSS

The frontend follows a component-driven architecture with server-rendered routes where possible and client-side interactivity for dynamic workflows.

---

# Core Frontend Areas

## Landing Page

Purpose:
- explain the product
- establish trust
- drive audit generation

Features:
- responsive SaaS hero section
- animated gradients
- feature sections
- CTA flow into audit experience

Optimizations:
- reduced animation intensity for Lighthouse performance
- optimized client rendering
- lazy-loaded heavier components

---

## Audit Workspace

The audit workspace is the primary product surface.

Responsibilities:
- collect AI stack inputs
- validate form data
- generate optimization requests
- render AI-generated recommendations
- save reports
- trigger exports and sharing

The workflow uses client-side form management combined with server-side AI processing.

---

## Public Report Pages

Public report routes were implemented to support:
- shareable audit URLs
- external viewing
- PDF exports
- email delivery

Security approach:
- reports are retrieved using a controlled RPC function
- direct anonymous table browsing was avoided
- public access is restricted to known report IDs

---

# Backend Architecture

## API Layer

The application uses Next.js Route Handlers for backend functionality.

Primary endpoints:

| Route | Purpose |
|---|---|
| `/api/audit-summary` | Generate AI optimization analysis |
| `/api/save-audit` | Persist audit results |
| `/api/leads` | Send audit emails and store leads |

This architecture keeps deployment simple while avoiding a separate backend server.

---

# AI Recommendation Engine

## Provider

- Anthropic API

The AI engine analyzes:
- selected tools
- seat counts
- pricing assumptions
- usage overlap
- optimization opportunities

The application combines:
- deterministic cost modeling
- AI-generated recommendations

This hybrid approach improves consistency while still allowing intelligent narrative summaries.

---

# Data Layer

## Supabase

Supabase powers:
- authentication
- PostgreSQL database
- report persistence
- dashboard history

---

# Database Design

## profiles

Stores:
- account metadata
- company information
- subscription tier

## audits

Stores:
- audit input JSON
- generated AI results
- timestamps
- optional authenticated ownership

## leads

Stores:
- report email requests
- lightweight lead capture metadata

---

# Security Design

## Row Level Security (RLS)

RLS is enabled across database tables.

Key design decisions:
- users can read only their own dashboards
- public reports are retrieved through a controlled RPC
- guest audit generation remains frictionless

---

## Public Report Retrieval

Instead of exposing unrestricted public table reads, a secure SQL RPC function is used:

```sql
get_public_audit_by_id(uuid)
```

This allows:
- public report access
- controlled query surface
- safer anonymous viewing

---

# Abuse Protection Strategy

The assignment required lightweight abuse prevention.

Final implementation intentionally remained minimal to avoid harming UX.

Implemented protections:
- hidden honeypot field
- lightweight frontend cooldown

Rejected approaches:
- CAPTCHA systems
- aggressive backend blocking
- complex IP tracking

Reasoning:
- preserve onboarding simplicity
- reduce friction
- maintain stable guest flows

---

# Email System

## Provider

- Resend

Capabilities:
- send audit reports
- transactional email delivery
- lead capture integration

The email pipeline:
1. retrieves report data
2. renders React email template
3. sends report link and summary

---

# PDF Export System

The platform supports client-side PDF export for public reports.

Features:
- branded report styling
- optimization summaries
- cost metrics
- embedded charts

Performance optimizations:
- lazy-loaded PDF generation logic
- reduced render-blocking behavior

---

# Performance Engineering

Performance optimization became a major focus during final stabilization.

Key optimizations:
- lazy loading heavy components
- reducing expensive visual effects
- removing debug logs
- production build optimization
- reducing unnecessary client rendering

Final Lighthouse scores achieved:

| Page | Performance |
|---|---|
| Homepage | 88 |
| Audit Page | 85 |
| Public Report | 92 |

Accessibility and Best Practices scored near-perfect values.

---

# Deployment Strategy

The project is structured for deployment on:
- Vercel
- Netlify (partial support)
- other Next.js-compatible platforms

Environment variables used:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
```

Secrets are isolated using `.env.local`.

---

# Architectural Tradeoffs

## Tradeoff 1 — Guest Access vs Strict Security

Decision:
- allow anonymous audits

Reasoning:
- lower onboarding friction
- better product adoption
- aligned with assignment requirements

---

## Tradeoff 2 — Next.js Fullstack vs Separate Backend

Decision:
- use integrated Next.js APIs

Reasoning:
- simpler deployment
- faster iteration
- lower infrastructure complexity

---

## Tradeoff 3 — Lightweight Abuse Prevention

Decision:
- minimal frontend-based protection

Reasoning:
- assignment scope
- avoid harming persistence reliability
- preserve UX simplicity

---

# Future Improvements

Potential future roadmap:

- Stripe billing integration
- organization/team workspaces
- usage analytics dashboard
- historical spend tracking
- AI benchmarking engine
- multi-model recommendation comparison
- enterprise RBAC
- advanced export customization

---

# Final Notes

Aethra was built as a practical SaaS MVP focused on:
- product usability
- rapid onboarding
- public sharing
- strong UX
- realistic engineering tradeoffs

The project intentionally balanced:
- modern frontend experience
- backend simplicity
- production-oriented architecture
- assignment delivery constraints

The final result is a stable AI SaaS platform with:
- persistent reports
- public sharing
- AI-powered recommendations
- export workflows
- transactional email support
- polished responsive UI
- production-ready deployment structure