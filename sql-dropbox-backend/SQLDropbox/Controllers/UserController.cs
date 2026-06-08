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
    public class UserController(AppDbContext db, PasswordService passwordService, CsvService csvService, UserService userService, EmailService emailService, IConfiguration configuration) : BaseController(db)
    {
        private readonly AppDbContext _db = db;
        private readonly PasswordService _passwordService = passwordService;
        private readonly CsvService _csvService = csvService;
        private readonly UserService _userService = userService;
        private readonly EmailService _emailService = emailService;
        private readonly IConfiguration _configuration = configuration;


        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}")]
        public async Task<ActionResult> AddStudentToCourse(string courseId, StudentDTO dto)
        {
            try
            {
                await UserHasAccessToCourse(courseId);

                Course? course = await _db.Courses
                .FirstOrDefaultAsync(x => x.CourseId == courseId);

                if (course == null)
                    return BadRequest("Course not found");

                var (Success, AlreadyExists, Error) = await _userService.AddStudentToCourse(course, dto);

                if (Success)
                    return Ok();

                if (AlreadyExists)
                    return BadRequest("This student is already assigned to this course");

                return BadRequest(Error);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You're not authorized to access this resource." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}/import/preview")]
        public async Task<ActionResult> PreviewImportStudents(string courseId, IFormFile file)
        {
            try
            {
                await UserHasAccessToCourse(courseId);

                var course = await _db.Courses
                    .FirstOrDefaultAsync(x => x.CourseId == courseId);

                if (course == null)
                    return BadRequest("Course not found");


                var parsed = await _csvService.ParseStudentsAsync(file);

                var enrolledStudentIds = await _db.Users.Where(x => x.Role == Role.Student && x.StudentCourses.Any(y => y.CourseId == courseId)).Select(sc => sc.UserCode).ToListAsync();
                var enrolledSet = enrolledStudentIds.ToHashSet(StringComparer.OrdinalIgnoreCase);


                var alreadyEnrolled = parsed.Students.Where(s => string.IsNullOrWhiteSpace(s.UserCode) || enrolledSet.Contains(s.UserCode)).ToList();
                parsed.Students = parsed.Students.Where(s => !string.IsNullOrWhiteSpace(s.UserCode) && !enrolledSet.Contains(s.UserCode!)).ToList();


                parsed.Skipped += alreadyEnrolled.Count;

                return Ok(new
                {
                    parsed.Students,
                    parsed.Skipped
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You're not authorized to access this resource." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}/import")]
        public async Task<ActionResult> ImportStudents(string courseId, [FromBody] List<StudentDTO> students)
        {
            try
            {
                await UserHasAccessToCourse(courseId);

                var course = await _db.Courses
                .FirstOrDefaultAsync(x => x.CourseId == courseId);

                if (course == null)
                    return BadRequest("Course not found");

                int added = 0;
                int alreadyEnrolled = 0;
                List<string> errors = [];

                foreach (var student in students)
                {
                    try
                    {
                        var (Success, AlreadyExists, Error) = await _userService.AddStudentToCourse(course, student);

                        if (Success)
                        {
                            added++;
                        }
                        else if (AlreadyExists)
                        {
                            alreadyEnrolled++;
                        }
                        else
                        {
                            errors.Add($"Student {student.UserCode}: {Error}");
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
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You're not authorized to access this resource." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpDelete("studentCourse/{courseId}")]
        public async Task<ActionResult> RemoveAllStudentsFromCourse(string courseId)
        {
            try
            {
                await UserHasAccessToCourse(courseId);

                var course = await _db.Courses.FirstOrDefaultAsync(x => x.CourseId == courseId);

                if (course == null)
                    return BadRequest("Course not found");

                var students = await _db.Users
                    .Include(u => u.StudentCourses)
                    .Where(u => u.StudentCourses.Any(c => c.CourseId == courseId))
                    .ToListAsync();

                students.ForEach(x => x.DeletedAt = DateTime.Now);
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    Removed = students.Count
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You're not authorized to access this resource." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpGet("students/{courseId}")]
        public async Task<ActionResult> GetStudents(string courseId)
        {
            try
            {
                await UserHasAccessToCourse(courseId);

                var course = _db.Courses
                .Include(c => c.Students)
                .Include(c => c.Chapters)
                    .ThenInclude(ch => ch.Exercises)
                        .ThenInclude(e => e.UserExercises)
                            .ThenInclude(ue => ue.User)
                .Where(c => c.CourseId == courseId)
                .FirstOrDefault();

                if (course == null)
                    return NotFound();

                var invitePossibleCount = course.Students.Where(x => x.InvitedAt == null && x.Password == null).Count();

                var chapters = course.Chapters
                            .Select(ch => new
                            {
                                ch.ChapterId,
                                ch.ChapterNameEN,
                                ch.ChapterNameNL,
                                ch.AmountOfExercises
                            });

                var students = course.Students
                    .Select(student => new
                    {
                        student.UserCode,
                        student.FirstName,
                        student.LastName,

                        chapters = course.Chapters
                            .Select(ch => new
                            {
                                ch.ChapterId,
                                completedAmount = ch.Exercises
                                    .SelectMany(e => e.UserExercises)
                                    .Count(ue =>
                                        ue.User.UserId == student.UserId &&
                                        ue.IsCompleted)
                            })
                    });

                return Ok(new
                {
                    courseId = course.CourseId,
                    invitePossibleCount,
                    chapters,
                    students
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You're not authorized to access this resource." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("lecturers")]
        public async Task<IActionResult> GetAllLecturers()
        {
            try
            {
                var lecturers = await _db.Users
                    .Where(u => u.Role == Role.Lecturer)
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
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You're not authorized to access this resource." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("lecturer")]
        public async Task<IActionResult> AddLecturer([FromBody] CreateLecturerDTO dto)
        {
            try
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

                var lecturerId = Guid.NewGuid();

                var newLecturer = new User
                {
                    UserId = lecturerId,
                    UserCode = dto.UserCode,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    Password = null,
                    Role = Role.Lecturer,
                    CreatedAt = DateTime.Now,
                };

                _db.Users.Add(newLecturer);
                await _db.SaveChangesAsync();

                var url = _configuration["FrontendURL"];

                if (url == null)
                {
                    return BadRequest("FrontendURL is not configured.");
                }

                string htmlContent = $"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #1a1a1a;">Welcome to Databasement, {dto.FirstName}!</h1>
                        <p style="color: #555; font-size: 16px; line-height: 1.5;">
                            You've been invited to join a course on Databasement. Click the button below to activate your account.
                        </p>
                        <a href="{url}/activate/{lecturerId}"
                           style="display: inline-block; background-color: #4F46E5; color: white;
                                  padding: 12px 24px; border-radius: 6px; text-decoration: none;
                                  font-size: 16px; margin: 20px 0;">
                            Activate my account
                        </a>
                        <p style="color: #999; font-size: 13px;">
                            If you didn't expect this email, you can safely ignore it.
                        </p>
                    </div>
                """;

                await _emailService.SendEmailAsync(
                    toEmail: dto.Email,
                    toName: dto.FirstName + " " + dto.LastName,
                    subject: "Welcome to Databasement!",
                    htmlContent: htmlContent
                );


                newLecturer.InvitedAt = DateTime.Now;
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    newLecturer.UserId,
                    newLecturer.UserCode,
                    newLecturer.FirstName,
                    newLecturer.LastName
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You're not authorized to access this resource." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}