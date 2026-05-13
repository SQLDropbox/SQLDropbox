using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchemaController : ControllerBase
{
    private readonly SchemaService _schemaService;

    // store last created schema (for demo purposes)
    private static string? _lastSchema;

    public SchemaController(SchemaService schemaService)
    {
        _schemaService = schemaService;
    }

    // POST: api/schema/clone
    [HttpPost("clone")]
    public async Task<IActionResult> CloneSchema()
    {
        var schemaName = await _schemaService.CloneSchemaAsync();

        _lastSchema = schemaName;

        return Ok(new
        {
            message = "Schema cloned successfully",
            schema = schemaName
        });
    }

    // DELETE: api/schema/latest
    [HttpDelete("latest")]
    public async Task<IActionResult> DeleteLatestSchema()
    {
        if (_lastSchema == null)
        {
            return NotFound("No schema has been created yet.");
        }

        await _schemaService.DeleteSchemaAsync(_lastSchema);

        var deleted = _lastSchema;
        _lastSchema = null;

        return Ok(new
        {
            message = "Schema deleted successfully",
            schema = deleted
        });
    }
}