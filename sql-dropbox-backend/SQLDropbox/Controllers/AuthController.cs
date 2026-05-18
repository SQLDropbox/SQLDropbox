using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Data;
using SQLDropbox.Models;
using static SqlParser.Ast.JsonPathElement;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

    [HttpGet("lecturer/{guid}")]
    public async Task<ActionResult> SetupLecturerPassword(string guidStr)
    {
        if (Guid.TryParse(guidStr, out Guid guid))
            return BadRequest("Not a valid GUID.");

        Lecturer? lecturer = await _db.Lecturers.FindAsync(guid);

        if (lecturer == null)
            return BadRequest("Lecturer does not exist.");

        if (lecturer.Password != null)
            return BadRequest("Lecturer is already setup.");

        return Ok($"Hello there {lecturer.FirstName} please set your password");
    }

    [HttpGet("student/{guid}")]
    public async Task<ActionResult> SetupStudentPassword(string guidStr)
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
