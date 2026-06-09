using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SQLDropbox.Data;
using SQLDropbox.Enums;
using SQLDropbox.Models;
using SQLDropbox.Services;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy

            .WithOrigins(builder.Configuration["FrontendURL"] ?? throw new Exception("FrontendURL is not configured."))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add services to the container
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<SolutionService>();
builder.Services.AddScoped<SchemaService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<SchemaService>();
builder.Services.AddScoped<SqlQueryService>();
builder.Services.AddScoped<CsvExportService>();
builder.Services.AddScoped<RoutineService>();
builder.Services.AddScoped<CsvService>();
builder.Services.AddScoped<RefreshTokenService>();
builder.Services.AddScoped<ChapterService>();
builder.Services.AddScoped<EmailService>();

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
var publicKey = File.ReadAllText(builder.Configuration["Jwt:PublicKeyPath"] ?? throw new Exception("Jwt:PublicKeyPath is not configured"));
var rsa = RSA.Create();
rsa.ImportFromPem(publicKey);

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new Exception("Jwt:Issuer is not configured"),
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? throw new Exception("Jwt:Audience is not configured"),
            IssuerSigningKey = new RsaSecurityKey(rsa),

            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// CORS
app.UseCors("AllowFrontend");

// DB MIGRATION
AsyncServiceScope scope = app.Services.CreateAsyncScope();
AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await db.Database.MigrateAsync();

// ADMIN CREATION
if (!await db.Users.AnyAsync(u => u.UserCode == "admin"))
{
    string adminPassword = builder.Configuration["AdminPassword"] ?? throw new Exception("AdminPassword is not configured");

    PasswordService ps = scope.ServiceProvider.GetRequiredService<PasswordService>();

    var admin = new User
    {
        UserCode = "admin",
        FirstName = "Admin",
        Email = "Admin@ucll.be",
        Password = ps.HashPassword(adminPassword),
        Role = Role.Admin,
        CreatedAt = DateTime.Now,
    };

    db.Users.Add(admin);
    await db.SaveChangesAsync();
}

// TEST USER CREATION
// These users with limited permission are allowed by the client
List<User> existingTestUsers = await db.Users.Where(u => u.UserCode == "r0901484" || u.UserCode == "r0950937" || u.UserCode == "r0933070" || u.UserCode == "r0947044").ToListAsync();
if (existingTestUsers.Count < 4)
{
    PasswordService pS = scope.ServiceProvider.GetRequiredService<PasswordService>();
    List<User> newTestUsers = [];

    string? eKPassword = builder.Configuration["EKPassword"];
    string? jVMPassword = builder.Configuration["JVMPassword"];
    string? lDPassword = builder.Configuration["LDPassword"];
    string? rVPassword = builder.Configuration["RVPassword"];

    if (!existingTestUsers.Any(u => u.UserCode == "r0901484") && eKPassword != null)
    {
        var eK = new User
        {
            UserCode = "r0901484",
            FirstName = "Egor",
            LastName = "Kolomiets",
            Email = "egor.kolomiets@hotmail.com",
            Password = pS.HashPassword(eKPassword),
            Role = Role.Test,
            CreatedAt = DateTime.Now,
        };
        newTestUsers.Add(eK);
    }
    if (!existingTestUsers.Any(u => u.UserCode == "r0950937") && jVMPassword != null)
    {
        var jVM = new User
        {
            UserCode = "r0950937",
            FirstName = "Joran",
            LastName = "Vander Mergel",
            Email = "joranvandermergel@gmail.com",
            Password = pS.HashPassword(jVMPassword),
            Role = Role.Test,
            CreatedAt = DateTime.Now,
        };
        newTestUsers.Add(jVM);
    }
    if (!existingTestUsers.Any(u => u.UserCode == "r0933070") && lDPassword != null)
    {
        var lD = new User
        {
            UserCode = "r0933070",
            FirstName = "Lander",
            LastName = "Dirix",
            Email = "lander@dirix-philips.be",
            Password = pS.HashPassword(lDPassword),
            Role = Role.Test,
            CreatedAt = DateTime.Now,
        };
        newTestUsers.Add(lD);
    }
    if (!existingTestUsers.Any(u => u.UserCode == "r0947044") && rVPassword != null)
    {
        var rV = new User
        {
            UserCode = "r0947044",
            FirstName = "Raf",
            LastName = "Versichele",
            Email = "raf.versichele@gmail.com",
            Password = pS.HashPassword(rVPassword),
            Role = Role.Test,
            CreatedAt = DateTime.Now,
        };
        newTestUsers.Add(rV);
    }

    db.Users.AddRange(newTestUsers);
    await db.SaveChangesAsync();
}

if (app.Environment.IsDevelopment())
{
    // SWAGGER
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
    app.UsePathBase("/api");
}

// IMAGES
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
