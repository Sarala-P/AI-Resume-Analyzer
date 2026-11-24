USE resume_analyzer;

-- ─────────────────────────────────────────────
-- 1. Ensure the 'role' column exists on users
-- ─────────────────────────────────────────────
ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';

-- ─────────────────────────────────────────────
-- 2. Jobs table  (recruiter posts a JD here)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id  BIGINT       NOT NULL,
    title         VARCHAR(255) NOT NULL DEFAULT 'Untitled Position',
    job_description LONGTEXT   NOT NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- 3. Job-Analysis table  (ranked results cache)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_analysis (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id     BIGINT NOT NULL,
    resume_id  BIGINT NOT NULL,
    score      DOUBLE NOT NULL DEFAULT 0,
    FOREIGN KEY (job_id)    REFERENCES jobs(id)    ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_resume (job_id, resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
