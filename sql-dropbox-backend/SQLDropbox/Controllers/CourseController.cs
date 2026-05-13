using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Data;
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
            x.Deadline,
            x.IsActive
        }).ToList();

        return Ok(courses);
    }

    [HttpPost]
    public ActionResult addCourse()
    {
        var course = new Course
        {
            CourseNameEN = "test",
            CourseNameNL = "test",
            CourseDescriptionEN = "test",
            CourseDescriptionNL = "test",
            IsActive = true,
            CreatedAt = DateTime.Now,
        };

        _db.Courses.Add(course);
        _db.SaveChanges();

        return Ok(course);
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