using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;

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
}