using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class RequirementController(AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

    [HttpGet("exercise/{exerciseIdStr}")]
    public async Task<ActionResult> GetRequirementsForExercise(string exerciseIdStr)
    {
        try
        {
            if (!int.TryParse(exerciseIdStr, out int exerciseId))
                return BadRequest("Not a valid exercise ID.");

            Exercise? exercise = await _db.Exercises
                .Include(e => e.Requirements)
                .FirstOrDefaultAsync(e => e.ExerciseId == exerciseId);

            if (exercise == null)
                return NotFound(new { message = $"No exercise with ID {exerciseId} found." });

            List<Requirement> requirements = [.. exercise.Requirements];
            return Ok(requirements);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("create")]
    public async Task<ActionResult> CreateRequirementForExercise([FromBody] RequirementDTO dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Statement == null || dto.ExerciseId == null)
                return BadRequest(new { message = "To add a requirement, a statement and exercise ID are needed." });

            Exercise? exercise = await _db.Exercises
                .Include(e => e.Requirements)
                .FirstOrDefaultAsync(e => e.ExerciseId == dto.ExerciseId);

            if (exercise == null)
                return NotFound(new { message = $"No exercise with ID {dto.ExerciseId} found." });

            if (exercise.Requirements.Any(r => r.Statement == dto.Statement))
                return BadRequest(new { message = $"A requirement with statement {dto.Statement} already exists for this exercise." });

            Requirement requirement = new()
            {
                Statement = dto.Statement,
                Use = dto.Use,
                Exercise = exercise
            };

            _db.Requirements.Add(requirement);
            await _db.SaveChangesAsync();

            return Ok(new { message = "New requirement added."});
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("update/{requirementIdStr}")]
    public async Task<ActionResult> UpdateRequirementForExercise(string requirementIdStr, [FromBody] RequirementDTO dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);           

            if (!int.TryParse(requirementIdStr, out int requirementId))
                return BadRequest("Not a valid requirement ID.");

            Requirement? requirement = await _db.Requirements
                .FirstOrDefaultAsync(r => r.RequirementId == requirementId);

            if (requirement == null)
                return NotFound(new { message = $"No requirement with ID {requirementId} found." });

            if (dto.Statement == null && requirement.Use == dto.Use)
                return BadRequest(new { message = "To update a requirement, the statement or use should be different from exisiting values." });

            if (dto.Statement != null) requirement.Statement = dto.Statement;
            if (requirement.Use != dto.Use) requirement.Use = dto.Use;

            _db.Requirements.Update(requirement);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Requirement updated." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("delete/{requirementIdStr}")]
    public async Task<ActionResult> DeleteRequirementForExercise(string requirementIdStr)
    {
        try
        {            
            if (!int.TryParse(requirementIdStr, out int requirementId))
                return BadRequest("Not a valid requirement ID.");

            Requirement? requirement = await _db.Requirements
                .FirstOrDefaultAsync(r => r.RequirementId == requirementId);

            if (requirement == null)
                return NotFound(new { message = $"No requirement with ID {requirementId} found." });

           requirement.DeletedAt = DateTime.UtcNow;

            _db.Requirements.Update(requirement);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Requirement deleted." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
