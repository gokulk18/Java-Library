FROM node:18-eclipse-temurin-17-alpine as build

WORKDIR /app

COPY pom.xml

RUN mvn dependency:go-offline

COPY . .

RUN mvn package -Dskiptests


FROM eclipse-temurin-17-jdk 

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8003

CMD ["java","-jar","app.jar"]

