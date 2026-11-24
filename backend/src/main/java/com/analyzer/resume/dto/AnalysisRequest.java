package com.analyzer.resume.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnalysisRequest {

    @NotNull(message = "Resume ID is required")
    private Long resumeId;

    @NotBlank(message = "Job description is required")
    private String jobDescription;
}
