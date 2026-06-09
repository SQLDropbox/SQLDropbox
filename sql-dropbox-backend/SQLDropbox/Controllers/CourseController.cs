using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Enums;
using SQLDropbox.Models;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class CourseController(AppDbContext db, EmailService emailService, IConfiguration configuration) : BaseController(db)
{
    private readonly AppDbContext _db = db;
    private readonly EmailService _emailService = emailService;
    private readonly IConfiguration _configuration = configuration;


    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetCourses()
    {
        try
        {
            var (userId, role) = IsAuthenticated();

            var query = _db.Courses.AsQueryable();

            switch (role)
            {
                case Role.Student:
                    query = query.Where(x => x.Students.Any(s => s.UserId == userId) && x.IsActive);
                    break;
                case Role.Lecturer:
                    query = query.Where(x => x.Lecturers.Any(l => l.UserId == userId));
                    break;
            }


            var courses = query.Select(x => new
            {
                x.CourseId,
                x.CourseNameEN,
                x.CourseNameNL,
                x.CourseDescriptionEN,
                x.CourseDescriptionNL,
                //x.Lecturer,
                lecturers = x.Lecturers.Select(l => new { l.UserId, l.FirstName, l.LastName }).ToList(),
                x.IsActive,
                studentCount = x.Students.Count,
                chapterCount = x.Chapters.Count,
            }).OrderBy(x => x.CourseId).ToList();

            return Ok(courses);
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

    [Authorize]
    [HttpGet("{courseId}")]
    public async Task<IActionResult> GetCourseByCourseId(string courseId)
    {
        try
        {
            await UserHasAccessToCourse(courseId);
            var (userId, role) = IsAuthenticated();

            var query = _db.Courses
            .Include(x => x.Lecturers)
            .Include(x => x.Chapters)
            .ThenInclude(c => c.Exercises)
            .ThenInclude(e => e.UserExercises)
            .ThenInclude(u => u.User)
            .Include(x => x.Students)
            .AsQueryable();

            if (role == Role.Student)
            {
                query = query.Where(x => x.IsActive && x.Students.Any(s => s.UserId == userId));
            }

            var totalCourseCount = query.Count();

            var course = query.FirstOrDefault(x => x.CourseId == courseId);

            if (course == null)
                return NotFound();


            return Ok(new
            {
                course.CourseId,
                course.CourseNameEN,
                course.CourseNameNL,
                course.CourseDescriptionEN,
                course.CourseDescriptionNL,
                lecturers = course.Lecturers.Select(l => new
                {
                    l.UserId,
                    l.UserCode,
                    l.FirstName,
                    l.LastName
                }),
                course.IsActive,
                totalCourseCount,
                chapters = course.Chapters
                    .Where(c => role != Role.Student || !c.StartDate.HasValue || c.StartDate.Value.Date <= DateTime.Now.Date)
                    .OrderBy(c => c.Order)
                    .Select(x => new
                    {
                        x.ChapterId,
                        x.ChapterNameEN,
                        x.ChapterNameNL,
                        x.ChapterDescriptionEN,
                        x.ChapterDescriptionNL,
                        x.AmountOfExercises,
                        x.Course.CourseId,
                        x.StartDate,
                        x.Deadline,

                        completedAmount = x.Exercises.Take(x.AmountOfExercises ?? 0).Sum(e => e.UserExercises.Count(ue => ue.User.UserId == userId && ue.IsCompleted))
                    })
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
    [HttpPost]
    public async Task<IActionResult> AddCourse([FromBody] CourseDTO course)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (_db.Courses.Any(x => x.CourseId == course.CourseId))
            {
                return BadRequest("This URL is already in use");
            }

            if (course.CourseId == null)
            {
                return BadRequest("The URL cannot be null");
            }

            var newCourse = new Course
            {
                CourseId = course.CourseId,
                CourseNameEN = course.CourseNameEN,
                CourseNameNL = course.CourseNameNL,
                CourseDescriptionEN = course.CourseDescriptionEN,
                CourseDescriptionNL = course.CourseDescriptionNL,
                //Lecturer = course.Lecturer,
                IsActive = course.IsActive,
                CreatedAt = DateTime.Now,
                Lecturers = []
            };

            if (course.LecturerIds != null && course.LecturerIds.Any())
            {
                var lecturers = await _db.Users
                    .Where(u => course.LecturerIds.Contains(u.UserId) && u.Role == Role.Lecturer)
                    .ToListAsync();

                newCourse.Lecturers = lecturers;
            }

            _db.Courses.Add(newCourse);
            await _db.SaveChangesAsync();

            return Ok(newCourse);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPut("{courseId}")]
    public async Task<IActionResult> UpdateCourse(string courseId, [FromBody] CourseDTO course)
    {
        try
        {
            await UserHasAccessToCourse(courseId);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _db.Courses
                .Include(c => c.Lecturers)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (existing == null)
                return NotFound();

            existing.CourseNameEN = course.CourseNameEN;
            existing.CourseNameNL = course.CourseNameNL;
            existing.CourseDescriptionEN = course.CourseDescriptionEN;
            existing.CourseDescriptionNL = course.CourseDescriptionNL;
            //existing.Lecturer = course.Lecturer;
            existing.IsActive = course.IsActive;
            existing.UpdatedAt = DateTime.Now;

            if (course.LecturerIds != null)
            {
                var newLecturers = await _db.Users
                    .Where(u => course.LecturerIds.Contains(u.UserId) && u.Role == Role.Lecturer)
                    .ToListAsync();

                existing.Lecturers.Clear();
                foreach (var lecturer in newLecturers)
                {
                    existing.Lecturers.Add(lecturer);
                }
            }

            await _db.SaveChangesAsync();

            return Ok(existing);
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
    [HttpDelete("{courseID}")]
    public ActionResult DeleteCourse(string courseID)
    {
        try
        {
            var course = _db.Courses.FirstOrDefault(x => x.CourseId == courseID);

            if (course == null)
            {
                return BadRequest("Course not found");
            }

            course.DeletedAt = DateTime.Now;
            _db.SaveChanges();

            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }


    [Authorize(Roles = "Admin")]
    [HttpPost("{courseId}/Duplicate")]
    public async Task<IActionResult> DuplicateCourse(string courseId, [FromBody] DuplicateCourseDTO? request = null)
    {
        try
        {
            var existingCourse = _db.Courses
            .Include(c => c.Lecturers)
            .Include(c => c.Chapters)
            .ThenInclude(ch => ch.Schema)
            .Include(c => c.Chapters)
            .ThenInclude(ch => ch.Exercises)
            .FirstOrDefault(c => c.CourseId == courseId);

            if (existingCourse == null)
                return NotFound("Original course not found");

            string finalCourseId;
            string? newCourseId = request?.NewCourseId;

            if (string.IsNullOrEmpty(newCourseId))
            {
                string baseId = existingCourse.CourseId + "-copy";
                finalCourseId = baseId;
                int counter = 1;

                while (_db.Courses.Any(x => x.CourseId == finalCourseId))
                {
                    finalCourseId = $"{baseId}-{counter++}";
                    counter++;
                }
            }
            else
            {
                if (_db.Courses.Any(x => x.CourseId == newCourseId))
                {
                    return BadRequest("This course name is already in use");
                }
                finalCourseId = newCourseId;
            }

            var duplicateCourse = new Course
            {
                CourseId = finalCourseId,
                CourseNameNL = existingCourse.CourseNameNL + " (Kopie)",
                CourseNameEN = existingCourse.CourseNameEN + " (Copy)",
                CourseDescriptionNL = existingCourse.CourseDescriptionNL,
                CourseDescriptionEN = existingCourse.CourseDescriptionEN,
                //Lecturer = existingCourse.Lecturer,
                Lecturers = [.. existingCourse.Lecturers],
                IsActive = false,
                CreatedAt = DateTime.Now,
                Chapters = []

            };

            foreach (var chapter in existingCourse.Chapters)
            {
                var newChapter = new Chapter
                {
                    ChapterNameNL = chapter.ChapterNameNL,
                    ChapterNameEN = chapter.ChapterNameEN,
                    ChapterDescriptionNL = chapter.ChapterDescriptionNL,
                    ChapterDescriptionEN = chapter.ChapterDescriptionEN,
                    AmountOfExercises = chapter.AmountOfExercises,
                    Order = chapter.Order,
                    Deadline = chapter.Deadline,
                    Schema = chapter.Schema,
                    StartDate = chapter.StartDate,
                    CreatedAt = DateTime.Now,
                    Exercises = []
                };

                foreach (var exercises in chapter.Exercises)
                {
                    var newExercise = new Exercise
                    {
                        QuestionNL = exercises.QuestionNL,
                        QuestionEN = exercises.QuestionEN,
                        HintNL = exercises.HintNL,
                        HintEN = exercises.HintEN,
                        QueryOutput = exercises.QueryOutput,
                        QueryAction = exercises.QueryAction,
                        CreatedAt = DateTime.Now,
                    };
                    newChapter.Exercises.Add(newExercise);
                }
                duplicateCourse.Chapters.Add(newChapter);
            }
            _db.Courses.Add(duplicateCourse);
            _db.SaveChanges();
            return Ok(duplicateCourse);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPost("{courseId}/Lecturers")]
    public async Task<IActionResult> AddLecturerToCourse(string courseId, [FromBody] AssignLecturerDTO request)
    {
        try
        {
            await UserHasAccessToCourse(courseId);

            var course = await _db.Courses
            .Include(c => c.Lecturers)
            .FirstOrDefaultAsync(c => c.CourseId == courseId);
            if (course == null)
                return NotFound("Course not found");

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (user == null)
                return NotFound("User not found");

            if (user.Role != Role.Lecturer)
                return BadRequest("This user does not have the Lecturer role.");
            if (course.Lecturers.Any(l => l.UserId == request.UserId))
                return BadRequest("This lecturer is already assigned to this course.");

            course.Lecturers.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Lecturer successfully added to the course." });
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
    [HttpDelete("{courseId}/lecturers/{userId}")]
    public async Task<IActionResult> RemoveLecturerFromCourse(string courseId, Guid userId)
    {
        try
        {
            await UserHasAccessToCourse(courseId);

            var course = await _db.Courses
                .Include(c => c.Lecturers)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                return NotFound("Course not found");

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
                return NotFound("User not found");

            if (!course.Lecturers.Any(l => l.UserId == userId))
                return BadRequest("This lecturer is not assigned to this course.");

            course.Lecturers.Remove(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Lecturer successfully removed from the course." });
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
    [HttpPost("{courseId}/invite")]
    public async Task<IActionResult> InviteStudents(string courseId)
    {
        try
        {
            await UserHasAccessToCourse(courseId);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var course = await _db.Courses.Include(c => c.Students).FirstOrDefaultAsync(c => c.CourseId == courseId && c.DeletedAt == null);

            if (course == null)
                return NotFound("Course not found");

            if (!course.IsActive)
                return BadRequest("Course is not active");

            var courseStudents = course.Students.Where(x => x.InvitedAt == null && x.Password == null);

            var url = _configuration["FrontendURL"];

            if (url == null)
            {
                return BadRequest("FrontendURL is missing.");
            }


            var emailTasks = courseStudents.Select(async student =>
            {
                string htmlContent = $"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #1a1a1a;">Welcome to Databasement, {student.FirstName}!</h1>
                        <p style="color: #555; font-size: 16px; line-height: 1.5;">
                            You've been invited to join a course on Databasement. Click the button below to activate your account.
                        </p>
                        <a href="{url}/activate/{student.UserId}"
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
                    toEmail: student.Email,
                    toName: student.FirstName + " " + student.LastName,
                    subject: "Welcome to Databasement!",
                    htmlContent: htmlContent
                );

                student.InvitedAt = DateTime.Now;
            });

            await Task.WhenAll(emailTasks);

            await _db.SaveChangesAsync();

            return Ok();
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