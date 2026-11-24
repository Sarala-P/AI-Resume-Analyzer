package com.analyzer.resume.repository;

import com.analyzer.resume.model.Analysis;
import com.analyzer.resume.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    List<Analysis> findByResumeUserOrderByAnalysisDateDesc(User user);
}
