# Dockerfile para Spring Boot
FROM openjdk:17-jdk-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de build
COPY build/libs/*.jar app.jar

# Expor porta
EXPOSE 8080

# Variáveis de ambiente
ENV SPRING_PROFILES_ACTIVE=prod

# Comando para executar a aplicação
ENTRYPOINT ["java", "-jar", "/app/app.jar"] 