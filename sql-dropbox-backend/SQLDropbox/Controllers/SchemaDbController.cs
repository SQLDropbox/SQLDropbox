using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SchemaDbController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SchemaDbController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("/Schema")]
        public async Task<ActionResult<IEnumerable<object>>> GetSchemas()
        {
            var schemas = await _context.Set<Schema>()                
                .OrderBy(s => s.SchemaName)
                .Select(s => new
                {
                    schemaId = s.SchemaId,
                    schemaName = s.SchemaName,
                    schemaImage = s.SchemaImage
                })
                .ToListAsync();

            return Ok(schemas);
        }
    }
}