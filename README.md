# AutoFilm AI

Turn any story idea into a Hollywood-style short film in under 10 minutes using AI.

## 🚀 Features

- **One-Click Film Generation**: Enter a story idea and get a complete short film
- **AI-Powered Workflow**: Uses OpenAI, Pika Labs, and Json2Video APIs
- **User Authentication**: Secure login with Clerk
- **Progress Tracking**: Real-time updates on film generation status
- **Video Storage**: Store and share films with Supabase Storage
- **Credit System**: Built-in monetization ready

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **APIs**: OpenAI, Pika Labs, Json2Video, Stripe
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- Git
- Supabase account
- Clerk account (for authentication)
- API keys for all services

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/autofilm-ai.git
   cd autofilm-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in all the required API keys in `.env.local`

4. **Set up Supabase**
   ```bash
   # Initialize Supabase (if not already done)
   npx supabase init

   # Start local Supabase
   npx supabase start

   # Push database schema
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Pika Labs (video generation)
PIKA_API_KEY=your-pika-api-key

# Json2Video (video editing)
JSON2VIDEO_API_KEY=your-json2video-api-key

# Stripe (payments)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Database Schema

The app uses two main tables:

- `projects`: Stores film generation projects
- `user_credits`: Manages user credits for film generation

Run the migration to set up the database:

```bash
npm run db:push
```

## 🎯 API Endpoints

- `POST /api/generate`: Start film generation
- All other routes are handled by Next.js App Router

## 🔄 Workflow Engine

The core workflow runs these steps:

1. **Generate Scenes**: OpenAI creates 3-scene script from user idea
2. **Generate Videos**: Pika API creates individual scene videos
3. **Combine Videos**: Json2Video combines scenes into final film
4. **Upload & Store**: Final video uploaded to Supabase Storage

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repo to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy!

### Supabase Setup

1. Create a new Supabase project
2. Run the migration: `supabase db push`
3. Configure storage buckets for video uploads
4. Set up authentication providers

## 📝 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run db:push`: Push database changes
- `npm run db:reset`: Reset database

### Project Structure

```
autofilm-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── IdeaForm.tsx      # Film idea input form
│   └── FilmGallery.tsx   # Film display gallery
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── utils.ts          # Helper functions
│   └── workflow/         # Workflow engine
├── types/                # TypeScript types
└── supabase/             # Database migrations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. Check the console for errors
2. Verify all environment variables are set
3. Ensure Supabase is running locally
4. Check API rate limits and keys

## 🎬 Demo

Visit the live demo at [your-domain.com](https://your-domain.com)

---

Built with ❤️ for filmmakers and storytellers everywhere.
