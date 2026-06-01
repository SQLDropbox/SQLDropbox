using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Helpers;
using SQLDropbox.Models;
using SQLDropbox.Repositories;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class UtilitiesController(AppDbContext db, PasswordService passwordService, SolutionService solutionService, SchemaService schemaService) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly PasswordService _ps = passwordService;
    private readonly SolutionService _soS = solutionService;
    private readonly SchemaService _scS = schemaService;

    [HttpGet("seed-db")]
    public async Task<IActionResult> SeedTheDb()
    {
        await DbInitializer.EmptyAsync(_db);
        await DbInitializer.SeedAsyncDev(_db, _ps);
        return Ok("The DB should have been seeded.");
    }

    [HttpGet("empty-db")]
    public async Task<IActionResult> EmptyTheDb()
    {
        await DbInitializer.EmptyAsync(_db);
        return Ok("The DB should have been emptied.");
    }

    [HttpPost("format")]
    public async Task<IActionResult> Format([FromBody] FormatDTO format)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (format.Query == null)
            return BadRequest("Query is required.");

        var formatted = _soS.FormatQuery(format.Query);
        return Ok(formatted);
    }

    [HttpPost("check")]
    public async Task<IActionResult> Check([FromBody] FormatDTO format)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        List<Requirement> requirements = [];
        Requirement r1 = new()
        {
            RequirementId = 1,
            Statement = "JOIN",
            Use = false
        };
        requirements.Add(r1);
        Requirement r2 = new()
        {
            RequirementId = 1,
            Statement = "GROUP BY",
            Use = true
        };
        requirements.Add(r2);

        var (Valid, Message) = _soS.CheckQueryRequirements(requirements, format.Query);
        return Ok($"{Valid}: {Message}");
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var result = AuthHelper.GetUserClaims(this);
        if (result.Result != null) return BadRequest(result.Result);
        return Ok(result.Value.ToString());
    }

    [HttpGet("random-exercise/{chapterIdStr}/{userIdStr}")]
    public async Task<IActionResult> GetRandomExercise(string chapterIdStr, string userIdStr)
    {
        try
        {
            if (!int.TryParse(chapterIdStr, out int chapterId))
                return BadRequest("Not a valid chapter id.");

            if (!Guid.TryParse(userIdStr, out Guid userId))
                return BadRequest("Not a valid user id.");

            User? student = await _db.Users
                    .Where(u => u.UserId == userId)
                    .FirstOrDefaultAsync();

            if (student == null)
                return NotFound("Student not found.");

            // Get a chapter with all exercises and all their user exercises
            Chapter? chapterForStudent = await _db.Chapters
              .Where(c => c.ChapterId == chapterId)
              .Include(c => c.Exercises
                  .OrderBy(e => e.ExerciseId)
              )
              .ThenInclude(e => e.UserExercises
                  .Where(ue => ue.User == student)
              )
              .FirstOrDefaultAsync();

            if (chapterForStudent == null)
                return BadRequest(new { message = $"Chapter with ID {chapterId} not found." });

            int amount = chapterForStudent.AmountOfExercises ?? 0;

            // Get the exercises for which a user exercise for this student already exists
            List<Exercise> currentExercises = [.. chapterForStudent.Exercises
                    .Where(e => e.UserExercises.Any(se => se.User == student))
                    .OrderBy(e => e.ExerciseId)];

            // If there are as much off those as the amount required for a chapter, return those current exercises
            if (currentExercises.Count == amount)
                return Ok(currentExercises);

            // If not, get all possible exercises, for which a user exercise for this student doesn't yet exist
            List<Exercise> possibleExercises = [.. chapterForStudent.Exercises
                    .Where(e => !e.UserExercises.Any(se => se.User == student))
                    .OrderBy(e => e.ExerciseId)];

            // Init the list of exercises to return by adding the current exercises (in case the needed amount gets increased)
            List<Exercise> exercises = currentExercises;
            List<UserExercise> userExercises = [];

            // Loop for the amount of exercises needed for a student to make in a chapter
            for (int i = 0; i < amount; i++)
            {
                // If there are no more possible exercises, but more exercises are required in the chapter than that exist for the chapter (lecturer issue)
                // In this case, for now, throw an error, obviously, this scenario should be impossible
                if (possibleExercises.Count == 0)
                    return BadRequest(new { message = "No possible exercise left for this chapter." });

                // Pick a random exercise for the possible ones left
                int random = Random.Shared.Next(possibleExercises.Count);
                Exercise randomExercise = possibleExercises[random];

                // If none left, error
                if (randomExercise == null)
                    return BadRequest(new { message = "Error occured selecting a random exercise." });

                // Create a user exercise for the current student and the random exercise
                userExercises.Add(new UserExercise
                {
                    IsCompleted = false,
                    Exercise = randomExercise,
                    User = student,
                    CreatedAt = DateTime.UtcNow,
                });

                // Remove the randomly selected exercise from the possible exercises
                exercises.Add(randomExercise);
                possibleExercises.RemoveAll(e => e.ExerciseId == randomExercise.ExerciseId);
            }

            _db.UserExercises.AddRange(userExercises);
            await _db.SaveChangesAsync();

            // return the exercises
            return Ok(exercises);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost("seed-exercise-create-helper")]
    public async Task<IActionResult> GetExerciseCreateData([FromBody] SolutionDTO dto)
    {
        try
        {
            string formattedQuery = _soS.FormatQuery(dto.Query);
            uint queryHash = await _soS.HashSolution(formattedQuery);
            string queryOutput = await _scS.ExecuteSelectOnSchemaAsync("animals", formattedQuery);

            return Ok(new { query = formattedQuery, hash = queryHash, output = queryOutput });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost("test-select")]
    public async Task<IActionResult> TestSelect([FromBody] TempTestSolutionDTO dto)
    {
        try
        {
            Exercise? exercise = await _db.Exercises
                .Include(e => e.Solutions)
                .Include(e => e.Requirements)
                .Include(e => e.Chapter)
                .ThenInclude(c => c.Schema)
                .FirstOrDefaultAsync(e => e.ExerciseId == dto.ExerciseId);

            if (exercise == null)
                return BadRequest(new { message = "This exercise doesn't exist." });
            if (exercise.Chapter == null)
                return BadRequest(new { message = "This exercise is not part of a chapter." });
            if (exercise.Chapter.Schema == null)
                return BadRequest(new { message = "This exercise has no set schema." });

            string formattedQuery = _soS.FormatQuery(dto.Query);

            List<Requirement> requirements = [.. exercise.Requirements];
            var (Valid, Message) = _soS.CheckQueryRequirements(requirements, formattedQuery);
            if (!Valid)
                return BadRequest(new { message = Message });

            uint queryHash = await _soS.HashSolution(formattedQuery);

            Solution? knownSolution = exercise.Solutions.FirstOrDefault(s => s.QueryHash == queryHash);

            User? user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == dto.UserId);
            if (user == null)
                return BadRequest(new { message = "User doesn't exist" });

            if (knownSolution != null)
            {
                // TODO -> active after testing, and test this too
                //await _soS.RegisterUserSolution(formattedQuery, exercise, user, null);
                return Ok(new { message = "Well done, the output of this query is correct." });
            }

            string queryOutput = await _scS.ExecuteSelectOnSchemaAsync(exercise.Chapter.Schema.SchemaName, formattedQuery);

            // TODO -> If the query above fails, or the output doesn't match, a specific error should be returned here
            // TODO -> ask if teammember's function returns a specific error? SHould it be caught in the catch? Return the output regardless?
            if (exercise.QueryOutput != queryOutput)
            {
                // TODO -> active after testing, and test this too
                //await _soS.RegisterUserSolution(formattedQuery, exercise, user, "The output of this query doesn't match with the expected output.");
                return Ok(new { message = "The output of this query doesn't match with the expected output." });
            }

            //If correct, save solution
            Solution solution = new()
            {
                Query = queryOutput,
                QueryHash = queryHash,
                CreatedAt = DateTime.UtcNow,
                Exercise = exercise,
            };

            // TODO -> active after testing, and test this too
            //_db.Solutions.Add(solution);
            //await _db.SaveChangesAsync();

            // TODO -> remove solution from return?
            return Ok(new { message = "Well done, the output of this query is correct.", solution });
        }
        catch (PostgresException ex)
        {
            string code = ex.SqlState;
            string message = "Something went wrong.";

            switch (ex.SqlState)
            {
                case "22001":
                    message = "String too long.";
                    break;
                case "22003":
                    message = "Number too large/small.";
                    break;
                case "22P02":
                    message = "Incorrect type or format.";
                    break;
                case "23502":
                    message = "Violating a not null constraint.";
                    break;
                case "23503":
                    message = "Violating a foreign key constraint.";
                    break;
                case "23505":
                    message = "Violating a unique constraint.";
                    break;
                case "23514":
                    message = "Failing a check constraint.";
                    break;
                case "42501":
                    message = "Don't have permission to access this resource.";
                    break;
                case "42601":
                    message = "Use of invalid SQL syntax.";
                    break;
                case "42703":
                    message = "Use of a column that doesn't exist.";
                    break;
                case "42P01":
                    message = "Use of a table that doesn't exist.";
                    break;
            }

            return BadRequest(new { message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"CAUGHT: {ex.Message}" });
        }
    }

    [HttpPost("test-insert-update-delete")]
    public async Task<IActionResult> TestInsertUpdateDelete([FromBody] TempTestSolutionDTO dto)
    {
        try
        {
            Exercise? exercise = await _db.Exercises
                .Include(e => e.Solutions)
                .Include(e => e.Requirements)
                .Include(e => e.Chapter)
                .ThenInclude(c => c.Schema)
                .FirstOrDefaultAsync(e => e.ExerciseId == dto.ExerciseId);

            if (exercise == null)
                return BadRequest(new { message = "This exercise doesn't exist." });
            if (exercise.Chapter == null)
                return BadRequest(new { message = "This exercise is not part of a chapter." });
            if (exercise.Chapter.Schema == null)
                return BadRequest(new { message = "This exercise has no set schema." });

            string formattedQuery = _soS.FormatQuery(dto.Query);

            List<Requirement> requirements = [.. exercise.Requirements];
            var (Valid, Message) = _soS.CheckQueryRequirements(requirements, formattedQuery);
            if (!Valid)
                return BadRequest(new { message = Message });

            uint queryHash = await _soS.HashSolution(formattedQuery);

            Solution? knownSolution = exercise.Solutions.FirstOrDefault(s => s.QueryHash == queryHash);

            User? user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == dto.UserId);
            if (user == null)
                return BadRequest(new { message = "User doesn't exist" });

            if (knownSolution != null)
            {
                // TODO -> active after testing, and test this too
                //await _soS.RegisterUserSolution(formattedQuery, exercise, user, null);
                return Ok(new { message = "Well done, this query was correct!" });
            }

            if (exercise.ValidationQuery == null)
                return BadRequest(new { message = $"This {exercise.QueryAction} query cannot be validated." });

            string queryOutput = await _scS.ExecuteInsertUpdateDeleteOnSchemaAsync(exercise.Chapter.Schema.SchemaName, formattedQuery, exercise.ValidationQuery);

            // TODO -> If the query above fails, or the output doesn't match, a specific error should be returned here
            // TODO -> ask if teammember's function returns a specific error? SHould it be caught in the catch? Return the output regardless?
            if (exercise.QueryOutput != queryOutput)
            {
                // TODO -> active after testing, and test this too
                //await _soS.RegisterUserSolution(formattedQuery, exercise, user, "This is wrong, an error should be saved (work in progress)!");
                return Ok(new { message = "This is wrong, an error should be returned (work in progress)!" });
            }

            //If correct, save solution
            Solution solution = new()
            {
                Query = queryOutput,
                QueryHash = queryHash,
                CreatedAt = DateTime.UtcNow,
                Exercise = exercise,
            };

            // TODO -> active after testing, and test this too
            //_db.Solutions.Add(solution);
            //await _db.SaveChangesAsync();

            // TODO -> remove solution from return?
            return Ok(new { message = "Well done, this query was correct!", solution });
        }
        catch (PostgresException ex)
        {
            string code = ex.SqlState;
            string message = "Something went wrong.";

            switch (ex.SqlState)
            {
                case "22001":
                    message = "String too long.";
                    break;
                case "22003":
                    message = "Number too large/small.";
                    break;
                case "22P02":
                    message = "Incorrect type or format.";
                    break;
                case "23502":
                    message = "Violating a not null constraint.";
                    break;
                case "23503":
                    message = "Violating a foreign key constraint.";
                    break;
                case "23505":
                    message = "Violating a unique constraint.";
                    break;
                case "23514":
                    message = "Failing a check constraint.";
                    break;
                case "42501":
                    message = "Don't have permission to access this resource.";
                    break;
                case "42601":
                    message = "Use of invalid SQL syntax.";
                    break;
                case "42703":
                    message = "Use of a column that doesn't exist.";
                    break;
                case "42P01":
                    message = "Use of a table that doesn't exist.";
                    break;
            }

            return BadRequest(new { message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"CAUGHT: {ex.Message}" });
        }
    }
}