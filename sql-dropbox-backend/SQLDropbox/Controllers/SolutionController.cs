using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Enums;
using SQLDropbox.Models;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class SolutionController(AppDbContext db, SolutionService solutionService, SchemaService schemaService) : BaseController(db)
{
    private readonly AppDbContext _db = db;
    private readonly SolutionService _soS = solutionService;
    private readonly SchemaService _scS = schemaService;

    private string GetResultMismatchMessage(string expected, string actual){
        if (string.IsNullOrWhiteSpace(actual))  return "Your query returned no results.";
        if (string.IsNullOrWhiteSpace(expected)) return "Your query returned data when no data was expected.";

        return "Your query executed successfully, but the result does not match the expected output.";
    }

    [Authorize]
    [HttpPost("submit/select")]
    public async Task<ActionResult> SubmitSelectSolution([FromBody] SolutionDTO dto)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Exercise? exercise = await _db.Exercises
                .Include(e => e.Chapter)
                .ThenInclude(c => c.Schema)
                .Include(e => e.Requirements)
                .Include(e => e.Solutions)
                .Include(e => e.UserExercises.Where(ue => ue.User.UserId == userId))
                .FirstOrDefaultAsync(e => e.ExerciseId == dto.ExerciseId);

            if (exercise == null)
                return NotFound(new { message = "Exercise not found." });
            if (exercise.Chapter == null)
                return BadRequest(new { message = "This exercise is not part of a chapter." });
            if (exercise.Chapter.Schema == null)
                return BadRequest(new { message = "The chapter this exercise is part of has no set schema." });
            if (exercise.Solutions.Count < 1)
                return BadRequest(new { message = "The exercise has no set solution." });

            User? user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return BadRequest(new { message = "User doesn't exist" });

            var (formattedQuery, formatErrorMessage) = _soS.FormatQuery(dto.Query);

            if (formatErrorMessage != null)
            {
                await _soS.RegisterUserSolution(dto.Query, exercise, user, formatErrorMessage);
                return Ok(new { message = formatErrorMessage });
            }
            if (formattedQuery == null)
                return BadRequest(new { message = "Something went wrong while formatting the query." });

            List<Requirement> requirements = [.. exercise.Requirements];
            var (valid, checkRequirementsMessage) = _soS.CheckQueryRequirements(requirements, formattedQuery);
            if (!valid)
            {
                await _soS.RegisterUserSolution(formattedQuery, exercise, user, checkRequirementsMessage);
                return BadRequest(new { message = checkRequirementsMessage });
            }

            uint queryHash = await _soS.HashSolution(formattedQuery);

            Solution? knownSolution = exercise.Solutions.FirstOrDefault(s => s.QueryHash == queryHash);

            if (knownSolution != null)
            {
                await _soS.RegisterUserSolution(formattedQuery, exercise, user, null);
                return Ok(new { message = "Well done, this query was correct!" });
            }

            string queryOutput;

            if (exercise.QueryAction == QueryAction.Select)
            {
                queryOutput = await _scS.ExecuteSelectOnSchemaAsync(
                    exercise.Chapter.Schema.SchemaName,
                    formattedQuery);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(exercise.ValidationQuery))
                {
                    return BadRequest(new
                    {
                        message = "No validation query configured for this exercise."
                    });
                }

                queryOutput = await _scS.ExecuteInsertUpdateDeleteOnSchemaAsync(
                    exercise.Chapter.Schema.SchemaName,
                    formattedQuery,
                    exercise.ValidationQuery);
            }

            if (exercise.QueryOutput != queryOutput)
            {
                string errorMessage = GetResultMismatchMessage(exercise.QueryOutput ?? "", queryOutput ?? "");

                await _soS.RegisterUserSolution(
                    formattedQuery,
                    exercise,
                    user,
                    errorMessage);

                return Ok(new
                {
                    message = errorMessage,
                    queryResult = queryOutput
                });
            }
            else
            {
                await _soS.RegisterUserSolution(formattedQuery, exercise, user, null);
            }

            //If correct, save solution
            Solution solution = new()
            {
                Query = queryOutput,
                QueryHash = queryHash,
                CreatedAt = DateTime.Now,
                Exercise = exercise,
            };

            _db.Solutions.Add(solution);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Well done, this query was correct!" });
        }
        catch (PostgresException ex)
        {
            //string code = ex.SqlState;
            //string message = "Something went wrong.";

            //switch (ex.SqlState)
            //{
            //    case "22001":
            //        message = "String too long.";
            //        break;
            //    case "22003":
            //        message = "Number too large/small.";
            //        break;
            //    case "22P02":
            //        message = "Incorrect type or format.";
            //        break;
            //    case "23502":
            //        message = "Violating a not null constraint.";
            //        break;
            //    case "23503":
            //        message = "Violating a foreign key constraint.";
            //        break;
            //    case "23505":
            //        message = "Violating a unique constraint.";
            //        break;
            //    case "23514":
            //        message = "Failing a check constraint.";
            //        break;
            //    case "42501":
            //        message = "Don't have permission to access this resource.";
            //        break;
            //    case "42601":
            //        message = "Use of invalid SQL syntax.";
            //        break;
            //    case "42703":
            //        message = "Use of a column that doesn't exist.";
            //        break;
            //    case "42P01":
            //        message = "Use of a table that doesn't exist.";
            //        break;
            //}

            return BadRequest(new { message = ex.Message });
        }
        catch
        {
            return BadRequest(new { message = "An error occured." });
        }
    }
}
