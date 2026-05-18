using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Data;
using SQLDropbox.Models;
using static SqlParser.Ast.JsonPathElement;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("{guid}")]
    public async Task<ActionResult> SetupPassword(string guidStr)
    {
        if (Guid.TryParse(guidStr, out Guid guid))
            return BadRequest("Not a valid GUID.");

        Student student = await _db.Students.FindAsync(guid);

        if (student == null) return BadRequest("Student does not exist.");

        if (student.Password != null) return BadRequest("Student is already setup.");

        return Ok("Ok");
       
 ;   }
}
