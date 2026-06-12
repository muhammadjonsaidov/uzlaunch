FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY lombok.config .
COPY src ./src
RUN chmod +x gradlew && ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", \
    "-Xmx384m", "-Xms128m", \
    "-XX:+UseContainerSupport", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=150", \
    "-XX:G1HeapRegionSize=2m", \
    "-XX:InitiatingHeapOccupancyPercent=35", \
    "-XX:+UseStringDeduplication", \
    "-Xss256k", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]