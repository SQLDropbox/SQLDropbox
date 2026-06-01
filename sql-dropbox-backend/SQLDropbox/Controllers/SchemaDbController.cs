using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Models;
using SQLDropbox.DTO;

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

        [HttpPost("/Schema")]
        public async Task<ActionResult> CreateSchema([FromForm] SchemaDTO dto)
        {
            string? imageFileName = null;

            if (dto.Image != null)
            {
                var uploadsFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "schema-images");

                Directory.CreateDirectory(uploadsFolder);

                var extension = Path.GetExtension(dto.Image.FileName);
                imageFileName = $"{Guid.NewGuid()}{extension}";

                var filePath = Path.Combine(uploadsFolder, imageFileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.Image.CopyToAsync(stream);
            }

            var schema = new Schema
            {
                SchemaName = dto.SchemaName,
                SchemaImage = imageFileName,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<Schema>().Add(schema);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                schema.SchemaId,
                schema.SchemaName,
                schema.SchemaImage
            });
        }
    }
}