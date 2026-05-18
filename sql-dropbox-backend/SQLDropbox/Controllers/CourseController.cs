using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class CourseController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public CourseController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public ActionResult getCourses()
    {
        var courses = _db.Courses.Where(x => x.DeletedAt == null
        ).Select(x => new
        {
            x.CourseId,
            x.CourseNameEN,
            x.CourseNameNL,
            x.CourseDescriptionEN,
            x.CourseDescriptionNL,
            x.Lecturer,
            x.url,
            x.Deadline,
            x.IsActive,
            studentCount = x.Students.Count(),
            chapterCount = x.Chapters.Count(),
        }).OrderBy(x => x.CourseId).ToList();

        return Ok(courses);
    }

    [HttpGet("{courseUrl}")]
    public ActionResult getCourseByCourseUrl(string courseUrl)
    {
        var course = _db.Courses.FirstOrDefault(x => x.url == courseUrl);

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
            course.Deadline,
            course.IsActive,
            chapters = course.Chapters.Select(x => new
            {
                x.ChapterId,
                x.ChapterNameEN,
                x.ChapterNameNL
            }),
            students = course.Students.Select(x => new
            {
                x.StudentId,
                x.FullName
            }),
        });
    }

    [HttpPost]
    public ActionResult addCourse([FromBody] CourseDTO course)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (_db.Courses.Any(x => x.url == course.Url))
        {
            return BadRequest("This URL is already in use");
        }

        var newCourse = new Course
        {
            CourseNameEN = course.CourseNameEN,
            CourseNameNL = course.CourseNameNL,
            CourseDescriptionEN = course.CourseDescriptionEN,
            CourseDescriptionNL = course.CourseDescriptionNL,
            Lecturer = course.Lecturer,
            url = course.Url,
            Deadline = course.Deadline,
            IsActive = course.IsActive,
            CreatedAt = DateTime.Now,
        };

        _db.Courses.Add(newCourse);
        _db.SaveChanges();

        return Ok(newCourse);
    }

    [HttpPut("{courseId}")]
    public ActionResult updateCourse(int courseId, [FromBody] CourseDTO course)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existing = _db.Courses.Find(courseId);

        if (existing == null)
            return NotFound();

        if (_db.Courses.Any(x => x.url == course.Url))
        {
            return BadRequest("This URL is already in use");
        }

        existing.CourseNameEN = course.CourseNameEN;
        existing.CourseNameNL = course.CourseNameNL;
        existing.CourseDescriptionEN = course.CourseDescriptionEN;
        existing.CourseDescriptionNL = course.CourseDescriptionNL;
        existing.Lecturer = course.Lecturer;
        existing.url = course.Url;
        existing.Deadline = course.Deadline;
        existing.IsActive = course.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        _db.SaveChanges();

        return Ok(existing);
    }

    [HttpDelete("{courseID}")]
    public ActionResult deleteCourse(int courseID)
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
}