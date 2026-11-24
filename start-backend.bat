@echo off
title AI Resume Analyzer - Backend
echo ========================================================
echo  Starting AI Resume Analyzer Backend (Spring Boot 3)
echo ========================================================
cd /d "%~dp0backend"
set JAVA_HOME=C:\Program Files\Java\jdk-20
echo Using JAVA_HOME: %JAVA_HOME%
mvnw.cmd spring-boot:run
pause
