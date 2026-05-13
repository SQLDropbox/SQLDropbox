using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class ExerciseController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public ExerciseController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllExercises()
    {
        var exercises = await _db.Exercises.Include(e => e.Solutions).Where(e => e.DeletedAt == null).ToListAsync();
        return Ok(exercises);
    }

    [HttpPost]
    public async Task<IActionResult> CreateExercise([FromBody] ExerciseDTO dto)
    {
        var chapter = await _db.Chapters.FirstOrDefaultAsync(c => c.ChapterId == dto.ChapterId && c.DeletedAt == null);
        
        if (chapter == null)
        {
            return BadRequest(new { message = $"Chapter with ID {dto.ChapterId} could not be found." });
        }

        var newExercise = new Exercise
        {
            QuestionNL = dto.QuestionNL,
            QuestionEN = dto.QuestionEN,
            HintNL = dto.HintNL,
            HintEN = dto.HintEN,
            QueryOutput = dto.QueryOutput,
            Chapter = chapter,
            CreatedAt = DateTime.Now,

            Solutions = dto.SolutionQueries.Select(query => new Solution
            {
                Query = query,
                CreatedAt = DateTime.Now
            }).ToList()
        };
        await _db.Exercises.AddAsync(newExercise);
        await _db.SaveChangesAsync();
        
        return CreatedAtAction(nameof(CreateExercise), new {id = newExercise.ExerciseId});
    }
        
}