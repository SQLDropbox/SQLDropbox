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
    public class UserController(AppDbContext db, PasswordService passwordService, CsvService csvService) : BaseController
    {
        private readonly AppDbContext _db = db;
        private readonly PasswordService _passwordService = passwordService;   
        private readonly CsvService _csvService = csvService;

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}")]
        public async Task<ActionResult> AddStudentToCourse(string courseId, StudentDTO dto)
        {
            Course? course = await _db.Courses
                .FirstOrDefaultAsync(x => x.CourseId == courseId);

            if (course == null)
                return BadRequest("Course not found");


            var result = await AddStudentToCourseInternal(course, dto);

            if (result.Success)
                return Ok();

            if (result.AlreadyExists)
                return BadRequest("This student is already assigned to this course");

            return BadRequest(result.Error);
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}/import")]
        public async Task<ActionResult> ImportStudentsFromFile(string courseId, IFormFile file)
        {
            Course? course = await _db.Courses
                .FirstOrDefaultAsync(x => x.CourseId == courseId);

            if (course == null)
                return BadRequest("Course not found");

            try
            {
                var parsed = await _csvService.ParseStudentsAsync(file);

                int added = 0;
                int alreadyEnrolled = 0;
                List<string> errors = new();

                foreach (var student in parsed.Students)
                {
                    try
                    {
                        var result = await AddStudentToCourseInternal(course, student);

                        if (result.Success)
                        {
                            added++;
                        }
                        else if (result.AlreadyExists)
                        {
                            alreadyEnrolled++;
                        }
                        else
                        {
                            errors.Add($"Student {student.UserCode}: {result.Error}");
                        }
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Student {student.UserCode}: {ex.Message}");
                    }
                }

                return Ok(new
                {
                    Added = added,
                    AlreadyEnrolled = alreadyEnrolled,
                    Skipped = parsed.Skipped,
                    Errors = errors
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<(bool Success, bool AlreadyExists, string? Error)> AddStudentToCourseInternal(Course course, StudentDTO dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.UserCode) || string.IsNullOrWhiteSpace(dto.Email))
                    return (false, false, "Usercode and Email are required.");

                if (course == null)
                    return (false, false, "Course not found");

                var user = await _db.Users.Include(x => x.StudentCourses).FirstOrDefaultAsync(u => u.UserCode == dto.UserCode);

                if (user != null)
                {
                    if (user.StudentCourses.Any(c => c.CourseId == course.CourseId))
                        return (false, true, "Already assigned");

                    // update info
                    user.FirstName = dto.FirstName;
                    user.LastName = dto.LastName;
                    user.Email = dto.Email;
                    user.DeletedAt = null;
                    user.UpdatedAt = DateTime.UtcNow;

                    user.StudentCourses.Add(course);
                }
                else
                {
                    var newStudent = new User
                    {
                        UserCode = dto.UserCode,
                        FirstName = dto.FirstName,
                        LastName = dto.LastName,
                        Email = dto.Email,
                        Role = Role.Student,
                        CreatedAt = DateTime.UtcNow,
                        StudentCourses = new List<Course> { course }
                    };

                    _db.Users.Add(newStudent);
                }

                await _db.SaveChangesAsync();

                return (true, false, null);
            }
            catch (Exception ex)
            {
                return (false, false, null);
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpDelete("studentCourse/{courseId}")]
        public async Task<ActionResult> RemoveAllStudentsFromCourse(string courseId)
        {
            try
            {
                var course = await _db.Courses.FirstOrDefaultAsync(x => x.CourseId == courseId);

                if (course == null)
                    return BadRequest("Course not found");

                var students = await _db.Users
                    .Include(u => u.StudentCourses)
                    .Where(u => u.StudentCourses.Any(c => c.CourseId == courseId))
                    .ToListAsync();

                students.ForEach(x => x.DeletedAt = DateTime.UtcNow);
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    Removed = students.Count
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



    }
}