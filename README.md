# Blog Platform (Next.js 14)

Starter project scaffolded for a blog platform with:

- Next.js 14 App Router
- Tailwind CSS
- TypeScript + ESLint
- Blog-oriented folders: `components`, `lib`, `models`, and `app/api`
- JWT auth API routes: `POST /api/auth/signup` and `POST /api/auth/login`

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the dev server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Environment variables

Create a `.env.local` file with:

```bash
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-random-secret>
```
