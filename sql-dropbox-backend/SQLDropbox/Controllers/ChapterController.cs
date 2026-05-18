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

    [HttpPost]
    public async Task<ActionResult> CreateChapter([FromBody] ChapterDTO dto)
    {
        var course = await _db.Courses.FindAsync(dto.CourseId);
        if (course == null)
        {
            return BadRequest(new { message = $"Course with ID {dto.CourseId} does not exist." });
        }

        var newChapter = new Chapter
        {
            ChapterNameNL = dto.ChapterNameNL,
            ChapterNameEN = dto.ChapterNameEN,
            ChapterDescriptionNL = dto.ChapterDescriptionNL,
            ChapterDescriptionEN = dto.ChapterDescriptionEN,
            DbSchema = dto.DbSchema,
            AmountOfExercises = dto.AmountOfExercises,
            Course = course,
            CreatedAt = DateTime.UtcNow

        };
        await _db.Chapters.AddAsync(newChapter);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetChapterById), new { id = newChapter.ChapterId }, newChapter);
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