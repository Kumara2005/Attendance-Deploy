# =========================
# Stage 1: Build (Maven)
# =========================
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy all backend files
COPY . .

# Build the Spring Boot JAR (skip tests for faster build)
RUN mvn clean package -DskipTests

# =========================
# Stage 2: Runtime (Java)
# =========================
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose application port
EXPOSE 8080

# Start Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
