using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using SQLDropbox.Models;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutineController(SchemaService schema, SqlQueryService sql) : ControllerBase
{
    private readonly SchemaService _schema = schema;
    private readonly SqlQueryService _sql = sql;

    [Authorize(Roles = "Admin")]
    [HttpPost("{schema}")]
    [Consumes("application/json")]
    public async Task<IActionResult> Execute(string schema, [FromBody] RoutineExecuteRequest request)
    {
        if (string.IsNullOrWhiteSpace(schema))
            return BadRequest("Schema required");

        if (_sql.IsProtectedSchema(schema))
            return BadRequest("Schema is protected");

        if (!await _schema.SchemaExistsAsync(schema))
            return NotFound("Schema not found");

        if (request == null || string.IsNullOrWhiteSpace(request.Sql))
            return BadRequest("SQL required");

        var validation = _sql.Validate(request.Sql);
        if (!validation.IsValid)
            return BadRequest(validation.Message);

        if (!string.IsNullOrWhiteSpace(request.SetupSql))
        {
            var setupValidation = _sql.Validate(request.SetupSql);

            if (!setupValidation.IsValid)
                return BadRequest(setupValidation.Message);

            request.SetupSql = setupValidation.NormalizedQuery!;
        }

        if (!string.IsNullOrWhiteSpace(request.InvokeSql))
        {
            var invokeValidation = _sql.ValidateRoutineInvocation(request.InvokeSql);
            if (!invokeValidation.IsValid)
                return BadRequest(invokeValidation.Message);

            request.InvokeSql = invokeValidation.NormalizedQuery!;
        }

        if (!string.IsNullOrWhiteSpace(request.TestSql))
        {
            var testValidation = _sql.ValidateTriggerTestQuery(request.TestSql);
            if (!testValidation.IsValid)
                return BadRequest(testValidation.Message);

            request.TestSql = testValidation.NormalizedQuery!;
        }

        if (!string.IsNullOrWhiteSpace(request.VerifySql))
        {
            var verifyValidation = _sql.ValidateReadOnlyQuery(request.VerifySql);
            if (!verifyValidation.IsValid)
                return BadRequest(verifyValidation.Message);

            request.VerifySql = verifyValidation.NormalizedQuery!;
        }

        try
        {
            var result = await _schema.CloneExecuteRoutineAndDeleteAsync(
                schema,
                validation.NormalizedQuery!,
                request.SetupSql,
                request.InvokeSql,
                request.TestSql,
                request.VerifySql);

            return Ok(new
            {
                message = "Routine executed successfully",
                result
            });
        }
        catch (PostgresException ex)
        {
            return BadRequest(new { error = ex.Message, code = ex.SqlState });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}