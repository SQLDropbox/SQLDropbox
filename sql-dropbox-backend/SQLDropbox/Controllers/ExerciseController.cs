using Microsoft.AspNetCore.Authorization;
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
public class ExerciseController(AppDbContext db, SolutionService solutionService, SchemaService schemaService) : BaseController(db)
{
    private readonly AppDbContext _db = db;
    private readonly SolutionService _soS = solutionService;
    private readonly SchemaService _scS = schemaService;

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAllExercises()
    {
        List<Exercise> exercises = await _db.Exercises
            .Include(e => e.Solutions.OrderBy(s => s.SolutionId).FirstOrDefault())
            .ToListAsync();
        return Ok(exercises);
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPost]
    public async Task<IActionResult> CreateExercise([FromBody] ExerciseDTO dto)
    {
        try
        {
            await UserHasAccessToChapter(dto.ChapterId);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Enum.IsDefined(typeof(QueryAction), dto.QueryAction))
                return BadRequest(new { message = "Query action has to be an allowed value" });
            QueryAction queryAction = (QueryAction)dto.QueryAction;

            Chapter? chapter = await _db.Chapters
                .Include(c => c.Schema)
                .FirstOrDefaultAsync(c => c.ChapterId == dto.ChapterId);

            if (chapter == null)
                return BadRequest(new { message = "Chapter not be found." });

            var (formattedQuery, formatErrorMessage) = _soS.FormatQuery(dto.SolutionQuery);
            if (formatErrorMessage != null)
                return BadRequest(new { message = $"Error occured formatting query: {formatErrorMessage}." });
            if (formattedQuery == null)
                return BadRequest(new { message = "Something went wrong while formatting the query." });

            string queryOutput = "";

            if (queryAction == QueryAction.Select)
            {
                //If this returns an error, that error should be shown
                queryOutput = await _scS.ExecuteSelectOnSchemaAsync(chapter.Schema.SchemaName, formattedQuery);
            }

            string? formattedValidationQuery = null;

            if (queryAction == QueryAction.Manipulation && dto.ValidationQuery != null)
            {
                var (fVQ, fEM) = _soS.FormatQuery(dto.ValidationQuery);
                if (formatErrorMessage != null)
                    return BadRequest(new { message = $"Error occured formatting validation query: {fEM}." });
                if (fVQ == null)
                    return BadRequest(new { message = "Something went wrong while formatting the validation query." });

                formattedValidationQuery = fVQ;
                queryOutput = await _scS.ExecuteInsertUpdateDeleteOnSchemaAsync(chapter.Schema.SchemaName, formattedQuery, formattedValidationQuery);
            }

            if (queryAction == QueryAction.Manipulation && dto.ValidationQuery == null)
            {
                return BadRequest(new { message = "In case of manipulation, a validation query is required." });
            }

            uint queryHash = await _soS.HashSolution(formattedQuery);

            var exercise = new Exercise
            {
                QuestionNL = dto.QuestionNL,
                QuestionEN = dto.QuestionEN,
                HintNL = dto.HintNL,
                HintEN = dto.HintEN,
                QueryOutput = queryOutput,
                QueryAction = queryAction,
                ValidationQuery = formattedValidationQuery,
                Chapter = chapter,
                CreatedAt = DateTime.Now,

                Solutions = [
                    new Solution
                    {
                        Query = formattedQuery,
                        QueryHash = queryHash,
                        CreatedAt = DateTime.Now
                    }
                ],

                Requirements = [.. dto.Requirements.Select(r => new Requirement
                    {
                        Statement = r.Statement,
                        IsBlacklist = r.IsBlacklist,
                        IsHidden = r.IsHidden,
                    })
                ]
            };

            await _db.Exercises.AddAsync(exercise);
            await _db.SaveChangesAsync();

            return Ok(new { id = exercise.ExerciseId, exercise });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetExerciseById(int id)
    {
        try
        {
            await UserHasAccessToExercise(id);

            var exercise = await _db.Exercises
            .Include(e => e.Solutions)
            .Include(e => e.Requirements.Where(r => !r.IsHidden))
            .FirstOrDefaultAsync(e => e.ExerciseId == id);

            if (exercise == null)
                return NotFound(new { message = "Exercise not found." });

            return Ok(exercise);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExercise(int id)
    {
        try
        {
            await UserHasAccessToExercise(id);

            var exercise = _db.Exercises.FirstOrDefault(x => x.ExerciseId == id);

            if (exercise == null)
            {
                return BadRequest(new { message = "Exercise not found." });
            }
            exercise.DeletedAt = DateTime.Now;
            _db.SaveChanges();
            return Ok();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExercise(int id, [FromBody] ExerciseUpdateDTO dto)
    {
        try
        {
            await UserHasAccessToExercise(id);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Exercise? exercise = await _db.Exercises
                .Include(e => e.Chapter)
                .ThenInclude(c => c.Schema)
                .Include(e => e.Solutions)
                .Include(e => e.Requirements)
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

                var (formattedQuery, formatErrorMessage) = _soS.FormatQuery(dto.SolutionQuery);
                if (formatErrorMessage != null)
                    return BadRequest(new { message = $"Error occured formatting query: {formatErrorMessage}." });
                if (formattedQuery == null)
                    return BadRequest(new { message = "Something went wrong while formatting the query." });

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
                    CreatedAt = DateTime.Now
                }
                ];
            }

            _db.Requirements.RemoveRange(exercise.Requirements);

            if (dto.Requirements != null)
            {
                foreach (var r in dto.Requirements)
                {
                    exercise.Requirements.Add(new Requirement
                    {
                        Statement = r.Statement,
                        IsBlacklist = r.IsBlacklist,
                        IsHidden = r.IsHidden
                    });
                }
            }

            if (exercise.QueryAction != QueryAction.Select && dto.ValidationQuery != null)
            {
                var (formattedQuery, formatErrorMessage) = _soS.FormatQuery(dto.ValidationQuery);
                if (formatErrorMessage != null)
                    return BadRequest(new { message = $"Error occured formatting validation query: {formatErrorMessage}." });
                if (formattedQuery == null)
                    return BadRequest(new { message = "Something went wrong while formatting the validation query." });

                string queryOutput = await _scS.ExecuteSelectOnSchemaAsync(exercise.Chapter.Schema.SchemaName, formattedQuery);
                exercise.ValidationQuery = formattedQuery;
                exercise.QueryOutput = queryOutput;
            }

            exercise.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();

            return Ok(exercise);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}