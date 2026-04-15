FROM maven:3.9.6-eclipse-temurin-17-alpine as build

WORKDIR /app

RUN mvn dependency:go-offline

COPY . . 

RUN mvn package -DskipTests


FROM eclipse-temurin-17-jdk 

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8002

CMD ["java","-jar","app.jar"]
