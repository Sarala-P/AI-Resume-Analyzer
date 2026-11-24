package com.analyzer.resume.service;

import com.analyzer.resume.exception.BadRequestException;
import com.analyzer.resume.exception.ResourceNotFoundException;
import com.analyzer.resume.model.Resume;
import com.analyzer.resume.model.User;
import com.analyzer.resume.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ParserService parserService;

    public ResumeService(ResumeRepository resumeRepository, ParserService parserService) {
        this.resumeRepository = resumeRepository;
        this.parserService = parserService;
    }

    @Transactional
    public Resume uploadResume(MultipartFile file, User user) {
        // Validation: Verify file is not empty and type is PDF
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            // Also check file extension as content type check can be inconsistent
            String fileName = file.getOriginalFilename();
            if (fileName == null || !fileName.toLowerCase().endsWith(".pdf")) {
                throw new BadRequestException("Only PDF files are allowed");
            }
        }

        try {
            byte[] fileBytes = file.getBytes();
            // Parse using Apache Tika
            String parsedText = parserService.parsePdf(fileBytes);

            Resume resume = Resume.builder()
                    .user(user)
                    .fileName(file.getOriginalFilename())
                    .fileData(fileBytes)
                    .parsedText(parsedText)
                    .build();

            return resumeRepository.save(resume);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file bytes: " + e.getMessage(), e);
        }
    }

    public List<Resume> getResumesForUser(User user) {
        return resumeRepository.findByUserOrderByUploadDateDesc(user);
    }

    public Resume getResumeById(Long id, User user) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You do not have permission to access this resume");
        }

        return resume;
    }

    @Transactional
    public void deleteResume(Long id, User user) {
        Resume resume = getResumeById(id, user);
        resumeRepository.delete(resume);
    }
}
