using SQLDropbox.Services;
using SQLDropbox.Data;
using SQLDropbox.Models;
using SQLDropbox.Enums;

namespace SQLDropbox.Repositories
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context, PasswordService ps)
        {
            /* ADMINS */
            var admin = new User
            {
                UserCode = "admin",
                FirstName = "Admin",
                Email = "Admin@ucll.be",
                Password = ps.HashPassword("Admin"),
                Role = Role.Admin,
                CreatedAt = DateTime.UtcNow,
            };

            /* COURSES */
            var course1 = new Course
            {
                CourseId = "data-management",
                CourseNameNL = "Data Beheer",
                CourseNameEN = "Data Management",
                CourseDescriptionNL = "Beheer data.",
                CourseDescriptionEN = "Manage data.",
                IsActive = false,
                Lecturer = "Lehr Kragt",
                CreatedAt = DateTime.UtcNow,
            };
            var course2 = new Course
            {
                CourseId = "data-analytics",
                CourseNameNL = "Data Analyse",
                CourseNameEN = "Data Analytics",
                CourseDescriptionNL = "Analyseer data.",
                CourseDescriptionEN = "Analyze data.",
                IsActive = false,
                Lecturer = "Bro Fesser",
                CreatedAt = DateTime.UtcNow,
            };

            /* SCHEMAS */
            var schema1 = new Schema { SchemaName = "animals", CreatedAt = DateTime.UtcNow };
            var schema2 = new Schema { SchemaName = "rooms", CreatedAt = DateTime.UtcNow };

            /* CHAPTERS */
            var chapter1 = new Chapter
            {
                ChapterNameNL = "JOINS Gevorderd",
                ChapterNameEN = "JOINS Advanced",
                ChapterDescriptionNL = "Leer werken met verschillende soorten JOINS.",
                ChapterDescriptionEN = "Learn to use different types of JOINS.",
                AmountOfExercises = 10,
                Order = 1,
                Deadline = DateTime.UtcNow.AddDays(14),
                Course = course1,
                Schema = schema1,
                CreatedAt = DateTime.UtcNow,
            };
            var chapter2 = new Chapter
            {
                ChapterNameNL = "SUBQUERIES Basis",
                ChapterNameEN = "SUBQUERIES Basics",
                ChapterDescriptionNL = "Leer werken met SUBQUERIES.",
                ChapterDescriptionEN = "Learn to use SUBQUERIES.",
                AmountOfExercises = 5,
                Order = 2,
                Deadline = DateTime.UtcNow.AddDays(7),
                Course = course1,
                Schema = schema2,
                CreatedAt = DateTime.UtcNow,
            };

            /* EXERCISES */
            var exercise1 = new Exercise
            {
                QuestionNL = "Toon alle dieren en hun lengte.",
                QuestionEN = "Show all animals and their size.",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "This would be the query output",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise2 = new Exercise
            {
                QuestionNL = "Toon alle dieren en hun snelheid.",
                QuestionEN = "Show all animals and their speed.",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "This would be the query output",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise3 = new Exercise
            {
                QuestionNL = "Toon alle dieren en hun gewicht.",
                QuestionEN = "Show all animals and their weight.",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "This would be the query output",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };

            /* SOLUTIONS */
            const string joinQuery = "SELECT * FROM animal INNER JOIN animal_specs ON animal.id = animel_specs.animal_id";
            var solution1 = new Solution { Query = joinQuery, Exercise = exercise1, CreatedAt = DateTime.UtcNow };
            var solution2 = new Solution { Query = joinQuery, Exercise = exercise2, CreatedAt = DateTime.UtcNow };
            var solution3 = new Solution { Query = joinQuery, Exercise = exercise3, CreatedAt = DateTime.UtcNow };

            /* LECTURERS */
            var lecturer = new User
            {
                UserCode = "u0123456",
                FirstName = "Lector-Lander",
                LastName = "Dirix",
                Email = "u0123456@ucll.be",
                Password = null,
                Role = Role.Lecturer,
                LecturerCourses = [course1, course2],
                CreatedAt = DateTime.UtcNow,
            };

            /* STUDENTS */
            var student1 = new User
            {
                UserCode = "r0123456",
                FirstName = "Example",
                LastName = "student",
                Email = "r0123456@ucll.be",
                Password = ps.HashPassword("r0123456"),
                Role = Role.Student,
                StudentCourses = [course1],
                CreatedAt = DateTime.UtcNow,
            };

            var student2 = new User
            {
                UserCode = "r0933070",
                FirstName = "Lander",
                LastName = "Dirix",
                Email = "r0933070@ucll.be",
                Password = null,
                Role = Role.Student,
                CreatedAt = DateTime.UtcNow,
            };

            /* STUDENT EXERCISES */
            var studentExercise1 = new UserExercise
            {
                IsCompleted = false,
                Exercise = exercise1,
                Student = student1,
                CreatedAt = DateTime.UtcNow,
            };

            /* STUDENT SOLUTIONS */
            var studentSolution1 = new UserSolution
            {
                Query = "SELECT * FROM animals",
                IsCorrect = false,
                ErrorMessage = "Table name does not exist. Did you mean \"animal\"?",
                StudentExercise = studentExercise1,
                CreatedAt = DateTime.UtcNow,
            };


            /* ADD */
            context.Courses.AddRange(course1, course2);
            context.Schemas.AddRange(schema1, schema2);
            context.Chapters.AddRange(chapter1, chapter2);
            context.Exercises.AddRange(exercise1, exercise2, exercise3);
            context.Solutions.AddRange(solution1, solution2, solution3);
            context.Users.Add(admin);
            context.Users.Add(lecturer);
            context.Users.AddRange(student1, student2);
            context.StudentExercises.Add(studentExercise1);
            context.StudentSolutions.Add(studentSolution1);

            await context.SaveChangesAsync();
        }
    }
}