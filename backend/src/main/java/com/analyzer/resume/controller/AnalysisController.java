package com.analyzer.resume.controller;

import com.analyzer.resume.dto.AnalysisRequest;
import com.analyzer.resume.dto.AnalysisResponse;
import com.analyzer.resume.dto.DashboardSummary;
import com.analyzer.resume.model.User;
import com.analyzer.resume.service.AnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/run")
    public ResponseEntity<AnalysisResponse> runAnalysis(
            @Valid @RequestBody AnalysisRequest request,
            @AuthenticationPrincipal User user) {
        
        AnalysisResponse response = analysisService.analyze(request.getResumeId(), request.getJobDescription(), user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<AnalysisResponse>> getHistory(@AuthenticationPrincipal User user) {
        List<AnalysisResponse> history = analysisService.getAnalysisHistory(user);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummary> getDashboard(@AuthenticationPrincipal User user) {
        DashboardSummary summary = analysisService.getDashboardSummary(user);
        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAnalysis(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        
        analysisService.deleteAnalysis(id, user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Analysis deleted successfully");
        return ResponseEntity.ok(response);
    }
}
