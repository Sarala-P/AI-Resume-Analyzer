package com.analyzer.resume.service;

import com.analyzer.resume.dto.JobRequest;
import com.analyzer.resume.dto.JobResponse;
import com.analyzer.resume.dto.RankedResumeResponse;
import com.analyzer.resume.exception.BadRequestException;
import com.analyzer.resume.exception.ResourceNotFoundException;
import com.analyzer.resume.model.Job;
import com.analyzer.resume.model.JobAnalysis;
import com.analyzer.resume.model.Resume;
import com.analyzer.resume.model.User;
import com.analyzer.resume.repository.JobAnalysisRepository;
import com.analyzer.resume.repository.JobRepository;
import com.analyzer.resume.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final JobAnalysisRepository jobAnalysisRepository;
    private final ResumeRepository resumeRepository;
    private final AnalysisService analysisService;

    public JobService(JobRepository jobRepository,
                      JobAnalysisRepository jobAnalysisRepository,
                      ResumeRepository resumeRepository,
                      AnalysisService analysisService) {
        this.jobRepository = jobRepository;
        this.jobAnalysisRepository = jobAnalysisRepository;
        this.resumeRepository = resumeRepository;
        this.analysisService = analysisService;
    }

    // ─── POST /api/jobs ───────────────────────────────────────────────────────
    @Transactional
    public JobResponse createJob(JobRequest request, User recruiter) {
        if (!"RECRUITER".equals(recruiter.getRole())) {
            throw new BadRequestException("Only users with RECRUITER role can post jobs.");
        }

        Job job = Job.builder()
                .recruiter(recruiter)
                .title(request.getTitle())
                .jobDescription(request.getJobDescription())
                .build();

        job = jobRepository.save(job);
        return mapToJobResponse(job);
    }

    // ─── GET /api/jobs  (all jobs by this recruiter) ─────────────────────────
    public List<JobResponse> getMyJobs(User recruiter) {
        return jobRepository.findByRecruiterOrderByCreatedAtDesc(recruiter)
                .stream()
                .map(this::mapToJobResponse)
                .collect(Collectors.toList());
    }

    // ─── GET /api/jobs/{jobId}/ranked-resumes ────────────────────────────────
    @Transactional
    public List<RankedResumeResponse> getRankedResumes(Long jobId, User recruiter) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new BadRequestException("Access denied: this job belongs to another recruiter.");
        }

        // Fetch ALL uploaded resumes in the system
        List<Resume> allResumes = resumeRepository.findAll();

        if (allResumes.isEmpty()) {
            return Collections.emptyList();
        }

        // Extract skills from job description once
        Set<String> jobSkills = analysisService.extractSkills(job.getJobDescription());

        // Score every resume using upsert to prevent unique key collisions
        List<JobAnalysis> rankings = new ArrayList<>();
        Map<Long, List<String>> matchedMap = new HashMap<>();
        Map<Long, List<String>> missingMap = new HashMap<>();

        for (Resume resume : allResumes) {
            String resumeText = resume.getParsedText() != null ? resume.getParsedText() : "";
            Set<String> resumeSkills = analysisService.extractSkills(resumeText);

            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();

            if (!jobSkills.isEmpty()) {
                for (String s : jobSkills) {
                    if (resumeSkills.contains(s)) {
                        matched.add(analysisService.cleanSkillName(s));
                    } else {
                        missing.add(analysisService.cleanSkillName(s));
                    }
                }
            }

            double score = 0.0;
            if (!jobSkills.isEmpty()) {
                score = Math.round(((double) matched.size() / jobSkills.size()) * 100.0);
            }

            matchedMap.put(resume.getId(), matched);
            missingMap.put(resume.getId(), missing);

            JobAnalysis ja = jobAnalysisRepository.findByJobAndResume(job, resume)
                    .orElse(JobAnalysis.builder()
                            .job(job)
                            .resume(resume)
                            .build());

            ja.setScore(score);
            rankings.add(jobAnalysisRepository.save(ja));
        }

        // Sort descending by score
        rankings.sort(Comparator.comparingDouble(JobAnalysis::getScore).reversed());

        // Map to response DTO
        List<RankedResumeResponse> result = new ArrayList<>();
        for (int i = 0; i < rankings.size(); i++) {
            JobAnalysis ja = rankings.get(i);
            Resume resume = ja.getResume();
            User candidate = resume.getUser();

            result.add(RankedResumeResponse.builder()
                    .resumeId(resume.getId())
                    .candidateName(candidate.getName())
                    .candidateEmail(candidate.getEmail())
                    .fileName(resume.getFileName())
                    .score(ja.getScore())
                    .isBestMatch(i == 0) // first item is best match
                    .matchedSkills(matchedMap.getOrDefault(resume.getId(), Collections.emptyList()))
                    .missingSkills(missingMap.getOrDefault(resume.getId(), Collections.emptyList()))
                    .build());
        }

        return result;
    }

    // ─── Helper ───────────────────────────────────────────────────────────────
    private JobResponse mapToJobResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .jobDescription(job.getJobDescription())
                .createdAt(job.getCreatedAt())
                .recruiterName(job.getRecruiter().getName())
                .build();
    }
}
