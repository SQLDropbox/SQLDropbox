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
public class ChapterController(AppDbContext db, RandomExerciseSelectorService ress) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly RandomExerciseSelectorService _ress = ress;

    [HttpGet]
    public ActionResult GetChapters()
    {
        var chapters = _db.Chapters.Where(x => x.DeletedAt == null)
            .Where(x => x.DeletedAt == null)
            .Select(x => new
            {
                x.ChapterId,
                x.ChapterNameNL,
                x.ChapterNameEN,
                x.ChapterDescriptionNL,
                x.ChapterDescriptionEN,
                x.AmountOfExercises,
                x.Schema.SchemaId,
                x.Course.CourseId,
            }).ToList();
        return Ok(chapters);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetChapterByChapterId(int id)
    {
        var chapter = await _db.Chapters.Where(x => x.ChapterId == id && x.DeletedAt == null).Select(x => new
        {
            x.ChapterId,
            x.ChapterNameNL,
            x.ChapterNameEN,
            x.ChapterDescriptionNL,
            x.ChapterDescriptionEN,
            x.Schema.SchemaId,
            x.AmountOfExercises,
            x.CreatedAt

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

        var newChapter = new Chapter
        {
            ChapterNameNL = dto.ChapterNameNL,
            ChapterNameEN = dto.ChapterNameEN,
            ChapterDescriptionNL = dto.ChapterDescriptionNL,
            ChapterDescriptionEN = dto.ChapterDescriptionEN,
            AmountOfExercises = dto.AmountOfExercises,
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
        var chapter = await _db.Chapters.FirstOrDefaultAsync(x => x.ChapterId == id && x.DeletedAt == null);

        if (chapter == null)
        {
            return NotFound(new { message = $"Chapter with ID {id} not found." });
        }

        if (dto.ChapterNameNL != null)chapter.ChapterNameNL = dto.ChapterNameNL;
        if (dto.ChapterNameEN != null)chapter.ChapterNameEN = dto.ChapterNameEN;
        if (dto.ChapterDescriptionNL != null)chapter.ChapterDescriptionNL = dto.ChapterDescriptionNL;
        if (dto.ChapterDescriptionEN != null)chapter.ChapterDescriptionEN = dto.ChapterDescriptionEN;
        if (dto.AmountOfExercises.HasValue)chapter.AmountOfExercises = dto.AmountOfExercises.Value;

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
        var chapter = await _db.Chapters.FirstOrDefaultAsync(x => x.ChapterId == id && x.DeletedAt == null);

        if (chapter == null)
        {
            return NotFound(new { message = $"Chapter with ID {id} not found." });
        }
        
        chapter.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Chapter with ID {id} successfully deleted." });
    }

    //[Authorize]
    [HttpGet("{chapterId}/exercises")]
    public async Task<ActionResult<IEnumerable<Exercise>>> GetExercisesByChapter(int chapterId)
    {
        try
        {
            //var userId = GetUserId();
            //var role = GetUserRole();
            //if (userId == null || role == null) return Unauthorized();

            Chapter? chapter = await _db.Chapters
               .Where(c => c.DeletedAt == null && c.ChapterId == chapterId)
               .Include(c => c.Exercises
                   .Where(e => e.DeletedAt == null)
                   .OrderBy(e => e.ExerciseId)
               )
               .FirstOrDefaultAsync();

            if (chapter == null)
                return BadRequest($"Chapter with ID {chapterId} not found.");

            //if (role == Role.Student)
            //{
            //    User? student = await _db.Users
            //        .Where(u => u.UserId == userId)
            //        .FirstOrDefaultAsync();

            //    if (student == null)
            //        return BadRequest("Student not found.");

            //    int amount = chapter.AmountOfExercises ?? 0;
            //    List<Exercise> exercises = [];
            //    List<UserExercise> userExercises = [];

            //    for (int i = 0; i < amount; i++)
            //    {
            //        var res = await _ress.GetRandomExerciseForChapter(chapterId, userId);
            //        if (res.Exercise == null) return BadRequest(res.Message);

            //        userExercises.Add(new UserExercise
            //        {
            //            IsCompleted = false,
            //            Exercise = res.Exercise,
            //            Student = student,
            //            CreatedAt = DateTime.UtcNow,
            //        });
            //    }

            //    await _db.StudentExercises.AddRangeAsync(userExercises);
            //    return Ok(exercises);
            //}

            return Ok(chapter.Exercises);
        }
        catch (Exception ex) 
        {
            return BadRequest(ex);
        }        
    }
}