# Stage 1 — build do frontend
FROM node:22-alpine AS frontend-build
WORKDIR /frontend

# Cache das dependências
COPY e-commerce-front/package*.json ./
RUN npm install --silent

# Copia o restante do frontend e gera o build (Vite -> dist)
COPY e-commerce-front/ .
RUN npm run build

# Stage 2 — build do backend (Maven + JDK 21)
FROM maven:3.9.6-eclipse-temurin-21 AS maven-build
WORKDIR /workspace

# Copia todo o projeto (inclui src, pom.xml, e-commerce-front etc.)
# Copiar tudo facilita o build do Maven. Mantemos o build do frontend já gerado acima.
COPY . .

# Copia o dist do frontend gerado no frontend-build para resources/static
# (Spring Boot irá empacotar esses arquivos estáticos no jar)
RUN mkdir -p src/main/resources/static
COPY --from=frontend-build /frontend/dist/ src/main/resources/static/

# Compila o projeto e gera o jar (pula testes para acelerar; remova -DskipTests se quiser rodar testes)
RUN mvn -B -DskipTests package

# Stage 3 — imagem final leve com JRE
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copia o jar gerado (usa wildcard para pegar o jar com versão)
COPY --from=maven-build /workspace/target/e-commerce-0.0.1-SNAPSHOT.jar ./app.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]