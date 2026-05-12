using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Models;

namespace SQLDropbox.Repositories
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context/*, PasswordService passwordService*/)
        {
            await context.Admins.ExecuteDeleteAsync();
            await context.Chapters.ExecuteDeleteAsync();
            await context.Courses.ExecuteDeleteAsync();
            await context.Exercises.ExecuteDeleteAsync();
            await context.Requirements.ExecuteDeleteAsync();
            await context.Solutions.ExecuteDeleteAsync();
            await context.Students.ExecuteDeleteAsync();
            await context.StudentExercises.ExecuteDeleteAsync();
            await context.StudentSolutions.ExecuteDeleteAsync();

            Admin admin = new()
            {
                LectorCode = "u0123456",
                CreatedAt = DateTime.UtcNow,
            };
            await context.Admins.AddAsync(admin);

            Course course1 = new()
            {
                IsActive = false,
                CreatedAt = DateTime.Now,
            };
            await context.Courses.AddAsync(course1);

            Chapter chapter1 = new()
            {
                Course = course1,
                CreatedAt = DateTime.UtcNow,
            };
            await context.Chapters.AddAsync(chapter1);

            Exercise exercise1 = new()
            {
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            await context.Exercises.AddAsync(exercise1);

            Student student1 = new()
            {
                StudentCode = "r0123456",
                FullName = "Dametrius Demarques",
                Year = 2026,
                Group = "Gangsters",
                Course = course1,
                CreatedAt= DateTime.UtcNow,
            };
            await context.Students.AddAsync(student1);

            await context.SaveChangesAsync();
        }
    }
}
