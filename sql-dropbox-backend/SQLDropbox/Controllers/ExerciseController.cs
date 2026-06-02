using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Enums;
using SQLDropbox.Models;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class ExerciseController(AppDbContext db, SolutionService solutionService, SchemaService schemaService) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly SolutionService _soS = solutionService;
    private readonly SchemaService _scS = schemaService;

    [HttpGet]
    public async Task<IActionResult> GetAllExercises()
    {
        var exercises = await _db.Exercises
            .Include(e => e.Solutions.OrderBy(s => s.SolutionId).FirstOrDefault())
            .ToListAsync();
        return Ok(exercises);
    }

    [HttpPost]
    public async Task<IActionResult> CreateExercise([FromBody] ExerciseDTO dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Enum.IsDefined(typeof(QueryAction), dto.QueryAction))
                return BadRequest(new { message = "Query action has to be an allowed value" });

            QueryAction queryAction = (QueryAction)dto.QueryAction;

            Chapter? chapter = await _db.Chapters
                .Include(c => c.Schema)
                .FirstOrDefaultAsync(c => c.ChapterId == dto.ChapterId);

            if (chapter == null)
                return BadRequest(new { message = $"Chapter with ID {dto.ChapterId} could not be found." });

            string formattedQuery = _soS.FormatQuery(dto.SolutionQuery);
            uint queryHash = await _soS.HashSolution(formattedQuery);

            //If this returns an error, that error should be shown
            string queryOutput = await _scS.ExecuteSelectOnSchemaAsync(chapter.Schema.SchemaName, formattedQuery);

            var newExercise = new Exercise
            {
                QuestionNL = dto.QuestionNL,
                QuestionEN = dto.QuestionEN,
                HintNL = dto.HintNL,
                HintEN = dto.HintEN,
                QueryOutput = queryOutput,
                QueryAction = queryAction,
                Chapter = chapter,
                CreatedAt = DateTime.UtcNow,

                Solutions = [
                    new Solution
                    {
                        Query = formattedQuery,
                        QueryHash = queryHash,
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
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetExerciseById(int id)
    {
        var exercise = await _db.Exercises.Include(e => e.Solutions).FirstOrDefaultAsync(e => e.ExerciseId == id);

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
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Exercise? exercise = await _db.Exercises
                .Include(e => e.Chapter)
                .ThenInclude(c => c.Schema)
                .Include(e => e.Solutions)
                .FirstOrDefaultAsync(e => e.ExerciseId == id);

            if (exercise == null) return BadRequest(new { message = "Exercise not found." });
            if (dto.QuestionNL != null) exercise.QuestionNL = dto.QuestionNL;
            if (dto.QuestionEN != null) exercise.QuestionEN = dto.QuestionEN;
            if (dto.HintNL != null) exercise.HintNL = dto.HintNL;
            if (dto.HintEN != null) exercise.HintEN = dto.HintEN;

            if (dto.QueryAction != null)
            {
                if (!Enum.IsDefined(typeof(QueryAction), dto.QueryAction))
                    return BadRequest(new { message = "Query action has to be an allowed value" });

                exercise.QueryAction = (QueryAction)dto.QueryAction;

                if (exercise.QueryAction != QueryAction.Select && dto.ValidationQuery == null)
                    return BadRequest(new { message = "If query type is different from select, a validation query is required" });
            }

            if (dto.SolutionQuery != null)
            {
                _db.Solutions.RemoveRange(exercise.Solutions);

                string formattedQuery = _soS.FormatQuery(dto.SolutionQuery);
                uint queryHash = await _soS.HashSolution(formattedQuery);

                if (exercise.QueryAction == QueryAction.Select)
                {
                    //If this returns an error, that error should be shown
                    string queryOutput = await _scS.ExecuteSelectOnSchemaAsync(exercise.Chapter.Schema.SchemaName, formattedQuery);
                    exercise.QueryOutput = queryOutput;
                }

                exercise.Solutions =
                [
                    new Solution
                {
                    Query = formattedQuery,
                    QueryHash = queryHash,
                    CreatedAt = DateTime.UtcNow
                }
                ];
            }

            if (exercise.QueryAction != QueryAction.Select && dto.ValidationQuery != null)
            {
                string formattedQuery = _soS.FormatQuery(dto.ValidationQuery);
                string queryOutput = await _scS.ExecuteSelectOnSchemaAsync(exercise.Chapter.Schema.SchemaName, formattedQuery);
                exercise.ValidationQuery = formattedQuery;
                exercise.QueryOutput = queryOutput;
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