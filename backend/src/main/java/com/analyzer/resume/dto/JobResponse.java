package com.analyzer.resume.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobResponse {
    private Long id;
    private String title;
    private String jobDescription;
    private LocalDateTime createdAt;
    private String recruiterName;
}
