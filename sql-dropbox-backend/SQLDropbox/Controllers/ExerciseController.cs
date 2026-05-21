using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class ExerciseController(AppDbContext db) : BaseController
{
    private readonly AppDbContext _db = db;

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
        
        return CreatedAtAction(nameof(CreateExercise), new {id = newExercise.ExerciseId},  newExercise);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetExerciseById(int id)
    {
        var exercise = await _db.Exercises.Include(e => e.Solutions).FirstOrDefaultAsync(e => e.ExerciseId == id && e.DeletedAt == null);

        if (exercise == null)
        {
            return NotFound(new { message = $"Exercise with ID {id} not found." });
        }
        return Ok(exercise);
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteExercise(int id)
    {
        var exercise = _db.Exercises.FirstOrDefault(x => x.ExerciseId == id);

        if (exercise == null)
        {
            return BadRequest("Exercise not found.");
        }
        exercise.DeletedAt = DateTime.Now;
        _db.SaveChanges();
        return Ok();
    }

    [HttpPut("{id}")]
    public ActionResult UpdateExercise(int id, [FromBody] ExerciseDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existing = _db.Exercises.Include(e => e.Solutions).FirstOrDefault(e => e.ExerciseId == id);
        
        if (existing == null)
            return NotFound();
        
        var chapter = _db.Chapters.Find(dto.ChapterId);

        if (chapter == null)
            return BadRequest("Chapter not found.");
        
        existing.Chapter = chapter;
        
        existing.QuestionNL = dto.QuestionNL;
        existing.QuestionEN = dto.QuestionEN;
        existing.HintNL = dto.HintNL;
        existing.HintEN = dto.HintEN;
        existing.QueryOutput = dto.QueryOutput;
        
        existing.UpdatedAt = DateTime.Now;
        
        _db.Solutions.RemoveRange(existing.Solutions);
        
        existing.Solutions = dto.SolutionQueries.Select(queryStr => new Solution
        {
            Query = queryStr,
            CreatedAt = DateTime.Now
        }).ToList();
        
        _db.SaveChanges();
        return Ok();
        
    }

}