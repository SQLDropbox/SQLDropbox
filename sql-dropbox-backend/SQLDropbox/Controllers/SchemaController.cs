using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchemaController : ControllerBase
{
    private readonly SchemaService _schemaService;

    private static string? _lastSchema;

    public SchemaController(SchemaService schemaService) { _schemaService = schemaService; }

    [HttpPost("clone-dynamic")]
    public async Task<IActionResult> CloneSchemaDynamic([FromQuery] string sourceSchema)
    {
        if (string.IsNullOrWhiteSpace(sourceSchema))
        {
            return BadRequest("Parameter 'sourceSchema' is required.");
        }

        var exists = await _schemaService.SchemaExistsAsync(sourceSchema);
        if (!exists)
        {
            return NotFound($"Schema '{sourceSchema}' does not exist.");
        }

        var clonedSchema = await _schemaService.CloneSchemaAsync(sourceSchema);
        _lastSchema = clonedSchema;

        return Ok(new { sourceSchema, clonedSchema });
    }

    [HttpPost("clone-and-query-dynamic")]
    public async Task<IActionResult> CloneAndQuery(
    [FromQuery] string sourceSchema,
    [FromQuery] string selectQuery)
    {
        if (string.IsNullOrWhiteSpace(sourceSchema))
            return BadRequest("Parameter 'sourceSchema' is required.");

        if (string.IsNullOrWhiteSpace(selectQuery))
            return BadRequest("Parameter 'selectQuery' is required.");

        var exists = await _schemaService.SchemaExistsAsync(sourceSchema);
        if (!exists)
            return NotFound($"Schema '{sourceSchema}' does not exist.");

        if (!_schemaService.IsSafeSelectQuery(selectQuery))
            return BadRequest("Only a single SELECT query is allowed.");

        var csv = await _schemaService.CloneQueryAndDeleteAsync(sourceSchema, selectQuery);
        return Content(csv, "text/plain");
    }
}