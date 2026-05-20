using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Enums;
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
                User? user = await _db.Users.FirstOrDefaultAsync(u => u.UserCode == dto.UserCode);
                if(user != null) throw new Exception("A user with this code already exists");

                if (dto.UserCode == null || dto.Email == null)
                    return BadRequest("Usercode and Email are required.");
              
                User newStudent = new()
                { 
                    UserCode = dto.UserCode,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    Role = Role.Student,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Users.Add(newStudent);
                await _db.SaveChangesAsync();

                return Ok($"Account created for user with code {newStudent.UserCode}.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
