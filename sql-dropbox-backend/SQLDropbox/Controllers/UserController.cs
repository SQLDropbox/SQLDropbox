using Microsoft.AspNetCore.Authorization;
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
    public class UserController(AppDbContext db, PasswordService passwordService) : BaseController
    {
        private readonly AppDbContext _db = db;
        private readonly PasswordService _passwordService = passwordService;        

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}")]
        public async Task<ActionResult> AddStudentToCourse(string courseId, StudentDTO dto)
        {
            try
            {
                // TODO: update to check if the user already exists but in a different course, assign to this course, replace name and email?
                User? user = await _db.Users.FirstOrDefaultAsync(u => u.UserCode == dto.UserCode);
                if (user != null) return BadRequest("A user with this code already exists"); 

                if (dto.UserCode == null || dto.Email == null)
                    return BadRequest("Usercode and Email are required.");

                Course? course = await _db.Courses.FirstOrDefaultAsync(x => x.CourseId == courseId);
                if (course == null) return BadRequest("Course not found");

                User newStudent = new()
                {
                    UserCode = dto.UserCode,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    StudentCourses = [course],
                    Role = Role.Student,
                    CreatedAt = DateTime.UtcNow,
                };

                _db.Users.Add(newStudent);
                await _db.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
