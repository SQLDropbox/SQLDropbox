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
            Chapter? chapter = await _db.Chapters
                .Include(c => c.Schema)
                .FirstOrDefaultAsync(c => c.DeletedAt == null && c.ChapterId == dto.ChapterId);

            if (chapter == null)
                return BadRequest(new { message = $"Chapter with ID {dto.ChapterId} could not be found." });

            var (FormattedQuery, Base64QueryOutput, QueryHash) = await _soS.CleanData(dto.SolutionQuery, chapter.Schema.SchemaName);

            var newExercise = new Exercise
            {
                QuestionNL = dto.QuestionNL,
                QuestionEN = dto.QuestionEN,
                HintNL = dto.HintNL,
                HintEN = dto.HintEN,
                QueryOutput = Base64QueryOutput,
                Chapter = chapter,
                CreatedAt = DateTime.UtcNow,

                Solutions = [
                    new Solution
                    {
                        Query = FormattedQuery,
                        QueryHash = QueryHash,
                        CreatedAt = DateTime.UtcNow
                    }
                ]
            };

            await _db.Exercises.AddAsync(newExercise);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(CreateExercise), new { id = newExercise.ExerciseId }, newExercise);
        }
        catch (Exception ex)
        {
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
            return BadRequest(new { message = "Exercise not found." });
        }
        exercise.DeletedAt = DateTime.UtcNow;
        _db.SaveChanges();
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExercise(int id, [FromBody] ExerciseUpdateDTO dto)
    {
        try
        {
            Exercise? exercise = await _db.Exercises
                .Include(e => e.Chapter)
                .ThenInclude(c => c.Schema)
                .Include(e => e.Solutions)
                .FirstOrDefaultAsync(e => e.DeletedAt == null && e.ExerciseId == id);

            if (exercise == null) return BadRequest(new { message = "Exercise not found." });
            if (dto.QuestionNL != null) exercise.QuestionNL = dto.QuestionNL;
            if (dto.QuestionEN != null) exercise.QuestionEN = dto.QuestionEN;
            if (dto.HintNL != null) exercise.HintNL = dto.HintNL;
            if (dto.HintEN != null) exercise.HintEN = dto.HintEN;

            if (dto.SolutionQuery != null)
            {
                _db.Solutions.RemoveRange(exercise.Solutions);

                var (FormattedQuery, QueryOutput, QueryHash) =
                    await _soS.CleanData(dto.SolutionQuery, exercise.Chapter.Schema.SchemaName);

                exercise.QueryOutput = QueryOutput;

                exercise.Solutions =
                [
                    new Solution
                {
                    Query = FormattedQuery,
                    QueryHash = QueryHash,
                    CreatedAt = DateTime.UtcNow
                }
                ];
            }

            exercise.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(exercise);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}