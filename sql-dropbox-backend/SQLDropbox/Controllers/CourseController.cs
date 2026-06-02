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
public class CourseController(AppDbContext db, AuthorizationService authorizationService) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly AuthorizationService _aS = authorizationService;

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
            return BadRequest(ex);
        }
    }

    [Authorize]
    [HttpGet("{courseId}")]
    public async Task<IActionResult> GetCourseByCourseId(string courseId)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToCourse(userId, role, courseId);

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
                .Select(x => new
                {
                    x.ChapterId,
                    x.ChapterNameEN,
                    x.ChapterNameNL,
                    x.ChapterDescriptionEN,
                    x.ChapterDescriptionNL,
                    x.AmountOfExercises,
                    x.Course.CourseId,
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
            return BadRequest(ex);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> AddCourse([FromBody] CourseDTO course)
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

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPut("{courseId}")]
    public async Task<IActionResult> UpdateCourse(string courseId, [FromBody] CourseDTO course)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToCourse(userId, role, courseId);

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
            existing.UpdatedAt = DateTime.UtcNow;

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
            return BadRequest(ex);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{courseID}")]
    public ActionResult DeleteCourse(string courseID)
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


    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPost("{courseId}/Duplicate")]
    public async Task<IActionResult> DuplicateCourse(string courseId, [FromBody] DuplicateCourseDTO? request = null)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToCourse(userId, role, courseId);

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
    [HttpPost("{courseId}/Lecturers")]
    public async Task<IActionResult> AddLecturerToCourse(string courseId, [FromBody] AssignLecturerDTO request)
    {
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

    [Authorize(Roles = "Admin")]
    [HttpDelete("{courseId}/lecturers/{userId}")]
    public async Task<IActionResult> RemoveLecturerFromCourse(string courseId, Guid userId)
    {
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
}