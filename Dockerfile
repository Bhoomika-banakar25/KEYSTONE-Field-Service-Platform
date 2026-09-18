FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Clone code from GitHub repository
# Replace with your actual GitHub repo URL
ARG GITHUB_REPO=https://github.com/YourUsername/ManageByHR.git
ARG BRANCH=master

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN git clone --branch ${BRANCH} ${GITHUB_REPO} .

# Build application
RUN mvn clean package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Copy built JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
