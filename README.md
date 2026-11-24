# AI Resume Analyzer (Full Stack + Recruiter Mode)

A complete, production-ready Full Stack Web Application that analyzes PDF resumes against job descriptions using an intelligent NLP-based keyword extraction engine. Includes both **Candidate Mode** (self-assessment and skill gap analysis) and **Recruiter Mode** (posting jobs and automatically ranking all candidate resumes).

---

## 🛠️ Tech Stack

- **Backend:** Java 17/20, Spring Boot 3.3.0, Spring Data JPA, Spring Security 6, JWT, Apache Tika 2.9.2, Maven Wrapper (`mvnw`)
- **Frontend:** React 19, Vite, React Router DOM, Lucide React, Modern CSS Glassmorphic Design System
- **Database:** MySQL 8.0 (`resume_analyzer` database)
- **Authentication:** Stateless JWT Token with BCrypt Password Hashing

---

## 📁 Project Structure

```
AI resume analyzer/
│
├── start-all.bat               # Double-click to start BOTH backend and frontend
├── start-backend.bat           # Starts Spring Boot on port 8080
├── start-frontend.bat          # Starts Vite dev server on port 5173
├── README.md                   # Complete documentation and setup guide
│
├── database/                   # MySQL Database Schemas
│   ├── schema.sql              # Core tables (users, resumes, analysis)
│   └── recruiter_schema.sql    # Recruiter tables (jobs, job_analysis)
│
├── backend/                    # Spring Boot REST API
│   ├── pom.xml                 # Maven dependencies
│   ├── mvnw / mvnw.cmd         # Maven Wrapper (no global maven required)
│   └── src/main/
│       ├── java/com/analyzer/resume/
│       │   ├── controller/     # REST Endpoints (Auth, Resume, Analysis, Job)
│       │   ├── dto/            # Request and Response DTOs
│       │   ├── exception/      # Global Exception Handler & Custom Exceptions
│       │   ├── model/          # JPA Entities (User, Resume, Analysis, Job, JobAnalysis)
│       │   ├── repository/     # Spring Data JPA Repositories
│       │   ├── security/       # JWT Provider, Auth Filter & SecurityConfig
│       │   └── service/        # Business Logic & NLP Engine (Tika Parser, Analysis, Job)
│       └── resources/
│           └── application.properties # Database credentials & JWT config
│
└── frontend/                   # React Single Page Application (Vite)
    ├── package.json            # NPM dependencies
    ├── vite.config.js          # Vite config (binds 0.0.0.0:5173)
    └── src/
        ├── App.jsx             # Route definitions & guards
        ├── index.css           # Premium dark/glassmorphic stylesheet
        ├── components/         # Reusable UI (Navbar, CircularProgress, Route Guards)
        └── pages/              # Views:
            ├── Login.jsx       # Sign In page
            ├── Signup.jsx      # Sign Up page (with Candidate / Recruiter role selector)
            ├── Dashboard.jsx   # Candidate Dashboard (history & summary metrics)
            ├── UploadResume.jsx# PDF drag & drop + Job description input
            ├── Result.jsx      # Match score, skill tags, keyword highlighted view
            ├── RecruiterDashboard.jsx # Post jobs & view previous postings
            └── RecruiterResults.jsx   # Ranked candidates list with "View Details" modal
```

---

## 🚀 Quick Start (One-Click)

1. Ensure **MySQL** is running.
2. Double-click `start-all.bat`.
3. Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🔧 Manual Setup & Running

### 1. Database Setup (MySQL)
The database name is `resume_analyzer`.
Default credentials in `backend/src/main/resources/application.properties`:
- **Username:** `root`
- **Password:** `sarala` (change in `application.properties` if your MySQL password differs)

To initialize or re-create the tables:
```powershell
mysql -u root -p < database/schema.sql
mysql -u root -p < database/recruiter_schema.sql
```

### 2. Run Backend
```cmd
cd backend
set JAVA_HOME=C:\Program Files\Java\jdk-20
mvnw.cmd spring-boot:run
```
Backend will start at: `http://localhost:8080`

### 3. Run Frontend
```cmd
cd frontend
npm install
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`

---

## 👥 How to Use

### 👨‍💼 Recruiter Workflow
1. Go to `http://localhost:5173/signup`.
2. Select the **"Recruiter"** tile and create an account.
3. On the **Recruiter Dashboard**, paste a target Job Description and submit.
4. Click **"Rank Candidates"** to see all candidate resumes ranked by matching score percentage.
5. The top candidate receives the **BEST MATCH** badge. Click **"View Details"** on any candidate to inspect matched and missing skills.

### 👤 Candidate Workflow
1. Go to `http://localhost:5173/signup`.
2. Select the **"Candidate"** tile and create an account.
3. Click **"Analyze Resume"** / **"New Analysis"**.
4. Drag and drop a **PDF resume** (parsed via Apache Tika) and paste any target job description.
5. Review your match percentage, circular progress gauge, list of matched vs. missing skills, and the original job description with color-highlighted keywords.
