package com.analyzer.resume.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_analysis",
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "resume_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false)
    private double score;
}
