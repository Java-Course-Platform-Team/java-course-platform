# --- ESTÁGIO 1: BUILD (A Construção) ---

FROM maven:3.9.6-eclipse-temurin-21 AS build

# Define a pasta de trabalho dentro do container
WORKDIR /app

# Copia apenas o arquivo de dependências primeiro
COPY pom.xml .

# Baixa as dependências (sem copiar o código fonte ainda)
RUN mvn dependency:go-offline

# Agora sim, copia o código fonte do seu projeto
COPY src ./src

# Compila o projeto e gera o arquivo .jar
RUN mvn clean package -DskipTests

# --- ESTÁGIO 2: RUN (A Execução) ---

FROM eclipse-temurin:21-jre-alpine

# Define a pasta de trabalho
WORKDIR /app

# Copia APENAS o arquivo .jar gerado no estágio anterior
COPY --from=build /app/target/*.jar app.jar

# Define a porta que o Render espera
EXPOSE 8080

# Comando para iniciar o aplicativo
ENTRYPOINT ["java", "-jar", "app.jar"]