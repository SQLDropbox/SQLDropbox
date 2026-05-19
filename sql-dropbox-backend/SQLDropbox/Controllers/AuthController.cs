using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;
using SQLDropbox.Services;
using static SqlParser.Ast.JsonPathElement;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(AppDbContext db, PasswordService passwordService) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly PasswordService _passwordService = passwordService;

    [HttpGet("setup/{userId}")]
    public async Task<ActionResult> getAccountSetup(string userId)
    {
        if (!Guid.TryParse(userId, out Guid guid))
            return BadRequest("Not a valid GUID.");

        var student = await _db.Students.FirstOrDefaultAsync(s => s.StudentId == guid);
        if (student != null)
        {
            if (student.Password != null) return BadRequest("This account is already set up.");
            return Ok(new { type = "student", userId = student.StudentCode, firstName = student.FirstName });
        }

        var lecturer = await _db.Lecturers.FirstOrDefaultAsync(l => l.LecturerId == guid);
        if (lecturer != null)
        {
            if (lecturer.Password != null) return BadRequest("This account is already set up.");
            return Ok(new { type = "lecturer", userId = lecturer.LecturerCode, firstName = lecturer.FirstName });
        }

        return NotFound("Account does not exist.");
    }

    [HttpPost("setup")]
    public async Task<ActionResult> SetupAccount(SetupDTO dto)
    {
        try
        {
            if (!Guid.TryParse(dto.Guid, out Guid guid))
                return BadRequest("Not a valid identifier.");

            Student? student = await _db.Students.FindAsync(guid);
            Lecturer? lecturer = await _db.Lecturers.FindAsync(guid);

            if (student == null && lecturer == null)
                return BadRequest("This account does not exist.");

            if (student?.Password != null || lecturer?.Password != null)
                return BadRequest("This account is already set up.");

            string hashedPassword = _passwordService.HashPassword(dto.Password);

            if (student != null)
            {
                student.Password = hashedPassword;
                _db.Students.Update(student);
            }
            else
            {
                lecturer!.Password = hashedPassword;
                _db.Lecturers.Update(lecturer);
            }

            await _db.SaveChangesAsync();
            return Ok(); // TODO: return JWT
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }        
    }

}
