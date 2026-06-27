# Resume Copilot 🚀

Resume Copilot is a **100% free, open-source AI-powered career preparation platform**. It helps job seekers optimize their resumes, match profiles with job descriptions, build cover letters, practice interviews, and generate social media content—all without paywalls or subscriptions.

---

## Key Features ✨

* **ATS Resume Analyzer**: Instantly scans resumes to calculate compatibility scores and highlights formatting, readability, and content improvements.
* **JD Matcher**: Paste a target Job Description to compare keywords and align your resume bullet points.
* **Resume Builder**: Create polished, standard resumes with built-in templates designed to pass applicant tracking systems (ATS).
* **AI Cover Letter Generator**: Generates custom, tailored cover letters in multiple professional tones.
* **LinkedIn Copy Generator**: Builds personalized, engaging posts promoting your career updates.
* **AI Interview Practice**: Interactive mock interview simulations with tailored questions based on your background and target jobs.

---

## Tech Stack 🛠️

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
* **Database client**: [Prisma ORM](https://www.prisma.io/)
* **Database**: [PostgreSQL (Supabase)](https://supabase.com/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://github.com/catdad/canvas-confetti)
* **AI Core Integration**: Multi-key Gemini API rotation with automatic rate-limit fallbacks to OpenAI APIs.

---

## Getting Started 💻

Follow these instructions to run Resume Copilot on your local machine:

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm/yarn installed.

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/yourusername/resume-copilot.git
cd resume-copilot
npm install
```

### 3. Database Setup (Supabase / Postgres)
Create a new PostgreSQL database (e.g. on [Supabase](https://supabase.com/)), and set up your connection strings in the next step.

### 4. Setup Environment Variables
Create a `.env.local` file by copying the template:
```bash
cp .env.example .env.local
```
Fill in the connection strings and API keys in `.env.local`:
* `DATABASE_URL` / `DIRECT_URL`: Supabase Connection settings.
* `JWT_SECRET`: Random secure string (e.g., generated with `openssl rand -base64 32`).
* `GEMINI_API_KEY`: Google Gemini API Key.
* `OPENAI_API_KEY`: (Optional) OpenAI fallback key.

### 5. Run Database Migrations
Initialize your database schemas:
```bash
npx prisma migrate dev
```

### 6. Run Locally
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment 🌐

To deploy the application to hosting providers like [Vercel](https://vercel.com/):
1. Import your GitHub repository to Vercel.
2. In the project settings, configure all keys defined in `.env.example` as environment variables.
3. Make sure to set `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://resumecopilot.in`).
4. Set the **Build Command** to `npm run build` and **Output Directory** to `.next`.

---

## Support & Donate ❤️
Resume Copilot is built and maintained completely for free. If the project helped you optimize your profile or land a job, consider scanning the UPI QR code on the `/donate` page to support the developer!

---

## License 📄
This project is licensed under the MIT License.
