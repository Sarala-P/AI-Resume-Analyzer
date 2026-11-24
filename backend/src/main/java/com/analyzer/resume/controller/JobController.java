package com.analyzer.resume.controller;

import com.analyzer.resume.dto.JobRequest;
import com.analyzer.resume.dto.JobResponse;
import com.analyzer.resume.dto.RankedResumeResponse;
import com.analyzer.resume.model.User;
import com.analyzer.resume.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // POST /api/jobs  — create a new job posting
    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobService.createJob(request, user));
    }

    // GET /api/jobs  — list recruiter's own jobs
    @GetMapping
    public ResponseEntity<List<JobResponse>> getMyJobs(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobService.getMyJobs(user));
    }

    // GET /api/jobs/{jobId}/ranked-resumes  — rank ALL resumes for a job
    @GetMapping("/{jobId}/ranked-resumes")
    public ResponseEntity<List<RankedResumeResponse>> getRankedResumes(
            @PathVariable Long jobId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobService.getRankedResumes(jobId, user));
    }
}
