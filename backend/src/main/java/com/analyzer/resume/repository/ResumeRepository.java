package com.analyzer.resume.repository;

import com.analyzer.resume.model.Resume;
import com.analyzer.resume.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserOrderByUploadDateDesc(User user);
}
