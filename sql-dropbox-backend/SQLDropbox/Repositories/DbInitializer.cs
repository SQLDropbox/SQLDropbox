using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Enums;
using SQLDropbox.Models;
using SQLDropbox.Services;

namespace SQLDropbox.Repositories
{
    public static class DbInitializer
    {
        public static async Task EmptyAsync(AppDbContext context)
        {
            await context.RefreshTokens.ExecuteDeleteAsync();
            await context.Requirements.ExecuteDeleteAsync();
            await context.UserSolutions.ExecuteDeleteAsync();
            await context.UserExercises.ExecuteDeleteAsync();
            await context.Solutions.ExecuteDeleteAsync();
            await context.Exercises.ExecuteDeleteAsync();
            await context.Schemas.ExecuteDeleteAsync();
            await context.Chapters.ExecuteDeleteAsync();
            await context.Courses.ExecuteDeleteAsync();
            await context.Users.Where(u => u.Role != Role.Admin).ExecuteDeleteAsync();
        }

        public static async Task SeedAsyncDev(AppDbContext context, PasswordService ps)
        {

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE SCHEMA IF NOT EXISTS util;
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE PROCEDURE util.sp_clone_schema(
                    source_schema TEXT,
                    target_schema TEXT
                )
                LANGUAGE plpgsql
                AS $$
                DECLARE
                    table_record RECORD;
                BEGIN
                    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', target_schema);

                    FOR table_record IN
                        SELECT tablename
                        FROM pg_tables
                        WHERE schemaname = source_schema
                    LOOP
                        EXECUTE format(
                            'CREATE TABLE %I.%I (LIKE %I.%I INCLUDING ALL)',
                            target_schema,
                            table_record.tablename,
                            source_schema,
                            table_record.tablename
                        );

                        EXECUTE format(
                            'INSERT INTO %I.%I SELECT * FROM %I.%I',
                            target_schema,
                            table_record.tablename,
                            source_schema,
                            table_record.tablename
                        );
                    END LOOP;
                END;
                $$;
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE OR REPLACE PROCEDURE util.sp_delete_schema(
                    schema_name TEXT
                )
                LANGUAGE plpgsql
                AS $$
                BEGIN
                    EXECUTE format(
                        'DROP SCHEMA IF EXISTS %I CASCADE',
                        schema_name
                    );
                END;
                $$;
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE SCHEMA IF NOT EXISTS animals;
                CREATE TABLE IF NOT EXISTS animals.food (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS animals.mammals (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    habitat TEXT NOT NULL,
                    food_id INT NOT NULL,
                    CONSTRAINT fk_mammal_food FOREIGN KEY (food_id) REFERENCES animals.food(id) ON DELETE RESTRICT
                );
            ");

            await context.Database.ExecuteSqlRawAsync(@"
                INSERT INTO animals.food (name)
                VALUES ('Nuts'),
                    ('Meat'),
                    ('Fish'),
                    ('Plants'),
                    ('Insects'),
                    ('Fruits'),
                    ('Grass'),
                    ('Bamboo'),
                    ('Seeds'),
                    ('Invertebrates');
                INSERT INTO animals.mammals (name, habitat, food_id)
                VALUES ('Elephant', 'Savannah', 1),
                    ('Lion', 'Savannah', 2),
                    ('Zebra', 'Savannah', 4),
                    ('Giraffe', 'Savannah', 7),
                    ('Hyena', 'Savannah', 2),
                    ('Rhino', 'Savannah', 7),
                    ('Tiger', 'Jungle', 2),
                    ('Orangutan', 'Jungle', 4),
                    ('Jaguar', 'Jungle', 2),
                    ('Chimpanzee', 'Jungle', 6),
                    ('Sloth', 'Jungle', 4),
                    ('Polar Bear', 'Arctic', 3),
                    ('Artic Fox', 'Arctic', 2),
                    ('Blue Whale', 'Arctic', 3),
                    ('Seal', 'Arctic', 3),
                    ('Walrus', 'Arctic', 10),
                    ('Dolphin', 'Ocean', 3),
                    ('Bat', 'Caves', 4),
                    ('Cave Bear', 'Caves', 2),
                    ('Kangaroo', 'Grasslands', 4),
                    ('Rabbit', 'Grasslands', 7),
                    ('Squirrel', 'Woods', 1),
                    ('Hedgehog', 'Woods', 5),
                    ('Wolf', 'Forest', 2),
                    ('Fox', 'Forest', 2),
                    ('Deer', 'Forest', 7),
                    ('Panda', 'Forest', 8),
                    ('Snow Leopard', 'Mountain', 2),
                    ('Mountain Goat', 'Mountain', 7),
                    ('Camel', 'Desert', 7),
                    ('Meerkat', 'Desert', 5);  
            ");

            await context.Database.ExecuteSqlRawAsync("""
                DO $$ BEGIN IF NOT EXISTS (
                    SELECT
                    FROM pg_catalog.pg_roles
                    WHERE rolname = 'sqldropbox_select_exercise_user'
                ) THEN CREATE ROLE sqldropbox_select_exercise_user WITH LOGIN PASSWORD 'QJn3I7ube4JfZ57d';
                END IF;
                END $$;
                REVOKE CONNECT ON DATABASE sqldropbox
                FROM sqldropbox_select_exercise_user;
                REVOKE ALL ON SCHEMA public
                FROM sqldropbox_select_exercise_user;
                DO $$
                DECLARE r RECORD;
                BEGIN FOR r IN
                SELECT schema_name
                FROM information_schema.schemata
                WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'public') LOOP EXECUTE format(
                        'GRANT USAGE ON SCHEMA %I TO sqldropbox_select_exercise_user',
                        r.schema_name
                    );
                EXECUTE format(
                    'GRANT SELECT ON ALL TABLES IN SCHEMA %I TO sqldropbox_select_exercise_user',
                    r.schema_name
                );
                END LOOP;
                END $$;                                                            
                """);

            /* COURSES */
            var course1 = new Course
            {
                CourseId = "data-management",
                CourseNameNL = "Data Beheer",
                CourseNameEN = "Data Management",
                CourseDescriptionNL = "Beheer data.",
                CourseDescriptionEN = "Manage data.",
                IsActive = true,
                //Lecturer = "Lehr Kragt",
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
                //Lecturer = "Bro Fesser",
                CreatedAt = DateTime.UtcNow,
            };
            var course3 = new Course
            {
                CourseId = "data-foundations",
                CourseNameNL = "Data Fundering",
                CourseNameEN = "Data Foundations",
                CourseDescriptionNL = "Fundeer data.",
                CourseDescriptionEN = "Foundate data.",
                IsActive = false,
                //Lecturer = "Lek Tuurer",
                CreatedAt = DateTime.UtcNow,
            };

            /* SCHEMAS */
            var schema1 = new Schema { SchemaName = "animals", CreatedAt = DateTime.UtcNow, SchemaImage = "02fe567c-4e83-4db8-8eab-e2f8ca2c3804.png" };
            var schema2 = new Schema { SchemaName = "rooms", CreatedAt = DateTime.UtcNow };

            /* CHAPTERS */
            var chapter1 = new Chapter
            {
                ChapterNameNL = "SELECT",
                ChapterNameEN = "SELECT",
                ChapterDescriptionNL = "Leer werken met SELECT.",
                ChapterDescriptionEN = "Learn to use SELECT.",
                AmountOfExercises = 3,
                Order = 1,
                Deadline = DateTime.UtcNow.AddDays(7),
                StartDate = DateTime.UtcNow,
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
                Deadline = DateTime.UtcNow.AddDays(14),
                StartDate = DateTime.UtcNow.AddDays(7),
                Course = course1,
                Schema = schema1,
                CreatedAt = DateTime.UtcNow,
            };
            var chapter3 = new Chapter
            {
                ChapterNameNL = "GROUP BY",
                ChapterNameEN = "GROUP BY",
                ChapterDescriptionNL = "Leer werken met GROUP BY.",
                ChapterDescriptionEN = "Learn to use GROUP BY.",
                AmountOfExercises = 7,
                Order = 3,
                Deadline = DateTime.UtcNow.AddDays(21),
                StartDate = DateTime.UtcNow.AddDays(14),
                Course = course1,
                Schema = schema2,
                CreatedAt = DateTime.UtcNow,
            };

            /* EXERCISES */
            var exercise1 = new Exercise
            {
                QuestionNL = "Toon alle dieren wiens habitat \"Jungle\" is.",
                QuestionEN = "Show all animals whose habitat is \"Jungle\".",
                QueryOutput = "id,name,habitat,food_id\r\n7,Tiger,Jungle,2\r\n8,Orangutan,Jungle,4\r\n9,Jaguar,Jungle,2\r\n10,Chimpanzee,Jungle,6\r\n11,Sloth,Jungle,4\r\n38,Tiger,Jungle,2\r\n39,Orangutan,Jungle,4\r\n40,Jaguar,Jungle,2\r\n41,Chimpanzee,Jungle,6\r\n42,Sloth,Jungle,4\r\n",
                QueryAction = QueryAction.Select,
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise2 = new Exercise
            {
                QuestionNL = "Toon alle dieren die \"Nuts\" eten.",
                QuestionEN = "Show all animals who eat \"Nuts\".",
                QueryOutput = "id,name,habitat,food_id,id,name\r\n1,Elephant,Savannah,1,1,Nuts\r\n22,Squirrel,Woods,1,1,Nuts\r\n32,Elephant,Savannah,1,1,Nuts\r\n53,Squirrel,Woods,1,1,Nuts\r\n",
                QueryAction = QueryAction.Select,
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise3 = new Exercise
            {
                QuestionNL = "Toon een dier dat in de \"Savannah\" leeft en de letter \"e\" heeft.",
                QuestionEN = "Show an animal that lives in the \"Savannah\" and contains the letter \"e\".",
                HintNL = "Gebruik een wildcard.",
                HintEN = "Use a wildcard.",
                QueryOutput = "id,name,habitat,food_id\r\n1,Elephant,Savannah,1\r\n3,Zebra,Savannah,4\r\n4,Giraffe,Savannah,7\r\n5,Hyena,Savannah,2\r\n32,Elephant,Savannah,1\r\n34,Zebra,Savannah,4\r\n35,Giraffe,Savannah,7\r\n36,Hyena,Savannah,2\r\n",
                QueryAction = QueryAction.Select,
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise4 = new Exercise
            {
                QuestionNL = "Toon alle dieren die in de \"Arctic\" leven en \"Fish\" eten.",
                QuestionEN = "Show all animals that live in the \"Arctic\" and eat \"Fish\".",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "id,name,habitat,food_id,id,name\r\n12,Polar Bear,Arctic,3,3,Fish\r\n14,Blue Whale,Arctic,3,3,Fish\r\n15,Seal,Arctic,3,3,Fish\r\n43,Polar Bear,Arctic,3,3,Fish\r\n45,Blue Whale,Arctic,3,3,Fish\r\n46,Seal,Arctic,3,3,Fish\r\n",
                QueryAction = QueryAction.Select,
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise5 = new Exercise
            {
                QuestionNL = "Toon alle dieren wiens \"food\" de letter \"a\" bevat.",
                QuestionEN = "Show all animals whose \"food\" contains the letter \"a\".",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "id,name,habitat,food_id,id,name\r\n2,Lion,Savannah,2,2,Meat\r\n3,Zebra,Savannah,4,4,Plants\r\n4,Giraffe,Savannah,7,7,Grass\r\n5,Hyena,Savannah,2,2,Meat\r\n6,Rhino,Savannah,7,7,Grass\r\n7,Tiger,Jungle,2,2,Meat\r\n8,Orangutan,Jungle,4,4,Plants\r\n9,Jaguar,Jungle,2,2,Meat\r\n11,Sloth,Jungle,4,4,Plants\r\n13,Artic Fox,Arctic,2,2,Meat\r\n16,Walrus,Arctic,10,10,Invertebrates\r\n18,Bat,Caves,4,4,Plants\r\n19,Cave Bear,Caves,2,2,Meat\r\n20,Kangaroo,Grasslands,4,4,Plants\r\n21,Rabbit,Grasslands,7,7,Grass\r\n24,Wolf,Forest,2,2,Meat\r\n25,Fox,Forest,2,2,Meat\r\n26,Deer,Forest,7,7,Grass\r\n27,Panda,Forest,8,8,Bamboo\r\n28,Snow Leopard,Mountain,2,2,Meat\r\n29,Mountain Goat,Mountain,7,7,Grass\r\n30,Camel,Desert,7,7,Grass\r\n33,Lion,Savannah,2,2,Meat\r\n34,Zebra,Savannah,4,4,Plants\r\n35,Giraffe,Savannah,7,7,Grass\r\n36,Hyena,Savannah,2,2,Meat\r\n37,Rhino,Savannah,7,7,Grass\r\n38,Tiger,Jungle,2,2,Meat\r\n39,Orangutan,Jungle,4,4,Plants\r\n40,Jaguar,Jungle,2,2,Meat\r\n42,Sloth,Jungle,4,4,Plants\r\n44,Artic Fox,Arctic,2,2,Meat\r\n47,Walrus,Arctic,10,10,Invertebrates\r\n49,Bat,Caves,4,4,Plants\r\n50,Cave Bear,Caves,2,2,Meat\r\n51,Kangaroo,Grasslands,4,4,Plants\r\n52,Rabbit,Grasslands,7,7,Grass\r\n55,Wolf,Forest,2,2,Meat\r\n56,Fox,Forest,2,2,Meat\r\n57,Deer,Forest,7,7,Grass\r\n58,Panda,Forest,8,8,Bamboo\r\n59,Snow Leopard,Mountain,2,2,Meat\r\n60,Mountain Goat,Mountain,7,7,Grass\r\n61,Camel,Desert,7,7,Grass\r\n",
                QueryAction = QueryAction.Select,
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };

            /* SOLUTIONS */
            var solution1 = new Solution { Query = "SELECT * FROM mammals AS m WHERE m.habitat = 'Jungle'", QueryHash = 3684803095, Exercise = exercise1, CreatedAt = DateTime.UtcNow };
            var solution2 = new Solution { Query = "SELECT * FROM mammals AS m JOIN food AS f ON m.food_id = f.id WHERE f.name = 'Nuts'", QueryHash = 2227733060, Exercise = exercise2, CreatedAt = DateTime.UtcNow };
            var solution3 = new Solution { Query = "SELECT * FROM mammals AS m WHERE m.habitat = 'Savannah' AND m.name LIKE '%e%'", QueryHash = 2303149545, Exercise = exercise3, CreatedAt = DateTime.UtcNow };
            var solution4 = new Solution { Query = "SELECT * FROM mammals AS m JOIN food AS f ON m.food_id = f.id WHERE m.habitat = 'Arctic' AND f.name = 'Fish'", QueryHash = 1677832380, Exercise = exercise4, CreatedAt = DateTime.UtcNow };
            var solution5 = new Solution { Query = "SELECT * FROM mammals AS m JOIN food AS f ON m.food_id = f.id WHERE f.name LIKE '%a%'", QueryHash = 1059124326, Exercise = exercise5, CreatedAt = DateTime.UtcNow };

            /* REQUIREMENTS */
            var requirement1 = new Requirement { Statement = "SELECT", IsBlacklist = false, IsHidden = false, Exercise = exercise1, CreatedAt = DateTime.UtcNow };
            var requirement2 = new Requirement { Statement = "LIKE", IsBlacklist = true, IsHidden = false, Exercise = exercise1, CreatedAt = DateTime.UtcNow };

            /* LECTURERS */
            var lecturer1 = new User
            {
                UserCode = "u0123456",
                FirstName = "Lector-Lander",
                LastName = "Dirix",
                Email = "u0123456@ucll.be",
                Password = ps.HashPassword("u0123456"),
                Role = Role.Lecturer,
                LecturerCourses = [course1, course2],
                CreatedAt = DateTime.UtcNow,
            };
            var lecturer2 = new User
            {
                UserCode = "u1234567",
                FirstName = "Lector-Joran",
                LastName = "Dirix",
                Email = "u1234567@ucll.be",
                Password = ps.HashPassword("u1234567"),
                Role = Role.Lecturer,
                LecturerCourses = [course1, course3],
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
                Password = ps.HashPassword("r0933070"),
                Role = Role.Student,
                StudentCourses = [course1],
                CreatedAt = DateTime.UtcNow,
            };

            /* STUDENT EXERCISES */
            var studentExercise1 = new UserExercise
            {
                IsCompleted = true,
                Exercise = exercise1,
                User = student1,
                CreatedAt = DateTime.UtcNow,
            };
            var studentExercise2 = new UserExercise
            {
                IsCompleted = false,
                Exercise = exercise2,
                User = student1,
                CreatedAt = DateTime.UtcNow,
            };
            var studentExercise3 = new UserExercise
            {
                IsCompleted = false,
                Exercise = exercise3,
                User = student1,
                CreatedAt = DateTime.UtcNow,
            };

            /* STUDENT SOLUTIONS */
            var studentSolution1 = new UserSolution
            {
                Query = "SELECT * FROM mammals AS m WHERE m.habitat = 'Jungle'",
                IsCorrect = true,
                UserExercise = studentExercise1,
                CreatedAt = DateTime.UtcNow,
            };
            var studentSolution2 = new UserSolution
            {
                Query = "SELECT * FROM mammals",
                IsCorrect = false,
                ErrorMessage = "Need to use a JOIN, query doesn't contain \"Nuts\"",
                UserExercise = studentExercise2,
                CreatedAt = DateTime.UtcNow,
            };
            var studentSolution3 = new UserSolution
            {
                Query = "SELECT * FROM mammals",
                IsCorrect = false,
                ErrorMessage = "Query doesn't contain \"Savannah\" or \"e\"",
                UserExercise = studentExercise3,
                CreatedAt = DateTime.UtcNow,
            };

            /* ADD */
            context.Courses.AddRange(course1, course2);
            context.Schemas.AddRange(schema1, schema2);
            context.Chapters.AddRange(chapter1, chapter2, chapter3);
            context.Exercises.AddRange(exercise1, exercise2, exercise3, exercise4, exercise5);
            context.Solutions.AddRange(solution1, solution2, solution3, solution4, solution5);
            context.Requirements.AddRange(requirement1, requirement2);
            context.Users.AddRange(lecturer1, lecturer2);
            context.Users.AddRange(student1, student2);
            context.UserExercises.AddRange(studentExercise1, studentExercise2, studentExercise3);
            context.UserSolutions.AddRange(studentSolution1, studentSolution2, studentSolution3);

            await context.SaveChangesAsync();
        }
    }
}