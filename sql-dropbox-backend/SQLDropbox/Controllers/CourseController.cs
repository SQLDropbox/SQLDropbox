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
        var courses = _db.Courses.Select(x => new
        {
            x.CourseId,
            x.CourseNameEN,
            x.CourseNameNL,
            x.CourseDescriptionEN,
            x.CourseDescriptionNL,
            x.Lecturer,
            x.Deadline,
            x.IsActive,
            studentCount = x.Students.Count(),
            chapterCount = x.Chapters.Count(),
        }).ToList();

        return Ok(courses);
    }

    [HttpPost]
    public ActionResult addCourse([FromBody] CourseDTO course)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var newCourse = new Course
        {
            CourseNameEN = course.CourseNameEN,
            CourseNameNL = course.CourseNameNL,
            CourseDescriptionEN = course.CourseDescriptionEN,
            CourseDescriptionNL = course.CourseDescriptionNL,
            Lecturer = course.Lecturer,
            Deadline = course.Deadline,
            IsActive = course.IsActive,
            CreatedAt = DateTime.Now,
        };

        _db.Courses.Add(newCourse);
        _db.SaveChanges();

        return Ok(newCourse);
    }

    [HttpPut("{courseID}")]
    public ActionResult updateCourse(int courseID)
    {
        var course = _db.Courses.FirstOrDefault(x => x.CourseId == courseID);

        if (course == null)
        {
            return BadRequest("Course not found");
        }

        course.UpdatedAt = DateTime.Now;
        _db.SaveChanges();

        return Ok(course);
    }

    [HttpDelete("{courseID}")]
    public ActionResult deleteCourse(int courseID)
    {
        var course = _db.Courses.FirstOrDefault(x => x.CourseId == courseID);

        if (course == null)
        {
            return BadRequest("Course not found");
        }

        _db.Courses.Remove(course);
        _db.SaveChanges();

        return Ok("Course removed successfully");
    }
}