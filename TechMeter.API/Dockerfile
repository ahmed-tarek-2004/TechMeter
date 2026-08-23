
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID 
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["TechMeter.API/TechMeter.API.csproj","TechMeter.API/"]
COPY ["TechMeter.Application/TechMeter.Application.csproj","TechMeter.Application/"]
COPY ["TechMeter.Infrastructure/TechMeter.Infrastructure.csproj","TechMeter.Infrastructure/"]
COPY ["TechMeter.Domain/TechMeter.Domain.csproj","TechMeter.Domain/"]
COPY ["Shared/TechMeter.Shared.csproj","Shared/"]

RUN dotnet restore "TechMeter.API/TechMeter.API.csproj"
COPY . .
WORKDIR "/src/TechMeter.API"
RUN dotnet build "TechMeter.API.csproj" -c $BUILD_CONFIGURATION -o /app/build


FROM build as publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./TechMeter.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TechMeter.API.dll"]