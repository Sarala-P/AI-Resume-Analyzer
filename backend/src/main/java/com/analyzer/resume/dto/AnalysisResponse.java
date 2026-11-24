package com.analyzer.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalysisResponse {
    private Long id;
    private Long resumeId;
    private String fileName;
    private LocalDateTime uploadDate;
    private LocalDateTime analysisDate;
    private int score;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private String jobDescription;
}
