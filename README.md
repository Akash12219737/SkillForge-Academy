# CloudForge Academy — Production LMS

CloudForge Academy is a premium SaaS Learning Management System (LMS) built with React 19, Node.js, Express, and PostgreSQL, designed specifically for Cloud, DevOps, AI/ML, and Web Engineering instruction.

## Technology Infrastructure

### Frontend Client
* **React 19 & TypeScript**: Component-driven SPA with Vite packaging.
* **Tailwind CSS**: Harmonics variables for Dark/Light layouts and responsive viewports.
* **Zustand**: High performance lightweight global session store.
* **React Query (TanStack)**: Fetching synchronization and local caching.
* **Framer Motion**: Micro-interaction transitions and active streak counters.

### Backend Server
* **Node.js & Express.js**: REST API gateway with robust CORS mappings.
* **Prisma ORM & PostgreSQL**: Structured relational mapping with schema migrations.
* **Security & Audits**: Helmet headers, express-rate-limiting, JWT credentials verification, and bcrypt password hashing.

---

## Local Development Startup

### 1. Pre-requisites
Ensure Docker and Node 20+ are installed.

### 2. Quickstart with Docker Compose
The complete multi-container system (PostgreSQL Database, Node backend server, Nginx frontend server) can be compiled and spun up with a single command:

```bash
# Launch containers in build configuration
docker compose up --build
```

Access the platform at:
* **Frontend Web Application**: `http://localhost:5173`
* **Backend API Gateway**: `http://localhost:5000/api`

---

## Direct Native Boot (Local Debugging)

To execute services directly on host terminals:

### 1. Database Setup
1. Spin up a PostgreSQL instance.
2. Configure `.env` in `backend/.env` with your URL:
   `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cloudforge_academy?schema=public"`

### 2. Launch Backend API Server
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed # Pre-populates courses, categories, reviews, and test users
npm run dev
```

### 3. Launch Frontend Client
```bash
cd frontend
npm install
npm run dev
```

---

## Seeding User Accounts

The database seed script creates 3 roles for platform auditing:

| Role | Username | Password | Actions Available |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cloudforge.com` | `admin123` | Role delegation, Payments Ledger auditing, Categories creation |
| **Instructor** | `instructor@cloudforge.com` | `instructor123` | Analytical Sales charts, Section/Lesson wizard creators |
| **Student** | `student@cloudforge.com` | `student123` | 100% course completions, Printable certificates, Lesson Notes sync |

---

## REST API Endpoint Registry

### Auth Gateway
* `POST /api/auth/register` — Create student or instructor profile.
* `POST /api/auth/login` — Sign in and claim JWT.
* `POST /api/auth/google` — Authenticate using mock Google payload credentials.
* `GET /api/auth/profile` — Retrieve current active session statistics.

### Course Catalog
* `GET /api/courses` — Search, filter, and page courses.
* `GET /api/courses/:id` — Fetch detailed syllabus.
* `GET /api/courses/categories` — Get course categories list.

### Student Workspace (JWT Required)
* `POST /api/student/enroll/:courseId` — Simulate course purchase ledger entries.
* `GET /api/student/courses` — Roster of active enrollments with progress bars.
* `GET /api/student/courses/:courseId/content` — Fetch private lesson video URL embeds.
* `POST /api/student/lessons/:lessonId/progress` — Check/Uncheck lesson completed flag (updates overall progress).
* `POST /api/student/notes/:lessonId` — Sync typed note records to database store.
* `GET /api/student/notes/:lessonId` — Load notes for selected lesson.
* `POST /api/student/reviews/:courseId` — Submit stars rating and comments.
* `POST /api/student/certificates/claim/:courseId` — Claim and generate credential verification.

### Instructor Panel (JWT & Instructor Role Required)
* `GET /api/instructor/courses` — List owned courses.
* `POST /api/instructor/courses` — Register new course.
* `POST /api/instructor/courses/:courseId/sections` — Append syllabus section container.
* `POST /api/instructor/sections/:sectionId/lessons` — Bind video lesson.
* `GET /api/instructor/analytics` — Fetch aggregated revenue analytics.

### Admin Cockpit (JWT & Admin Role Required)
* `GET /api/admin/users` — Fetch platform users.
* `PATCH /api/admin/users/:userId/role` — Promote or demote user.
* `GET /api/admin/analytics` — Platform balance ledger and transaction histories auditing.
