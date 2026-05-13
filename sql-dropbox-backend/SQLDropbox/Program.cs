using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SQLDropbox.Data;
using SQLDropbox.Repositories;

var builder = WebApplication.CreateBuilder(args);

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

// Add services to the container.

// Add controllers to the container
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Postgres
// create migration ==> dotnet ef migrations add Init
// update db with migration ==> dotnet ef database update
// if EF not installed ==> dotnet tool install dotnet-ef
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

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

app.UseAuthorization();

app.MapControllers();

app.Run();
