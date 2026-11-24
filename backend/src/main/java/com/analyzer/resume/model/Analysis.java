package com.analyzer.resume.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Lob
    @Column(name = "job_description", nullable = false, columnDefinition = "LONGTEXT")
    private String jobDescription;

    @Column(nullable = false)
    private int score;

    @Lob
    @Column(name = "matched_skills", columnDefinition = "LONGTEXT")
    private String matchedSkills; // Comma-separated list of skills

    @Lob
    @Column(name = "missing_skills", columnDefinition = "LONGTEXT")
    private String missingSkills; // Comma-separated list of skills

    @Column(name = "analysis_date")
    private LocalDateTime analysisDate;

    @PrePersist
    protected void onCreate() {
        analysisDate = LocalDateTime.now();
    }
}
