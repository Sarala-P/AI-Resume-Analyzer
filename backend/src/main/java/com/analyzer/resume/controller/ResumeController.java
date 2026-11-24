package com.analyzer.resume.controller;

import com.analyzer.resume.model.Resume;
import com.analyzer.resume.model.User;
import com.analyzer.resume.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        
        Resume resume = resumeService.uploadResume(file, user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", resume.getId());
        response.put("fileName", resume.getFileName());
        response.put("uploadDate", resume.getUploadDate());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getResumes(@AuthenticationPrincipal User user) {
        List<Resume> resumes = resumeService.getResumesForUser(user);
        List<Map<String, Object>> response = resumes.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("fileName", r.getFileName());
            map.put("uploadDate", r.getUploadDate());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getResume(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        
        Resume r = resumeService.getResumeById(id, user);
        
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("fileName", r.getFileName());
        map.put("uploadDate", r.getUploadDate());
        map.put("parsedText", r.getParsedText());
        
        return ResponseEntity.ok(map);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteResume(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        
        resumeService.deleteResume(id, user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Resume deleted successfully");
        return ResponseEntity.ok(response);
    }
}
