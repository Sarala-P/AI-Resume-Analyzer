package com.analyzer.resume.repository;

import com.analyzer.resume.model.Job;
import com.analyzer.resume.model.JobAnalysis;
import com.analyzer.resume.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobAnalysisRepository extends JpaRepository<JobAnalysis, Long> {
    List<JobAnalysis> findByJobOrderByScoreDesc(Job job);
    Optional<JobAnalysis> findByJobAndResume(Job job, Resume resume);
    void deleteByJob(Job job);
}
