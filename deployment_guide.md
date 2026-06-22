# CloudForge Academy — Deployment Guide

This guide details the step-by-step commands to push the project code to GitHub, execute the CI/CD pipeline via GitHub Actions, and run the containerized application using Docker.

---

## Step 1: Push Code to GitHub

Follow these terminal commands to initialize git, commit files, and push your repository to GitHub.

### 1. Initialize Local Git Repository
Run this in the root directory (`d:\Downloads\SkillForge Academy`):
```bash
git init
```

### 2. Configure Git Attributes (Optional but Recommended)
Exclude local caches and credentials by creating a `.gitignore` if not present, then add all files to staging:
```bash
# Add files to staging
git add .
```

### 3. Create Initial Commit
```bash
git commit -m "feat: initial release of CloudForge Academy LMS"
```

### 4. Link to GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository (do not add README, `.gitignore`, or license during creation).
2. Copy your repository's URL.
3. Link the remote origin and push the main branch:
```bash
# Set branch to main
git branch -M main

# Link remote origin (Replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# Push code to GitHub
git push -u origin main
```

---

## Step 2: Trigger and Monitor CI/CD

Our repository has a pre-configured GitHub Actions pipeline inside [.github/workflows/ci-cd.yml](file:///.github/workflows/ci-cd.yml).

### 1. Automatic Triggers
The workflow automatically fires when you push code or submit a Pull Request to the `main` or `master` branches:
```bash
# To trigger CI/CD after code edits, simply commit and push:
git add .
git commit -m "fix: updated configuration parameters"
git push origin main
```

### 2. Manual Trigger / Monitoring Steps
1. Navigate to your repository URL on GitHub (e.g. `https://github.com/your-username/your-repo`).
2. Click on the **Actions** tab at the top.
3. You will see a list of workflows. Select **CloudForge Academy CI/CD Pipeline**.
4. Click on the active workflow run to watch logs for:
   * **Backend Validation**: Generates the Prisma client and compiles the TypeScript code.
   * **Frontend Build**: Installs node modules and validates Vite build assets compilation.
   * **Docker validation**: Inspects docker-compose configuration syntax parameters.

---

## Step 3: Run Containerized Platform with Docker

Once the code builds cleanly, you can orchestrate the database, backend server, and Nginx frontend client locally inside Docker containers.

### 1. Start Services
Build and start all services in the background using Docker Compose:
```bash
# Build images and start containers
docker compose up --build -d
```
*(Remove `-d` if you want to watch the logs output in real-time in the current console).*

### 2. Verify Running Containers
Check that all containers (`cloudforge-db`, `cloudforge-backend`, `cloudforge-frontend`) are healthy and running:
```bash
docker ps
```

### 3. Review Log Files
Stream live logs for debugging:
```bash
# Read logs for all services
docker compose logs -f

# Read logs for backend only
docker compose logs backend -f
```

### 4. Stop Services
Stop all containers and free port mappings without losing PostgreSQL persistent volume data:
```bash
docker compose down
```

### 5. Reset Databases (Optional)
If you want to clear your local database and volume cache to run a clean seed:
```bash
docker compose down -v
```
