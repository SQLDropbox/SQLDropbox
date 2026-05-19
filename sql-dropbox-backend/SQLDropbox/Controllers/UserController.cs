using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController(AppDbContext db, PasswordService passwordService) : ControllerBase
    {
        private readonly AppDbContext _db = db;
        private readonly PasswordService _passwordService = passwordService;

        [HttpPost("create")]
        public async Task<ActionResult> CreateStudent(StudentDTO dto)
        {
            try
            {
                Student? student = await _db.Students.FirstOrDefaultAsync(s => s.StudentCode == dto.StudentCode);
                if(student != null) throw new Exception("A user with this student code already exists");

                if (dto.StudentCode == null || dto.Email == null)
                    return BadRequest("Student code and Email are required.");
              
                Student newStudent = new()
                { 
                    StudentCode = dto.StudentCode,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Students.Add(newStudent);
                await _db.SaveChangesAsync();

                return Ok($"Account created for student with code {newStudent.StudentCode}.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
