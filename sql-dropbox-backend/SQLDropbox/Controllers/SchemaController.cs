using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchemaController(SchemaService schema, SqlQueryService sql) : ControllerBase
{
    private readonly SchemaService _schema = schema;
    private readonly SqlQueryService _sql = sql;

    [Authorize(Roles = "Admin")]
    [HttpPost("clone-dynamic")]
    public async Task<IActionResult> CloneSchema([FromQuery] string sourceSchema)
    {
        if (string.IsNullOrWhiteSpace(sourceSchema))
            return BadRequest("sourceSchema is required");

        if (_sql.IsProtectedSchema(sourceSchema))
            return BadRequest("This schema is protected and cannot be cloned.");

        if (!await _schema.SchemaExistsAsync(sourceSchema))
            return NotFound();

        var cloned = await _schema.CloneSchemaAsync(sourceSchema);

        return Ok(new { sourceSchema, cloned });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("clone-and-query-dynamic")]
    public async Task<IActionResult> CloneAndQuery(
        [FromQuery] string sourceSchema,
        [FromQuery] string selectQuery)
    {
        if (string.IsNullOrWhiteSpace(sourceSchema))
            return BadRequest("sourceSchema is required");

        if (string.IsNullOrWhiteSpace(selectQuery))
            return BadRequest("selectQuery is required");

        if (_sql.IsProtectedSchema(sourceSchema))
            return BadRequest("This schema is protected and cannot be queried.");

        var exists = await _schema.SchemaExistsAsync(sourceSchema);
        if (!exists)
            return NotFound();

        var validation = _sql.Validate(selectQuery);
        if (!validation.IsValid)
            return BadRequest(validation.Message);

        try
        {
            var sql = validation.NormalizedQuery!;
            var commandType = _sql.GetCommandType(sql);

            object result;

            if (commandType.Equals("SELECT", StringComparison.OrdinalIgnoreCase))
            {
                result = await _schema.CloneQueryAndDeleteAsync(sourceSchema, sql);
            }
            else
            {
                result = await _schema.CloneQueryAndDeleteAsync(sourceSchema, sql);
            }

            if (result is string csv)
                return Content(csv, "text/csv");

            return Ok(result);
        }
        catch (PostgresException ex)
        {
            return ex.SqlState switch
            {
                "42601" => BadRequest("Invalid SQL syntax"),
                "42P01" => BadRequest("Missing table"),
                "42703" => BadRequest("Missing column"),
                "42501" => BadRequest("Permission denied"),
                _ => StatusCode(500, new
                {
                    message = ex.Message,
                    detail = ex.Detail,
                    code = ex.SqlState
                })
            };

        }
    }
}