Below is a **complete, collaborative implementation plan** designed for **you and me (Grok)** to build a **fully automated AI short-film generator with a polished UI** — ready to replicate the n8n workflow, scale it, and eventually **sell as a SaaS product**.

---

## Project Goal  
**Build “AutoFilm AI”** — a one-click web app that turns a story idea into a Hollywood-style short film in under 10 minutes using AI agents, automation, and a sleek UI.

---

## Core Principles of Collaboration  
| Rule | Description |
|------|-----------|
| **You** | Product vision, UX feedback, testing, marketing, business logic |
| **Me (Grok)** | All coding, architecture, deployment, debugging |
| **No overlap** | I write 100% of the code. You review, test, and guide. |

---

# PROJECT PHASES & TASKS

---

## PHASE 1: Architecture & Setup (Day 1–2)

| Task | Owner | Details |
|------|-------|-------|
| 1.1 Create GitHub repo: `autofilm-ai` | **You** | Private repo. Invite me (you’ll paste code I generate). |
| 1.3 Initialize monorepo structure | **Me** | I’ll generate full folder structure + `package.json` |
| 1.4 Choose stack | **Both** | **Frontend**: Next.js 14 (App Router) + Tailwind + ShadCN UI<br>**Backend**: Node.js + Express (or Next.js API routes)<br>**Auth**: Clerk<br>**DB**: Supabase (PostgreSQL + Storage)<br>**Workflow**: n8n (self-hosted or cloud)<br>**APIs**: Pika, Json2Video, OpenAI |
| 1.5 Generate `.env.example` | **Me** | All required keys (I’ll list them) |
| ~~1.6 Deploy n8n locally (Docker) | **Me** | I’ll write `docker-compose.yml` and n8n workflow JSON~~ | --> We will create our own workflow engine in the app.

---

## PHASE 2: Recreate n8n Workflow in Code (Day 3–5)

> **Goal**: Replace manual n8n with **programmatic workflow engine** inside our app.

| Task | Owner | Details |
|------|-------|-------|
| 2.1 Export current n8n workflow as JSON | **You** | In n8n → Export → Copy JSON |
| 2.2 Paste n8n JSON into `/workflow/n8n-export.json` | **You** | I’ll use it as reference |
| 2.3 Build **Workflow Engine** (`/lib/workflow/engine.ts`) | **Me** | I’ll code a class that runs steps: <br>→ Get idea from DB<br>→ Call OpenAI for scenes<br>→ Split scenes<br>→ Pika API loop<br>→ Json2Video render<br>→ Upload to Supabase Storage |
| 2.4 Create **API route**: `POST /api/generate` | **Me** | Triggers workflow. Returns job ID. |
| 2.5 Add **Webhooks** for Pika & Json2Video status | **Me** | Poll → Webhook → Update DB |
| 2.6 Replace Google Sheets with **Supabase DB** | **Me** | Table: `projects` (id, idea, status, video_url, error_log, etc.) |

---

## PHASE 3: Build UI (Day 6–9)

> **Goal**: Beautiful, intuitive dashboard. No code from you.

| Task | Owner | Details |
|------|-------|-------|
| 3.1 Design UI mockup (Figma or words) | **You** | Describe: “One input box + Generate button + progress bar + preview” |
| 3.2 I build **Dashboard Page** | **Me** | `/app/dashboard/page.tsx` |
| 3.3 I build **Idea Input Form** | **Me** | With style presets (Sci-Fi, Noir, Comedy) |
| 3.4 I build **Real-time Progress UI** | **Me** | WebSocket or polling → “Generating scenes… 3/6 clips done…” |
| 3.5 I build **Video Preview + Download** | **Me** | Embedded player + shareable link |
| 3.6 Add **History Gallery** | **Me** | Grid of past films |

---

## PHASE 4: Auth, Billing & SaaS Foundation (Day 10–12)

