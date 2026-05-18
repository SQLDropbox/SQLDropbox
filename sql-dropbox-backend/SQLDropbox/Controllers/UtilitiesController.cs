using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;
using SQLDropbox.Repositories;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class UtilitiesController(AppDbContext db, PasswordService passwordService, PostgreSQLQueryFormatter formatter) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly PasswordService _passwordService = passwordService;
    private readonly PostgreSQLQueryFormatter _formatter = formatter;

    [HttpGet("seed-db")]
    public async Task<IActionResult> SeedTheDb()
    {        
        await DbInitializer.SeedAsync(_db, _passwordService);
        return Ok("The DB should have been seeded.");
    }

    [HttpGet("empty-db")]
    public async Task<IActionResult> EmptyTheDb()
    {
        await _db.Admins.ExecuteDeleteAsync();
        await _db.Requirements.ExecuteDeleteAsync();
        await _db.StudentSolutions.ExecuteDeleteAsync();
        await _db.StudentExercises.ExecuteDeleteAsync();
        await _db.Students.ExecuteDeleteAsync();
        await _db.Solutions.ExecuteDeleteAsync();
        await _db.Exercises.ExecuteDeleteAsync();
        await _db.Chapters.ExecuteDeleteAsync();
        await _db.Courses.ExecuteDeleteAsync();
        return Ok("The DB should have been emptied.");
    }

    [HttpPost("format")]
    public async Task<IActionResult> Format([FromBody] FormatDTO format)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var formatted = _formatter.ParseSQL(format.Query);
        return Ok(formatted);
    }
}