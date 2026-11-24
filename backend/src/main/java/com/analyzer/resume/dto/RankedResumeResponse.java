package com.analyzer.resume.dto;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RankedResumeResponse {
    private Long resumeId;
    private String candidateName;
    private String candidateEmail;
    private String fileName;
    private double score;        // 0-100 percentage
    private boolean isBestMatch; // true for the top-ranked candidate
    private List<String> matchedSkills;
    private List<String> missingSkills;
}
