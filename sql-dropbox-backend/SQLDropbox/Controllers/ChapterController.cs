using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Enums;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class ChapterController(AppDbContext db) : BaseController
{
    private readonly AppDbContext _db = db;
    private string BaseUrl => $"{Request.Scheme}://{Request.Host}";

    [HttpGet]
    public ActionResult GetChapters()
    {
        var chapters = _db.Chapters
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
        var chapter = await _db.Chapters.Where(x => x.ChapterId == id).Select(x => new
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
        var course = await _db.Courses.FirstOrDefaultAsync(x => x.CourseId == courseId);

        if (course == null)
            return BadRequest("Course does not exist");

        var schema = await _db.Schemas.FirstOrDefaultAsync(x => x.SchemaId == dto.SchemaId);

        if (schema == null)
            return BadRequest("Schema does not exist");

        var maxOrder = await _db.Chapters.Where(c => c.Course.CourseId == courseId).MaxAsync(c => c.Order);

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
        var chapter = await _db.Chapters.FirstOrDefaultAsync(x => x.ChapterId == id);

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
            var schema = await _db.Schemas.FirstOrDefaultAsync(x => x.SchemaId == dto.SchemaId.Value);

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
        var chapter = await _db.Chapters.FirstOrDefaultAsync(x => x.ChapterId == id);

        if (chapter == null)
        {
            return NotFound(new { message = $"Chapter with ID {id} not found." });
        }

        chapter.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Chapter with ID {id} successfully deleted." });
    }

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
                // TODO -> needed? Check if the student has access to the course this chapter is part of
                //bool studentHasAccess = await _db.Chapters.AnyAsync(c => c.ChapterId == chapterId && c.Course.Students.Any(s => s.UserId == userId));

                //if (!studentHasAccess)
                //    return Unauthorized("You're not registerd as a student for this course.");

                User? student = await _db.Users
                    .Where(u => u.UserId == userId)
                    .FirstOrDefaultAsync();

                if (student == null)
                    return NotFound("Student not found.");

                Chapter? chapterForStudent = await _db.Chapters
                  .Where(c => c.ChapterId == chapterId)
                  .Include(c => c.Exercises
                      .OrderBy(e => e.ExerciseId)
                  )
                  .ThenInclude(e => e.UserExercises
                    .Where(ue => ue.User == student)
                  )
                  .FirstOrDefaultAsync();

                if (chapterForStudent == null)
                    return BadRequest(new { message = $"Chapter with ID {chapterId} not found." });

                int amount = chapterForStudent.AmountOfExercises ?? 0;

                List<Exercise> currentExercises = [.. chapterForStudent.Exercises
                    .Where(e => e.UserExercises.Any(se => se.User == student))
                    .OrderBy(e => e.ExerciseId)];

                if (currentExercises.Count == amount)
                    return Ok(currentExercises);

                List<Exercise> possibleExercises = [.. chapterForStudent.Exercises
                    .Where(e => !e.UserExercises.Any(se => se.User == student))
                    .OrderBy(e => e.ExerciseId)];

                List<Exercise> exercises = currentExercises;
                List<UserExercise> userExercises = [];

                for (int i = 0; i < amount; i++)
                {
                    if (possibleExercises.Count == 0)
                        return BadRequest(new { message = "No possible exercise left for this chapter." });

                    int random = Random.Shared.Next(possibleExercises.Count);
                    Exercise randomExercise = possibleExercises[random];

                    if (randomExercise == null)
                        return BadRequest(new { message = "Error occured selecting a random exercise." });

                    userExercises.Add(new UserExercise
                    {
                        IsCompleted = false,
                        Exercise = randomExercise,
                        User = student,
                        CreatedAt = DateTime.UtcNow,
                    });

                    exercises.Add(randomExercise);
                    possibleExercises.RemoveAll(e => e.ExerciseId == randomExercise.ExerciseId);
                }

                _db.UserExercises.AddRange(userExercises);
                await _db.SaveChangesAsync();

                return Ok(exercises);
            }

            // TODO -> needed? Check if the lecturer has access to the course this chapter is part of
            //if (role == Role.Lecturer)
            //{
            //    bool lecturerHasAccess = await _db.Chapters.AnyAsync(c => c.ChapterId == chapterId && c.Course.Lecturers.Any(l => l.UserId == userId));

            //    if (!lecturerHasAccess)
            //        return Unauthorized("You're not registerd as a lecturer for this course.");
            //}

            Chapter? chapter = await _db.Chapters
                .Where(c => c.ChapterId == chapterId)
                .Include(c => c.Exercises)
                    .ThenInclude(e => e.Requirements)
                .Include(c => c.Exercises)
                    .ThenInclude(e => e.Solutions)
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
        var chapters = await _db.Chapters.Where(c => c.Course.CourseId == courseId).ToListAsync();

        if (chapters.Count == 0)
        {
            return NotFound(new { message = $"Chapter with ID {courseId} not found." });
        }

        for (int i = 0; i < dto.OrderedIds.Count; i++)
        {
            if (int.TryParse(dto.OrderedIds[i], out int chapterId))
            {
                var chapterToUpdate = chapters.FirstOrDefault(c => c.ChapterId == chapterId);

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