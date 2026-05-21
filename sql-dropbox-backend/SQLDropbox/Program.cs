using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SQLDropbox.Data;
using SQLDropbox.Services;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("localhostFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Add services to the container
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<PostgreSQLQueryValidator>();
builder.Services.AddScoped<RandomExerciseSelectorService>();
builder.Services.AddScoped<SchemaService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<SchemaService>();
builder.Services.AddScoped<SqlQueryService>();
builder.Services.AddScoped<CsvExportService>();
builder.Services.AddScoped<RoutineService>();

// Add controllers to the container
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Swagger
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

// Postgres
// create migration ==> dotnet ef migrations add Init
// update db with migration ==> dotnet ef database update
// if EF not installed ==> dotnet tool install dotnet-ef
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// JWT
var publicKeyPem = File.ReadAllText(builder.Configuration["Jwt:PublicKeyPath"]!);
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors("localhostFrontend");
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();

    //// DB initialization on startup
    //AsyncServiceScope scope = app.Services.CreateAsyncScope();
    //AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    /////PasswordService pass = scope.ServiceProvider.GetRequiredService<PasswordService>();

    ////await db.Database.EnsureDeletedAsync();
    //await db.Database.MigrateAsync();

    //await DbInitializer.SeedAsync(db/*, pass*/);
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
