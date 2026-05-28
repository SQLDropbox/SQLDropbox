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
            await context.Users.ExecuteDeleteAsync();

            await context.Database.ExecuteSqlRawAsync(@"
                DROP TABLE IF EXISTS animals.mammals;
                DROP TABLE IF EXISTS animals.food;
            ");
        }

        public static async Task SeedAsyncDev(AppDbContext context, PasswordService ps)
        {
            /* UTIL SCHEMA + PROCEDURES + PRIVILEGES */
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
                 DO $$
                 BEGIN
                     IF NOT EXISTS (
                         SELECT FROM pg_catalog.pg_roles
                         WHERE rolname = 'sqldropbox_admin'
                     ) THEN
                         CREATE ROLE sqldropbox_admin
                         WITH LOGIN PASSWORD 'r0H8X2Z0XRsA7C9L';
                     END IF;
                 END
                 $$;
                 GRANT USAGE, CREATE ON SCHEMA util TO sqldropbox_admin;
                 GRANT USAGE ON LANGUAGE plpgsql TO sqldropbox_admin;
                 GRANT SELECT ON ALL TABLES IN SCHEMA util TO sqldropbox_admin;
                 GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA util TO sqldropbox_admin;
                 GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA util TO sqldropbox_admin;
             ");

            /* ANIMALS SCHEMA + TABLE */
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

                    CONSTRAINT fk_mammal_food
                    FOREIGN KEY (food_id)
                    REFERENCES animals.food(id)
                    ON DELETE RESTRICT
                 );
             ");

            await context.Database.ExecuteSqlRawAsync(@"
                 INSERT INTO animals.food (name) VALUES
                 ('Nuts'),
                 ('Meat'),
                 ('Fish'),
                 ('Plants');

                 INSERT INTO animals.mammals (name, habitat, food_id) VALUES
                 ('Elephant', 'Savannah', 1),
                 ('Lion', 'Savannah', 2),
                 ('Zebra', 'Savannah', 4),
                 ('Tiger', 'Jungle', 2),
                 ('Orangutan', 'Jungle', 4),
                 ('Jaguar', 'Jungle', 2),
                 ('Polar Bear', 'Arctic', 3),
                 ('Artic Fox', 'Arctic', 2),
                 ('Blue Whale', 'Arctic', 3),
                 ('Dolphin', 'Ocean', 3),
                 ('Bat', 'Caves', 4),
                 ('Cave Bear', 'Caves', 2),
                 ('Kangaroo', 'Grasslands', 4),
                 ('Squirrel', 'Woods', 1);                
             ");

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
            var schema1 = new Schema { SchemaName = "animals", CreatedAt = DateTime.UtcNow };
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
                Course = course1,
                Schema = schema2,
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
                Course = course1,
                Schema = schema2,
                CreatedAt = DateTime.UtcNow,
            };

            /* EXERCISES */
            var exercise1 = new Exercise
            {
                QuestionNL = "Toon alle dieren wiens habitat \"Jungle\" is.",
                QuestionEN = "Show all animals whose habitat is \"Jungle\".",
                QueryOutput = "id,name,habitat,food_id\r\n4,Tiger,Jungle,2\r\n5,Orangutan,Jungle,4\r\n6,Jaguar,Jungle,2\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise2 = new Exercise
            {
                QuestionNL = "Toon alle dieren die \"Nuts\" eten.",
                QuestionEN = "Show all animals who eat \"Nuts\".",
                QueryOutput = "id,name,habitat,food_id,id,name\r\n1,Elephant,Savannah,1,1,Nuts\r\n14,Squirrel,Woods,1,1,Nuts\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise3 = new Exercise
            {
                QuestionNL = "Toon een dier dat in de \"Savannah\" leeft en de letter \"e\" heeft.",
                QuestionEN = "Show an animal that lives in the \"Savannah\" and contains the letter \"e\".",
                HintNL = "Gebruik een wildcard.",
                HintEN = "Use a wildcard.",
                QueryOutput = "id,name,habitat,food_id\r\n1,Elephant,Savannah,1\r\n3,Zebra,Savannah,4\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise4 = new Exercise
            {
                QuestionNL = "Toon alle dieren die in de \"Arctic\" leven en \"Fish\" eten.",
                QuestionEN = "Show all animals that live in the \"Arctic\" and eat \"Fish\".",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "id,name,habitat,food_id,id,name\r\n7,Polar Bear,Arctic,3,3,Fish\r\n9,Blue Whale,Arctic,3,3,Fish\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise5 = new Exercise
            {
                QuestionNL = "Toon alle dieren wiens \"food\" de letter \"a\" bevat.",
                QuestionEN = "Show all animals whose \"food\" contains the letter \"a\".",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "id,name,habitat,food_id,id,name\r\n2,Lion,Savannah,2,2,Meat\r\n3,Zebra,Savannah,4,4,Plants\r\n4,Tiger,Jungle,2,2,Meat\r\n5,Orangutan,Jungle,4,4,Plants\r\n6,Jaguar,Jungle,2,2,Meat\r\n8,Artic Fox,Arctic,2,2,Meat\r\n11,Bat,Caves,4,4,Plants\r\n12,Cave Bear,Caves,2,2,Meat\r\n13,Kangaroo,Grasslands,4,4,Plants\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };

            /* SOLUTIONS */
            var solution1 = new Solution { Query = "SELECT * FROM mammals AS m WHERE m.habitat = 'Jungle'", QueryHash = 3684803095, Exercise = exercise1, CreatedAt = DateTime.UtcNow };
            var solution2 = new Solution { Query = "SELECT * FROM mammals AS m JOIN food AS f ON m.food_id = f.id WHERE f.name = 'Nuts'", QueryHash = 2227733060, Exercise = exercise2, CreatedAt = DateTime.UtcNow };
            var solution3 = new Solution { Query = "SELECT * FROM mammals AS m WHERE m.habitat = 'Savannah' AND m.name LIKE '%e%'", QueryHash = 2303149545, Exercise = exercise3, CreatedAt = DateTime.UtcNow };
            var solution4 = new Solution { Query = "SELECT * FROM mammals AS m JOIN food AS f ON m.food_id = f.id WHERE m.habitat = 'Arctic' AND f.name = 'Fish'", QueryHash = 1677832380, Exercise = exercise4, CreatedAt = DateTime.UtcNow };
            var solution5 = new Solution { Query = "SELECT * FROM mammals AS m JOIN food AS f ON m.food_id = f.id WHERE f.name LIKE '%a%'", QueryHash = 1059124326, Exercise = exercise5, CreatedAt = DateTime.UtcNow };

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
                Password = null,
                Role = Role.Student,
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
            context.Users.Add(admin);
            context.Users.AddRange(lecturer1, lecturer2);
            context.Users.AddRange(student1, student2);
            context.UserExercises.AddRange(studentExercise1, studentExercise2, studentExercise3);
            context.UserSolutions.AddRange(studentSolution1, studentSolution2, studentSolution3);

            await context.SaveChangesAsync();
        }

        public static async Task SeedAsyncProd(AppDbContext context, PasswordService ps)
        {
            /* UTIL SCHEMA + PROCEDURES + PRIVILEGES */
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
                 DO $$
                 BEGIN
                     IF NOT EXISTS (
                         SELECT FROM pg_catalog.pg_roles
                         WHERE rolname = 'sqldropbox_admin'
                     ) THEN
                         CREATE ROLE sqldropbox_admin
                         WITH LOGIN PASSWORD 'r0H8X2Z0XRsA7C9L';
                     END IF;
                 END
                 $$;
                 GRANT USAGE, CREATE ON SCHEMA util TO sqldropbox_admin;
                 GRANT USAGE ON LANGUAGE plpgsql TO sqldropbox_admin;
                 GRANT SELECT ON ALL TABLES IN SCHEMA util TO sqldropbox_admin;
                 GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA util TO sqldropbox_admin;
                 GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA util TO sqldropbox_admin;
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
                GRANT USAGE, CREATE ON SCHEMA util TO sqldropbox_admin;
                GRANT USAGE ON LANGUAGE plpgsql TO sqldropbox_admin;
                GRANT SELECT ON ALL TABLES IN SCHEMA util TO sqldropbox_admin;
                GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA util TO sqldropbox_admin;
                GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA util TO sqldropbox_admin;
            ");

            /* ANIMALS SCHEMA + TABLE */
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

                    CONSTRAINT fk_mammal_food
                    FOREIGN KEY (food_id)
                    REFERENCES animals.food(id)
                    ON DELETE RESTRICT
                 );
             ");

            await context.Database.ExecuteSqlRawAsync(@"
                 INSERT INTO animals.food (name) VALUES
                 ('Nuts'),
                 ('Meat'),
                 ('Fish'),
                 ('Plants');

                 INSERT INTO animals.mammals (name, habitat, food_id) VALUES
                 ('Elephant', 'Savannah', 1),
                 ('Lion', 'Savannah', 2),
                 ('Zebra', 'Savannah', 4),
                 ('Tiger', 'Jungle', 2),
                 ('Orangutan', 'Jungle', 4),
                 ('Jaguar', 'Jungle', 2),
                 ('Polar Bear', 'Arctic', 3),
                 ('Artic Fox', 'Arctic', 2),
                 ('Blue Whale', 'Arctic', 3),
                 ('Dolphin', 'Ocean', 3),
                 ('Bat', 'Caves', 4),
                 ('Cave Bear', 'Caves', 2),
                 ('Kangaroo', 'Grasslands', 4),
                 ('Squirrel', 'Woods', 1);                
             ");

            /* ADMINS */
            var admin = new User
            {
                UserCode = "admin",
                FirstName = "Admin",
                Email = "Admin@ucll.be",
                Password = ps.HashPassword("V$k0&q-8~3oQmsbO"),
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
                Deadline = DateTime.UtcNow.AddDays(7),
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
                Course = course1,
                Schema = schema2,
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
                Course = course1,
                Schema = schema2,
                CreatedAt = DateTime.UtcNow,
            };

            /* EXERCISES */
            var exercise1 = new Exercise
            {
                QuestionNL = "Toon alle dieren wiens habitat \"Jungle\" is.",
                QuestionEN = "Show all animals whose habitat is \"Jungle\".",
                QueryOutput = "id,name,habitat,food_id\r\n4,Tiger,Jungle,2\r\n5,Orangutan,Jungle,4\r\n6,Jaguar,Jungle,2\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise2 = new Exercise
            {
                QuestionNL = "Toon alle dieren die \"Nuts\" eten.",
                QuestionEN = "Show all animals who eat \"Nuts\".",
                QueryOutput = "id,name,habitat,food_id,id,name\r\n1,Elephant,Savannah,1,1,Nuts\r\n14,Squirrel,Woods,1,1,Nuts\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise3 = new Exercise
            {
                QuestionNL = "Toon een dier dat in de \"Savannah\" leeft en de letter \"e\" heeft.",
                QuestionEN = "Show an animal that lives in the \"Savannah\" and contains the letter \"e\".",
                HintNL = "Gebruik een wildcard.",
                HintEN = "Use a wildcard.",
                QueryOutput = "id,name,habitat,food_id\r\n1,Elephant,Savannah,1\r\n3,Zebra,Savannah,4\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise4 = new Exercise
            {
                QuestionNL = "Toon alle dieren die in de \"Arctic\" leven en \"Fish\" eten.",
                QuestionEN = "Show all animals that live in the \"Arctic\" and eat \"Fish\".",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "id,name,habitat,food_id,id,name\r\n7,Polar Bear,Arctic,3,3,Fish\r\n9,Blue Whale,Arctic,3,3,Fish\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };
            var exercise5 = new Exercise
            {
                QuestionNL = "Toon alle dieren wiens \"food\" de letter \"a\" bevat.",
                QuestionEN = "Show all animals whose \"food\" contains the letter \"a\".",
                HintNL = "Gebruik een JOIN.",
                HintEN = "Use a JOIN.",
                QueryOutput = "id,name,habitat,food_id,id,name\r\n2,Lion,Savannah,2,2,Meat\r\n3,Zebra,Savannah,4,4,Plants\r\n4,Tiger,Jungle,2,2,Meat\r\n5,Orangutan,Jungle,4,4,Plants\r\n6,Jaguar,Jungle,2,2,Meat\r\n8,Artic Fox,Arctic,2,2,Meat\r\n11,Bat,Caves,4,4,Plants\r\n12,Cave Bear,Caves,2,2,Meat\r\n13,Kangaroo,Grasslands,4,4,Plants\r\n",
                Chapter = chapter1,
                CreatedAt = DateTime.UtcNow,
            };

            /* SOLUTIONS */
            var solution1 = new Solution { Query = "SELECT * FROM mammals AS m WHERE m.habitat = 'Jungle'", QueryHash = 3684803095, Exercise = exercise1, CreatedAt = DateTime.UtcNow };
            var solution2 = new Solution { Query = "SELECT * FROM mammals AS m JOIN food AS f ON m.food_id = f.id WHERE f.name = 'Nuts'", QueryHash = 2227733060, Exercise = exercise2, CreatedAt = DateTime.UtcNow };
            var solution3 = new Solution { Query = "SELECT * FROM mammals AS m WHERE m.habitat = 'Savannah' AND m.name LIKE '%e%'", QueryHash = 2303149545, Exercise = exercise3, CreatedAt = DateTime.UtcNow };
            var solution4 = new Solution { Query = "SELECT * FROM mammals AS m JOIN food AS f ON m.food_id = f.id WHERE m.habitat = 'Arctic' AND f.name = 'Fish'", QueryHash = 1677832380, Exercise = exercise4, CreatedAt = DateTime.UtcNow };
            var solution5 = new Solution { Query = "SELECT * FROM mammals AS m JOIN food AS f ON m.food_id = f.id WHERE f.name LIKE '%a%'", QueryHash = 1059124326, Exercise = exercise5, CreatedAt = DateTime.UtcNow };

            /* LECTURERS */
            var lecturer1 = new User
            {
                UserCode = "u0123456",
                FirstName = "Lector-Lander",
                LastName = "Dirix",
                Email = "u0123456@ucll.be",
                Password = ps.HashPassword("p1g8V!2ewg-&r-pY"),
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
                Password = ps.HashPassword("vbN01wU;'.0Pi5kr"),
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
                Password = ps.HashPassword("Kf55L5=0tr@Qd~dk"),
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
            context.Users.Add(admin);
            context.Users.AddRange(lecturer1, lecturer2);
            context.Users.AddRange(student1, student2);
            context.UserExercises.AddRange(studentExercise1, studentExercise2, studentExercise3);
            context.UserSolutions.AddRange(studentSolution1, studentSolution2, studentSolution3);

            await context.SaveChangesAsync();
        }
    }
}