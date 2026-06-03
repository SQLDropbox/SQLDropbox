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
    public class UserController(AppDbContext db, AuthorizationService authorizationService, PasswordService passwordService, CsvService csvService, UserService userService, EmailService emailService) : BaseController
    {
        private readonly AppDbContext _db = db;
        private readonly AuthorizationService _aS = authorizationService;
        private readonly PasswordService _passwordService = passwordService;
        private readonly CsvService _csvService = csvService;
        private readonly UserService _userService = userService;
        private readonly EmailService _emailService = emailService;

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}")]
        public async Task<ActionResult> AddStudentToCourse(string courseId, StudentDTO dto)
        {
            try
            {
                var (userId, role) = IsAuthenticated();
                await _aS.UserHasAccessToCourse(userId, role, courseId);

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
                return BadRequest(ex);
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}/import/preview")]
        public async Task<ActionResult> PreviewImportStudents(string courseId, IFormFile file)
        {
            try
            {
                var (userId, role) = IsAuthenticated();
                await _aS.UserHasAccessToCourse(userId, role, courseId);

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
                return BadRequest(ex);
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost("studentCourse/{courseId}/import")]
        public async Task<ActionResult> ImportStudents(string courseId, [FromBody] List<StudentDTO> students)
        {
            try
            {
                var (userId, role) = IsAuthenticated();
                await _aS.UserHasAccessToCourse(userId, role, courseId);

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
                return BadRequest(ex);
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpDelete("studentCourse/{courseId}")]
        public async Task<ActionResult> RemoveAllStudentsFromCourse(string courseId)
        {
            try
            {
                var (userId, role) = IsAuthenticated();
                await _aS.UserHasAccessToCourse(userId, role, courseId);

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
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You're not authorized to access this resource." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [Authorize(Roles = "Admin,Lecturer")]
        [HttpGet("students/{courseId}")]
        public async Task<ActionResult> GetStudents(string courseId)
        {
            try
            {
                var (userId, role) = IsAuthenticated();
                await _aS.UserHasAccessToCourse(userId, role, courseId);

                var course = _db.Courses
                .Include(c => c.Students)
                .Include(c => c.Chapters)
                    .ThenInclude(ch => ch.Exercises)
                        .ThenInclude(e => e.UserExercises)
                .Where(c => c.CourseId == courseId)
                .FirstOrDefault();

                if (course == null)
                    return NotFound();

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
                return BadRequest(ex);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("lecturers")]
        public async Task<IActionResult> GetAllLecturers()
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

        [Authorize(Roles = "Admin")]
        [HttpPost("invite/{userId}")]
        public async Task<IActionResult> InviteUser(string userId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId.ToString() == userId);

            if (user == null)
            {
                return BadRequest("User not found.");
            }

            if (user.Password != null)
            {
                return BadRequest("Account already set up.");
            }

            if (user.InvitedAt != null)
            {
                return BadRequest("User has already been invited.");
            }

            string fullName = user.FirstName + " " + user.LastName;

            try
            {
                await _emailService.SendEmailAsync(
                                toEmail: user.Email,
                                toName: fullName,
                                subject: "You're invited!",
                                htmlContent: $"<h1>Hello {fullName},</h1><p>You have been invited to SQLDropbox. <a href='http://localhost:3000/activate/{user.UserId}'>Click here to activate your account.</a></p>"
                            );

                user.InvitedAt = DateTime.UtcNow;
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