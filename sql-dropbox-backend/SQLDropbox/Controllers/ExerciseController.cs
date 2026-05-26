using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class ExerciseController(AppDbContext db, SolutionService soS) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly SolutionService _soS = soS;

    [HttpGet]
    public async Task<IActionResult> GetAllExercises()
    {
        var exercises = await _db.Exercises.Include(e => e.Solutions).Where(e => e.DeletedAt == null).ToListAsync();
        return Ok(exercises);
    }

    [HttpPost]
    public async Task<IActionResult> CreateExercise([FromBody] ExerciseDTO dto)
    {
        try
        {
            var chapter = await _db.Chapters
                .Include(c => c.Schema)
                .FirstOrDefaultAsync(c => c.DeletedAt == null && c.ChapterId == dto.ChapterId);

            if (chapter == null)
            {
                return BadRequest(new { message = $"Chapter with ID {dto.ChapterId} could not be found." });
            }

            var (FormattedQuery, Base64QueryOutput, QueryHash) = await _soS.CleanData(dto.SolutionQuery, chapter.Schema.SchemaName);

            var newExercise = new Exercise
            {
                QuestionNL = dto.QuestionNL,
                QuestionEN = dto.QuestionEN,
                HintNL = dto.HintNL,
                HintEN = dto.HintEN,     
                QueryOutput = Base64QueryOutput,
                Chapter = chapter,
                CreatedAt = DateTime.Now,

                Solutions = [
                    new Solution
                    {
                        Query = FormattedQuery,
                        QueryHash = QueryHash,
                        CreatedAt = DateTime.Now
                    }
                ]
            };

            await _db.Exercises.AddAsync(newExercise);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(CreateExercise), new { id = newExercise.ExerciseId }, newExercise);
        }
        catch(Exception ex){
            return BadRequest(ex);
        }
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
    public async Task<IActionResult> UpdateExercise(int id, [FromBody] ExerciseDTO dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _db.Exercises
                .Include(e => e.Solutions)
                .FirstOrDefaultAsync(e => e.DeletedAt == null && e.ExerciseId == id);

            if (existing == null)
                return BadRequest("Exercise not found.");

            var chapter = await _db.Chapters
                .FirstOrDefaultAsync(c => c.DeletedAt == null && c.ChapterId == dto.ChapterId);

            if (chapter == null)
                return BadRequest("Chapter not found.");   

            //validate
            existing.Chapter = chapter;
            existing.QuestionNL = dto.QuestionNL;
            existing.QuestionEN = dto.QuestionEN;
            existing.HintNL = dto.HintNL;
            existing.HintEN = dto.HintEN;

            var (FormattedQuery, Base64QueryOutput, QueryHash) = await _soS.CleanData(dto.SolutionQuery, chapter.Schema.SchemaName);
            existing.QueryOutput = Base64QueryOutput;

            existing.UpdatedAt = DateTime.Now;

            _db.Solutions.RemoveRange(existing.Solutions);

            existing.Solutions = [
                new Solution
                    {
                        Query = FormattedQuery,
                        QueryHash = QueryHash,
                        CreatedAt = DateTime.Now
                    }
            ];

            _db.SaveChanges();
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

}