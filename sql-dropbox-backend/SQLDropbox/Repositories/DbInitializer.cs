using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Services;
using SQLDropbox.Data;
using SQLDropbox.Models;

namespace SQLDropbox.Repositories
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context, PasswordService passwordService)
        {
            //await context.Admins.ExecuteDeleteAsync();
            //await context.Requirements.ExecuteDeleteAsync();
            //await context.StudentSolutions.ExecuteDeleteAsync();
            //await context.StudentExercises.ExecuteDeleteAsync();
            //await context.Students.ExecuteDeleteAsync();
            //await context.Solutions.ExecuteDeleteAsync();
            //await context.Exercises.ExecuteDeleteAsync();
            //await context.Chapters.ExecuteDeleteAsync();
            //await context.Courses.ExecuteDeleteAsync();

            /* ADMINS */
            Admin admin = new()
            {
                LectorCode = "u0123456",
                /*Password = passwordService.HashPassword("u0123456"),*/
                CreatedAt = DateTime.UtcNow,
            };
            await context.Admins.AddAsync(admin);

            /* COURSES */
            Course course1 = new()
            {
                CourseNameNL = "Data Beheer",
                CourseNameEN = "Data Management",
                CourseDescriptionNL = "Beheer data.",
                CourseDescriptionEN = "Manage data.",
                Deadline = DateTime.UtcNow.AddDays(7),        
                IsActive = false,
                Lecturer = "Lehr Kragt",
                CreatedAt = DateTime.UtcNow,
            };
            Course course2 = new()
            {
                CourseNameNL = "Data Analyse",
                CourseNameEN = "Data Analytics",
                CourseDescriptionNL = "Analyseer data.",
                CourseDescriptionEN = "Analyze data.",
                Deadline = DateTime.UtcNow.AddDays(14),
                IsActive = false,
                Lecturer = "Bro Fesser",
                CreatedAt = DateTime.UtcNow,
            };
            await context.Courses.AddAsync(course1);
            await context.Courses.AddAsync(course2);

            /* CHAPTERS */
            Chapter chapter1 = new()
            {
                ChapterNameNL = "JOINS Gevorderd",
                ChapterNameEN = "JOINS Advanced",
                ChapterDescriptionNL = "Leer werken met verschillende soorten JOINS.",
                ChapterDescriptionEN = "Learn to use different types of JOINS.",
                DbSchema = DbSchemaType.Animals,
                AmountOfExercises = 10,
                Course = course1,
                CreatedAt = DateTime.UtcNow,
            };
            Chapter chapter2 = new()
            {
                ChapterNameNL = "SUBQUERIES Basis",
                ChapterNameEN = "SUBQUERIES Basics",
                ChapterDescriptionNL = "Leer werken met SUBQUERIES.",
                ChapterDescriptionEN = "Learn to use SUBQUERIES.",
                DbSchema = DbSchemaType.Animals,
                AmountOfExercises = 5,
                Course = course1,
                CreatedAt = DateTime.UtcNow,
            };
            await context.Chapters.AddAsync(chapter1);
            await context.Chapters.AddAsync(chapter2);

            /* EXERCISES */
            Exercise exercise1 = new()
            {
                QuestionNL = "Toon alle dieren en hun lengte.",
                QuestionEN = "Show all animals and their size.",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "This would be the query output",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            }; Exercise exercise2 = new()
            {
                QuestionNL = "Toon alle dieren en hun snelheid.",
                QuestionEN = "Show all animals and their speed.",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "This would be the query output",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            Exercise exercise3 = new()
            {
                QuestionNL = "Toon alle dieren en hun gewicht.",
                QuestionEN = "Show all animals and their weight.",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "This would be the query output",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            await context.Exercises.AddAsync(exercise1);
            await context.Exercises.AddAsync(exercise2);
            await context.Exercises.AddAsync(exercise3);

            /* SOLUTIONS */
            Solution solution1 = new()
            {
                Query = "SELECT * FROM animal INNER JOIN animal_specs ON animal.id = animel_specs.animal_id",
                Exercise = exercise1,
                CreatedAt = DateTime.UtcNow,
            };
            Solution solution2 = new()
            {
                Query = "SELECT * FROM animal INNER JOIN animal_specs ON animal.id = animel_specs.animal_id",
                Exercise = exercise2,
                CreatedAt = DateTime.UtcNow,
            }; Solution solution3 = new()
            {
                Query = "SELECT * FROM animal INNER JOIN animal_specs ON animal.id = animel_specs.animal_id",
                Exercise = exercise3,
                CreatedAt = DateTime.UtcNow,
            };
            await context.Solutions.AddAsync(solution1);
            await context.Solutions.AddAsync(solution2);
            await context.Solutions.AddAsync(solution3);

            /* STUDENTS */
            Student student1 = new()
            {
                StudentCode = "r0123456",
                FullName = "Eggsample Stewdent",
                Year = 2026,
                Group = "AT-TE",
                Course = course1,
                /*Password = passwordService.HashPassword("r0123456"),*/
                CreatedAt = DateTime.UtcNow,
            };
            await context.Students.AddAsync(student1);

            /* STUDENT EXERCISES */
            StudentExercise studentExercise1 = new()
            {
                IsCompleted = false,
                Exercise = exercise1,
                Student = student1,
                CreatedAt = DateTime.UtcNow,
            };
            await context.StudentExercises.AddAsync(studentExercise1);

            /* STUDENT SOLUTIONS */
            StudentSolution studentSolution1 = new()
            {
                Query = "SELECT * FROM animals",
                IsCorrect = false,
                Error = "Table name does not exist. Did you mean \"animal\"?",
                StudentExercise = studentExercise1,
                CreatedAt = DateTime.UtcNow,
            };
            await context.StudentSolutions.AddAsync(studentSolution1);

            /* SAVE ALL */
            await context.SaveChangesAsync();
        }
    }
}
