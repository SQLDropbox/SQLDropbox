using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;
using SQLDropbox.Repositories;
using SQLDropbox.Services;
using Watchlist_Backend.DTOs;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class UtilitiesController(
       AppDbContext db, PasswordService passwordService, JwtService jwtService, SolutionService solutionService, SchemaService schemaService) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly PasswordService _pS = passwordService;
    private readonly JwtService _jwtS = jwtService;
    private readonly SolutionService _soS = solutionService;
    private readonly SchemaService _scS = schemaService;

    [Authorize(Roles = "Admin")]
    [HttpGet("seed-db")]
    public async Task<IActionResult> SeedTheDb()
    {
        try
        {
            await DbInitializer.SeedAsyncDev(_db, _pS);
            return Ok("DB seeded.");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("empty-db")]
    public async Task<IActionResult> EmptyTheDb()
    {
        try
        {
            await DbInitializer.EmptyAsync(_db);
            return Ok("DB emptied.");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("format")]
    public async Task<IActionResult> Format([FromBody] FormatDTO format)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (format.Query == null)
                return BadRequest("Query is required.");

            var formatted = _soS.FormatQuery(format.Query);
            return Ok(formatted);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("accesstoken")]
    public async Task<IActionResult> Accesstoken(LoginDTO dto)
    {
        try
        {
            if (dto.EmailOrCode == null || dto.Password == null)
                return BadRequest("Email or code and password are required.");

            dto.EmailOrCode = dto.EmailOrCode.Trim();
            dto.Password = dto.Password.Trim();

            User? user = dto.EmailOrCode.Contains('@') ?
                await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.EmailOrCode.ToLower()) :
                await _db.Users.FirstOrDefaultAsync(u => u.UserCode.ToLower() == dto.EmailOrCode.ToLower());

            if (user != null)
            {
                if (user.Password == null)
                    return BadRequest("This account has not yet been setup, please refer to the mail you received to do this.");

                if (!_pS.ValidatePassword(user.Password, dto.Password))
                    return BadRequest("Incorrect credentials.");

                string accessToken = _jwtS.GenerateAccessToken(user);                
                return Ok(new {accessToken});
            }

            return BadRequest(new { message = "Incorrect credentials." });
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Incorrect credentials." });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        try
        {
            var (userId, role) = IsAuthenticated();          
            return Ok(new {userId, role});
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }  

    [Authorize(Roles = "Admin")]
    [HttpPost("seed-exercise-create-helper")]
    public async Task<IActionResult> GetExerciseCreateData([FromBody] SolutionDTO dto)
    {
        try
        {
            var (formattedQuery, formatErrorMessage) = _soS.FormatQuery(dto.Query);
            if (formatErrorMessage != null)
                return BadRequest(new { message = $"Error occured formatting query: {formatErrorMessage}." });
            if (formattedQuery == null)
                return BadRequest(new { message = "Something went wrong while formatting the query." });

            uint queryHash = await _soS.HashSolution(formattedQuery);
            string queryOutput = await _scS.ExecuteSelectOnSchemaAsync("animals", formattedQuery);

            return Ok(new { query = formattedQuery, hash = queryHash, output = queryOutput });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}