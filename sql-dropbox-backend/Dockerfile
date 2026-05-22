# docker build -t dotnet-api .
# docker run -p 8080:8080 dotnet-api

# =========================
# Build stage
# =========================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["SQLDropbox/SQLDropbox.csproj", "SQLDropbox/"]
RUN dotnet restore "SQLDropbox/SQLDropbox.csproj"

COPY . .
WORKDIR /src/SQLDropbox

RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false --no-restore

# =========================
# Runtime stage
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "SQLDropbox.dll"]