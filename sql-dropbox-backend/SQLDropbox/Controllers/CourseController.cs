using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Enums;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class CourseController(AppDbContext db) : BaseController
{
    private readonly AppDbContext _db = db;

    [Authorize]
    [HttpGet]
    public ActionResult GetCourses()
    {
        var id = GetUserId();
        var role = GetUserRole();
        if (id == null || role == null) return Unauthorized();

        var query = _db.Courses.Where(x => x.DeletedAt == null).AsQueryable();

        switch (role)
        {
            case Role.Student:
                query = query.Where(x => x.Students.Any(s => s.UserId == id) && x.IsActive);
                break;
            case Role.Lecturer:
                query = query.Where(x => x.Lecturers.Any(l => l.UserId == id));
                break;
        }


        var courses = query.Select(x => new
        {
            x.CourseId,
            x.CourseNameEN,
            x.CourseNameNL,
            x.CourseDescriptionEN,
            x.CourseDescriptionNL,
            x.Lecturer,
            x.IsActive,
            studentCount = x.Students.Count,
            chapterCount = x.Chapters.Count,
        }).OrderBy(x => x.CourseId).ToList();

        return Ok(courses);
    }

    [Authorize]
    [HttpGet("{courseId}")]
    public ActionResult GetCourseByCourseId(string courseId)
    {
        var id = GetUserId();
        var role = GetUserRole();
        if (id == null || role == null) return Unauthorized();

        var query = _db.Courses
            .Include(x => x.Chapters)
            .ThenInclude(c => c.Exercises)
            .ThenInclude(e => e.UserExercises)           
            .Include(x => x.Students)
            .Where(x => x.DeletedAt == null)
            .AsQueryable();

        if (role == Role.Student)
        {
            query = query.Where(x => x.IsActive && x.Students.Any(s => s.UserId == id));            
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
            course.Lecturer,
            course.IsActive,
            totalCourseCount,
            chapters = course.Chapters
            .Where(x => x.DeletedAt == null)
            .Select(x => new
            {
                x.ChapterId,
                x.ChapterNameEN,
                x.ChapterNameNL,
                x.ChapterDescriptionEN,
                x.ChapterDescriptionNL,
                x.AmountOfExercises,
                x.Course.CourseId,
                completedAmount = (role == Role.Student) ? x.Exercises.Sum(e => e.UserExercises.Count(ue => ue.User.UserId == id && ue.IsCompleted)) : 0
            }),
            students = (role == Role.Admin || role == Role.Lecturer) ? course.Students.Select(x => new
            {
                x.UserCode,
                x.FirstName,
                x.LastName
            }) : null
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public ActionResult AddCourse([FromBody] CourseDTO course)
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
            Lecturer = course.Lecturer,
            IsActive = course.IsActive,
            CreatedAt = DateTime.Now,
        };

        _db.Courses.Add(newCourse);
        _db.SaveChanges();

        return Ok(newCourse);
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPut("{courseId}")]
    public ActionResult UpdateCourse(string courseId, [FromBody] CourseDTO course)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existing = _db.Courses.Find(courseId);

        if (existing == null)
            return NotFound();

        existing.CourseNameEN = course.CourseNameEN;
        existing.CourseNameNL = course.CourseNameNL;
        existing.CourseDescriptionEN = course.CourseDescriptionEN;
        existing.CourseDescriptionNL = course.CourseDescriptionNL;
        existing.Lecturer = course.Lecturer;
        existing.IsActive = course.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        _db.SaveChanges();

        return Ok(existing);
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

    [HttpPost("{courseId}/Duplicate")]
    public ActionResult DuplicateCourse(string courseId, [FromBody] DuplicateCourseDTO? request = null)
    {
        var existingCourse = _db.Courses
            .Include(c => c.Chapters.Where(ch => ch.DeletedAt == null))
            .ThenInclude(ch => ch.Schema)
            .Include(c => c.Chapters.Where(ch => ch.DeletedAt == null))
            .ThenInclude(ch => ch.Exercises.Where(e => e.DeletedAt == null))
            .FirstOrDefault(c => c.CourseId == courseId && c.DeletedAt == null);
        
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
            Lecturer = existingCourse.Lecturer,
            IsActive = false,
            CreatedAt = DateTime.Now,
            Chapters = new List<Chapter>()
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
                Exercises = new List<Exercise>()
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
}