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
public class SolutionController(AppDbContext db, SolutionService solutionService, SchemaService schemaService) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly SolutionService _soS = solutionService;
    private readonly SchemaService _scS = schemaService;

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
            if (exercise.UserExercises.Any(ue => ue.IsCompleted))
                return BadRequest(new { message = "You have already solved this exercise." });

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

            if (exercise.QueryAction != QueryAction.Select)
                return BadRequest(new { message = "The solution must be a select query." });

            string queryOutput = await _scS.ExecuteSelectOnSchemaAsync(exercise.Chapter.Schema.SchemaName, formattedQuery);

            // TODO -> If the query above fails, or the output doesn't match, a specific error should be returned here
            // TODO -> ask if teammember's function returns a specific error? SHould it be caught in the catch? Return the output regardless?
            if (exercise.QueryOutput != queryOutput)
            {
                await _soS.RegisterUserSolution(formattedQuery, exercise, user, "Your query's result is incorrect.");
                return Ok(new { message = "Your query's result is incorrect.", queryResult = queryOutput });
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

    //[Authorize]
    //[HttpPost("submit")]
    //public async Task<ActionResult> SubmitNonSelectSolution([FromBody] SolutionDTO dto)
    //{
    //    try
    //    {
    //        var userId = GetUserId();
    //        if (userId == null) return Unauthorized();

    //        if (!ModelState.IsValid)
    //            return BadRequest(ModelState);

    //        Exercise? exercise = await _db.Exercises
    //            .Include(e => e.Solutions)
    //            .Include(e => e.Requirements)
    //            .Include(e => e.Chapter)
    //            .ThenInclude(c => c.Schema)
    //            .FirstOrDefaultAsync(e => e.ExerciseId == dto.ExerciseId);

    //        if (exercise == null)
    //            return BadRequest(new { message = "This exercise doesn't exist." });
    //        if (exercise.Chapter == null)
    //            return BadRequest(new { message = "This exercise is not part of a chapter." });
    //        if (exercise.Chapter.Schema == null)
    //            return BadRequest(new { message = "This exercise has no set schema." });

    //        string formattedQuery = _soS.FormatQuery(dto.Query);

    //        List<Requirement> requirements = [.. exercise.Requirements];
    //        var (Valid, Message) = _soS.CheckQueryRequirements(requirements, formattedQuery);
    //        if (!Valid)
    //            return BadRequest(new { message = Message });

    //        uint queryHash = await _soS.HashSolution(formattedQuery);

    //        Solution? knownSolution = exercise.Solutions.FirstOrDefault(s => s.QueryHash == queryHash);

    //        User? user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
    //        if (user == null)
    //            return BadRequest(new { message = "User doesn't exist" });

    //        if (knownSolution != null)
    //        {
    //            await _soS.RegisterUserSolution(formattedQuery, exercise, user, null);
    //            return Ok(new { message = "Well done, this query was correct!" });
    //        }

    //        if (exercise.ValidationQuery == null)
    //            return BadRequest(new { message = $"This {exercise.QueryAction} query cannot be validated." });

    //        string queryOutput = await _scS.ExecuteInsertUpdateDeleteOnSchemaAsync(exercise.Chapter.Schema.SchemaName, formattedQuery, exercise.ValidationQuery);

    //        // TODO -> If the query above fails, or the output doesn't match, a specific error should be returned here
    //        // TODO -> ask if teammember's function returns a specific error? SHould it be caught in the catch? Return the output regardless?
    //        if (exercise.QueryOutput != queryOutput)
    //        {
    //            await _soS.RegisterUserSolution(formattedQuery, exercise, user, "This is wrong, an error should be saved (work in progress)!");
    //            return Ok(new { message = "This is wrong, an error should be returned (work in progress)!", queryResult = queryOutput });
    //        }
    //        else
    //        {
    //            await _soS.RegisterUserSolution(formattedQuery, exercise, user, null);
    //        }

    //        //If correct, save solution
    //        Solution solution = new()
    //        {
    //            Query = queryOutput,
    //            QueryHash = queryHash,
    //            CreatedAt = DateTime.Now,
    //            Exercise = exercise,
    //        };

    //        _db.Solutions.Add(solution);
    //        await _db.SaveChangesAsync();

    //        return Ok(new { message = "Well done, this query was correct!" });
    //    }
    //    catch (PostgresException ex)
    //    {
    //        //string code = ex.SqlState;
    //        //string message = "Something went wrong.";

    //        //switch (ex.SqlState)
    //        //{
    //        //    case "22001":
    //        //        message = "String too long.";
    //        //        break;
    //        //    case "22003":
    //        //        message = "Number too large/small.";
    //        //        break;
    //        //    case "22P02":
    //        //        message = "Incorrect type or format.";
    //        //        break;
    //        //    case "23502":
    //        //        message = "Violating a not null constraint.";
    //        //        break;
    //        //    case "23503":
    //        //        message = "Violating a foreign key constraint.";
    //        //        break;
    //        //    case "23505":
    //        //        message = "Violating a unique constraint.";
    //        //        break;
    //        //    case "23514":
    //        //        message = "Failing a check constraint.";
    //        //        break;
    //        //    case "42501":
    //        //        message = "Don't have permission to access this resource.";
    //        //        break;
    //        //    case "42601":
    //        //        message = "Use of invalid SQL syntax.";
    //        //        break;
    //        //    case "42703":
    //        //        message = "Use of a column that doesn't exist.";
    //        //        break;
    //        //    case "42P01":
    //        //        message = "Use of a table that doesn't exist.";
    //        //        break;
    //        //}

    //        return BadRequest(new { message = ex.Message });
    //    }
    //    catch
    //    {
    //        return BadRequest(new { message = "An error occured." });
    //    }
    //}
}
