using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
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
                .Include(e => e.Solutions.Where(s => s.DeletedAt == null))
                .Include(e => e.Requirements.Where(r => r.DeletedAt == null))
                .Include(e => e.Chapter)
                .ThenInclude(c => c.Schema)
                .FirstOrDefaultAsync(e => e.DeletedAt == null && e.ExerciseId == dto.ExerciseId);

            if (exercise == null)
                return BadRequest(new { message = "This exercise doesn't exist." });
            if (exercise.Chapter == null)
                return BadRequest(new { message = "This exercise is not part of a chapter." });
            if (exercise.Chapter.Schema == null)
                return BadRequest(new { message = "This exercise has no set schema." });

            string formattedQuery = _soS.FormatQuery(dto.Query);

            //Check if requirements are met
            List<Requirement> requirements = [.. exercise.Requirements];
            var (Valid, Message) = _soS.CheckQueryRequirements(requirements, formattedQuery);
            if (!Valid)
                return BadRequest(new { message = Message });

            //Hash the query if requirements are met
            uint queryHash = await _soS.HashSolution(formattedQuery);

            //Check if solution exists based on hash
            Solution? knownSolution = exercise.Solutions.FirstOrDefault(s => s.DeletedAt == null && s.QueryHash == queryHash);

            //Get user, since from this point solution will be added to history regardless.
            User? user = await _db.Users.FirstOrDefaultAsync(u => u.DeletedAt == null && u.UserId == userId);
            if (user == null)
                return BadRequest(new { message = "User doesn't exist" });

            //If exist save and return correct
            if (knownSolution != null)
            {
                await _soS.RegisterUserSolution(formattedQuery, exercise, user, null);
                return Ok(new { message = "Well done, this query was correct!" });
            }

            //If not check if correct
            string queryOutput = await _scS.ExecuteSelectOnSchemaAsync(exercise.Chapter.Schema.SchemaName, formattedQuery);

            // TODO -> If the query above fails, or the output doesn't match, a specific error should be returned here
            // TODO -> ask if teammember's function returns a specific error? SHould it be caught in the catch? Return the output regardless?
            if (exercise.QueryOutput != queryOutput)
            {
                await _soS.RegisterUserSolution(formattedQuery, exercise, user, "This is wrong, an error should be saved (work in progress)!");
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

            _db.Solutions.Add(solution);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Well done, this query was correct!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
