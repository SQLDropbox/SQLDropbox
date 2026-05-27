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
    [HttpPost("submit")]
    public async Task<ActionResult> SubmitSolution(SolutionDTO dto)
    {
        try
        {
            var id = GetUserId();
            if (id == null) return Unauthorized();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Exercise? exercise = await _db.Exercises
                .Include(e => e.Solutions)
                .Include(e => e.Requirements)
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

            uint queryHash = await _soS.HashSolution(formattedQuery);

            //Check if solution exists
            Solution? knownSolution = exercise.Solutions.FirstOrDefault(s => s.QueryHash == queryHash);

            //If exist return correct
            if (knownSolution != null)
                return Ok(new { message = "Well done, this query was correct!" });

            //Save solution for user
            await _soS.CreateUserExerciseAndSolutionBasedIfWrongOrRight(formattedQuery, exercise, user);

            //If not check if correct
            string queryOutput = await _scS.ExecuteSelectOnSchemaAsync(exercise.Chapter.Schema.SchemaName, formattedQuery);         
            
            //If not return error
            //A specific error should be returned here
            if(exercise.QueryOutput != queryOutput)
                return BadRequest(new { message = "This is wrong, an error should be returnd (work in progress)!" });

            //If yes save solution
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
