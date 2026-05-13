using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchemaController : ControllerBase
{
    private readonly SchemaService _schemaService;

    private static string? _lastSchema;

    public SchemaController(SchemaService schemaService){_schemaService = schemaService;}

    [HttpPost("clone-static")]
    public async Task<IActionResult> CloneSchema()
    {
        var schemaName = await _schemaService.CloneSchemaStaticAsync();

        _lastSchema = schemaName;

        return Ok(new
        {
            message = "Schema cloned successfully",
            schema = schemaName
        });
    }

    [HttpPost("clone-with-data-static")]
    public async Task<IActionResult> CloneSchemaWithData()
    {
        var schemaName = await _schemaService.CloneSchemaStaticAsync();
        _lastSchema = schemaName;

        var csv = await _schemaService.ExportTableStaticAsync(schemaName, "mammals");

        return Content(csv, "text/plain");
    }

    [HttpDelete("latest")]
    public async Task<IActionResult> DeleteLatestSchema()
    {
        if (_lastSchema == null)
        {
            return NotFound("No schema has been created yet.");
        }

        await _schemaService.DeleteLatestSchemaAsync(_lastSchema);

        var deleted = _lastSchema;
        _lastSchema = null;

        return Ok(new
        {
            message = "Schema deleted successfully",
            schema = deleted
        });
    }
}