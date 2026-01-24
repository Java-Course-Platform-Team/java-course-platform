# Etapa 1: Build
# Atualizado para Java 21 para ser compatível com o seu pom.xml
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# Compila o projeto e pula os testes para agilizar o deploy
RUN mvn clean package -DskipTests

# Etapa 2: Runtime
# Usando a versão estável do Java 21 para rodar
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
# Copia apenas o arquivo .jar gerado na etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta 8080 (padrão do Render/Spring)
EXPOSE 8080

# Comando para iniciar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]