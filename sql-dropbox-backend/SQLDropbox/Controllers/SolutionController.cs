using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;
using SQLDropbox.Services;
using Watchlist_Backend.DTOs;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class SolutionController(AppDbContext db, SolutionService soS) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly SolutionService _soS = soS;

    [HttpPost("setup")]
    public async Task<ActionResult> SubmitSolution(SolutionDTO dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Exercise? exercise = await _db.Exercises
                .Include(e => e.Chapter)
                .ThenInclude(c => c.Schema)
                .FirstOrDefaultAsync(e => e.DeletedAt == null && e.ExerciseId == dto.ExerciseId);
            
            if (exercise == null)
                return BadRequest("This exercise doesn't exist.");
            if (exercise.Chapter == null)
                return BadRequest("This exercise is not part of a chapter.");
            if (exercise.Chapter.Schema == null)
                return BadRequest("This exercise has no set schema.");

            var (FormattedQuery, Base64QueryOutput, QueryHash) = await _soS.CleanData(dto.Query, exercise.Chapter.Schema.SchemaName);

            Solution solution = new()
            {
                Query = Base64QueryOutput,
                QueryHash = QueryHash,
                CreatedAt = DateTime.UtcNow,
                Exercise = exercise,
            };

            _db.Solutions.Add(solution);
            await _db.SaveChangesAsync();

            return Ok("Well done, this query was correct!");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
