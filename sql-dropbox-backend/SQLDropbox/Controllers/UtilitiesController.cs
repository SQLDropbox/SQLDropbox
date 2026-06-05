using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Helpers;
using SQLDropbox.Models;
using SQLDropbox.Repositories;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class UtilitiesController(
       AppDbContext db, PasswordService passwordService, SolutionService solutionService, SchemaService schemaService) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly PasswordService _ps = passwordService;
    private readonly SolutionService _soS = solutionService;
    private readonly SchemaService _scS = schemaService;

    [Authorize(Roles = "Admin")]
    [HttpGet("seed-db")]
    public async Task<IActionResult> SeedTheDb()
    {
        try
        {
            await DbInitializer.SeedAsyncDev(_db, _ps);
            return Ok("DB seeded.");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("empty-db")]
    public async Task<IActionResult> EmptyTheDb()
    {
        try
        {
            await DbInitializer.EmptyAsync(_db);
            return Ok("DB emptied.");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("format")]
    public async Task<IActionResult> Format([FromBody] FormatDTO format)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (format.Query == null)
                return BadRequest("Query is required.");

            var formatted = _soS.FormatQuery(format.Query);
            return Ok(formatted);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("check")]
    public async Task<IActionResult> Check([FromBody] FormatDTO format)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            List<Requirement> requirements = [];
            Requirement r1 = new()
            {
                RequirementId = 1,
                Statement = "JOIN",
                IsBlacklist = false,
                IsHidden = false,
            };
            requirements.Add(r1);
            Requirement r2 = new()
            {
                RequirementId = 1,
                Statement = "GROUP BY",
                IsBlacklist = true,
                IsHidden = false,
            };
            requirements.Add(r2);

            var (Valid, Message) = _soS.CheckQueryRequirements(requirements, format.Query);
            return Ok($"{Valid}: {Message}");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        try
        {
            var result = AuthHelper.GetUserClaims(this);
            if (result.Result != null) return BadRequest(result.Result);
            return Ok(result.Value.ToString());
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
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
                    CreatedAt = DateTime.Now,
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
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("seed-exercise-create-helper")]
    public async Task<IActionResult> GetExerciseCreateData([FromBody] SolutionDTO dto)
    {
        try
        {
            var (formattedQuery, formatErrorMessage) = _soS.FormatQuery(dto.Query);
            if (formatErrorMessage != null)
                return BadRequest(new { message = $"Error occured formatting query: {formatErrorMessage}." });
            if (formattedQuery == null)
                return BadRequest(new { message = "Something went wrong while formatting the query." });

            uint queryHash = await _soS.HashSolution(formattedQuery);
            string queryOutput = await _scS.ExecuteSelectOnSchemaAsync("animals", formattedQuery);

            return Ok(new { query = formattedQuery, hash = queryHash, output = queryOutput });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}