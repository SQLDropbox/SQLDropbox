using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SQLDropbox.Data;
using SQLDropbox.Repositories;
using SQLDropbox.Services;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy

            .WithOrigins(
                builder.Configuration["AllowedOrigins"]
                    ?.Split(",", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    ?? []
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add services to the container
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<SolutionService>();
builder.Services.AddScoped<RandomExerciseSelectorService>();
builder.Services.AddScoped<SchemaService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<SchemaService>();
builder.Services.AddScoped<SqlQueryService>();
builder.Services.AddScoped<CsvExportService>();
builder.Services.AddScoped<RoutineService>();
builder.Services.AddScoped<CsvService>();
builder.Services.AddScoped<RefreshTokenService>();

// Add controllers to the container
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// SWAGGER
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("bearer", document)] = []
    });
});

// POSTGRES
// create migration ==> dotnet ef migrations add Init
// update db with migration ==> dotnet ef database update
// if EF not installed ==> dotnet tool install dotnet-ef
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// JWT
var publicKeyPem = File.ReadAllText(builder.Configuration["Jwt:PublicKeyPath"])
    ?? throw new Exception("Jwt:PublicKeyPath is missing");
var rsa = RSA.Create();
rsa.ImportFromPem(publicKeyPem);

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new RsaSecurityKey(rsa),

            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// CORS
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    // SWAGGER
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();

    // DB MIGRATION
    AsyncServiceScope scope = app.Services.CreateAsyncScope();
    AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

if (app.Environment.IsProduction())
{
    // DB MIGRATION
    AsyncServiceScope scope = app.Services.CreateAsyncScope();
    AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Delete the passwordservice
    PasswordService pass = scope.ServiceProvider.GetRequiredService<PasswordService>();

    // Delete the delete
    await db.Database.EnsureDeletedAsync();

    // Keep the migration
    await db.Database.MigrateAsync();

    // Delete the seed
    await DbInitializer.SeedAsync(db, pass);
}

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsProduction())
{
    app.UsePathBase("/api");
}

app.Run();
