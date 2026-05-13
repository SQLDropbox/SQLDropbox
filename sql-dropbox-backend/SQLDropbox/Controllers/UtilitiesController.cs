using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Repositories;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class UtilitiesController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public UtilitiesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("seed-db")]
    public async Task<IActionResult> SeedTheDb()
    {
        await DbInitializer.SeedAsync(_db);        
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
}