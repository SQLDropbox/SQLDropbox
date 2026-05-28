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
    public class UserController(AppDbContext db, PasswordService passwordService, CsvService csvService, UserService userService) : BaseController
    {
        private readonly AppDbContext _db = db;
        private readonly PasswordService _passwordService = passwordService;
        private readonly CsvService _csvService = csvService;
        private readonly UserService _userService = userService;

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}")]
        public async Task<ActionResult> AddStudentToCourse(string courseId, StudentDTO dto)
        {
            Course? course = await _db.Courses
                .FirstOrDefaultAsync(x => x.DeletedAt == null && x.CourseId == courseId);

            if (course == null)
                return BadRequest("Course not found");


            var result = await _userService.AddStudentToCourse(course, dto);

            if (result.Success)
                return Ok();

            if (result.AlreadyExists)
                return BadRequest("This student is already assigned to this course");

            return BadRequest(result.Error);
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}/import/preview")]
        public async Task<ActionResult> PreviewImportStudents(string courseId, IFormFile file)
        {
            var course = await _db.Courses
                .FirstOrDefaultAsync(x => x.DeletedAt == null && x.CourseId == courseId);

            if (course == null)
                return BadRequest("Course not found");

            try
            {
                var parsed = await _csvService.ParseStudentsAsync(file);

                return Ok(new
                {
                    parsed.Students,
                    parsed.Skipped
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}/import")]
        public async Task<ActionResult> ImportStudents(string courseId, [FromBody] List<StudentDTO> students)
        {
            var course = await _db.Courses
                .FirstOrDefaultAsync(x => x.DeletedAt == null && x.CourseId == courseId);

            if (course == null)
                return BadRequest("Course not found");

            int added = 0;
            int alreadyEnrolled = 0;
            List<string> errors = [];

            foreach (var student in students)
            {
                try
                {
                    var result = await _userService.AddStudentToCourse(course, student);

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
                Errors = errors
            });
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpDelete("studentCourse/{courseId}")]
        public async Task<ActionResult> RemoveAllStudentsFromCourse(string courseId)
        {
            try
            {
                var course = await _db.Courses.FirstOrDefaultAsync(x => x.DeletedAt == null && x.CourseId == courseId);

                if (course == null)
                    return BadRequest("Course not found");

                var students = await _db.Users
                    .Include(u => u.StudentCourses.Where(sc => sc.DeletedAt == null))
                    .Where(u => u.DeletedAt == null && u.StudentCourses.Any(c => c.CourseId == courseId))
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

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpGet("students/{courseId}")]
        public async Task<ActionResult> GetStudents(string courseId)
        {
            var course = _db.Courses
                .Include(c => c.Students)
                .Include(c => c.Chapters)
                    .ThenInclude(ch => ch.Exercises)
                        .ThenInclude(e => e.UserExercises)
                .Where(c => c.CourseId == courseId && c.DeletedAt == null)
                .FirstOrDefault();

            if (course == null)
                return NotFound();

            var chapters = course.Chapters
                        .Where(ch => ch.DeletedAt == null)
                        .Select(ch => new
                        {
                            ch.ChapterId,
                            ch.ChapterNameEN,
                            ch.ChapterNameNL,
                            ch.AmountOfExercises
                        });

            var students = course.Students
                .Where(s => s.DeletedAt == null)
                .Select(student => new
                {
                    student.UserCode,
                    student.FirstName,
                    student.LastName,

                    chapters = course.Chapters
                        .Where(ch => ch.DeletedAt == null)
                        .Select(ch => new
                        {
                            ch.ChapterId,
                            completedAmount = ch.Exercises
                                .Where(e => e.DeletedAt == null)
                                .SelectMany(e => e.UserExercises)
                                .Count(ue =>
                                    ue.DeletedAt == null &&
                                    ue.User.UserId == student.UserId &&
                                    ue.IsCompleted)
                        })
                });

            return Ok(new
            {
                courseId = course.CourseId,
                chapters,
                students
            });
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("lecturers")]
        public async Task<IActionResult> GetAllLecturers()
        {
            var lecturers = await _db.Users
                .Where(u => u.Role == Role.Lecturer && u.DeletedAt == null)
                .Select(u => new 
                { 
                    u.UserId, 
                    u.UserCode, 
                    u.FirstName, 
                    u.LastName 
                })
                .ToListAsync();

            return Ok(lecturers);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("lecturer")]
        public async Task<IActionResult> AddLecturer([FromBody] CreateLecturerDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            var userExists = await _db.Users.AnyAsync(u => 
                u.UserCode.ToLower() == dto.UserCode.ToLower() || 
                u.Email.ToLower() == dto.Email.ToLower());
            
            if (userExists)
            {
                return BadRequest("A user with this UserCode or Email already exists.");
            }
            
            var newLecturer = new User
            {
                UserId = Guid.NewGuid(),
                UserCode = dto.UserCode,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Password = null,
                Role = Role.Lecturer,
                CreatedAt = DateTime.UtcNow
            };
            
            _db.Users.Add(newLecturer);
            await _db.SaveChangesAsync();
            
            return Ok(new 
            { 
                newLecturer.UserId, 
                newLecturer.UserCode, 
                newLecturer.FirstName, 
                newLecturer.LastName 
            });
        }


    }
}