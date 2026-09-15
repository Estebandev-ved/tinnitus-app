@echo off
setlocal

set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.12\6068d197
set MVN_CMD=%MAVEN_HOME%\bin\mvn.cmd

if not exist "%MVN_CMD%" (
    set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.15\9925cc1d
    set MVN_CMD=%MAVEN_HOME%\bin\mvn.cmd
)

if not exist "%MVN_CMD%" (
    echo ERROR: Maven not found in wrapper cache. Please install Maven manually.
    exit /b 1
)

set JAVA_HOME_CMD=java
if not "%JAVA_HOME%"=="" set JAVA_HOME_CMD=%JAVA_HOME%\bin\java

call "%MVN_CMD%" %*
goto :eof