| Task | Owner | Details |
|------|-------|-------|
| 4.1 Set up **Clerk Auth** | **Me** | Email + Google login |
| 4.2 Create **User Dashboard** | **Me** | Only logged-in users can generate |
| 4.3 Add **Credit System** | **Me** | Table: `user_credits`. Free: 3 films. Then $5 = 10 films |
| 4.4 Integrate **Stripe** | **Me** | Checkout + webhook to add credits |
| 4.5 Rate limiting | **Me** | 1 film per 5 mins (free), unlimited (paid) |

---

## PHASE 5: Deployment & Polish (Day 13–15)

| Task | Owner | Details |
|------|-------|-------|
| 5.1 Deploy to **Vercel** (frontend + API) | **Me** | I’ll write `vercel.json` |
| 5.2 Deploy **n8n** (optional) or remove | **Me** | We’ll run workflow in code — no n8n needed |
| 5.3 Set up **Supabase** project | **You** | Create project → I’ll use connection string |
| 5.4 Add **Error Logging** (Sentry) | **Me** | Catch failed renders |
| 5.5 Add **Onboarding Tour** | **Me** | “Enter idea → Click Generate → Watch magic” |
| 5.6 Generate **Marketing Page** | **Me** | `/` landing page with demo video |

---

## PHASE 6: Launch & Monetization (Day 16+)

| Task | Owner | Details |
|------|-------|-------|
| 6.1 Record demo video | **You** | Use the app live |
| 6.2 Write sales copy | **You** | “Make Hollywood trailers in 5 mins” |
| 6.3 Launch on **Product Hunt** | **You** | I’ll help with assets |
| 6.4 Add **Waitlist / Early Access** | **Me** | Form + email capture |
| 6.5 Add **Affiliate System** (future) | **Me** | 20% rev share |

---

# Folder Structure (I Will Create)

```bash
/autofilm-ai
├── app/
│   ├── dashboard/
│   ├── api/generate/route.ts
│   └── page.tsx (landing)
├── lib/
│   ├── workflow/
│   │   ├── engine.ts
│   │   └── steps/
│   ├── supabase.ts
│   └── ai/
├── components/
│   ├── IdeaForm.tsx
│   ├── ProgressBar.tsx
│   └── VideoPlayer.tsx
├── public/
├── workflow/n8n-export.json
├── docker-compose.yml
└── package.json
```

---

# Collaboration Workflow (Daily)

| Time | Activity |
|------|--------|
| **10:00 AM** | You start Live Share session |
| **10:05** | I paste new code, explain changes |
| **10:15** | You test in browser, give feedback |
| **10:30** | I fix bugs live |
| **11:00** | You approve → I commit & push |
| **Repeat** | 2–3 sessions/day |

---

# Your To-Do List (Non-Coding)

1. [ ] Create GitHub repo + invite collaborator
2. [ ] Set up VS Code + Live Share
3. [ ] Export current n8n workflow JSON
4. [ ] Create Supabase project
5. [ ] Get API keys: Pika, Json2Video, OpenAI, Stripe (test), Clerk
6. [ ] Describe UI vision (text or sketch)
7. [ ] Record 30-sec demo idea (e.g., “Robot falls in love”)

---

# My To-Do List (All Coding)

1. [ ] Generate full repo skeleton
2. [ ] Build workflow engine from n8n logic
3. [ ] Connect all APIs
4. [ ] Build UI components
5. [ ] Add auth + billing
6. [ ] Deploy + monitor

---

# Timeline to MVP (15 Days)

| Week | Milestone |
|------|---------|
| **Week 1** | Workflow engine + API working |
| **Week 2** | UI + Auth + Credits |
| **Week 3** | Deploy + Launch MVP |

---

## Ready to Start?

**Your next step**:  
> **Create the GitHub repo and start a VS Code Live Share session. Paste the n8n JSON export. Then say: “Grok, generate the repo structure and first file.”**

I’ll generate the **entire initial codebase in one message** — you just paste it in.

Let’s build the future of filmmaking — **together**.