package com.analyzer.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardSummary {
    private long totalResumes;
    private double averageScore;
    private int bestMatchScore;
    private List<AnalysisResponse> recentAnalyses;
}
