# ==========================================
# ENTERPRISE BACKEND MULTI-STAGE DOCKERFILE
# ==========================================

# --- STAGE 1: Maven Builder ---
FROM maven:3.9.15-eclipse-temurin-26-alpine AS builder
WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# --- STAGE 2: Production JRE Runtime ---
FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app

# Non-root security user context
RUN addgroup --system --gid 10001 spring && \
    adduser --system --uid 10001 --ingroup spring spring && \
    apk add --no-cache curl

COPY --from=builder --chown=spring:spring /build/target/analysis-1.0.0-SNAPSHOT.jar app.jar

USER spring

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
