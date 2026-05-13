using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Data;

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
    public ActionResult ping()
    {
        return Ok("piemel");
    }
}