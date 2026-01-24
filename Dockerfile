# Etapa 1: Build
# Usando Maven com Java 17 para compilar o projeto
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
# Compila o projeto e pula os testes para agilizar o deploy
RUN mvn clean package -DskipTests

# Etapa 2: Runtime
# Usando uma imagem leve do Java 17 para rodar
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Copia apenas o arquivo .jar gerado na etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta 8080 (padrão do Render/Spring)
EXPOSE 8080

# Comando para iniciar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]