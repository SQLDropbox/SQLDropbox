using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;
using SQLDropbox.Services;
using Watchlist_Backend.DTOs;
using static SqlParser.Ast.JsonPathElement;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(AppDbContext db, PasswordService passwordService, JwtService jwtService) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly PasswordService _passwordService = passwordService;
    private readonly JwtService _jwtService = jwtService;

    [HttpGet("setup/{userId}")]
    public async Task<ActionResult> GetAccountSetup(string userId)
    {
        if (!Guid.TryParse(userId, out Guid guid))
            return BadRequest("Not a valid setup code.");

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

        return NotFound("This Account does not exist.");
    }

    [HttpPost("setup")]
    public async Task<ActionResult> SetupAccount(SetupDTO dto)
    {
        try
        {
            if (!Guid.TryParse(dto.Guid, out Guid guid))
                return BadRequest("Not a valid setup code.");            

            Student? student = await _db.Students.FirstOrDefaultAsync(s => s.StudentId == guid);
            if (student != null)
            {
                if (student.Password != null)
                    return BadRequest("This account is already set up.");

                string hashedPassword = _passwordService.HashPassword(dto.Password);
                student.Password = hashedPassword;
                _db.Students.Update(student);

                await _db.SaveChangesAsync();
                return Ok(new { type = "student", jwt = _jwtService.GenerateAccessToken(student.StudentId, student.StudentCode, "student") });
            }

            Lecturer? lecturer = await _db.Lecturers.FirstOrDefaultAsync(l => l.LecturerId == guid);
            if (lecturer != null)
            {
                if (lecturer.Password != null)
                    return BadRequest("This account is already set up.");

                string hashedPassword = _passwordService.HashPassword(dto.Password);
                lecturer.Password = hashedPassword;
                _db.Lecturers.Update(lecturer);

                await _db.SaveChangesAsync();
                return Ok(new { type = "lecturer", jwt = _jwtService.GenerateAccessToken(lecturer.LecturerId, lecturer.LecturerCode, "lecturer") });
            }                                      
  
            return NotFound("This account does not exist.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }        
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginDTO dto)
    {
        if (dto.EmailOrCode == null || dto.Password == null)
            return BadRequest("Email or code and password are required.");

        Student? student = dto.EmailOrCode.Contains('@') ?
            await _db.Students.FirstOrDefaultAsync(s => s.Email == dto.EmailOrCode) :
            await _db.Students.FirstOrDefaultAsync(s => s.StudentCode == dto.EmailOrCode);

        if (student != null)
        {
            if (student.Password == null)
                return BadRequest("This account has not yet been setup, please refer to the mail you received to do this.");

            if (!_passwordService.ValidatePassword(student.Password, dto.Password))
                return Unauthorized("The email/code or password are incorrect.");

            return Ok(new { type = "student", jwt = _jwtService.GenerateAccessToken(student.StudentId, student.StudentCode, "student") });
        }

        Lecturer? lecturer = dto.EmailOrCode.Contains('@') ?
           await _db.Lecturers.FirstOrDefaultAsync(l => l.Email == dto.EmailOrCode) :
           await _db.Lecturers.FirstOrDefaultAsync(l => l.LecturerCode == dto.EmailOrCode);

        if (lecturer != null)
        {
            if (lecturer.Password == null)
                return BadRequest("This account has not yet been setup, please refer to the mail you received to do this.");

            if (!_passwordService.ValidatePassword(lecturer.Password, dto.Password))
                return Unauthorized("The email/code or password are incorrect.");

            return Ok(new { type = "lecturer", jwt = _jwtService.GenerateAccessToken(lecturer.LecturerId, lecturer.LecturerCode, "lecturer") });
        }

        Admin? admin = await _db.Admins.FirstOrDefaultAsync(a => a.Name == dto.EmailOrCode);
        if (admin != null)
        {
            if (!_passwordService.ValidatePassword(admin.Password!, dto.Password))
                return Unauthorized("The name or password are incorrect.");

            return Ok(new { type = "admin", jwt = _jwtService.GenerateAccessToken(admin.AdminId, admin.Name, "admin") });
        }

        return NotFound("This account does not exist.");
    }

}
