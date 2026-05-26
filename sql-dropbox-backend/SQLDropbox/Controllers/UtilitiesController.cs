using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Helpers;
using SQLDropbox.Models;
using SQLDropbox.Repositories;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class UtilitiesController(AppDbContext db, PasswordService ps, SolutionService soS, RandomExerciseSelectorService ress) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly PasswordService _ps = ps;
    private readonly SolutionService _soS = soS;
    private readonly RandomExerciseSelectorService _ress = ress;

    [HttpGet("seed-db")]
    public async Task<IActionResult> SeedTheDb()
    {
        await DbInitializer.EmptyAsync(_db);
        await DbInitializer.SeedAsync(_db, _ps);
        return Ok("The DB should have been seeded.");
    }

    [HttpGet("empty-db")]
    public async Task<IActionResult> EmptyTheDb()
    {
        await DbInitializer.EmptyAsync(_db);
        return Ok("The DB should have been emptied.");
    }

    [HttpPost("format")]
    public async Task<IActionResult> Format([FromBody] FormatDTO format)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (format.Query == null)
            return BadRequest("Query is required.");

        var formatted = _soS.FormatQuery(format.Query);
        return Ok(formatted);
    }

    [HttpPost("check")]
    public async Task<IActionResult> Check([FromBody] FormatDTO format)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        List<Requirement> requirements = [];
        Requirement r1 = new()
        {
            RequirementId = 1,
            Statement = "JOIN",
            Use = false
        };
        requirements.Add(r1);
        Requirement r2 = new()
        {
            RequirementId = 1,
            Statement = "GROUP BY",
            Use = true
        };
        requirements.Add(r2);

        var (Valid, Message) = _soS.CheckQueryRequirements(requirements, format.Query);
        return Ok($"{Valid}: {Message}");
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var result = AuthHelper.GetUserClaims(this);
        if (result.Result != null) return BadRequest(result.Result);
        return Ok(result.Value.ToString());
    }

    [HttpGet("random-exercise/{chapterIdStr}/{userIdStr}")]
    public async Task<IActionResult> GetRandomExercise(string chapterIdStr, string userIdStr)
    {
        try
        {
            if (!int.TryParse(chapterIdStr, out int chapterId))
                return BadRequest("Not a valid chapter id.");

            if (!Guid.TryParse(userIdStr, out Guid userId))
                return BadRequest("Not a valid user id.");

            var res = await _ress.GetRandomExerciseForChapter(chapterId, userId);

            if (res.Exercise == null)
                return BadRequest(res.Message);

            return Ok(res.Exercise.QuestionEN);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }       
    }
}