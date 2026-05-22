# docker build -t dotnet-api .
# docker run -p 8080:8080 dotnet-api
# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["SQLDropbox/SQLDropbox.csproj", "SQLDropbox/"]
RUN dotnet restore "./SQLDropbox/SQLDropbox.csproj"
COPY . .
WORKDIR "/src/SQLDropbox"
RUN dotnet build "./SQLDropbox.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./SQLDropbox.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY SQLDropbox/Keys/ /app/keys/
ENTRYPOINT ["dotnet", "SQLDropbox.dll"]