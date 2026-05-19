using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Models;
using static SqlParser.Ast.JsonPathElement;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

    [HttpGet("setup/{userId}")]
    public async Task<ActionResult> GetAccountToSetup(string userId)
    {
        if (!Guid.TryParse(userId, out Guid guid))
            return BadRequest("Not a valid GUID.");

        var student = await _db.Students.FirstOrDefaultAsync(s => s.StudentId == guid);

        if (student != null)
        {
            if (student.Password != null)
                return BadRequest("Student is already setup.");

            return Ok(new
            {
                type = "student",
                userId = student.StudentCode,
                firstName = student.FirstName,
            });
        }

        var lecturer = await _db.Lecturers.FirstOrDefaultAsync(l => l.LecturerId == guid);

        if (lecturer != null)
        {
            if (lecturer.Password != null)
                return BadRequest("Lecturer is already setup.");

            return Ok(new
            {
                type = "lecturer",
                userId = lecturer.LecturerCode,
                firstName = lecturer.FirstName,
            });
        }

        return NotFound("Account does not exist.");
    }

    [HttpPost("setup/{guid}")]
    public async Task<ActionResult> SetupAccount(string guidStr)
    {
        if (Guid.TryParse(guidStr, out Guid guid))
            return BadRequest("Not a valid GUID.");

        Student? student = await _db.Students.FindAsync(guid);

        if (student == null)
            return BadRequest("Student does not exist.");

        if (student.Password != null)
            return BadRequest("Student is already setup.");

        return Ok($"Hello there {student.FirstName} please set your password");
    }

}
