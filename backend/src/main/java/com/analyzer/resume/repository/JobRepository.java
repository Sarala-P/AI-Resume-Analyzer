package com.analyzer.resume.repository;

import com.analyzer.resume.model.Job;
import com.analyzer.resume.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByRecruiterOrderByCreatedAtDesc(User recruiter);
}
