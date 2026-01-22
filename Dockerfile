# --- ESTÁGIO 1: BUILD (A Construção) ---
# Usamos uma imagem completa do Maven com Java 17 para compilar
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Define a pasta de trabalho dentro do container
WORKDIR /app

# Copia apenas o arquivo de dependências primeiro (para o Docker fazer cache e ser mais rápido)
COPY pom.xml .

# Baixa as dependências (sem copiar o código fonte ainda)
RUN mvn dependency:go-offline

# Agora sim, copia o código fonte do seu projeto
COPY src ./src

# Compila o projeto e gera o arquivo .jar (pula os testes para ser mais rápido no deploy)
RUN mvn clean package -DskipTests

# --- ESTÁGIO 2: RUN (A Execução) ---
# Usamos uma imagem super leve apenas com o JRE (Java Runtime) para rodar
FROM eclipse-temurin:17-jre-alpine

# Define a pasta de trabalho
WORKDIR /app

# Copia APENAS o arquivo .jar gerado no estágio anterior
# O nome do jar pode variar, o *.jar pega qualquer um que foi gerado
COPY --from=build /app/target/*.jar app.jar

# Define a porta que o Render espera (geralmente a 8080)
EXPOSE 8080

# Comando para iniciar o aplicativo
ENTRYPOINT ["java", "-jar", "app.jar"]