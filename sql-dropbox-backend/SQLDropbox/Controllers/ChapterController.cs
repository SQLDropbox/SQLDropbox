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
public class ChapterController(AppDbContext db, IConfiguration config) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly IConfiguration _config = config;
    private string BaseUrl => $"{Request.Scheme}://{Request.Host}";

    [HttpGet]
    public ActionResult GetChapters()
    {
        var chapters = _db.Chapters.Where(x => x.DeletedAt == null)
            .OrderBy(x => x.Order)
            .Select(x => new
            {
                x.ChapterId,
                x.ChapterNameNL,
                x.ChapterNameEN,
                x.ChapterDescriptionNL,
                x.ChapterDescriptionEN,
                x.AmountOfExercises,
                x.Order,
                x.Schema.SchemaId,
                x.Schema.SchemaName,
                x.Course.CourseId,
                SchemaImage = string.IsNullOrEmpty(x.Schema.SchemaImage) ? null : $"{BaseUrl}/schema-images/{x.Schema.SchemaImage}",
            }).ToList();
        return Ok(chapters);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetChapterByChapterId(int id)
    {
        var chapter = await _db.Chapters.Where(x => x.DeletedAt == null && x.ChapterId == id).Select(x => new
        {
            x.ChapterId,
            x.ChapterNameNL,
            x.ChapterNameEN,
            x.ChapterDescriptionNL,
            x.ChapterDescriptionEN,
            x.Schema.SchemaId,
            x.Schema.SchemaName,
            x.AmountOfExercises,
            x.CreatedAt,
            SchemaImage = string.IsNullOrEmpty(x.Schema.SchemaImage) ? null : $"{BaseUrl}/schema-images/{x.Schema.SchemaImage}",

        }).FirstOrDefaultAsync();
        if (chapter == null)
        {
            return NotFound(new { message = $"Chapter with ID {id} not found." });
        }

        return Ok(chapter);
    }

    [HttpPost("course/{courseId}")]
    public async Task<ActionResult> CreateChapter(string courseId, [FromBody] ChapterDTO dto)
    {
        var course = await _db.Courses.FirstOrDefaultAsync(x => x.DeletedAt == null && x.CourseId == courseId);

        if (course == null)
            return BadRequest("Course does not exist");

        var schema = await _db.Schemas.FirstOrDefaultAsync(x => x.SchemaId == dto.SchemaId);

        if (schema == null)
            return BadRequest("Schema does not exist");

        var maxOrder = await _db.Chapters.Where(c => c.DeletedAt == null && c.Course.CourseId == courseId).MaxAsync(c => c.Order);

        int nextOrder = (maxOrder ?? -1) + 1;

        var newChapter = new Chapter
        {
            ChapterNameNL = dto.ChapterNameNL,
            ChapterNameEN = dto.ChapterNameEN,
            ChapterDescriptionNL = dto.ChapterDescriptionNL,
            ChapterDescriptionEN = dto.ChapterDescriptionEN,
            AmountOfExercises = dto.AmountOfExercises,
            Order = nextOrder,
            Course = course,
            Schema = schema,
            CreatedAt = DateTime.UtcNow
        };

        _db.Chapters.Add(newChapter);
        await _db.SaveChangesAsync();

        return Ok(newChapter);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateChapter(int id, [FromBody] UpdateChapterDTO dto)
    {
        var chapter = await _db.Chapters.FirstOrDefaultAsync(x => x.DeletedAt == null && x.ChapterId == id);

        if (chapter == null)
        {
            return NotFound(new { message = $"Chapter with ID {id} not found." });
        }

        if (dto.ChapterNameNL != null) chapter.ChapterNameNL = dto.ChapterNameNL;
        if (dto.ChapterNameEN != null) chapter.ChapterNameEN = dto.ChapterNameEN;
        if (dto.ChapterDescriptionNL != null) chapter.ChapterDescriptionNL = dto.ChapterDescriptionNL;
        if (dto.ChapterDescriptionEN != null) chapter.ChapterDescriptionEN = dto.ChapterDescriptionEN;
        if (dto.AmountOfExercises.HasValue) chapter.AmountOfExercises = dto.AmountOfExercises.Value;

        if (dto.SchemaId.HasValue)
        {
            var schema = await _db.Schemas.FirstOrDefaultAsync(x => x.DeletedAt == null && x.SchemaId == dto.SchemaId.Value);

            if (schema == null)
                return BadRequest("Schema does not exist");

            chapter.Schema = schema;
        }

        chapter.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(chapter);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteChapter(int id)
    {
        var chapter = await _db.Chapters.FirstOrDefaultAsync(x => x.DeletedAt == null && x.ChapterId == id);

        if (chapter == null)
        {
            return NotFound(new { message = $"Chapter with ID {id} not found." });
        }

        chapter.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Chapter with ID {id} successfully deleted." });
    }

    // TODO -> finish this (Joran)
    // TODO -> when getting exercises for chapter, when admin/lecturer, return all, if student randomly generate and return those
    [Authorize]
    [HttpGet("{chapterId}/exercises")]
    public async Task<ActionResult<IEnumerable<Exercise>>> GetExercisesByChapter(int chapterId)
    {
        try
        {
            var userId = GetUserId();
            var role = GetUserRole();
            if (userId == null || role == null)
                return Unauthorized();

            if (role == Role.Student)
            {
                User? student = await _db.Users
                    .Where(u => u.DeletedAt == null && u.UserId == userId)
                    .FirstOrDefaultAsync();

                if (student == null)
                    return NotFound("Student not found.");

                // Get a chapter with all exercises and all their user exercises
                Chapter? chapterForStudent = await _db.Chapters
                  .Where(c => c.DeletedAt == null && c.ChapterId == chapterId)
                  .Include(c => c.Exercises
                      .Where(e => e.DeletedAt == null)
                      .OrderBy(e => e.ExerciseId)
                  )
                  .ThenInclude(e => e.UserExercises
                    .Where(ue => ue.DeletedAt == null && ue.User == student)
                  )
                  .FirstOrDefaultAsync();

                if (chapterForStudent == null)
                    return BadRequest(new { message = $"Chapter with ID {chapterId} not found." });

                int amount = chapterForStudent.AmountOfExercises ?? 0;

                // Get the exercises for which a user exercise for this student already exists
                List<Exercise> currentExercises = [.. chapterForStudent.Exercises
                    .Where(e => e.UserExercises.Any(se => se.User == student))
                    .OrderBy(e => e.ExerciseId)];

                // If there are as much off those as the amount required for a chapter, return those current exercises
                if(currentExercises.Count == amount)
                    return Ok(currentExercises);

                // If not, get all possible exercises, for which a user exercise for this student doesn't yet exist
                List<Exercise> possibleExercises = [.. chapterForStudent.Exercises
                    .Where(e => !e.UserExercises.Any(se => se.User == student))
                    .OrderBy(e => e.ExerciseId)];

                // Init the list of exercises to return by adding the current exercises (in case the needed amount gets increased)
                List<Exercise> exercises = currentExercises;
                List<UserExercise> userExercises = [];

                // Loop for the amount of exercises needed for a student to make in a chapter
                for (int i = 0; i < amount; i++)
                {
                    // If there are no more possible exercises, but more exercises are required in the chapter than that exist for the chapter (lecturer issue)
                    // In this case, for now, throw an error, obviously, this scenario should be impossible
                    if (possibleExercises.Count == 0)
                        return BadRequest(new { message = "No possible exercise left for this chapter." });

                    // Pick a random exercise for the possible ones left
                    int random = Random.Shared.Next(possibleExercises.Count);
                    Exercise randomExercise = possibleExercises[random];

                    // If none left, error
                    if (randomExercise == null)
                        return BadRequest(new { message = "Error occured selecting a random exercise." });

                    // Create a user exercise for the current student and the random exercise
                    userExercises.Add(new UserExercise
                    {
                        IsCompleted = false,
                        Exercise = randomExercise,
                        User = student,
                        CreatedAt = DateTime.UtcNow,
                    });

                    // Remove the randomly selected exercise from the possible exercises
                    exercises.Add(randomExercise);
                    possibleExercises.RemoveAll(e => e.ExerciseId == randomExercise.ExerciseId);
                }

                _db.UserExercises.AddRange(userExercises);
                await _db.SaveChangesAsync();

                // return the exercises;
                return Ok(exercises);
            }

            Chapter? chapter = await _db.Chapters
              .Where(c => c.DeletedAt == null && c.ChapterId == chapterId)
              .Include(c => c.Exercises
                  .Where(e => e.DeletedAt == null)
                  .OrderBy(e => e.ExerciseId)
              )
              .FirstOrDefaultAsync();

            if (chapter == null)
                return BadRequest($"Chapter with ID {chapterId} not found.");

            return Ok(chapter.Exercises);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost("course/{courseId}/reorder")]
    public async Task<ActionResult> ReorderChapter(string courseId, [FromBody] ReorderChaptersDTO dto)
    {
        var chapters = await _db.Chapters.Where(c => c.DeletedAt == null && c.Course.CourseId == courseId).ToListAsync();

        if (chapters.Count == 0)
        {
            return NotFound(new { message = $"Chapter with ID {courseId} not found." });
        }

        for (int i = 0; i < dto.OrderedIds.Count; i++)
        {
            if (int.TryParse(dto.OrderedIds[i], out int chapterId))
            {
                var chapterToUpdate = chapters.FirstOrDefault(c => c.DeletedAt == null && c.ChapterId == chapterId);

                if (chapterToUpdate != null)
                {
                    chapterToUpdate.Order = i;
                    chapterToUpdate.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
        await _db.SaveChangesAsync();

        return Ok(chapters);
    }
}