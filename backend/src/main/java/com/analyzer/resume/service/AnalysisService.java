package com.analyzer.resume.service;

import com.analyzer.resume.dto.AnalysisResponse;
import com.analyzer.resume.dto.DashboardSummary;
import com.analyzer.resume.exception.ResourceNotFoundException;
import com.analyzer.resume.model.Analysis;
import com.analyzer.resume.model.Resume;
import com.analyzer.resume.model.User;
import com.analyzer.resume.repository.AnalysisRepository;
import com.analyzer.resume.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AnalysisService {

    private final AnalysisRepository analysisRepository;
    private final ResumeRepository resumeRepository;

    // A comprehensive set of common software engineering / IT keywords
    private static final Set<String> SKILLS_DICTIONARY = Stream.of(
            "java", "python", "c\\+\\+", "c#", "javascript", "typescript", "php", "ruby", "go", "golang", "rust", "kotlin", "swift", "scala", "clojure",
            "spring", "spring boot", "django", "flask", "express", "node\\.js", "node", "nest\\.js", "laravel", "ruby on rails", "rails", "asp\\.net", "\\.net",
            "react", "angular", "vue\\.js", "vue", "next\\.js", "nuxt\\.js", "svelte", "jquery", "bootstrap", "tailwind", "html", "css", "sass", "less",
            "mysql", "postgresql", "oracle", "sql server", "sqlite", "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb", "mariadb", "neo4j",
            "hibernate", "jpa", "mybatis", "prisma", "sequelize", "mongoose",
            "git", "github", "gitlab", "docker", "kubernetes", "aws", "azure", "gcp", "google cloud", "devops", "ci/cd", "jenkins", "terraform", "ansible",
            "rest", "rest api", "restful", "graphql", "grpc", "soap", "websocket",
            "microservices", "agile", "scrum", "jira", "maven", "gradle", "linux", "bash", "shell", "powershell",
            "machine learning", "deep learning", "nlp", "ai", "data science", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
            "junit", "mockito", "selenium", "jest", "cypress", "security", "jwt", "oauth", "auth0", "docker-compose"
    ).collect(Collectors.toSet());

    private static final Set<String> STOPWORDS = Stream.of(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
            "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
            "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
            "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd",
            "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
            "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
            "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
            "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
            "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
            "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through",
            "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't",
            "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
            "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
    ).collect(Collectors.toSet());

    public AnalysisService(AnalysisRepository analysisRepository, ResumeRepository resumeRepository) {
        this.analysisRepository = analysisRepository;
        this.resumeRepository = resumeRepository;
    }

    @Transactional
    public AnalysisResponse analyze(Long resumeId, String jobDescription, User user) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You do not have permission to access this resume");
        }

        String resumeText = resume.getParsedText();
        if (resumeText == null || resumeText.trim().isEmpty()) {
            resumeText = "";
        }

        // NLP Preprocessing & Keyword Extraction
        Set<String> jobSkills = extractSkills(jobDescription);
        Set<String> resumeSkills = extractSkills(resumeText);

        List<String> matchedSkillsList = new ArrayList<>();
        List<String> missingSkillsList = new ArrayList<>();
        int score = 0;

        if (!jobSkills.isEmpty()) {
            for (String skill : jobSkills) {
                if (resumeSkills.contains(skill)) {
                    matchedSkillsList.add(skill);
                } else {
                    missingSkillsList.add(skill);
                }
            }
            score = (int) Math.round(((double) matchedSkillsList.size() / jobSkills.size()) * 100);
        } else {
            // If no skills detected in job description, matching is 0
            score = 0;
        }

        // Map list elements to clean readable representations (unescape regex backslashes)
        List<String> cleanMatched = matchedSkillsList.stream().map(this::cleanSkillName).collect(Collectors.toList());
        List<String> cleanMissing = missingSkillsList.stream().map(this::cleanSkillName).collect(Collectors.toList());

        Analysis analysis = Analysis.builder()
                .resume(resume)
                .jobDescription(jobDescription)
                .score(score)
                .matchedSkills(String.join(",", cleanMatched))
                .missingSkills(String.join(",", cleanMissing))
                .build();

        analysis = analysisRepository.save(analysis);

        return mapToResponse(analysis);
    }

    public List<AnalysisResponse> getAnalysisHistory(User user) {
        return analysisRepository.findByResumeUserOrderByAnalysisDateDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DashboardSummary getDashboardSummary(User user) {
        List<Analysis> analyses = analysisRepository.findByResumeUserOrderByAnalysisDateDesc(user);
        List<Resume> resumes = resumeRepository.findByUserOrderByUploadDateDesc(user);

        long totalResumes = resumes.size();
        double averageScore = 0.0;
        int bestMatchScore = 0;

        if (!analyses.isEmpty()) {
            averageScore = analyses.stream()
                    .mapToInt(Analysis::getScore)
                    .average()
                    .orElse(0.0);
            
            bestMatchScore = analyses.stream()
                    .mapToInt(Analysis::getScore)
                    .max()
                    .orElse(0);
        }

        List<AnalysisResponse> recentAnalyses = analyses.stream()
                .limit(5)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return DashboardSummary.builder()
                .totalResumes(totalResumes)
                .averageScore(Math.round(averageScore * 10.0) / 10.0) // 1 decimal place
                .bestMatchScore(bestMatchScore)
                .recentAnalyses(recentAnalyses)
                .build();
    }

    @Transactional
    public void deleteAnalysis(Long analysisId, User user) {
        Analysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found"));
        
        if (!analysis.getResume().getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You do not have permission to delete this analysis");
        }
        
        analysisRepository.delete(analysis);
    }

    // Package-accessible: reused by JobService for recruiter ranking
    Set<String> extractSkills(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Collections.emptySet();
        }

        String lowerText = text.toLowerCase();
        Set<String> foundSkills = new HashSet<>();

        // Stopword removal and cleaning for general text tokenization
        // (Though for skill matching, we search for dictionary terms using boundary-aware regex)
        for (String skillPattern : SKILLS_DICTIONARY) {
            // Construct a pattern matching the skill with boundary awareness
            String regex = getBoundaryRegexForSkill(skillPattern);
            Pattern pattern = Pattern.compile(regex);
            if (pattern.matcher(lowerText).find()) {
                foundSkills.add(skillPattern);
            }
        }

        return foundSkills;
    }

    private String getBoundaryRegexForSkill(String skill) {
        // If skill contains regex characters (like C++, C#, .NET), boundary matching is customized
        String base = skill;
        String prefix = Character.isLetterOrDigit(base.charAt(0)) ? "\\b" : "";
        String suffix = Character.isLetterOrDigit(base.charAt(base.length() - 1)) ? "\\b" : "";

        // Specific adjustments for terms ending with '+' or '#' which are non-word characters
        if (base.endsWith("c\\+\\+")) {
            suffix = "(?!\\+)"; // Ensure it's not followed by another plus
        }

        return prefix + base + suffix;
    }

    // Package-accessible: reused by JobService
    String cleanSkillName(String skill) {
        // Convert regex patterns back to human-readable names (e.g. node\.js -> node.js, c\+\+ -> c++)
        return skill.replace("\\.", ".").replace("\\+", "+");
    }

    private AnalysisResponse mapToResponse(Analysis analysis) {
        List<String> matched = Arrays.asList(analysis.getMatchedSkills().split(","));
        List<String> missing = Arrays.asList(analysis.getMissingSkills().split(","));

        // Clean empty elements caused by splitting empty strings
        if (matched.size() == 1 && matched.get(0).isEmpty()) matched = Collections.emptyList();
        if (missing.size() == 1 && missing.get(0).isEmpty()) missing = Collections.emptyList();

        return AnalysisResponse.builder()
                .id(analysis.getId())
                .resumeId(analysis.getResume().getId())
                .fileName(analysis.getResume().getFileName())
                .uploadDate(analysis.getResume().getUploadDate())
                .analysisDate(analysis.getAnalysisDate())
                .score(analysis.getScore())
                .matchedSkills(matched)
                .missingSkills(missing)
                .jobDescription(analysis.getJobDescription())
                .build();
    }
}
