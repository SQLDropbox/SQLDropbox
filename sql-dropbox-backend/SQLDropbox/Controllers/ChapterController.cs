using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class ChapterController : ControllerBase
{
    private readonly AppDbContext _db;
    public ChapterController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public ActionResult GetChapters()
    {
        var chapters = _db.Chapters.Where(x => x.DeletedAt == null).Select(x => new
        {
            x.ChapterId,
            x.ChapterNameNL,
            x.ChapterNameEN,
            x.ChapterDescriptionNL,
            x.ChapterDescriptionEN,
            x.AmountOfExercises,
            x.DbSchema,
        }).ToList();
        return Ok(chapters);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetChapterById(int id)
    {
        var chapter = await _db.Chapters.Where(x => x.ChapterId == id && x.DeletedAt == null).Select(x => new
        {
            x.ChapterId,
            x.ChapterNameNL,
            x.ChapterNameEN,
            x.ChapterDescriptionNL,
            x.ChapterDescriptionEN,
            x.DbSchema,
            x.AmountOfExercises,
            x.CreatedAt

        }).FirstOrDefaultAsync();
        if (chapter == null)
        {
            return NotFound(new { message = $"Chapter with ID {id} not found." });
        }

        return Ok(chapter);
    }

    [HttpPost("{courseId}")]
    public async Task<ActionResult> CreateChapter(string courseId, [FromBody] ChapterDTO dto)
    {
        var course = await _db.Courses.FirstOrDefaultAsync(x => x.CourseId == courseId);

        if (course == null)
            return BadRequest("Course does not exist");

        var newChapter = new Chapter
        {
            ChapterNameNL = dto.ChapterNameNL,
            ChapterNameEN = dto.ChapterNameEN,
            ChapterDescriptionNL = dto.ChapterDescriptionNL,
            ChapterDescriptionEN = dto.ChapterDescriptionEN,
            AmountOfExercises = dto.AmountOfExercises,
            DbSchema = dto.DbSchema ?? 0,
            Course = course,
            CreatedAt = DateTime.UtcNow
        };

        _db.Chapters.Add(newChapter);
        await _db.SaveChangesAsync();

        return Ok(newChapter);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateChapter(int id, [FromBody] UpdateChapterDTO dto){
        var chapter = await _db.Chapters.FirstOrDefaultAsync(x => x.ChapterId == id && x.DeletedAt == null);

        if (chapter == null)
        {
            return NotFound(new
            {
                message = $"Chapter with ID {id} not found."
            });
        }

        if (dto.ChapterNameNL != null)chapter.ChapterNameNL = dto.ChapterNameNL;
        if (dto.ChapterNameEN != null)chapter.ChapterNameEN = dto.ChapterNameEN;
        if (dto.ChapterDescriptionNL != null)chapter.ChapterDescriptionNL =dto.ChapterDescriptionNL;
        if (dto.ChapterDescriptionEN != null)chapter.ChapterDescriptionEN =dto.ChapterDescriptionEN;
        if (dto.AmountOfExercises.HasValue)chapter.AmountOfExercises =dto.AmountOfExercises.Value;
        if (dto.DbSchema.HasValue)chapter.DbSchema = dto.DbSchema.Value;

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

    [HttpGet("{id}/exercises")]
    public async Task<ActionResult<IEnumerable<Exercise>>> GetExercisesByChapter(int id)
    {
        var chapterExists = await _db.Chapters.AnyAsync(c => c.ChapterId == id);
        if (!chapterExists)
        {
            return NotFound($"Chapter with ID {id} not found.");
        }
        var exercises =  await _db.Exercises.Where(e => e.Chapter.ChapterId == id && e.DeletedAt == null).ToListAsync();
        return Ok(exercises);
    }
}